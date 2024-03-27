import { user } from '@/auth.js';
import { notify } from "@/notifications.js";

const initWebSocket = () => {
const websocket = new WebSocket(`ws://127.0.0.1:8003/ws/invitations/${user.id}/`);

  websocket.onopen = function (event) {
    console.log('WebSocket connection established:', event);
  };

  websocket.onmessage = function (event) {
    console.log('WebSocket message received:', event);
    const data = JSON.parse(event.data);
    // alert(data.message);
    console.log("onmessage", data);
    notify(data.message);
  };

  websocket.onerror = function (event) {
    console.error('WebSocket error observed:', event);
  };

  websocket.onclose = function (event) {
    console.log('WebSocket connection closed:', event.code, event.reason);
  };
}

export { initWebSocket };