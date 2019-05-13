// class for generating maps
class Map {
    constructor(mapData) {
        this.size = mapData.size
        this.level = mapData.level
    }
    // generates 3D display of map (and if scene is given adds it to scene)
    generateMap(scene) {

        var group = new THREE.Group() // subclass of Object3D optimized for working as invisible container

        for (let cell of this.level) {
            if (parseInt(cell.height) == 0) continue // dont create cells with height 0

            // import const values
            var size = MASTER_BlockSizeParams.blockSize
            var color = MASTER_BlockTypes[cell.type].game.color
            var walkable = MASTER_BlockTypes[cell.type].game.walkable


            var geometry = new THREE.BoxGeometry(size, parseInt(cell.height), size);
            var material = new THREE.MeshPhongMaterial({ color: color });

            var cube = new THREE.Mesh(geometry, material);
            cube.color = color
            cube.walkable = walkable

            cube.position.set(size * cell.x, parseInt(cell.height) / 2, size * cell.z)

            // black frame - placeholder
            var _geometry = new THREE.BoxGeometry(size, parseInt(cell.height), size);
            var _material = new THREE.MeshPhongMaterial({ color: 0x000000, wireframe: true });
            let frame = new THREE.Mesh(_geometry, _material);
            cube.add(frame)

            group.add(cube);
        }

        this.generatedMap = group

        if (scene) scene.add(group) // if scene given as parameter add generated content to scene
    }
}