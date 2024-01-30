var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Configuration de la route pour la page d'accueil
// Et envoie du fichier HTML de la page d'accueil
app.get("/", function(req, res){
  res.sendFile(__dirname + '/index.html');
})

// Gestion des connexions WebSocket
io.on('connection', function(socket){
  console.log('a user is connected');
  socket.on('disconnect', function(){
    console.log('a user is disconnect');
  })
  socket.on('chat message', function(msg){
    // Affichage du message reçu dans la console du serveur
    console.log('message recu : ' + msg);
    // Émission du message à tous les clients connectés
    io.emit('chat message', msg)
  })



})

http.listen(3000, function(){
  console.log("Server runing on 3000")
})