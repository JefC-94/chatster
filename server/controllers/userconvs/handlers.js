const knex = require('../../db');

const createUserConv = async (req, res) => {

    //CHECK IF ADDING USER IS CREATOR OF THIS GROUP CHAT
    const queryConvGroup = await knex('conversation')
    .where('conversation.id', req.body.conv_id)
    .first();

    if(queryConvGroup.created_by !== req.user_id){
        return res.status(401).send({message:'Not authorized to add users to this conversation'});
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
    const conv = await knex('user_conv').where('id', req.params.id).select('conv_id').first();

    //CHECK IF DELETING USER IS CREATOR OF THIS GROUP CHAT
    const queryConvGroup = await knex('conversation')
    .where('conversation.id', conv.conv_id)
    .first();

    if(queryConvGroup.created_by !== req.user_id){
        return res.status(401).send({message:'Not authorized to remove users from this conversation'});
    }

    knex('user_conv').where('id', req.params.id).del()
    .then(() => {
        return res.status(200).send({message: 'User deleted from conversation'});
    })
    .catch(err => {
        return res.status(500).send({message: err})
    });
}

module.exports = {
    createUserConv,
    deleteUserConv
}