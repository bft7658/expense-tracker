const Record = require('../record')
const recordData = require('./recordData.json').results
const Category = require('../category')
const db = require('../../config/mongoose')

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
      console.log('"消費紀錄"的種子資料載入完畢')
      process.exit()
    })
    .catch(err => console.log(err))
})