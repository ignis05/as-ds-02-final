class Grid {
    constructor(size, map, wireframe, cellSize = 150) {
        this.wireframe = (wireframe != undefined ? wireframe : true)
        this.plane = new THREE.Object3D()
        this.cellSize = cellSize
        this.size = size
        this.map = map
        this.matrix = []
        this.init()
    }
    init() {
        this.plane.position.set(-(this.size * this.cellSize / 2), 0, -(this.size * this.cellSize / 2))
        var floor = new THREE.PlaneGeometry(this.cellSize, this.cellSize, 1, 1);

        for (var cell in this.map) {
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
                    var materialRock = new THREE.MeshBasicMaterial({
                        side: THREE.DoubleSide,
                        color: "#666666",
                        wireframe: this.wireframe
                    })
                    singleCell = new THREE.Mesh(floor, materialRock)
                    singleCell.userData.type = "rock"
                    break
            }

            if(cell % this.size == 0){
                console.log(cell);
                this.matrix.push([])
            }
            this.matrix[this.matrix.length-1].push(singleCell)


            singleCell.position.set(this.cellSize * this.map[cell].z, this.map[cell].height * 10, this.cellSize * this.map[cell].x)
            singleCell.rotation.set(Math.PI / 2, 0, 0)
            singleCell.userData.x = this.map[cell].z
            singleCell.userData.z = this.map[cell].x
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