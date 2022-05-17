const mongoose = require('mongoose')
const Category = require('../category')
const categoryData = require('./categoryData.json').results
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on('error', () => {
  console.log('mongodb error!')
})
db.once('open', () => {
  Category.create(categoryData)
  .then(() => {
    console.log('categorySeeder created!')
    process.exit()
  })
})