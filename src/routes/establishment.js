const { Router } = require('express')
const Establishment = require('../models/establishment')

const establishmentRouter = new Router()

establishmentRouter.route('/')
    .post(async (req, res, next) => {
        try {
            const establishment = new Establishment(req.body)
            await establishment.save()
            res.status(201).send(establishment)
        } catch (err) {
            next(err)
        }
    })
    .get(async (req, res, next) => {
        try {
            const establishments = await Establishment.find({}, null, {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip)
            })
            res.send(establishments)
        } catch (err) {
            next(err)
        }
    })
establishmentRouter.route('/:id')
    .delete(async (req, res, next) => {
        try {
            const establishment = await Establishment.findById(req.params.id)
            if (!establishment) return res.status(404).send()
            establishment.remove()
            res.send(establishment)
        } catch (err) {
            next(err)
        }
    })

module.exports = establishmentRouter