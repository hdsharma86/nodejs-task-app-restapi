const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0){
                throw new Error("Age should be a positive number.");
            }
        }
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Email address is invalid.');
            }
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minlength: 7,
        validate(value) {
            if(value.includes('password')){
                throw new Error('Invalid password!');
            }
        }
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

/**
 * On converting user info to json...
 */
userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();
    delete userObject.tokens;
    delete userObject.password;
    delete userObject.avatar;
    return userObject;
};

/**
 * Generate auth token...
 */
userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({'_id' : user._id.toString()}, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({token});
    await user.save();
    
    return token;
}

/**
 * User authentication...
 */
userSchema.statics.findByCredentials = async (email, password) => {
    
    const user = await User.findOne({email});
    if(!user){
        throw new Error('Unable to login.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error('Unable to login.');
    }
    return user;

};

/**
 * Hashing of password on save/update any user..
 */
userSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

/**
 * Middleware: Cacsade type delete...
 */
userSchema.pre('remove', async function(next){
    console.log('remove middleware');
    const user = this;
    try{
        await Task.deleteMany({ owner: user._id });
    } catch(e){
        console.log(e);
    }    
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;