const express = require('express');
require('./db/mongoose');
const User = require('./models/user');
const Task = require('./models/task');
const userRouter = require('./router/user.routes');
const taskRouter = require('./router/task.router');
const app = express();

app.use(express.json());
const port = process.env.PORT;

app.use(express.static('public'));
app.use('/api-docs', (req, res) => {
    const file = './public/Task App.postman_collection.zip';
    res.download(file); 
});

app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('Server is listening on port '+port);
});

/*const bcrypt = require('bcryptjs');
const generatePassword = async () => {
    try{
        const myPassword = 'hardev123';
        const encryptedPass = await bcrypt.hash(myPassword, 8);
        console.log('Plain Password: ', myPassword);
        console.log('hashed Pass: ', encryptedPass);
        const isMatched = await bcrypt.compare('hardev123', encryptedPass);
        console.log(isMatched);
    } catch(e) {
        console.log(e);
    }
}

generatePassword();*/

/*const jwt = require('jsonwebtoken');
const testFunction = async () => {
    try{
    const token = jwt.sign({'_id':'hardev123'}, 'hardev123456', { expiresIn : '0 seconds'});
    console.log(token);

    const data = jwt.verify(token, 'hardev123456');
    console.log(data);
    }catch(e){
    
    }
}

testFunction();*/