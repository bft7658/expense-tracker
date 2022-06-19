const Category = require('../category')
const categoryData = require('./categoryData.json').results
const db = require('../../config/mongoose')

db.once('open', async () => {
  await Category.create(categoryData)
  
  console.log('"消費類別"的種子資料載入完畢')
  process.exit()
})