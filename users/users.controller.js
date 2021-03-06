﻿const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const nodemailer = require('nodemailer');
var async = require('async');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
var User = db.User;
const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '5star.cosc412',
        pass: '5*rbhdldmftn'
    }
})

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', _delete);
router.post('/resetRequest', forgotPass);
router.post('/resetPassword', reset);

module.exports = router;

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function forgotPass(req, res,next){
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email}, function(err, user) {
        if (err) 
          return res.status(404).json({message: 'No account with that email address exists.'})
          .catch(err => next(err));
        
        user.reset_password_token = token;
        user.reset_password_expires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var mailOptions = {
        to: user.email,
        from: '5star.cosc412@gmail.com',
        subject: 'Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://localhost:8080/' + 'reset_password?token=' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        if (!err) res.json({message: 'An email has bas been sent to '+user.email+'!'});
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/resetRequest');
  });
}

function reset (req, res){
  async.waterfall([
    function(done) {
      console.log(req);
      User.findOne({ reset_password_token: req.query.token, reset_password_expires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          return res.redirect('back');
        }

        user.hash = bcrypt.hashSync(req.body.password, 10);
        user.reset_password_token = undefined;
        user.reset_password_expires = undefined;
        console.log(user);

        user.save(function(err) {
            done(err, user);
        });
      });
    },
    function(user, done) {
      var mailOptions = {
        to: user.email,
        from: '5star.cosc412@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        if (!err) res.json({message: 'Your password has been reset succssfully'});
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
}