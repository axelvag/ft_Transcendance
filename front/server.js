// server.js
const express = require('express');
// const open = require('open');
const app = express();
const port = 10000;

app.use(express.static('public'));

const server = app.listen(port, () => {
  console.log(`Le serveur est en cours d'exécution sur le port ${port}`);
  // open(`http://localhost:${port}`);
});

// Gestionnaire pour l'arrêt propre du serveur
process.on('SIGINT', () => {
  console.log('Arrêt du serveur...');
  server.close(() => {
    console.log('Serveur arrêté.');
    process.exit();
  });
});
