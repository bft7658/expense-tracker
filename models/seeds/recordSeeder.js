const mongoose = require('mongoose')
const Record = require('../record')
const recordData = require('./recordData.json').results
const Category = require('../category')
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on('error', () => {
  console.log('mongodb error!')
})
db.once('open', async () => {
  Promise.all(Array.from(recordData, (record) => {
    return Category.findOne({ name: record.category })
      .lean()
      .then(category => {
        record.categoryId = category._id
        return Record.create(record)
      })
  }))
    .then(() => {
      console.log('種子資料 載入結束')
      process.exit()
    })
    .catch(err => console.log(err))
})