const User = require('../models/user');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const { OAuth2Client } = require('google-auth-library')
const { errorHandler } = require('../helpers/dbErrorHandler');

// Twilio Credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_NUMBER;
const client = require('twilio')(accountSid, authToken);

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

exports.list = (req, res) => {
    let q={};
    let qry = req.query;
    let limit = qry.limit || 10;
    let skip = qry.skip || 0;
    if(qry?.role){
        q['role']=qry?.role;
    }
    User.find(q)
    .limit(limit)
    .skip(skip)
    .sort({"createdAt":-1})
    .exec((err, users) => {
        if(err || !users){
            return res.status(400).json({
                error: 'Failed to fetch Users'
            })
        }
        return res.status(200).json(users);
    })
}

function generateOTP() {
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

exports.setOtp = (req, res) => {
    let { user, phone } = req.body;
    let newOtp = generateOTP();
    User.findById(user).exec((err, user) => {
        if(err || !user){
            return res.status(400).json({
                message: errorHandler(err)
            })
        }
        user.otp = newOtp;
        user.save((err, user) => {
            if(err || !user){
                return res.status(400).json({
                    message: errorHandler(err)
                })
            }
            //twilio send Sms
            client.messages
            .create({body: `Hey ${user.name}, Your Verification Code is ${newOtp}`, 
            from: phoneNumber, to: `+91${phone}`})
            .then((response) => {
                return res.status(200).json({
                    message:`OTP Sent from ${response.from}`
                })
            }).catch((err) => {
                return res.status(400).json({
                    message: `OTP Sending Failed`
                })
            })
            
        })
    })
}

exports.verifyOtp = (req, res) => {
    let { user, phone, code} = req.body;
    User.findById(user).exec((err, user) => {
        if(err || !user){
            return res.status(400).json({
                message:errorHandler(err)
            })
        }
        if(user.otp==code){
            user.phone=phone;
            user.verified=1;
            user.save((err, user) => {
                if(err || !user){
                    return res.status(400).json({
                        message:errorHandler(err)
                    })
                }
                const { _id, name , email , phone, activated,photo, balance, role, verified} = user;
                const token = jwt.sign({_id:_id}, process.env.JWT_SECRET);
                return res.status(200).json({
                    token,
                    user:{
                        _id,
                        name,
                        email,
                        phone,
                        activated,
                        photo,
                        balance,
                        role,
                        verified
                    }
                })
            })
        }else{
            return res.status(400).json({
                message:'Verification Failed'
            })
        }
    })
}


exports.search = (req, res) => {
    let q={isDeleted:false};
    let qry = req.query;
    if(qry?.email){
        q['email'] = {
            $regex:`^${qry?.email}`,
            $options:"gi"
        }
    }
    if(qry?.role){
        q['role']=qry?.role;
    }
    User.find(q)
    .sort({"createdAt":-1})
    .exec((err, users) => {
        if(err || !users){
            return res.status(400).json({
                error: 'Failed to fetch Users'
            })
        }
        return res.status(200).json(users);
    })
}

const clinet = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

exports.login = (req, res) => {
    User.findOne({email: req.body.email}).exec((err, user) => {
        if(err || !user){
            const { idToken, name, photo } = req.body;
            clinet.verifyIdToken({idToken, audience: process.env.GOOGLE_CLIENT_ID}).then(response => {
                //console.log('GOOGLE LOGIN RESPONSE',response);
                const {email_verified, email} = response.payload;
                if(email_verified) {
                            console.log(name, email, photo);
                            const u = new User({name, email, photo, balance:0});
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
                } else{
                    return res.status(400).json({
                        error: 'Google login failed, Try again'
                    })
                }
            }).catch(() => {
                return res.status(400).json({
                    error: "something went wrong"
                })
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