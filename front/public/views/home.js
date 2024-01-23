const template = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="./css/home_auth.css">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>django auth</title>
</head>
<body>
  <div class="navbar">
    <img src="asset/logoTranscendencenew.png" alt="Description de l'image" class="img-home">
    <div class="flex">
      <label class="switch">
        <input type="checkbox" id="toggle-example" onchange="toggleTheme()">
        <span class="slider round"></span>
      </label>
        <p class="margin_left"><a href="" class="play-now-btn">Connexion</a></p>
        <p class="margin_left"><a href="" class="play-now-btn">Inscription</a></p>
    </div>
  </div>
  <div class="bottom_navbar"></div>
    <div class="padding-global">
      <div class="center-container">
        <h1 class="gradient-text-home">The Pong Game</h1>
        <div class="margin_top"></div>
        <form action="#">
          <button type="submit" class="play-now-btn_play">Play Now</button>
        </form>
      </div>
      <script src="{% static 'js/theme-toggle.js' %}"></script>
    </div>
</body>
</html>
`;

export default template;