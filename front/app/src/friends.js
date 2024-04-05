import { user } from '@/auth.js';
import { notify } from "@/notifications.js";

// const initWebSocket = () => {
// const websocket = new WebSocket(`ws://127.0.0.1:8003/ws/invitations/${user.id}/`);

//   websocket.onopen = function (event) {
//     console.log('WebSocket connection established:', event);
//   };

//   websocket.onmessage = function (event) {
//     console.log('WebSocket message received:', event);
//     const data = JSON.parse(event.data);
//     // alert(data.message);
//     console.log("onmessage", data);
//     if (data.message)
//       notify(data.message);
//   };

//   websocket.onerror = function (event) {
//     console.error('WebSocket error observed:', event);
//   };

//   websocket.onclose = function (event) {
//     console.log('WebSocket connection closed:', event.code, event.reason);
//   };
// }


let websocketInstance = null;

const initWebSocket = () => {

  console.log("user_id", user.id);

  if (!user.id) {
    console.error('WebSocket initialization failed: User ID is required.');
    return;
  }

  if (websocketInstance === null || websocketInstance.readyState === WebSocket.CLOSED) {
    websocketInstance = new WebSocket(`ws://127.0.0.1:8003/ws/invitations/${user.id}/`);

    websocketInstance.onopen = function(event) {
      console.log('WebSocket connection established:', event);
    };

    // websocketInstance.onmessage = function(event) {
    //   console.log('WebSocket message received:', event);
    //   const data = JSON.parse(event.data);
    //   console.log("onmessage", data);
    //   notify(data.message); // Assuming `notify` is a function defined elsewhere to handle notifications
    // };

    websocketInstance.onmessage = function(event) {
      console.log('WebSocket message received:', event);
      const data = JSON.parse(event.data);
    
      // Récupérer les notifications déjà reçues du localStorage
      let receivedNotifications = localStorage.getItem('receivedNotifications');
      console.log("1 --> ", receivedNotifications);
      receivedNotifications = receivedNotifications ? JSON.parse(receivedNotifications) : [];
    
      // Vérifier si la notification a déjà été reçue
      if (!receivedNotifications.includes(data.id)) {
        console.log("onmessage", data);
        notify(data.message); // Afficher la notification
    
        // Ajouter l'ID de la notification aux notifications déjà reçues et mettre à jour le localStorage
        receivedNotifications.push(data.id);
        localStorage.setItem('receivedNotifications', JSON.stringify(receivedNotifications));
    
        // Envoyer une confirmation de réception au serveur
        websocketInstance.send(JSON.stringify({type: "notification_received", id: data.id}));
      }
    };


    websocketInstance.onerror = function(event) {
      console.error('WebSocket error observed:', event);
    };

    websocketInstance.onclose = function(event) {
      console.log('WebSocket connection closed:', event.code, event.reason);
      websocketInstance = null; // Resets for potential re-initialization
    };
  } else {
    console.log('WebSocket is already initialized and open.');
  }
};


export { initWebSocket };