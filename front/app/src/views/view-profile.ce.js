import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { getCSRFToken, getProfile } from '@/auth.js';

const fake_getUser = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(getProfile());
    }, 1000);
  });
};

// const fake_saveUser = async data => {
//   return new Promise(resolve => {
//     setTimeout(() => {
//       resolve({
//         success: true,
//         user: { ...data },
//       });
//     }, 1000);
//   });
// };

const saveUser = async newUser => {
  try {
    const response = await fetch('http://127.0.0.1:8001/accounts/update_user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
        // Ajoutez ici d'autres en-têtes nécessaires, comme les tokens CSRF ou d'authentification
      },
      credentials: 'include',
      body: JSON.stringify(newUser),
    });

    if (!response.ok) {
      throw new Error('La requête a échoué avec le statut ' + response.status);
    }

    const data = await response.json();
    return data; // Renvoie les données de réponse pour un traitement ultérieur
  } catch (error) {
    console.error("Erreur lors de l'envoi des données de l'utilisateur:", error);
    throw error; // Renvoie l'erreur pour une gestion ultérieure
  }
};

const loadingProfileTemplate = `
  <div class="placeholder-glow">
    <h1 class="display-5 fw-bold mb-4">
      Hi!
    </h1>
    <h2 class="h3 fw-semibold border-bottom py-3 my-4">
      Profile information
    </h2>
    <div>
      <div class="mb-4">
        <div class="img-thumbnail placeholder" style="width: 128px; height: 128px;"></div>
      </div>
      <div class="mb-4">
        <div class="form-label opacity-75 mb-1">Username</div>
        <div class="fs-5 fw-semibold">
          <span class="placeholder rounded-1 col-12" style="max-width: 120px;"></span>
        </div>
      </div>
      <div class="mb-4">
        <div class="form-label opacity-75 mb-1">Email</div>
        <div class="fs-5 fw-semibold">
          <span class="placeholder rounded-1 col-12" style="max-width: 200px;"></span>
        </div>
      </div>
      <div class="mb-4">
        <div class="form-label opacity-75 mb-1">Name</div>
        <div class="fs-5 fw-semibold">
          <span class="placeholder rounded-1 col-12" style="max-width: 150px;"></span>
        </div>
      </div>
    </div>
  </div>
`;

const viewProfileTemplate = user => `
  <h1 class="display-5 fw-bold mb-4">
    Hi <span class="text-bicolor">${user.username}</span>!
  </h1>
  <h2 class="h3 fw-semibold border-bottom py-3 my-4 d-flex">
    <span class="flex-grow-1 flex-shrink-1 text-truncate">Profile information</span>
    <button class="btn btn-outline-primary btn-sm" id="edit-profile">
      <ui-icon name="edit" scale="1.125" class="me-1"></ui-icon>
      Edit
    </button>
  </h2>
  <div>
    <div class="mb-4">
      <img src="${user.avatar}" class="img-thumbnail" width="128" height="128" alt="${user.username}">
    </div>
    <div class="mb-4">
      <div class="form-label opacity-75 mb-1">Username</div>
      <div class="fs-5 fw-semibold">${user.username}</div>
    </div>
    <div class="mb-4">
      <div class="form-label opacity-75 mb-1">Email</div>
      <div class="fs-5 fw-semibold">${user.email}</div>
    </div>
    <div class="mb-4">
      <div class="form-label opacity-75 mb-1">Name</div>
      <div class="fs-5 fw-semibold">${user.firstname} ${user.lastname}</div>
    </div>
  </div>
`;

const editProfileTemplate = user => `
  <h1 class="display-5 fw-bold mb-4">
    Hi <span class="text-bicolor">${user.username}</span>!
  </h1>
  <h2 class="h3 fw-semibold border-bottom py-3 my-4">
    Profile information
  </h2>
  <div class="position-relative">
    <form id="profile-edit">
      <div class="mb-4">
        <label class="form-label" for="firstname">Profile picture</label>
        <div>
          <img src="${user.avatar}" class="img-thumbnail" width="128" height="128" alt="${user.username}">
        </div>
      </div>
      <div class="row">
        <div class="col-lg-6 mb-4">
          <label class="form-label" for="username">Username</label>
          <input class="form-control form-control-lg" type="text" id="username" value="${user.username}" required>
        </div>
        <div class="col-lg-6 mb-4">
          <label class="form-label" for="email">Email</label>
          <input class="form-control form-control-lg" type="email" id="email" value="${user.email}" required>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-6 mb-4">
          <label class="form-label" for="firstname">First Name</label>
          <input class="form-control form-control-lg" type="text" id="firstname" value="${user.firstname}" required>
        </div>
        <div class="col-lg-6 mb-4">
          <label class="form-label" for="lastname">Last Name</label>
          <input class="form-control form-control-lg" type="text" id="lastname" value="${user.lastname}" required>
        </div>
      </div>
      <div class="py-3 mb-4 d-flex gap-3">
        <button id="reset-profile" class="btn btn-outline-primary">Cancel</button>
        <button type="submit" class="btn btn-primary">Save</button>
      </div>
    </form>
    <div
      class="
        position-absolute top-0 bottom-0 start-0 end-0 z-1
        d-flex align-items-center justify-content-center
      "
      id="profile-edit-loader"
      hidden
    >
      <ui-loader></ui-loader>
    </div>
  </div>
`;

class ViewProfile extends HTMLElement {
  #profileContentEl = null;
  #user = null;

  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  connectedCallback() {
    this.innerHTML = `
      <default-layout-sidebar></default-layout-sidebar>
      <default-layout-main id="profile-section">
        ${loadingProfileTemplate}
      </default-layout-main>
    `;

    this.#profileContentEl = this.querySelector('#profile-section');
    this.addEventListener('click', this.handleClick);

    this.#loadUser();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick);
  }

  handleClick(e) {
    const editProfileBtn = e.target.closest('#edit-profile');
    if (editProfileBtn) {
      this.#editProfile();
    }
    const resetProfileBtn = e.target.closest('#reset-profile');
    if (resetProfileBtn) {
      this.#resetProfile();
    }
  }

  async #loadUser() {
    try {
      this.#user = await fake_getUser();
      this.#profileContentEl.innerHTML = viewProfileTemplate(this.#user);
    } catch (err) {
      console.error(err);
    }
  }

  #editProfile() {
    this.#profileContentEl.innerHTML = editProfileTemplate(this.#user);
    this.querySelector('#profile-edit').addEventListener('submit', e => {
      e.preventDefault();
      this.#saveProfile();
    });
  }

  #resetProfile() {
    this.#profileContentEl.innerHTML = viewProfileTemplate(this.#user);
  }

  async #saveProfile() {
    const profileEditForm = this.querySelector('#profile-edit');
    if (profileEditForm) {
      const newUser = {
        username: profileEditForm.querySelector('#username').value,
        email: profileEditForm.querySelector('#email').value,
        firstname: profileEditForm.querySelector('#firstname').value,
        lastname: profileEditForm.querySelector('#lastname').value,
        avatar: this.#user.avatar,
        id: user.id,
      };
      try {
        this.querySelector('#profile-edit-loader').hidden = false;
        this.querySelector('#profile-edit').classList.add('opacity-25');
        const response = await saveUser(newUser);
        if (response.success) {
          this.#user = response.user;
          this.#profileContentEl.innerHTML = viewProfileTemplate(this.#user);
        } else {
          this.querySelector('#profile-edit-loader').hidden = true;
          this.querySelector('#profile-edit').classList.remove('opacity-25');
          console.error(err);
        }
      } catch (err) {
        this.querySelector('#profile-edit-loader').hidden = true;
        this.querySelector('#profile-edit').classList.remove('opacity-25');
        console.error(err);
      }
    }
  }
}

customElements.define('view-profile', ViewProfile);
