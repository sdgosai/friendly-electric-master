const { user } = require("../model/userModel");
const { fast2sms } = require('../middleware/smsAuth');
const passport = require("passport");
const User = require('../model/fbModel')

require('../middleware/fbAuth')(passport)
const { TokenSender } = require('../utils/tokenSender')

exports.addUser = async (req, res) => {
    const { name, email, number } = req.body;
    if (!number) {
        return res.json({
            success: false,
            message: "Please enter valid details"
        })
    }
    if (!name) {
        return res.json({
            success: false,
            message: "Please enter valid details "
        })
    }
    user.findOne({ number: number }).then(numData => {
        if (numData) {
            res.send({
                success: false,
                message: 'User is already exists'
            })
        } else {
            user.create({
                name: name,
                number: number,
                email: email
            }).then(userCreate => {
                if (userCreate) {
                    res.send({
                        success: true,
                        message: " successfully registration"
                    })
                } else {
                    res.send({
                        success: false,
                        message: " enble to rgister"
                    })
                }
            }).catch(err => {
                console.log(err);
                res.send({
                    success: false,
                    message: 'FAiled',
                    err: err
                })
            })
        }
    })
        .catch(err => {
            console.log(err);
            res.send({
                success: false,
                message: 'FAiled',
                err: err
            })
        })
}

exports.loginUser = async (req, res, next) => {
    // Declare a digits variable
    // which stores all digits
    const otpGenrater = async () => {
        var digits = "0123456789";
        let OTP = "";
        for (let i = 0; i < 6; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
    }
    var otp = await otpGenrater();
    const { number } = req.body;
    if (!number) {
        return res.json({
            success: false,
            message: "Please enter Number"
        })
    }
    user.findOne({ number: number }).then(data => {
        if (data) {
            fast2sms({
                message: ` Your otp num is ${otp} `,
                contactNumber: data.number
            }, next).then(smssend => {
                var numOtp = parseInt(otp);
                user.findByIdAndUpdate({ _id: data._id }, { otp: numOtp }, { new: true })
                    .then(otpsave => {
                        if (otpsave) {
                            res.send({
                                success: true,
                                message: `OTP is sent on ${number}`,
                                data: {
                                    userId: data._id
                                }
                            })
                        } else {
                            res.send({
                                success: false,
                                message: 'Unable to sent OTP, Failed'
                            })
                        }
                    }).catch(err => {
                        console.log(err);
                        res.send({
                            success: false,
                            message: 'Failed',
                            err: err
                        })
                    })

            }).catch(err => {
                console.log(err);
                res.end();
            })
        } else {
            res.send({
                success: false,
                message: " Mobile number is not register"
            })
        }
    }).catch(err => {
        console.log(err);
        res.send({
            success: false,
            message: 'Failed',
            err: err
        })
    })
}

exports.verifyOtp = async (req, res) => {
    const { userId, otp } = req.body;
    if (!otp) {
        res.send({
            success: false,
            message: 'Please enter OTP'
        })
    };
    user.findById({ _id: userId })
        .then(userFind => {
            if (userFind) {
                var numOtp = parseInt(otp);
                if (userFind.otp === numOtp) {
                    user.findByIdAndUpdate({ _id: userFind._id }, { otp: 0, isVerified: true }, { new: true })
                        .then(userVerify => {
                            if (userVerify) {
                                TokenSender(userVerify, res)
                            } else {
                                res.send({
                                    success: false,
                                    message: "Unable to login"
                                })
                            }
                        }).catch(err => {
                            console.log(err);
                            res.send({
                                success: false,
                                message: "failed",
                                err: err
                            })
                        })
                } else {
                    res.send({
                        success: false,
                        message: "Incorrect otp"
                    })
                }
            } else {
                res.send({
                    success: false,
                    message: "user not find"
                })
            }
        }).catch(err => {
            console.log(err);
            res.send({
                success: false,
                message: "failed",
                err: err
            })
        })
}

exports.fbLoginUser = async (req, res, next) => {
    return passport.authenticate('facebook', { scope: 'email' })(req, res, next)
}

exports.fbCallback = async (req, res, next) => {
    return passport.authenticate('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/'
    })(req, res, next);
}

exports.profile = async (req, res, next) => {
    const _id = req.user._id;
    User.findById({ _id: _id }).select('-createdAt -updatedAt -__v -token -uid').then(fbUser => {

        if (fbUser) {
            res.send({
                success: true,
                data: fbUser
            })
        } else {
            user.findById({ _id: _id }).select('-createdAt -updatedAt -__v -otp -isVerified -isSuspended').then(normal => {
                if (normal) {
                    res.send({
                        success: true,
                        data: normal
                    })
                } else {
                    res.send({
                        success: false,
                        message: 'Cant get your profile'
                    })
                }
            }).catch(err => {
                console.log(err);
                res.send({
                    success: false,
                    message: 'Failed',
                    err: err
                })
            })
        }
    }).catch(err => {
        console.log(err);
        res.send({
            success: false,
            message: 'Failed',
            err: err
        })
    })
}
