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

    popup.append('In this turn, you have to select units from the box at the bottom of the UI (next to the minimap) and choose a position for them to spawn.<br>Get clickin!')

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-errormsg',
        width: 500,
        height: 350,
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

    popup.append('Congratulations!<br>You have just placed all your units, now click the \'End Turn\' button in the top right corner to let the game advance')

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

    popup.append('Now your opponent is making his moves, wait patiently for your turn...<br>...or yell at him to make it quick, I am not your mother!')

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

    popup.append('Okay, this is where the fun begins!<br>You made it to the action turn, feel free to select your units (left click on their cells) and then tell them one by one to move to their destination.<br>If you are in range you might even choose to attack an enemy unit!<br>Now, get playing, let\'s get this bread!')

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-errormsg',
        width: 700,
        height: 400,
        title: '[HELP] Action Turn',
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