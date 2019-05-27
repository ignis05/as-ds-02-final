var game
var ui
var moves = []
var token = Cookies.get('token')

// ============================================================= //
//  TODO: Move debug to external file (loaded first, universal)  //
// ============================================================= //

$(document).ready(async () => {
    console.log('document ready')

    $('#loading').html(`<div id='loading-info'>Loading session data...</div>`)

    var mapName = await socket.getMapName()

    $('#loading').html(`<div id='loading-info'>Loading map: ${mapName}</div>`)

    var mapData = await socket.getMapData() // load map from session instead of database

    ui = new UI()
    ui.UpdateMinimap(mapData) // initial minimap calculation


    game = new Game('#game') // create game display in '#game' div

    await game.loadMap(mapData)

    $('#loading').html(`<div id='loading-info'>Loading models...</div>`)

    await game.loadModels()

    $('#loading').html('').css('display', 'none')

    game.debug_cameraEnable(false, false, true)
    ui.debug_uiDisable(false)
    ui.initChat()
    //game.enableOrbitContols()
    game.addSunLight(true)


    // #region ui listeners
    $('#button-end-turn').click(() => {
        console.log('click - end turn')
        socket.endTurn(moves) // send array of made moves
        moves = [] // reset array of moves
        $("#button-end-turn").attr("disabled", true)
    })

    $('#button-test-addTestUnit').click(() => { // button to test moves - spawns testunit on radom tile
        let tile
        // select random tile that doen't have unit on it
        do {
            tile = game.map.level[Math.floor(Math.random() * game.map.level.length)]
        } while (tile.unit)

        console.log(`adding random unit to tile ${tile.id}`)



        // spawn unit client-sided
        let unit = new Unit('spider', token)
        game.spawnUnit(tile.id, unit, true)
    })
    // #endregion ui listeners
})
