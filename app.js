const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const Record = require('./models/record')
const Category = require('./models/category')
const dayjs = require('dayjs')
const bodyParser = require('body-parser')

const app = express()
const port = 3000

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
// 取得資料庫連線狀態
const db = mongoose.connection
db.on('error', () => {
  console.log('mongodb error!')
})
db.once('open', () => {
  console.log('mongodb connected!')
})

app.engine('handlebars', exphbs({ default: 'main'}))
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  Record.find()
    .populate('categoryId')
    .lean()
    .sort({ date: 'desc' })
    .then(records => {
      records.forEach(record => {
        record.date = dayjs(record.date).format('YYYY-MM-DD')
      })
      res.render('index', { records })
    })
    .catch(err => console.error(err))
})

app.get('/records/new', (req, res) => {
  Category.find()
    .lean()
    .sort({ _id: 'asc' })
    .then(categories => {
      res.render('new', { categories })
    })
    .catch(err => console.log(err))
})

app.post('/records', (req, res) => {
  return Record.create(req.body)
    .then(() => res.redirect('/'))
    .catch(err => console.log(err))
})

app.get('/records/:id/edit', (req, res) => {
  const id = req.params.id
  return Record.findById(id)
    .populate('categoryId')
    .lean()
    .then(record => {
      record.date = dayjs(record.date).format('YYYY-MM-DD')
      // 從 Category 拿出資料時，剔除掉 record 本身已經附加的類別，才不會出現兩個同樣的類別
      Category.find({ _id: { $ne: record.categoryId }})
      .lean()
      .then(category => {
        res.render('edit', { record, category })
      })
    })
    .catch(err => console.log(err))
})

app.post('/records/:id/edit', (req, res) => {
  const id = req.params.id
  const { name, categoryId, date, amount } = req.body
  return Record.findById(id)
    .then(record => {
      record.name = name
      record.categoryId = categoryId
      record.amount = amount
      record.date = date
      record.save()
    })
    .then(() => res.redirect('/'))
    .catch(err => console.log(err))
})

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`)
})