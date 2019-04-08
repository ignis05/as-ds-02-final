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
// #endregion ajax

//nasłuch na określonym porcie
app.listen(PORT, function () {
    console.log(`server started on port: ${PORT}`)
})