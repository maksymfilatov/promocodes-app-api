require('./db/mongoose')
const express = require('express')
const establishmentRouter = require('./routes/establishment')
const promotionRouter = require('./routes/promotion')
const templateRouter = require('./routes/template')
const userRouter = require('./routes/user')
const errorHandler = require('./middleware/errorHandler')

const app = express()

app.use(express.json())
app.use('/users', userRouter)
app.use('/establishments', establishmentRouter)
app.use('/templates', templateRouter)
app.use('/promotions', promotionRouter)
app.use(errorHandler)

module.exports = app

