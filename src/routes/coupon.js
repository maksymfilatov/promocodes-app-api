const { Router } = require('express')
const auth = require('../middleware/auth')
const authorize = require('../middleware/authorize')
const Coupon = require('../models/coupon')
const Template = require('../models/template')

const couponRouter = new Router()

couponRouter.route('/')
    .post(auth, authorize('employee'), async (req, res, next) => {
        try {
            const template = await Template.findById(req.body.template)
            if (!template || !template.establishment.equals(req.user.establishment)) return res.status(404).send()
            const coupon = new Coupon(req.body)
            await coupon.save()
            res.status(201).send(coupon)
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
            let coupons = await Coupon.find({ user: req.user._id }, null, {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }).populate('template')

            // Delete all expired coupons
            const currTime = new Date()
            let prom = []
            coupons = coupons.filter(coupon => {
                const diff = (currTime.getTime() - coupon.createdAt.getTime()) / (1000 * 3600 * 24)
                if (diff >= coupon.expiration) {
                    prom.push(coupon.remove())
                    return false
                }
                return true
            })
            await Promise.all(prom)

            res.send(coupons)
        } catch (err) {
            next(err)
        }
    })



couponRouter.route('/:id')
    .delete(auth, authorize(['client', 'employee']), async (req, res, next) => {
        try {
            let coupon
            if (req.user.role === 'client') {
                coupon = await Coupon.findOneAndDelete({ _id: req.params.id, user: req.user._id })
                if (!coupon) return res.status(404).send()
            } else if (req.user.role === 'employee') {
                coupon = await Coupon.findById(req.params.id).populate('template')
                if (!coupon || !coupon.template.establishment.equals(req.user.establishment)) return res.status(404).send()
                await coupon.remove()
            }
            res.send(coupon)
        } catch (err) {
            next(err)
        }
    })
    .patch(auth, authorize('client'), async (req, res, next) => {
        try {
            if (Object.keys(req.body).length != 1 || !req.body.user)
                throw new Error()
            const coupon = await Coupon.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { user: req.body.user }, { new: true })
            if (!coupon) return res.status(404).send()
            res.send(coupon)
        } catch (err) {
            res.status(400).send()
        }
    })

module.exports = couponRouter