$(document).ready(() => {
    console.log('document ready');

    //#region menu listeners
    $('#bMain0').click(e => {
        if (!e.target.className.includes('disabled')) {
            window.location = '/static/pages/menu-main/main.html'
        }
    })

    $('#bMain1').click(e => {
        if (!e.target.className.includes('disabled')) {
            window.location = '/static/pages/menu-main/main.html'
        }
    })

    $('#bMain2').click(e => {
        if (!e.target.className.includes('disabled')) {
            // window.location = '/static/pages/menu-main/main.html'
            DisplayTests(testList)
        }
    })

    $('#bMain3').click(e => {
        if (!e.target.className.includes('disabled')) {
            window.location = '/static/pages/menu-main/main.html'
        }
    })

    $('#bMain4').click(e => {
        if (!e.target.className.includes('disabled')) {
            window.location = '/static/pages/menu-main/main.html'
        }
    })
    //#endregion

    let testList = [
        {
            name: 'test0',
            path: '/static/pages/menu-main/main.html'
        },
        {
            name: 'test1',
            path: '/static/pages/menu-main/main.html'
        },
        {
            name: 'test2',
            path: '/static/pages/menu-main/main.html'
        },
        {
            name: 'test3',
            path: '/static/pages/menu-main/main.html'
        },
        {
            name: 'test4',
            path: '/static/pages/menu-main/main.html'
        },
    ]

    function DisplayTests(list) {
        if (list.length > 6) console.warn('DisplayTests might not display all options properly (amount > 6)')

        let overlay = $('#overlay')
        if (overlay.css('display') == 'none') {
            overlay.removeAttr('style')

            let winContainer = $('#container')
            winContainer.html('')

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
})