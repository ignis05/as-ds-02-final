class Pathfinder {

    static createMatrix(dbfile) {
        let size = dbfile.size
        let map = dbfile.level
        let matrix = []
        for (var cell in map) {
            if (cell % size == 0) {
                matrix.push([])
            }
            switch (map[cell].type) {
                case "road":
                    matrix[matrix.length - 1].push([0, parseInt(map[cell].height)])
                    break

                case "land":
                    matrix[matrix.length - 1].push([0, parseInt(map[cell].height)])
                    break

                case "dirt":
                    matrix[matrix.length - 1].push([0, parseInt(map[cell].height)])
                    break

                case "rock":
                    matrix[matrix.length - 1].push([1, parseInt(map[cell].height)])
                    break

                case "river":
                    matrix[matrix.length - 1].push([1, parseInt(map[cell].height)])
                    break

                case "ford":
                    matrix[matrix.length - 1].push([0, parseInt(map[cell].height)])
                    break

                case "sea":
                    matrix[matrix.length - 1].push([1, parseInt(map[cell].height)])
                    break

                case "marsh":
                    matrix[matrix.length - 1].push([0, parseInt(map[cell].height)])
                    break

                case "oil":
                    matrix[matrix.length - 1].push([0, parseInt(map[cell].height)])
                    break
            }
        }
        console.log("KeK");

        return matrix
    }

    static moveTiles(result, matrix, map, unit, clickFunction) {
        if (result.length > 1) {
            var movePath = result
            //movePath.shift()
            let move = 0
            var moveInterval = setInterval(() => {   
                if (move > movePath.length - 1) {
                    console.log(clickFunction);
                    
                    $('#game').on('click', clickFunction)
                    window.clearInterval(moveInterval)
                    setTimeout(() => {
                        for (let unmove in movePath) {
                            let redTile = map.level.find(tile => tile.x == movePath[unmove][0] && tile.z == movePath[unmove][1])
                            matrix[movePath[unmove][1]][movePath[unmove][0]].material.color.set(MASTER_BlockTypes[redTile.type].game.color)
                        }
                    }, 1000)
                } else {            
                unit.userData.z = movePath[move][1]
                unit.userData.x = movePath[move][0]
                unit.position.y = matrix[unit.userData.z][unit.userData.x].position.y * 2
                unit.position.set(unit.userData.x * MASTER_BlockSizeParams.blockSize, unit.position.y, unit.userData.z * MASTER_BlockSizeParams.blockSize)
                console.log( unit.position);
                matrix[unit.userData.z][unit.userData.x].material.color.set(0xff0000)
                console.log( matrix[unit.userData.z][unit.userData.x].position);
                move++
                }
            }, 250)
        }

    }

}