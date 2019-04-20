//#region Global Variables
let pack
let cells
let cellSettings

let mapsDB

const dtOptions = {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
}
//#endregion 

/* ===================================================== *
 *  Editor completely sucks as of now, but is usable...  *
 *  ...in theory                                         *
 * ===================================================== */

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

    CtrlsInit()

    // Define additional setting sliders here:
    new OptionSlider('height', 'Height', 0, 20, 1, 5)
})

//#region Init Functions
function CtrlsInit() {
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
//#endregion

//#region Editor Internals
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
            .css('left', this.x * 50)
            .css('top', this.z * 50)
            .html(this.height)

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
            cell1.html(new Intl.DateTimeFormat('en-GB', dtOptions).format(list[i].modDate).replace(',', ''))
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
                click: function () {
                    let saveName = name.val()
                    if (list.some(e => e.mapName == saveName)) {
                        $(this).dialog('close')
                        DisplayOverwrite(saveName)
                    } else {
                        mapsDB.exportMap(saveName, pack)
                        $(this).dialog('close')
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
            cell1.html(new Intl.DateTimeFormat('en-GB', dtOptions).format(list[i].modDate).replace(',', ''))
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
//#endregion