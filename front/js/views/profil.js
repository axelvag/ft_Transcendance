const template = `
  <div class="container-fluid h-100">
  <div class="row h-100">
    <!-- Sidebar -->
    <div class="col-md-2 p-4 sidebar vh-100 d-flex flex-column">
      <!-- LOGO could be an image or text -->
      <h2 class="text-white mb-4">LOGO</h2>
      
      <button class="btn btn-primary w-100 mb-4">Start a Game</button>

      <!-- Navigation links -->
      <nav class="nav flex-column custom-nav flex-grow-1">
        <a class="nav-link active" href="/" data-link>Profile</a>
        <a class="nav-link" href="/friends" data-link>Friends</a>
        <a class="nav-link" href="/careers" data-link>Careers</a>
        <a class="nav-link" href="/settings" data-link>Settings</a>
      </nav>

      <a class="nav-link text-white mt-auto" href="#">Logout</a>
    </div>
  </div>
</div>
`;

// const template = `
//   <div class="container-fluid h-100">
//     <div class="row h-100">
//       <!-- Sidebar -->
//       <div class="col-md-2 p-4 sidebar bg-dark vh-100 d-flex flex-column">
//         <!-- LOGO could be an image or text -->
//         <h2 class="text-white mb-4">LOGO</h2>

//         <button class="btn btn-primary w-100 mb-4">Start a Game</button>

//         <!-- Navigation links -->
//         <nav class="nav flex-column custom-nav flex-grow-1">
//           <a class="nav-link active" href="/" data-link>Profil</a>
//           <a class="nav-link" href="/friends" data-link>Friends</a>
//           <a class="nav-link" href="/careers" data-link>Careers</a>
//           <a class="nav-link" href="/settings" data-link>Settings</a>
//         </nav>

//       </div>

//       <!-- Main Content -->
//       <div class="col-md-10 p-4">
//         <div class="main-content bg-light">
//           <h1>Edit Profile</h1>
//           <!-- Profile form could go here -->
//           <p>Consectetur in vitae totam nulla reprehenderit est earum debitis quam laboriosam.</p>
//           <!-- ... other content ... -->
//         </div>
//       </div>
//     </div>
//   </div>
// `;

export default template;

{/* <container-fluid h-100>       <-- Prend la hauteur complète de son parent (souvent <body>)
  <row h-100>                 <-- Prend la hauteur complète de son parent (container-fluid)
    <col-md-2 vh-100>         <-- Prend la hauteur complète du viewport, s'étendant sur toute la hauteur de l'écran
      <!-- Sidebar content -->
    </col-md-2>
    <col-md-10>               <-- Prend le reste de l'espace dans la row
      <!-- Main content -->
    </col-md-10>
  </row>
</container-fluid> */}
