let testList

let optionList = [
    { name: 'Video Options', action: '$(\'#dialog\').dialog(\'close\'); OptionsVideo()' },
    { name: 'Sound Options', action: '$(\'#dialog\').dialog(\'close\'); OptionsSound()' },
    { name: 'Setup Identity', action: '$(\'#dialog\').dialog(\'close\'); OptionsNickname()' },
]

$(document).ready(async () => {
    console.log('document ready')



    testList = await Net.getTestPages()

    InitClicks()
})

//#region menu listeners
function InitClicks() {

    $('#bMain0').click(e => {
        if (!e.target.className.includes('disabled')) {
            window.location = '/'
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

function OptionsNickname() {
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

    popup.append(name)

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-confirm',
        width: 600,
        height: 260,
        title: 'Change Nickname',
        buttons: [
            {
                id: 'bApply',
                disabled: true,
                text: 'Apply',
                'class': 'ui-dialog-button disabled',
                click: function () {
                    let saveName = name.val()
                    console.log('TODO: Send nickname to server here - ' + saveName)
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
                    let saveName = name.val()
                    console.log('TODO: Send nickname to server here - ' + saveName)
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

    console.log('Get volume settings from cookies here')
    let musicCookie = 70
    let sfxCookie = 70
    let speechCookie = 70

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
        .attr('checked', true)
    cont.append(chk)
    //SoundOn Checkbox
    //================

    new OptionSlider('musVol', 'Music Volume', 0, 100, 1, musicCookie)
    new OptionSlider('sfxVol', 'Effects Volume', 0, 100, 1, sfxCookie)
    new OptionSlider('spcVol', 'Speech Volume', 0, 100, 1, speechCookie)

    /* let speechVol = $('<input>').attr('type', 'text').on('input', e => {
        if (e.target.value != '')
            $('#bApply').attr('disabled', false).removeClass('disabled')
        else
            $('#bApply').attr('disabled', true).addClass('disabled')
    })
    console.log('TODO: Set value of \'speechVol\' textbox from cookie here')
    popup.append(speechVol) */

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
                    console.log('TODO: Send volume values to cookies here:')
                    console.log('musVol = ' + $('#sndOn').find('#chk').prop('checked'))
                    console.log('musVol = ' + $('#musVol').find('#rng').val())
                    console.log('sfxVol = ' + $('#sfxVol').find('#rng').val())
                    console.log('spcVol = ' + $('#spcVol').find('#rng').val())
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