const express = require('express');
const router = express.Router();

const {
    contactsByUser,
    contact,
    otherUsers,
    createContact,
    deleteContact,
    updateContact,
    updateUnreadContact,
    readUnreadContact,
    contactByConvId
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


//CONTACT ROUTES

//Example of an authenticated and secured route:
// verifyToken checks the auth token header
// authCheck compares with route param user_id
router.get('/user_id=:user_id', verifyToken, authCheck, contactsByUser);

//Route to get all contacts -> disable
router.get('/', (req, res) => {res.send('route not activated')});

router.get('/id=:id&user_id=:user_id', verifyToken, authCheck, contact);

router.get('/otherusers/user_id=:user_id', verifyToken, authCheck, otherUsers);

router.post('/user_id=:user_id', verifyToken, authCheck, jsonParser, createContact);

router.delete('/id=:id&user_id=:user_id', verifyToken, authCheck, deleteContact);

router.put('/id=:id&user_id=:user_id', verifyToken, authCheck, jsonParser, updateContact);

router.get('/updateunread/id=:id&to_id=:to_id&user_id=:user_id', verifyToken, authCheck, updateUnreadContact);

router.get('/readunread/id=:id&to_id=:to_id&user_id=:user_id', verifyToken, authCheck, readUnreadContact);

router.get('/conv_id=:conv_id&user_id=:user_id', verifyToken, authCheck, contactByConvId);

module.exports = router;