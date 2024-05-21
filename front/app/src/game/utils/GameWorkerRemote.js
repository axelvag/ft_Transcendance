import { WS_BASE_URL } from '@/constants.js';

let ws = null;

function clear() {
  if (ws) {
    ws.close();
    ws = null;
  }
}

function join(gameId) {
  if (ws) {
    self.postMessage('connection_already_opened');
    return;
  }
  ws = new WebSocket(`${WS_BASE_URL}:8009/play/${gameId}`);
  ws.onmessage = handleWebsocketMessage;
  ws.onerror = () => {
    self.postMessage('error');
    clear();
  };
  ws.onopen = () => {
    self.postMessage('connection_opened');
  };
  ws.onclose = () => {
    clear();
    self.postMessage('connection_closed');
  };
}

function handleWebsocketMessage(e) {
  const data = JSON.parse(e.data);
  if (data.now) {
    const nowDiff = Date.now() - data.now;
    if (data?.state?.ball?.startTime) data.state.ball.startTime += nowDiff;
    if (data?.state?.ball?.endTime) data.state.ball.endTime += nowDiff;
  }
  self.postMessage(data);
}

function start() {
  self.postMessage('start requested');
}

function pause() {
  self.postMessage('pause requested');
}

function resume() {
  self.postMessage('resume requested');
}

function reset() {
  self.postMessage('reset requested');
}

function updatePaddleLeftMove(data = {}) {
  self.postMessage('updatePaddleLeftMove requested', data);
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(
    JSON.stringify({
      action: 'updatePaddleLeftMove',
      data,
    })
  );
}

function updatePaddleRightMove(data = {}) {
  self.postMessage('updatePaddleRightMove requested', data);
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(
    JSON.stringify({
      action: 'updatePaddleRightMove',
      data,
    })
  );
}

self.addEventListener('message', e => {
  const { type, data } = e.data || {};
  switch (type) {
    case 'join':
      join(data.gameId);
      break;
    case 'start':
      start();
      break;
    case 'pause':
      pause();
      break;
    case 'resume':
      resume();
      break;
    case 'reset':
      reset();
      break;
    case 'updatePaddleLeftMove':
      updatePaddleLeftMove(data);
      break;
    case 'updatePaddleRightMove':
      updatePaddleRightMove(data);
      break;
  }
});
