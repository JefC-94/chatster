const express = require('express');
const knex = require('../db');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const formidable = require('formidable');


//USER PROFILE PICTURE UPLOAD
router.post('/profile&user_id=:id', async (req, res) => {

    let previous_image = null;
    //GET Filename of previous photo_url if there is one
    //Delete when uploading is successful
    const queryUserForImage = await knex('users').where('id', req.params.id).select('photo_url').first();
    
    if(queryUserForImage){
        previous_image = queryUserForImage.photo_url;
    }

    var form = new formidable.IncomingForm();

    // form.parse analyzes the incoming stream data, picking apart the different fields and files for you.

    form.parse(req, function(err, fields, file) {
        if (err) {

        // Check for and handle any errors here.

        console.error(err.message);
        return;
        }

        console.log(file.fileToUpload.path);
        
        cloudinary.uploader.upload(file.fileToUpload.path, {width: 400, format: "jpg"}, (err, image) => {
            console.log(err, image);
            if(err) {
                return res.status(500).send({message: err});
            }

            //upload successfull: now add image to database!
        
            knex('users').where('id', req.params.id).update({
                photo_url : image.public_id
            })
            .then(() => {
                res.status(200).send({message: 'Profile picture updated!'});
            })
            .catch(err => {
                return res.status(500).send({message: err});
            });

            console.log(previous_image);

            if(previous_image){
                cloudinary.uploader.destroy(previous_image, function(result) { console.log(result) });
            }
        });
    });


});

//USER PROFILE IMAGE DELETE
router.delete('/profile&user_id=:id', async (req, res) => {

    let previous_image = null;
    //GET Filename of previous photo_url if there is one
    //Delete when uploading is successful
    const queryUserForImage = await knex('users').where('id', req.params.id).select('photo_url').first();
    
    if(queryUserForImage){
        previous_image = queryUserForImage.photo_url;
        
        if(previous_image){
            cloudinary.uploader.destroy(previous_image, function(result) { console.log(result) });
        } else {
            return res.status(500).send({message: 'user has no profile picture yet'});
        }

        knex('users').where('id', req.params.id).update({
            photo_url : null
        })
        .then(() => {
            return res.status(200).send({message: 'Profile picture deleted!'});
        })
        .catch(err => {
            return res.status(500).send({message: err});
        });
    }

});

//GROUP CONV IMAGE UPLOAD
router.post('/conv-img&id=:id', async (req, res) => {
   
    let previous_image = null;
    //GET Filename of previous photo_url if there is one
    //Delete when uploading is successful
    const queryUserForImage = await knex('conversation').where('id', req.params.id).select('photo_url').first();
    
    //TODO: CHECK IF USER CREATED THIS CONVERSATION?

    if(queryUserForImage){
        previous_image = queryUserForImage.photo_url;
    }

    var form = new formidable.IncomingForm();

    // form.parse analyzes the incoming stream data, picking apart the different fields and files for you.

    form.parse(req, function(err, fields, file) {
        if (err) {

        // Check for and handle any errors here.

        console.error(err.message);
        return;
        }

        console.log(file.fileToUpload.path);
        
        
        cloudinary.uploader.upload(file.fileToUpload.path, {width: 400, format: "jpg"}, (err, image) => {
            console.log(err, image);
            if(err) {
                return res.status(500).send({message: err});
            }

            //upload successfull: now add image to database!
            knex('conversation').where('id', req.params.id).update({
                photo_url : image.public_id
            })
            .then(() => {
                return res.status(200).send({message: 'Group picture updated!'});
            })
            .catch(err => {
                return res.status(500).send({message: err});
            });

            console.log(previous_image);

            if(previous_image){
                cloudinary.uploader.destroy(previous_image, function(result) { console.log(result) });
            }

        });

    });

});

//GROUP CONV IMAGE DELETE
router.delete('/conv-img&conv_id=:conv_id&user_id=:id', async (req, res) => {

    let previous_image = null;
    const queryUserForImage = await knex('conversation').where('id', req.params.conv_id).select('photo_url').first();
    
    //TODO: CHECK IF USER CREATED THIS CONVERSATION?

    if(queryUserForImage){
        previous_image = queryUserForImage.photo_url;
        
        if(previous_image){
            cloudinary.uploader.destroy(previous_image, function(result) { console.log(result) });
        } else {
            return res.status(500).send({message: 'group has no picture yet'});
        }

        knex('conversation').where('id', req.params.conv_id).update({
            photo_url : null
        })
        .then(() => {
            return res.status(200).send({message: 'Group picture deleted!'});
        })
        .catch(err => {
            return res.status(500).send({message: err});
        });
    }

});


module.exports = router;