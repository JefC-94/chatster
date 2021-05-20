const knex = require('../../db');

const convsByUser = async (req, res) => {

    const queryConvs = await knex('conversation')
    .join('contact', 'conversation.id', '=', 'contact.conv_id')
    .where('contact.user_1', req.params.user_id)
    .orWhere('contact.user_2', req.params.user_id)
    .select('conversation.*');

    for(singleConv of queryConvs){
        singleConv.contact = await knex('contact').where('conv_id', singleConv.id).first();
        singleConv.contact.user_1 = await knex('users').where('id', singleConv.contact.user_1).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
        singleConv.contact.user_2 = await knex('users').where('id', singleConv.contact.user_2).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
        singleConv.lastMessage = await knex('message').where('conv_id', singleConv.id).orderBy('created_at', 'desc').first();
    }

    res.send(queryConvs);

}

const conv = async (req, res) => {
 
    const queryConv = await knex('conversation')
    .join('contact', 'conversation.id', 'contact.conv_id')
    .where('conversation.id', req.params.id)
    .select('conversation.*')
    .first();

    queryConv.contact = await knex('contact').where('conv_id', queryConv.id).first();
    queryConv.contact.user_1 = await knex('users').where('id', queryConv.contact.user_1).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
    queryConv.contact.user_2 = await knex('users').where('id', queryConv.contact.user_2).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
    queryConv.lastMessage = await knex('message').where('conv_id', queryConv.id).orderBy('created_at', 'desc').first();
    
    res.send(queryConv);

}


const createConv = async (req, res) => {

    const createConvQuery = await knex('conversation').insert({
        name: req.body.name,
        photo_url: req.body.photo_url,
        created_at: req.body.created_at,
        created_by: req.body.created_by,
    });

    res.json(createConvQuery[0]);

}

const deleteConv = async (req, res) => {

    const deleteConvQuery = await knex('conversation').where('id', req.params.id).del();

    res.json({success: 1, status: 200, message: deleteConvQuery});

}

const updateConv = async (req, res) => {

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