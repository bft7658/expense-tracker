const mongoose = require('mongoose')
const Category = require('../category')
const categoryData = require('./categoryData.json').results
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on('error', () => {
  console.log('mongodb error!')
})
db.once('open', () => {
  Category.find()
    .then(categories => {
      if (categories.length) {
        console.log('已載入過"類別"了。')
        process.exit()
      }
      return Promise.all(Array.from(categoryData, item => {
        return Category.create({ name: item.name, icon: item.icon })
      }))
    })
    .then(() => {
      console.log('"類別"的種子資料載入完畢')
      process.exit()
    })
    .catch(err => console.log(err))
})