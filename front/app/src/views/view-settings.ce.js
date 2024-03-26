import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { redirectTo } from '@/router.js';
import { user } from '@/auth.js';
import { getCsrfToken, resetLocalUser } from '@/auth.js';

const BASE_URL = import.meta.env.BASE_URL;

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
      const url = `https://127.0.0.1:8001/accounts/delete_user/${user.username}`;
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': csrfToken,
        },
      });
  
      const data = await response.json();
      if (data.success) {
        user.isAuthenticated = false;
  
        const deleteProfile = await fetch(`https://127.0.0.1:8002/delete_user_profile/${user.id}/`, {
          method: 'DELETE',
          credentials: 'include',
        });
  
        const deleteProfileData = await deleteProfile.json();
        console.log(deleteProfileData);
  
        if (deleteProfileData.success) {
          resetLocalUser(deleteProfileData);
        } else {
          console.error('Failed to load user profile:', deleteProfileData.message);
        }
  
        redirectTo('/');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
}
customElements.define('view-settings', ViewSettings);
