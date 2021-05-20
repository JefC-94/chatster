const express = require('express');
const router = express.Router();

const {
    register,
    me,
    login,
    logout,
} = require('./handlers');

//MIDDLEWARES

//verifyToken is the middleware used to check the token
//it returns the user_id and adds it to the request as param!
const verifyToken = require('../verifyToken');

//authCheck is a small piece of middleware that checks the request param user_id
//Only use this middleware for requests coming from one specific user
const authCheck = require('../authCheck');

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json()


//AUTH ROUTES

router.post('/register', jsonParser, register);

router.get('/me', verifyToken, me);

router.post('/login', jsonParser, login);

router.get('/logout', logout);

module.exports = router;