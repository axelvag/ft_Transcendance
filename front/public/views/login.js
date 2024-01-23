import '../components/layouts/auth-layout.ce.js';

const template = `
  <login-layout>
    <h1 class="fw-bold py-2 mb-4">
      <span class="text-gradient">Log In</span>
    </h1>
    <form>
      <div class="mb-4">
        <label class="form-label opacity-50" for="username">
          Username
        </label>
        <input class="form-control form-control-lg" type="username" id="username" name="username" required />
      </div>
      <div class="mb-4">
        <div class="d-flex justify-content-between">
          <label class="form-label opacity-50" for="password">
            Password
          </label>
          <a href="#" class="link fw-bold text-decoration-none">
            Forgot password?
          </a>
        </div>
        <input class="form-control form-control-lg" type="password" id="password" name="password" required />
      </div>
      <div class="d-grid pt-3">
        <button type="submit" data-link="/" class="btn btn-primary btn-lg fw-bold">
          Log In
        </button>
        <div class="text-center pt-4">
          <a href="#" data-link="/signup" class="link fw-bold text-decoration-none">
            Create an account
          </a>
        </div>
      </div>
    </form>
  </login-layout>
`;

export default template;
