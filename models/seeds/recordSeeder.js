const bcrypt = require('bcryptjs')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const Record = require('../record')
const recordData = require('./recordData.json').results
const Category = require('../category')
const User = require('../user')
const userData = require('./userData.json').results
const db = require('../../config/mongoose')

// 參考別人的方法
db.once('open', async () => {
  // 先將 record 與 category 做關聯
  const categoryData = await Category.find().select('name').lean()
  recordData.forEach(record => {
    record.categoryId = categoryData.find(category => record.category === category.name)._id
  })

  // 再把 record 與 user 做關聯
  Promise.all(Array.from(userData, async (user) => {
    const { name, email, password } = user
    const hash = await bcrypt.genSalt(10).then(salt => bcrypt.hash(password, salt))
    const userId = await User.create({ name, email, password: hash }).then(user => user._id)
    recordData.forEach(record => record.userId = userId)
    await Record.create(recordData)
  }))
    .then(() => {
      console.log('"消費紀錄"的種子資料載入完畢')
      process.exit()
    })
})

// 自己原本的作法，還沒優化出來
// db.once('open', () => {
//   // 先讓 record 跟 category 做關聯
//   Promise.all(Array.from(recordData, record => {
//     return Category.findOne({ name: record.category })
//       .lean()
//       .then(category => {
//         record.categoryId = category._id
//         return Record.create(record)
//       })
//   }))
//   return Promise.all(Array.from(userData, seedUser => {
//     const { name, email, password } = seedUser
//     return bcrypt.genSalt(10)
//       .then(salt => bcrypt.hash(password, salt))
//       .then(hash => {
//         return User.create({
//           name,
//           email,
//           password: hash
//         })
//           .then(user => {
//             const userId = user._id
//             Promise.all(Array.from(recordData, record => {
//               record.userId = userId
//               return Record.create(record)
//             }))
//           })
//       })
//   }))
//     .then(() => {
//       console.log('"消費紀錄"的種子資料載入完畢')
//       process.exit()
//     })
//     .catch(err => console.log(err))
// })