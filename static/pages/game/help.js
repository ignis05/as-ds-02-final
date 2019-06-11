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

    $('#help-spawnTurn').removeAttr('style')
    $('#help-enemyTurn').css('display', 'none')

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
                    $('#help-spawnTurn').css('display', 'none')
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

    $('#help-spawnEnd').removeAttr('style')
    $('#help-enemyTurn').css('display', 'none')

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
                    $('#help-spawnEnd').css('display', 'none')
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

    $('#help-enemyTurn').removeAttr('style')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')
    $(window).off('keydown')

    popup.append('Now your opponent is making his moves, wait patiently for your turn...<br>You will get notified in the upper right corner when your turn comes')

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
                    $('#help-enemyTurn').css('display', 'none')
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

    /* $('#help-actionTurn').removeAttr('style') */
    $('#help-enemyTurn').css('display', 'none')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')
    $(window).off('keydown')

    popup.append('Okay, this is where the fun begins!<br><p></p><br>Let\'s quickly go over the UI:<br>-Bars above characters represent HP, green are yours, red are opponents<br>As for status diamonds:<br> - Blue means this unit can still move<br> - Yellow means this unit is currently selected<br> - Red means this unit has already spent its action this turn<br><p></p><br>Got it?<br>Well then, let\'s get this bread!')

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-errormsg',
        width: 500,
        height: 550,
        title: '[HELP] Action Turn',
        buttons: [
            {
                text: "Ok",
                'class': 'ui-dialog-button',
                click: function () {
                    help.actionTurn = false
                    Cookies.set('help-actionTurn', false, 7)
                    /* $('#help-actionTurn').css('display', 'none') */
                    $(this).dialog("close")
                    overlay.css('display', 'none')
                }
            }
        ]
    })
}

function debug_resetHelp() {
    help = {
        spawnTurn: true,
        spawnEnd: true,
        enemyTurn: true,
        actionTurn: true
    }

    Cookies.set('help-spawnTurn', true, 7)
    Cookies.set('help-spawnEnd', true, 7)
    Cookies.set('help-enemyTurn', true, 7)
    Cookies.set('help-actionTurn', true, 7)

    window.location = '/game'
}