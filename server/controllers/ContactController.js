var jwt = require('jsonwebtoken');
var config = require('../config');
const knex = require('../db');

const contacts = async (req, res) => {

    const queryContacts = await knex('contact');

    for(singleContact of queryContacts){
        const user1 = await knex('users').where('id', singleContact.user_1).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at');
        const user2 = await knex('users').where('id', singleContact.user_2).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at');
        singleContact.user_1 = user1[0];
        singleContact.user_2 = user2[0];
    }
    
    res.send(queryContacts);

}

const contactsByUser = async (req, res) => {
    
    const queryContacts = await knex('contact').where('user_1', req.params.user_id).orWhere('user_2', req.params.user_id);

    for(singleContact of queryContacts){
        const user1 = await knex('users').where('id', singleContact.user_1).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at');
        const user2 = await knex('users').where('id', singleContact.user_2).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at');
        singleContact.user_1 = user1[0];
        singleContact.user_2 = user2[0];
    }
    
    res.send(queryContacts);

}


const pet = async (req, res) => {
    
    const getQuery = await knex('pet').where('id', req.params.id);
    const singleContact = getQuery[0];

    const user = await knex('users').where('id', singleContact.user_id).select('id', 'username');
    const type = await knex('type').where('id', singleContact.type_id);
   
    singleContact.user_id = user[0];
    singleContact.type_id = type[0];

    res.status(200).json(singleContact);

}

module.exports.contacts = contacts;
module.exports.contactsByUser = contactsByUser;
module.exports.pet = pet;