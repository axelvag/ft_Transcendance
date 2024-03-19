import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { user } from '@/auth.js';

class ViewFriend extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <default-layout-sidebar></default-layout-sidebar>
      <default-layout-main>
        <h1 class="display-5 fw-bold mb-4 text-center mt-md-n5 mt-0">
          Friends
        </h1>

        <!--avatar-->
        <div id="notification-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;"></div> <!-- Ajouté pour les notifications -->
        <div id="friends-list">Vous êtes amis avec :</div>


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

    this.checkForNotifications();
    this.startNotificationPolling();
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
            body: JSON.stringify({ username: friendName, user_id: user.id}),
        });
        const data = await response.json();
        console.log('data:', data);
        
        // Traiter la réponse du serveur
        if (!data.status || data.status !== 'success') {
            // Afficher une erreur spécifique si disponible, sinon un message générique
            const errorMessage = data.message || "An error occurred while sending the invitation.";
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


  // Ajoutez cette nouvelle méthode pour démarrer le polling
  startNotificationPolling() {
    this.pollingInterval = setInterval(() => this.checkForNotifications(), 5000); // Poll toutes les 5 secondes
  }
  
  // Méthode pour interroger les notifications
  checkForNotifications() {
    console.log("test");
    fetch('http://127.0.0.1:8003/notifications/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({user_id: user.id }),
    })
      .then(response => response.json())
      .then(data => {
        console.log("datanotification", data);
        // console.log("notif", data.notification);
        // console.log("data.notification.invitation_id", data.notification.invitation_id);
        if (data.notifications && data.notifications.length > 0) {
          // console.log("lariate", notification);
          // Affichez les notifications ici
          // Par exemple, si vous avez une méthode pour afficher des notifications, vous pouvez l'appeler ici
          data.notifications.forEach(notification => this.displayNotification(notification));
        }
      })
      .catch(error => console.error('Erreur lors de la vérification des notifications:', error));
  }

  displayNotification(notification) {

    console.log("notif", notification);
    console.log("data.notification.invitation_id", notification.invitation_id);

    const notificationContainer = document.getElementById('notification-container');
    const notificationDiv = document.createElement('div');
    notificationDiv.innerHTML = `
      <div style="background: white; padding: 20px; margin-bottom: 10px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,.2);">
        <p>${notification.message}</p>
        <button id="accept-btn" style="margin-right: 10px;">Accepter</button>
        <button id="decline-btn">Décliner</button>
      </div>
    `;

    const acceptBtn = notificationDiv.querySelector('#accept-btn');
    const declineBtn = notificationDiv.querySelector('#decline-btn');

    acceptBtn.addEventListener('click', async function() {
      // Logique d'acceptation ici
      const invitationId = notification.invitation_id;
      const userId = user.id; // Assurez-vous que 'user.id' est accessible dans ce contexte
    
      try {
        const acceptResponse = await fetch('http://127.0.0.1:8003/accept_invitation/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Assurez-vous d'inclure le CSRF token si nécessaire
          },
          body: JSON.stringify({
            invitation_id: invitationId,
            user_id: userId,
          }),
        });
    
        if (!acceptResponse.ok) {
          throw new Error('La requête a échoué');
        }
        const acceptData = await acceptResponse.json();
        console.log(acceptData);
        alert('Invitation acceptée avec succès !');
        notificationContainer.removeChild(notificationDiv);
    
        // Après avoir accepté l'invitation, récupérez la liste mise à jour des amis
        await fetchFriendsList(userId); // Appeler la fonction pour récupérer et traiter la liste des amis
    
      } catch (error) {
        console.error("Erreur lors de l'acceptation de l'invitation:", error);
        alert("Erreur lors de l'acceptation de l'invitation."); // Informez l'utilisateur de l'échec
      }
    });
    
    async function fetchFriendsList(userId) {
      try {
        const friendsResponse = await fetch('http://127.0.0.1:8003/get_friends/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId }),
        });
    
        if (!friendsResponse.ok) {
          throw new Error('Failed to fetch friends list');
        }
        const friendsData = await friendsResponse.json();
        console.log('Friends:', friendsData);
    
        // Trouvez l'élément où afficher la liste des amis
        const friendsListElement = document.getElementById('friends-list');
        // Assurez-vous de nettoyer la liste précédente avant d'afficher les nouveaux amis
        friendsListElement.innerHTML = 'Vous êtes amis avec :<br>';
    
        // Parcourez la liste des amis et ajoutez-les à l'élément
        friendsData.friends.forEach(friend => {
          friendsListElement.innerHTML += `<span>${friend.username}</span><br>`; // Utilisez des éléments appropriés selon votre mise en page
        });
    
      } catch (error) {
        console.error('Error fetching friends list:', error);
      }
    }
    
    declineBtn.addEventListener('click', function() {
      // Logique de déclin ici
      alert('Notification déclinée.');
      notificationContainer.removeChild(notificationDiv);
    });

    notificationContainer.appendChild(notificationDiv);
  }

  // Assurez-vous de nettoyer l'intervalle lorsque l'élément est déconnecté
  disconnectedCallback() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
  
}

customElements.define('view-friend', ViewFriend);
