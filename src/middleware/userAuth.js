const { decode } = require("jsonwebtoken");
const { user } = require("../Models/UserModel");

const userAuth = async (req, res, next) => {
    try {
        const token = req.headers.authentication;

        if (!token) {
            if (req.isAuthenticated())
                return next();
            res.send({
                success: false,
                message: 'Please login to continue 1'
            })
        }
        var decodeUser = await decode(token, process.env.JWTSECRET);

        var _id;
        if (decodeUser == null) {
            if (req.isAuthenticated())
                return next();
            res.send({
                success: false,
                message: 'Please login to continue 2'
            })
        } else {
            _id = decodeUser._id;
        }
        if (_id == undefined) {
            if (req.isAuthenticated())
                return next();
            res.send({
                success: false,
                message: 'Please login to continue 3'
            })
        }
        user.findById({ _id: _id })
            .then(userfind => {
                if (userfind) {
                    req.user = userfind;
                    next()
                } else {
                    if (req.isAuthenticated())
                        return next();
                    res.send({
                        success: false,
                        message: 'Please login to continue 4'
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
    } catch (error) {
        console.log(error);
        res.end({
            success: false,
            err: error
        })
    }
}
module.exports = { userAuth }