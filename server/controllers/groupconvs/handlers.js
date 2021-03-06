const knex = require('../../db');

const groupconvs = async (req, res) => {

    const queryGroupConvs = await knex('conversation')
    .join('user_conv', 'conversation.id', '=', 'user_conv.conv_id')
    .join('users', 'user_conv.user_id', 'users.id')
    .where('users.id', req.params.user_id)
    .select('conversation.*');

    for(singleGroupConv of queryGroupConvs){

        const userConvs1 = await knex('user_conv').where('conv_id', singleGroupConv.id).select('id','user_id','created_at','unread');

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

    //console.log(queryGroupConvs);

    res.status(200).send(queryGroupConvs);

}

const groupconv = async (req, res) => {

    const checkGroupConv = await userInGroupConversation(req.params.id, req.user_id);

    //If both results are false -> unauthorized
    if(!checkGroupConv¬†){
        return res.status(401).send({message:'Not authorized to see a conversation between other users'});
    }

    const queryGroupConv = await knex('conversation')
    .join('user_conv', 'conversation.id', '=', 'user_conv.conv_id')
    .join('users', 'user_conv.user_id', 'users.id')
    .where('conversation.id', req.params.id)
    .select('conversation.*')
    .first();

    const userConvs2 = await knex('user_conv').where('conv_id', queryGroupConv.id).select('id','user_id','created_at');

    for(userConv of userConvs2){
        const queryUser = await knex('users').where('id', +userConv.user_id).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
        userConv.user_id = queryUser;
    }

    queryGroupConv.user_conv = userConvs2;

    res.status(200).send(queryGroupConv)

}

const deleteGroupConv = async (req, res) => {

    
    const queryFirst = await knex('conversation').where('id', req.params.id).first();

    if(queryFirst.created_by !== req.user_id){
        return res.status(401).send({message:'Not authorized to delete this converation - you are not the creator'});
    }

    //Above we already check -> only the creating user can delete this conversation!
    /* const checkGroupConv = await userInGroupConversation(req.params.id, req.user_id);

    //If it is false -> unauthorized
    if(!checkGroupConv){
        return res.status(401).send({message:'Not authorized to delete to a conversation between other users'});
    } */

    knex('conversation').where('id', req.params.id).del()
    .then(() => {
        return res.status(200).send({message: 'Deleted group conversation'});
    })
    .catch(err => {
        return res.status(500).send({message: err})
    });

}

const updateGroupConv = async (req, res) => {

    const queryFirst = await knex('conversation').where('id', req.params.id).first();

    if(queryFirst.created_by !== req.user_id){
        return res.status(401).send({message:'Not authorized to update this converation - you are not the creator'});
    }

    //Above we already check -> only the creating user can delete this conversation!
    /* const checkGroupConv = await userInGroupConversation(req.params.id, req.user_id);

    //If it is false -> unauthorized
    if(!checkGroupConv){
        return res.status(401).send({message:'Not authorized to delete to a conversation between other users'});
    } */

    knex('conversation').where('id', req.params.id)
    .update({
        name: req.body.name,
        photo_url: req.body.photo_url,
        created_by: req.body.created_by,
    })
    .then(() => {
        return res.status(200).send({message: 'Updated group conversation'});
    })
    .catch(err => {
        return res.status(500).send({message: err})
    });

}


async function userInGroupConversation(conv_id, user_id){

    const queryConvGroup = await knex('conversation')
    .join('user_conv', 'conversation.id', '=', 'user_conv.conv_id')
    .select('conversation.*')
    .where('conversation.id', conv_id)
    .first();

    if(queryConvGroup){

        //Get the other users in this conversation
        const userConvs2 = await knex('user_conv').where('conv_id', queryConvGroup.id).select('id','user_id','created_at');

        //CHECK Auth: user should be one of the user_ids in the userConvs: if not, he's unauthorized
        const checkUsers = userConvs2.filter(userConv => userConv.user_id === user_id)[0];
        if(checkUsers){
            return true;
        } else¬†{
            return false;
        }
    } else {
        return false;
    }
}

module.exports = {
    groupconvs,
    groupconv,
    updateGroupConv,
    deleteGroupConv
}