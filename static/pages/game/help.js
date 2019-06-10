function DisplayMegalovania() {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')
    $(window).off('keydown')

    popup.append('Dun dun da dun, dun dun dun dun Dun dun da dun, dun dun dun Dun dun da dun, dun dun dun dun dunna.Dun dun da dun, dun Dun dun da dun, dun dun dun dun dunna...')

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-errormsg',
        width: 500,
        height: 300,
        title: '[HELP] Megalovania',
        buttons: [
            {
                text: "Ok",
                'class': 'ui-dialog-button',
                click: function () {
                    $(this).dialog("close")
                    overlay.css('display', 'none')
                }
            }
        ]
    })
}

function DisplaySpawnTurn() {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')
    $(window).off('keydown')

    popup.append('-- PLACEHOLDER --')

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-errormsg',
        width: 500,
        height: 300,
        title: '[HELP] Spawn Turn',
        buttons: [
            {
                text: "Ok",
                'class': 'ui-dialog-button',
                click: function () {
                    help.spawnTurn = false
                    Cookies.set('help-spawnTurn', false, 7)
                    $(this).dialog("close")
                    overlay.css('display', 'none')
                }
            }
        ]
    })
}

function DisplaySpawnEnd() {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')
    $(window).off('keydown')

    popup.append('-- PLACEHOLDER --')

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-errormsg',
        width: 500,
        height: 300,
        title: '[HELP] Spawn End',
        buttons: [
            {
                text: "Ok",
                'class': 'ui-dialog-button',
                click: function () {
                    help.spawnEnd = false
                    Cookies.set('help-spawnEnd', false, 7)
                    $(this).dialog("close")
                    overlay.css('display', 'none')
                }
            }
        ]
    })
}

function DisplayEnemyTurn() {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')
    $(window).off('keydown')

    popup.append('-- PLACEHOLDER --')

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-errormsg',
        width: 500,
        height: 300,
        title: '[HELP] Enemy Turn',
        buttons: [
            {
                text: "Ok",
                'class': 'ui-dialog-button',
                click: function () {
                    help.enemyTurn = false
                    Cookies.set('help-enemyTurn', false, 7)
                    $(this).dialog("close")
                    overlay.css('display', 'none')
                }
            }
        ]
    })
}

function DisplayActionTurn() {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')
    $(window).off('keydown')

    popup.append('-- PLACEHOLDER --')

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-errormsg',
        width: 500,
        height: 300,
        title: '[HELP] Spawn Turn',
        buttons: [
            {
                text: "Ok",
                'class': 'ui-dialog-button',
                click: function () {
                    help.actionTurn = false
                    Cookies.set('help-actionTurn', false, 7)
                    $(this).dialog("close")
                    overlay.css('display', 'none')
                }
            }
        ]
    })
}