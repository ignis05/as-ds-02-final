var socket = io(`/lobby`); // connect to socket instance `/lobby`

socket.on('chat', msg => {
    console.log(msg);
    // >here< function that will add message to chatbox
})

socket.on('user_disconnected', id => {
    console.log(`user ${id} has disconnected`);
    // >here< function that will update list of room members & notify them
})


// #region socket functions
function socket_createRoom(roomName) {
    socket.emit('room_create', roomName)
}
function socket_joinRoom(roomName) {
    socket.emit('room_join', roomName)
}
function socket_leaveRoom() {
    socket.emit('room_leave')
}

function socket_send(msg) {
    socket.emit('send', msg)
}

function socket_getRooms() {
    return new Promise(resolve => {
        socket.emit('getRooms', res => {
            resolve(res)
        })
    })
}
function socket_getClients() {
    return new Promise(resolve => {
        socket.emit('getClients', res => {
            resolve(res)
        })
    })
}
// #endregion socket functions


// #region >>> functions to use : <<<

// socket_createRoom(roomName) // - creates new room (client sided check for taken room name required - server will throw error if room name taken) and joins it
// socket_joinRoom(roomName) // - joins room matching given name (automatically leaves previous room)
// socket_leaveRoom() // - leaves current room

// socket_send(msg) // - emits 'chat' event to all clients in current room

// await socket_getClients() - returns client list (clients assigned with names and tokens)
// await socket_getRooms() - returns room list

// #endregion >>> functions to use : <<<

$(document).ready(async () => {
    setInterval(async () => {
        let res = await socket_getRooms()
        console.log(res);
    }, 5000)
})