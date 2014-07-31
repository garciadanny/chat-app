var express = require('express');
var http = require('http');
var socket = require('socket.io');
var bodyParser = require('body-parser');
var randomString = require('randomstring');
var IOServer = require('./app/assets/javascripts/server');

var app = express();
var server = http.Server(app);
var io = socket.listen(server);

app.use(express.static(__dirname + '/app/assets'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/app/views/index.html');
});

app.post('/create', function(req, res) {
  var roomId = randomString.generate();
  res.cookie('username', req.body.username);
  res.redirect('/' + roomId);
});

app.post('/join', function(req, res) {
  var roomId = req.body.room_id;
  res.cookie('username', req.body.username);
  res.cookie('join', 'true');
  res.redirect('/' + roomId);
});

app.get('/:room_id', function(req, res) {
  res.sendfile(__dirname + '/app/views/chat_room.html');
});

io.on('connection', function (socket) {
  console.log("A user connected......")
  var ioServer = new IOServer(socket);

  socket.on('join', function (data) {
      ioServer.initializeRoom(data);
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
