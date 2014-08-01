$(document).ready( function() {

  // Grab the private room-id from the URL
  var roomId = window.location.pathname.split('/')[1];

  // Initialize a socket.io client instance
  var socket;

  // Validate there is a username for the user
  validateUser();

  function validateUser() {

    if (userNameExists()) {
      socket = io(); // Connect socket
      var chatRoomData = gatherData();
      socket.emit('join', chatRoomData);
    } else {
      // Append room_id to model
      $("#room_id").val(roomId);
      // Display modal
      $(".bs-example-modal-sm").modal({
        show: true,
        backdrop: 'static',
        keyboard: false
      })
      // Emit join event
      if (joinedSuccessfully()) {
        socket = io(); // Connect socket
        socket.emit('join', gatherData());
      }
    }
  }

  function joinedSuccessfully() {
    var userInput = getUserInput();
    var key = userInput[1];
    var joinStatus = key.match(/btrue/);

    if (joinStatus.length != 0) {
      if (joinStatus[0] === 'true') {
        return true
      }
    } else {
      return false
    }
  }

  function userNameExists() {
    var userInput = getUserInput();
    var key = userInput[0];
    var keyName;

    if (key.length === 0) {
      return false
    } else {
      keyName = key.match(/\busername/)[0];
    }

    if (keyName === 'username') {
      if ( getUserName().length != 0 ) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  function getUserName() {
    var userInput = getUserInput();
    return userInput[0].match(/\=(.*)/)[1];
  }

  function getUserInput() {
    // The cookie contains the client's username and the name
    // of the chat-room.
    var cookie = document.cookie.split("; ");

    // Different browsers append extra data to the beginning of the
    // cookie. This ensures we get the last two elements:
    // the username and room-name.
    return userInput = cookie.slice(cookie.length - 2);
  }

  function gatherData() {
    return { roomId: roomId, userName: getUserName() };
  }

  // Event listeners

  socket.on('join', function(userName) {
    var name = decodeURI(userName);
    $('#online-users').append( $('<li>' + name + '</li>') );
    $('#messages').append( $('<li>').text( name + ' has joined the chatroom...'));
  });

  $('#chat-form').submit(function (event) {
    event.preventDefault();
    event.stopPropagation();

    var message = $('#message').val();
    var name = decodeURI(getUserName());

    $('#messages').append($('<li>').text( name + ": " + message));
    socket.emit('chat message', message);
    $('#message').val('');
  });

  socket.on('chat message', function (userName, message) {
    var name = decodeURI(userName);
    $('#messages').append($('<li>').text(name + ": " + message));
  });

  socket.on('online-users', function(userName) {
    var name = decodeURI(userName);
    $('#online-users').append( $('<li>' + name + '</li>') );
  });

  socket.on('disconnected', function(userName) {
    var name = decodeURI(userName);
    $('#messages').append( $('<li>').text( name + ' has left the chatroom...'));
  });

  socket.on('remove-user', function(userName) {
    var name = decodeURI(userName);
    $("#online-users>li:contains(" + name + ")").remove();
  });

});


