import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { user } from '@/auth.js';
// import { initWebSocket } from '@/friends.js';

const BASE_URL = import.meta.env.BASE_URL;

class ViewFriend extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <default-layout-sidebar></default-layout-sidebar>
    <default-layout-main>
      <h1 class="display-5 fw-bold mb-4 text-center mt-md-n5 mt-0">Friends</h1> 
    
      <!-- Nav tabs -->
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link active" href="#myfriends" data-bs-toggle="tab">My friends</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#invitations" data-bs-toggle="tab">Invitations received</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#addfriends" data-bs-toggle="tab">Add friends</a>
        </li>
      </ul>
    
      <!-- Tab panes -->
      <div class="tab-content">
          <div class="tab-pane container active" id="myfriends">
            <section>
              <h2>Online</h2>
              <ul id="online-friends" class="list-group">
                <!-- Online friends will be dynamically added here -->
              </ul>
            </section>
            <section>
              <h2>Offline</h2>
              <ul id="offline-friends" class="list-group">
                <!-- Offline friends will be dynamically added here -->
              </ul>
            </section>
        </div>

        <div class="tab-pane container fade" id="invitations">
          <div class="mt-4">
            <h2>Friend Requests</h2>
            <ul id="friend-requests" class="list-group">
              <!-- Friend requests will be dynamically added here -->
            </ul>
          </div>
          <!-- Invitations will be dynamically added here -->
        </div>
        
        <div class="tab-pane container fade" id="addfriends">
          <form class="input-group mb-3 mt-3">
            <input type="text" class="form-control" placeholder="Type a username" id="search-friend-name" required>
            <button class="btn btn-outline-secondary" type="button" id="search">Search</button>
          </form>
          <div class="list-group" id="search-results">
            <!-- Search results will be dynamically added here -->
          </div>
          <div id="error-messages"></div>
        </div>
      </div>
    </default-layout-main>
    `;

    this.loadFriendRequests();
    this.loadOnlineFriends();
    this.loadOfflineFriends();
    this.querySelector('#search').addEventListener('click', this.searchFriends.bind(this));
  }

  // list request friends
  async loadFriendRequests() {
    try {
      const response = await fetch(`http://127.0.0.1:8003/list_received_invitations/${user.id}/`);
      const responseData = await response.json();
  
      const friendRequestsList = document.getElementById('friend-requests');
      friendRequestsList.innerHTML = '';
  
      if (responseData && responseData.invitations) {
        if (responseData.invitations.length > 0) {
          responseData.invitations.forEach(invitation => {
            const listItem = document.createElement('li');
            listItem.id = `invitation-${invitation.invitation_id}`;
            listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
  
            // Create a container for the avatar, username, and email
            const userInfoDiv = document.createElement('div');
            userInfoDiv.style.display = 'flex';
            userInfoDiv.style.alignItems = 'center';
  
            // Add the avatar
            const avatarImg = document.createElement('img');
            if (!invitation.from_user_avatar)
              avatarImg.src = 'assets/img/default-profile.jpg';
            else
              avatarImg.src = invitation.from_user_avatar;
            avatarImg.alt = 'User Avatar';
            avatarImg.style.width = '40px'; // Set the size as needed
            avatarImg.style.height = '40px';
            avatarImg.style.borderRadius = '50%'; // Make it round
            avatarImg.style.marginRight = '50px';
            userInfoDiv.appendChild(avatarImg);
  
            // Add the username
            const usernameSpan = document.createElement('span');
            usernameSpan.textContent = invitation.from_user_username;
            usernameSpan.style.marginRight = '50px';
            userInfoDiv.appendChild(usernameSpan);
  
            // Add the email
            const emailSpan = document.createElement('span');
            emailSpan.textContent = invitation.from_user_email;
            userInfoDiv.appendChild(emailSpan);
  
            // Create the buttons for accept and reject
            const buttonGroup = document.createElement('div');
            buttonGroup.classList.add('btn-group');
  
            const acceptButton = document.createElement('button');
            acceptButton.textContent = 'Accept';
            acceptButton.classList.add('btn', 'btn-success', 'mx-1');
            acceptButton.onclick = () => this.acceptFriendRequest(invitation.invitation_id);
  
            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';
            rejectButton.classList.add('btn', 'btn-danger', 'mx-1');
            rejectButton.onclick = () => this.rejectFriendRequest(invitation.invitation_id);
  
            buttonGroup.appendChild(acceptButton);
            buttonGroup.appendChild(rejectButton);
  
            // Append everything to the list item
            listItem.appendChild(userInfoDiv);
            listItem.appendChild(buttonGroup);
  
            friendRequestsList.appendChild(listItem);
          });
        } else {
          const noInvitationsItem = document.createElement('li');
          noInvitationsItem.classList.add('list-group-item');
          noInvitationsItem.textContent = "No friend requests.";
          friendRequestsList.appendChild(noInvitationsItem);
        }
      } else {
        console.error('Invalid response format:', responseData);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  }
  

  // btn accept
  async acceptFriendRequest(invitationId){
    console.log("accept", invitationId);

    try {
      const response = await fetch('http://127.0.0.1:8003/accept_invitation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({invitation_id: invitationId }),
      });
      const data = await response.json();
      console.log('data:', data);
      
      if (data.status === 'success') {
        document.querySelector(`#invitation-${invitationId}`).remove();
        console.log("okkkk");
        this.loadOfflineFriends();
        this.loadOnlineFriends();
      } else {
        console.log("Nullll");
      }
  
    } catch (error) {
      console.error('Error:', error);
      console.log("Failed to send friend request: " + error.message);
    }
  }

  // btn reject
  async rejectFriendRequest(invitationId){
    console.log("Reject", invitationId);

    try {
      const response = await fetch('http://127.0.0.1:8003/reject_invitation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({invitation_id: invitationId }),
      });
      const data = await response.json();
      console.log('data:', data);
      
      if (data.status === 'success') {
        document.querySelector(`#invitation-${invitationId}`).remove();
        console.log("okkkk bien delte");
        this.loadOfflineFriends();
        this.loadOnlineFriends();
      } else {
        console.log("Nullll");
      }
  
    } catch (error) {
      console.error('Error:', error);
      console.log("Failed to send friend request: " + error.message);
    }

  }

  async searchFriends() {
    const searchInputField = this.querySelector('#search-friend-name');
    const searchInput = searchInputField.value.trim();
    
    if (searchInput === '') {
      console.log("The field is empty");
      const searchResultsList = this.querySelector('#search-results');
      searchResultsList.innerHTML = '<li class="list-group-item">Please enter a search username.</li>';
      return;
    }
  
    const searchResultsList = this.querySelector('#search-results');
    searchResultsList.innerHTML = '';
    
    try {
      const response = await fetch(`http://127.0.0.1:8003/search_users/?query=${encodeURIComponent(searchInput)}&user_id=${encodeURIComponent(user.id)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const searchResults = await response.json();
      console.log("searchResults", searchResults);
  
      if (searchResults.length === 0) {
        const noResultsItem = document.createElement('li');
        noResultsItem.classList.add('list-group-item');
        noResultsItem.textContent = "No users found.";
        searchResultsList.appendChild(noResultsItem);
      } else {
        searchResults.forEach(user => {
          const listItem = document.createElement('li');
          listItem.classList.add('list-group-item');
          listItem.style.display = 'flex';
          listItem.style.justifyContent = 'space-between';
          listItem.style.alignItems = 'center';
          
          
          // Create a container for the avatar and username
          const userInfoDiv = document.createElement('div');
          userInfoDiv.style.display = 'flex';
          userInfoDiv.style.alignItems = 'center';
          
          // Add the user's avatar
          const avatarImg = document.createElement('img');
          if (!user.avatar_url)
            avatarImg.src = 'assets/img/default-profile.jpg';
          else
            avatarImg.src = user.avatar_url;
          avatarImg.alt = 'User Avatar';
          avatarImg.style.width = '40px'; // Set the size as needed
          avatarImg.style.height = '40px';
          avatarImg.style.borderRadius = '50%'; // Make it round
          avatarImg.style.marginRight = '50px';
          userInfoDiv.appendChild(avatarImg);
  
          // Add the user's username
          const textSpan = document.createElement('span');
          textSpan.textContent = user.username;
          textSpan.style.marginRight = '50px';
          userInfoDiv.appendChild(textSpan);
          
          // Add the user's email
          const emailSpan = document.createElement('span');
          emailSpan.textContent = user.email;
          // emailSpan.style.marginRight = '150px';
          userInfoDiv.appendChild(emailSpan);
  
          // Create the friend request button
          const friendRequestButton = document.createElement('button');
          friendRequestButton.textContent = 'Send Friend Request';
          friendRequestButton.classList.add('btn', 'btn-primary');
          friendRequestButton.onclick = () => this.sendFriendRequest(user.username, friendRequestButton);
  
          // Append everything to the listItem
          listItem.appendChild(userInfoDiv);
          listItem.appendChild(friendRequestButton);
          searchResultsList.appendChild(listItem);
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }
  
  
  //Send Invitation user
  async sendFriendRequest(username, button) {
    console.log("Sending friend request to", username);
  
    try {
      const response = await fetch('http://127.0.0.1:8003/send_invitation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username: username, user_id: user.id }),
      });
      const data = await response.json();
      console.log('data:', data);
      
      if (data.status === 'success') {
        button.textContent = 'Friend Request Sent';
        button.classList.remove('btn-primary');
        button.classList.add('btn-success');
        button.disabled = true; 
      } else {
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('alert', 'alert-danger');
        errorMessage.textContent = "Failed to send friend request: " + (data.message || "Unknown error");
        document.querySelector('#error-messages').appendChild(errorMessage);
      }
  
    } catch (error) {
      console.error('Error:', error);
      alert("Failed to send friend request: " + error.message);
    }
  }

async loadOnlineFriends() {
  try {
    const response = await fetch(`http://127.0.0.1:8003/online_friends/${user.id}/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { online_friends } = await response.json();

    const onlineFriendsList = this.querySelector('#online-friends');
    onlineFriendsList.innerHTML = '';

    if (online_friends.length > 0) {
      online_friends.forEach(friend => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'align-items-center', 'justify-content-between');

        // Avatar
        const avatarImg = document.createElement('img');
        if (!friend.avatar_url)
          avatarImg.src = 'assets/img/default-profile.jpg';
        else
          avatarImg.src = friend.avatar_url;
        avatarImg.alt = 'User Avatar';
        avatarImg.style.width = '40px';  // Or the size you prefer
        avatarImg.style.height = '40px'; // Or the size you prefer
        avatarImg.style.borderRadius = '50%';
        avatarImg.style.marginRight = '50px';
        listItem.appendChild(avatarImg);

        // Username
        const usernameSpan = document.createElement('span');
        usernameSpan.textContent = friend.username;
        usernameSpan.style.marginRight = '50px';
        listItem.appendChild(usernameSpan);

        // Email
        const emailSpan = document.createElement('span');
        emailSpan.textContent = friend.email;
        listItem.appendChild(emailSpan);

        // Delete friend button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.onclick = () => this.confirmDeleteFriend(friend.friend_id);

        listItem.appendChild(deleteButton);

        onlineFriendsList.appendChild(listItem);
      });
    } else {
      const noOnlineFriends = document.createElement('li');
      noOnlineFriends.classList.add('list-group-item');
      noOnlineFriends.textContent = "No friends online.";
      onlineFriendsList.appendChild(noOnlineFriends);
    }
  } catch (error) {
    console.error('Error loading online friends:', error);
  }
}

async loadOfflineFriends() {
  try {
    const response = await fetch(`http://127.0.0.1:8003/offline_friends/${user.id}/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { offline_friends } = await response.json();
    console.log("test",offline_friends);

    const offlineFriendsList = this.querySelector('#offline-friends');
    offlineFriendsList.innerHTML = '';

    if (offline_friends.length > 0) {
      offline_friends.forEach(friend => {
        const listItem = document.createElement('li');
        // listItem.classList.add('list-group-item', 'd-flex', 'align-items-center', 'justify-content-start');
        listItem.classList.add('list-group-item', 'd-flex', 'align-items-center', 'justify-content-between');

        // Avatar
        const avatarImg = document.createElement('img');
        if (!friend.avatar_url)
          avatarImg.src = 'assets/img/default-profile.jpg';
        else
          avatarImg.src = friend.avatar_url;
        avatarImg.alt = 'User Avatar';
        avatarImg.style.width = '40px';
        avatarImg.style.height = '40px';
        avatarImg.style.borderRadius = '50%';
        avatarImg.style.marginRight = '50px';
        listItem.appendChild(avatarImg);

        // Username
        const usernameSpan = document.createElement('span');
        usernameSpan.textContent = friend.username;
        usernameSpan.style.marginRight = '50px';
        listItem.appendChild(usernameSpan);

        // Email
        const emailSpan = document.createElement('span');
        emailSpan.textContent = friend.email;
        listItem.appendChild(emailSpan);

        // Delete friend button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.onclick = () => this.confirmDeleteFriend(friend.friend_id);

        listItem.appendChild(deleteButton);
        offlineFriendsList.appendChild(listItem);
      });
    } else {
      const noOfflineFriends = document.createElement('li');
      noOfflineFriends.classList.add('list-group-item');
      noOfflineFriends.textContent = "No friends offline.";
      offlineFriendsList.appendChild(noOfflineFriends);
    }
  } catch (error) {
    console.error('Error loading offline friends:', error);
  }
}

// Function to confirm deletion and send delete request
async confirmDeleteFriend(friendId) {

  try {
    const data = { friend_id: friendId, user_id: user.id};
    
    const response = await fetch('http://127.0.0.1:8003/remove_friend/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log("Ami supprimé avec succès.");
      this.loadOfflineFriends();
      this.loadOnlineFriends();
    } else {
      throw new Error('Une erreur est survenue lors de la suppression de l\'ami.');
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'ami:", error);
  }
}

}

customElements.define('view-friend', ViewFriend);
