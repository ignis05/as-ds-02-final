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
    if (popupIsOpen) popup_chooseRoom() // if rooms popup is open - open it again with new data
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
    if (Cookies.get('username') == '') { // if no name in cookies
        /* let name = ''
        while (true) {
            name = window.prompt('Plz set UR username')
            if (name != '' && name != null) break
            else window.alert(`name can't be empty`)
        }
        Cookies.set('username', name, 7)
        socket_setName(name) */
        OptionsIdentity()
    }
}

var popupIsOpen = false // variable that checks if room popup is open

async function popup_chooseRoom() { // display rooms popup
    let rooms = await socket_getRooms()
    DisplayRooms(rooms)
    popupIsOpen = true
}

// I copied one of your select popups and modified it to work on rooms
// how it works:
// - through socket data is transfered between main and /lobby - that data being single string 'roomName'
// - on /lobby client tries to join room 'roomName', if room doen't exist client creates it
//
// no checking whether  client is trying to create room with name that already was taken - client will jist join this room, so that should be prevented here
function DisplayRooms(list) {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')


    let saveTable = $('<table id="save-table">')
    let svtScroll = $('<div>').addClass('saves-cont').append(saveTable)
    let svtCont = $('<div>').addClass('saves-wrap').append('<table><tr><th onclick="sortTable(\'save-table\', 0)">Name</th><th onclick="sortTable(\'save-table\', 1)">Date</th></tr></table>').append(svtScroll)
    popup.append(svtCont)

    let nor = list.length
    if (nor < 9) nor = 9

    let rowlist = []

    for (let i = 0; i < nor; i++) {
        let row = $('<tr>').addClass('saves-row')
        rowlist.push(row)

        let cell0 = $('<td>').html('')
        if (list[i] !== undefined)
            cell0.html(list[i].name)
        row.append(cell0)

        let cell1 = $('<td>').html('')
        if (list[i] !== undefined)
            cell1.html('')
        //cell1.html(new Intl.DateTimeFormat('en-GB', dtOptions).format(list[i].modDate).replace(',', ''))
        row.append(cell1)

        saveTable.append(row)
        row.click(() => {
            if (cell0.html() != '') {
                name.val(cell0.html())
                rowlist.forEach(elem => {
                    elem.removeClass('saves-active')
                })
                row.addClass('saves-active')
            }
            $('#bJoin').attr('disabled', false).removeClass('disabled')

        })
    }

    let name = $('<input>').attr('type', 'hidden')
    popup.append(name)

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close buttonpane-tripple',
        width: 600,
        height: 590,
        title: 'Lobby Select',
        buttons: [
            {
                id: 'bJoin',
                disabled: true,
                text: 'Load',
                'class': 'ui-dialog-button disabled',
                click: async function () {
                    socket.emit('carryRoomName', name.val()) // assign room that will be join on next socket connection
                    window.location = '/lobby' // redirect to /lobby

                    /* $(this).dialog('close')
                    overlay.css('display', 'none') */
                }
            },
            {
                id: 'bHost',
                text: 'Host',
                'class': 'ui-dialog-button',
                click: async function () {
                    let roomName = ''
                    while (true) {
                        roomName = window.prompt('Plz set room name')
                        if (roomName != '') break
                        else window.alert(`room name can't be empty`)
                    }
                    if (roomName == null) return // null will be assigned if someone presses cancel - it just closes prompt
                    socket.emit('carryRoomName', roomName) // assign room that will be join on next socket connection
                    window.location = '/lobby' // redirect to /lobby

                    /* $(this).dialog('close')
                    overlay.css('display', 'none') */
                }
            },
            {
                text: 'Back',
                'class': 'ui-dialog-button',
                click: function () {
                    $(this).dialog('close')
                    overlay.css('display', 'none')
                }
            }
        ]
    })

    /* let overlay = $('#overlay')
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
            socket.emit('carryRoomName', list[i].name) // assign room that will be join on next socket connection
            popupIsOpen = false
            window.location = '/lobby' // redirect to /lobby
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
        if (roomName == null) return // null will be assigned if someone presses cancel - it just closes prompt
        socket.emit('carryRoomName', roomName) // assign room that will be join on next socket connection
        popupIsOpen = false
        window.location = '/lobby' // redirect to /lobby
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
    }) */
}
// #endregion socket.io triggers and stuff

let testList

let optionList = [
    { name: 'Video Options', action: '$(\'#dialog\').dialog(\'close\'); OptionsVideo()' },
    { name: 'Sound Options', action: '$(\'#dialog\').dialog(\'close\'); OptionsSound()' },
    { name: 'Setup Identity', action: '$(\'#dialog\').dialog(\'close\'); OptionsIdentity()' },
]

$(document).ready(async () => {
    console.log('document ready')

    popup_setName() // trigger popup asking for name (if won't fire if name is already set though)

    testList = await Net.getTestPages()

    InitCookies()

    InitClicks()
})

function InitCookies() {
    if (Cookies.get('settings-sndOn') === '')
        Cookies.set('settings-sndOn', true, 7)

    if (Cookies.get('settings-musVol') === '')
        Cookies.set('settings-musVol', 75, 7)

    if (Cookies.get('settings-sfxVol') === '')
        Cookies.set('settings-sfxVol', 75, 7)

    if (Cookies.get('settings-spcVol') === '')
        Cookies.set('settings-spcVol', 75, 7)
}

//#region menu listeners
function InitClicks() {
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
            DisplayTests(testList)
        }
    })

    $('#bMain3').click(async e => {
        if (!e.target.className.includes('disabled')) {
            DisplayOptions(optionList)
        }
    })

    $('#bMain4').click(e => {
        if (!e.target.className.includes('disabled')) {
            window.location = '/editor'
        }
    })
}
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
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')

    for (let i = 0; i < list.length; i++) {
        let bOption = $('<div>')
        bOption.addClass('ui-dialog-button')
        bOption.html(list[i].name)
        popup.append(bOption)
        bOption.click(() => {
            if (list[i].action != undefined)
                eval(list[i].action)
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

function OptionsIdentity() {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')

    let name = $('<input>').css('margin-top', '20px').attr('type', 'text').on('input', e => {
        if (e.target.value != '')
            $('#bApply').attr('disabled', false).removeClass('disabled')
        else
            $('#bApply').attr('disabled', true).addClass('disabled')
    })

    name.val(Cookies.get('username'))

    popup.append(name)

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-confirm',
        width: 600,
        height: 260,
        title: 'Setup Identity',
        buttons: [
            {
                id: 'bApply',
                disabled: true,
                text: 'Apply',
                'class': 'ui-dialog-button disabled',
                click: function () {
                    Cookies.set('username', name.val(), 7)
                    ApplyIdentity()
                    $(this).dialog('close')
                    overlay.css('display', 'none')
                }
            }
        ]
    })

    if (name.val() != '')
        $('#bApply').attr('disabled', false).removeClass('disabled')
}

function OptionsVideo() {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')

    let name = $('<input>').css('margin-top', '20px').attr('type', 'text').on('input', e => {
        if (e.target.value != '')
            $('#bApply').attr('disabled', false).removeClass('disabled')
        else
            $('#bApply').attr('disabled', true).addClass('disabled')
    })

    console.log('TODO: Set value of \'name\' textbox from cookie here')
    console.log(Cookies.get('username'))
    name.val(Cookies.get('username'))

    popup.append(name)

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-confirm',
        width: 600,
        height: 350,
        title: 'Video Options',
        buttons: [
            {
                id: 'bApply',
                disabled: true,
                text: 'Apply',
                'class': 'ui-dialog-button disabled',
                click: function () {
                    ApplyVideo()
                    $(this).dialog('close')
                    overlay.css('display', 'none')
                }
            },
            {
                text: 'Back',
                'class': 'ui-dialog-button',
                click: function () {
                    $(this).dialog('close')
                    overlay.css('display', 'none')
                }
            }
        ]
    })
}

function OptionsSound() {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')

    let soundCookie = (Cookies.get('settings-sndOn') === 'true') // Convert from string to boolean ¯\_(ツ)_/¯
    let musicCookie = Cookies.get('settings-musVol')
    let sfxCookie = Cookies.get('settings-sfxVol')
    let speechCookie = Cookies.get('settings-spcVol')

    //================
    //SoundOn Checkbox
    let cont = $('<div>').attr('id', 'sndOn')
        .addClass('sndVol-elem')
    $('#dialog').append(cont)

    let lbl = $('<div>')
        .html('In-game Sound')
    cont.append(lbl)

    let chk = $('<input>')
        .attr('id', 'chk')
        .attr('type', 'checkbox')
        .prop('checked', soundCookie)
    cont.append(chk)
    //SoundOn Checkbox
    //================

    new OptionSlider('musVol', 'Music Volume', 0, 100, 1, musicCookie)
    new OptionSlider('sfxVol', 'Effects Volume', 0, 100, 1, sfxCookie)
    new OptionSlider('spcVol', 'Speech Volume', 0, 100, 1, speechCookie)

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-confirm',
        width: 600,
        height: 350,
        title: 'Sound Options',
        buttons: [
            {
                id: 'bApply',
                text: 'Apply',
                'class': 'ui-dialog-button',
                click: function () {
                    Cookies.set('settings-sndOn', $('#sndOn').find('#chk').prop('checked'), 7)
                    Cookies.set('settings-musVol', $('#musVol').find('#rng').val(), 7)
                    Cookies.set('settings-sfxVol', $('#sfxVol').find('#rng').val(), 7)
                    Cookies.set('settings-spcVol', $('#spcVol').find('#rng').val(), 7)
                    ApplySound()
                    $(this).dialog('close')
                    overlay.css('display', 'none')
                }
            },
            {
                text: 'Back',
                'class': 'ui-dialog-button',
                click: function () {
                    $(this).dialog('close')
                    overlay.css('display', 'none')
                }
            }
        ]
    })
}
//#endregion

//#region Classes
class OptionSlider {
    constructor(id, rangeLabel, min, max, step, initVal) {
        let cont = $('<div>').attr('id', id)
            .addClass('sndVol-elem')
        $('#dialog').append(cont)

        let lbl = $('<div>')
            .html(rangeLabel)
        cont.append(lbl)

        let rng = $('<input>')
            .attr('id', 'rng')
            .attr('type', 'range')
            .attr('min', min)
            .attr('max', max)
            .attr('step', step)
            .attr('value', initVal)
        cont.append(rng)

        let nud = $('<input>')
            .attr('id', 'nud')
            .attr('type', 'number')
            .attr('min', min)
            .attr('max', max)
            .attr('step', step)
            .attr('value', initVal)
        cont.append(nud)

        rng.on('input', () => {
            nud.val(rng.val())
        })
        nud.change(() => {
            // Manual clamping to max and min -__-
            if (nud.val() > parseInt(nud.attr('max'))) nud.val(parseInt(nud.attr('max')))
            if (nud.val() < parseInt(nud.attr('min'))) nud.val(parseInt(nud.attr('min')))

            rng.val(nud.val())
        })
    }
}
//#endregion

//#region Exec Setting Changes
function ApplySound() {
    console.warn('ApplySound not implemented!')
}

function ApplyVideo() {
    console.warn('ApplyVideo not implemented!')
}

function ApplyIdentity() {
    console.warn('ApplyIdentity not final!')
    socket_setName(Cookies.get('username'))
}
//#endregion

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
            if (dir == 'asc') {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase() && y.innerHTML != '') {
                    shouldSwitch = true
                    break
                }
            } else if (dir == 'desc') {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase() && y.innerHTML != '') {
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
//#endregion