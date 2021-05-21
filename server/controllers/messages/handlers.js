const knex = require('../../db');

const messages = async (req, res) => {

    //CHECK AUTH: check with these functions if user is in group or individual conversation
    const checkIndConv = await userInIndividualConversation(req.params.conv_id, req.user_id);
    const checkGroupConv = await userInGroupConversation(req.params.conv_id, req.user_id);

    //If both results are false -> unauthorized
    if(!checkIndConv && !checkGroupConv ){
        return res.json({success:0,status:401,message:'Not authorized to view conversation between other users'});
    }

    //AFTER ALL AUTH CHECK: QUERY MESSAGES

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

    //CHECK AUTH: check with these functions if user is in group or individual conversation
    const checkIndConv = await userInIndividualConversation(req.body.conv_id, req.user_id);
    const checkGroupConv = await userInGroupConversation(req.body.conv_id, req.user_id);

    //If both results are false -> unauthorized
    if(!checkIndConv && !checkGroupConv ){
        return res.json({success:0,status:401,message:'Not authorized to add to a conversation between other users'});
    }

    if(req.body.user_id !== req.user_id){
        return res.json({success:0,status:401,message:'Not authorized to create message as another user'});
    }

    if(req.body.body === ""){
        return res.json({success:0,status:401,message:'Cannot send empty message'});
    }

    //Validate req.body.body!!

    const createMessageQuery = await knex('message').insert({
        conv_id : req.body.conv_id, 
        user_id: req.body.user_id, 
        body: req.body.body, 
        created_at: req.body.created_at
    });

    res.send(createMessageQuery);

}


// AUTH FUNCTIONS

async function userInIndividualConversation(conv_id, user_id){

    //Auth Check: User must be part of this conversation!! -> Two options!
    const queryConvContact = await knex('conversation')
    .join('contact', 'conversation.id', '=', 'contact.conv_id')
    .where('conversation.id', conv_id)
    .first();

    if(queryConvContact){

        //Authorization check: user should be one of both contacts in this conversation
        if(queryConvContact.user_1 === user_id ||queryConvContact.user_2 === user_id){
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }

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
        } else {
            return false;
        }
    } else {
        return false;
    }
}

module.exports = {
    messages,
    createMessage
}