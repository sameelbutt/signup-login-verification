let express = require('express')
let app = express()

let userrout = require('./routers/userrout')


app.use(express.json())


app.use('/api/v1/auth', userrout)

module.exports = app;