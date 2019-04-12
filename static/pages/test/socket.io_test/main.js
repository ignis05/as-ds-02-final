var socket
function createSocket() { // function for creating all socket listeners

    let socket = io(`/socket.io_test`); // connect to socket instance

    socket.on('msg', msg => { // listen for event 'msg' and log data send with this event
        console.log(msg);
    })

    return socket
}

$(document).ready(() => {
    console.log("document ready");

    $("#newPage").click(() => {
        window.open(window.location)
    })

    $("#connect").click(() => {
        if (!socket) {
            socket = createSocket()
        }
    })

    $("#disconnect").click(() => {
        if (socket) {
            socket.disconnect()
            socket = null
        }
    })

    $("#join").click(() => {
        if (socket) {
            socket.emit("join", $("#joinInp").val())
        }
    })

    $("#leave").click(() => {
        if (socket) {
            socket.emit("leave", $("#leaveInp").val())
        }
    })

    $("#sendToServer").click(() => {
        if (socket) {
            socket.emit("msg", $("#sendToServerInp").val())
        }
    })

    $("#sendToRoom").click(() => {
        if (socket) {
            socket.emit("toRoom", $("#sendToRoomInp1").val(), $("#sendToRoomInp2").val())
        }
    })

    $("#sendToClient").click(() => {
        if (socket) {
            socket.emit("priv", $("#sendToClientInp1").val(), $("#sendToClientInp2").val())
        }
    })
})