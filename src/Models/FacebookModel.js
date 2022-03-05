const { sign } = require("jsonwebtoken");
const mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    uid: String,
    email: String,
    name: String,
    pic: String,
    token: String
}, { timestamps: true });

userSchema.methods.generateJWT = async function () {
    const payload = {
        _id: this._id
    }
    return sign(payload, process.env.JWTSECRET, {
        expiresIn: Date.now() + 1 * 60 * 1000
    })
}


module.exports = mongoose.model('fb-user', userSchema);