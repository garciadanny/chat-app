//
// Implement the Redis To Go connection in production.
// Otherwise, in development, create a local client.
//

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(":")[1]);
} else {
  var redisClient = require('redis').createClient();
}

function IOServer (socket) {
  var socketId = socket.id.toString();

  this.addUser = function(userName) {
    redisClient.set(socketId, userName);
    redisClient.sadd('online-users', userName);
    socket.broadcast.emit('join', userName);
  };

  this.displayOnlineUsers = function() {
    redisClient.smembers('online-users', function(err, users) {
      if (err) throw err

      users.reverse();
      users.forEach(function(user) {
        socket.emit('online-users', user);
      });
    });
  };

  this.displayMessageHistory = function() {
    redisClient.lrange("messages", 0, -1, function(err, messages) {
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
    redisClient.get(socketId, function(err, userName) {
      if (err) throw err

      socket.broadcast.emit('chat message', userName, message);
      storeUserMessage(userName, message);
    });
  };

  this.disconnectUser = function() {
    redisClient.get(socketId, function(err, userName) {
      if (err) throw err
      socket.broadcast.emit('disconnected', userName);
      socket.broadcast.emit('remove-user', userName);
      redisClient.srem('online-users', userName);
      redisClient.del(socketId);
//    redisClient.del("messages");
//    redisClient.del("online-users");
    });
  };

  function storeUserMessage(userName, message) {
    var userMessage = JSON.stringify( {userName: userName, data: message} );
    redisClient.lpush("messages", userMessage, function(err, userMessage) {
      redisClient.ltrim("messages", 0, 20);
    });
  };
};

module.exports = IOServer;