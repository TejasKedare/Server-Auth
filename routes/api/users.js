const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const key = require('../../config/keys').secret;
const User = require('../../models/User')


// Api for Signup
router.post('/signup', (req, res) => {
    let { name, email, password, confirmPassword } = req.body
    if (password !== confirmPassword) {
        return res.status(400).json({
            msg: "Password dose not match"
        })
    }

    // To check if name exists or not
    User.findOne({ name: name }).then(user => {
        if (user) {
            return res.status(400).json({
                msg: "User Name already exists"
            })
        }
    })

    // To email if name exists or not
    User.findOne({ email: email }).then(user => {
        if (user) {
            return res.status(400).json({
                msg: "Email already exists"
            })
        }
    })

    // If Validation correct create new user
    const newUser = new User({
        name,
        email,
        password,
    })

    // Hashing Password 
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) { console.log(err) };
            newUser.password = hash;
            newUser.save()
                .then(user => {
                    return res.status(201).json({
                        success: true,
                        msg: "New user created"
                    })
                })

        })
    })

})

// Api for Login
router.post('/login', (req, res) => {
    User.findOne({ name: req.body.name }).then(user => {
        if (!user) {
            return res.status(404).json({
                msg: "Username not found",
                success: false
            })
        }

        // If user found
        bcrypt.compare(req.body.password, user.password).then(match => {
            if (match) {
                const payload = {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                }
                jwt.sign(payload, key, {
                    expiresIn: 604800
                }, (err, token) => {
                    return res.status(200).json({
                        success: true,
                        token: `Bearer ${token}`,
                        msg: 'Login Successfull'
                    })
                })
            } else {
                return res.status(404).json({
                    msg: "Wrong Password",
                    success: false
                })
            }
        })
    })
})

// Api for profile
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.json({
        user: req.user
    })
})


module.exports = router