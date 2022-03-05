const { user } = require("../Models/UserModel");
const { fast2sms } = require('../Middleware/SmsAuth');
const passport = require("passport");
const User = require('../Models/FacebookModel')
const rzp = require("razorpay");
require('dotenv').config()

require('../Middleware/FacebookAuth')(passport)
const { TokenSender } = require('../Utils/TokenSender')

var instance = new rzp({ key_id: process.env.key_id, key_secret: process.env.key_secret, });

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
                        message: " enable to register"
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
    })
        .catch(err => {
            console.log(err);
            res.send({
                success: false,
                message: 'Failed',
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

exports.razorpayWallet = async (req, res) => {
    // try {
    //     const { amount } = req.body
    //     instance.orders.create({
    //         amount: amount || 100, // rzp format with paise
    //         currency: 'INR',
    //         receipt: "receipt01", //Receipt no that corresponds to this Order,
    //         payment_capture: true,
    //         notes: {
    //             orderType: "Pre"
    //         }
    //         //Key-value pair used to store additional information
    //     }).then(orderCreate => {
    //         if (orderCreate) {
    //             res.send({
    //                 success: true,
    //                 message: 'Payment order',
    //                 data: orderCreate
    //             })
    //         } else {
    //             res.send({
    //                 success: false,
    //                 message: 'payment order failed'
    //             })
    //         }
    //     }).catch(err => {
    //         console.log(err);
    //         res.send({
    //             success: false,
    //             message: 'Failed',
    //             err: err
    //         })
    //     })

    // } catch (error) {
    //     res.send(error)
    // }

    var options = {
        amount: 500,  // amount in the smallest currency unit  
        currency: "INR",
        receipt: "order_rcptid_11"
    };

    instance.orders.create(options, function (err, order) {
        console.log(order);
    });

    instance.payments.all()
        .then((response) => {
            res.send({
                success: 0,
                data: response
            })
        })
        .catch((error) => {
            console.log(error);
            res.send({
                success: 1,
                message: "occurd error"
            })
        })

}

// exports.subscriptionId = async (req,res) => {
//         // To create recurring subscription
//         const subscriptionObject = {
//             plan_id: PLAN_ID,
//             total_count: 60,
//             quantity: 1,
//             customer_notify: 1,
//             notes,
//         }
//         const subscription = await instance.subscriptions.create(subscriptionObject);

//         if (subscription) {
//             res.send({
//                 success:0,
//                 data:subscription
//             })
//         } else {
//             console.log(err);
//             res.send({
//                 success:1,
//                 message:"Faild"
//             })
//         }
// }