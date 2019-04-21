// #region initial
var http = require("http")
var express = require("express")
var fs = require("fs")
var app = express()
var server = http.Server(app);
var io = require("socket.io")(server)
const PORT = 3000
var path = require("path")
var bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 1000000
}))
var Datastore = require('nedb')
var cookieParser = require("cookie-parser")
app.use(cookieParser())
var cookie = require('cookie')
var PF = require('pathfinding-customized')
// #endregion initial

var ServerDB = {
    databases: [],
}

var test_LoadedMap = {
    "size": "8",
    "level": [{
        "id": 0,
        "x": 0,
        "z": 0,
        "type": "dirt",
        "height": 5
    }, {
        "id": 1,
        "x": 1,
        "z": 0,
        "type": "dirt",
        "height": 5
    }, {
        "id": 2,
        "x": 2,
        "z": 0,
        "type": "dirt",
        "height": 5
    }, {
        "id": 3,
        "x": 3,
        "z": 0,
        "type": "dirt",
        "height": 5
    }, {
        "id": 4,
        "x": 4,
        "z": 0,
        "type": "dirt",
        "height": 5
    }, {
        "id": 5,
        "x": 5,
        "z": 0,
        "type": "dirt",
        "height": 5
    }, {
        "id": 6,
        "x": 6,
        "z": 0,
        "type": "dirt",
        "height": 5
    }, {
        "id": 7,
        "x": 7,
        "z": 0,
        "type": "dirt",
        "height": 5
    }, {
        "id": 8,
        "x": 0,
        "z": 1,
        "type": "rock",
        "height": 5
    }, {
        "id": 9,
        "x": 1,
        "z": 1,
        "type": "rock",
        "height": 5
    }, {
        "id": 10,
        "x": 2,
        "z": 1,
        "type": "rock",
        "height": 5
    }, {
        "id": 11,
        "x": 3,
        "z": 1,
        "type": "dirt",
        "height": "8"
    }, {
        "id": 12,
        "x": 4,
        "z": 1,
        "type": "dirt",
        "height": "18"
    }, {
        "id": 13,
        "x": 5,
        "z": 1,
        "type": "rock",
        "height": 5
    }, {
        "id": 14,
        "x": 6,
        "z": 1,
        "type": "rock",
        "height": 5
    }, {
        "id": 15,
        "x": 7,
        "z": 1,
        "type": "rock",
        "height": 5
    }, {
        "id": 16,
        "x": 0,
        "z": 2,
        "type": "rock",
        "height": 5
    }, {
        "id": 17,
        "x": 1,
        "z": 2,
        "type": "dirt",
        "height": 5
    }, {
        "id": 18,
        "x": 2,
        "z": 2,
        "type": "rock",
        "height": 5
    }, {
        "id": 19,
        "x": 3,
        "z": 2,
        "type": "dirt",
        "height": "8"
    }, {
        "id": 20,
        "x": 4,
        "z": 2,
        "type": "dirt",
        "height": "13"
    }, {
        "id": 21,
        "x": 5,
        "z": 2,
        "type": "rock",
        "height": 5
    }, {
        "id": 22,
        "x": 6,
        "z": 2,
        "type": "dirt",
        "height": 5
    }, {
        "id": 23,
        "x": 7,
        "z": 2,
        "type": "rock",
        "height": 5
    }, {
        "id": 24,
        "x": 0,
        "z": 3,
        "type": "dirt",
        "height": 5
    }, {
        "id": 25,
        "x": 1,
        "z": 3,
        "type": "rock",
        "height": 5
    }, {
        "id": 26,
        "x": 2,
        "z": 3,
        "type": "rock",
        "height": 5
    }, {
        "id": 27,
        "x": 3,
        "z": 3,
        "type": "dirt",
        "height": "8"
    }, {
        "id": 28,
        "x": 4,
        "z": 3,
        "type": "dirt",
        "height": "18"
    }, {
        "id": 29,
        "x": 5,
        "z": 3,
        "type": "rock",
        "height": 5
    }, {
        "id": 30,
        "x": 6,
        "z": 3,
        "type": "rock",
        "height": 5
    }, {
        "id": 31,
        "x": 7,
        "z": 3,
        "type": "dirt",
        "height": 5
    }, {
        "id": 32,
        "x": 0,
        "z": 4,
        "type": "rock",
        "height": 5
    }, {
        "id": 33,
        "x": 1,
        "z": 4,
        "type": "dirt",
        "height": 5
    }, {
        "id": 34,
        "x": 2,
        "z": 4,
        "type": "rock",
        "height": 5
    }, {
        "id": 35,
        "x": 3,
        "z": 4,
        "type": "dirt",
        "height": "8"
    }, {
        "id": 36,
        "x": 4,
        "z": 4,
        "type": "dirt",
        "height": "18"
    }, {
        "id": 37,
        "x": 5,
        "z": 4,
        "type": "rock",
        "height": 5
    }, {
        "id": 38,
        "x": 6,
        "z": 4,
        "type": "dirt",
        "height": 5
    }, {
        "id": 39,
        "x": 7,
        "z": 4,
        "type": "rock",
        "height": 5
    }, {
        "id": 40,
        "x": 0,
        "z": 5,
        "type": "dirt",
        "height": 5
    }, {
        "id": 41,
        "x": 1,
        "z": 5,
        "type": "rock",
        "height": 5
    }, {
        "id": 42,
        "x": 2,
        "z": 5,
        "type": "rock",
        "height": 5
    }, {
        "id": 43,
        "x": 3,
        "z": 5,
        "type": "dirt",
        "height": "8"
    }, {
        "id": 44,
        "x": 4,
        "z": 5,
        "type": "dirt",
        "height": "4"
    }, {
        "id": 45,
        "x": 5,
        "z": 5,
        "type": "rock",
        "height": 5
    }, {
        "id": 46,
        "x": 6,
        "z": 5,
        "type": "rock",
        "height": 5
    }, {
        "id": 47,
        "x": 7,
        "z": 5,
        "type": "dirt",
        "height": 5
    }, {
        "id": 48,
        "x": 0,
        "z": 6,
        "type": "rock",
        "height": 5
    }, {
        "id": 49,
        "x": 1,
        "z": 6,
        "type": "dirt",
        "height": 5
    }, {
        "id": 50,
        "x": 2,
        "z": 6,
        "type": "rock",
        "height": 5
    }, {
        "id": 51,
        "x": 3,
        "z": 6,
        "type": "dirt",
        "height": "18"
    }, {
        "id": 52,
        "x": 4,
        "z": 6,
        "type": "dirt",
        "height": "4"
    }, {
        "id": 53,
        "x": 5,
        "z": 6,
        "type": "rock",
        "height": 5
    }, {
        "id": 54,
        "x": 6,
        "z": 6,
        "type": "dirt",
        "height": 5
    }, {
        "id": 55,
        "x": 7,
        "z": 6,
        "type": "rock",
        "height": 5
    }, {
        "id": 56,
        "x": 0,
        "z": 7,
        "type": "dirt",
        "height": 5
    }, {
        "id": 57,
        "x": 1,
        "z": 7,
        "type": "rock",
        "height": 5
    }, {
        "id": 58,
        "x": 2,
        "z": 7,
        "type": "rock",
        "height": 5
    }, {
        "id": 59,
        "x": 3,
        "z": 7,
        "type": "dirt",
        "height": "18"
    }, {
        "id": 60,
        "x": 4,
        "z": 7,
        "type": "dirt",
        "height": "4"
    }, {
        "id": 61,
        "x": 5,
        "z": 7,
        "type": "rock",
        "height": 5
    }, {
        "id": 62,
        "x": 6,
        "z": 7,
        "type": "rock",
        "height": 5
    }, {
        "id": 63,
        "x": 7,
        "z": 7,
        "type": "dirt",
        "height": 5
    }]
}

// #region pathfinding
function createMatrix(dbfile) {
    let size = dbfile.size
    let map = dbfile.level
    let matrix = []
    for (var cell in map) {
        if (cell % size == 0) {
            matrix.push([])
        }
        switch (map[cell].type) {
            case "dirt":
                matrix[matrix.length - 1].push([0, parseInt(map[cell].height)])
                break

            case "rock":
                matrix[matrix.length - 1].push([1, parseInt(map[cell].height)])
                break
        }

    }
    console.log("KeK");

    return matrix
}

var grid = new PF.Grid(createMatrix(test_LoadedMap))
var finder = new PF.AStarFinder()
// #endregion pathfinding

// #region static routing
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + `/static/pages/menu-main/main.html`))
})
app.get("/editor", function (req, res) {
    res.sendFile(path.join(__dirname + `/static/pages/editor/main.html`))
})
app.get("/lobby", function (req, res) {
    res.sendFile(path.join(__dirname + `/static/pages/lobby/main.html`))
})
// #endregion static routing

// automatic routing
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
app.post("/getModels", function (req, res) {
    let dirs = fs.readdirSync(path.join(__dirname + "/static/res/models/")).map(name => path.join(__dirname + "/static/res/models/" + name)).filter(that => fs.lstatSync(that).isDirectory()).map(path => path.split("\\")[path.split("\\").length - 1])
    console.log(dirs);
    let models = []
    dirs.forEach(dir => {
        let file = fs.readdirSync(path.join(__dirname + "/static/res/models/" + dir)).find(filename => filename.endsWith(".fbx") || filename.endsWith(".gltf"))
        let dirpath = `${dir}/${file}`
        // let temp = dir.split("_").map(x => x.charAt(0).toUpperCase() + x.slice(1))
        let name = dir //temp.pop() + " " + temp.join(" ")
        let obj = {
            name: name,
            path: dirpath
        }
        models.push(obj)
    })
    res.send({
        msg: "OK",
        models: models
    })
})

app.post("/sendClickedPoint", function (req, res) {
    let data = req.body
    let temp_grid = grid.clone() //after finding path pathfinder modifies grid, so backup bois    
    let path = finder.findPath(data.unit.x, data.unit.z, data.click.x, data.click.z, temp_grid)
    console.log(path);

    res.send({
        msg: "sendClickedPoint-Sent",
        path: path
    })
})
// #endregion ajax - Net.js requests

// #region socket.io - test
const io_test = io.of("/socket.io_test") // create separate socket instance

io_test.on('connect', socket => { // listen for connection on '/socket.io_test' instance, and bind events to connected client

    console.log(`user ${socket.id} connected`); // logs client's unique id, can be used for direct communication
    io_test.emit('msg', `user ${socket.id} connected to socket`); // emit event 'msg' to all clients in '/socket.io_test' instance

    // listen for disconnect
    socket.on('disconnect', socket => {
        io_test.emit('msg', `user ${socket.id} disconnected from socket`); // emit event 'msg' to all clients in '/socket.io_test' instance
    })


    // ----- listen for custom events emitted by client -----

    // on event 'msg' log data
    socket.on('msg', msg => {
        console.log(`${socket.id} ---> ${msg}`);
    })

    // forward msg to clients in room
    socket.on('toRoom', (room, msg) => {
        socket.to(room).emit('msg', msg) // broadscast to all clients in room *except self*
        // --- or ---
        // io_test.to(room).emit('msg', msg) // broadscast to all clients in room
    })

    // forward msg to specific client using his id
    socket.on('priv', (id, msg) => {
        socket.to(id).emit('msg', msg) // send to specific client useing his id
    })

    // if clients emits event 'join', add socket to specified room
    socket.on("join", room => {
        socket.join(room) // add client to room
        io_test.to(room).emit('msg', `user ${socket.id} has joined the room`) // broadcast event to all clients in room
        socket.emit("msg", `joined ${room}`) // emit event msg to client that emitted event join
    })

    // if clients emits event 'leave', remove socket from specified room
    socket.on("leave", room => {
        socket.leave(room) // remove client from room
        io_test.to(room).emit('msg', `user ${socket.id} has left the room`) // broadcast event to all clients in room
        socket.emit("msg", `left ${room}`) // emit event msg to client that emitted event leave
    })
});

// other options:
// socket.volatile.emit('msg', 'do you really need it?'); -- emits event that might be ignored if client is unable to receive events at the moment
// socket.broadcast.emit('msg', 'to all others'); -- emits event toll all clients in all instances *except self*
// io.emit('msg','to all') -- emits event to all clients in all instances
// socket.adapter.rooms -- logs all rooms that socket is in

// ---> all emits : https://socket.io/docs/emit-cheatsheet/

// #endregion socket.io - test

// #region socket.io - lobby
var lobby = {
    io: io.of('/lobby'), // separate instace for lobby
    clients: [], // clients data
    rooms: [], // active rooms

    // search functions
    getClientByID: id => lobby.clients.find(client => client.id == id),
    getClientByToken: token => lobby.clients.find(client => client.token == token),
    getRoomByName: roomName => lobby.rooms.find(room => room.name == roomName),
    getRoomByClientId: id => lobby.rooms.find(room => room.clients.find(client => client.id == id)),

    // utility functions
    joinRoomAfterRedirect(socket) {
        console.log(`${socket.id} joins room adter redirect`);

        var client = lobby.getClientByID(socket.id)

        // if room doesn't exist - creates new room
        if (!lobby.getRoomByName(client.carryRoomName)) lobby.createRoom(socket, client.carryRoomName)

        // if room exists, joins it
        else lobby.joinRoom(socket, client.carryRoomName)

        client.carryRoomName = false
    },
    leaveRoom(socket) {
        console.log(`${socket.id} leaves room`);

        var client = lobby.getClientByID(socket.id)
        var room = lobby.getRoomByClientId(socket.id)

        // remove from room array
        let i = room.clients.indexOf(client)
        room.clients.splice(i, 1);

        socket.leave(room.name)


        if (room.clients.length == 0) { // if room empty, delete it
            let i = lobby.rooms.indexOf(room)
            lobby.rooms.splice(i, 1)
        } else { // if room not empty after client leave
            if (room.admin == client) { // if user was room admin, choose new admin
                room.admin = room.clients[0]
            }
        }

        // notify room
        lobby.io.to(room.name).emit('user_disconnected', socket.id)

        // notify all
        lobby.io.emit('rooms_updated')
    },
    createRoom(socket, roomName) {
        console.log(`${socket.id} is creating room ${roomName}`);

        if (lobby.getRoomByName(roomName)) {
            console.error(`ERROR: room ${roomName} already exists`)
        } else {
            // if client was in room - leave it
            if (lobby.getRoomByClientId(socket.id)) lobby.leaveRoom(socket)

            let client = lobby.clients.find(client => client.id == socket.id)
            let room = {
                name: roomName,
                clients: [
                    client
                ],
                admin: client
            }
            lobby.rooms.push(room)

            socket.join(roomName)

            // notify all
            lobby.io.emit('rooms_updated')
        }
    },
    joinRoom(socket, roomName) {
        console.log(`${socket.id} is joining room ${roomName}`);

        if (!lobby.getRoomByName(roomName)) { // if room doesn't exist
            console.error(`ERROR: trying to join room that doesn't exist`)
        } else {
            // if client was in room
            if (lobby.getRoomByClientId(socket.id)) lobby.leaveRoom(socket)

            let room = lobby.getRoomByName(roomName)
            let client = lobby.getClientByID(socket.id)

            room.clients.push(client)
            socket.join(roomName)

            // notify room
            lobby.io.to(room.name).emit('user_connected', socket.id)

            // notify all
            lobby.io.emit('rooms_updated')
        }
    },
}

lobby.io.on('connect', socket => {
    console.log(`${socket.id} connected`);

    var cookies = cookie.parse(socket.handshake.headers.cookie);
    var token = cookies["token"]
    // console.log(`user token: ${token}`)

    // #region client indentification
    var client = lobby.getClientByToken(token)
    console.log(client);


    if (client) { // server remembers client profile

        if (client.connected) { // someone is already connected using this token
            socket.emit('error_token')
            return
        }

        // update client data
        client.id = socket.id // update socket id
        client.connected = true // update status

        if (client.carryRoomName) { // if redirected from / to /lobby
            if (!lobby_rooms.find(room => room.name == client.carryRoomName)) { // if room doesn't exist
                let room = lobby_rooms.find(room => room.clients.find(client => client.id == socket.id))
                if (room) { // if client was in room
                    lobby_leaveRoom()
                }
                let new_room = {
                    name: client.carryRoomName,
                    clients: [
                        client
                    ],
                    admin: client
                }
                lobby_rooms.push(new_room)

                socket.join(client.carryRoomName)

                // notify all
                io_lobby.emit('rooms_updated')
            } else {
                let room = lobby_rooms.find(room => room.clients.find(client => client.id == socket.id))
                if (room) { // if client was in room
                    lobby_leaveRoom()
                }
                room = lobby_rooms.find(room => room.name == client.carryRoomName)
                room.clients.push(client)
                socket.join(client.carryRoomName)

                // notify all
                io_lobby.emit('rooms_updated')
            }
            client.carryRoomName = false
        }
    } else {
        client = {
            token: token,
            id: socket.id,
            name: (cookies["username"] ? cookies["username"] : "user#" + Math.random().toString().slice(-4)),
            connected: true,
            carryRoomName: false
        }
        lobby.clients.push(client)
    }
    // #endregion client indentification

    // #region functions
    function lobby_leaveRoom() {
        var client = lobby_clients.find(client => client.id == socket.id)
        var room = lobby_rooms.find(room => room.clients.find(client => client.id == socket.id))

        // remove from room array
        let i = room.clients.indexOf(client)
        room.clients.splice(i, 1);

        socket.leave(room.name)

        // if room empty, delete it
        if (room.clients.length == 0) {
            let i = lobby_rooms.indexOf(room)
            lobby_rooms.splice(i, 1)
        } else {
            // if user was room admin, choose new admin
            if (room.admin == client) {
                room.admin = room.clients[0]
            }
        }

        // notify room
        io_lobby.to(room.name).emit('user_disconnected', socket.id)

        // notify all
        io_lobby.emit('rooms_updated')
    }
    // #endregion functions

    // notify room on user disconnect
    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`);

        var client = lobby.getClientByID(socket.id)
        var room = lobby.getRoomByClientId(socket.id)

        if (room) { // if client in room remove him from room and notify room that he left
            lobby.leaveRoom(socket)
        }
        client.connected = false
    })

    // #region custom events

    // carry roomname - used to carry roomname from / to /lobby
    socket.on('carryRoomName', roomName => {
        var client = lobby.getClientByID(socket.id)
        client.carryRoomName = roomName
    })

    // return active rooms to which socket is connected
    socket.on('get_my_rooms', res => {
        res(socket.rooms)
    })

    // create room
    socket.on('room_create', roomName => {
        console.log(`${socket.id} is creating room ${roomName}`);
        if (lobby_rooms.find(room => room.name == roomName)) {
            console.error(`ERROR: room ${roomName} already exists`)
        } else {
            let room = lobby_rooms.find(room => room.clients.find(client => client.id == socket.id))
            if (room) { // if client was in room
                lobby_leaveRoom()
            }

            let client = lobby_clients.find(client => client.id == socket.id)
            let new_room = {
                name: roomName,
                clients: [
                    client
                ],
                admin: client
            }
            lobby_rooms.push(new_room)

            socket.join(roomName)

            // notify all
            io_lobby.emit('rooms_updated')
        }
    })

    // leave room
    socket.on('room_leave', () => {
        // if client was in room
        if (lobby.getRoomByClientId(socket.id)) lobby.leaveRoom(socket)
    })

    // join room
    socket.on('room_join', roomName => {
        console.log(`${socket.id} is joining room ${roomName}`);

        if (!lobby_rooms.find(room => room.name == roomName)) { // if room doesn't exist
            console.error(`ERROR: trying to join room that doesn't exist`)
        } else {
            let room = lobby_rooms.find(room => room.clients.find(client => client.id == socket.id))
            if (room) { // if client was in room
                lobby_leaveRoom()
            }
            room = lobby_rooms.find(room => room.name == roomName)
            let client = lobby_clients.find(client => client.id == socket.id)
            room.clients.push(client)
            socket.join(roomName)

            // notify all
            io_lobby.emit('rooms_updated')
        }
    })

    // send to room
    socket.on('send', msg => {
        console.log(`${socket.id} sent: ${msg}`)
        let room = lobby.getRoomByClientId(socket.id)
        if (room) lobby.io.to(room.name).emit('chat', msg)
    })

    // respond with rooms list
    socket.on('getRooms', res => {
        res(lobby.rooms)
    })

    // respond with clients list
    socket.on('getClients', res => {
        res(lobby.clients)
    })

    // change client name
    socket.on('setName', name => {
        let client = lobby.getClientByID(socket.id)
        client.name = name

        // if in room, notify room
        let room = lobby.getRoomByClientId(socket.id)
        if (room) lobby.io.to(room.name).emit('username_change', socket.id)
    })

    // #endregion custom events

})
// #endregion socket.io - lobby

//nasłuch na określonym porcie
server.listen(PORT, function () {
    console.log(`server started on port: ${PORT}`)
})