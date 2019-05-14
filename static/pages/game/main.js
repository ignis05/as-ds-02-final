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
    /* game.addAxexHelper(500) */
    /* game.enableOrbitContols() */
    game.debug_addAmbientLight(1)

    game.debug_cameraEnable(true, true)
    game.debug_consoleEnable(true)

    map = new Map(mapData)
    map.generateMap(game.scene)

    // #region ui listeners
    $('#button-end-turn').click(() => {
        console.log('click - end turn');
        socket.endTurn({ xd: 'xd' })
        $("#button-end-turn").attr("disabled", true);
    })
    // #endregion ui listeners
})
