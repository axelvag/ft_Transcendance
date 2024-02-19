import '@/components/layouts/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout-main.ce.js';

class ViewFriend extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <default-layout-sidebar></default-layout-sidebar>
      <default-layout-main>
        <form class="profile-form">
          <div class="form-group">
              <label for="friend-name">Choose friend</label>
              <input type="text" id="friend-name" value="" required>
          </div>
          <div id="success-notification-friend" class="alert alert-success mt-3" style="display: none;">
            <strong>Success !</strong> Invitation successful !
          </div>
          <div id="general-error-friend" class="alert alert-danger mt-3" style="display: none;"></div>
          <div class="form-actions">
              <button type="button" class="cancel-button">Cancel</button>
              <button type="submit" class="save-button">Send Friend</button>
          </div>
        </form>
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
      if (data.username){
        console.log("salut");
        this.generalErrorFriend.textContent = data.username[0];
        this.generalErrorFriend.style.display = 'block';
      }
      else{
        console.log("salut123");
        const successNotificationFriend = document.getElementById('success-notification-friend');
      if (successNotificationFriend) successNotificationFriend.style.display = 'block';
      }
    })
    .catch((error) => {
      console.error('Errorrrrrr:', error);
      // return JSON.parse(text);
      this.generalErrorFriend.textContent = 'An error occurred: ' + error.message;
      this.generalErrorFriend.style.display = 'block';
      // Gérer les erreurs de la requête
    });
  }
}

customElements.define('view-friend', ViewFriend);