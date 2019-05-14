var game
var mapName
var mapData
$(document).ready(async () => {
    console.log('document ready');
    mapName = await socket.getMapName()

    console.log(`Selected map: ${mapName}`);

    $('#game').html(`<div id='loading-info'>Loading map...<img src='https://ui-ex.com/images/transparent-background-loading.gif'></div>`)

    mapData = await socket.getMapData() // load map from session instead of database

    $('#game').html('')
    game = new Game('#game') // create game display in '#game' div
    /* game.addAxexHelper(500) */
    /* game.enableOrbitContols() */
    game.debug_addAmbientLight(1)

    game.debug_cameraEnable(true, true)
    game.debug_consoleEnable(true)

    game.loadMap(mapData)

    // #region ui listeners
    $('#button-end-turn').click(() => {
        console.log('click - end turn');
        socket.endTurn({ xd: 'xd' })
        $("#button-end-turn").attr("disabled", true);
    })
    // #endregion ui listeners
})
