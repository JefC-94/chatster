const express = require('express');
const router = express.Router();

const {
    register,
    me,
    login,
    logout,
    edit,
} = require('./handlers');

//MIDDLEWARES

//verifyToken is the middleware used to check the token
//it returns the user_id and adds it to the request as param!
const verifyToken = require('../verifyToken');

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json()

//AUTH ROUTES

router.post('/register', jsonParser, register);

router.get('/me', verifyToken, me);

router.post('/login', jsonParser, login);

router.put('/edit', verifyToken, jsonParser, edit);

router.get('/logout', logout);

module.exports = router;