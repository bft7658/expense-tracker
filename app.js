const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const Record = require('./models/record')
const Category = require('./models/category')
const dayjs = require('dayjs')

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

app.get('/', (req, res) => {
  Record.find()
    .populate('categoryId')
    .lean()
    .then(records => {
      records.forEach(record => {
        record.date = dayjs(record.date).format('YYYY-MM-DD')
      })
      res.render('index', { records })
    })
    .catch(err => console.error(err))
})

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`)
})