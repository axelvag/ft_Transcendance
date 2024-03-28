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
          <a class="nav-link" href="#invitations" data-bs-toggle="tab">Invitations</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#addfriends" data-bs-toggle="tab">Add friends</a>
        </li>
      </ul>
    
      <!-- Tab panes -->
      <div class="tab-content">
        <div class="tab-pane container active" id="myfriends">
          <!-- Friend Requests Section inside My Friends tab -->
          
          <!-- List of friends will be dynamically added here -->
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
    this.querySelector('#search').addEventListener('click', this.searchFriends.bind(this));
  }

  async loadFriendRequests() {
    try {
      const response = await fetch(`http://127.0.0.1:8003/list_received_invitations/${user.id}/`);
      const responseData = await response.json();

      if (responseData && responseData.invitations) {
        const friendRequestsList = document.getElementById('friend-requests');
            friendRequestsList.innerHTML = '';

            responseData.invitations.forEach(invitation => {
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

                const fromUserSpan = document.createElement('span');
                fromUserSpan.textContent = `From: ${invitation.from_user}, Invitation ID: ${invitation.invitation_id}`;

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

                listItem.appendChild(fromUserSpan);
                listItem.appendChild(buttonGroup);

                friendRequestsList.appendChild(listItem);
        });
      } else {
        console.error('Invalid response format:', responseData);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  }

  async acceptFriendRequest(invitationId){
    console.log("accept", invitationId);

    try {
      const response = await fetch('http://127.0.0.1:8003/accept_invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ invitation_id: invitationId }),
      });
      const data = await response.json();
      console.log('data:', data);
      
      if (data.status === 'success') {
        console.log("okkkk"); 
      } else {
        console.log("Nullll");
      }
  
    } catch (error) {
      console.error('Error:', error);
      console.log("Failed to send friend request: " + error.message);
    }
  }

  async rejectFriendRequest(invitationId){
    console.log("Reject", invitationId);
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
      const response = await fetch(`http://127.0.0.1:8003/search_users/?query=${encodeURIComponent(searchInput)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const searchResults = await response.json();
      console.log(searchResults);
  
      if (searchResults.length === 0) {
        const noResultsItem = document.createElement('li');
        noResultsItem.classList.add('list-group-item');
        noResultsItem.textContent = "No users found.";
        searchResultsList.appendChild(noResultsItem);
      } else {
        searchResults.forEach(username => {
          const listItem = document.createElement('li');
          listItem.classList.add('list-group-item');
          listItem.style.display = 'flex';
          listItem.style.justifyContent = 'space-between';
          listItem.style.alignItems = 'center';
          
          const textSpan = document.createElement('span');
          textSpan.textContent = username;
          
          const friendRequestButton = document.createElement('button');
          friendRequestButton.textContent = 'Send Friend Request';
          friendRequestButton.classList.add('btn', 'btn-primary');
          // actionButton.textContent = user.invitation_sent ? 'Invitation Sent' : 'Send Friend Request';
          // actionButton.classList.add('btn', user.invitation_sent ? 'btn-secondary' : 'btn-primary');

          // Send friend
          friendRequestButton.onclick = () => this.sendFriendRequest(username, friendRequestButton);
          // if (!user.invitation_sent) {
            // actionButton.onclick = () => this.sendFriendRequest(user.username, actionButton);
          // }

          listItem.appendChild(textSpan);
          listItem.appendChild(friendRequestButton);
          searchResultsList.appendChild(listItem);
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }
  
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
}

customElements.define('view-friend', ViewFriend);
