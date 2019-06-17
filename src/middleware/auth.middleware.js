const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '');
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({'_id': decodeToken._id, 'tokens.token': token});
        if(!user){
            res.status(400).send();
        }

        req.token = token;
        req.user = user;
        next();

    } catch(error) {
        res.status(401).send('Authentication failed!');
    }
}
module.exports = auth;