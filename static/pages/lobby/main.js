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
socket.setReadyState = function (boolean) {
    socket.emit('setReadyState', boolean)
}
socket.kick = function (userID) {
    socket.emit('kick', userID)
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
    UpdateChat(msg)
})

// triggers when game is started
socket.on('startGame', () => {
    window.location = '/game'
})

// triggers when someone disconnects from room
socket.on('user_disconnected', async id => {
    console.log(`user ${id} has disconnected`)
    // >here< place for additional function that will notify the users

    // update room admin if someon leaves
    let rooms = await socket.getRooms()
    let currentRoom = rooms.find(room => room.clients.find(client => client.id == socket.id))
    $('#socket-admin-name').html(currentRoom.admin.name)
})

// triggers when room admin is changed
socket.on('admin_changed', () => {
    UpdateMaplist() // to unlock listeners for new admin
})

// triggers when someone connects to room
socket.on('user_connected', id => {
    console.log(`user ${id} has connected`)
    // >here< place for additional function that will notify the users
})

// triggers when someone in room changes username (optional)
socket.on('username_change', id => {
    console.log(`user ${id} chnaged nickname`)
    // >here< place for additional function that will update list of room members
})

// triggers when someone joins / leaves / creates a room - conveinient to update room list or sth
socket.on('rooms_updated', () => {
    UpdateRoomMembers()
})

// triggers when user in room changes his ready state
socket.on('readyState_change', async () => {
    let rooms = await socket.getRooms()
    let room = rooms.find(room => room.clients.find(client => client.id == socket.id))
    let readyList = room.clients.map(client => `${client.name}: ${client.ready ? 'ready' : 'not ready'}`)
    /* console.log('list of ready cients')
    console.log(readyList) */
    UpdateRoomMembers()

    if (room.admin.id == socket.id) {
        let everyone = true
        for (let client of room.clients) { // checking if everyone is ready
            if (!client.ready && room.admin.id != client.id) {
                everyone = false
            }
        }
        if (everyone)
            $('#button-start').removeAttr('disabled')
        else
            $('#button-start').attr('disabled', true)
    }
})

// triggers when user is being kicked
socket.on('get_kicked', () => {
    window.alert('You have been removed from this room by administrator') // for some reason this alert doesn't work in chrome incognito mode
    socket.leaveRoom()
    window.location = '/'
})

// triggers when admin changes map
socket.on('map_selected', mapName => {
    UpdateSelectedMap(mapName)
})

//      #endregion socket events

// #endregion socket.io

// #region global variables

var mapsDB

const dtOptions = {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
}

const memberColors = [
    '#CF2F2F',
    '#CF7F2F',
    '#CFCF2F',
    '#2F2FCF',
    '#2F2F2F',
    '#CF2FCF',
    '#2FCFCF',
    '#2FCF2F'
]
// #endregion global variables

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
    $('#socket-client-count').html(currentRoom.clients.length + '/' + currentRoom.size) // fix admin display placeholder


    UpdateRoomMembers() // trigger function displaying members of room manually
    UpdateBottomPanel()

    InitClicks() // Initializes bottom panel

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

    // display map list
    mapsDB = new MapDB()
    await mapsDB.create()

    UpdateMaplist()
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

    $('#button-ready').click(async () => {

    })

    $('#button-start').click(async () => {
        let rooms = await socket.getRooms()
        let room = rooms.find(room => room.clients.find(client => client.id == socket.id))

        if (room.admin.id == socket.id) { // Checking if client is admin
            if (room.size != room.clients.length) { // prevent start if room not full
                window.alert('Room is not full')
                return
            }
            if (!room.map) { // prevent start if map is not selected
                window.alert('Map not selected')
                return
            }

            socket.setReadyState(true) // Host is ready when he presses this button (their ready-state wont be displayed anyways)

            socket.emit('start_game')
        }
        else {
            let client = room.clients.find(client => client.id == socket.id)
            socket.setReadyState(!client.ready)
            $('#button-start').html(`${!client.ready ? 'Ready' : 'Not ready'}`)
        }
    })
}

// #region Dialog Functions
function DisplayMainMenu() {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')
    $(window).off('keydown')

    $(window).on('keydown', e => {
        let bTarget = $('#bExit')
        if (e.originalEvent.code == 'Enter' && !bTarget.prop('disabled')) {
            bTarget.trigger('click')
        }
    })

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
                id: 'bExit',
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
    UpdateRoomInfo()

    let overlay = $('#overlay')
    let popup = $('#room-info').removeAttr('style')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')
    $(window).off('keydown')

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
                id: 'bClose',
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

// #region Misc Functions

async function UpdateRoomMembers() { // placeholder function triggered by 'rooms_updated' event
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

async function UpdateChat(msg) { // placeholder function triggered by 'chat' event
    let author = socket.roomMembers.find(client => client.id == msg.author)

    let chat = $('#socket-chat-display').html()
    chat += `<div style="display: inline; color: #FF0000; text-shadow: 2px 0px 1px #000000;">${author.name}</div>: ${msg.content} <br>`
    $('#socket-chat-display').html(chat)

    $("#socket-chat-display").scrollTop($("#socket-chat-display")[0].scrollHeight) // scroll chat to bottom
}

async function UpdateMaplist() {
    let rooms = await socket.getRooms()
    let room = rooms.find(room => room.clients.find(client => client.id == socket.id))

    let list = await mapsDB.getMaps()

    let saveTable = $('<table>')
        .attr('id', 'map-table')
        .addClass('lobby-table')
    let svtScroll = $('<div>')
        .addClass('saves-cont')
        .append(saveTable)
        .css('height', '248px')
        .css('width', '300px')
    let svtCont = $('<div>')
        .addClass('saves-wrap')
        .css('height', '280px')
        .append('<table class="lobby-table"><tr><th style="padding-left: 3px; width: 40px" onclick="sortTable(\'map-table\', 0)">Size</th><th style="padding-left: 3px; width: 178px" onclick="sortTable(\'map-table\', 1)">Name</th><th style="padding-left: 3px; width: 80px" onclick="sortTable(\'map-table\', 2)">Players</th></tr></table>')
        .append(svtScroll)
        .css('width', '300px')
    $('#region-maplist')
        .html('')
        .removeClass('text-placeholder')
        .append(svtCont)

    let nor = list.length
    if (nor < 8) nor = 8

    let rowlist = []

    for (let i = 0; i < nor; i++) {
        let row = $('<tr>')
            .addClass('saves-row')
            .css('height', '31px')
            .css('line-height', '28px')
        if (list[i] !== undefined)
            row.attr('mapName', list[i].mapName)
        rowlist.push(row)

        let cellSize = $('<td>')
            .html('')
            .css('width', '40px')
            .css('text-align', 'center')
        if (list[i] !== undefined) {
            cellSize.html(list[i].mapSize)
        }
        row.append(cellSize)

        let cellName = $('<td>')
            .html('')
            .css('width', '178px')
        if (list[i] !== undefined)
            cellName.html(list[i].mapName)
        row.append(cellName)

        let cellPlayers = $('<td>')
            .html('')
            .css('width', '61px')
            .css('text-align', 'center')
        if (list[i] !== undefined)
            cellPlayers.html(list[i].playerCount)
        row.append(cellPlayers)

        saveTable.append(row)

        if (room.admin.id != socket.id) continue
        row.click(() => {
            if (cellName.html() != '' && socket.roomMembers.length < parseInt(cellPlayers.html())) {
                socket.emit('select_map', row.attr('mapName'))
            }

        })
    }

    // display selected map
    if (room.map) UpdateSelectedMap(room.map)

    // update listeners - only for room admin
    if (room.admin.id != socket.id) return


    $('.map_list_entry').click(async function () {
        // emit map change to all users in room
        socket.emit('select_map', this.getAttribute('mapName'))
    })

}

async function UpdateSelectedMap(mapName) {
    let maplist = Object.values(document.getElementsByClassName('saves-row'))
    for (map of maplist) {
        map.classList.remove('saves-active')
        if (map.getAttribute('mapName') == mapName) {
            map.classList.add('saves-active')
        }
    }

    let tempMap = await mapsDB.importMap(mapName)
    MinimapCalc(tempMap.mapData)
}

async function UpdateRoomInfo() {
    let rooms = await socket.getRooms()
    let room = rooms.find(room => room.clients.find(client => client.id == socket.id))

    $('#socket-room-name').html(room.name)
    $('#socket-admin-name').html(room.admin.name)
    $('#socket-client-count').html(room.clients.length + '/' + room.size)
}

async function UpdateBottomPanel() {
    let rooms = await socket.getRooms()
    let room = rooms.find(room => room.clients.find(client => client.id == socket.id))

    if (room.admin.id == socket.id) {
        $('#button-start').html('Start Game')

        let everyone = true
        for (let client of room.clients) { // checking if everyone is ready
            if (!client.ready && room.admin.id != client.id) { // except for yourself
                everyone = false
            }
        }
        if (everyone)
            $('#button-start').removeAttr('disabled')
        else
            $('#button-start').attr('disabled', true)
    } else {
        let client = room.clients.find(client => client.id == socket.id)
        $('#button-start').html(`${client.ready ? 'Ready' : 'Not ready'}`)
    }
}

async function UpdateRoomMembers() { // placeholder function triggered by 'rooms_updated' event
    let rooms = await socket.getRooms()
    let room = rooms.find(room => room.clients.find(client => client.id == socket.id))

    $('#socket-players').html('')

    let display = $('<div>')
    socket.roomMembers = room.clients

    let amAdmin = socket.id == room.admin.id
    for (let i in room.clients) {
        display.append(new RoomMember(i, room.clients[i].name, room.clients[i].ready, room.clients[i].id == socket.id, amAdmin))
    }
    if (display.html() == '') display.html() = '[]'
    $('#socket-players').append(display)

    UpdateBottomPanel()
}

async function UpdateChat(msg) { // placeholder function triggered by 'chat' event
    let author = socket.roomMembers.find(client => client.id == msg.author)
    let uid = socket.roomMembers.indexOf(author)

    let chat = $('#socket-chat-display').html()
    chat += `<div style="display: inline; color: ` + memberColors[uid] + `; text-shadow: 2px 0px 1px #000000;">${author.name}</div>: ${msg.content} <br>`
    $('#socket-chat-display').html(chat)

    $("#socket-chat-display").scrollTop($("#socket-chat-display")[0].scrollHeight) // scroll chat to bottom
}
// #endregion

// #region Classes
class RoomMember {
    constructor(id, name, readyState, isMe, amAdmin) {
        let cont = $('<div>')
            .addClass('room-member')

        let nameTag = $('<div>')
            .addClass('room-member-name')
            .html(name)
            .css('color', memberColors[id])
        cont.append(nameTag)

        if (id != 0) {
            let ready = $('<div>')
                .addClass('room-member-ready')
                .html(readyState ? 'Ready' : 'Not ready')
                .css('color', readyState ? '#2FCF2F' : '#CF2F2F')
            cont.append(ready)
        } else {
            let ready = $('<div>')
                .addClass('room-member-ready')
                .html('Host')
                .css('color', '#CFCF2F')
            cont.append(ready)
        }

        if (isMe) {
            let youBadge = $('<div>')
                .addClass('room-member-you')
                .html('You')
            cont.append(youBadge)
        } else {
            if (amAdmin) {
                let kickButton = $('<button>')
                    .addClass('room-member-kick')
                    .html('Kick')
                    .click(() => {
                        socket.kick(socket.roomMembers[id].id)
                        console.log('--- LOG THE KICK TO CHAT HERE ---')
                    })
                cont.append(kickButton)
            } else {
                let clientBadge = $('<button>')
                    .addClass('room-member-client')
                    .html('Human') // If i ever get to creating bots (after we make a gameplay component LMAO)
                    .attr('disabled', true)
                cont.append(clientBadge)
            }
        }

        return cont
    }
}
// #endregion

//#region Helper Functions
function sortTable(tableId, cellId) {
    let table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0
    table = document.getElementById(tableId)
    switching = true
    dir = 'asc'
    while (switching) {
        switching = false
        rows = table.rows
        for (i = 0; i < (rows.length - 1); i++) {
            shouldSwitch = false
            x = rows[i].getElementsByTagName('TD')[cellId]
            y = rows[i + 1].getElementsByTagName('TD')[cellId]
            let nameCell = rows[i + 1].getElementsByTagName('TD')[1]
            if (dir == 'asc') {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase() && nameCell.innerHTML != '') {
                    shouldSwitch = true
                    break
                }
            } else if (dir == 'desc') {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase() && nameCell.innerHTML != '') {
                    shouldSwitch = true
                    break
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i])
            switching = true
            switchcount++
        } else {
            if (switchcount == 0 && dir == 'asc') {
                dir = 'desc'
                switching = true
            }
        }
    }
}

function MinimapCalc(levelPack) {
    let canvas = $('#minimap-canvas')
        .attr('width', parseInt(levelPack.size) * 8)
        .attr('height', parseInt(levelPack.size) * 8)

    let ctx = canvas[0].getContext('2d')

    ctx.scale(8, 8)

    for (let i in levelPack.level) {
        ctx.fillStyle = MASTER_BlockTypes[levelPack.level[i].type].editor.color
        ctx.fillRect(parseInt(levelPack.level[i].x), parseInt(levelPack.level[i].z), parseInt(levelPack.level[i].x) + 1, parseInt(levelPack.level[i].z) + 1)
    }
}
//#endregion