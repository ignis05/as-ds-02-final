class Main {
    constructor() {
        console.log('main.js initialized')
        this.pack = {}
        this.pack.size = $('#ctrl-select').val()
        this.pack.level = []
        this.type  = 'wall'
        this.hexes = []
        this.nextIn = -1
        this.init()
    }

    init() {
        this.ctrlsInit()
    }
    
    ctrlsInit() {
        $('#ctrl-genlvl').on('click', function () {
            main.pack.size = $('#ctrl-select').val()
            main.createTiles()
            main.nextIn = -1
        })
        this.createTiles()

        $('#ctrl-send').on('click', function() {
            main.sendLevel()
        })

        $('#ctrl-load').on('click', function() {
            net.loadLvl()
        })

        $('#ctrl-types').children().on('click', function() {
            main.type  = this.innerHTML
            main.clearTypes()
            this.className = 'active'
        })

        $('#ctrl-rungame').on('click', function() {
            window.location = '/game'
        })
    }

    clearTypes() {
        let buts = Array.from($('#ctrl-types')[0].children)
        for (let i in buts) {
            buts[i].className = ''
        }
    }

    createTiles() {
        this.pack.level = []
        this.hexes = []
        $('#cont').html('')
        for (let i = 0; i < this.pack.size; i++) {
            for (let j = 0; j < this.pack.size; j++) {
                let hex = new Cell(this.hexes.length, i, j)
                this.hexes.push(hex)
                hex.object.on('click', this.hexClick)
                $('#cont').append(hex.object)
            }
        }
        $('#data').html(JSON.stringify(this.pack, null, 4))
    }

    hexClick() {
        if (this.hex.dirOut == -1) {
            this.hex.dirIn = main.nextIn
            let dataPack = {}
            dataPack.id = this.hex.id
            dataPack.x = this.hex.x
            dataPack.z = this.hex.z
            dataPack.dirOut = this.hex.dirOut
            dataPack.dirIn = this.hex.dirIn
            dataPack.type = this.hex.type
            main.pack.level.push(dataPack)
        }
        this.hex.type = main.type

        this.hex.dirOut += 1
        if (this.hex.dirOut > 5) {
            this.hex.dirOut = 0
        }
        switch (main.type) {
            case 'wall':
                $(this).children('.testHex').css('backgroundColor', '#3388dd')
            break
            case 'enemy':
                $(this).children('.testHex').css('backgroundColor', '#dd3333')
            break
            case 'treasure':
                $(this).children('.testHex').css('backgroundColor', '#88dd33')
            break
            case 'light':
                $(this).children('.testHex').css('backgroundColor', '#dddd33')
            break
        }
        main.nextIn = (this.hex.dirOut + 3) % 6
        for (let i in main.pack.level) {
            let dataPack = main.pack.level[i]
            if (dataPack.id == this.hex.id) {
                dataPack.dirOut = this.hex.dirOut
                dataPack.type = this.hex.type
                break
            }
        }
        $('#data').html(JSON.stringify(main.pack, null, 4))
        
    }

    /* sendLevel() {
        
    }

    loadLevel(data) {
        if (data != null) {
            main.pack.size = data.size
            main.createTiles()
            main.pack.level = data.level
            for (let i in data.level) {
                let dataPack = data.level[i]
                main.hexes[dataPack.id].x = parseInt(dataPack.x)
                main.hexes[dataPack.id].z = parseInt(dataPack.z)
                main.hexes[dataPack.id].dirOut = parseInt(dataPack.dirOut)
                main.hexes[dataPack.id].dirIn = parseInt(dataPack.dirIn)
                main.hexes[dataPack.id].type = dataPack.type
                main.hexes[dataPack.id].setup()
            }
            $('#data').html(JSON.stringify(main.pack, null, 2))
        } else {
            main.pack.size = 2
            main.createTiles()
            $('#data').html(JSON.stringify(main.pack, null, 2))
        }
    } */
}

