const express = require('express');
const router = express.Router();

const {
    convsByUser,
    conv,
    createConv,
    updateConv,
    deleteConv
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

//CONV ROUTES

router.get('/user_id=:user_id', verifyToken, authCheck, convsByUser);

router.get('/id=:id&user_id=:user_id', verifyToken, authCheck, conv);

router.post('/user_id=:user_id', verifyToken, authCheck, jsonParser, createConv);

router.delete('/id=:id&user_id=:user_id', verifyToken, authCheck, deleteConv);

router.put('/id=:id&user_id=:user_id', verifyToken, authCheck, jsonParser, updateConv);

module.exports = router;