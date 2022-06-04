const express = require('express')
const router = express.Router()

const Record = require('../../models/record')
const Category = require('../../models/category')
const dayjs = require('dayjs')

// 瀏覽新增頁面
router.get('/new', (req, res) => {
  Category.find()
    .lean()
    .sort({ _id: 'asc' })
    .then(categories => {
      res.render('new', { categories })
    })
    .catch(err => console.log(err))
})

// 送出新增資料
router.post('/', (req, res) => {
  req.body.userId = req.user._id
  return Record.create(req.body)
    .then(() => res.redirect('/'))
    .catch(err => console.log(err))
})

// 進入編輯頁面
router.get('/:id/edit', (req, res) => {
  const userId = req.user._id
  const _id = req.params.id
  return Record.findOne({ _id, userId })
    .populate('categoryId')
    .lean()
    .then(record => {
      record.date = dayjs(record.date).format('YYYY-MM-DD')
      // 從 Category 拿出資料時，剔除掉 record 本身已經附加的類別，才不會出現兩個同樣的類別
      Category.find({ _id: { $ne: record.categoryId } })
        .lean()
        .then(categories => {
          res.render('edit', { record, categories })
        })
    })
    .catch(err => console.log(err))
})

// 送出編輯資料
router.put('/:id', (req, res) => {
  const userId = req.user._id
  const _id = req.params.id
  return Record.findOneAndUpdate({ _id, userId }, req.body)
    .then(() => res.redirect('/'))
    .catch(err => console.log(err))
})

// 刪除資料
router.delete('/:id', (req, res) => {
  const userId = req.user._id
  const _id = req.params.id
  return Record.findOneAndRemove({ _id, userId })
    .then(() => res.redirect('/'))
    .catch(err => console.log(err))
})

// 篩選資料
router.get('/', (req, res) => {
  const userId = req.user._id
  const { categoryOption, sort } = req.query
  if (categoryOption) {
    Category.find({ _id: { $ne: categoryOption } })
      .lean()
      .then(otherCategory => {
        Category.findById(categoryOption)
          .lean()
          .then(selectedCategory => {
            return Record.find({ userId, categoryId: categoryOption })
              .populate('categoryId')
              .lean()
              .sort(JSON.parse(sort))
              .then(records => {
                let totalAmount = 0
                records.forEach(record => {
                  totalAmount += record.amount
                  record.date = dayjs(record.date).format('YYYY-MM-DD')
                })
                res.render('index', { records, totalAmount, sort, selectedCategory, otherCategory })
              })
              .catch(error => console.log(error))
          })
      })
  } else {
    Category.find()
      .lean()
      .then(categories => {
        Record.find({ userId })
          .populate('categoryId')
          .lean()
          .sort(JSON.parse(sort))
          .then(records => {
            let totalAmount = 0
            records.forEach(record => {
              totalAmount += record.amount
              record.date = dayjs(record.date).format('YYYY-MM-DD')
            })
            res.render('index', { records, sort, categories, totalAmount })
          })
          .catch(error => console.log(error))
      })
  }
})

module.exports = router