const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const result = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: result._id, tokens: token })
        if (!user)
            throw new Error()
        req.user = user
        req.token = token
        next()
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth