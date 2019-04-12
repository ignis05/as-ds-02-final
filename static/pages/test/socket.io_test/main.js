// #region socket
var socket = io(`/socket.io_test`); // connect to socket instance

socket.on('user connected', () => {
    console.log("user connected");
})

socket.on('news', data => {
    console.log(data);
    socket.emit('client->server', { my: 'data' });
});

// #endregion socket

$(document).ready(() => {
    console.log("document ready");
})