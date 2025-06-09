const { Schema, model } = require('mongoose');

const otpSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    attempts:{
        type: Number,
        default: 0,
    },
    status:{
        type: String,
        enum:['USED','UNUSED'],
        default:'UNUSED'
    }
}, { timestamps: true });

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 20 });

const otpdb = model('otpDb', otpSchema);

module.exports = otpdb;