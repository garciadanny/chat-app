$(document).ready( function() {

  // The cookie contains the client's username and the name
  // of the chat-room.
  var cookie = document.cookie.split("; ");

  // Different browsers append extra data to the beginning of the
  // cookie. This ensures we get the last two elements:
  // the username and room-name.
  var userInput = cookie.slice(cookie.length - 2);
  var userName = userInput[0].match(/\=(.*)/)[1];
  var roomName = userInput[1].match(/\=(.*)/)[1];

  // Grab the private room-id from the URL
  var roomId = window.location.pathname.split('/')[1];

  // Gather chat-room data
  var chatRoomData = {roomId: roomId, roomName: roomName, userName: userName};

  // Initialize a socket.io client instance
  var socket = io();

  // Inform the server a user has joined a chat-room.
  socket.emit('join', chatRoomData);

  // Event listeners

  socket.on('join', function(userName) {
    $('#online-users').append( $('<li>' + userName + '</li>') );
    $('#messages').append( $('<li>').text( userName + ' has joined the chatroom...'));
  });

  $('#chat-form').submit(function (event) {
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

  socket.on('online-users', function(userName) {
    $('#online-users').append( $('<li>' + userName + '</li>') );
  });

  socket.on('disconnected', function(userName) {
    $('#messages').append( $('<li>').text( userName + ' has left the chatroom...'));
  });

  socket.on('remove-user', function(userName) {
    $("#online-users>li:contains(" + userName + ")").remove();
  });

});


