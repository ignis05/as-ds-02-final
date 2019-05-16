var game
var ui
var moves = []
var token = Cookies.get('token')

$(document).ready(async () => {
    console.log('document ready')

    $('#game').html(`<div id='loading-info'>Loading session data...</div>`)

    var mapName = await socket.getMapName()

    console.log(`Selected map: ${mapName}`)

    $('#game').html(`<div id='loading-info'>Loading map: ${mapName}</div>`)

    var mapData = await socket.getMapData() // load map from session instead of database

    ui = new UI()
    ui.MinimapCalc(mapData) // initial minimap calculation

    $('#game').html('')
    game = new Game('#game') // create game display in '#game' div
    /* game.addAxexHelper(500) */
    /* game.enableOrbitContols() */
    game.debug_addAmbientLight(1)

    game.debug_cameraEnable(false, false)
    game.debug_consoleEnable(false)

    game.loadMap(mapData)

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

        // add spawning unit to moves array - to be sent with turn end
        moves.push({
            action: 'spawn',
            unitData: {
                name: 'testUnit',
                owner: token,
            },
            tileID: tile.id
        })

        // spawn unit client-sided
        let unit = new Unit('testUnit', token)
        game.spawnUnit(tile.id, unit)
    })
    // #endregion ui listeners
})
