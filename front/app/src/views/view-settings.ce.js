import { showModal } from '@/modal.js';
import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { redirectTo } from '@/router.js';
import { user } from '@/auth.js';
import { getCsrfToken, deleteUser } from '@/auth.js';
import { BASE_URL } from '@/constants.js';

class ViewSettings extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <default-layout-sidebar></default-layout-sidebar>
    <default-layout-main>
      <h1>Settings</h1>
      <div id="supp">
        <a href="#" id="delete-account-link">
          <h3>Delete Account</h3>
        </a>
      </div>

      <br>
      
      <h1>Developer's Team</h1>
      <div class="container">
        <div class="row">
          <div class="col-md-3">
            <div class="card h-100">
              <img src="/assets/img/dapereir.jpg" class="card-img-top img-fluid" style="max-width: 200px; max-height: 150px; width: auto; height: auto;" alt="dapereir">
              <div class="card-body">
                <h5 class="card-title">David Pereira</h5>
                <p class="card-text">42 member dapereir.</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card h-100">
              <img src="/assets/img/lveloso.jpg" class="card-img-top img-fluid" style="max-width: 200px; max-height: 150px; width: auto; height: auto;" alt="lveloso">
              <div class="card-body">
                <h5 class="card-title">Lucas Veloso</h5>
                <p class="card-text">42 member lveloso.</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card h-100">
              <img src="/assets/img/avaganay.jpg" class="card-img-top img-fluid" style="max-width: 200px; max-height: 150px; width: auto; height: auto;" alt="avaganay">
              <div class="card-body">
                <h5 class="card-title">Axel Vaganay</h5>
                <p class="card-text">42 member avaganay.</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card h-100">
              <img src="/assets/img/ascatama.jpg" class="card-img-top img-fluid" style="max-width: 200px; max-height: 150px; width: auto; height: auto;" alt="ascatama">
              <div class="card-body">
                <h5 class="card-title">Alessio Scatamachia</h5>
                <p class="card-text">42 member ascatama.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </default-layout-main>
    `;

    this.querySelector('#delete-account-link').addEventListener('click', event => {
      event.preventDefault();
      this.showDeleteConfirmation();
    });
  }

  showDeleteConfirmation() {
    showModal('Confirm Account Deletion', 'Are you sure you want to delete your account? This action cannot be undone.', {
      okCallback: () => this.suppUser(),
      cancelCallback: () => console.log('Deletion cancelled.')
    });
  }

  async suppUser() {
    console.log("Je rentre ici pour le supprime l'user")
    try {
      const csrfToken = await getCsrfToken();
      const deleteProfile = await fetch(`${BASE_URL}:8002/delete_user_profile/${user.id}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrfToken,
        },
      });
      const deleteProfileData = await deleteProfile.json();
      if (deleteProfileData.success) {
        await deleteUser(csrfToken);
      } else {
        console.error('Failed to delete user profile:', deleteProfileData.message);
      }
      redirectTo('/');
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

customElements.define('view-settings', ViewSettings);
