// const template = `
//     <nav class="nav flex-column">
//         <a class="nav-link" href="/" data-link>Home</a>
//         <a class="nav-link" href="/about" data-link>About</a>
//         <a class="nav-link" href="/contact" data-link>Contact</a>
//     </nav>
//     <main>
//         <h1>Home</h1>
//         <p>Consectetur in vitae totam nulla reprehenderit est earum debitis quam laboriosam.</p>
//     </main>
// `;

// export default template;

// home.js
const template = `
  <div class="container-fluid">
    <div class="row">
      <!-- Sidebar -->
      <div class="col-md-2 p-4 sidebar bg-dark">
        <!-- LOGO could be an image or text -->
        <h2 class="text-white mb-4">LOGO</h2>
        <!-- Navigation links -->
        <nav class="nav flex-column">
          <a class="nav-link active" href="/" data-link>Home</a>
          <a class="nav-link" href="/about" data-link>About</a>
          <a class="nav-link" href="/contact" data-link>Contact</a>
          <!-- Other links can be added here -->
        </nav>
      </div>
      <!-- Main Content -->
      <div class="col-md-10">
        <div class="main-content bg-light p-4">
          <h1>Edit Profile</h1>
          <!-- Profile form could go here -->
          <p>Consectetur in vitae totam nulla reprehenderit est earum debitis quam laboriosam.</p>
          <!-- ... other content ... -->
        </div>
      </div>
    </div>
  </div>
`;

export default template;
