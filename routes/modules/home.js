const express = require('express')
const router = express.Router()

const Record = require('../../models/record')
const dayjs = require('dayjs')

router.get('/', (req, res) => {
  Record.find()
    .populate('categoryId')
    .lean()
    .sort({ date: 'desc' })
    .then(records => {
      let totalAmount = 0
      records.forEach(record => {
        totalAmount += record.amount
        record.date = dayjs(record.date).format('YYYY-MM-DD')
      })
      res.render('index', { records, totalAmount })
    })
    .catch(err => console.error(err))
})

module.exports = router