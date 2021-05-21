var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../../config');
const knex = require('../../db');

const register = async (req, res) => {

    //Check if username and password are given
    if(!req.body.username){
        res.json({success: 0, status: 401, message: {type: 'username', message: 'Please fill in a username'}});
        return;
    }
    
    if(!req.body.email){
        res.json({success: 0, status: 401, message: {type: 'email', message: 'Please fill in an email address'}});
        return;
    }

    if(!req.body.password){
        res.json({success: 0, status: 401, message: {type: 'password', message: 'Please fill in a password'}});
        return;
    }

    //Check password length
    if(req.body.password.length < 6){
        res.json({success: 0, status: 422, message: {type: 'password', message: 'Password is must be at least 6 characters long.'}});
        return;
    }

    //also validate user input! XSS and SQL Injection Prevention

    //Check if username is already signed up
    const findUser = await knex('users').where('email', req.body.email);
    
    if(findUser.length !== 0){
        res.json({success:0,status:422,message: {type: 'email', message: 'A user with this e-mail address has already signed up'}});
        return;
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

    res.json({success: 1, status: 200, token: token});

}


const login = async (req, res) => {

    if(!req.body.email){
        res.json({success: 0, status: 401, message: {type: 'email', message: 'Please fill in email'}});
        return;
    }

    if(!req.body.password){
        res.json({success: 0, status: 401, message: {type: 'password', message: 'Please fill in password'}});
        return;
    }

    // VALIDATE EMAIL!!

    knex('users').where('email', req.body.email)
    .catch(err => {
        res.json({success: 0, status: 500, message: err});
        return;
    })
    .then(rows => {
        if(rows.length === 0){
            res.json({success: 0, status: 401, message: {type: 'email', message:'Sorry, we found no user with this email'}});
            return;
        } else {
            //USER HAS BEEN FOUND
            const user = rows[0];

            var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

            if(!passwordIsValid) return res.send({success: 0, status: 401, message:{type:'password', message: 'Invalid password'}});

            var token = jwt.sign({id : user.id}, config.secret, {
                expiresIn: 86400 //24h;
            });

            res.json({success: 1, status: 200, token: token});
        }
    })
    
}


const me = async (req, res, next) => {

    //Req.user_id refers to the returned value from the verifyToken middleware!
    knex.select('id', 'username', 'email', 'created_at', 'photo_url').from('users').where('id', req.user_id)
    .then(rows => {
        res.json({success: 1, status: 200, user: rows[0]});
    })
    .catch(err => {
        res.json({success: 0, status: 500, message: err});
    });

}


const edit = async (req, res) => {

    if(req.user_id !== +req.body.id){
        return res.send({success: 0, status: 401, message:'Unauthorized: not allowed to get, update or delete info of other users!'});
    }

    knex('users').where('id', req.body.id).first()
    .catch(err => {
        res.json({success: 0, status: 500, message: err});
        return;
    })
    .then(async (rows) => {
        if(!rows){
            res.json({success: 0, status: 500, message:'No user found'});
            return;
        } else {
            //USER HAS BEEN FOUND
            const user = rows;

            var passwordIsValid = bcrypt.compareSync(req.body.oldPassword, user.password);

            if(!passwordIsValid) return res.send({success: 0, status: 401, message: {type: 'old-password', message: 'Invalid password'}});

            if(req.body.newPassword){

                //Check password length
                if(req.body.newPassword.length < 6){
                    res.json({success: 0, status: 422, message: {type: 'new-password', message: 'New password is must be at least 6 characters long.'}});
                    return;
                }

                var hashedPassword = bcrypt.hashSync(req.body.newPassword, 8);

                const updateUserQuery = await knex('users').where('id', req.body.id).update({
                    username: req.body.username,
                    password: hashedPassword,
                    updated_at: req.body.updated_at
                });

                res.json({success: 1, status: 200, message: updateUserQuery});

            } else {

                const updateUserQuery = await knex('users').where('id', req.body.id).update({
                    username: req.body.username,
                    updated_at: req.body.updated_at
                });

                res.json({success: 1, status: 200, message: updateUserQuery});

            }

        }

    });

}

const logout = async (req, res) => {
    res.status(200).send({auth: false, token: null});
}


module.exports = {
    register,
    me,
    login,
    logout,
    edit,
}