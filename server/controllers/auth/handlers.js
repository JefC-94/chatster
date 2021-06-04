var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../../config');
const knex = require('../../db');

const register = async (req, res) => {

    //Check if username and password are given
    if(!req.body.username){
        return res.status(422).send({type: 'username', message:'Please fill in a username'});
    }
    
    if(!req.body.email){
        return res.status(422).send({type: 'email', message:'Please fill in an email address'});
    }

    if(!req.body.password){
        return res.status(422).send({type: 'password', message:'Please fill in a password'});
    }

    //Check password length
    if(req.body.password.length < 6){
        return res.status(422).send({type: 'password', message:'Password is must be at least 6 characters long.'});
    }

    //also validate user input! XSS and SQL Injection Prevention

    //Check if username is already signed up
    const findUser = await knex('users').where('email', req.body.email);
    
    if(findUser.length !== 0){
        return res.status(422).send({type: 'password', message:'A user with this e-mail address has already signed up'});
    }

    var hashedPassword = bcrypt.hashSync(req.body.password, 8);

    const insertUserQuery = await knex('users').insert({
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
        created_at: req.body.created_at
    });

    const token = jwt.sign({ id: insertUserQuery}, config.secret, {
        expiresIn: 86400 //24h
    });

    res.status(200).send({success: 1, token: token});

}


const login = async (req, res) => {

    if(!req.body.email){
        return res.status(422).send({type: 'email', message:'Please fill in email'});
    }

    if(!req.body.password){
        return res.status(422).send({type: 'password', message:'Please fill in your password'});
    }

    // VALIDATE EMAIL!!

    knex('users').where('email', req.body.email)
    .then(rows => {
        if(rows.length === 0){
            return res.status(401).send({type: 'email', message:'Sorry, we found no user with this email'});
        } else {
            //USER HAS BEEN FOUND
            const user = rows[0];

            //apparentley very often there's a problem with the line below
            var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

            if(!passwordIsValid) return res.status(401).send({type: 'password', message:'Invalid password'});

            var token = jwt.sign({id : user.id}, config.secret, {
                expiresIn: 86400 //24h;
            });

            res.status(200).send({success: 1, token: token});
        }
    })
    .catch(err => {
        return res.status(500).send({message:err});
    });
    
}


const me = async (req, res, next) => {

    //Req.user_id refers to the returned value from the verifyToken middleware!
    knex.select('id', 'username', 'email', 'created_at', 'photo_url', 'last_login').from('users').where('id', req.user_id)
    .then(rows => {
        res.status(200).send({success: 1, user: rows[0]});
    })
    .catch(err => {
        res.status(500).send({message: 'User not found'});
    });

}


const edit = async (req, res) => {

    if(req.user_id !== +req.body.id){
        return res.status(401).send({message:'Unauthorized: not allowed to get, update or delete info of other users!'});
    }

    knex('users').where('id', req.body.id).first()
    .then(async (rows) => {
        if(!rows){
            return res.status(500).send({message:'No user found'});
        } else {
            //USER HAS BEEN FOUND
            const user = rows;

            var passwordIsValid = bcrypt.compareSync(req.body.oldPassword, user.password);

            if(!passwordIsValid) return res.status(401).send({type: 'old-password', message: 'Invalid password'});

            if(req.body.newPassword){

                //Check password length
                if(req.body.newPassword.length < 6){
                    return res.status(422).send({type: 'new-password', message: 'New password is must be at least 6 characters long.'});
                }

                var hashedPassword = bcrypt.hashSync(req.body.newPassword, 8);

                const updateUserQuery = await knex('users').where('id', req.body.id).update({
                    username: req.body.username,
                    password: hashedPassword,
                    updated_at: req.body.updated_at
                });

                res.status(200).send({success: 1, message: updateUserQuery});

            } else {

                const updateUserQuery = await knex('users').where('id', req.body.id).update({
                    username: req.body.username,
                    updated_at: req.body.updated_at
                });

                res.status(200).send({success: 1, message: updateUserQuery});

            }
        }
    })
    .catch(err => {
        return res.status(500).send({message: err});
    });
}

const logout = async (req, res) => {
    res.status(200).send({auth: false, token: null});
}

const setLastLogin = async (user_id) => {

    knex('users').where('id', user_id).first()
    .then(async (rows) => {
        if(!rows){
            return false;
        } else {
            //USER HAS BEEN FOUND
            const user = rows;
            const now = Math.floor(new Date().getTime() / 1000 );

            const updateUserQuery = await knex('users').where('id', user_id).update({
                last_login : now
            });

            if(updateUserQuery){
                return true;
            } else {
                return false;
            }
        }
    })
    .catch(err => {
        return false;
    });

}

const clearLastLogin = async (user_id) => {

    knex('users').where('id', user_id).first()
    .then(async (rows) => {
        if(!rows){
            return false;
        } else {
            //USER HAS BEEN FOUND
            const user = rows;
            const now = new Date();

            const updateUserQuery = await knex('users').where('id', user_id).update({
                last_login : null
            });

            if(updateUserQuery){
                return true;
            } else {
                return false;
            }
        }
    })
    .catch(err => {
        return false;
    });

}


module.exports = {
    register,
    me,
    login,
    logout,
    edit,
    setLastLogin,
    clearLastLogin
}