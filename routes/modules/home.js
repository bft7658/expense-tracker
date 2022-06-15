const express = require('express')
const router = express.Router()

const Record = require('../../models/record')
const Category = require('../../models/category')
const dayjs = require('dayjs')

router.get('/', async (req, res) => {
  const userId = req.user._id
  try {
    const categories = await Category.find().sort({ _id: 'asc' }).lean()
    const records = await Record.find({ userId }).populate('categoryId').sort({ date: 'desc' }).lean()

    let totalAmount = 0
    records.forEach(record => {
      totalAmount += record.amount
      record.date = dayjs(record.date).format('YYYY-MM-DD')
    })
    res.render('index', { records, categories, totalAmount })
  } catch (error) {
    return console.log(error)
  }
})

// 篩選資料
router.get('/filter', async (req, res) => {
  const userId = req.user._id
  const sort = req.query.sort
  const categorySelected = req.query.category || ''
  const monthSelected = req.query.month
  try {
    const categories = await Category.find().sort({ _id: 'asc' }).lean()
    const filterQuery = {
      userId,
      date: { $regex: monthSelected }
    }
    if (categorySelected) filterQuery.categoryId = categorySelected
    const records = await Record.find(filterQuery)
      .populate('categoryId')
      .sort(JSON.parse(sort))
      .lean()

    let totalAmount = 0
    records.forEach(record => {
      totalAmount += record.amount
      record.date = dayjs(record.date).format('YYYY-MM-DD')
    })
    res.render('index', { records, sort, categories, totalAmount, categorySelected, monthSelected })
  } catch (error) {
    return console.log(error)
  }
})

module.exports = router