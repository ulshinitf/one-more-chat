var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

var usernames = {};
var onlineClients = {};

server.listen(8080);

app.get('/user', function (req, res) {
  res.sendFile(__dirname + '/user.html');
});

app.get('/manager', function (req, res) {
  res.sendFile(__dirname + '/manager.html');
});


io.sockets.on('connection', function (socket) {

  socket.on('sendchat', function (data) {
    io.sockets.emit('updatechat', socket.username, data);
  });

  socket.on('adduser', function(username) {
    socket.username = username;
    usernames[username] = username;
    onlineClients[username] = socket;
    io.sockets.emit('updateusers', usernames);
    onlineClients['manager'].emit('newuser', username);

  });

  socket.on('pm', function(from, to, message) {
      onlineClients[from].emit('updatechat', socket.username, message);
      onlineClients[to].emit('updatechat', socket.username, message);
  });

  socket.on('disconnect', function() {
    onlineClients['manager'].emit('deletechat', socket.username);
    delete usernames[socket.username];
    io.sockets.emit('updateusers', usernames);
    socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
  });

});