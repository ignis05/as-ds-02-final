// #region socket.io triggers and stuff
// initialization:
var socket = io(`/lobby`); // connect to socket instance `/lobby` (fyi actual path used by socket is http://host:port/socket.io/lobby - so this won't cause any errors)

// triggers when someone tries to connect using token that is alredy in use - buttons should be blocked, etc
socket.on('error_token', () => {
    window.alert('You are already connected from this browser. If you want do connect another client try incognito mode or other browsers')
    // window.location = '/'
})

// triggers when someone joins / leaves / creates a room - conveinient to update room list
socket.on('rooms_updated', () => {
    // >>here sth that will update room list<<
    if (popupIsOpen) popup_chooseRoom()
})

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

// primitive placeholder popup to specify name
function popup_setName() {
    if (Cookies.get('username') == '') {
        let name = ''
        while (true) {
            name = window.prompt('Plz set UR username')
            if (name != '' && name != null) break
            else window.alert(`name can't be empty`)
        }
        Cookies.set('username', name, 7)
        socket_setName(name)
    }
}

var popupIsOpen = false

async function popup_chooseRoom() {
    let rooms = await socket_getRooms()
    DisplayRooms(rooms)
    popupIsOpen = true
}


function DisplayRooms(list) {
    let overlay = $('#overlay')
    let popup = $('#dialog')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')

    popup.html('')
    for (let i = 0; i < list.length; i++) {
        let bOption = $('<div>')
        bOption.addClass('ui-dialog-button')
        bOption.html(list[i].name)
        popup.append(bOption)
        bOption.click(() => {
            socket.emit('carryRoomName', list[i].name)
            popupIsOpen = false
            window.location = '/lobby'
        })
    }

    let bOption = $('<div>')
    bOption.addClass('ui-dialog-button')
    bOption.html(`Create new room`)
    popup.append(bOption)
    bOption.click(() => {
        let roomName = ''
        while (true) {
            roomName = window.prompt('Plz set room name')
            if (roomName != '') break
            else window.alert(`room name can't be empty`)
        }
        if (roomName == null) return
        socket.emit('carryRoomName', roomName)
        popupIsOpen = false
        window.location = '/lobby'
    })

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: "no-close",
        width: 600,
        height: list.length * 50 + 200 + 50,
        maxHeight: 300,
        title: 'Tests',
        buttons: [
            {
                text: "Back",
                'class': 'ui-dialog-button',
                click: function () {
                    popupIsOpen = false
                    $(this).dialog("close")
                    overlay.css('display', 'none')
                }
            }
        ]
    })
}
// #endregion socket.io triggers and stuff

$(document).ready(() => {
    console.log('document ready');
    popup_setName()

    //#region menu listeners
    $('#bMain0').click(e => {
        if (!e.target.className.includes('disabled')) {
            popup_chooseRoom()
        }
    })

    $('#bMain1').click(e => {
        if (!e.target.className.includes('disabled')) {
            // window.location = '/'
        }
    })

    $('#bMain2').click(async e => {
        if (!e.target.className.includes('disabled')) {
            let testList = await Net.getTestPages()
            DisplayTests(testList)
        }
    })

    $('#bMain3').click(async e => {
        if (!e.target.className.includes('disabled')) {
            let testList = await Net.getTestPages()
            testList = [
                { name: 'temp_option0' },
                { name: 'temp_option1' },
                { name: 'temp_option2' },
                { name: 'temp_option3' },
                { name: 'temp_option4' },
                { name: 'temp_option5' },
                { name: 'temp_option6' },
            ]
            DisplayOptions(testList)
        }
    })

    $('#bMain4').click(e => {
        if (!e.target.className.includes('disabled')) {
            window.location = '/editor'
        }
    })
    //#endregion

    //#region window functions
    function DisplayTests(list) {
        let overlay = $('#overlay')
        let popup = $('#dialog')

        if (overlay.css('display') == 'none')
            overlay.removeAttr('style')

        popup.html('')
        for (let i = 0; i < list.length; i++) {
            let bOption = $('<div>')
            bOption.addClass('ui-dialog-button')
            bOption.html(list[i].name)
            popup.append(bOption)
            bOption.click(() => {
                window.location = list[i].path
            })
        }

        popup.dialog({
            closeOnEscape: false,
            modal: true,
            draggable: false,
            resizable: false,
            dialogClass: "no-close",
            width: 600,
            height: list.length * 50 + 200,
            maxHeight: 300,
            title: 'Tests',
            buttons: [
                {
                    text: "Back",
                    'class': 'ui-dialog-button',
                    click: function () {
                        $(this).dialog("close")
                        overlay.css('display', 'none')
                    }
                }
            ]
        })
    }

    function DisplayOptions(list) {
        let overlay = $('#overlay')
        let popup = $('#dialog')

        if (overlay.css('display') == 'none')
            overlay.removeAttr('style')

        popup.html('')
        for (let i = 0; i < list.length; i++) {
            let bOption = $('<div>')
            bOption.addClass('ui-dialog-button')
            bOption.html(list[i].name)
            popup.append(bOption)
            bOption.click(() => {
                // window.location = list[i].path
            })
        }

        popup.dialog({
            closeOnEscape: false,
            modal: true,
            draggable: false,
            resizable: false,
            dialogClass: "no-close",
            width: 600,
            height: list.length * 50 + 200,
            maxHeight: 300,
            title: 'Game Options',
            buttons: [
                {
                    text: "Back",
                    'class': 'ui-dialog-button',
                    click: function () {
                        $(this).dialog("close")
                        overlay.css('display', 'none')
                    }
                }
            ]
        })
    }
    //#endregion
})