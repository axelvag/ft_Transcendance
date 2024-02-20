import { isAuthenticated } from '@/auth.js';
import { redirectTo } from '@/router.js';

class ViewSettings extends HTMLElement {
    connectedCallback() {
        const isAuth = isAuthenticated();
        if (!isAuth) {
        redirectTo('/login');
        } else {
        this.displayDashboard();
        }
    }

    displayDashboard() {
        this.innerHTML = `
        <div class="layout">
            <view-sidebar></view-sidebar>
            <main>
                <h1>Settings</h1>
                <p>Welcome to your profile page. Here you can view and edit your profile information.</p>
            </main>
        </div>
    `;
    }
}
customElements.define('view-settings', ViewSettings);