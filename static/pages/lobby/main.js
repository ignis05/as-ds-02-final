// #region socket.io
var socket = io(`/lobby`)

socket.roomMembers = []

socket.createRoom = function (roomName) {
    socket.emit('room_create', roomName)
}
socket.joinRoom = function (roomName) {
    socket.emit('room_join', roomName)
}
socket.leaveRoom = function () {
    socket.emit('room_leave')
}
socket.send = function (msg) {
    socket.emit('send', msg)
}
socket.setName = function (nickname) {
    socket.emit('setName', nickname)
}
socket.getRooms = function () {
    return new Promise(resolve => {
        socket.emit('getRooms', res => {
            resolve(res)
        })
    })
}
socket.getClients = function () {
    return new Promise(resolve => {
        socket.emit('getClients', res => {
            resolve(res)
        })
    })
}
socket.getMyRooms = function () {
    return new Promise(resolve => {
        socket.emit('get_my_rooms', res => {
            resolve(res)
        })
    })
}

//      #region socket events

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
socket.on('user_disconnected', async id => {
    console.log(`user ${id} has disconnected`);
    // >here< place for additional function that will notify the users

    // update room admin if someon leaves
    let rooms = await socket.getRooms()
    let currentRoom = rooms.find(room => room.clients.find(client => client.id == socket.id))
    $('#socket-admin-name').html(currentRoom.admin.name)
})

// triggers when someone connects to room
socket.on('user_connected', id => {
    console.log(`user ${id} has connected`);
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

//      #endregion socket events

// #endregion socket.io



async function updateRoomMembers() { // placeholder function triggered by 'rooms_updated' event
    let rooms = await socket.getRooms()
    let room = rooms.find(room => room.clients.find(client => client.id == socket.id))
    let display = ""
    socket.roomMembers = room.clients
    for (let client of room.clients.map(client => client.name)) {
        display += client + '<br>'
    }
    if (display == "") display = '[]'
    $('#socket-players').html(display)
}

async function updateChat(msg) { // placeholder function triggered by 'chat' event
    let author = socket.roomMembers.find(client => client.id == msg.author)

    let chat = $('#socket-chat-display').html()
    chat += `<div style="display: inline; color: #FF0000; text-shadow: 2px 0px 1px #000000;">${author.name}</div>: ${msg.content} <br>`
    $('#socket-chat-display').html(chat)
}

$(document).ready(async () => {
    // block of code that cheks if user succesfully joined a room
    // if not (for example he refreshed page or room is full) he should be redirected to main page
    let myRooms = await socket.getMyRooms()
    if (Object.values(myRooms).length < 2) {
        window.location = '/'
    }

    // actually get room name from server room list, to prevent displaying client id instead of roomname
    let rooms = await socket.getRooms()
    let currentRoom = rooms.find(room => room.clients.find(client => client.id == socket.id))

    $('#socket-room-name').html(currentRoom.name) // display room name in #roomName div

    $('#socket-admin-name').html(currentRoom.admin.name) // fix admin display placeholder

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
                socket.send(msg) // trigger event 'chat' for every user in room (including self) and pass msg obj as data
                $('#socket-chat-input').val('') // Clear message field to prevent accidental spam
            }
        }
    })

    // focus chat input on click
    $('#region-chat').click(() => document.getElementById('socket-chat-input').focus())
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
                    socket.leaveRoom() // prevent autoreconnect attempts
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