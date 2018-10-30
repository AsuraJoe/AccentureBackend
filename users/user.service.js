const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const User = db.User;
const nodemailer = require('nodemailer');
var async = require('async');
const crypto = require('crypto');
const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '5star.cosc412',
        pass: '5*rbhdldmftn'
    }
});
module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    sendRequest
};

async function authenticate({ username, password }) {
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.hash)) {
        const { hash, ...userWithoutHash } = user.toObject();
        const token = jwt.sign({ sub: user.id }, config.secret);
        return {
            ...userWithoutHash,
            token
        };
    }
}

async function getAll() {
    return await User.find().select('-hash');
}

async function getById(id) {
    return await User.findById(id).select('-hash');
}

async function sendRequest({email}){
    const user = await User.findOne({ email });
    if(user) {
        var token;
        crypto.randomBytes(20, function(err, buffer) {
            token = buffer.toString('hex');
        });
        User.findByIdAndUpdate(user.id, { reset_password_token: token, reset_password_expires: Date.now() + 86400000 }, { upsert: true, new: true },
        function(err, result){
            if(err){
                console.log(err);
            }
            console.log("RESULT: " + result);
        });
        var data = {
            to: user.mail,
            from: '5star.cosc412@gmail.com',
            subject: 'Password reset!',
            html:'<p>testing....</p>'
          };
    
          smtpTransport.sendMail(data, function(err) {
            if (!err) {
              return res.json({ message: 'Kindly check your email for further instructions' });
            } else {
              return res.json({message: {err,data}});
            }
          });
    }
    else throw 'User Not Found';
}

async function create(userParam) {
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}