class Cell {
    constructor(id, x, z) {
        this.id = id
        this.x = x
        this.z = z
        this.dirIn
        this.dirOut
        this.type
        
        this.create()
        this.object
    }

    create() {
        let cont = $('<div>')
        cont.addClass('cell')
        cont.css('left', this.z * 50)
        cont.css('top', this.x * 50)
        cont[0].hex = this
        this.dirOut = -1
        this.object = cont
        
        let dataPack = {}
        dataPack.id = cont[0].hex.id
        dataPack.x = cont[0].hex.x
        dataPack.z = cont[0].hex.z
        dataPack.dirOut = cont[0].hex.dirOut
        dataPack.dirIn = cont[0].hex.dirIn
        dataPack.type = cont[0].hex.type
        main.pack.level.push(dataPack)
    }

    setup() {
        switch (this.type) {
            case 'wall':
                this.object.css('backgroundColor', '#3388dd')
            break
            case 'enemy':
                this.object.css('backgroundColor', '#dd3333')
            break
            case 'treasure':
                this.object.css('backgroundColor', '#88dd33')
            break
            case 'light':
                this.object.css('backgroundColor', '#dddd33')
            break
        }
    }
}