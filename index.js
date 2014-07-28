var express = require('express');
var http = require('http');
var socket = require('socket.io');
var redis = require('redis');
var ioServer = require('./app/assets/javascripts/server');

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
    ioServer.addUser(redisClient, socketId, socket, userName);
    ioServer.displayOnlineUsers(redisClient, socket);
    ioServer.displayMessageHistory(redisClient, socket);
  });

  socket.on('chat message', function (message) {
    ioServer.displayMessage(redisClient, socketId, socket, message);
  });

  socket.on('disconnect', function () {
    console.log('A user disconnected...');
    ioServer.disconnectUser(redisClient, socketId, socket);
  });
});

server.listen(8080, function () {
  console.log('Listening on port: 8080')
});
