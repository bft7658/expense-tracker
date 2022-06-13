const express = require('express')
const router = express.Router()

const Record = require('../../models/record')
const Category = require('../../models/category')
const dayjs = require('dayjs')

router.get('/', (req, res) => {
  const userId = req.user._id
  Category.find()
    .lean()
    .then(categories => {
      return Record.find({ userId })
        .populate('categoryId')
        .lean()
        .sort({ date: 'desc' })
        .then(records => {
          let totalAmount = 0
          records.forEach(record => {
            totalAmount += record.amount
            record.date = dayjs(record.date).format('YYYY-MM-DD')
          })
          res.render('index', { records, categories, totalAmount })
        })
        .catch(err => console.error(err))
    })
})

// 篩選資料
router.get('/filter', async (req, res) => {
  const userId = req.user._id
  const sort = req.query.sort
  const categorySelected = req.query.category || ''
  try {
    const categories = await Category.find().lean()
    const searchKey = {
      userId
    }
    if (categorySelected) searchKey.categoryId = categorySelected
    const records = await Record.find(searchKey)
      .populate('categoryId')
      .sort(JSON.parse(sort))
      .lean()

    let totalAmount = 0
    records.forEach(record => {
      totalAmount += record.amount
      record.date = dayjs(record.date).format('YYYY-MM-DD')
    })
    res.render('index', { records, sort, categories, totalAmount, categorySelected })
  } catch (error) {
    return console.log(error)
  }
})

module.exports = router