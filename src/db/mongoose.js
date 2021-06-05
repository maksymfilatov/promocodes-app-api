const mongoose = require('mongoose')

const url = process.env.MONGODB_URL

mongoose.connect(url, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useNewUrlParser: true
})