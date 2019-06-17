// CRUD: Create, Read, Update, Delete
const { MongoClient, ObjectId } = require('mongodb');

const connectionURI = "mongodb://127.0.0.1:27017";
const database = "task-manager";

const id = new ObjectId();
//console.log(id);
//console.log(id.getTimestamp());

MongoClient.connect(connectionURI, {useNewUrlParser:true}, (error, client) => {
    if(error){
        return console.log("Error establishing connection...");
    }

    const db = client.db(database);

    db.collection('users').deleteMany({
        age: 31
    }).then((result) => {
        console.log(result);
    }).catch((error) => {
        console.log(error);
    });

    /*db.collection('tasks').updateMany({
        completed:false
    },{
        $set:{
            completed: true
        }
    }).then((result)=>{
        console.log(result);
    }).catch((error)=>{
        console.log(error);
    });*/

    /*db.collection('users').update({
        _id:new ObjectId("5ce293c0511eb823016c9fa0")
    },{
       $set:{name:"Hardy Wilson"} 
    }).then((result)=>{
        console.log(result);
    }).catch((error)=>{
        console.log(error);
    });*/

    /*db.collection('users').findOne({_id:new ObjectId("5ce2917252a5a721aafed448")}, (error, result) => {
        console.log(result);
    });

    db.collection('users').find({age:32}).toArray((error, result) => {
        console.log(result);
    });*/

    /*db.collection('users').insertOne({
        _id: id,
        name: 'Hardev1 Sharma1',
        age: 31
    }, (error, result) => {
        if(error){
            return console.log("Unable to insert document...");
        }
        console.log(result.ops);
    });*/

    /*db.collection('users').insertMany([
        {name: 'Sunil Kumar', age: 25},
        {name: 'Harry', age: 33}
    ], (error, result) => {
        if(error){
            return console.log('Unable to insert documents...');
        }
        console.log(result.ops);
    });*/

    /*db.collection('tasks').insertMany([
        {description: 'House Cleaning', completed: true},
        {description: 'Gardening', completed: false},
        {description: 'Run Tution Classes', completed: true}
    ], (error, result) => {
        if(error){
            return console.log('Data insertion error!');
        }
        console.log(result.ops);
    });*/
});