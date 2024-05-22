import { user } from '@/auth.js';
import { notify } from '@/notifications.js';
import { WS_BASE_URL } from '@/constants.js';

let websocketInstance = null;

//////////////////////////////////////////////////////////////////////////////////////////
// LAISSEZ LES COMMENTAIRE CE CODE DOIT ETRE PRESENTS SUR CERTAINS NAVIGATEUR A TEST......
// si les notif buf decommentais le code.
/////////////////////////////////////////////////////////////////////////////////////////

const initWebSocket = () => {
  if (!user.id) {
    console.error('WebSocket initialization failed: User ID is required.');
    return;
  }

  if (websocketInstance === null || websocketInstance.readyState === WebSocket.CLOSED) {
    websocketInstance = new WebSocket(`${WS_BASE_URL}:8003/ws/invitations/${user.id}/`);

    websocketInstance.onopen = function (event) {};

    websocketInstance.onmessage = function (event) {
      const data = JSON.parse(event.data);

      // Assurer que data.id existe et est défini avant de continuer
      if (data && data.id !== undefined) {
        if (data.message) {
          notify(data.message); // Afficher la notification
        }
      }
    };

    websocketInstance.onerror = function (event) {
      console.error('WebSocket error observed:', event);
    };

    websocketInstance.onclose = function (event) {
      websocketInstance = null; // Resets for potential re-initialization
    };
  }
};

export { initWebSocket };
