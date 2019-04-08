// #region initial
var http = require("http")
var express = require("express")
var fs = require("fs")
var app = express()
const PORT = 3000
var path = require("path")
var bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: true }))
var Datastore = require('nedb')
// #endregion initial

var ServerDB = {
    databases: [],
}

//routing dla "/"
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + `/static/pages/main_page/main.html`))
});

//routing automatyczny
app.use(express.static("."))

// #region ajax
app.post("/database_create", function (req, res) { // create database in array and return index
    let data = req.body
    console.log("/database_create: ", data)

    let i = ServerDB.databases.findIndex(entry => entry.filename == data.filename)
    if (i != -1) { // already exists
        res.send({ msg: "OK", id: i });
    }
    else {
        let db = new Datastore({
            filename: path.join(__dirname + `/static/database/${data.filename}`),
            autoload: true
        });

        ServerDB.databases.push({
            db: db,
            filename: data.filename
        })
        let index = ServerDB.databases.length - 1
        res.send({ msg: "OK", id: index });
    }
})

app.post("/database_insert", function (req, res) {
    let data = req.body
    console.log("/database_insert: ", data)

    let db = ServerDB.databases[data.id].db

    db.insert(data.entry, function (err, entry) {
        console.log("entry added")
        console.log(entry)
        res.send({ msg: "OK" });
    });
})

app.post("/database_findOne", function (req, res) {
    let data = req.body
    console.log("/database_findOne: ", data)

    let db = ServerDB.databases[data.id].db

    db.findOne(data.match, function (err, entry) {
        console.log("entry found")
        console.log(entry)
        res.send({ msg: "OK", entry: entry });
    });
})

app.post("/database_find", function (req, res) {
    let data = req.body
    console.log("/database_find: ", data)

    let db = ServerDB.databases[data.id].db

    db.find(data.match, function (err, entries) {
        console.log("entries found")
        console.log(entries)
        res.send({ msg: "OK", entries: entries });
    });
})

app.post("/database_count", function (req, res) {
    let data = req.body
    console.log("/database_count: ", data)

    let db = ServerDB.databases[data.id].db

    db.count(data.match, function (err, count) {
        console.log(`${count} entries found`)
        res.send({ msg: "OK", count: count });
    });
})
// #endregion ajax

//nasłuch na określonym porcie
app.listen(PORT, function () {
    console.log(`server started on port: ${PORT}`)
})