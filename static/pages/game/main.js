var game
var database
var mapName
var mapData
var map
$(document).ready(async () => {
    console.log('document ready');
    mapName = await socket.getMapName()

    console.log(`Selected map: ${mapName}`);

    database = new MapDB()
    await database.create()
    mapData = (await database.importMap(mapName)).mapData

    game = new Game('#game') // create game display in '#game' div
    game.addAxexHelper(500)
    game.enableOrbitContols()
    game.addAmbientLight(1)

    map = new Map(mapData)
    map.generateMap(game.scene)
})
