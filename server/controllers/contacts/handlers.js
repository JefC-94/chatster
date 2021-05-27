const knex = require('../../db');

const contactsByUser = async (req, res) => {
    
    const queryContacts = await knex('contact').where('user_1', req.params.user_id).orWhere('user_2', req.params.user_id);

    for(singleContact of queryContacts){
        singleContact.user_1 = await knex('users').where('id', singleContact.user_1).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
        singleContact.user_2 = await knex('users').where('id', singleContact.user_2).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
    }
    
    res.status(200).send(queryContacts);
}


const contact = async (req, res) => {

    const queryContact = await knex('contact').where('id', req.params.id).first();

    //Not found
    if(!queryContact) return res.status(500).send({message:'No contact with this id for this user'});

    //Authorization check: user should be one of both contacts
    if(!(queryContact.user_1 === req.user_id || queryContact.user_2 === req.user_id)){
        return res.status(401).send({message:'Not authorized to view contact between other users'});
    }

    queryContact.user_1 = await knex('users').where('id', queryContact.user_1).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
    queryContact.user_2 = await knex('users').where('id', queryContact.user_2).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();

    res.status(200).send(queryContact);
}

const contactByConvId = async (req, res) => {

    const queryContact = await knex('contact').where('conv_id', req.params.conv_id).first();

    //Not found
    if(!queryContact) return res.status(500).send({message:'No contact with this conv_id for this user'});

    //Authorization check: user should be one of both contacts
    if(!(queryContact.user_1 === req.user_id || queryContact.user_2 === req.user_id)){
        return res.status(401).send({message:'Not authorized to view contact between other users'});
    }

    queryContact.user_1 = await knex('users').where('id', queryContact.user_1).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();
    queryContact.user_2 = await knex('users').where('id', queryContact.user_2).select('id', 'username', 'email', 'photo_url', 'created_at', 'updated_at').first();

    res.status(200).send(queryContact);
}

const otherUsers = async (req, res) => {

    const subQuery = await knex('contact').where('user_1', req.params.user_id).orWhere('user_2', req.params.user_id).select('user_1', 'user_2');

    const contactIds = subQuery.map(contact => contact.user_1 === +req.params.user_id ? contact.user_2 : contact.user_1);
    contactIds.push(+req.params.user_id);

    const queryUsers = await knex('users').where('id', 'not in', contactIds).select('id','username','email','photo_url','created_at','updated_at');

    res.status(200).send(queryUsers);
}


const createContact = async (req, res) => {

    //Check that body is not empty
    if(Object.keys(req.body).length === 0) return res.status(422).send({message:'Bad request'});

    //Check if one of the contact users in the body is the current user
    if(!(req.body.user_1 === req.user_id || req.body.user_2 === req.user_id)){
        return res.status(401).send({message:'Not authorized to create contact between other users'});
    }

    //Check if this exact combination of users doesn't already exist:
    const checkForContact = await knex('contact').where('user_1', req.body.user_1).andWhere('user_2', req.body.user_2).first();
    const checkForContact1 = await knex('contact').where('user_2', req.body.user_1).andWhere('user_1', req.body.user_2).first();

    if(checkForContact || checkForContact1){
        return res.status(401).send({message:'These users are already in contact with each other'});
    }

    //REAL WORLD ENVIRONMENT: Not possible to create contact with status "2" -> allow this for examplary "add to contacts" button

    //Check if conv_id is not null and handle errors 
    if(req.body.conv_id !== null){

        //Check if conv_id exists in conversation
        const convCheck = await knex('conversation').where('id', req.body.conv_id).first();
        if(!convCheck) return res.status(401).send({message:'No conversation with this id'});

        //Check if conv_id is already used in another contact
        const checkForConvId = await knex('contact').where('conv_id', req.body.conv_id).first();
        if(checkForConvId){
            return res.status(401).send({message:'This conversation id is not valid to use'});
        }
    }    

    knex('contact').insert({
        user_1: req.body.user_1,
        user_2: req.body.user_2,
        created_at: req.body.created_at,
        conv_id: req.body.conv_id,
        status: req.body.status
    })
    .then(rows => {
        return res.status(200).send({message: rows[0]}); //Keep this as the id of newly created contact
    })
    .catch(err => {
        return res.status(500).send({message: err});
    });
    
}


const deleteContact = async (req, res) => {

    //Query first
    const queryContact = await knex('contact').where('id', req.params.id).first();

    if(!queryContact){
        return res.status(500).send({message: 'No contact with this id'});
    }

    //Check if one of the contact users is the current user
    if(!(queryContact.user_1 === req.user_id || queryContact.user_2 === req.user_id)){
        res.status(401).send({message:'Not authorized to delete contact between other users'});
    }
        
    knex('contact').where('id', req.params.id).del()
    .then(() => {
        res.status(200).send({message: 'Contact deleted'});
    })
    .catch(err => {
        return res.status(500).send({message: err})
    });
    
}


const updateContact = async (req, res) => {

    //Query first!
    const queryContact = await knex('contact').where('id', req.params.id).first();

    if(!queryContact){
        return res.status(500).send({message: 'No contact with this id'});
    }

    //Check if one of the contact users is the current user
    if(!(queryContact.user_1 === req.user_id || queryContact.user_2 === req.user_id)){
        return res.status(401).send({message:'Not authorized to update contact between other users'});
    }

    //Check contact status: if it is 3 -> not possible to set back to 2
    if(queryContact.status === 3){
        return res.status(401).send({message:'Cannot alter a blocked contact'});
    }

    if(req.body.conv_id !== null){
        //Check if conv_id is already used in another contact
        const checkForConvId = await knex('contact').where('conv_id', req.body.conv_id).first();
        if(checkForConvId){
            return res.status(401).send({message:'This conversation id is not valid to use'});
        }
    }
        
    knex('contact').where('id', req.params.id)
    .update({
        created_at: req.body.created_at,
        conv_id: req.body.conv_id,
        status: req.body.status
    })
    .then(() => {
        return res.status(200).send({message: 'Contact updated'});
    })
    .catch(err => {
        return res.status(500).send({message: err})
    });

   
}

const updateUnreadContact = async (req, res) => {

    //Query first!
    const queryContact = await knex('contact').where('id', req.params.id).first();

    if(!queryContact){
        return res.status(500).send({message: 'No contact with this id'});
    }

    //Check if one of the contact users is the current user
    if(!(queryContact.user_1 === req.user_id || queryContact.user_2 === req.user_id)){
        return res.status(401).send({message:'Not authorized to update contact between other users'});
    }    
    
    console.log(req.params.to_id);

    if(+req.params.to_id === queryContact.user_1){
        
        knex('contact').where('id', req.params.id)
        .update({
            user1_unread: queryContact.user1_unread + 1
        })
        .then(() => {
            return res.status(200).send({message: 'User 1 unread incremented'});
        })
        .catch(err => {
            return res.status(500).send({message: err})
        });
    }

    if(+req.params.to_id === queryContact.user_2){
        
        knex('contact').where('id', req.params.id)
        .update({
            user2_unread: queryContact.user2_unread + 1
        })
        .then(() => {
            return res.status(200).send({message: 'User 2 unread incremented'});
        })
        .catch(err => {
            return res.status(500).send({message: err})
        });

    }    
}

const readUnreadContact = async (req, res) => {

    //Query first!
    const queryContact = await knex('contact').where('id', req.params.id).first();

    if(!queryContact){
        return res.status(500).send({message: 'No contact with this id'});
    }

    //Check if one of the contact users is the current user
    if(!(queryContact.user_1 === req.user_id || queryContact.user_2 === req.user_id)){
        return res.status(401).send({message:'Not authorized to update contact between other users'});
    }    
    
    console.log(req.params.to_id);

    if(+req.params.to_id === queryContact.user_1){
        knex('contact').where('id', req.params.id)
        .update({
            user1_unread: 0
        })
        .then(() => {
            return res.status(200).send({message: 'User 1 unread set to 0'});
        })
        .catch(err => {
            return res.status(500).send({message: err})
        });

    }

    if(+req.params.to_id === queryContact.user_2){
        knex('contact').where('id', req.params.id)
        .update({
            user2_unread: 0
        })
        .then(() => {
            return res.status(200).send({message: 'User 2 unread set to 0'});
        })
        .catch(err => {
            return res.status(500).send({message: err})
        });

    }    
}

module.exports = {
    contactsByUser,
    contact,
    contactByConvId,
    otherUsers,
    createContact,
    deleteContact,
    updateContact,
    updateUnreadContact,
    readUnreadContact
}