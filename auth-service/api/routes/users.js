const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../../config/database')

const User = require('../models/userModel');

// Register
router.post('/register', (req, res, next) => {
    let newUser = new User({
        first_name: req.body.first_name,
        middle_name: req.body.middle_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        user_name: req.body.user_name,
        phone: req.body.phone,
    });

    User.addUser(newUser, (err, user) => {
        if(err){
            res.json({success: false, msg:'Registration Failed'});
        } else {
            res.json({success: true, msg:'Registration successfull'});
        }
    });
});

// Profile
router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    res.json({user: req.user});
});

// Authenticate
router.post('/authenticate', (req, res, next) => {
    const user_name = req.body.user_name;
    const password = req.body.password;

    User.getUserByUsername(user_name, (err, user) => {
        if(err){
            throw err;
        }

        if(!user){
            return res.json({success: false, msg: 'User not found'});
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if(err){
                throw err;
            }

            if(isMatch){
                const token = jwt.sign({user}, config.secret, {
                    expiresIn: 604800 //second is equal to 1 week
                });

                res.json({
                    success: true,
                    token: 'JWT '+token,
                    user: {
                        id: user._id,
                        first_name:user.first_name,
                        middle_name:user.middle_name,
                        last_name:user.last_name,
                        user_name:user.user_name,
                        email:user.email,
                        phone:user.phone
                    }
                });
            } else {
                return res.json({success: false, msg: 'Password Incorrect'});
            }
        });
    });
});

module.exports = router;