//
// Implement the Redis To Go connection in production.
// Otherwise, in development, create a local client.
//

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redisClient = require("redis").createClient(rtg.port, rtg.hostname);
  redisClient.auth(rtg.auth.split(":")[1]);
} else {
  var redisClient = require('redis').createClient();
}

function IOServer (socket) {
  var socketId = socket.id.toString(),
      roomId,
      roomName,
      userName;

  this.initializeRoom = function(data) {
    roomId = data.roomId;
    roomName = data.roomName;
    userName = data.userName;

    console.log('Socket id: ' + socketId);
    console.log('Room id: ' + roomId);
    console.log('Username: ' + userName);
    console.log('Roomname: ' + roomName);

    addUser();
    prepareRoom();
  };

  function addUser() {
    socket.join(roomId);
    var store = roomId + 'online-users';
    redisClient.sadd(store, userName);
    socket.broadcast.to(roomId).emit('join', userName);
  };

  function prepareRoom() {
    displayOnlineUsers();
    displayMessageHistory();
  };

  function displayOnlineUsers() {
    var store = roomId + 'online-users';
    redisClient.smembers(store, function(err, users) {
      if (err) throw err

      users.reverse();
      users.forEach(function(user) {
        socket.emit('online-users', user);
      });
    });
  };

  function displayMessageHistory() {
    var store = roomId + 'messages';
    redisClient.lrange(store, 0, -1, function(err, messages) {
      if (err) throw err

      messages = messages.reverse();
      messages.forEach(function(message) {
        try {
          var msg = JSON.parse(message)
          socket.emit("chat message", msg.userName, msg.data);
        } catch (err) {
          console.error(err)
          console.log('not a valid message:', message)
        }
      });
    });
  };

  this.displayMessage = function(message) {
      socket.broadcast.to(roomId).emit('chat message', userName, message);
      storeUserMessage(message);
  };

  function storeUserMessage(message) {
    var store = roomId + 'messages';
    var userMessage = JSON.stringify( {userName: userName, data: message} );
    redisClient.lpush(store, userMessage, function(err, userMessage) {
      redisClient.ltrim("messages", 0, 20);
    });
  };

  this.disconnectUser = function() {
      socket.broadcast.to(roomId).emit('disconnected', userName);
      socket.broadcast.to(roomId).emit('remove-user', userName);
      var store = roomId + 'online-users';
      redisClient.srem(store, userName);
//    redisClient.del(roomId + "messages");
//    redisClient.del(roomId + "online-users");
  };
};

module.exports = IOServer;