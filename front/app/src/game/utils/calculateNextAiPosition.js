import MovableRect from './MovableRect';
import Vec2 from './Vec2';

const calculateNextAiPosition = (gameState, position, options = {}) => {
  const state = JSON.parse(JSON.stringify(gameState));

  const waitForRebound = options.waitForRebound || false;
  const goToCenterOnWait = options.goToCenterOnWait || true;
  const dirRandomness = options.dirRandomness || 0;

  try {
    const ball = new MovableRect({
      ...state.ball,
      startCenter: new Vec2(state.ball.startCenter.x, state.ball.startCenter.y),
      endCenter: new Vec2(state.ball.endCenter.x, state.ball.endCenter.y),
    });
    const ballPos = ball.center();

    let paddle = null;
    if (position === 'left') {
      paddle = new MovableRect({
        ...state.paddleLeft,
        startCenter: new Vec2(state.paddleLeft.startCenter.x, state.paddleLeft.startCenter.y),
        endCenter: new Vec2(state.paddleLeft.endCenter.x, state.paddleLeft.endCenter.y),
      });
    } else {
      paddle = new MovableRect({
        ...state.paddleRight,
        startCenter: new Vec2(state.paddleRight.startCenter.x, state.paddleRight.startCenter.y),
        endCenter: new Vec2(state.paddleRight.endCenter.x, state.paddleRight.endCenter.y),
      });
    }
    const paddlePos = paddle.center();

    const moveVec = Vec2.sub(ball.endCenter, ball.startCenter);
    const moveTime = ball.endTime - ball.startTime;

    const defaultTargetY = goToCenterOnWait ? 0 : paddlePos.y;

    // if ball is stopped
    if (moveVec.x === 0 || moveTime === 0) {
      return { targetY: defaultTargetY };
    }
    // if ball is moving
    else {
      const ballDir = Vec2.normalize(moveVec);
      ballDir.rotate((Math.random() - 0.5) * dirRandomness);

      const ballXMax = state.ballXOnPaddleCollision;
      const ballYMax = state.ballYOnWallCollision;
      let distX = 0;

      if (position === 'right') {
        if (ballDir.x > 0) {
          distX = ballXMax - ballPos.x;
        } else {
          if (waitForRebound) return { targetY: defaultTargetY };
          distX = -ballPos.x - 3 * ballXMax;
        }
      } else {
        if (ballDir.x < 0) {
          distX = -ballPos.x - ballXMax;
        } else {
          if (waitForRebound) return { targetY: defaultTargetY };
          distX = 3 * ballXMax - ballPos.x;
        }
      }

      const distY = (distX * ballDir.y) / ballDir.x;
      let targetY = ballPos.y + distY;
      while (Math.abs(targetY) > ballYMax) {
        if (targetY > ballYMax) {
          targetY = -targetY + 2 * ballYMax;
        } else {
          targetY = -targetY - 2 * ballYMax;
        }
      }

      targetY = Math.min(targetY, state.paddleMaxCenterY);
      targetY = Math.max(targetY, -state.paddleMaxCenterY);
      return { targetY };
    }
  } catch (error) {
    console.error('ai error', error);
    return { targetY: 0 };
  }
};

export default calculateNextAiPosition;
