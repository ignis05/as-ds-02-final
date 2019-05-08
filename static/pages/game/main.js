$(document).ready(async () => {
    console.log('document ready');
    let mapName = await socket.getMapName()
    document.write(`selected map: ${mapName}`)
})
