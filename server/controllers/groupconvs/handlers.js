const knex = require('../../db');

const groupconvs = async (req, res) => {

    const queryGroupConvs = await knex('conversation')
    .join('user_conv', 'conversation.id', '=', 'user_conv.conv_id')
    .join('users', 'user_conv.user_id', 'users.id')
    .where('users.id', req.params.user_id)
    .select('conversation.*');

    for(singleGroupConv of queryGroupConvs){

        const userConvs1 = await knex('user_conv').where('conv_id', singleGroupConv.id).select('id','user_id','created_at');

        for(userConv1 of userConvs1){
            userConv1.user_id = await knex('users').where('id', userConv1.user_id).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
        }

        singleGroupConv.user_conv = userConvs1;
        singleGroupConv.lastMessage = await knex('message').where('conv_id', singleGroupConv.id).orderBy('created_at', 'desc').first();
       
        //only if lastmessage exists -> get user
        if(singleGroupConv.lastMessage){
            singleGroupConv.lastMessage.user_id = await knex('users').where('id', singleGroupConv.lastMessage.user_id).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
        }
    }

    res.status(200).send(queryGroupConvs);

}

const groupconv = async (req, res) => {

    const queryGroupConv = await knex('conversation')
    .join('user_conv', 'conversation.id', '=', 'user_conv.conv_id')
    .join('users', 'user_conv.user_id', 'users.id')
    .where('conversation.id', req.params.id)
    .select('conversation.*')
    .first();

    //Get the other users in this conversation
    const userConvs2 = await knex('user_conv').where('conv_id', queryGroupConv.id).select('id','user_id','created_at');

    //CHECK Auth: user should be one of the user_ids in the userConvs: if not, he's unauthorized
    const checkUsers = userConvs2.filter(userConv => userConv.user_id === req.user_id)[0];
    if(!checkUsers){
        return res.status(401).send({message: 'Not allowed to see group conversations from other users'});
    }

    for(userConv of userConvs2){
        const queryUser = await knex('users').where('id', +userConv.user_id).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
        userConv.user_id = queryUser;
    }

    queryGroupConv.user_conv = userConvs2;

    res.status(200).send(queryGroupConv)

}

const deleteGroupConv = async (req, res) => {

    const queryGroupConv = await knex('conversation')
    .join('user_conv', 'conversation.id', '=', 'user_conv.conv_id')
    .join('users', 'user_conv.user_id', 'users.id')
    .where('conversation.id', req.params.id)
    .select('conversation.*')
    .first();

    //Get the other users in this conversation
    const userConvs2 = await knex('user_conv').where('conv_id', queryGroupConv.id).select('id','user_id','created_at');

    //CHECK Auth: user should be one of the user_ids in the userConvs: if not, he's unauthorized
    const checkUsers = userConvs2.filter(userConv => userConv.user_id === req.user_id)[0];
    if(!checkUsers){
        return res.status(401).send({message: 'Not allowed to update group conversations from other users'});
    }

    const deleteGroupConvQuery = await knex('conversation').where('id', req.params.id).del();

    res.status(200).send({message: deleteGroupConvQuery});

}

const updateGroupConv = async (req, res) => {

    const queryGroupConv = await knex('conversation')
    .join('user_conv', 'conversation.id', '=', 'user_conv.conv_id')
    .join('users', 'user_conv.user_id', 'users.id')
    .where('conversation.id', req.params.id)
    .select('conversation.*')
    .first();

    //Get the other users in this conversation
    const userConvs2 = await knex('user_conv').where('conv_id', queryGroupConv.id).select('id','user_id','created_at');

    //CHECK Auth: user should be one of the user_ids in the userConvs: if not, he's unauthorized
    const checkUsers = userConvs2.filter(userConv => userConv.user_id === req.user_id)[0];
    if(!checkUsers){
        return res.status(401).send({message: 'Not allowed to update group conversations from other users'});
    }


    const updateGroupConvQuery = await knex('conversation').where('id', req.params.id)
    .update({
        name: req.body.name,
        photo_url: req.body.photo_url,
        created_by: req.body.created_by,
    });

    res.status(200).send({message: updateGroupConvQuery});

}


module.exports = {
    groupconvs,
    groupconv,
    updateGroupConv,
    deleteGroupConv
}