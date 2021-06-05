const { Router } = require('express')
const User = require('../models/user')
const Establishment = require('../models/establishment')
const auth = require('../middleware/auth')

const userRouter = new Router()

userRouter.post('/client', async (req, res, next) => {
    try {
        const user = new User(req.body)
        const token = await user.generateAccessToken()
        res.status(201).send({ user, token })
    } catch (err) {
        next(err)
    }
})

userRouter.post('/employee', async (req, res, next) => {
    try {
        const establishment = await Establishment.findOne({ name: req.body.establishmentName })
        if (!establishment) return res.status(404).send()
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: 'employee',
            establishmentId: establishment._id
        })
        await user.save()
        const token = await user.generateAccessToken()
        res.status(201).send({ user, token })
    } catch (err) {
        next(err)
    }
})

userRouter.post('/login', async (req, res, next) => {
    try {
        const user = await User.authenticateByCredentials(req.body.email, req.body.password)
        const token = await user.generateAccessToken()
        res.send({ user, token })
    } catch (err) {
        res.status(400).send({ messages: err.message })
    }
})

userRouter.post('/logout', auth, async (req, res, next) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token !== req.token)
        await req.user.save()
        res.send()
    } catch (err) {
        next(err)
    }
})

userRouter.post('/logoutAll', auth, async (req, res, next) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (err) {
        next(err)
    }
})

userRouter.route('/me')
    .get(auth, async (req, res) => {
        res.send(req.user)
    })
    .patch(auth, async (req, res, next) => {
        const fields = Object.keys(req.body)
        const allowedFields = ['name', 'email', 'password']
        const isUpdateAllowed = fields.every(update => allowedFields.includes(update))
        if (!isUpdateAllowed)
            return res.status(400).send({ messages: 'Ivalid updates!' })

        try {
            fields.forEach(update => req.user[update] = req.body[update])
            await req.user.save()
            res.send(req.user)
        } catch (err) {
            next(err)
        }
    })
    .delete(auth, async (req, res, next) => {
        try {
            await req.user.remove()
            res.send(req.user)
        } catch (err) {
            next(err)
        }
    })

module.exports = userRouter