import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { redirectTo } from '@/router.js';
import { user } from '@/auth.js';
import { getCsrfToken, resetLocalUser, deleteUser } from '@/auth.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ViewSettings extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <default-layout-sidebar></default-layout-sidebar>
      <default-layout-main>
        <h1>Settings</h1>

        <div id="supp">
          <a href="#" id="delete-account-link">
            <h3> supprimer le compte</h3>
          </a>
        </div>
      </default-layout-main>
    `;
    this.querySelector('#delete-account-link').addEventListener('click', event => {
      event.preventDefault();
      this.suppUser();
    });
  }

  async suppUser() {
    try {
      const csrfToken = await getCsrfToken();
      const deleteProfile = await fetch(`https://127.0.0.1:8002/delete_user_profile/${user.id}/`, {
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
