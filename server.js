var http = require("http")
var express = require("express")
var fs = require("fs")
var app = express()
const PORT = 3000
var path = require("path")
var bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: true }))


//routing dla "/"
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + `/static/test/loader_test/test.html`))
});

//routing automatyczny
app.use(express.static("/"))

//nasłuch na określonym porcie
app.listen(PORT, function () {
    console.log(`server started on port: ${PORT}`)
})