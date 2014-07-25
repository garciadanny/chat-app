var socket = io();

var userName = prompt('Create a username:');

socket.emit('join', userName);
socket.on('join', function(userName) {
  $('#messages').append( $('<li>').text( userName + ' has joined the chatroom...'));
});

$('form').submit(function (event) {
  event.preventDefault();
  event.stopPropagation();

  var message = $('#message').val();

  $('#messages').append($('<li>').text(userName + ": " + message));
  socket.emit('chat message', message);
  $('#message').val('');
});

socket.on('chat message', function (userName, message) {
  $('#messages').append($('<li>').text(userName + ": " + message));
});

socket.on('disconnected', function(userName) {
  $('#messages').append( $('<li>').text( userName + ' has left the chatroom...'));
});