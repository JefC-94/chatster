const knex = require('../db');

const getUsers = async (req, res) => {
    const request = await knex('users');
    res.status(200).json(request);
};

const getUsersAndPets = async (req, res) => {
    const request = await knex('users').select('username', 'id');
    for(user of request){
        const pets = await knex('pet').where('user_id', user.id);
        for(singlePet of pets){
            const type = await knex('type').where('id', singlePet.type_id);
            singlePet.type_id = type[0];
        }
        user.pets = pets;
    };
    res.status(200).json(request);
};

const getUser = async (req, res) => {
    const getQuery = await knex('users').where('id', req.params.user_id).select('id', 'username');
    res.status(200).json(getQuery[0]);
};

const createUser = async (req, res) => {

    if(!req.body){
        res.send("Error: no request body given");
    }
   
    const insertQuery = await knex('users').insert(req.body);
    res.status(200).send(insertQuery); // automatically new id!
    
}

const deleteUser = async (req, res) => {

    const deleteQuery = await knex('users').where('id', req.params.user_id).del();
    res.status(200).send('User deleted');
}

module.exports.getUsersAndPets = getUsersAndPets;
module.exports.getUsers = getUsers;
module.exports.getUser = getUser;
module.exports.createUser = createUser;
module.exports.deleteUser = deleteUser;