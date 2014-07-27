var express = require('express');
var http = require('http');
var socket = require('socket.io');
var redis = require('redis');


var app = express();
var server = http.Server(app);
var io = socket.listen(server);
var redisClient = redis.createClient();

app.use(express.static(__dirname + '/app/views'));
app.use(express.static(__dirname + '/app/assets'));

app.get('/', function (req, res) {
  res.sendfile('index.html');
});

io.on('connection', function (socket) {
  console.log('A user connected...');

  var socketId = socket.id.toString();

  socket.on('join', function (userName) {
    redisClient.set(socketId, userName);
    redisClient.sadd('online-users', userName);

    socket.broadcast.emit('join', userName);

    redisClient.smembers('online-users', function(err, users) {
       if (err) throw err

       users.reverse();
       users.forEach(function(user) {
           socket.emit('online-users', user);
       })
    });

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
  });

  socket.on('chat message', function (message) {

    redisClient.get(socketId, function(err, userName) {
      if (err) throw err
      socket.broadcast.emit('chat message', userName, message);

      var userMessage = JSON.stringify( {userName: userName, data: message} );
      redisClient.lpush("messages", userMessage, function(err, userMessage) {
        redisClient.ltrim("messages", 0, 20);
      });
    });
  });

  socket.on('disconnect', function () {
    console.log('A user disconnected...');

    redisClient.get(socketId, function(err, userName) {
      if (err) throw err
      socket.broadcast.emit('disconnected', userName);
      socket.broadcast.emit('remove-user', userName);
      redisClient.srem('online-users', userName);
      redisClient.del(socketId);
//      redisClient.del("messages");
//      redisClient.del("online-users");
    });


  });
});

server.listen(8080, function () {
  console.log('Listening on port: 8080')
});
