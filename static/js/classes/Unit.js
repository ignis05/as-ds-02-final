class Unit {
    constructor(unitName, ownerToken) { // object with unit variables & Model.js class object

        let unitData = MASTER_Units[unitName]

        this.container = new THREE.Object3D()
        this.container.model = null
        this.container.clickBox = null

        if (unitData.modelURL) {
            // console.log(game.models[unitName])
            this.model = game.models[unitName].pop() // pops model from array of loaded models
            this.model.mesh.scale.set(unitData.scale, unitData.scale, unitData.scale) // scale model
            this.model.mesh.position.y = unitData.posY // move model vertically - for flying units

            // enable shadows - for each model's mesh
            this.model.mesh.castShadow = true
            this.model.mesh.traverse(node => {
                if (node instanceof THREE.Mesh) node.castShadow = true
            })
        }
        else { // if no model url use cube as model
            let geometry = new THREE.BoxGeometry(100, 100, 100)
            let material = new THREE.MeshBasicMaterial({ color: 0x0000ff })
            this.model = {
                mesh: new THREE.Mesh(geometry, material)
            }
        }
        this.container.add(this.model.mesh)
        let boxGeometry = new THREE.BoxGeometry(MASTER_BlockSizeParams.blockSize, 1, MASTER_BlockSizeParams.blockSize)
        let boxMaterial = new THREE.MeshStandardMaterial({ color: (ownerToken == token ? 0x00ff00 : 0x0000ff), transparent: true, visible: true ,opacity: 0.5 })
        let box = new THREE.Mesh(boxGeometry, boxMaterial)
        this.container.add(box)
        this.container.model = this.model
        this.container.clickBox = box
        this.container.owner = ownerToken

        //HP bar
        let hpbarMaterial = new THREE.SpriteMaterial({color: (ownerToken == token ? 0x00ff00 : 0xff0000)})
        let bgbarMaterial = new THREE.SpriteMaterial({color: 0x777777})        

        let spriteY = new THREE.Box3().setFromObject(this.model.mesh).max.y + MASTER_BlockSizeParams.blockSize/4
        console.log(spriteY);
        

        let bgbarSprite = new THREE.Sprite(bgbarMaterial)
        bgbarSprite.scale.set(MASTER_BlockSizeParams.blockSize + MASTER_BlockSizeParams.blockSize/25, MASTER_BlockSizeParams.blockSize/7, 1)
        bgbarSprite.position.y = spriteY
        let hpSprite = new THREE.Sprite(hpbarMaterial)
        hpSprite.scale.set(MASTER_BlockSizeParams.blockSize, MASTER_BlockSizeParams.blockSize/8.5, 1)
        hpSprite.position.y = spriteY

        this.container.add(bgbarSprite)
        this.container.add(hpSprite)
        this.statBar = { hp: hpSprite }

        //move possibility rhombus
        if(ownerToken == token) {
        let moveSpriteMaterial = new THREE.SpriteMaterial({color: 0xff0000, rotation: Math.PI/4})

        let moveSprite = new THREE.Sprite(moveSpriteMaterial)
        moveSprite.scale.set(MASTER_BlockSizeParams.blockSize/17, MASTER_BlockSizeParams.blockSize/17, 2137)
        moveSprite.position.y = spriteY + MASTER_BlockSizeParams.blockSize/4

        this.container.add(moveSprite)
        this.moveIndicator = moveSprite 
        }

        // statistics
        this.mobility = unitData.stats.mobility
        this.damage = unitData.stats.damage
        this.maxHealth = unitData.stats.health
        this.health = unitData.stats.health
        this.range = unitData.stats.range
        this.name = unitName

        this.owner = ownerToken
    }
    addTo(parent) { //adds apropriate element to parent
        parent.add(this.container)
    }
    get position() { // so u can use unit.position.set() instead of unit.container.position.set()
        return this.container.position
    }
}