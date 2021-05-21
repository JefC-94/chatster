const knex = require('../../db');

const convsByUser = async (req, res) => {

    const queryConvs = await knex('conversation')
    .join('contact', 'conversation.id', '=', 'contact.conv_id')
    .where('contact.user_1', req.params.user_id)
    .orWhere('contact.user_2', req.params.user_id)
    .select('conversation.*');

    //Not found
    if(!queryConvs) return res.json({success:0,status:500,message:'No conversations with for this user'});

    for(singleConv of queryConvs){
        singleConv.contact = await knex('contact').where('conv_id', singleConv.id).first();
        if(singleConv.contact){
            singleConv.contact.user_1 = await knex('users').where('id', singleConv.contact.user_1).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
            singleConv.contact.user_2 = await knex('users').where('id', singleConv.contact.user_2).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
        }
        singleConv.lastMessage = await knex('message').where('conv_id', singleConv.id).orderBy('created_at', 'desc').first();
    }

    res.send(queryConvs);
}


const conv = async (req, res) => {
 
    const queryConv = await knex('conversation')
    .join('contact', 'conversation.id', '=', 'contact.conv_id')
    .where('conversation.id', req.params.id)
    .select('conversation.*')
    .first();

    //Not found
    if(!queryConv) return res.json({success:0,status:500,message:'No conversation with this id for this user'});

    queryConv.contact = await knex('contact').where('conv_id', queryConv.id).first();

    //Authorization check: user should be one of both contacts in this conversation
    if(!(queryConv.contact.user_1 === req.user_id || queryConv.contact.user_2 === req.user_id)){
        return res.json({success:0,status:401,message:'Not authorized to view conversation between other users'});
    }

    queryConv.contact.user_1 = await knex('users').where('id', queryConv.contact.user_1).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
    queryConv.contact.user_2 = await knex('users').where('id', queryConv.contact.user_2).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
    queryConv.lastMessage = await knex('message').where('conv_id', queryConv.id).orderBy('created_at', 'desc').first();
    
    res.send(queryConv);

}


const createConv = async (req, res) => {

    //Check that body is not empty
    if(Object.keys(req.body).length === 0) return res.json({success:0,status:422,message:'Bad request'});

    if(+req.body.created_by !== req.user_id) return res.json({success:0, status:401, message:'Not authorized to create conv as other user'});

    const createConvQuery = await knex('conversation').insert({
        name: req.body.name,
        photo_url: req.body.photo_url,
        created_at: req.body.created_at,
        created_by: req.body.created_by,
    });

    res.json(createConvQuery[0]);
}


const deleteConv = async (req, res) => {

    //Query first -> also add contact.user_1 & user_2 to select
    const convQuery = await knex('conversation')
    .join('contact', 'conversation.id', '=', 'contact.conv_id')
    .where('conversation.id', req.params.id)
    .select('conversation.*', 'contact.user_1', 'contact.user_2')
    .first();

    if(!convQuery) return res.json({success:0,status:500,message:'No conversations with for this user'});

    //Check if user is in the conversation contacts
    if(!(convQuery.user_1 === req.user_id || convQuery.user_2 === req.user_id)){
        return res.json({success:0,status:401,message:'Not authorized to delete conversation between other users'});
    }

    const deleteConvQuery = await knex('conversation').where('id', req.params.id).del();

    res.json({success: 1, status: 200, message: deleteConvQuery});
}


const updateConv = async (req, res) => {

    //Query first -> also add contact.user_1 & user_2 to select
    const convQuery = await knex('conversation')
    .join('contact', 'conversation.id', '=', 'contact.conv_id')
    .where('conversation.id', req.params.id)
    .select('conversation.*', 'contact.user_1', 'contact.user_2')
    .first();

    if(!convQuery) return res.json({success:0,status:500,message:'No conversations with for this user'});

    //Check if user is in the conversation contacts
    if(!(convQuery.user_1 === req.user_id || convQuery.user_2 === req.user_id)){
        return res.json({success:0,status:401,message:'Not authorized to alter conversation between other users'});
    }

    const updateConvQuery = await knex('conversation').where('id', req.params.id)
    .update({
        name: req.body.name,
        photo_url: req.body.photo_url,
        created_by: req.body.created_by,
    });

    res.json(updateConvQuery[0]);
}

module.exports = {
    convsByUser,
    conv,
    createConv,
    updateConv,
    deleteConv
}