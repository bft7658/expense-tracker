const bcrypt = require('bcryptjs')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const Record = require('../record')
const recordData = require('./recordData.json').results
const Category = require('../category')
const User = require('../user')
const userData = require('./userData.json').results[0]
const db = require('../../config/mongoose')

db.once('open', async () => {
    // 先將 record 與 category 做關聯
    const categoryData = await Category.find().select('name').lean()
    recordData.forEach(record => {
      record.categoryId = categoryData.find(category => record.category === category.name)._id
    })
    // 再把 record 與 user 做關聯
    const hash = await bcrypt.hash(userData.password, 10)
    const user = await User.create({ name: userData.name, email: userData.email, password: hash })
    const userId = user._id
    recordData.forEach(record => record.userId = userId)
    await Record.create(recordData)

    console.log('"消費紀錄"的種子資料載入完畢')
    process.exit()
})