// class for generating maps
class MapDisplay {
    constructor(mapData) {
        this.size = mapData.size
        this.level = mapData.level
        this.textureList = [] // Holds names of textures needed for this map, filled by buildTextureList()
        this.texturePack = {} // Holds textures loaded by <loadTextures()>
    }

    buildTextureList() {
        for (let cell of this.level) {
            if (this.textureList.indexOf(cell.type) == -1)
                this.textureList.push(cell.type)
        }
    }

    loadTextures() {
        for (let type of this.textureList) {  // load each texture once
            this.texturePack[type] = new THREE.TextureLoader().load('/static/res/textures/blocks/' + type + '.png')
        }
    }

    // generates 3D display of map (and if scene is given adds it to scene)
    renderMap(scene) {

        this.buildTextureList()
        this.loadTextures()

        let group = new THREE.Group() // subclass of Object3D optimized for working as invisible container
        var matrix = []
        var iterator = 0
        for (let cell of this.level) {

            // import const values
            let size = MASTER_BlockSizeParams.blockSize
            let color = MASTER_BlockTypes[cell.type].game.color
            let walkable = MASTER_BlockTypes[cell.type].game.walkable


            let geometry = new THREE.BoxGeometry(size, parseInt(cell.height), size)
            let materials = []
            let defMaterial = new THREE.MeshPhongMaterial({ color: color })
            for (let i = 0; i < 6; i++) {
                materials.push(defMaterial)  // set all sides of the cube to color mat
            }
            materials[2] = new THREE.MeshPhongMaterial({  // set top side of the cube to texture mat
                side: THREE.DoubleSide,
                map: this.texturePack[cell.type],
                color: color
            })

            let cube = new THREE.Mesh(geometry, materials)
            cube.receiveShadow = true
            cube.color = color
            cube.walkable = walkable
            cube.tileID = cell.id
            if (parseInt(cell.height) == 0) cube.visible = false // invisible cell



            cube.position.set(size * cell.x, parseInt(cell.height) / 2, size * cell.z)

            // black frame - placeholder
            let _geometry = new THREE.BoxGeometry(size, parseInt(cell.height), size)
            let _material = new THREE.MeshLambertMaterial({ color: 0x000000, wireframe: true })
            let frame = new THREE.Mesh(_geometry, _material)
            /* cube.add(frame) */

            group.add(cube)

            if (iterator % this.size == 0) matrix.push([])
            iterator++
            matrix[matrix.length - 1].push(cube)
        }

        this.group = group
        this.matrix = matrix

        if (scene) scene.add(group) // if scene given as parameter add generated content to scene
    }
}