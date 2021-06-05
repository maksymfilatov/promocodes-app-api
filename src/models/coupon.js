const { Schema, model } = require('mongoose')

const couponSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: [true, 'User id is required.'],
        ref: 'User',
        index: true
    },
    templateId: {
        type: Schema.Types.ObjectId,
        required: [true, 'Template id is required.'],
        ref: 'Template'
    },
    expiration: {
        type: Number,
        get: v => Math.floor(v),
        set: v => Math.floor(v),
        min: [0, 'Must be a positive number.']
    }
}, { timestamps: true })

module.exports = model('Coupon', couponSchema)