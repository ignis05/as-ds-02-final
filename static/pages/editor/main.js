
let pack
let type
let cells
let nextIn
let cellSettings

let mapsDB
let decision = null
let mapname = ''

// ==========================
// Editor completely sucks as of now, but is usable...
//  ...in theory
// ==========================

$(document).ready(async () => {
    mapsDB = new MapDB()
    await mapsDB.create()

    pack = {}
    pack.size = $('#ctrl-select').val()
    pack.level = []
    cells = []
    cellSettings = {
        height: 5,
        type: 'dirt',
    }
    init()
})


function init() {
    ctrlsInit()

    // Define additional setting sliders go here:
    new OptionSlider('height', 'Height', 0, 20, 1, 5)
}

// Clicks go here:
function ctrlsInit() {
    $('#ctrl-genlvl').on('click', function () {
        pack.size = $('#ctrl-select').val()
        createTiles()
    })
    createTiles()

    $('#ctrl-types').children().on('click', function () {
        type = this.innerHTML
        clearTypes()
        this.className = 'active'
    })

    $('#ctrl-backtomain').on('click', function () {
        DisplayMainMenu()
    })

    $('#ctrl-types').children().on('click', function () {
        cellSettings.type = (this.innerHTML).toLowerCase()
        clearTypes()
        this.className = 'active'
    })

    $('#editor-save').click(async e => {
        if (!e.target.className.includes('disabled')) {
            let mapList = await mapsDB.getMaps()
            DisplaySave(mapList)
        }
    })

    $('#editor-load').click(async e => {
        if (!e.target.className.includes('disabled')) {
            let mapList = await mapsDB.getMaps()
            DisplayLoad(mapList)
        }
    })
}

function clearTypes() {
    let buts = Array.from($('#ctrl-types')[0].children)
    for (let i in buts) {
        buts[i].className = ''
    }
}

function createTiles() {
    pack.level = []
    cells = []
    $('#map').html('').css('width', pack.size * 50 + 50 + 'px').css('height', pack.size * 50 + 50 + 'px').css('position', 'relative')
    for (let i = 0; i < pack.size; i++) {
        for (let j = 0; j < pack.size; j++) {
            let cell = new Cell(cells.length, j, i)
            cells.push(cell)
            cell.object.on('click', cellClick)
            $('#map').append(cell.object)
        }
    }
    $('#data').html(JSON.stringify(pack, null, 4))
}

function cellClick() {
    cell = this
    /* if (cell.dirOut == -1) {
        cell.dirIn = main.nextIn
        let datapack = {}
        datapack.id = cell.id
        datapack.x = cell.x
        datapack.z = cell.z
        datapack.dirOut = cell.dirOut
        datapack.dirIn = cell.dirIn
        datapack.type = cell.type
        pack.level.push(datapack)
    } */
    cell.type = cellSettings.type
    cell.height = cellSettings.height
    cell.innerHTML = cell.height

    switch (cellSettings.type) {
        case 'dirt':
            $(this).css('backgroundColor', '#338833')
            break
        case 'rock':
            $(this).css('backgroundColor', '#888888')
            break
    }

    for (let i in pack.level) {
        let datapack = pack.level[i]
        if (datapack.id === cell.cell.id) {
            datapack.height = cell.height
            datapack.type = cell.type
            break
        }
    }
    $('#data').html(JSON.stringify(pack, null, 4))
}

function loadMap(dataPack) {
    let data = dataPack.mapData
    if (data != null) {
        pack.size = data.size
        console.log(pack.size)
        createTiles()
        pack.level = data.level
        for (let i in data.level) {
            let dataPack = data.level[i]
            cells[dataPack.id].x = parseInt(dataPack.x)
            cells[dataPack.id].z = parseInt(dataPack.z)
            cells[dataPack.id].type = dataPack.type
            cells[dataPack.id].height = parseInt(dataPack.height)
            cells[dataPack.id].setup()
        }
        $('#data').html(JSON.stringify(pack, null, 4))
    } else {
        console.error('No such map!')
        /* pack.size = 2
        createTiles()
        $('#data').html(JSON.stringify(pack, null, 4)) */
    }
}

//#region classes
class Cell {
    constructor(id, x, z) {
        this.id = id
        this.x = x
        this.z = z
        this.height = 5
        this.type = 'dirt'
        //this.dirIn
        //this.dirOut

        this.create()
        this.object
    }

    create() {
        let cont = $('<div>')
        cont.addClass('cell')
        cont.css('left', this.x * 50)
        cont.css('top', this.z * 50)

        // cont.css('transform', 'translate(-50%, -50%) rotate(45deg) ')
        // cont.css('left', this.z * (50 * Math.sqrt(2) - 25 * Math.sqrt(2)) + 25 * Math.sqrt(2))
        // if (this.z % 2 == 0) {
        //     cont.css('top', this.x * (50 * Math.sqrt(2)) + 25 * Math.sqrt(2))
        // } else {
        //     cont.css('top', this.x * (50 * Math.sqrt(2)) + 50 * Math.sqrt(2))
        // }

        cont[0].cell = this
        cont.html(this.height)
        //this.dirOut = -1
        this.object = cont
        this.setup()

        let datacont = {}
        datacont.id = this.id
        datacont.x = this.x
        datacont.z = this.z
        datacont.type = this.type
        datacont.height = this.height
        pack.level.push(datacont)
    }

    setup() {
        switch (this.type) {
            case 'dirt':
                this.object.css('backgroundColor', '#338833')
                break
            case 'rock':
                this.object.css('backgroundColor', '#888888')
                break
        }
        this.object.html(this.height)
    }
}

class OptionSlider {
    constructor(settingName, rangeLabel, min, max, step, initVal) {
        let cont = $('<div>')
        cont.addClass('ctrl-slider')
        $('#ctrl-settings').append(cont)

        let lbl = $('<div>')
        lbl.html(rangeLabel)
        cont.append(lbl)

        let rng = $('<input>')
        rng.attr('type', 'range')
        rng.attr('min', min)
        rng.attr('max', max)
        rng.attr('step', step)
        rng.attr('value', initVal)
        cont.append(rng)

        let nud = $('<input>')
        nud.attr('type', 'number')
        nud.attr('min', min)
        nud.attr('max', max)
        nud.attr('step', step)
        nud.attr('value', initVal)
        cont.append(nud)

        rng.on('input', () => {
            nud.val(rng.val())
            cellSettings[settingName] = nud.val()
        })
        nud.change(() => {
            // Manual clamping to max and min -__-
            if (nud.val() > parseInt(nud.attr('max'))) nud.val(parseInt(nud.attr('max')))
            if (nud.val() < parseInt(nud.attr('min'))) nud.val(parseInt(nud.attr('min')))

            rng.val(nud.val())
            cellSettings[settingName] = nud.val()
        })
    }
}
//#endregion

//#region window functions
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



function DisplaySave(list) {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')


    let saveTable = $('<table>')
    let svtScroll = $('<div>').addClass('saves-cont').append(saveTable)
    let svtCont = $('<div>').addClass('saves-wrap').append('<table><tr><th>Name</th><th>Date</th></tr></table>').append(svtScroll)
    popup.append(svtCont)

    let nor = list.length
    if (nor < 9) nor = 9

    for (let i = 0; i < nor; i++) {
        let row = $('<tr>').addClass('saves-row')

        let cell0 = $('<td>').html('')
        if (list[i] !== undefined)
            cell0.html(list[i])
        row.append(cell0)

        let cell1 = $('<td>').html('')
        if (list[i] !== undefined)
            cell1.html('ignis pls fix')
        row.append(cell1)

        saveTable.append(row)
        row.click(() => {
            if (cell0.html() != '')
                name.val(cell0.html())
        })
    }

    let name = $('<input>').attr('type', 'text')
    popup.append(name)

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: "no-close",
        width: 600,
        height: 600,
        title: 'Save',
        buttons: [
            {
                text: "Save",
                'class': 'ui-dialog-button',
                click: function () {
                    let saveName = name.val()
                    if (list.includes(saveName)) {
                        $(this).dialog("close")
                        DisplayOverwrite(saveName)
                    } else {
                        mapsDB.exportMap(saveName, pack)
                        $(this).dialog("close")
                        overlay.css('display', 'none')
                    }
                }
            },
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

function DisplayLoad(list) {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')


    let saveTable = $('<table>')
    let svtScroll = $('<div>').addClass('saves-cont').append(saveTable)
    let svtCont = $('<div>').addClass('saves-wrap').append('<table><tr><th>Name</th><th>Date</th></tr></table>').append(svtScroll)
    popup.append(svtCont)

    let nor = list.length
    if (nor < 9) nor = 9

    for (let i = 0; i < nor; i++) {
        let row = $('<tr>').addClass('saves-row')

        let cell0 = $('<td>').html('')
        if (list[i] !== undefined)
            cell0.html(list[i])
        row.append(cell0)

        let cell1 = $('<td>').html('')
        if (list[i] !== undefined)
            cell1.html('ignis pls fix')
        row.append(cell1)

        saveTable.append(row)
        row.click(() => {
            if (cell0.html() != '')
                name.val(cell0.html())
            $('#bLoad').attr('disabled', false).removeClass('disabled')

        })
    }

    let name = $('<input>').attr('type', 'hidden')
    popup.append(name)

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close',
        width: 600,
        height: 600,
        title: 'Load',
        buttons: [
            {
                id: 'bLoad',
                disabled: true,
                text: 'Load',
                'class': 'ui-dialog-button disabled',
                click: async function () {
                    loadMap(await mapsDB.importMap(name.val()))
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

function DisplayMainMenu() {
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
        title: 'Exit to Main Menu?',
        buttons: [
            {
                text: 'Yes',
                'class': 'ui-dialog-button',
                click: function () {
                    console.log('lmao')
                    window.location = '/'
                }
            },
            {
                text: 'No',
                'class': 'ui-dialog-button',
                click: function () {
                    $(this).dialog('close')
                    overlay.css('display', 'none')
                }
            }
        ]
    })
}

function DisplayOverwrite(savedName) {
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
        title: 'Overwrite?',
        buttons: [
            {
                text: 'Yes',
                'class': 'ui-dialog-button',
                click: function () {
                    mapsDB.exportMap(savedName, pack)
                    $(this).dialog('close')
                    overlay.css('display', 'none')
                }
            },
            {
                text: 'No',
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