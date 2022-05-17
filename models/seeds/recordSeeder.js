const mongoose = require('mongoose')
const Record = require('../record')
const recordData = require('./recordData.json').results
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on('error', () => {
  console.log('mongodb error!')
})
db.once('open', () => {
  Record.create(recordData)
  .then(() => {
    console.log('recordSeeder created!')
    process.exit()
  })
})