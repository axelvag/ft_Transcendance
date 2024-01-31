// Importation des modules
var express = require('express');
var http = require('http');
var io = require('socket.io');

// Création de l'application Express
var app = express();

// Création du serveur HTTP en utilisant le module http
var server = http.createServer(app);

// Configuration de Socket.IO en utilisant le serveur HTTP créé ci-dessus
var socketServer = io(server);

// Configuration de la route pour la page d'accueil
app.get("/", function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// Gestion des connexions WebSocket
socketServer.on('connection', function(socket){
  console.log('a user is connected');
  
  socket.on('disconnect', function(){
    console.log('a user is disconnect');
  });

  socket.on('chat message', function(msg){
    console.log('message recu : ' + msg);
    socketServer.emit('chat message', msg);
  });
});

// Démarrage du serveur sur le port 3000
var listener = server.listen(3000, function(){
  console.log("Server running on 3000");
});

// Gestionnaire pour l'arrêt propre du serveur
process.on('SIGINT', () => {
  console.log('Arrêt du serveur...');
  // listener.close(() => {
  //   console.log('Serveur arrêté.');
  //   process.exit();
  // });
  process.exit();
});