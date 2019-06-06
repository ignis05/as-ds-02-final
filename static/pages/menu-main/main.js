//#region Global Variables
let socket = io('/lobby') // connect to socket instance
//#region Socket Setup
socket.on('error_token', () => {
    //window.alert('You are already connected from this browser. If you want to connect another client try incognito mode or other browsers')

    DisplayMultiTabError()
})

// triggers when someone in ongoing session joins main menu
socket.on('reconnect_to_game', () => {
    window.alert('You are in ongoing game')
    window.location = '/game'
})


socket.on('rooms_updated', async () => {
    if ($('#room-table').filter(":visible").length) DisplayRooms()
})
//#endregion

//#endregion

/* =================================================== *
 * $(window).off('keydown') is triggered every prompt! *
 * =================================================== */

$(document).ready(async () => {
    // Check if cookies exist and set them or prompt the user to set them
    InitName()
    InitCookies()

    InitClicks()

    socket.emit('room_leave')
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

    if (Cookies.get('settings-aaOn') === '')
        Cookies.set('settings-aaOn', true, 7)

    if (Cookies.get('settings-resScale') === '')
        Cookies.set('settings-resScale', 1, 7)
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
function DisplayMultiTabError() {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')
    $(window).off('keydown')

    popup.append('You are already connected from this browser. If you want to connect as another client try incognito mode or other browsers')

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-errormsg',
        width: 500,
        height: 250,
        title: 'MultiTab Error'
    })
}

async function DisplayRooms() {
    let list = await Socket_GetRooms()

    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')
    $(window).off('keydown')

    let saveTable = $('<table>')
        .attr('id', 'room-table')
        .addClass('lobby-table')
    let svtScroll = $('<div>')
        .addClass('saves-cont')
        .append(saveTable)
    let svtCont = $('<div>')
        .addClass('saves-wrap')
        .append('<table class="lobby-table"><tr><th onclick="sortTable(\'room-table\', 0)">PW</th><th style="width: 300px" onclick="sortTable(\'room-table\', 1)">Room Name</th><th onclick="sortTable(\'room-table\', 2)">Players</th></tr></table>')
        .append(svtScroll)
    popup.append(svtCont)

    let nor = list.length
    if (nor < 9) nor = 9

    let rowlist = []

    for (let i = 0; i < nor; i++) {
        let row = $('<tr>').addClass('saves-row')
        rowlist.push(row)

        let cellPass = $('<td>').html('') //.css('border-right', '2px solid #FFFFFF') //.css('text-align', 'center')
        if (list[i] !== undefined)
            if (list[i].password)
                cellPass.html('X')
            else
                cellPass.html('')
        row.append(cellPass)

        let cellName = $('<td>').html('').css('width', '300px')
        if (list[i] !== undefined)
            cellName.html(list[i].name)
        row.append(cellName)

        let cellPlayers = $('<td>').html('')
        if (list[i] !== undefined)
            cellPlayers.html(list[i].clients.length + ' / ' + list[i].size)
        row.append(cellPlayers)

        saveTable.append(row)
        row.click(() => {
            let connected = cellPlayers.html().replace(' ', '').split('/')
            if (cellName.html() != '' && parseInt(connected[0]) < parseInt(connected[1])) {
                name.val(cellName.html())

                if (cellPass.html() == 'X')
                    requestPass = true
                else
                    requestPass = false

                rowlist.forEach(elem => {
                    elem.removeClass('saves-active')
                })
                row.addClass('saves-active')

                $('#bJoin').attr('disabled', false).removeClass('disabled')
            }

        })
    }

    $(window).on('keydown', e => {
        let bTarget = $('#bJoin')
        if (e.originalEvent.code == 'Enter' && !bTarget.prop('disabled')) {
            bTarget.trigger('click')
        }
    })

    let name = $('<input>').attr('type', 'hidden')
    let requestPass = false
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
                    if (!requestPass) {
                        socket.emit('carryRoom', name.val())
                        window.location = '/lobby'
                    } else {
                        RequestPass(name.val())
                    }
                }
            },
            {
                id: 'bHost',
                text: 'Host',
                'class': 'ui-dialog-button',
                click: async function () {
                    $(this).dialog('close')
                    RoomSetup(list)
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

function RequestPass(roomName) {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')
    $(window).off('keydown')

    let pass = $('<input>').css('margin-top', '20px').attr('type', 'password').on('input', e => {
        if (e.target.value != '')
            $('#bApply').attr('disabled', false).removeClass('disabled')
        else
            $('#bApply').attr('disabled', true).addClass('disabled')
    })

    $(window).on('keydown', e => {
        let bTarget = $('#bApply')
        if (e.originalEvent.code == 'Enter' && !bTarget.prop('disabled')) {
            bTarget.trigger('click')
        }
    })

    popup.append(pass)

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-confirm',
        width: 500,
        height: 260,
        title: 'Enter Password',
        buttons: [
            {
                id: 'bApply',
                disabled: true,
                text: 'Apply',
                'class': 'ui-dialog-button disabled',
                click: async function () {
                    let passwd = pass.val()
                    if (await Socket_CheckPassword(roomName, passwd)) {
                        socket.emit('carryRoom', roomName, passwd)
                        window.location = '/lobby'
                    } else {
                        DisplayBadPassword()
                    }
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
    $(window).off('keydown')

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
        { name: 'Game Options', action: '$(\'#dialog\').dialog(\'close\'); OptionsGame()' },
        { name: 'Video Options', action: '$(\'#dialog\').dialog(\'close\'); OptionsVideo()' },
        { name: 'Sound Options', action: '$(\'#dialog\').dialog(\'close\'); OptionsSound()' },
        { name: 'Setup Identity', action: '$(\'#dialog\').dialog(\'close\'); OptionsIdentity()' },
    ]

    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')
    $(window).off('keydown')

    for (let i = 0; i < list.length; i++) {
        let bOption = $('<div>')
        bOption.addClass('ui-dialog-button')
        bOption.html(list[i].name)
        popup.append(bOption)
        bOption.click(() => {
            if (list[i].action != undefined)
                eval(list[i].action)
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
    $(window).off('keydown')

    let name = $('<input>').css('margin-top', '20px').attr('type', 'text').on('input', e => {
        if (e.target.value != '')
            $('#bApply').attr('disabled', false).removeClass('disabled')
        else
            $('#bApply').attr('disabled', true).addClass('disabled')
    })

    name.val(Cookies.get('username'))

    $(window).on('keydown', e => {
        let bTarget = $('#bApply')
        if (e.originalEvent.code == 'Enter' && !bTarget.prop('disabled')) {
            bTarget.trigger('click')
        }
    })

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

function OptionsGame() {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')
    $(window).off('keydown')

    $(window).on('keydown', e => {
        let bTarget = $('#bApply')
        if (e.originalEvent.code == 'Enter' && !bTarget.prop('disabled')) {
            bTarget.trigger('click')
        }
    })

    popup.html('-- PLACEHOLDER --')
        .css('color', '#00FF00')
        .css('font-weight', 'bolder')
        .css('font-size', '1.5em')

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-confirm',
        width: 600,
        height: 400,
        title: 'Game Options',
        buttons: [
            {
                id: 'bApply',
                disabled: true,
                text: 'Apply',
                'class': 'ui-dialog-button disabled',
                click: function () {
                    ApplyGame()
                    $(this).dialog('close')
                    overlay.css('display', 'none')
                }
            },
            {
                text: 'Back',
                'class': 'ui-dialog-button',
                click: function () {
                    popup.removeAttr('style') // TEMPORARY OPTION

                    $(this).dialog('close')
                    DisplayOptions()
                }
            }
        ]
    })
}

function OptionsVideo() {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')
    $(window).off('keydown')

    let aaCookie = (Cookies.get('settings-aaOn') === 'true') // Convert from string to boolean ¯\_(ツ)_/¯
    let resCookie = Cookies.get('settings-resScale')

    //================
    //AntiAliasOn Checkbox
    let cont = $('<div>').attr('id', 'aaOn')
        .addClass('info-block')
    $('#dialog').append(cont)

    let lbl = $('<div>')
        .html('Anti-Aliasing')
        .addClass('ui-dialog-button')
        .addClass('info-label')
    cont.append(lbl)

    lbl.click(() => {
        chk.click()
        if ($('#aaOn').find('#chk').prop('checked'))
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
        .prop('checked', aaCookie)
        .css('display', 'none')
    ctrlCont.append(chk)

    let chkText = $('<div>')
    ctrlCont.append(chkText)

    if (aaCookie)
        chkText.html('Yes')
    else
        chkText.html('No')
    //AntiAliasOn Checkbox
    //================

    let resVals = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
    let resLbls = ['50%', '75%', '100%', '125%', '150%', '175%', '200%']
    console.log(resCookie)
    console.log(resVals.indexOf(parseFloat(resCookie)))
    let resIndex = resVals.indexOf(parseFloat(resCookie)) != -1 ? resVals.indexOf(parseFloat(resCookie)) : 2
    console.log(resIndex)
    new VideoOption('resScale', 'Resolution Scale', resLbls, resVals, resIndex)

    $(window).on('keydown', e => {
        let bTarget = $('#bApply')
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
        width: 600,
        height: 300,
        title: 'Video Options',
        buttons: [
            {
                id: 'bApply',
                text: 'Apply',
                'class': 'ui-dialog-button',
                click: function () {
                    Cookies.set('settings-aaOn', $('#aaOn').find('#chk').prop('checked'), 7)
                    Cookies.set('settings-resScale', $('#resScale').find('#sel').val(), 7)
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
    $(window).off('keydown')

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

    new SoundOption('musVol', 'Music Volume', 0, 100, 1, musicCookie)
    new SoundOption('sfxVol', 'Effects Volume', 0, 100, 1, sfxCookie)
    new SoundOption('spcVol', 'Speech Volume', 0, 100, 1, speechCookie)

    $(window).on('keydown', e => {
        let bTarget = $('#bApply')
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
                    DisplayOptions()
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

function RoomSetup(list) {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')
    $(window).off('keydown')


    let NameCont = $('<div>')
        .addClass('info-block')
    $('#dialog').append(NameCont)

    let nameLbl = $('<div>')
        .html('Room Name')
        .addClass('info-label')
    NameCont.append(nameLbl)

    let ctrlNameCont = $('<div>')
        .addClass('info-elem')
    NameCont.append(ctrlNameCont)

    let name = $('<input>').attr('type', 'text').on('input', e => {
        if (e.target.value != '')
            $('#bApply').attr('disabled', false).removeClass('disabled')
        else
            $('#bApply').attr('disabled', true).addClass('disabled')
    })

    ctrlNameCont.append(name)


    let passwordCont = $('<div>')
        .addClass('info-block')
    $('#dialog').append(passwordCont)

    let passwordLbl = $('<div>')
        .html('Password')
        .addClass('info-label')
    passwordCont.append(passwordLbl)

    let ctrlpasswordCont = $('<div>')
        .addClass('info-elem')
    passwordCont.append(ctrlpasswordCont)

    let password = $('<input>').attr('type', 'password')

    ctrlpasswordCont.append(password)


    let sizeCont = $('<div>')
        .addClass('info-block')
    $('#dialog').append(sizeCont)

    let sizeLbl = $('<div>')
        .html('Room Size')
        .addClass('info-label')
    sizeCont.append(sizeLbl)

    let ctrlsizeCont = $('<div>')
        .addClass('info-elem')
    sizeCont.append(ctrlsizeCont)

    let size = $('<input>').attr('type', 'text')

    ctrlsizeCont.append(size)


    name.val(Cookies.get('username') + '\'s Room')
    size.val('2')

    $(window).on('keydown', e => {
        let bTarget = $('#bApply')
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
        width: 600,
        height: 460,
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
                        let passwd = password.val() != '' ? password.val() : false
                        let roomSize = size.val() != '' ? parseInt(size.val()) : 2
                        if (isNaN(roomSize) || roomSize < 2) roomSize = 2

                        socket.emit('carryRoom', saveName, passwd, roomSize)
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
    $(window).off('keydown')

    $(window).on('keydown', e => {
        let bTarget = $('#bApply')
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
        title: 'Name already taken',
        buttons: [
            {
                id: 'bApply',
                text: 'Ok',
                'class': 'ui-dialog-button',
                click: function () {
                    $(this).dialog('close')
                    RoomSetup(list)
                }
            }
        ]
    })
}

function DisplayBadPassword() {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')
    $(window).off('keydown')

    $(window).on('keydown', e => {
        let bTarget = $('#bApply')
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
        title: 'Incorrect Password',
        buttons: [
            {
                id: 'bApply',
                text: 'Ok',
                'class': 'ui-dialog-button',
                click: function () {
                    $(this).dialog('close')
                    DisplayRooms()
                }
            }
        ]
    })
}
//#endregion

//#region Classes
class SoundOption {
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

        let nudBox = $('<div>')
            .addClass('info-nudBox')
        ctrlCont.append(nudBox)


        let nud = $('<input>')
            .attr('id', 'nud')
            .attr('type', 'number')
            .attr('min', min)
            .attr('max', max)
            .attr('step', step)
            .attr('value', initVal)
            .attr('pattern', '[0-9]{3}')
        nudBox.append(nud)

        rng.on('input', () => {
            nud.val(rng.val())
        })
        nud.change(() => {
            if (isNaN(parseInt(nud.val()))) nud.val(parseInt(Cookies.get('settings-' + id)))

            // Manual clamping to max and min -__-
            if (nud.val() > parseInt(nud.attr('max'))) nud.val(parseInt(nud.attr('max')))
            if (nud.val() < parseInt(nud.attr('min'))) nud.val(parseInt(nud.attr('min')))

            rng.val(nud.val())
        })
    }
}

class VideoOption {
    constructor(id, selectLabel, optionLabels, optionValues, initValIndex) {
        console.log(initValIndex)
        let cont = $('<div>')
            .attr('id', id)
            .addClass('info-block')
        $('#dialog').append(cont)

        let lbl = $('<div>')
            .html(selectLabel)
            .addClass('info-label')
        cont.append(lbl)

        let ctrlCont = $('<div>')
            .attr('id', 'ctrlCont')
            .addClass('info-elem')
        cont.append(ctrlCont)

        let sel = $('<select>')
            .attr('id', 'sel')
            .addClass('info-select')
        ctrlCont.append(sel)

        for (let i in optionLabels) {
            let option = $('<option>')
                .html(optionLabels[i])
                .attr('value', optionValues[i])
            if (i == initValIndex) option.attr('selected', true)
            sel.append(option)
        }
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

function ApplyGame() {
    console.warn('ApplyGame not implemented!')
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

// returns true if password is correct
function Socket_CheckPassword(roomName, roomPassword) {
    return new Promise(resolve => {
        socket.emit('room_check_password', roomName, roomPassword, res => {
            resolve(res)
        })
    })
}
//#endregion