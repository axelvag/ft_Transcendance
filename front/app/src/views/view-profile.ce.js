import { redirectTo } from '@/router.js';
import { verifyUserLoginAndDisplayDashboard } from '@/auth.js';
// import { getCSRFToken } from '@/auth.js';
import { user } from '@/auth.js';
import { isAuthenticated } from '@/auth.js';
// import '@/components/layouts/default-layout-sidebar.ce.js';
// import '@/components/layouts/default-layout-main.ce.js';
import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
// import { getCSRFToken, getProfile } from '@/auth.js';

const fake_getUser = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        avatar: user.avatar,
      });
      // resolve(getProfile());
    }, 1000);
  });
};

// const fake_getUser = async () => {
//   return new Promise(resolve => {
//     setTimeout(() => {
//       resolve(getProfile());
//     }, 1000);
//   });
// };

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

const saveUser = async (newUser) => {
  try {
    const response = await fetch('http://127.0.0.1:8002/update_user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': getCSRFToken(),
        // Ajoutez ici d'autres en-têtes nécessaires, comme les tokens CSRF ou d'authentification
      },
      credentials: 'include',
      body: JSON.stringify(newUser),
    });

    if (!response.ok) {
      throw new Error('La requête a échoué avec le statut ' + response.status);
    }

    const data = await response.json();
    console.log("data", data);
    user.firstname = data.firstname;
    user.lastname = data.lastname;
    user.username = data.username;
    user.email = data.email; 
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
      <!-- Apply border-radius to make the image circular. -->
      <!-- Adjust the default avatar path as needed. -->
      <img src="${user.avatar}" class="rounded-circle" style="width: 128px; height: 128px; object-fit: cover; border: 3px solid #ffffff;">
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
      <div class="fs-5 fw-semibold">${user.firstname || 'Not provided'} ${user.lastname || ''}</div>
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
        <div class="d-inline-block position-relative" style="width: 128px; height: 128px;">
          <img src="${user.avatar}" class="rounded-circle" style="width: 128px; height: 128px; object-fit: cover; cover; border: 3px solid #ffffff;">
          <input type="file" id="avatarFile" name="avatar" accept="image/*" style="display: none;">
          <button type="button" class="btn btn-primary btn-sm mt-2" onclick="document.getElementById('avatarFile').click()">
            Change Avatar
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

    const avatarInput = this.querySelector('#avatarFile');
    avatarInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const avatarImage = this.querySelector('img');
      avatarImage.src = URL.createObjectURL(file);
      // user.avatar = URL.createObjectURL(file);
    }
  });
  }

  #resetProfile() {
    this.#profileContentEl.innerHTML = viewProfileTemplate(this.#user);
  }

  async saveAvatar(avatarFile) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    formData.append('id', user.id); // Assurez-vous que l'ID de l'utilisateur est correctement défini.

    console.log("avatarFile:", avatarFile);
    console.log("avatarFile:", user.id);
    console.log(formData);


    try {
      const response = await fetch('http://127.0.0.1:8002/save_avatar/', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Échec de la mise à jour de l'avatar avec le statut ${response.status}`);
      }

      const data = await response.json();
      console.log(data.avatar);
      if (data.success) {
        user.avatar = data.avatar;
        // this.#user.avatar = data.avatar; // Mettez à jour l'URL de l'avatar si nécessaire.
      } else {
        throw new Error('Échec de la mise à jour de l\'avatar');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'avatar:', error);
      throw error;
    }
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
      const avatarFile = profileEditForm.querySelector('#avatarFile').files[0];
      if (avatarFile) {
      // Créez une URL pour l'objet fichier
      const avatarURL = URL.createObjectURL(avatarFile);
      
      // Mettez à jour la source de l'image dans le formulaire d'édition de profil
      const avatarImage = profileEditForm.querySelector('img');
      // user.avatar = avatarURL;
      avatarImage.src = avatarURL;

      // Continuez avec l'envoi du fichier à votre backend
      await this.saveAvatar(avatarFile);
      }
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
