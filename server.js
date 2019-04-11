// #region initial
var http = require("http")
var express = require("express")
var fs = require("fs")
var app = express()
const PORT = 3000
var path = require("path")
var bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({
    extended: true
}))
var Datastore = require('nedb')
var cookieParser = require("cookie-parser")
app.use(cookieParser())
var pathfinder = require('pathfinding')
// #endregion initial

var ServerDB = {
    databases: [],
}
var grid = null
var finder = new pathfinder.AStarFinder()
var test_LoadedMap = {
    "size": "4",
    "level": [{
        "id": 0,
        "x": 0,
        "z": 0,
        "type": "dirt",
        "height": 7
    }, {
        "id": 1,
        "x": 0,
        "z": 1,
        "type": "rock",
        "height": "7"
    }, {
        "id": 2,
        "x": 0,
        "z": 2,
        "type": "dirt",
        "height": 5
    }, {
        "id": 3,
        "x": 0,
        "z": 3,
        "type": "dirt",
        "height": 7
    }, {
        "id": 4,
        "x": 1,
        "z": 0,
        "type": "dirt",
        "height": 5
    }, {
        "id": 5,
        "x": 1,
        "z": 1,
        "type": "dirt",
        "height": "5"
    }, {
        "id": 6,
        "x": 1,
        "z": 2,
        "type": "dirt",
        "height": 5
    }, {
        "id": 7,
        "x": 1,
        "z": 3,
        "type": "dirt",
        "height": 5
    }, {
        "id": 8,
        "x": 2,
        "z": 0,
        "type": "dirt",
        "height": 5
    }, {
        "id": 9,
        "x": 2,
        "z": 1,
        "type": "rock",
        "height": "5"
    }, {
        "id": 10,
        "x": 2,
        "z": 2,
        "type": "dirt",
        "height": 5
    }, {
        "id": 11,
        "x": 2,
        "z": 3,
        "type": "dirt",
        "height": 5
    }, {
        "id": 12,
        "x": 3,
        "z": 0,
        "type": "dirt",
        "height": 5
    }, {
        "id": 13,
        "x": 3,
        "z": 1,
        "type": "rock",
        "height": "5"
    }, {
        "id": 14,
        "x": 3,
        "z": 2,
        "type": "rock",
        "height": "5"
    }, {
        "id": 15,
        "x": 3,
        "z": 3,
        "type": "rock",
        "height": "5"
    }]
}

function test_GridMatrixCreate(size, map) {
    let gridMatrix = []
    let y = -1
    for (var cell in map) {
        if (cell % size == 0) {
            gridMatrix.push([])
            y++
        }
        switch (map[cell].type) {
            case "dirt":
            gridMatrix[y].push(0)
                break

            case "rock":
            gridMatrix[y].push(1)
                break
        }
        
    }
    return new pathfinder.Grid(gridMatrix)
}

var grid = test_GridMatrixCreate(test_LoadedMap.size, test_LoadedMap.level)


// #region static routing
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + `/static/pages/menu-main/main.html`))
})
app.get("/editor", function (req, res) {
    res.sendFile(path.join(__dirname + `/static/pages/editor/main.html`))
})
// #endregion

//routing automatyczny
app.use(express.static("."))

// #region ajax - database
app.post("/database_create", function (req, res) { // create database in array and return index
    let data = req.body
    console.log("/database_create: ", data)

    let i = ServerDB.databases.findIndex(entry => entry.filename == data.filename)
    if (i != -1) { // already exists
        res.send({
            msg: "OK",
            id: i
        });
    } else {
        let db = new Datastore({
            filename: path.join(__dirname + `/static/database/${data.filename}`),
            autoload: true
        });

        ServerDB.databases.push({
            db: db,
            filename: data.filename
        })
        let index = ServerDB.databases.length - 1
        res.send({
            msg: "OK",
            id: index
        });
    }
})

app.post("/database_insert", function (req, res) {
    let data = req.body
    console.log("/database_insert: ", data)

    let db = ServerDB.databases[data.id].db

    db.insert(data.entry, function (err, entry) {
        console.log("entry added")
        console.log(entry)
        res.send({
            msg: "OK"
        });
    });
})

app.post("/database_findOne", function (req, res) {
    let data = req.body
    console.log("/database_findOne: ", data)

    let db = ServerDB.databases[data.id].db

    db.findOne(data.match, function (err, entry) {
        console.log("entry found")
        console.log(entry)
        res.send({
            msg: "OK",
            entry: entry
        });
    });
})

app.post("/database_find", function (req, res) {
    let data = req.body
    console.log("/database_find: ", data)

    let db = ServerDB.databases[data.id].db

    db.find(data.match, function (err, entries) {
        console.log("entries found")
        console.log(entries)
        res.send({
            msg: "OK",
            entries: entries
        });
    });
})

app.post("/database_count", function (req, res) {
    let data = req.body
    console.log("/database_count: ", data)

    let db = ServerDB.databases[data.id].db

    db.count(data.match, function (err, count) {
        console.log(`${count} entries found`)
        res.send({
            msg: "OK",
            count: count
        });
    });
})

app.post("/database_remove", function (req, res) {
    let data = req.body
    console.log("/database_remove: ", data)
    if (!data.match) data.match = {}
    if (!data.params) data.params = {}

    let db = ServerDB.databases[data.id].db

    db.remove(data.match, data.params, function (err, count) {
        console.log(`removed ${count} entries`)
        res.send({
            msg: "OK",
            count: count
        });
    });
})

app.post("/database_update", function (req, res) {
    let data = req.body
    console.log("/database_update: ", data)
    if (!data.params) data.params = {}

    let db = ServerDB.databases[data.id].db

    db.update(data.match, {
        $set: data.entry
    }, {}, function (err, count) {
        console.log("updated " + count)
        res.send({
            msg: "OK",
            count: count
        });
    });
})
// #endregion ajax - database

// #region ajax - token
app.post("/token", function (req, res) {
    getToken(req, res)
    res.send({
        msg: "OK"
    })
})

function getToken(req, res) {
    let cookies = req.cookies
    // console.log(cookies);
    let token = (cookies["token"] ? cookies["token"] : Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10))
    let time = 1000 * 60 * 60 * 8 // 8h
    res.cookie("token", token, {
        expires: new Date(Date.now() + time),
        httpOnly: true
    })
    console.log("token:", token);
    return token
}
// #endregion ajax - token

// #region ajax - Net.js requests
app.post("/getTestPages", function (req, res) {
    let dirs = fs.readdirSync(path.join(__dirname + "/static/pages/test/")).map(name => path.join(__dirname + "/static/pages/test/" + name)).filter(that => fs.lstatSync(that).isDirectory()).map(path => path.split("\\")[path.split("\\").length - 1])
    console.log(dirs);
    let testPages = []
    dirs.forEach(dir => {
        let file = fs.readdirSync(path.join(__dirname + "/static/pages/test/" + dir)).find(filename => filename.endsWith(".html"))
        let dirpath = `/static/pages/test/${dir}/${file}`
        let temp = dir.split("_").map(x => x.charAt(0).toUpperCase() + x.slice(1))
        let name = temp.pop() + " " + temp.join(" ")
        let obj = {
            name: name,
            path: dirpath
        }
        testPages.push(obj)
    })
    res.send({
        msg: "OK",
        testPages: testPages
    })
})

app.post("/sendClickedPoint", function (req, res) {
    let data = req.body
    let temp_grid = grid.clone() //after finding path pathfinder modifies grid, so backup bois    
    let path = finder.findPath(data.click.x, data.click.z, data.unit.x, data.unit.z, temp_grid)
    console.log(path);
    
    res.send({
        msg: "sendClickedPoint-Sent",
        path: path
    })
})
// #endregion ajax - Net.js requests

//nasłuch na określonym porcie
app.listen(PORT, function () {
    console.log(`server started on port: ${PORT}`)
})