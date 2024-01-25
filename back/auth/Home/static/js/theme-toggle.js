function toggleTheme() {
  // Vérifie si le toggle switch est checked
  var isChecked = document.getElementById('toggle-example').checked;
  
  // Obtenez l'élément body
  var body = document.body;
  
  // Si le toggle est checked, appliquez le thème clair, sinon appliquez le thème sombre
  if(isChecked) {
    body.classList.add("white-mode");
  } else {
    body.classList.remove("white-mode");
  }
}