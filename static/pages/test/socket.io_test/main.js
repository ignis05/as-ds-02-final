var socket
function createSocket() { // function for creating all socket listeners

    let socket = io(`/socket.io_test`); // connect to socket instance `/socket.io_test`

    // listen for event 'msg' and log data send with this event
    socket.on('msg', msg => {
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
            socket.disconnect() // disconnect from socket
            socket = null
        }
    })

    $("#join").click(() => {
        if (socket) {
            socket.emit("join", $("#joinInp").val()) // emit event 'join' with data from input
        }
    })

    $("#leave").click(() => {
        if (socket) {
            socket.emit("leave", $("#leaveInp").val()) // emit event 'leave' with data from input
        }
    })

    $("#sendToServer").click(() => {
        if (socket) {
            socket.emit("msg", $("#sendToServerInp").val()) // emit event 'msg' with data from input
        }
    })

    $("#sendToRoom").click(() => {
        if (socket) {
            socket.emit("toRoom", $("#sendToRoomInp1").val(), $("#sendToRoomInp2").val()) // emit event 'toRoom' with data1 from input1 and data2 from input2
        }
    })

    $("#sendToClient").click(() => {
        if (socket) {
            socket.emit("priv", $("#sendToClientInp1").val(), $("#sendToClientInp2").val()) // emit event 'priv' with data1 from input1 and data2 from input2
        }
    })
})