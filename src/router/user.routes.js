const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const sharp = require('sharp');
const auth = require('../middleware/auth.middleware');
const {sendWelcomeEmail,sendCancelEmail} = require('../emails/account');

router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password);
        const token = await user.generateAuthToken();
        res.status(200).send({user, token});
    } catch(e) {
        res.status(400).send(e);
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();    
        res.send();
    } catch(e) {
        res.status(500).send();
    }
});

router.post('/users/logoutAll', auth, async (req, res) => {
    try{
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send();
    } catch(error) {
        res.status(400).send();
    }
});

router.post('/users', async (req, res) => {
    if(req.body){
        const user = new User(req.body);
        try{
            await user.save();
            sendWelcomeEmail(user.email, user.name);
            const token = await user.generateAuthToken();

            res.status(201).send({user, token});
        } catch(e) {
            res.status(400).send(e);
        }
        /*user.save().then(() => {
            res.status(201).send(user);
        }).catch((error) => {
            res.status(400).send(error);
        });*/
    }
});

router.get('/users', auth, async (req, res) => {
    try{
        const users = await User.find({});
        res.status(200).send(users);
    } catch(e) {
        res.status(400).send();
    }
    /*User.find({}).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(500).send(error);
    });*/
});

router.get('/users/me', auth, async (req, res) => {
    try{
        const user = req.user;
        if(!user){
            res.status(501).send();
        }
        //await user.populate('tasks').execPopulate();
        res.status(200).send(user);
    } catch(error) {
        res.status(400).send();
    }
});

const upload = multer({
    //dest: 'uploads/avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(JPG|jpg|jpeg|png|gif)$/)){
            return cb(new Error('Invalid file type uploaded!'));
        }
        cb(undefined, true);
    }
});
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height:250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.status(200).send('File uploaded');
}, (error, req, res, next) => {
    res.status(400).send({error: error.message});
});

router.delete('/users/me/avatar/delete', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send();
});

router.get('/users/:id/avatar', async (req, res) => {
    try{
        const user = await User.findOne( {_id: req.params.id} );
        if(!user || !user.avatar){
            throw new Error('No Image Found');
        }
        console.log(user);
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch(e) {
        res.status(500).send('Something went wrong');
    }
});

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id;
    if(_id){
        try{
            const user = await User.findById(_id);
            if(!user){
                res.status(401).send(user);
            }
            res.status(200).send(user);
        } catch(e) {
            res.status(500).send();
        }
        /*User.findById(_id).then((user) => {
            if(!user){
                res.status(404).send();
            } 
            res.status(200).send(user);
        }).catch((error) => {
            res.status(500).send(error);
        });*/
    }
});

router.patch('/users/me', auth, async (req, res) => {

    const _id = req.user._id;
    const requestFields = Object.keys(req.body);
    const allowedFields = ['name', 'email', 'age', 'password'];
    const isValidUpdate = requestFields.every((update) => allowedFields.includes(update));

    if(!isValidUpdate){
        return res.status(400).send('Invalid Update!');
    }

    try{
        //const user = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true});
        const user = await User.findById(_id);
        requestFields.forEach( field => user[field] = req.body[field] );
        await user.save();

        if(!user){
            res.status(404).send();
        }
        res.status(200).send(user);
    } catch(e) {
        res.status(400).send(e);
    }
});

router.delete('/users/me', auth, async (req, res) => {
    try{
        req.user.remove();
        sendCancelEmail(req.user.email, req.user.name);
        res.status(200).send(req.user);
    } catch(e){
        res.status(500).send(e);
    }
});

module.exports = router;
