const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

var db, collection;
const dbName = "fitness";
const url=`mongodb+srv://marshatiisa:ZjTYmNmnQQtcz5@cluster0.8gmpf0f.mongodb.net/${dbName}?retryWrites=true&w=majority`;

app.listen(3010, () => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
    db.collection('info').find().toArray((err, results) => {

      res.render('index.ejs', {messages: result, info:results})
    })
  })
})

app.post('/messages', (req, res) => {
  db.collection('messages').insertOne({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})

//keeping bc it was working for profilepic feature. couldn't get pic to display
// app.get('/', (req, res) => {
//   db.collection('messages').find().toArray((err, result) => {
//     if (err) return console.log(err)
//     db.collection('picture').find().limit(1).next((err, pic)=>{
//       console.log(`found ${JSON.stringify(pic)}`)
//       res.render('index.ejs', {messages: result, pic:pic.img})
//     })
//   })
// })
//for info
app.post('/info', (req, res) => {
  db.collection('info').insertOne({sex: req.body.sex, height: req.body.height, weight: req.body.weight}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})


// app.get('/', (req, res) => {
//   db.collection('info').find().toArray((err, results) => {
//     if (err) return console.log(err)
//       res.render('index.ejs', {info: results})
//   })
// })


//for photo
// app.post('/profilepic', (req, res) => {
//   console.log(`req.body.filename=${req.body.filename}`)
//   db.collection('picture').insertOne({img: req.body.filename}, (err, result) => {
//     if (err) return console.log(err)
//     console.log('saved pic to database')
//     res.redirect('/')
//   })
// })

app.put('/messages', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp + 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.delete('/messages', (req, res) => {
  db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})
