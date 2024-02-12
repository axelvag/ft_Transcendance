// const template = `
//     <div class="layout">
//         <view-sidebar></view-sidebar>
//         <main>
//             <h1>Friends</h1>
//             <p>Welcome to your profile page. Here you can view and edit your profile information.</p>
//         </main>
//     </div>
// `;

// export default template;

import './view-sidebar.ce.js';

class ViewFriend extends HTMLElement {

  connectedCallback() {
    this.innerHTML = `
      <div class="layout">
        <view-sidebar class="layout-sidebar"></view-sidebar>
        <div class="layout-main">
          <main class="profile-container">
              <div class="profile-card">
                  <form class="profile-form">
                      <div class="form-group">
                          <label for="friend-name">Choose friend</label>
                          <input type="text" id="friend-name" value="" required>
                      </div>
                      <div class="form-actions">
                          <button type="button" class="cancel-button">Cancel</button>
                          <button type="submit" class="save-button">Send Friend</button>
                      </div>
                  </form>
              </div>
          </main>
        </div>
      </div>
    `;

    this.querySelector('.profile-form').addEventListener('submit', this.handleFormSubmit.bind(this));
  }

  handleFormSubmit(event) {
    event.preventDefault();

    const friendName = this.querySelector('#friend-name').value;
    console.log("friend", friendName);

    fetch('http://127.0.0.1:8000/home/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ friendName }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      // Traiter la réponse du serveur
    })
    .catch((error) => {
      console.error('Error:', error);
      // Gérer les erreurs de la requête
    });
  }
}

customElements.define('view-friend', ViewFriend);
