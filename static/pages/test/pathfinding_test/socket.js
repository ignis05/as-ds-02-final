// socket functionality in separate file
var socket = io('/pathfindingTest')

socket.loadMapOnServer = async (mapName) => {
    return new Promise(resolve => {
        socket.emit('load_selected_map', mapName)
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

// #region socket triggers
// socket.on('get_PF_Data', (data) => {
//     console.log(data);
// })

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

socket.on('all_players_connected', () => { // all players connected - start pathfindingTest
    console.log(`all players connected - pathfindingTest ready to start`);
})
// #endregion socket triggers