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
            // let testList = await Net.getTestPages()
            let testList = [
                {name: 'temp_option0'},
                {name: 'temp_option1'},
                {name: 'temp_option2'},
                {name: 'temp_option3'},
                {name: 'temp_option4'},
                {name: 'temp_option5'},
                {name: 'temp_option6'},
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
        if (list.length > 8) console.warn('DisplayTests might not display all options properly (amount > 8)')

        let overlay = $('#overlay')
        if (overlay.css('display') == 'none') {
            overlay.removeAttr('style')

            let winContainer = $('#container')
            winContainer.removeAttr('class')
            winContainer.addClass('win-list')
            winContainer.html('')
            winContainer.css('height', '' + (70 * list.length) + 'px' )

            $('#header').html('Tests')

            for (let i = 0; i < list.length; i++) {
                let bOption = $('<div>')
                bOption.addClass('window-button')
                bOption.html(list[i].name)
                winContainer.append(bOption)
                bOption.click(() => {
                    window.location = list[i].path
                })
            }

            $('#win-bBack').click(() => {
                overlay.css('display', 'none')
            })
        } else {
            throw 'DisplayTests was called incorrectly'
        }
    }

    function DisplayOptions(list) {
        if (list.length > 8) console.warn('DisplayOptions might not display all options properly (amount > 8)')

        let overlay = $('#overlay')
        if (overlay.css('display') == 'none') {
            overlay.removeAttr('style')

            let winContainer = $('#container')
            winContainer.removeAttr('class')
            winContainer.addClass('win-list')
            winContainer.html('')
            winContainer.css('height', '400px')

            $('#header').html('Options')

            for (let i = 0; i < list.length; i++) {
                let bOption = $('<div>')
                bOption.addClass('window-button')
                bOption.html(list[i].name)
                winContainer.append(bOption)
                bOption.click(() => {
                    // window.location = list[i].path
                })
            }

            $('#win-bBack').click(() => {
                overlay.css('display', 'none')
            })
        } else {
            throw 'DisplayOptions was called incorrectly'
        }
    }
    //#endregion
})