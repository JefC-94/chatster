const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const AuthController = require('../controllers/AuthController');
const ContactController = require('../controllers/ContactController');

//MIDDLEWARES

//verifyToken is the middleware used to check the token
//it returns the user_id and adds it to the request as param!
const verifyToken = require('../controllers/verifyToken');

//authCheck is a small piece of middleware that checks the request param user_id
//Only use this middleware for requests coming from one specific user
const authCheck = require('../controllers/authCheck');

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json()

//USER ROUTES

router.get('/users', UserController.getUsers);

router.get('/users-pets', UserController.getUsersAndPets);

//For authCheck, the param user_id should always be named "user_id", never just "id"
router.get('/user/:user_id', verifyToken, authCheck, UserController.getUser);

router.post('/user', jsonParser, UserController.createUser);

router.delete('/user/:user_id', verifyToken, authCheck, UserController.deleteUser);


//AUTH ROUTES

router.post('/register', jsonParser, AuthController.register);

router.get('/me', verifyToken, AuthController.me);

router.post('/login', jsonParser, AuthController.login);

router.get('/logout', AuthController.logout);

//PET ROUTES

//Example of an authenticated and secured route:
// verifyToken checks the auth token header
// authCheck compares with route param user_id
router.get('/contacts/user_id=:user_id', verifyToken, authCheck, ContactController.contactsByUser);

router.get('/contacts', ContactController.contacts);

module.exports = router;