import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { user } from '@/auth.js';

class ViewFriend extends HTMLElement {

  constructor() {
    super();
    this.websocket = null;
  }

  connectedCallback() {
    this.innerHTML = `
      <default-layout-sidebar></default-layout-sidebar>
      <default-layout-main>
        <h1 class="display-5 fw-bold mb-4 text-center mt-md-n5 mt-0">
          Friends
        </h1>
        <div class="container">
          <div class="row">
            <div class="col-md-3 ms-md-auto">
                <img src="assets/img/avatar-careers.jpg" class="img-thumbnail rounded-circle mx-auto d-block" width="200" height="200" alt="character">
            </div>
            <div class="col-md-6">
              <h1 class="display-4 mb-3 mt-5 fw-bold">${user.username}</h1>
              <h4 class="text-bicolor">${user.friends} Friends</h4>
            </div>
          </div>
        </div>

        <!--Your friends-->

        <div class="accordion" id="accordionPanelsFriends">
          <div class="accordion-item mt-4 mb-4">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed bg-bicolor" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                <ui-icon class="fs-5 me-2 flex-shrink-0 flex-grow-0" name="friends"></ui-icon>
                Your friends
              </button>
            </h2>
            <div id="panelsStayOpen-collapseOne" class="accordion-collapse collapse">
              <div class="accordion-body">
                <strong>No friend yet</strong>
              </div>
            </div>
          </div>
        </div>
    
        <!--ADD FRIEND-->

        <div class="container">
          <div class="row justify-content-end">
            <div class="col-md-6">
              <form class="profile-form">
                <div class="form-group">
                  <div class="input-group">
                  <div class="input-group-prepend">
                      <span class="input-group-text">Add a friend</span>
                  </div>
                  <input type="text" id="friend-name" class="form-control" required>
                </div>
                </div>
                <div id="success-notification-friend" class="alert alert-success mt-3" style="display: none;">
                  <strong>Success !</strong> Invitation successful !
                </div>
                <div id="general-error-friend" class="alert alert-danger mt-3" style="display: none;"></div>
                <div class="form-actions ms-5 ps-4">
                    <button type="button" class="btn btn-outline-light cancel-button">Cancel</button>
                    <button type="submit" class="btn btn-outline-light save-button">Send Invite</button>
                </div>
              </form>
            </div>
            <div class="col-md-6">
              <button type="button" class="btn btn-outline-light">Manage Friend List</button>
            </div>
          </div>
        </div>

        <!--Online-->

        <div class="row mt-4 no-wrap">
          <div class="col-md-6 text-white">
            <h2>
              Online
              <ui-icon class="fs-5 me-2 flex-shrink-0 flex-grow-0" name="person"></ui-icon>
            </h2>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mt-3 mb-3 ms-5 text-secondary">
            Nobody
          </div>
        </div>

        <!--Offline-->

        <div class="row mt-4 no-wrap">
          <div class="col-md-6 text-white">
            <h2>
              Offline
              <ui-icon class="fs-5 me-2 flex-shrink-0 flex-grow-0" name="person"></ui-icon>
            </h2>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mt-3 mb-3 ms-5 text-secondary">
            Nobody
          </div>
        </div>

      </default-layout-main>
    `;

    this.querySelector('.profile-form').addEventListener('submit', this.handleFormSubmit.bind(this));
    this.generalErrorFriend = document.getElementById('general-error-friend');
  }

  async handleFormSubmit(event) {
    event.preventDefault();

    this.generalErrorFriend.style.display = 'none';
    const successNotificationFriend = document.getElementById('success-notification-friend');
    if (successNotificationFriend) successNotificationFriend.style.display = 'none';

    const friendName = this.querySelector('#friend-name').value;
    console.log('friend-->', friendName);

    try {
      const response = await fetch('http://127.0.0.1:8003/send_invitation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username: friendName, user_id: user.id }),
      });
      const data = await response.json();
      console.log('data:', data);

      // Traiter la réponse du serveur
      if (!data.status || data.status !== 'success') {
        // Afficher une erreur spécifique si disponible, sinon un message générique
        const errorMessage = data.message || 'An error occurred while sending the invitation.';
        console.error('Error:', errorMessage);
        this.generalErrorFriend.textContent = errorMessage;
        this.generalErrorFriend.style.display = 'block';
      } else {
        // Afficher une notification de succès
        console.log('Invitation sent successfully.');
        if (successNotificationFriend) successNotificationFriend.style.display = 'block';
      }
    } catch (error) {
      console.error('Error:', error);
      this.generalErrorFriend.textContent = 'An error occurred: ' + error.message;
      this.generalErrorFriend.style.display = 'block';
    }
  }
}

customElements.define('view-friend', ViewFriend);
