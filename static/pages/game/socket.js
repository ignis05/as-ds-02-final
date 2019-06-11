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

socket.send = function (msg) { // chat msg
    socket.emit('send', msg)
}

socket.checkPath = async (origin, dest) => {
    return new Promise(resolve => {
        socket.emit('check_PF_Data', { origin: origin, dest: dest }, res => {
            console.log("path", res);
            console.log('path -- length:', res.length);
            resolve(res)
        })
    })
}

socket.checkPaths = async (origin, destArray) => {
    return new Promise(resolve => {
        socket.emit('check_PF_Data', { origin: origin, destArray: destArray }, res => {
            console.log("paths", res);
            resolve(res)
        })
    })
}

socket.sendPFData = async (positions) => {
    return new Promise(resolve => {
        socket.emit('send_PF_Data', positions, res => {
            let data = res
            console.log("data for PF:", data);
            resolve(res)
        })
    })
}

socket.triggerWin = () => {
    console.log('i won');
    socket.emit('victory')
    console.log('still ok');
}

socket.sendSpawnData = async (positions) => {
    return new Promise(resolve => {
        socket.emit('send_Spawn_Data', positions, res => {
            resolve('ok')
        })
    })
}
socket.notifyUnitKilled = async (pos) => {
    socket.emit('unit_killed', pos)
}
// #region socket triggers

socket.on('end_of_game', winner => {
    console.log('GAME ENDED');
    window.alert(`User ${winner} is victorious!`)
    window.location = '/'
})

socket.on('chat', msg => {
    console.log(msg);
    ui.UpdateChat(msg)
})

socket.on('reconnecting', moves => { // triggers when user is reconencing to ongoing game
    // if game object doen't exist yet, check every 1 sec
    let x = setInterval(async () => {
        if (game && game.map && game.modelsLoaded) {
            let me = await socket.getMyself()
            game.avalUnits = me.unitsToSpawn
            game.renderMoves(moves, true)
            for (let unit of game.myUnits) {
                unit.canMakeMove = true
                unit.moveIndicator.material.color.set(0x578be0)
            }
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
        if (game && game.map && game.modelsLoaded) {
            game.myTurn = true
            game.activateMyTurn()
            clearInterval(x)
        }
    }, 1000)
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