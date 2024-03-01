import MovableRect from './MovableRect';
import Vec2 from './Vec2';

const calculateNextAiPosition = (gameState, position) => {
  const state = JSON.parse(JSON.stringify(gameState));
  try {
    const ball = new MovableRect({
      ...state.ball,
      startCenter: new Vec2(state.ball.startCenter.x, state.ball.startCenter.y),
      endCenter: new Vec2(state.ball.endCenter.x, state.ball.endCenter.y),
    });

    const ballPos = ball.center();
    const moveVec = Vec2.sub(ball.endCenter, ball.startCenter);
    const moveTime = ball.endTime - ball.startTime;

    // if ball is stopped
    if (moveVec.x === 0 || moveTime === 0) {
      return { targetY: 0 };
    }
    // if ball is moving
    else {
      const ballDir = Vec2.normalize(moveVec);
      const ballXMax = state.ballXOnPaddleCollision;
      const ballYMax = state.ballYOnWallCollision;
      let distX = 0;

      if (position === 'right') {
        if (ballDir.x > 0) {
          distX = ballXMax - ballPos.x;
        } else {
          distX = -ballPos.x - 3 * ballXMax;
        }
      } else {
        if (ballDir.x < 0) {
          distX = -ballPos.x - ballXMax;
        } else {
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

      if (position === 'left' && ballDir.x > 0) {
        console.log('far left', targetY);
      }

      return { targetY };
    }
  } catch (error) {
    console.error('ai error', error);
    return { targetY: 0 };
  }
};

export default calculateNextAiPosition;
