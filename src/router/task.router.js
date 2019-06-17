const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth.middleware');

router.post('/tasks', auth, async (req, res) => {
    if(req.body){
        //const task = new Task(req.body);
        const task = new Task({
            ... req.body,
            owner: req.user._id
        });
        try{
            await task.save();
            res.status(201).send(task);
        } catch(e) {
            res.status(400).send(e);
        }
        /*
        task.save().then(()=>{
            res.status(201).send(task);
        }).catch((e) => {
            res.status(400).send(e);
        });*/
    }
});

router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if(req.query.completed){
        match.completed = req.query.completed === 'true';
    }

    if(req.query.sortby){
        const parts = req.query.sortby.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try{
        const user = req.user;
        await user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.status(200).send(user.tasks);
    } catch(e) {
        res.status(500).send(e);
    }
    /*Task.find({}).then((result) => {
        res.status(200).send(result);
    }).catch((error) => {
        res.status(500).send(error);
    });*/
});

router.get('/tasks/:id', auth, async (req,res) => {
    const _id = req.params.id;
    try{
        const task = await Task.findById({_id, owner: req.user._id});
        /**
         * Populate owner field information...
         */
        await task.populate('owner').execPopulate();
        res.status(201).send(task);
    } catch(e) {
        res.status(400).send();
    } 

    /*
    Task.findById(_id).then((task) => {
        res.status(200).send(task);
    }).catch((error) => {
        res.status(500).send(error);
    });*/
});

router.patch('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id;
    
    const requestFields = Object.keys(req.body);
    const allowedFields = ['description','completed'];
    const isValidUpdate = requestFields.every((update) => allowedFields.includes(update));
    if(!isValidUpdate){
        return res.status(400).send('invalid update!');
    }

    try {
        //const task = await Task.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true});

        //const task = await Task.findById(_id);
        const task = await Task.findOne({_id, owner:req.user.id});   
        if(!task){
            res.status(404).send();
        }
        requestFields.forEach(field => task[field] = req.body[field]);
        await task.save();
        res.status(200).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    try{
        //const task = await Task.findByIdAndDelete(req.params.id);
        const task = await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id});
        if(!task){
            res.status(404).send();
        } 
        res.status(200).send(task);
    } catch(e){
        res.status(500).send(e);
    }
});

module.exports = router;