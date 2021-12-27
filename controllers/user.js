const User = require('../models/user');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');


exports.userById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if(err || !user){
            res.status(400).json({
                error: "User Not Found"
            })
        }
        req.profile = user;
        next();
    })
}

exports.login = (req, res) => {
    User.findOne({_id: req.body.email}).exec((err, user) => {
        if(err || !user){
            const u = new User({...req.body, balance:0});
            u.save((err,us) => {
                if(err || !us){
                    res.status(400).json({
                        error: "Unable to Register"
                    })
                }
                const token = jwt.sign({_id: us._id}, process.env.JWT_SECRET);
                res.json({
                    token,
                    user:us
                });
            })
        }
        if(user.activated===0){
            res.status(400).json({
                error: "Your Email is Locked"
            })
        }else{
            const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
            res.json({
                token,
                user:user
            });
        }
    })
}

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'] ,
    userProperty:"auth"
});

exports.isUser = (req, res, next) => {
    let user = req.profile && req.auth && req.profile._id == req.auth._id;
    if(!user){
       return res.status(403).json({ 
           error: 'Access denied'
       });
    }
    next();
};