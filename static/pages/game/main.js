$(document).ready(async () => {
    console.log('document ready');
    let mapName = await socket.getMapName()

    var game = new Game('#game') // create game display in '#game' div
    game.addAxexHelper(500)
    game.enableOrbitContols()
})
