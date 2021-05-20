const knex = require('../../db');

const contacts = async (req, res) => {

    const queryContacts = await knex('contact');

    for(singleContact of queryContacts){
        singleContact.user_1 = await knex('users').where('id', singleContact.user_1).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
        singleContact.user_2 = await knex('users').where('id', singleContact.user_2).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
    }
    
    res.send(queryContacts);

}

const contactsByUser = async (req, res) => {
    
    const queryContacts = await knex('contact').where('user_1', req.params.user_id).orWhere('user_2', req.params.user_id);

    for(singleContact of queryContacts){
        singleContact.user_1 = await knex('users').where('id', singleContact.user_1).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
        singleContact.user_2 = await knex('users').where('id', singleContact.user_2).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
    }
    
    res.send(queryContacts);

}

const contact = async (req, res) => {

    const queryContact = await knex('contact').where('id', req.params.id).first();

    queryContact.user_1 = await knex('users').where('id', queryContact.user_1).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
    queryContact.user_2 = await knex('users').where('id', queryContact.user_2).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();

    res.send(queryContact);

}

const otherUsers = async (req, res) => {

    const subQuery = await knex('contact').where('user_1', req.params.user_id).orWhere('user_2', req.params.user_id).select('user_1', 'user_2');

    const contactIds = subQuery.map(contact => contact.user_1 === +req.params.user_id ? contact.user_2 : contact.user_1);
    contactIds.push(+req.params.user_id);

    const queryUsers = await knex('users').where('id', 'not in', contactIds).select('id','username','email','photo_url','created_at','updated_at');

    res.send(queryUsers);

}

const createContact = async (req, res) => {

    //Check if one of the contact users in the body is the current user

    if(req.body.user_1 === req.user_id || req.body.user_2 === req.user_id){
        
        const createContactQuery = await knex('contact').insert({
            user_1: req.body.user_1,
            user_2: req.body.user_2,
            created_at: req.body.created_at,
            conv_id: req.body.conv_id,
            status: req.body.status
        });
    
        res.json(createContactQuery[0]);
    
    } else {

        res.json({success:0,status:401,message:'Not authorized to create contact between other users'});
    }

}

const deleteContact = async (req, res) => {

    //Check if one of the contact users is the current user -> query first!
    const queryContact = await knex('contact').where('id', req.params.id);

    if(queryContact[0].user_1 === req.user_id || queryContact[0].user_2 === req.user_id){
        
        const deleteContactQuery = await knex('contact').where('id', req.params.id).del();
        res.json({success: 1, status: 200, message: deleteContactQuery});

    } else {

        res.json({success:0,status:401,message:'Not authorized to delete contact between other users'});
    }

}

const updateContact = async (req, res) => {

    //Check if one of the contact users is the current user -> query first!
    const queryContact = await knex('contact').where('id', req.params.id);

    if(queryContact[0].user_1 === req.user_id || queryContact[0].user_2 === req.user_id){
       
        const updateContactQuery = await knex('contact').where('id', req.params.id)
        .update({
            created_at: req.body.created_at,
            conv_id: req.body.conv_id,
            status: req.body.status
        });

        res.json(updateContactQuery[0]);

    } else {

        res.json({success:0,status:401,message:'Not authorized to update contact between other users'});
    }
}

module.exports = {
    contacts,
    contactsByUser,
    contact,
    otherUsers,
    createContact,
    deleteContact,
    updateContact
}