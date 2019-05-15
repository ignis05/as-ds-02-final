class Unit {
    constructor(unitName, owner) { // object with unit variables & Model.js class object

        let unitData = MASTER_Units[unitName]

        this.container = new THREE.Object3D()

        if (unitData.modelName) {
            this.model = models[unitData.modelName] // i suggest to load all models to single array and just take them from here
        }
        else {
            let geometry = new THREE.BoxGeometry(100, 100, 100);
            let material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
            this.model = new THREE.Mesh(geometry, material);
        }
        this.container.add(this.model)

        // statistics
        this.mobility = unitData.stats.mobility
        this.damage = unitData.stats.damage
        this.health = unitData.stats.health
        this.range = unitData.stats.range

        this.owner = owner
    }
    addTo(parent) { //adds apropriate element to parent
        parent.add(this.container)
    }
    get position() { // so u can use unit.position.set() instead of unit.container.position.set()
        return this.container.position
    }
}