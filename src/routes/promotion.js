const { Router } = require('express')
const auth = require('../middleware/auth')
const authorize = require('../middleware/authorize')
const Promotion = require('../models/promotion')
const Template = require('../models/template')

const promotionRouter = new Router()

promotionRouter.route('/')
    .post(auth, authorize('employee'), async (req, res, next) => {
        try {
            const template = await Template.findById(req.body.template)
            if (!template || !template.establishment.equals(req.user.establishment)) return res.status(404).send()
            const promotion = new Promotion(req.body)
            await promotion.save()
            res.status(201).send(promotion)
        } catch (err) {
            next(err)
        }
    })
    .get(auth, authorize('client'), async (req, res, next) => {
        const sort = {}

        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        }

        try {
            let promotions = await Promotion.find({ user: req.user._id }, null, {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }).populate('template')

            // Delete all expired promotions
            const currTime = new Date()
            let prom = []
            promotions = promotions.filter(promotion => {
                const diff = (currTime.getTime() - promotion.createdAt.getTime()) / (1000 * 3600 * 24)
                if (diff >= promotion.expiration) {
                    prom.push(promotion.remove())
                    return false
                }
                return true
            })
            await Promise.all(prom)

            res.send(promotions)
        } catch (err) {
            next(err)
        }
    })



promotionRouter.route('/:id')
    .delete(auth, authorize(['client', 'employee']), async (req, res, next) => {
        try {
            let promotion
            if (req.user.role === 'client') {
                promotion = await Promotion.findOneAndDelete({ _id: req.params.id, user: req.user._id })
                if (!promotion) return res.status(404).send()
            } else if (req.user.role === 'employee') {
                promotion = await Promotion.findById(req.params.id).populate('template')
                if (!promotion || !promotion.template.establishment.equals(req.user.establishment)) return res.status(404).send()
                await promotion.remove()
            }
            res.send(promotion)
        } catch (err) {
            next(err)
        }
    })
    .patch(auth, authorize('client'), async (req, res, next) => {
        try {
            if (Object.keys(req.body).length != 1 || !req.body.user)
                throw new Error()
            const promotion = await Promotion.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { user: req.body.user }, { new: true })
            if (!promotion) return res.status(404).send()
            res.send(promotion)
        } catch (err) {
            res.status(400).send()
        }
    })

module.exports = promotionRouter