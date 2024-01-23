import '../components/layouts/auth-layout.ce.js';

const template = `
  <login-layout>
    <h1 class="fw-bold py-2 mb-4">
      <span class="text-gradient">Sign up</span>
    </h1>
    <form>
    <div class="mb-4">
      <label class="form-label opacity-50" for="email">
        Your email
      </label>
      <input class="form-control form-control-lg" type="email" id="email" name="email" required />
    </div>
      <div class="mb-4">
        <label class="form-label opacity-50" for="username">
          Choose your username
        </label>
        <input class="form-control form-control-lg" type="username" id="username" name="username" required />
      </div>
      <div class="mb-4">
        <label class="form-label opacity-50" for="password">
          Choose your password
        </label>
        <input class="form-control form-control-lg" type="password" id="password" name="password" required />
      </div>
      <div class="mb-4">
        <label class="form-label opacity-50" for="password">
          Repeat your password
        </label>
        <input class="form-control form-control-lg" type="password" id="password" name="password" required />
      </div>
      <div class="d-grid pt-3">
        <button type="submit" data-link="/" class="btn btn-primary btn-lg fw-bold">
          Sign up
        </button>
        <div class="text-center pt-4">
          <a href="#" data-link="/login" class="link fw-bold text-decoration-none">
            I already have an account
          </a>
        </div>
      </div>
    </form>
  </login-layout>
`;

export default template;
