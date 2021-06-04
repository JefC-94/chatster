const knex = require('../../db');

const createUserConv = async (req, res) => {

    //CHECK IF ADDING USER IS CREATOR OF THIS GROUP CHAT
    const queryConvGroup = await knex('conversation')
    .where('conversation.id', req.body.conv_id)
    .first();

    if(queryConvGroup.created_by !== req.user_id){
        return res.status(401).send({message:'Not authorized to add users to this conversation'});
    }

    //CHECK IF USER IS CONTACT OF THE ADDING/CREATING USER
    const queryContacts = await knex('contact').where('user_1', req.user_id).andWhere('user_2', req.body.user_id).andWhere('status', 2).first();
    const queryContacts2 = await knex('contact').where('user_1', req.body.user_id).andWhere('user_2', req.user_id).andWhere('status', 2).first();

    console.log(queryContacts, queryContacts2);

    if(!queryContacts && !queryContacts2){
        return res.status(401).send({message:'This user is not one of your contacts, you cannot add him to your group conversation.'});
    }

    //CHECK IF THE USER ISN'T ALREADY IN THE GROUP CHAT
    const queryUserConvs = await knex('user_conv')
    .where('conv_id', req.body.conv_id).andWhere('user_id', req.body.user_id)
    .first();

    if(queryUserConvs){
        return res.status(401).send({message:'This user is already a part of this conversation'});
    }

    //Add user to groupchat
    knex('user_conv').insert({
        user_id : req.body.user_id,
        conv_id: req.body.conv_id,
        created_at: req.body.created_at,
    })
    .then((rows) => {
        return res.status(200).send({message: rows[0]});
    })
    .catch(err => {
        return res.status(500).send({message: err})
    });

}

const deleteUserConv = async (req, res) => {

    //FIRST GET THE CONVERSATION ID
    const userConv = await knex('user_conv').where('id', req.params.id).first();

    //CHECK IF DELETING USER IS CREATOR OF THIS GROUP CHAT OR IS DELETING HIMSELF!
    const queryConvGroup = await knex('conversation')
    .where('conversation.id', userConv.conv_id)
    .first();

    //CHECK IF USER IS CREATING USER:
    if(queryConvGroup.created_by !== req.user_id){
        
        //IF NOT, CHECK IF HE IS JUST DELETING HIMSELF (double else: he can do whatever he wants)
        if(userConv.user_id !== req.user_id){
        
            return res.status(401).send({message:'Not authorized to remove other users from this conversation'});
        }
    }
    

    knex('user_conv').where('id', req.params.id).del()
    .then(() => {
        return res.status(200).send({message: 'User deleted from conversation'});
    })
    .catch(err => {
        return res.status(500).send({message: err})
    });
}

//TAKES PARAMETER OF USERCONV_ID (PRIMARY KEY) + USER_ID FOR AUTHENTICATION!
const updateUnreadUserConv = async (req, res) => {
    
    //Update a single user_conv and set unread to +1
    const queryUserConv = await knex('user_conv').where('id', req.params.id).first();    

    //CHECK IF USER IS IN THE CONVERSATION (SHOULD NOT BE THE EXACT USER, BECAUSE THIS HAPPENS TO ALL USERS EXEPT ONE)
    
    knex('user_conv').where('id', req.params.id)
    .update({
        unread: queryUserConv.unread + 1
    })
    .then(() => {
        return res.status(200).send({message: 'User unread incremented'});
    })
    .catch(err => {
        return res.status(500).send({message: err})
    });

}

//TAKES PARAMETERS OF USER_ID AND CONV_ID
const readUnreadUserConv = async (req, res) => {

    //set unread of single user_conv to 0
    
    //CHECK IF USER IS CORRECT!

    knex('user_conv').where('conv_id', req.params.conv_id).andWhere('user_id', req.params.user_id)
    .update({
        unread: 0
    })
    .then(() => {
        return res.status(200).send({message: 'User unread set to 0'});
    })
    .catch(err => {
        return res.status(500).send({message: err})
    });
}


module.exports = {
    createUserConv,
    deleteUserConv,
    updateUnreadUserConv,
    readUnreadUserConv
}