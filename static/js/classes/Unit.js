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
        let boxMaterial = new THREE.MeshStandardMaterial({ color: (ownerToken == token ? 0x00ff00 : 0x0000ff), transparent: true, visible: true, opacity: 0.5 })
        let box = new THREE.Mesh(boxGeometry, boxMaterial)
        this.container.add(box)
        this.container.model = this.model
        this.container.clickBox = box
        this.container.owner = ownerToken

        // statistics
        this.mobility = unitData.stats.mobility
        this.damage = unitData.stats.damage
        this.maxHealth = unitData.stats.health
        this.health = unitData.stats.health
        this.range = unitData.stats.range
        this.name = unitName
        this.element = unitData.stats.element
        this.owner = ownerToken
    }
    addTo(parent) { //adds apropriate element to parent
        parent.add(this.container)
    }
    get position() { // so u can use unit.position.set() instead of unit.container.position.set()
        return this.container.position
    }
    get roation() {
        return this.model.mesh.roation
    }
    lookAt(vector3) {
        let pos = new THREE.Vector3(vector3.x, vector3.y + this.model.mesh.position.y, vector3.z)
        this.model.mesh.lookAt(pos)
    }
}