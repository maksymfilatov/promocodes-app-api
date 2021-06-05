const { Router } = require('express')
const auth = require('../middleware/auth')
const authorize = require('../middleware/authorize')
const multer = require('multer')
const sharp = require('sharp')
const Template = require('../models/template')

const templateRouter = new Router()

templateRouter.route('/')
    .post(auth, authorize('employee'), async (req, res, next) => {
        try {
            const template = new Template({ ...req.body, establishmentId: req.user.establishmentId })
            await template.save()
            res.status(201).send(template)
        } catch (err) {
            next(err)
        }
    })
    .get(auth, authorize('employee'), async (req, res, next) => {
        const sort = {}

        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        }

        try {
            const templates = await Template.find({ establishmentId: req.user.establishmentId }, null, {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            })
            res.send(templates)
        } catch (err) {
            next(err)
        }
    })

templateRouter.route('/:id')
    .get(auth, authorize('employee'), async (req, res, next) => {
        try {
            const template = await Template.findOne({ _id: req.params.id, establishmentId: req.user.establishmentId })
            if (!template) return res.status(404).send()
            res.send(template)
        } catch (err) {
            next(err)
        }
    })
    .patch(auth, authorize('employee'), async (req, res, next) => {
        const fields = Object.keys(req.body)
        const allowedFields = ['title', 'content']
        const isUpdateAllowed = fields.every(update => allowedFields.includes(update))
        if (!isUpdateAllowed) return res.status(400).send({ messages: 'Ivalid updates!' })
        try {
            const template = await Template.findOneAndUpdate({ _id: req.params.id, establishmentId: req.user.establishmentId }, req.body, { new: true })
            if (!template) return res.status(404).send()
            res.send(template)
        } catch (err) {
            next(err)
        }
    })
    .delete(auth, authorize('employee'), async (req, res, next) => {
        try {
            const template = await Template.findOne({ _id: req.params.id, establishmentId: req.user.establishmentId })
            if (!template) return res.status(404).send()
            await template.remove()
            res.send(template)
        } catch (err) {
            next(err)
        }
    })

const upload = multer({
    limits: {
        fileSize: 2000000
    },
    fileFilter(req, f, cb) {
        if (!f.originalname.match(/\.(jpg|jpeg|png)$/))
            return cb(new Error('Please upload an image'))
        cb(undefined, true)
    }
})

templateRouter.route('/:id/image')
    .post(auth, authorize('employee'), upload.single('image'), async (req, res, next) => {
        if (!req.file)
            return next(new Error('Please upload an image'))
        const template = await Template.findOne({ _id: req.params.id, establishmentId: req.user.establishmentId })
        if (!template) return res.status(404).send()
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        template.image = buffer
        await template.save()
        res.send()
    }, (error, req, res, next) => {
        return res.status(400).send({ messages: error.message })
    })

    .delete(auth, authorize('employee'), async (req, res) => {
        const template = await Template.findOne({ _id: req.params.id, establishmentId: req.user.establishmentId })
        template.image = undefined
        await template.save()
        res.send()
    })

    .get(auth, authorize('employee'), async (req, res, next) => {
        try {
            const template = await Template.findOne({ _id: req.params.id, establishmentId: req.user.establishmentId })
            if (!template || !template.image)
                res.status(404).send()
            res.set('Content-Type', 'image/png')
            res.send(template.image)
        } catch (err) {
            next(err)
        }
    })

module.exports = templateRouter