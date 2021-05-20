var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../../config');
const knex = require('../../db');

const register = async (req, res) => {

    //Check if username and password are given
    if(!req.body.email || !req.body.username || !req.body.password){
        res.json({success: 0, status: 401, message:'Fill in username, email and password'});
        return;
    }

    //Check password length
    if(req.body.password.length < 6){
        res.json({success: 0, status: 422, message:'Password is too short'});
        return;
    }

    //also validate user input! XSS and SQL Injection Prevention

    //Check if username is already signed up
    const findUser = await knex('users').where('email', req.body.email);
    
    if(findUser.length !== 0){
        res.json({success:0,status:422,message:'This user has already signup'});
        return;
    }

    var hashedPassword = bcrypt.hashSync(req.body.password, 8);

    const insertQuery = await knex('users').insert({
        username: req.body.username,
        password: hashedPassword
    });

    const token = jwt.sign({ id: insertQuery}, config.secret, {
        expiresIn: 86400 //24h
    });

    res.json({success: 1, status: 200, token: token});

}


const login = async (req, res) => {

    if(!req.body.email || !req.body.password){
        res.json({success: 0, status: 401, message:'Fill in username and password'});
        return;
    }

    knex('users').where('email', req.body.email)
    .catch(err => {
        res.json({success: 0, status: 500, message: err});
        return;
    })
    .then(rows => {
        if(rows.length === 0){
            res.json({success: 0, status: 401, message:'No user with this email'});
            return;
        } else {
            //USER HAS BEEN FOUND
            const user = rows[0];

            var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

            if(!passwordIsValid) return res.send({success: 0, status: 401, message:'Invalid password'});

            var token = jwt.sign({id : user.id}, config.secret, {
                expiresIn: 86400 //24h;
            });

            res.json({success: 1, status: 200, token: token});
        }
    })
    
}


const me = async (req, res, next) => {

    //Req.user_id refers to the returned value from the verifyToken middleware!
    knex.select('id', 'username', 'email', 'photo_url').from('users').where('id', req.user_id)
    .then(rows => {
        res.json({success: 1, status: 200, user: rows[0]});
    })
    .catch(err => {
        res.json({success: 0, status: 500, message: err});
    });

}


const logout = async (req, res) => {
    res.status(200).send({auth: false, token: null});
}


module.exports = {
    register,
    me,
    login,
    logout
}