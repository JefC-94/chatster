const express = require('express');
const multer = require('multer');
const path = require('path');
const slugify = require('slugify');
const knex = require('../db');
const fs = require('fs');
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const formidable = require('formidable');

//Setup settings for file storage:
/* const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'server/uploads');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, slugify((file.originalname).split('.')[0]) + '-' + Date.now() + path.extname(file.originalname));
    }
});

//Setup image filter
const imageFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

//General upload settings
const upload = multer({
    storage: storage, 
    limits: {fileSize: 1000000}, 
    fileFilter: imageFilter
}).single('fileToUpload'); */


//PROFILE PICTURE UPLOAD

router.post('/profile&user_id=:id', async (req, res) => {

    let previous_image = null;
    //GET Filename of previous photo_url if there is one
    //Delete when uploading is successful
    const queryUserForImage = await knex('users').where('id', req.params.id).select('photo_url').first();
    
    if(queryUserForImage){
        previous_image = queryUserForImage.photo_url;
    }

    /* upload(req, res, async (err) => {
        if(req.fileValidationError){
            return res.status(500).send({message: req.fileValidationError});
        }
        else if(!req.file){
            return res.status(500).send({message: 'Please select an image to upload'});
        /* }
         else if(err instanceof multer.MulterErrof){
            return res.send(err); */
        /* } else if(err){
            return res.status(500).send({message: err});
        } */

    var form = new formidable.IncomingForm();

    // form.parse analyzes the incoming stream data, picking apart the different fields and files for you.

    form.parse(req, function(err, fields, file) {
        if (err) {

        // Check for and handle any errors here.

        console.error(err.message);
        return;
        }

        console.log(file.fileToUpload.path);
        // This last line responds to the form submission with a list of the parsed data and files.

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

//User deletes his profile image (no new)
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

router.post('/conv-img&id=:id', (req, res) => {
   
    upload(req, res, (err) => {
        if(req.fileValidationError){
            return res.status(500).send({message: req.fileValidationError});
        }
        else if(!req.file){
            return res.status(500).send({message: 'Please select an image to upload'});
        /* }
         else if(err instanceof multer.MulterErrof){
            return res.send(err); */
        } else if(err){
            return res.status(500).send({message: err});
        }

        //upload successfull: now add image to database!
        knex('conversation').where('id', req.params.id).update({
            photo_url : req.file.filename
        })
        .then(() => {
            return res.status(200).send({message: 'Group picture updated!'});
        })
        .catch(err => {
            return res.status(500).send({message: err});
            ;
        });

    })

});




module.exports = router;