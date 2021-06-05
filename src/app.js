require('./db/mongoose')
const express = require('express')
const establishmentRouter = require('./routes/establishment')
const couponRouter = require('./routes/coupon')
const templateRouter = require('./routes/template')
const userRouter = require('./routes/user')
const errMiddleware = require('./middleware/errMiddleware')

const app = express()

app.use(express.json())
app.use('/users', userRouter)
app.use('/establishments', establishmentRouter)
app.use('/templates', templateRouter)
app.use('/coupons', couponRouter)
app.use(errMiddleware)

module.exports = app

