var game
var ui
var moves = []
var token = Cookies.get('token')
var mapData

// ============================================================= //
//  TODO: Move debug to external file (loaded first, universal)  //
// ============================================================= //

$(document).ready(async () => {
    console.log('document ready')

    $('#loading').html(`<div id='loading-info'>Loading session data...</div>`)

    var mapName = await socket.getMapName()

    $('#loading').html(`<div id='loading-info'>Loading map: ${mapName}</div>`)

    mapData = await socket.getMapData() // load map from session instead of database

    ui = new UI()
    ui.UpdateMinimap(mapData) // initial minimap calculation

    game = new Game('#game') // create game display in '#game' div
    ui.debug_uiDisable(true)

    await game.loadMap(mapData)

    $('#loading').html(`<div id='loading-info'>Loading models...</div>`)

    await game.loadModels()

    $('#loading').html('').css('display', 'none')

    game.camCtrl.initCamera()
    // game.debug_addAmbientLight(1)
    game.debug_cameraEnable(true, false, true)

    ui.debug_uiDisable(false)
    ui.initChat()
    ui.debug_perfMonitor()
    //game.enableOrbitContols()
    game.addSunLight()


    // #region ui listeners
    $('#button-end-turn').click(() => {
        console.log('click - end turn')
        socket.endTurn(moves) // send array of made moves
        moves = [] // reset array of moves
        if (game.avalMoveTab.length > 0) {
            for (let recolor of game.avalMoveTab) {
                recolor.material[2].color.set(recolor.color)
            }
            game.avalMoveTab = []
        }
        $("#button-end-turn").attr("disabled", true)
        $('#ui-top-turn-status').html('-').css('background-color', '#3F3F3F')
        if (!game.spawnTurn && ((game.unitsSpawned.map(clickObj => clickObj.parent)).every(unit => unit.owner == token))) socket.triggerWin() // win condition
    })
    // #endregion ui listeners
})
