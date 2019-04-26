class Grid {
    constructor(size, map, wireframe, cellSize = Settings.tileSize) {
        this.wireframe = (wireframe != undefined ? wireframe : true)
        this.plane = new THREE.Object3D()
        this.cellSize = cellSize
        this.size = size
        this.map = map
        this.matrix = []
        this.init()
    }
    init() {
        for (var cell in this.map) {
            let floor = new THREE.BoxGeometry(this.cellSize, this.cellSize, this.map[cell].height * 10 );
            let singleCell
            switch (this.map[cell].type) {
                case "dirt":
                    var materialDirt = new THREE.MeshBasicMaterial({
                        side: THREE.DoubleSide,
                        color: "#22ff22",
                        wireframe: this.wireframe
                    })
                    singleCell = new THREE.Mesh(floor, materialDirt)
                    singleCell.userData.type = "dirt"
                    break

                case "rock":
                    var materialRock = new THREE.MeshPhongMaterial({
                        side: THREE.DoubleSide,
                        color: "#666666",
                        //wireframe: this.wireframe
                    })
                    singleCell = new THREE.Mesh(floor, materialRock)
                    singleCell.userData.type = "rock"
                    break
            }

            if (cell % this.size == 0) {
                console.log(cell);
                this.matrix.push([])
            }
            this.matrix[this.matrix.length - 1].push(singleCell)

            singleCell.position.set(this.cellSize * this.map[cell].x, this.map[cell].height * 5, this.cellSize * this.map[cell].z)
            singleCell.rotation.set(Math.PI / 2, 0, 0)
            singleCell.userData.x = this.map[cell].x
            singleCell.userData.z = this.map[cell].z
            singleCell.userData.name = "floor"
            //positions for pathfinding (or anything else)
            this.plane.add(singleCell)
        }
        console.log(this.matrix);
    }

    addTo(scene) {
        scene.add(this.plane)
        console.log(this.plane);
    }


}