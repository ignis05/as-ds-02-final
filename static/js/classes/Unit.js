class Unit {
    constructor(unitName, ownerToken) { // object with unit variables & Model.js class object

        let unitData = MASTER_Units[unitName]

        this.container = new THREE.Object3D()

        if (unitData.modelURL) {
            console.log(game.models[unitName])
            this.model = game.models[unitName].pop() // pops model from array of loaded models
        }
        else { // if no model url use cube as model
            let geometry = new THREE.BoxGeometry(100, 100, 100)
            let material = new THREE.MeshBasicMaterial({ color: 0x0000ff })
            this.model = {
                mesh: new THREE.Mesh(geometry, material)
            }
        }
        this.container.add(this.model.mesh)

        // statistics
        this.mobility = unitData.stats.mobility
        this.damage = unitData.stats.damage
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