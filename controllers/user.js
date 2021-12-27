const User = require('../models/user');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const { errorHandler } = require('../helpers/dbErrorHandler');


exports.userById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if(err || !user){
            return res.status(400).json({
                error: "User Not Found"
            })
        }
        req.profile = user;
        next();
    })
}

exports.login = (req, res) => {
    User.findOne({email: req.body.email}).exec((err, user) => {
        if(err || !user){
            console.log("here");
            const u = new User({...req.body, balance:0});
            u.save(async(err,us) => {
                if(err){
                    return res.status(400).json({
                        error: errorHandler(err)
                    })
                }
                const token = jwt.sign({_id: us._id}, process.env.JWT_SECRET);
                res.cookie('t', token, {expire: new Date() + 9999})
                await res.json({
                        token,
                        user:us
                    });
            })
        }else{
            if(user && user.activated===0){
                return res.status(400).json({
                    error: "Your Account is Locked"
                })
            }else if(user && user.activated===1){
                const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
                res.cookie('t', token, {expire: new Date() + 9999})
                return res.json({
                    token,
                    user:user
                });
            }else{
                return res.status(500).json({
                    error: 'SOMETHING WENT WRONG'
                })
            }
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