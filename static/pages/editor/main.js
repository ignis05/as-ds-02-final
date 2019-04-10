
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
        DisplayDialog('Exit to Main Menu?')
        Backtomain()
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
    $('#map').html('')
    for (let i = 0; i < pack.size; i++) {
        for (let j = 0; j < pack.size; j++) {
            let cell = new Cell(cells.length, i, j)
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
        cont.css('left', this.z * 50)
        cont.css('top', this.x * 50)

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
function DisplaySave(list) {
    if (list.length > 8) console.warn('DisplayLoad might not display all options properly (amount > 8)')

    let overlay = $('#overlay')
    if (overlay.css('display') == 'none') {
        overlay.removeAttr('style')

        let winContainer = $('#container')
        winContainer.removeAttr('class')
        winContainer.addClass('win-list')
        if (list.length == 0) {
            winContainer.css('height', '150px')
            winContainer.html('No maps saved')
        } else {
            winContainer.html('')
            winContainer.css('height', '' + (80 + 70 * list.length) + 'px')
        }

        $('#header').html('Save Map')

        let name = $('<input>')
        name.attr('type', 'text')

        for (let i = 0; i < list.length; i++) {
            let bOption = $('<div>')
            bOption.addClass('window-button')
            bOption.html(list[i])
            winContainer.append(bOption)
            bOption.click(async () => {
                name.val(list[i])
            })
        }
        winContainer.append(name)

        let bSave = $('<div>')
        bSave.addClass('window-button')
        bSave.html('Save')
        winContainer.append(bSave)
        bSave.click(async () => {
            let saveName = name.val()
            if (list.includes(saveName)) {
                DisplayDialog('Overwrite?')
                OverwriteExport(saveName)
            } else {
                mapsDB.exportMap(saveName, pack)
            }
        })

        $('#win-footer').removeAttr('style')
        $('#win-bBack').click(() => {
            overlay.css('display', 'none')
        })
    } else {
        throw 'DisplayLoad was called incorrectly'
    }
}

function DisplayLoad(list) {
    if (list.length > 8) console.warn('DisplayLoad might not display all options properly (amount > 8)')

    let overlay = $('#overlay')
    if (overlay.css('display') == 'none') {
        overlay.removeAttr('style')

        let winContainer = $('#container')
        winContainer.removeAttr('class')
        winContainer.addClass('win-list')
        if (list.length == 0) {
            winContainer.css('height', '70px')
            winContainer.html('No maps to load')
        } else {
            winContainer.html('')
            winContainer.css('height', '' + (70 * list.length) + 'px')
        }

        $('#header').html('Load Map')

        for (let i = 0; i < list.length; i++) {
            let bOption = $('<div>')
            bOption.addClass('window-button')
            bOption.html(list[i])
            winContainer.append(bOption)
            bOption.click(async () => {
                loadMap(await mapsDB.importMap(list[i]))
            })
        }

        $('#win-footer').removeAttr('style')
        $('#win-bBack').click(() => {
            overlay.css('display', 'none')
        })
    } else {
        throw 'DisplayLoad was called incorrectly'
    }
}

function DisplayDialog(headerText) {
    decision = null

    let overlay = $('#overlay')
    overlay.removeAttr('style')

    let winContainer = $('#container')
    winContainer.removeAttr('class')
    winContainer.addClass('win-dialog')
    winContainer.html('')
    winContainer.css('height', '100px')

    $('#header').html(headerText)

    let bYes = $('<div>')
    bYes.addClass('window-button')
    bYes.html('Yes')
    winContainer.append(bYes)
    bYes.click(() => {
        overlay.css('display', 'none')
        decision = true
    })

    let bNo = $('<div>')
    bNo.addClass('window-button')
    bNo.html('No')
    winContainer.append(bNo)
    bNo.click(() => {
        overlay.css('display', 'none')
        decision = false
    })

    $('#win-footer').css('display', 'none')
}
//#endregion

//#region misc functions
function Backtomain() {
    if (decision == null) {
        setTimeout(Backtomain, 500)
    } else if (decision) {
        window.location = '/'
    }
}

function OverwriteExport(savedName) {
    if (decision == null) {
        setTimeout(() => {OverwriteExport(savedName)}, 500)
    } else if (decision) {
        mapsDB.exportMap(savedName, pack)
    }
}
//#endregion