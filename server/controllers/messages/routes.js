const express = require('express');
const router = express.Router();

const {
    messages,
    createMessage,
} = require('./handlers');

//MIDDLEWARES

//verifyToken is the middleware used to check the token
//it returns the user_id and adds it to the request as param!
const verifyToken = require('../verifyToken');

//authCheck is a small piece of middleware that checks the request param user_id
//Only use this middleware for requests coming from one specific user
const authCheck = require('../authCheck');

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

//MESSAGES ROUTES

router.get('/conv_id=:conv_id&user_id=:user_id&page=:page&per_page=:per_page', verifyToken, authCheck, messages);

router.post('/user_id=:user_id', verifyToken, authCheck, jsonParser, createMessage);

module.exports = router;