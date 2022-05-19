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
  return Record.create(req.body)
    .then(() => res.redirect('/'))
    .catch(err => console.log(err))
})

// 進入編輯頁面
router.get('/:id/edit', (req, res) => {
  const id = req.params.id
  return Record.findById(id)
    .populate('categoryId')
    .lean()
    .then(record => {
      record.date = dayjs(record.date).format('YYYY-MM-DD')
      // 從 Category 拿出資料時，剔除掉 record 本身已經附加的類別，才不會出現兩個同樣的類別
      Category.find({ _id: { $ne: record.categoryId } })
        .lean()
        .then(category => {
          res.render('edit', { record, category })
        })
    })
    .catch(err => console.log(err))
})

// 送出編輯資料
router.put('/:id', (req, res) => {
  const id = req.params.id
  return Record.findByIdAndUpdate(id, req.body)
    .then(() => res.redirect('/'))
    .catch(err => console.log(err))
})

// 刪除資料
router.delete('/:id', (req, res) => {
  const id = req.params.id
  return Record.findById(id)
    .then(record => record.remove())
    .then(() => res.redirect('/'))
    .catch(err => console.log(err))
})

module.exports = router