// test file with basic implementation of lobby chat

// WARNING: chat requires client-sided checks to prevent:
// - users trying to create room that alredy exists (nothing will happen - user won't be notified)
// - users trying to join room that doesn't exist (nothing will happen - user won't be notified)

// Notes:
// - rooms are deleted automaticly if they are empty
// - rooms have no size limit (yet)
// - admin of room is specified but kicking / muting / whatever is not (yet) implemented

// ------------------------------------------------------------------------------------------------------------------------------------------------------
// - !!! >>>>> server recognizes clients using cookie tokens, so connecting from multiple windows will be blocked (unless using icognito mode / multiple browsers) <<<<< !!!
// ------------------------------------------------------------------------------------------------------------------------------------------------------

// let's make this work with normal ui, then we will add more options


// ACTUAL CODE :

// initialization:
var socket = io(`/lobby`); // connect to socket instance `/lobby` (fyi actual path used by socket is http://host:port/socket.io/lobby - so this won't cause any errors)


// bunch of triggers that are fired remotely by server or other clients:

// triggers when someone tries to connect using token that is alredy in use - client should be immediately redirected to main page
socket.on('error_token', () => {
    window.alert('You are already connected from this browser. If you want do connect another client try incognito mode or other browsers')
    window.location = '/'
})

// triggers when someone sends message to room
socket.on('chat', msg => {
    console.log(msg);
    updateChat(msg)
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

// triggers when someone joins / leaves / creates a room - conveinient to update room list or sth
socket.on('rooms_updated', () => {
    updateRoomMembers()
})

// #region socket functions (they are described below)
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
function socket_get_my_rooms() {
    return new Promise(resolve => {
        socket.emit('get_my_rooms', res => {
            resolve(res)
        })
    })
}
// #endregion socket functions


// #region >>> functions to use : <<<

// socket_setName(nickname) // - changes client nickname (empty nickname won't cause error - though you might want to prevent that for obvious reasons) 
// ^- (nicknames will be recognized on disconnect and reconect, as long as server is running)
// ^-- (in future it might be a good idea to add limit of remembered clients to prevent memory leaks on longer server runs)

// socket_createRoom(roomName) // - creates new room and joins it - REQUIRES CHECK IF ROOM DOESN'T EXIST YET
// socket_joinRoom(roomName) // - joins room matching given name (automatically leaves previous room) - REQUIRES CHECK IF ROOM EXIST
// socket_leaveRoom() // - leaves current room (if client isn't currently in any room nothing happens)

// socket_send(msg) // - triggers 'chat' event for all clients in current room (>including self< - if you want that changed, ask) (if not in any room nothing will happen)

// await socket_getClients() - returns client array (all clients (even ones not assigned to any room) with their names and tokens)
// await socket_getRooms() - returns room array (room name, room admin , clients inside room)

// #endregion >>> functions to use : <<<

// function that updates room members list

var roomMembers = []

async function updateRoomMembers() {
    let rooms = await socket_getRooms()
    let room = rooms.find(room => room.clients.find(client => client.id == socket.id))
    let display = ""
    roomMembers = room.clients
    for (let client of room.clients.map(client => client.name)) {
        display += JSON.stringify(client, null, 4) + '<br>'
    }
    if (display == "") display = '[]'
    $('#display').html(display)
}

async function updateChat(msg) {
    let author = roomMembers.find(client => client.id == msg.author)

    let chat = $('#chat').html()
    chat += `${author.name} : ${msg.content} <br>`
    $('#chat').html(chat)
}

$(document).ready(async () => {
    let myRooms = await socket_get_my_rooms()
    if (Object.values(myRooms).length < 2) { // if not automatically asigned to room (ex on refresh)
        window.location = '/'
    }

    $('#roomName').html(Object.values(myRooms)[1])

    updateRoomMembers()

    $('#chatButton').click(() => {
        let msg = {
            author: socket.id,
            content: $('#chatInp').val()
        }
        socket_send(msg)
    })
})