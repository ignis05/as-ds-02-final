//#region Global Variables
let pack
let cells
let cellSettings
let brushSize

let input

let mapsDB

const cellSize = 50
//#endregion 

/* ===================================================== *
 *  Editor completely sucks as of now, but is usable...  *
 *  ...in theory                                         *
 * ===================================================== */

$(document).ready(async () => {
    mapsDB = new MapDB()
    await mapsDB.create()

    pack = {}
    pack.size = $('#ctrl-lvlsize').val()
    pack.level = []

    brushSize = parseInt($('#ctrl-brushsize').val())

    cells = []
    cellSettings = {
        height: 5,
        type: 'dirt',
    }

    InputInit()
    CtrlsInit()

    // Define additional setting sliders here:
    new OptionSlider('height', 'Height', 0, 255, 1, 5)
})

//#region Init Functions
async function CtrlsInit() {
    $('#ctrl-genlvl').on('click', async function () {
        pack.size = $('#ctrl-lvlsize').val()

        let working = DisplayWorking('Generating...')
        setTimeout(async () => { // null-timeout added so dialog displays properly
            await createTiles()
            working.dialog('close')
            $('#overlay').css('display', 'none')
        }, 0)
    })

    let working = DisplayWorking('Generating...')
    setTimeout(async () => { // null-timeout added so dialog displays properly
        await createTiles()
        working.dialog('close')
        $('#overlay').css('display', 'none')
    }, 0)

    $('#ctrl-brushsize').on('change', function () {
        brushSize = parseInt($('#ctrl-brushsize').val())
    })

    $('#ctrl-backtomain').on('click', function () {
        DisplayMainMenu()
    })

    $('#ctrl-types').html('')

    let iter = 0
    for (let i in MASTER_BlockTypes) {
        if (MASTER_BlockTypes[i].editor != undefined) {
            let typeButton = $('<button>')
                .attr('id', 'ctrl-type' + iter)
                .html(i)
                .click(e => {
                    cellSettings.type = (e.target.innerHTML).toLowerCase()
                    clearTypes()
                    e.target.className = 'active'
                })

            if (iter == 0) typeButton.addClass('active')

            $('#ctrl-types').append(typeButton)

            iter++
        }
    }

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

function InputInit() {
    input = {
        leftMouse: false,
        rightMouse: false,
        middleMouse: false,
    }

    $(window).on('mousedown', e => {
        switch (e.which) {
            case 1:
                input.leftMouse = true
                cellClick()
                break
            case 2:
                input.middleMouse = true
                break
            case 3:
                input.rightMouse = true
                break
            default:
                console.error('Incorrect mouse event: ' + e.which)
        }
    })

    $(window).on('mouseup', e => {
        switch (e.which) {
            case 1:
                input.leftMouse = false
                break
            case 2:
                input.middleMouse = false
                break
            case 3:
                input.rightMouse = false
                break
            default:
                console.error('Incorrect mouse event: ' + e.which)
        }
    })
}
//#endregion

//#region Editor Internals
function clearTypes() {
    let buts = Array.from($('#ctrl-types')[0].children)
    for (let i in buts) {
        buts[i].className = ''
    }
}

function createTiles() {
    return new Promise((resolve, reject) => {
        pack.level = []
        cells = []
        $('#map').html('').css('width', pack.size * cellSize + cellSize + 'px').css('height', pack.size * cellSize + cellSize + 'px').css('position', 'relative')
        for (let i = 0; i < pack.size; i++) {
            for (let j = 0; j < pack.size; j++) {
                let cell = new Cell(i * pack.size + j, j, i)
                cells.push(cell)
                cell.object.on('click', cellClick)
                $('#map').append(cell.object)
            }
        }

        MinimapCalc(pack)
        $('#data').html(JSON.stringify(pack, null, 4))

        resolve('End')
    })
}

function cellClick() {
    let cellArray = Array.from($(document).find('.cell-active'))
    for (let i in cellArray) {

        cell = cellArray[i]
        cell.cell.type = cellSettings.type
        cell.cell.height = cellSettings.height
        cell.innerHTML = cell.height

        for (let j in pack.level) {
            let datapack = pack.level[j]
            if (datapack.id == cell.cell.id) {
                datapack.height = cell.cell.height
                datapack.type = cell.cell.type
                break
            }
        }
        cell.cell.setup()
    }

    MinimapCalc(pack)
    $('#data').html(JSON.stringify(pack, null, 4))

}

function loadMap(dataPack) {
    let data = dataPack.mapData
    if (data != null) {
        pack.size = data.size
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

        MinimapCalc(pack)
        $('#data').html(JSON.stringify(pack, null, 4))
    }
}
// #endregion

//#region Classes
class Cell {
    constructor(id, x, z) {
        this.id = id
        this.x = x
        this.z = z
        this.height = 5
        this.type = 'dirt'

        this.create()
        this.object
    }

    create() {
        let cont = $('<div>')
        cont.addClass('cell')
            .css('left', this.x * cellSize)
            .css('top', this.z * cellSize)
            .html(this.height)

        cont.on('mouseover', e => {
            let x = e.target.cell.x
            let z = e.target.cell.z
            for (let i = -(brushSize - 1) / 2; i < (brushSize + 1) / 2; i++) {
                for (let j = -(brushSize - 1) / 2; j < (brushSize + 1) / 2; j++) {
                    for (let k in cells) {
                        if (cells[k].x == x + i && cells[k].z == z + j) {
                            $(cells[k].object).addClass('cell-active')
                            break
                        }
                    }
                }
            }
            if (input.leftMouse) {
                cellClick()
            }
        })

        cont.on('mouseout', e => {
            let x = e.target.cell.x
            let z = e.target.cell.z
            for (let i = -(brushSize - 1) / 2; i < (brushSize + 1) / 2; i++) {
                for (let j = -(brushSize - 1) / 2; j < (brushSize + 1) / 2; j++) {
                    for (let k in cells) {
                        if (cells[k].x == x + i && cells[k].z == z + j) {
                            $(cells[k].object).removeClass('cell-active')
                            break
                        }
                    }
                }
            }
        })

        cont[0].cell = this
        this.object = cont
        this.setup()

        let datacont = {
            id: this.id,
            x: this.x,
            z: this.z,
            type: this.type,
            height: this.height
        }
        pack.level.push(datacont)
    }

    setup() {
        let cellInfo = MASTER_BlockTypes[this.type].editor

        this.object.css('backgroundColor', cellInfo.color)
        this.object.css('color', cellInfo.fontColor)

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
            .attr('type', 'range')
            .attr('min', min)
            .attr('max', max)
            .attr('step', step)
            .attr('value', initVal)
        cont.append(rng)

        let nud = $('<input>')
            .attr('type', 'number')
            .attr('min', min)
            .attr('max', max)
            .attr('step', step)
            .attr('value', initVal)
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

//#region Dialog Functions
function DisplaySave(list) {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')


    let saveTable = $('<table id="save-table">')
    let svtScroll = $('<div>').addClass('saves-cont').append(saveTable)
    let svtCont = $('<div>').addClass('saves-wrap').append('<table><tr><th onclick="sortTable(\'save-table\', 0)">Name</th><th onclick="sortTable(\'save-table\', 1)">Date</th></tr></table>').append(svtScroll)
    popup.append(svtCont)

    let name = $('<input>').attr('type', 'text').on('input', e => {
        if (e.target.value != '')
            $('#bSave').attr('disabled', false).removeClass('disabled')
        else
            $('#bSave').attr('disabled', true).addClass('disabled')
    })

    let nor = list.length
    if (nor < 9) nor = 9

    let rowlist = []

    for (let i = 0; i < nor; i++) {
        let row = $('<tr>').addClass('saves-row')
        rowlist.push(row)

        let cell0 = $('<td>').html('')
        if (list[i] !== undefined)
            cell0.html(list[i].mapName)
        row.append(cell0)

        let cell1 = $('<td>').html('')
        if (list[i] !== undefined)
            cell1.html(list[i].modDate.getCustomFormat())
        row.append(cell1)

        saveTable.append(row)
        row.click(() => {
            if (cell0.html() != '') {
                name.val(cell0.html()).trigger('input')
                rowlist.forEach(elem => {
                    elem.removeClass('saves-active')
                })
                row.addClass('saves-active')
            }
        })
    }

    popup.append(name)

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close  buttonpane-double',
        width: 600,
        height: 600,
        title: 'Save',
        buttons: [
            {
                id: 'bSave',
                disabled: true,
                text: 'Save',
                'class': 'ui-dialog-button disabled',
                click: async function () {
                    let saveName = name.val()
                    if (list.some(e => e.mapName == saveName)) {
                        $(this).dialog('close')
                        DisplayOverwrite(saveName)
                    } else {
                        $(this).dialog('close')
                        let working = DisplayWorking('Saving...')
                        await mapsDB.exportMap(saveName, pack)
                        working.dialog('close')
                        overlay.css('display', 'none')
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

function DisplayLoad(list) {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')


    let saveTable = $('<table id="save-table">')
    let svtScroll = $('<div>').addClass('saves-cont').append(saveTable)
    let svtCont = $('<div>').addClass('saves-wrap').append('<table><tr><th onclick="sortTable(\'save-table\', 0)">Name</th><th onclick="sortTable(\'save-table\', 1)">Date</th></tr></table>').append(svtScroll)
    popup.append(svtCont)

    let nor = list.length
    if (nor < 9) nor = 9

    let rowlist = []

    for (let i = 0; i < nor; i++) {
        let row = $('<tr>').addClass('saves-row')
        rowlist.push(row)

        let cell0 = $('<td>').html('')
        if (list[i] !== undefined)
            cell0.html(list[i].mapName)
        row.append(cell0)

        let cell1 = $('<td>').html('')
        if (list[i] !== undefined)
            cell1.html(list[i].modDate.getCustomFormat())
        row.append(cell1)

        saveTable.append(row)
        row.click(() => {
            if (cell0.html() != '') {
                name.val(cell0.html())
                rowlist.forEach(elem => {
                    elem.removeClass('saves-active')
                })
                row.addClass('saves-active')

                $('#bLoad').attr('disabled', false).removeClass('disabled')
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
        dialogClass: 'no-close  buttonpane-double',
        width: 600,
        height: 540,
        title: 'Load',
        buttons: [
            {
                id: 'bLoad',
                disabled: true,
                text: 'Load',
                'class': 'ui-dialog-button disabled',
                click: async function () {
                    $(this).dialog('close')
                    let working = DisplayWorking('Loading...')
                    loadMap(await mapsDB.importMap(name.val()))
                    working.dialog('close')
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
                click: async function () {
                    $(this).dialog('close')
                    let working = DisplayWorking('Saving...')
                    await mapsDB.exportMap(savedName, pack)
                    working.dialog('close')
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

function DisplayWorking(title = 'Please wait...') {
    let overlay = $('#overlay')
    let popup = $('#dialog').html('')

    if (overlay.css('display') == 'none')
        overlay.removeAttr('style')
    $(window).off('keydown')

    popup.append('<img id=\'popup-working-spinner\' src=\'/static/res/img/flavicon.png\'>')

    popup.dialog({
        closeOnEscape: false,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'no-close ui-dialog-errormsg',
        width: 500,
        height: 200,
        title: title,
        buttons: []
    })

    return popup
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

function MinimapCalc(levelPack) {
    let canvas = $('#minimap-canvas')
        .attr('width', parseInt(levelPack.size) * 8)
        .attr('height', parseInt(levelPack.size) * 8)

    let ctx = canvas[0].getContext('2d')

    ctx.scale(8, 8)

    for (let i in levelPack.level) {
        ctx.fillStyle = MASTER_BlockTypes[levelPack.level[i].type].editor.color
        ctx.fillRect(parseInt(levelPack.level[i].x), parseInt(levelPack.level[i].z), parseInt(levelPack.level[i].x) + 1, parseInt(levelPack.level[i].z) + 1)
    }
}
//#endregion