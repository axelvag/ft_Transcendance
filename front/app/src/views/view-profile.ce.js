import { user, getProfile, saveUser } from '@/auth.js';
import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
// import { getCsrfToken} from '@/auth.js';

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
      <!-- Apply border-radius to make the image circular. -->
      <!-- Adjust the default avatar path as needed. -->
      <img src="${
        user.avatar
      }" class="rounded-circle" style="width: 128px; height: 128px; object-fit: cover; border: 3px solid #b558f6;">
    </div>
    <div class="mb-4">
      <div class="form-label opacity-75 mb-1">Username</div>
      <div class="fs-5 fw-semibold">${user.username}</div>
    </div>
    <div class="mb-4">
      <div class="form-label opacity-75 mb-1">Email</div>
      <div class="fs-5 fw-semibold">${user.email}</div>
    </div>
    <div class="mb-4" ${!user.firstname && !user.lastname && 'hidden'}>
      <div class="form-label opacity-75 mb-1">Name</div>
      <div class="fs-5 fw-semibold">${[user.firstname, user.lastname].filter(Boolean).join(' ') || '-'}</div>
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
      <div class="mb-4 text-center">
        <label class="form-label d-block" for="avatarFile">Profile picture</label>
        <div class="d-inline-block d-flex flex-column align-items-center position-relative">
          <img id="viewProfile-edit-avatarImg" src="${user.avatar}" class="rounded-circle" style="width: 128px; height: 128px; object-fit: cover; cover; border: 3px solid #b558f6;">
          <input type="file" id="avatarFile" name="avatar" accept="image/*" hidden>
          <label class="btn btn-primary btn-sm mt-2" for="avatarFile">
            Change Avatar
          </label>
          <button type="button" class="btn btn-secondary btn-sm mt-2" id="defaultAvatar">
            Default Avatar
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-6 mb-4">
          <label class="form-label" for="username">Username</label>
          <input class="form-control form-control-lg" type="text" id="username" value="${user.username}" required>
        </div>
        <div class="col-lg-6 mb-4">
          <label class="form-label" for="email">Email</label>
          <input class="form-control form-control-lg" type="email" id="email" value="${user.email}" disabled>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-6 mb-4">
          <label class="form-label" for="firstname">First Name</label>
          <input class="form-control form-control-lg" type="text" id="firstname" value="${user.firstname}">
        </div>
        <div class="col-lg-6 mb-4">
          <label class="form-label" for="lastname">Last Name</label>
          <input class="form-control form-control-lg" type="text" id="lastname" value="${user.lastname}">
        </div>
      </div>
      <div class="py-3 mb-4 d-flex gap-3">
        <button id="reset-profile" class="btn btn-outline-primary">Cancel</button>
        <button type="submit" class="btn btn-primary">Save</button>
      </div>
    </form>
    <div
      class="position-absolute top-0 bottom-0 start-0 end-0 z-1 d-flex align-items-center justify-content-center"
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
      this.#user = getProfile();
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

    const avatarInput = this.querySelector('#avatarFile');
    avatarInput.addEventListener('change', event => {
      const file = event.target.files[0];
      if (file) {
        const avatarImage = this.querySelector('#viewProfile-edit-avatarImg');
        avatarImage.src = URL.createObjectURL(file);
        avatarImage.setAttribute('data-default-avatar', 'false');
      }
    });

    // Ajoutez un gestionnaire pour le bouton "Default Avatar"
    const defaultAvatarButton = this.querySelector('#defaultAvatar');
    defaultAvatarButton.addEventListener('click', () => {
      // Définissez ici l'URL de l'avatar par défaut
      console.log("Default Avatar");
      let defaultAvatarUrl;
      if (user.avatarDefault42 !== null) {
        defaultAvatarUrl = user.avatarDefault42;
      } else {
        defaultAvatarUrl = user.avatarDefault;
      }
      const avatarImage = this.querySelector('#viewProfile-edit-avatarImg');
      avatarImage.src = defaultAvatarUrl;
      avatarImage.setAttribute('data-default-avatar', 'true');
      // Optionnel: Réinitialisez l'input file en cas de sélection préalable d'un fichier
      avatarInput.value = '';
    });
  }

  #resetProfile() {
    this.#profileContentEl.innerHTML = viewProfileTemplate(this.#user);
  }

  async #saveProfile() {
    const profileEditForm = this.querySelector('#profile-edit');
    if (profileEditForm) {
      // const avatarFile = profileEditForm.querySelector('#avatarFile').files[0];
      // let avatarURL;
      // if (avatarFile) {
      //   // Créez une URL pour l'objet fichier
      //   avatarURL = URL.createObjectURL(avatarFile);
      //   const avatarImage = profileEditForm.querySelector('img');
      //   avatarImage.src = avatarURL;
      //   // await saveAvatar(avatarFile);
        
      // }
      const avatarImage = profileEditForm.querySelector('#viewProfile-edit-avatarImg');
      const isDefaultAvatar = avatarImage.getAttribute('data-default-avatar') === 'true';
      let avatarPayload;
      let avatarURL;

      if (isDefaultAvatar) {
        if (user.avatarDefault42 !== null) {
          avatarPayload = user.avatarDefault42;
        } else {
          avatarPayload = user.avatarDefault;
        }
      } else {
        const avatarFile = profileEditForm.querySelector('#avatarFile').files[0];
        if (avatarFile) {
          avatarURL = URL.createObjectURL(avatarFile);
          const avatarImage = profileEditForm.querySelector('img');
          avatarImage.src = avatarURL;
          avatarPayload = avatarFile; // Le fichier de l'avatar sélectionné par l'utilisateur.
        }
      }
      const newUser = {
        username: profileEditForm.querySelector('#username').value,
        email: profileEditForm.querySelector('#email').value,
        firstname: profileEditForm.querySelector('#firstname').value,
        lastname: profileEditForm.querySelector('#lastname').value,
        id: user.id,
        avatarFile: avatarPayload,
        // avatarFile: isDefaultAvatar ? user.avatarDefault : avatarFile,
      };
      console.log("object newuser", newUser);
      try {
        this.querySelector('#profile-edit-loader').hidden = false;
        this.querySelector('#profile-edit').classList.add('opacity-25');
        const response = await saveUser(newUser);
        if (response.success) {
          this.#user = getProfile();
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
