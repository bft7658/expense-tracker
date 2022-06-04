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

module.exports = router