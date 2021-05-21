const express = require('express');
const multer = require('multer');
const path = require('path');
const slugify = require('slugify');
const knex = require('../db');

const router = express.Router();

//Setup settings for file storage:
const storage = multer.diskStorage({
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
}).single('fileToUpload');


//PROFILE PICTURE UPLOAD

router.post('/profile&user_id=:id', (req, res) => {
   
    upload(req, res, (err) => {
        if(req.fileValidationError){
            return res.send({success: 0, status: 500, message: req.fileValidationError});
        }
        else if(!req.file){
            return res.send({success: 0, status: 500, message: 'Please select an image to upload'});
        /* }
         else if(err instanceof multer.MulterErrof){
            return res.send(err); */
        } else if(err){
            return res.send({success: 0, status: 500, message: err});
        }

        //upload successfull: now add image to database!
        knex('users').where('id', req.params.id).update({
            photo_url : req.file.filename
        })
        .catch(err => {
            res.json({success: 0, status: 500, message: err});
            return;
        })
        .then(rows => {
            res.json({success:1, status: 201, message: 'Profile picture updated!'});
        });

    })

});


router.post('/conv-img&id=:id', (req, res) => {
   
    upload(req, res, (err) => {
        if(req.fileValidationError){
            return res.send({success: 0, status: 500, message: req.fileValidationError});
        }
        else if(!req.file){
            return res.send({success: 0, status: 500, message: 'Please select an image to upload'});
        /* }
         else if(err instanceof multer.MulterErrof){
            return res.send(err); */
        } else if(err){
            return res.send({success: 0, status: 500, message: err});
        }

        //upload successfull: now add image to database!
        knex('conversation').where('id', req.params.id).update({
            photo_url : req.file.filename
        })
        .catch(err => {
            res.json({success: 0, status: 500, message: err});
            return;
        })
        .then(rows => {
            res.json({success:1, status: 201, message: 'Group picture updated!'});
        });

    })

});




module.exports = router;