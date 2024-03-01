import Vec2 from './Vec2.js';
import MovableRect from './MovableRect.js';
import PausableTimeout from './PausableTimeout.js';

let width = 800;
let height = 600;
let wallThickness = 10;
let ballSize = 20;
let ballSpeedOnStart = 300;
let ballAcceleration = 1.05;
let ballSpeedMax = 500;
let paddleHeight = 100;
let paddleWidth = 20;
let paddlePadding = 30;
let paddleSpeed = 300;
let scoreMax = 5;
let startRoundDelay = 500;
let endRoundDelay = 500;

let innerWidth = width - wallThickness * 2;
let innerHeight = height - wallThickness * 2;
let paddleStartCenterX = innerWidth / 2 - paddlePadding - paddleWidth / 2;
let paddleMaxCenterY = innerHeight / 2 - paddleHeight / 2;
let ballYOnWallCollision = innerHeight / 2 - ballSize / 2;
let ballXOnPaddleCollision = paddleStartCenterX - paddleWidth / 2 - ballSize / 2;
let ballXOnScore = width / 2 + ballSize;
let hitOnPaddleMax = (paddleHeight + ballSize) / 2;
let scoreLeft = 0;
let scoreRight = 0;
let status = 'initialized';

let ball = null;
let paddleLeft = null;
let paddleRight = null;

let previousCollider = null;
let timer = null;
let ballSpeed = 0;
let ballDir = null;
let isBallMovingBeforePause = false;

init();

function getState() {
  return {
    width,
    height,
    wallThickness,
    ballSize,
    ballSpeedOnStart,
    ballAcceleration,
    ballSpeedMax,
    ballYOnWallCollision,
    ballXOnPaddleCollision,
    paddleHeight,
    paddleWidth,
    paddlePadding,
    paddleSpeed,
    paddleMaxCenterY,
    scoreMax,
    innerWidth,
    innerHeight,
    scoreLeft,
    scoreRight,
    status,
    ball,
    paddleLeft,
    paddleRight,
    startRoundDelay,
    endRoundDelay,
  };
}

function notify(type, data) {
  self.postMessage({ type, data: JSON.stringify(data) });
}

function init() {
  if (!timer) {
    timer = new PausableTimeout();
  } else {
    timer.clear();
  }

  ball = new MovableRect({
    startCenter: new Vec2(0, 0),
    width: ballSize,
    height: ballSize,
  });
  paddleLeft = new MovableRect({
    startCenter: new Vec2(-paddleStartCenterX, 0),
    height: paddleHeight,
    width: paddleWidth,
    dir: new Vec2(0, 1),
    yMin: -innerHeight / 2,
    yMax: innerHeight / 2,
  });
  paddleRight = new MovableRect({
    startCenter: new Vec2(paddleStartCenterX, 0),
    height: paddleHeight,
    width: paddleWidth,
    dir: new Vec2(0, 1),
    yMin: -innerHeight / 2,
    yMax: innerHeight / 2,
  });
  scoreLeft = 0;
  scoreRight = 0;
  ballSpeed = 0;
  ballDir = new Vec2(0, 0);
  status = 'initialized';
  previousCollider = null;

  notify('init', { state: getState() });
}

function startNewRound(playerServing) {
  status = 'running';
  ball.startCenter = new Vec2(0, 0);
  ball.endCenter.copy(ball.startCenter);
  ball.startTime = Date.now();
  ball.endTime = ball.startTime;
  notify('update', {
    event: 'newRound',
    state: {
      status: status,
      ball: ball,
    },
  });

  timer.set(() => {
    const xDir = playerServing === 'left' ? 1 : -1;
    const yDir = Math.random() * 2 - 1;

    ball.startTime = Date.now();
    ball.endTime = ball.startTime;
    ballDir = Vec2.create(xDir, yDir).normalize();
    ballSpeed = ballSpeedOnStart;
    calculateNextCollision();
    notify('update', { state: { ball: ball } });

    previousCollider = null;
  }, startRoundDelay);
}

function calculateNextCollision() {
  if (status !== 'running') return;

  if (ballSpeed === 0 || (ballDir.x === 0 && ballDir.y === 0)) return;

  let nextCollision = {
    side: null,
    type: null,
    duration: Infinity,
    normal: null,
    ballOnHit: null,
  };

  // top / bottom
  if (ballDir.y !== 0) {
    const side = ballDir.y > 0 ? 'top' : 'bottom';
    const hitYSign = ballDir.y > 0 ? 1 : -1;
    const ballYOnHit = ballYOnWallCollision * hitYSign;
    const duration = ((ballYOnHit - ball.startCenter.y) / (ballSpeed * ballDir.y)) * 1000;
    if (duration > 0 && duration < nextCollision.duration) {
      nextCollision = {
        side,
        type: 'wall',
        duration,
        normal: new Vec2(0, -hitYSign),
        ballOnHit: new Vec2(ball.startCenter.x + (ballDir.x * ballSpeed * duration) / 1000, ballYOnHit),
      };
    }
  }

  // left / right
  if (ballDir.x !== 0) {
    const side = ballDir.x > 0 ? 'right' : 'left';
    const hitXSign = ballDir.x > 0 ? 1 : -1;

    // paddle
    if (previousCollider !== side + 'paddle') {
      const ballXOnHit = ballXOnPaddleCollision * hitXSign;
      const duration = ((ballXOnHit - ball.startCenter.x) / (ballSpeed * ballDir.x)) * 1000;
      if (duration > 0 && duration < nextCollision.duration) {
        nextCollision = {
          side,
          type: 'paddle',
          duration,
          normal: new Vec2(-hitXSign, 0),
          ballOnHit: new Vec2(ballXOnHit, ball.startCenter.y + (ballDir.y * ballSpeed * duration) / 1000),
        };
      }
    }

    // score
    if (ballXOnPaddleCollision - Math.abs(ball.startCenter.x < 1)) {
      const ballXOnHit = ballXOnScore * hitXSign;
      const duration = ((ballXOnHit - ball.startCenter.x) / (ballSpeed * ballDir.x)) * 1000;
      if (duration > 0 && duration < nextCollision.duration) {
        nextCollision = {
          side,
          type: 'score',
          duration,
          normal: new Vec2(-hitXSign, 0),
          ballOnHit: new Vec2(ballXOnHit, ball.startCenter.y + (ballDir.y * ballSpeed * duration) / 1000),
        };
      }
    }
  }

  if (!isFinite(nextCollision.duration)) return;
  if (status !== 'running') return;

  ball.endCenter = nextCollision.ballOnHit;
  ball.endTime = Date.now() + nextCollision.duration;

  timer.set(() => {
    onBallCollision(nextCollision);
  }, nextCollision.duration);
}

function onBallCollision(collision) {
  previousCollider = collision?.side + collision?.type || null;
  ball.startTime = ball.endTime;

  // wall
  if (collision.type === 'wall') {
    ball.startCenter.copy(ball.endCenter);
    ballDir.reflect(collision.normal);
    calculateNextCollision();
    notify('update', {
      event: 'collision',
      state: { ball: ball },
    });
  }

  // paddle
  else if (collision.type === 'paddle') {
    ball.startCenter.copy(ball.endCenter);
    const paddleCenter =
      collision.side === 'left' ? paddleLeft.center(collision.time) : paddleRight.center(collision.time);
    const hitOnPaddle = ball.startCenter.y - paddleCenter.y;
    if (Math.abs(hitOnPaddle) <= hitOnPaddleMax) {
      ballDir.reflect(collision.normal);
      ballSpeed = Math.min(ballAcceleration * ballSpeed, ballSpeedMax);

      if (collision.side === 'left') {
        // alter ball direction based on paddle hit position
        const factor = hitOnPaddle / hitOnPaddleMax;
        ballDir.rotate((factor * Math.PI) / 8);

        // clamp ball direction
        const angle = ballDir.angle();
        if (angle > Math.PI / 4) {
          ballDir = Vec2.create(1, 0).rotate(Math.PI / 4);
        } else if (angle < -Math.PI / 4) {
          ballDir = Vec2.create(1, 0).rotate(-Math.PI / 4);
        }
      } else {
        // alter ball direction based on paddle hit position
        const factor = hitOnPaddle / hitOnPaddleMax;
        ballDir.rotate((-factor * Math.PI) / 8);

        // clamp ball direction
        let angle = ballDir.angle();
        if (angle > 0 && angle < (3 * Math.PI) / 4) {
          ballDir = Vec2.create(-1, 1).normalize();
        } else if (angle < 0 && angle > (-3 * Math.PI) / 4) {
          ballDir = Vec2.create(-1, -1).normalize();
        }
      }
      calculateNextCollision();
      notify('update', {
        event: 'collision',
        state: { ball: ball },
      });
    } else {
      calculateNextCollision();
      notify('update', {
        state: { ball: ball },
      });
    }
  }

  // score
  else if (collision.type === 'score') {
    let isMaxScoreReached;
    ball.stop();

    // update score
    if (collision.side === 'left') {
      scoreRight += 1;
      isMaxScoreReached = scoreRight >= scoreMax;
    } else {
      scoreLeft += 1;
      isMaxScoreReached = scoreLeft >= scoreMax;
    }

    // if max score reached, finish game
    if (isMaxScoreReached) {
      status = 'finished';
    }
    // else, start new round
    else {
      const playerServing = collision.side;
      timer.set(() => {
        startNewRound(playerServing);
      }, endRoundDelay);
    }

    // send update
    notify('update', {
      event: isMaxScoreReached ? 'victory' : 'score',
      state: {
        ball: ball,
        scoreLeft: scoreLeft,
        scoreRight: scoreRight,
        status: status,
      },
    });
  }
}

function start() {
  if (status !== 'initialized') {
    notify('update', { state: { status: status } });
    return;
  }
  startNewRound('left');
}

function pause() {
  if (status !== 'running') return;

  isBallMovingBeforePause = ball.startCenter.x === ball.endCenter.x;
  if (isBallMovingBeforePause) {
    timer.pause();
  } else {
    timer.clear();

    ball.stop();
    paddleLeft.stop();
    paddleRight.stop();
  }

  status = 'paused';
  notify('update', {
    state: {
      ball: ball,
      paddleLeft: paddleLeft,
      paddleRight: paddleRight,
      status: status,
    },
  });
}

function resume() {
  if (status !== 'paused') return;
  status = 'running';

  if (isBallMovingBeforePause) {
    timer.resume();
  } else {
    ball.startTime = Date.now();
    calculateNextCollision();
  }
  notify('update', {
    state: {
      ball: ball,
      status: status,
    },
  });
}

function reset() {
  init();
}

function updatePaddleLeftMove(data = {}) {
  if (status !== 'running') return;

  if (data.hasOwnProperty('dir')) {
    const dir = data.dir;

    // check if paddle is already moving in the same direction
    let currentDir = 0;
    if (paddleLeft.endCenter.y > paddleLeft.startCenter.y) currentDir = 1;
    else if (paddleLeft.endCenter.y < paddleLeft.startCenter.y) currentDir = -1;
    if (dir === currentDir) return;

    // update the move
    paddleLeft.stop();
    if (dir !== 0) {
      paddleLeft.endCenter.y = paddleMaxCenterY * dir;
      paddleLeft.endTime =
        paddleLeft.startTime + (Math.abs(paddleLeft.endCenter.y - paddleLeft.startCenter.y) / paddleSpeed) * 1000;
    }
  } else if (data.hasOwnProperty('targetY')) {
    const targetY = data.targetY;

    paddleLeft.stop();
    const currentY = paddleLeft.center().y;
    paddleLeft.endCenter.y = targetY;
    if (targetY > currentY + paddleHeight / 4) {
      paddleLeft.endTime = paddleLeft.startTime + ((targetY - currentY) / paddleSpeed) * 1000;
    } else if (targetY < currentY - paddleHeight / 4) {
      paddleLeft.endTime = paddleLeft.startTime + ((currentY - targetY) / paddleSpeed) * 1000;
    }
  }
  notify('update', { state: { paddleLeft: paddleLeft } });
}

function updatePaddleRightMove(data = {}) {
  if (status !== 'running') return;

  if (data.hasOwnProperty('dir')) {
    const dir = data.dir;

    // check if paddle is already moving in the same direction
    let currentDir = 0;
    if (paddleRight.endCenter.y > paddleRight.startCenter.y) currentDir = 1;
    else if (paddleRight.endCenter.y < paddleRight.startCenter.y) currentDir = -1;
    if (dir === currentDir) return;

    // update the move
    paddleRight.stop();
    if (dir !== 0) {
      paddleRight.endCenter.y = paddleMaxCenterY * dir;
      paddleRight.endTime =
        paddleRight.startTime + (Math.abs(paddleRight.endCenter.y - paddleRight.startCenter.y) / paddleSpeed) * 1000;
    }
  } else if (data.hasOwnProperty('targetY')) {
    const targetY = data.targetY;

    const currentY = paddleRight.center().y;
    paddleRight.stop();
    if (targetY > currentY + paddleHeight / 4) {
      paddleRight.endCenter.y = targetY;
      paddleRight.endTime = paddleRight.startTime + ((targetY - currentY) / paddleSpeed) * 1000;
    } else if (targetY < currentY - paddleHeight / 4) {
      paddleRight.endCenter.y = targetY;
      paddleRight.endTime = paddleRight.startTime + ((currentY - targetY) / paddleSpeed) * 1000;
    }
  }
  notify('update', { state: { paddleRight: paddleRight } });
}

self.addEventListener('message', e => {
  const { type, data } = e.data || {};
  switch (type) {
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
