var socket = io();

$('form').submit(function(event) {
    event.preventDefault();
    event.stopPropagation();

    var message =  $('#message').val();

    $('#messages').append( $('<li>').text(message));
    socket.emit('chat message', message);
    $('#message').val('');
});

socket.on('chat message', function(message) {
    $('#messages').append( $('<li>').text(message));
});