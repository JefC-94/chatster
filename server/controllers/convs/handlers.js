const knex = require('../../db');

const convsByUser = async (req, res) => {

    const queryConvs = await knex('conversation')
    .join('contact', 'conversation.id', '=', 'contact.conv_id')
    .where('contact.user_1', req.params.user_id)
    .orWhere('contact.user_2', req.params.user_id)
    .select('conversation.*');

    for(singleConv of queryConvs){
        
        singleConv.contact = await knex('contact').where('conv_id', singleConv.id).first();

        //console.log(singleConv.contact);

        singleConv.contact.user_1 = await knex('users').where('id', singleConv.contact.user_1).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
        singleConv.contact.user_2 = await knex('users').where('id', singleConv.contact.user_2).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
        
        //console.log(singleConv.contact);

        singleConv.lastMessage = await knex('message').where('conv_id', singleConv.id).orderBy('created_at', 'desc').first();

        //only if lastmessage exists -> get user
        if(singleConv.lastMessage){
            singleConv.lastMessage.user_id = await knex('users').where('id', singleConv.lastMessage.user_id).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
        }
    }

    res.status(200).send(queryConvs);
}


const conv = async (req, res) => {
 
    const queryConv = await knex('conversation')
    .join('contact', 'conversation.id', '=', 'contact.conv_id')
    .where('conversation.id', req.params.id)
    .select('conversation.*')
    .first();

    //Not found
    if(!queryConv) return res.status(500).send({message:'No conv with this id for this user'});

    queryConv.contact = await knex('contact').where('conv_id', queryConv.id).first();

    //Authorization check: user should be one of both contacts in this conversation
    if(!(queryConv.contact.user_1 === req.user_id || queryConv.contact.user_2 === req.user_id)){
        return res.status(401).send({message:'Not authorized to view conversation between other users'});
    }

    queryConv.contact.user_1 = await knex('users').where('id', queryConv.contact.user_1).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
    queryConv.contact.user_2 = await knex('users').where('id', queryConv.contact.user_2).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
    queryConv.lastMessage = await knex('message').where('conv_id', queryConv.id).orderBy('created_at', 'desc').first();
    
    res.status(200).send(queryConv);

}


const createConv = async (req, res) => {

    //Check that body is not empty
    if(Object.keys(req.body).length === 0) return res.status(422).send({message:'Bad request'});

    if(+req.body.created_by !== req.user_id) return res.status(401).send({message:'Not authorized to create conv as other user'});

    const createConvQuery = await knex('conversation').insert({
        name: req.body.name,
        photo_url: req.body.photo_url,
        created_at: req.body.created_at,
        created_by: req.body.created_by,
    });

    res.status(200).send({message: createConvQuery[0]});
}


const deleteConv = async (req, res) => {

    //Query first -> also add contact.user_1 & user_2 to select
    const convQuery = await knex('conversation')
    .join('contact', 'conversation.id', '=', 'contact.conv_id')
    .where('conversation.id', req.params.id)
    .select('conversation.*', 'contact.user_1', 'contact.user_2')
    .first();

    if(!convQuery) return res.status(500).send({message:'No conversation with this id for this user'});

    //Check if user is in the conversation contacts
    if(!(convQuery.user_1 === req.user_id || convQuery.user_2 === req.user_id)){
        return res.status(401).send({message:'Not authorized to delete conversation between other users'});
    }

    const deleteConvQuery = await knex('conversation').where('id', req.params.id).del();

    res.status(200).send({message: deleteConvQuery});
}


const updateConv = async (req, res) => {

    //Query first -> also add contact.user_1 & user_2 to select
    const convQuery = await knex('conversation')
    .join('contact', 'conversation.id', '=', 'contact.conv_id')
    .where('conversation.id', req.params.id)
    .select('conversation.*', 'contact.user_1', 'contact.user_2')
    .first();

    if(!convQuery) return res.status(500).send({message:'No conversations with this id for this user'});

    //Check if user is in the conversation contacts
    if(!(convQuery.user_1 === req.user_id || convQuery.user_2 === req.user_id)){
        return res.status(401).send({message:'Not authorized to alter conversation between other users'});
    }

    const updateConvQuery = await knex('conversation').where('id', req.params.id)
    .update({
        name: req.body.name,
        photo_url: req.body.photo_url,
        created_by: req.body.created_by,
    });

    res.status(200).send({message: updateConvQuery});
}

module.exports = {
    convsByUser,
    conv,
    createConv,
    updateConv,
    deleteConv
}