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
            let floor = new THREE.BoxGeometry(this.cellSize, this.cellSize, this.map[cell].height * 10);
            let singleCell
            switch (this.map[cell].type) {
                case "road":
                    var material = new THREE.MeshBasicMaterial({
                        side: THREE.DoubleSide,
                        color: "#7F2F00",
                        wireframe: this.wireframe
                    })
                    singleCell = new THREE.Mesh(floor, material)
                    singleCell.userData.type = "road"
                    break

                case "land":
                    var material = new THREE.MeshPhongMaterial({
                        side: THREE.DoubleSide,
                        color: "#2F7F2F",
                        //wireframe: this.wireframe
                    })
                    singleCell = new THREE.Mesh(floor, material)
                    singleCell.userData.type = "land"
                    break

                case "dirt":
                    var material = new THREE.MeshBasicMaterial({
                        side: THREE.DoubleSide,
                        color: "#CFCF2F",
                        wireframe: this.wireframe
                    })
                    singleCell = new THREE.Mesh(floor, material)
                    singleCell.userData.type = "dirt"
                    break

                case "rock":
                    var material = new THREE.MeshPhongMaterial({
                        side: THREE.DoubleSide,
                        color: "#7F7F7F",
                        //wireframe: this.wireframe
                    })
                    singleCell = new THREE.Mesh(floor, material)
                    singleCell.userData.type = "rock"
                    break

                case "river":
                    var material = new THREE.MeshBasicMaterial({
                        side: THREE.DoubleSide,
                        color: "#2F7FCF",
                        wireframe: this.wireframe
                    })
                    singleCell = new THREE.Mesh(floor, material)
                    singleCell.userData.type = "river"
                    break

                case "ford":
                    var material = new THREE.MeshPhongMaterial({
                        side: THREE.DoubleSide,
                        color: "#2F2FCF",
                        //wireframe: this.wireframe
                    })
                    singleCell = new THREE.Mesh(floor, material)
                    singleCell.userData.type = "ford"
                    break

                case "sea":
                    var material = new THREE.MeshBasicMaterial({
                        side: THREE.DoubleSide,
                        color: "#2FCFCF",
                        wireframe: this.wireframe
                    })
                    singleCell = new THREE.Mesh(floor, material)
                    singleCell.userData.type = "sea"
                    break

                case "marsh":
                    var material = new THREE.MeshPhongMaterial({
                        side: THREE.DoubleSide,
                        color: "#2F007F",
                        //wireframe: this.wireframe
                    })
                    singleCell = new THREE.Mesh(floor, material)
                    singleCell.userData.type = "marsh"
                    break

                case "oil":
                    var material = new THREE.MeshBasicMaterial({
                        side: THREE.DoubleSide,
                        color: "#500050",
                        wireframe: this.wireframe
                    })
                    singleCell = new THREE.Mesh(floor, material)
                    singleCell.userData.type = "oil"
                    break



            }

            if (cell % this.size == 0) {
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
    }

    addTo(scene) {
        scene.add(this.plane)
        console.log(this.plane);
    }


}