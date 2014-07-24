var express = require('express');
var http = require('http');
var socket = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socket.listen(server);

app.use(express.static(__dirname + '/app/views'));
app.use(express.static(__dirname + '/app/assets'));

app.get('/', function(req, res) {
    res.sendfile('index.html');
});

io.on('connection', function(socket) {
   console.log('A user connected...');

   socket.on('chat message', function(message) {
    socket.broadcast.emit('chat message', message);
   });

   socket.on('disconnect', function() {
       console.log('A user disconnected...');
   });
});

server.listen(8080, function() {
    console.log('Listening on port: 8080')
});
