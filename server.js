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
var PF = require('pathfinding')
// #endregion initial

var ServerDB = {
    databases: [],
}

var test_LoadedMap = []
var grid
var finder

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
    // console.log("KeK");

    return matrix
}

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
app.get("/game", function (req, res) {
    res.sendFile(path.join(__dirname + `/static/pages/game/main.html`))
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
        res.send({ msg: "OK", id: i });
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

app.post("/database_remove", function (req, res) {
    let data = req.body
    console.log("/database_remove: ", data)
    if (!data.match) data.match = {}
    if (!data.params) data.params = {}

    let db = ServerDB.databases[data.id].db

    db.remove(data.match, data.params, function (err, count) {
        console.log(`removed ${count} entries`)
        res.send({ msg: "OK", count: count });
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
        res.send({ msg: "OK", count: count });
    });
})
// #endregion ajax - database

// #region ajax - token
app.post("/token", function (req, res) {
    getToken(req, res)
    res.send({ msg: "OK" })
})

function getToken(req, res) {
    let cookies = req.cookies
    // console.log(cookies);
    let token = (cookies["token"] ? cookies["token"] : Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10))
    let time = 1000 * 60 * 60 * 8 // 8h
    res.cookie("token", token, { expires: new Date(Date.now() + time), httpOnly: true })
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
    res.send({ msg: "OK", testPages: testPages })
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
    res.send({ msg: "OK", models: models })
})

app.post("/sendClickedPoint", function (req, res) {
    let data = req.body
    let temp_grid = grid.clone() //after finding path pathfinder modifies grid, so backup bois    
    let path = finder.findPath(data.unit.x, data.unit.z, data.click.x, data.click.z, temp_grid)
    console.log(path);

    res.send({ msg: "sendClickedPoint-Sent", path: path })
})

app.post("/gameInit", function (req, res) {
    let data = req.body

    let db = new Datastore({
        filename: path.join(__dirname + `/static/database/maps.db`),
        autoload: true
    });

    db.findOne({
        _id: data.id
    }, function (err, doc) {
        grid = new PF.Grid(createMatrix(doc.mapData))
        finder = new PF.AStarFinder()
    })

    res.send({ msg: "OK" })
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
        console.log(`${socket.id} joins room after redirect`);

        var client = lobby.getClientByID(socket.id)

        // if room doesn't exist - creates new room
        if (!lobby.getRoomByName(client.carryRoom.name)) lobby.createRoom(socket, client.carryRoom)

        // if room exists, joins it
        else lobby.joinRoom(socket, client.carryRoom.name, client.carryRoom.password)

        // client.carryRoom = false - don't clear - auto reconnect
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
                lobby.io.to(room.name).emit('admin_changed')
            }
        }

        // notify room
        lobby.io.to(room.name).emit('user_disconnected', socket.id)

        // notify all
        lobby.io.emit('rooms_updated')
    },
    createRoom(socket, room) {
        console.log(`${socket.id} is creating room ${room.name}`);

        if (lobby.getRoomByName(room.name)) {
            console.error(`ERROR: room ${room.name} already exists`)
        } else {
            // if client was in room - leave it
            if (lobby.getRoomByClientId(socket.id)) lobby.leaveRoom(socket)

            let client = lobby.clients.find(client => client.id == socket.id)
            let newRoom = {
                name: room.name,
                clients: [
                    client
                ],
                admin: client,
                size: room.size,
                password: room.password,
                map: null,
            }
            lobby.rooms.push(newRoom)

            socket.join(room.name)

            // notify all
            lobby.io.emit('rooms_updated')
        }
    },
    joinRoom(socket, roomName, passwd) {
        console.log(`${socket.id} is joining room ${roomName}`);

        if (!lobby.getRoomByName(roomName)) { // if room doesn't exist
            console.error(`ERROR: trying to join room that doesn't exist`)
        } else {
            // if client was in room
            if (lobby.getRoomByClientId(socket.id)) lobby.leaveRoom(socket)

            let room = lobby.getRoomByName(roomName)
            let client = lobby.getClientByID(socket.id)

            if (room.size <= room.clients.length) {
                console.error(`ERROR: room is full`)
                return
            }

            if (room.password && room.password != passwd) {
                console.error(`ERROR: incorrect password`)
                return
            }

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

        // if redirected from / to /lobby
        if (client.carryRoom) {
            lobby.joinRoomAfterRedirect(socket)
        }

    } else {
        // create new client entry
        client = {
            token: token,
            id: socket.id,
            name: (cookies["username"] ? cookies["username"] : "user#" + Math.random().toString().slice(-4)),
            connected: true,
            carryRoom: false,
            ready: false,
        }
        lobby.clients.push(client)
    }
    // #endregion client indentification

    // built in disconnect event :
    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`);

        var client = lobby.getClientByID(socket.id)
        var room = lobby.getRoomByClientId(socket.id)

        client.ready = false

        if (room) { // if client in room remove him from room and notify room that he left
            lobby.io.to(room.name).emit('readyState_change', socket.id)
            lobby.leaveRoom(socket)
        }

        client.connected = false
    })

    // #region custom events

    // start game
    socket.on('start_game', () => {
        let room = lobby.getRoomByClientId(socket.id)
        if (!room) {
            console.log('ERROR: room doesn\'t exist');
            return
        }
        for (let client of room.clients) {
            if (!client.ready) {
                console.log('ERROR: client not ready');
                return
            }
        }

        game.sessions.push({ // push game session to game instance of socket
            clients: room.clients.map(client => {
                let _client = {
                    id: client.id,
                    token: client.token,
                    name: client.name,
                    connected: false,
                }
                return _client
            }),
            mapName: room.map,
            id: Math.random().toString(36).substring(2, 10),
        })

        lobby.io.to(room.name).emit('startGame')
    })

    // select map
    socket.on('select_map', mapName => {
        let room = lobby.getRoomByClientId(socket.id)
        if (!room) {
            console.error('ERROR: room doesnt exist')
            return
        }
        lobby.io.to(room.name).emit('map_selected', mapName)
        room.map = mapName
    })

    // kick user
    socket.on('kick', userID => {
        let room = lobby.getRoomByClientId(socket.id)
        if (room.admin.id == socket.id && room.clients.find(client => client.id == userID)) { // check if user is room admin and kicked user is in same room
            lobby.io.to(userID).emit('get_kicked')
            lobby.io.to(room.name).emit('user_kicked', userID) // notify room
        }
        else console.error('ERROR: invalid kick triggered')
    })

    // set readyState
    socket.on('setReadyState', ready => {
        let client = lobby.getClientByID(socket.id)
        let room = lobby.getRoomByClientId(socket.id)
        client.ready = ready

        // notify room
        lobby.io.to(room.name).emit('readyState_change', socket.id)
    })

    // carry roomname - used to carry roomname from / to /lobby
    socket.on('carryRoom', (roomName, roomPassword, roomSize) => {
        if (!roomSize) roomSize = 2 // placeholder for room size
        if (!roomPassword) roomPassword = false // placeholder for password protected rooms
        var client = lobby.getClientByID(socket.id)
        client.carryRoom = {
            name: roomName,
            size: roomSize,
            password: roomPassword
        }
    })

    // check password - server sided check if password is correct
    socket.on('room_check_password', (roomName, roomPassword, res) => {
        let room = lobby.getRoomByName(roomName)
        if (room && room.password && room.password != roomPassword) res(false)
        else res(true)
    })

    // return active rooms to which socket is connected
    socket.on('get_my_rooms', res => {
        res(socket.rooms)
    })

    // create room
    socket.on('room_create', roomName => {
        lobby.createRoom(socket, roomName)
    })

    // leave room
    socket.on('room_leave', () => {
        // if client was in room
        if (lobby.getRoomByClientId(socket.id)) {
            let client = lobby.getClientByID(socket.id)
            client.carryRoom = false // clear autojoin on manual leave
            lobby.leaveRoom(socket)
        }
    })

    // join room
    socket.on('room_join', (roomName, passwd) => {
        lobby.joinRoom(socket, roomName, passwd)
    })

    // send to room
    socket.on('send', msg => {
        console.log(`${socket.id} sent: ${msg}`)
        let room = lobby.getRoomByClientId(socket.id)
        if (room) lobby.io.to(room.name).emit('chat', msg)
    })

    // respond with rooms list
    socket.on('getRooms', res => {
        let info = JSON.parse(JSON.stringify(lobby.rooms)) // deep copy of lobby rooms (to not modify original)

        // sanitizing passwords from info sent to clients
        for (let i in info) {
            if (info[i].password)
                info[i].password = true
        }

        res(info)
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

// #region socket.io - game
var game = {
    io: io.of('/game'), // separate instace for game
    sessions: [],
    getClientByToken: token => {
        let session = game.sessions.find(session => session.clients.find(client => client.token == token))
        let cl = session.clients.find(client => client.token == token)
        return cl
    },
    getClientByID: id => {
        let session = game.sessions.find(session => session.clients.find(client => client.id == id))
        let cl = session.clients.find(client => client.id == id)
        return cl
    },
    getSessionByClientID: id => game.sessions.find(session => session.clients.find(client => client.id == id)),
    getSessionByClientToken: token => game.sessions.find(session => session.clients.find(client => client.token == token)),
}
game.io.on('connect', socket => {
    console.log(`${socket.id} connected`);

    var cookies = cookie.parse(socket.handshake.headers.cookie);
    var token = cookies["token"]
    console.log(`user token: ${token}`)

    let session = game.getSessionByClientToken(token)

    let client

    if (session) { // client is assigned to session

        client = game.getClientByToken(token)

        if (client.connected) { // someone is already connected using this token
            socket.emit('error_token')
            return
        }

        // update client data

        client.id = socket.id // update socket id
        client.connected = true // update status

    }
    else {
        socket.emit('session_not_found')
        return
    }

    // join room
    socket.join(session.id)
    game.io.to(session.id).emit('player_connected', socket.id)

    // check if all players connected
    let readyCount = 0
    for (player of session.clients) {
        if (player.connected) readyCount++
    }
    if (readyCount == session.clients.length) {
        game.io.to(session.id).emit('all_players_connected')
    }

    // built in disconnect event :
    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`);

        var client = game.getClientByID(socket.id)
        let session = game.getSessionByClientID(socket.id)

        game.io.to(session.id).emit('player_disconnected', socket.id) // notify room

        session.clients[session.clients.indexOf(client)].connected = false

        // delete session if last player leaves
        let empty = true
        for (let client of session.clients) {
            if (client.connected) empty = false
        }
        if (empty) {
            let i = game.sessions.indexOf(session)
            game.sessions.splice(i, 1)
        }
    })

    // #region custom events

    // get selected map
    socket.on('get_selected_mapName', res => {
        let session = game.getSessionByClientID(socket.id)
        res(session.mapName)
    })

    // #endregion custom events
})
// #endregion socket.io - game

//nasłuch na określonym porcie
server.listen(PORT, function () {
    console.log(`server started on port: ${PORT}`)
})