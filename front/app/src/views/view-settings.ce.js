import { Modal } from 'bootstrap'
import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { redirectTo } from '@/router.js';
import { user } from '@/auth.js';
import { getCsrfToken, deleteUser } from '@/auth.js';

const BASE_URL = import.meta.env.BASE_URL;

class ViewSettings extends HTMLElement {
  connectedCallback() {
    console.log("hellooooo", typeof Modal);
    this.innerHTML = `
    <default-layout-sidebar></default-layout-sidebar>
    <default-layout-main>
      <h1>Settings</h1>

      <div id="supp">
        <a href="#" id="delete-account-link">
          <h3>Delete Account</h3>
        </a>
      </div>
      <!-- Include the modal HTML here or somewhere in your component -->
    </default-layout-main>

    <div class="modal fade" id="deleteAccountModal" tabindex="-1" aria-labelledby="deleteAccountModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteAccountModalLabel">Confirm Account Deletion</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Are you sure you want to delete your account? This action cannot be undone.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmDelete">Delete Account</button>
          </div>
        </div>
      </div>
    </div>

  `;

    const deleteModal = new Modal(this.querySelector('#deleteAccountModal'));

    this.querySelector('#delete-account-link').addEventListener('click', event => {
      event.preventDefault();
      deleteModal.show();
    });

    this.querySelector('#confirmDelete').addEventListener('click', async () => {
      this.suppUser();
      deleteModal.hide();
    });
  }

  async suppUser() {
    try {
      const csrfToken = await getCsrfToken();
      const deleteProfile = await fetch(`http://127.0.0.1:8002/delete_user_profile/${user.id}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrfToken,
        },
      });
      const deleteProfileData = await deleteProfile.json()
      if (deleteProfileData.success) {
        await deleteUser(csrfToken);
      } else {
        await deleteUser(csrfToken);
        console.error('Failed to load user profile:', deleteProfileData.message);
      }
      redirectTo('/');
    } catch (error) {
      console.error('Error:', error);
    }
  }

}
customElements.define('view-settings', ViewSettings);
