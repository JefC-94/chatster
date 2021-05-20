const knex = require('../../db');

const createUserConv = async (req, res) => {

    const createUserConvQuery = await knex('user_conv').insert({
        user_id : req.body.user_id,
        conv_id: req.body.conv_id,
        created_at: req.body.created_at,
    });

    res.json(createUserConvQuery[0]);

}

const deleteUserConv = async (req, res) => {

    const deleteUserConvQuery = await knex('user_conv').where('id', req.params.id).del();

    res.json(deleteUserConvQuery);
}

module.exports = {
    createUserConv,
    deleteUserConv
}