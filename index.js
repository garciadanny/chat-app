var express = require('express');
var http = require('http');
var socket = require('socket.io');
var IOServer = require('./app/assets/javascripts/server');

var app = express();
var server = http.Server(app);
var io = socket.listen(server);

app.use(express.static(__dirname + '/app/assets'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/app/views/index.html');
});

app.get('/:room_id', function(req, res) {
  var room_id = req.params.room_id;
  res.sendfile(__dirname + '/app/views/chat_room.html');
});

io.on('connection', function (socket) {
  var ioServer = new IOServer(socket);

  socket.on('join', function (userName) {
    ioServer.addUser(userName);
    ioServer.displayOnlineUsers();
    ioServer.displayMessageHistory();
  });

  socket.on('chat message', function (message) {
    ioServer.displayMessage(message);
  });

  socket.on('disconnect', function () {
    console.log('A user disconnected...');
    ioServer.disconnectUser();
  });
});

var port = Number(process.env.PORT || 3000);
server.listen(port, function () {
  console.log('Listening on port: ' + port);
});
