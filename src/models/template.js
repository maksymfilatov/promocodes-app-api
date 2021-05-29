const { Schema, model } = require('mongoose')
const Promotion = require('./coupon')

const templateSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Template title is required.'],
        trim: true,
    },
    content: {
        type: String,
        required: [true, 'Template content is required.'],
        trim: true
    },
    image: {
        type: Buffer
    },
    establishment: {
        type: Schema.Types.ObjectId,
        required: [true, 'Establishment id is required.'],
        ref: 'Establishment',
        index: true
    }
})

templateSchema.pre('remove', async function (next) {
    await Promotion.deleteMany({ template: this._id })
    next()
})

templateSchema.pre('deleteMany', async function (next) {
    await Promotion.deleteMany({ template: this._id })
    next()
})

templateSchema.methods.toJSON = function () {
    const templateObject = this.toObject()

    delete templateObject.image

    return templateObject
}

module.exports = model('Template', templateSchema)