var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

var User = function () {
  this.name = '';
  this.email = '';
  this.manager_login = '';
  this.socket = '';
};

var Manager = function () {
  this.name = '';
  this.login = '';
  this.Users = [];
  this.socket = '';
};

var managers = {};
var users = {};

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

  socket.on('adduser', function(username, user_email) {  
    var user = new User();

    user.name = username;
    user.email = user_email;
    user.manager_login = '4031_2032';
    user.socket = socket;

    users[user_email] = user;

    io.sockets.emit('updateusers', User.name);
    managers[user.manager_login].socket.emit('newuser', user.name, user.email);
  });

  socket.on('addmanager', function(manager_name, manager_login) {
    var manager = new Manager();

    manager.name = manager_name;
    manager.login = manager_login;
    manager.socket = socket;

    managers[manager_login] = manager;
  });

  socket.on('sendmessage', function(user_email, message) {
      var manager_login = users[user_email].manager_login;
      users[user_email].socket.emit('updatechat', message);
      managers[manager_login].socket.emit('updatechat', users[user_email].name, users[user_email].email, message);
  });

  socket.on('disconnect', function() {
    for (var user in users) {
      if (socket === user.socket) {
        managers[users.manager_login].socket.emit('deletechat', user.email);
        delete users[user.email];
        break;
      };
    };
  });

});