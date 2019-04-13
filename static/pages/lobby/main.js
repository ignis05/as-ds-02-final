// test file with basic implementation of lobby chat

// WARNING: chat requires client-sided checking if:
// - user is trying to create room that alredy exists (will throw error)
// - user is trying to join room that doesn't exist (user will join room, but this will cause unwanted behaviour if that room is created later)

// Notes:
// - rooms are deleted automaticly if they are empty
// - rooms have no size limit (for now)
// - admin of room is specified but kicking / muting / whatever is not (yet) implemented

// ------------------------------------------------------------------------------------------------------------------------------------------------------
// - !!! >>>>> server recognizes clients using cookie tokens, so connecting from multiple windows will cause errors (unless using icognito mode) <<<<< !!!

// - (I will probably create exceptions in future to prevent server crashes)
// ------------------------------------------------------------------------------------------------------------------------------------------------------

var socket = io(`/lobby`); // connect to socket instance `/lobby`

// triggers when someone sends message to room
socket.on('chat', msg => {
    console.log(msg);
    // >here< function that will add message to chatbox
})

// triggers when someone disconnects from room
socket.on('user_disconnected', id => {
    console.log(`user ${id} has disconnected`);
    // >here< function that will update list of room members & notify them
})

// triggers when someone in room changes username (optional)
socket.on('username_change', id => {
    console.log(`user ${id} chnaged nickname`);
    // >here< function that will update list of room members
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

function socket_setName(nickname) {
    socket.emit('setName', nickname)
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

// socket_createRoom(roomName) // - creates new room -  REQUIRES CLIENT-SIDED CHECK IF ROOM DOESN'T EXIST
// socket_joinRoom(roomName) // - joins room matching given name (automatically leaves previous room) - REQUIRES CLIENT-SIDED CHECK IF ROOM EXIST
// socket_leaveRoom() // - leaves current room

// socket_send(msg) // - emits 'chat' event to all clients in current room

// socket_setName(nickname) // - changes client nickname (nicknames should be remembered as long as server is running)

// await socket_getClients() - returns client list (clients assigned with names and tokens)
// await socket_getRooms() - returns room list (room name, room admin , clients inside room)

// #endregion >>> functions to use : <<<

$(document).ready(async () => {

    // #region test
    $('#socket_setName').click(() => { socket_setName($('#socket_setNameInp').val()) })
    $('#socket_createRoom').click(() => { socket_createRoom($('#socket_createRoomInp').val()) })
    $('#socket_joinRoom').click(() => { socket_joinRoom($('#socket_joinRoomInp').val()) })
    $('#socket_leaveRoom').click(() => { socket_leaveRoom() })
    $('#socket_send').click(() => { socket_send($('#socket_sendInp').val()) })
    $('#socket_getRooms').click(async () => {
        let res = await socket_getRooms()
        let display = ""
        for (let obj of res) {
            display += JSON.stringify(obj, null, 4) + '<br>'
        }
        if (display == "") display = '[]'
        $('#display').html(display)
    })
    $('#socket_getClients').click(async () => {
        let res = await socket_getClients()
        let display = ""
        for (let obj of res) {
            display += JSON.stringify(obj, null, 4) + '<br>'
        }
        if (display == "") display = '[]'
        $('#display').html(display)
    })
    // #endregion test
})