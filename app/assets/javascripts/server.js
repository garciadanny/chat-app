function addUser(redisClient, socketId, socket, userName) {
  redisClient.set(socketId, userName);
  redisClient.sadd('online-users', userName);
  socket.broadcast.emit('join', userName);
};

function displayOnlineUsers(redisClient, socket) {
  redisClient.smembers('online-users', function(err, users) {
    if (err) throw err

    users.reverse();
    users.forEach(function(user) {
      socket.emit('online-users', user);
    })
  });
};

function displayMessageHistory(redisClient, socket) {
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

function displayMessage(redisClient, socketId, socket, message) {
  redisClient.get(socketId, function(err, userName) {
    if (err) throw err

    socket.broadcast.emit('chat message', userName, message);
    storeUserMessage(redisClient, userName, message);
  });
};

function storeUserMessage(redisClient, userName, message) {
  var userMessage = JSON.stringify( {userName: userName, data: message} );
  redisClient.lpush("messages", userMessage, function(err, userMessage) {
        redisClient.ltrim("messages", 0, 20);
  });
};

function disconnectUser(redisClient, socketId, socket) {
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

module.exports = {
  addUser: addUser,
  displayOnlineUsers: displayOnlineUsers,
  displayMessageHistory: displayMessageHistory,
  displayMessage: displayMessage,
  storeUserMessage: storeUserMessage,
  disconnectUser: disconnectUser
}