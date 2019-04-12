$(document).ready(() => {
    console.log('document ready');

    //#region menu listeners
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