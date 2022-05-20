const bcrypt = require('bcryptjs')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const Record = require('../record')
const recordData = require('./recordData.json').results
const Category = require('../category')
const User = require('../user')
const SEED_USER = require('./userData.json').results
const db = require('../../config/mongoose')

db.once('open', () => {
  Promise.all(Array.from(SEED_USER, (seedUser) => {
    return bcrypt.genSalt(10)
      .then(salt => bcrypt.hash(seedUser.password, salt))
      .then(hash => {
        return User.create({
          name: seedUser.name,
          email: seedUser.email,
          password: hash
        })
      })
      .then(user => {
        const userId = user._id
        return Promise.all(Array.from(recordData, (record) => {
          return Category.findOne({ name: record.category })
            .lean()
            .then(category => {
              record.categoryId = category._id
              record.userId = userId
              return Record.create(record)
            })
        }))
      })
  }))
    .then(() => {
      console.log('"消費紀錄"的種子資料載入完畢')
      process.exit()
    })
    .catch(err => console.log(err))
})