const validator = require('validator')
const { Schema, model } = require('mongoose')
const Template = require('./template')
const User = require('./user')

const establishmentSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Establishment name is required.'],
        trim: true
    },
    phone: {
        type: String,
        validate(phone) {
            if (!validator.isMobilePhone(phone))
                throw new Error('Phone is invalid.')
        },
        trim: true,
        required: [true, 'Contact phone is required.']
    },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        trim: true,
        lowercase: true,
        unique: true,
        validate(email) {
            if (!validator.isEmail(email))
                throw new Error('Email is invalid.')
        }
    },
    ownerName: {
        type: String,
        trim: true,
        required: [true, 'The owner name is required.']
    }
})

establishmentSchema.pre('remove', async function (next) {
    const templates = await Template.find({ establishment: this._id })
    templates.forEach(template => template.remove())
    await User.deleteMany({ establishment: this._id })
    next()
})

module.exports = model('Establishment', establishmentSchema)