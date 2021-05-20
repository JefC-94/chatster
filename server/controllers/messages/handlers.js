const knex = require('../../db');

const messages = async (req, res) => {

    const offset = (req.params.page - 1) * req.params.per_page;

    const all = await knex('message')
    .where('conv_id', req.params.conv_id);

    const count = all.length;

    const messagesQuery = await knex('message')
    .join('users', 'message.user_id', '=', 'users.id')
    .orderBy('message.created_at', 'desc')
    .limit(req.params.per_page).offset(offset)
    .where('conv_id', req.params.conv_id)
    .select('message.*');

    for(singleMessage of messagesQuery){
        singleMessage.user_id = await knex('users').where('id', singleMessage.user_id).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
    }

    res.json({records: messagesQuery, results: count});

}

const createMessage = async (req, res) => {

    const createMessageQuery = await knex('message').insert({
        conv_id : req.body.conv_id, 
        user_id: req.body.user_id, 
        body: req.body.body, 
        created_at: req.body.created_at
    });

    res.send(createMessageQuery);

}

module.exports = {
    messages,
    createMessage
}