var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

var Client = function () {
  this.name = '';
  this.manager_name = '';
  this.socket = '';
};

var Manager = function () {
  this.name = '';
  this.clients = [];
  this.socket = '';
  this.chats = 0;
};

var managers = {};
var clients = {};

server.listen(8080);

app.get('/user', function (req, res) {
  res.sendFile(__dirname + '/user.html');
});

app.get('/manager', function (req, res) {
  res.sendFile(__dirname + '/manager.html');
});

/*
 *    Socket events
 */

io.sockets.on('connection', function (socket) {

  socket.on('sendchat', function (data) {
    io.sockets.emit('updatechat', socket.username, data);
  });

  socket.on('adduser', function(username) {

    /*
    socket.username = username;
    usernames[username] = username;
    clients[username] = socket;
    */
   
    var client = new Client();
    client.name = username;
    client.manager_name = managers[0];
    client.socket = socket;
    clients.push(client);

    io.sockets.emit('updateusers', client.name);
    managers[client.manager_name].emit('newuser', client.name);
  });

  socket.on('addmanager', function(manager_name) {
    var manager = new Manager();

    manager.name = manager_name;
    manager.socket = socket;

    managers.push(manager);
  });

  socket.on('sendmessage', function(client_name, message) {
      var manager_name;

      for (client in clients) {
        if (client.name === from) {
          client.socket.emit('updatechat', socket.username, message);
          manager_name = client.manager_name;
          break;
        };
      }

      for (manager in managers) {
        if ( manager.name === manager_name ) {
          manager.socket.emit('updatechat', socket.username, message);
        };
      };
  });

  socket.on('disconnect', function() {
    clients[manager_name].emit('deletechat', socket.username);
    delete usernames[socket.username];
    io.sockets.emit('updateusers', usernames);
  });

});