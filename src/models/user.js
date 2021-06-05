const { Schema, model } = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Promotion = require('./coupon')

const userSchema = new Schema({
    name: {
        type: String,
        trim: true
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
    password: {
        type: String,
        required: [true, 'Password is required.'],
        trim: true,
        minLength: [7, 'Minimum 7 characters.']
    },
    role: {
        type: String,
        default: 'client',
        enum: ['client', 'employee']
    },
    establishmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Establishment'
    },
    tokens: [String]
})

userSchema.methods.generateAccessToken = async function () {
    const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET)

    this.tokens.push(token)
    await this.save()

    return token
}

userSchema.statics.authenticateByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user)
        throw new Error('Unable to login')
    const isCorrectPassword = await bcrypt.compare(password, user.password)
    if (!isCorrectPassword)
        throw new Error('Unable to login')
    return user
}

userSchema.pre('save', async function (next) {
    if (this.isModified('password'))
        this.password = await bcrypt.hash(this.password, 8)
    next()
})

userSchema.pre('remove', async function (next) {
    await Promotion.deleteMany({ user: this._id })
    next()
})

userSchema.methods.toJSON = function () {
    const userObject = this.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

const User = model('User', userSchema)

module.exports = User