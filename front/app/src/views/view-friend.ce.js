import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { redirectTo } from '@/router.js';
import { user, isAuthenticated } from '@/auth.js';

class ViewFriend extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <default-layout-sidebar></default-layout-sidebar>
      <default-layout-main>
        <h1 class="display-5 fw-bold mb-4 text-center" style="margin-top: -50px;">
          Friends
        </h1>

        <!--avatar-->

        <div class="container">
          <div class="row">
            <div class="col-md-3 ms-md-auto">
                <img src="https://pbs.twimg.com/media/E3-FSn5XwAMwOYR.jpg" class="img-thumbnail rounded-circle mx-auto d-block" width="200" height="200" alt="character">
            </div>
            <div class="col-md-6">
              <h1 class="display-4 mb-3 mt-5 fw-bold">${user.username}</h1>
              <h4 class="text-bicolor">0 Friends</h4>
            </div>
          </div>
        </div>

        <!--Your friends-->

        <div class="accordion" id="accordionPanelsFriends">
          <div class="accordion-item mt-4 mb-4">
            <!-- style="background-color: linear-gradient(to right, #b558f6, #0ea3d2) !important" -->
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
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
                    <label for="friend-name">Add a friend</label>
                    <input type="text" id="friend-name" value="" required>
                </div>
                <div id="success-notification-friend" class="alert alert-success mt-3" style="display: none;">
                  <strong>Success !</strong> Invitation successful !
                </div>
                <div id="general-error-friend" class="alert alert-danger mt-3" style="display: none;"></div>
                <div class="form-actions">
                    <button type="button" class="cancel-button">Cancel</button>
                    <button type="submit" class="save-button">Send Invite</button>
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
          <div class="col-md-6 mt-3 mb-3 ml-3 text-secondary" style="margin-left: 40px">
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
          <div class="col-md-6 mt-3 mb-3 ml-3 text-secondary" style="margin-left: 40px">
            Nobody
          </div>
        </div>

      </default-layout-main>
    `;

    this.querySelector('.profile-form').addEventListener('submit', this.handleFormSubmit.bind(this));
    this.generalErrorFriend = document.getElementById('general-error-friend');
  }

  handleFormSubmit(event) {
    event.preventDefault();

    this.generalErrorFriend.style.display = 'none';
    const successNotificationFriend = document.getElementById('success-notification-friend');
    if (successNotificationFriend) successNotificationFriend.style.display = 'none';

    const friendName = this.querySelector('#friend-name').value;
    console.log('friend-->', friendName);

    fetch('http://127.0.0.1:8003/home/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username: friendName }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('data:', data);
        // Traiter la réponse du serveur
        // if (!data.success){
        if (data.username) {
          console.log('salut');
          this.generalErrorFriend.textContent = data.username[0];
          this.generalErrorFriend.style.display = 'block';
        } else {
          console.log('salut123');
          const successNotificationFriend = document.getElementById('success-notification-friend');
          if (successNotificationFriend) successNotificationFriend.style.display = 'block';
        }
      })
      .catch(error => {
        console.error('Errorrrrrr:', error);
        // return JSON.parse(text);
        this.generalErrorFriend.textContent = 'An error occurred: ' + error.message;
        this.generalErrorFriend.style.display = 'block';
        // Gérer les erreurs de la requête
      });
  }
}

customElements.define('view-friend', ViewFriend);
