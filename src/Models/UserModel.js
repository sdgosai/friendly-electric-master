const mongoose = require("mongoose");
const { sign } = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    number: {
        type: Number,
        trim: true,
    },
    otp: {
        type: Number,
        default: 0
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

userSchema.methods.generateJWT = async function () {
    var payload = {
        _id: this._id
    }
    return sign(payload, process.env.JWTSECRET, {
        expiresIn: Date.now() + 1 * 60 * 1000
    })
}

const user = mongoose.model("user", userSchema);
module.exports = { user };