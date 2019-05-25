// socket functionality in separate file
var socket = io('/game')

socket.getMapName = async () => {
    return new Promise(resolve => {
        socket.emit('get_mapName', res => {
            resolve(res)
        })
    })
}

socket.getMapData = async () => { // load map directly from session
    return new Promise(resolve => {
        socket.emit('get_mapData', res => {
            resolve(res)
        })
    })
}

socket.getSession = async () => { // get session information (without map)
    return new Promise(resolve => {
        socket.emit('get_session', res => {
            resolve(res)
        })
    })
}

socket.getMyself = async () => { // get session information (without map)
    return new Promise(resolve => {
        socket.emit('get_myself', res => {
            resolve(res)
        })
    })
}

socket.endTurn = async data => { // end turn and send moves & stuff as single data object
    game.myTurn = false
    socket.emit('end_turn', data)
}

// #region socket triggers

socket.on('reconnecting', moves => { // triggers when user is reconencing to ongoing game
    // if game object doen't exist yet, check every 1 sec
    let x = setInterval(async () => {
        if (game && game.map && game.modelsLoaded) {
            let me = await socket.getMyself()
            game.avalUnits = me.unitsToSpawn
            game.renderMoves(moves)
            clearInterval(x)
        }
    }, 1000)

})

socket.on('turn_ended', data => {
    // someone ended their turn, local map needs to be updated with changes in 'data' object
    console.log('turn ended');
    game.renderMoves(data)
})

socket.on('my_turn', () => {// notification that this client should make his moves now
    // if game object doen't exist yet, check every .5 sec
    let x = setInterval(async () => {
        if (game && game.map) {
            game.myTurn = true
            game.activateMyTurn()
            clearInterval(x)
        }
    }, 500)
})

socket.on('error_token', () => { // token error
    window.alert('You are already connected from this browser. If you want do connect another client try incognito mode or other browsers')
    window.location = '/'
})

socket.on('session_not_found', playerID => { // player isn't assigned to any session
    window.alert('Session not found :(')
    window.location = '/'
})

socket.on('player_connected', playerID => { // when player connects
    console.log(`player ${playerID} connected`);
})

socket.on('player_disconnected', playerID => { // when player disconnects
    console.log(`player ${playerID} disconnected`);
    // we need to decide how to handle leaving players
})

socket.on('all_players_connected', () => { // all players connected - start game
    console.log(`all players connected - game ready to start`);
})
// #endregion socket triggers