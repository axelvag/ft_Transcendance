var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get("/", function(req, res){
  res.sendFile(__dirname + '/index.html');
})

io.on('connection', function(socket){
  console.log('a user is connected');
  socket.on('disconnect', function(){
    console.log('a user is disconnect');
  })
  socket.on('chat message', function(msg){
    console.log('message recu : ' + msg);
    io.emit('chat message', msg)
  })



})

http.listen(3000, function(){
  console.log("Server runing on 3000")
})