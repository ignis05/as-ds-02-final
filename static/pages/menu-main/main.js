//#region Global Variables
let socket = io('/lobby') // connect to socket instance
//#region Socket Setup
socket.on('error_token', () => {
    window.alert('You are already connected from this browser. If you want do connect another client try incognito mode or other browsers')
})

socket.on('rooms_updated', async () => {
    if ($('#room-table').filter(":visible").length) DisplayRooms()
})
//#endregion

//#endregion

$(document).ready(async () => {
    // Check if cookies exist and set them or prompt the user to set them
    InitName()
    InitCookies()

    InitClicks()
})

//#region Init Functions
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

function InitName() {
    if (Cookies.get('username') == '') { // if no name in cookies
        OptionsIdentity(true)
    }
}

function InitClicks() {
    $('#bMain0').click(async e => {
        if (!e.target.className.includes('disabled')) {
            DisplayRooms()
        }
    })

    $('#bMain1').click(async e => {
        if (!e.target.className.includes('disabled')) {
            // window.location = '/'
        }
    })

    $('#bMain2').click(async e => {
        if (!e.target.className.includes('disabled')) {
            DisplayTests()
        }
    })

    $('#bMain3').click(async e => {
        if (!e.target.className.includes('disabled')) {
            DisplayOptions()
        }
    })

    $('#bMain4').click(async e => {
        if (!e.target.className.includes('disabled')) {
            window.location = '/editor'
        }
    })
}
//#endregion

//#region Dialog Functions
async function DisplayRooms() {
    let list = await Socket_GetRooms()

    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')

    let saveTable = $('<table id="room-table">')
    let svtScroll = $('<div>').addClass('saves-cont').append(saveTable)
    let svtCont = $('<div>').addClass('saves-wrap').append('<table><tr><th onclick="sortTable(\'room-table\', 0)">Room Name</th><th onclick="sortTable(\'room-table\', 1)">Players</th></tr></table>').append(svtScroll)
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
            cell1.html(list[i].clients.length + ' / maxAmount')
        row.append(cell1)

        saveTable.append(row)
        row.click(() => {
            if (cell0.html() != '') {
                name.val(cell0.html())
                rowlist.forEach(elem => {
                    elem.removeClass('saves-active')
                })
                row.addClass('saves-active')

                $('#bJoin').attr('disabled', false).removeClass('disabled')
            }

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
                text: 'Join',
                'class': 'ui-dialog-button disabled',
                click: async function () {
                    socket.emit('carryRoomName', name.val()) // assign room that will be join on next socket connection
                    window.location = '/lobby'

                    /* $(this).dialog('close')
                    overlay.css('display', 'none') */
                }
            },
            {
                id: 'bHost',
                text: 'Host',
                'class': 'ui-dialog-button',
                click: async function () {
                    $(this).dialog('close')
                    RoomIdentity(list)
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

async function DisplayTests() {
    let list = await Net.getTestPages()

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

function DisplayOptions() {
    let list = [
        { name: 'Video Options', action: '$(\'#dialog\').dialog(\'close\'); OptionsVideo()' },
        { name: 'Sound Options', action: '$(\'#dialog\').dialog(\'close\'); OptionsSound()' },
        { name: 'Setup Identity', action: '$(\'#dialog\').dialog(\'close\'); OptionsIdentity()' },
    ]

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

function OptionsIdentity(firstCall) {
    if (typeof firstCall === 'undefined') { firstCall = false }

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
        width: 500,
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
                    if (firstCall) {
                        overlay.css('display', 'none')
                    } else {
                        DisplayOptions()
                    }
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
        height: 400,
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
                    DisplayOptions()
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
        .addClass('info-block')
    $('#dialog').append(cont)

    let lbl = $('<div>')
        .html('In-game Sound')
        .addClass('ui-dialog-button')
        .addClass('info-label')
    cont.append(lbl)

    lbl.click(() => {
        chk.click()
        if ($('#sndOn').find('#chk').prop('checked'))
            chkText.html('Yes')
        else
            chkText.html('No')
    })


    let ctrlCont = $('<div>')
        .addClass('info-elem')
    cont.append(ctrlCont)

    let chk = $('<input>')
        .attr('id', 'chk')
        .attr('type', 'checkbox')
        .prop('checked', soundCookie)
        .css('display', 'none')
    ctrlCont.append(chk)

    let chkText = $('<div>')
    ctrlCont.append(chkText)

    if (soundCookie)
        chkText.html('Yes')
    else
        chkText.html('No')
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
        height: 400,
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
                    DisplayOptions()
                }
            }
        ]
    })
}

function RoomIdentity(list) {
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

    name.val(Cookies.get('username') + '\'s Room')

    popup.append(name)

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-confirm',
        width: 500,
        height: 260,
        title: 'Room Setup', // This dialog will have basic options like password, eventually
        buttons: [
            {
                id: 'bApply',
                disabled: true,
                text: 'Apply',
                'class': 'ui-dialog-button disabled',
                click: function () {
                    let saveName = name.val()
                    if (list.some(e => e.name == saveName)) {
                        $(this).dialog('close')
                        RoomTaken(list)
                    } else {
                        socket.emit('carryRoomName', saveName)
                        window.location = '/lobby'
                    }
                },
            },
            {
                text: 'Back',
                'class': 'ui-dialog-button',
                click: async function () {
                    $(this).dialog('close')
                    DisplayRooms()
                },
            },
        ]
    })

    if (name.val() != '')
        $('#bApply').attr('disabled', false).removeClass('disabled')
}

function RoomTaken(list) {
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
        title: 'Name already taken',
        buttons: [
            {
                text: 'Ok',
                'class': 'ui-dialog-button',
                click: function () {
                    $(this).dialog('close')
                    RoomIdentity(list)
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
            .addClass('info-block')
        $('#dialog').append(cont)

        let lbl = $('<div>')
            .html(rangeLabel)
            .addClass('info-label')
        cont.append(lbl)

        let ctrlCont = $('<div>')
            .addClass('info-elem')
        cont.append(ctrlCont)

        let rng = $('<input>')
            .attr('id', 'rng')
            .attr('type', 'range')
            .attr('min', min)
            .attr('max', max)
            .attr('step', step)
            .attr('value', initVal)
            .addClass('info-slider')
        ctrlCont.append(rng)

        let nud = $('<input>')
            .attr('id', 'nud')
            .attr('type', 'number')
            .attr('min', min)
            .attr('max', max)
            .attr('step', step)
            .attr('value', initVal)
        ctrlCont.append(nud)

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
    Socket_SetName(Cookies.get('username'))
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

//#region Socket Functions
function Socket_SetName(nickname) {
    socket.emit('setName', nickname)
}

function Socket_GetRooms() {
    return new Promise(resolve => {
        socket.emit('getRooms', res => {
            resolve(res)
        })
    })
}

function Socket_GetClients() {
    return new Promise(resolve => {
        socket.emit('getClients', res => {
            resolve(res)
        })
    })
}
//#endregion