import { user } from '@/auth.js';
import { notify } from "@/notifications.js";

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
    websocketInstance = new WebSocket(`ws://127.0.0.1:8003/ws/invitations/${user.id}/`);

    websocketInstance.onopen = function (event) {
      console.log('WebSocket connection established:', event);
    };
    
    websocketInstance.onmessage = function(event) {
      console.log('WebSocket message received:', event);
      const data = JSON.parse(event.data);
  
      // Assurer que data.id existe et est défini avant de continuer
      if (data && data.id !== undefined) {
          // Récupérer les notifications déjà reçues du localStorage
          // let receivedNotifications = localStorage.getItem('receivedNotifications');
          // receivedNotifications = receivedNotifications ? JSON.parse(receivedNotifications) : [];
  
          // Convertir data.id en chaîne pour la comparaison et le stockage cohérent
          // const dataIdStr = data.id.toString();
  
          // Vérifier si la notification a déjà été reçue
          // if (!receivedNotifications.includes(dataIdStr)) {
              if (data.message) {
                  notify(data.message); // Afficher la notification
              }
  
              // Ajouter l'ID de la notification aux notifications déjà reçues et mettre à jour le localStorage
          //     receivedNotifications.push(dataIdStr);
          //     localStorage.setItem('receivedNotifications', JSON.stringify(receivedNotifications));
          // }
      } else {
          console.log('Received data is missing an id:', data);
      }
  };
  

    websocketInstance.onerror = function (event) {
      console.error('WebSocket error observed:', event);
    };

    websocketInstance.onclose = function (event) {
      console.log('WebSocket connection closed:', event.code, event.reason);
      websocketInstance = null; // Resets for potential re-initialization
    };
  } else {
    console.log('WebSocket is already initialized and open.');
  }
};


export { initWebSocket };