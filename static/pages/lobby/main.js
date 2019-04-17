// initialization:
var socket = io(`/lobby`) // connect to socket instance `/lobby` (fyi actual path used by socket is http://host:port/socket.io/lobby - so this won't cause any errors)


//          >>>> bunch of triggers that are fired remotely by server or other clients:

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
    // >here< place for additional function that will notify the users
})

// triggers when someone in room changes username (optional)
socket.on('username_change', id => {
    console.log(`user ${id} chnaged nickname`);
    // >here< place for additional function that will update list of room members
})

// triggers when someone joins / leaves / creates a room - conveinient to update room list or sth
socket.on('rooms_updated', () => {
    updateRoomMembers()
})

// #region socket functions (they are described below) - collapse code for convenience
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


// #region >>> functions descriptions : <<<

// socket_setName(nickname) // - changes client nickname (empty nickname won't cause error - though you might want to prevent that for obvious reasons) 
// ^- (nicknames will be recognized on disconnect and reconect, as long as server is running)
// ^-- (in future it might be a good idea to add limit of remembered clients to prevent memory leaks on longer server runs)

// socket_createRoom(roomName) // - creates new room and joins it - REQUIRES CHECK IF ROOM DOESN'T EXIST YET
// socket_joinRoom(roomName) // - joins room matching given name (automatically leaves previous room) - REQUIRES CHECK IF ROOM EXIST
// socket_leaveRoom() // - leaves current room (if client isn't currently in any room nothing happens)

// socket_send(msg) // - triggers 'chat' event for all clients in current room (>including self< - if you want that changed, ask) (if not in any room nothing will happen)

// await socket_getClients() - returns client array (all clients (even ones not assigned to any room) with their names and tokens)
// await socket_getRooms() - returns room array (room name, room admin , clients inside room)
// await get_my_rooms() - returns room object with all rooms socket is in

//socket.emit('carryRoomName', roomName) - joins room on next connect - used to carry name from '/' to '/lobby'

// #endregion >>> functions descriptions : <<<

// function that updates room members list

var roomMembers = []

async function updateRoomMembers() { // placeholder function triggered by 'rooms_updated' event
    let rooms = await socket_getRooms()
    let room = rooms.find(room => room.clients.find(client => client.id == socket.id))
    let display = ""
    roomMembers = room.clients
    for (let client of room.clients.map(client => client.name)) {
        display += client + '<br>'
    }
    if (display == "") display = '[]'
    $('#socket-players').html(display)
}

async function updateChat(msg) { // placeholder function triggered by 'chat' event
    let author = roomMembers.find(client => client.id == msg.author)

    let chat = $('#socket-chat-display').html()
    chat += `<div style="display: inline; color: #FF0000; text-shadow: 2px 0px 1px #000000;">${author.name}</div>: ${msg.content} <br>`
    $('#socket-chat-display').html(chat)
}

$(document).ready(async () => {
    // block of code that cheks if user succesfully joined a room
    // if not (for example he refreshed page or sth) he should be redirected to main page
    let myRooms = await socket_get_my_rooms()
    if (Object.values(myRooms).length < 2) {
        window.location = '/'
    }

    $('#socket-room-name').html(Object.values(myRooms)[1]) // display room name in #roomName div

    updateRoomMembers() // trigger function displaying members of room manually

    InitClicks() // Initializes bottom panel

    // Flagged to remove, button will be removed
    /* // send message on button click
    $('#socket-chat-button').click(() => {
        if ($('#socket-chat-input').val() !== '') { // Blocking empty messages
            let msg = {
                author: socket.id, // id of current connection - will always be unique
                content: $('#socket-chat-input').val()
            }
            socket_send(msg) // trigger event 'chat' for every user in room (including self) and pass msg obj as data
            $('#socket-chat-input').val('') // Clear message field to prevent accidental spam
        }
    }) */

    // send message on "enter" in chat
    $('#socket-chat-input').on('keyup', e => {
        if (e.keyCode === 13) {
            // Moved retired button function
            if ($('#socket-chat-input').val() !== '') { // Blocking empty messages
                let msg = {
                    author: socket.id, // id of current connection - will always be unique
                    content: $('#socket-chat-input').val()
                }
                socket_send(msg) // trigger event 'chat' for every user in room (including self) and pass msg obj as data
                $('#socket-chat-input').val('') // Clear message field to prevent accidental spam
            }
        }
    })
})



/* =================================== *
 *  Bottom panel functions start here  *
 * =================================== */

function InitClicks() {
    $('#button-back').click(() => {
        DisplayMainMenu()
    })

    $('#button-info').click(() => {
        DisplayRoomInfo()
    })

    $('#button-ready').click(() => {

    })

    $('#button-start').click(() => {

    })
}

// #region Dialog Functions
function DisplayMainMenu() {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-confirm',
        width: 500,
        height: 150,
        title: 'Exit to Main Menu?',
        buttons: [
            {
                text: 'Yes',
                'class': 'ui-dialog-button',
                click: function () {
                    window.location = '/'
                }
            },
            {
                text: 'No',
                'class': 'ui-dialog-button',
                click: function () {
                    $(this).dialog('close')
                    overlay.css('display', 'none')
                }
            }
        ]
    })
}

function DisplayRoomInfo() {
    let overlay = $('#overlay')
    let popup = $('#room-info').removeAttr('style')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-confirm',
        width: 600,
        height: 350,
        title: 'Room Info',
        buttons: [
            {
                text: 'Close',
                'class': 'ui-dialog-button',
                click: function () {
                    $(this).dialog('close')
                    popup.css('display', 'none')
                    overlay.css('display', 'none')
                }
            }
        ]
    })
}
// #endregion