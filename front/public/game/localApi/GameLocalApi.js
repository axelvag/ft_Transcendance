import Vec2 from './Vec2.js';
import MovableRect from './MovableRect.js';
import PausableTimeout from './PausableTimeout.js';
import { getCharacter } from './characters.js';

class GameLocalApi {
  #playerLeft = null;
  #playerRight = null;

  #width = 800;
  #height = 600;
  #wallThickness = 10;
  #ballSize = 20;
  #ballSpeedOnStart = 300;
  #ballAcceleration = 1.05;
  #ballSpeedMax = 500;
  #paddleHeight = 100;
  #paddleWidth = 20;
  #paddlePadding = 30;
  #paddleSpeed = 300;
  #scoreMax = 5;
  #startRoundDelay = 500;
  #endRoundDelay = 500;

  #innerWidth = this.#width - this.#wallThickness * 2;
  #innerHeight = this.#height - this.#wallThickness * 2;
  #paddleStartCenterX = this.#innerWidth / 2 - this.#paddlePadding - this.#paddleWidth / 2;
  #paddleMaxCenterY = this.#innerHeight / 2 - this.#paddleHeight / 2;
  #ballYOnWallCollision = this.#innerHeight / 2 - this.#ballSize / 2;
  #ballXOnPaddleCollision = this.#paddleStartCenterX - this.#paddleWidth / 2 - this.#ballSize / 2;
  #ballXOnScore = this.#width / 2 + this.#ballSize;
  #hitOnPaddleMax = (this.#paddleHeight + this.#ballSize) / 2;
  #scoreLeft = 0;
  #scoreRight = 0;
  #status = 'initialized';

  #ball = null;
  #paddleLeft = null;
  #paddleRight = null;

  #previousCollider = null;
  #timer = null;
  #ballSpeed = 0;
  #ballDir = null;
  #isBallMovingBeforePause = false;
  #listeners = [];

  constructor(options) {
    options = options || {};
    this.#playerLeft = getCharacter(options.playerLeft) || getCharacter('ryu');
    this.#playerRight = getCharacter(options.playerRight) || getCharacter('ken');
  }

  #getState() {
    return {
      playerLeft: this.#playerLeft,
      playerRight: this.#playerRight,
      width: this.#width,
      height: this.#height,
      wallThickness: this.#wallThickness,
      ballSize: this.#ballSize,
      ballSpeedOnStart: this.#ballSpeedOnStart,
      ballAcceleration: this.#ballAcceleration,
      ballSpeedMax: this.#ballSpeedMax,
      paddleHeight: this.#paddleHeight,
      paddleWidth: this.#paddleWidth,
      paddlePadding: this.#paddlePadding,
      paddleSpeed: this.#paddleSpeed,
      scoreMax: this.#scoreMax,
      innerWidth: this.#innerWidth,
      innerHeight: this.#innerHeight,
      scoreLeft: this.#scoreLeft,
      scoreRight: this.#scoreRight,
      status: this.#status,
      ball: this.#ball,
      paddleLeft: this.#paddleLeft,
      paddleRight: this.#paddleRight,
      startRoundDelay: this.#startRoundDelay,
      endRoundDelay: this.#endRoundDelay,
    };
  }

  #notify(data) {
    this.#listeners.forEach(callback => callback(JSON.stringify(data)));
  }

  #init() {
    if (!this.#timer) {
      this.#timer = new PausableTimeout();
    } else {
      this.#timer.clear();
    }

    this.#ball = new MovableRect({
      startCenter: new Vec2(0, 0),
      width: this.#ballSize,
      height: this.#ballSize,
    });
    this.#paddleLeft = new MovableRect({
      startCenter: new Vec2(-this.#paddleStartCenterX, 0),
      height: this.#paddleHeight,
      width: this.#paddleWidth,
    });
    this.#paddleRight = new MovableRect({
      startCenter: new Vec2(this.#paddleStartCenterX, 0),
      height: this.#paddleHeight,
      width: this.#paddleWidth,
    });
    this.#scoreLeft = 0;
    this.#scoreRight = 0;
    this.#ballSpeed = 0;
    this.#ballDir = new Vec2(0, 0);
    this.#status = 'initialized';
    this.#previousCollider = null;

    this.#notify({
      event: 'init',
      state: this.#getState(),
    });
  }

  #startNewRound(playerServing) {
    this.#status = 'running';
    this.#ball.startCenter = new Vec2(0, 0);
    this.#ball.endCenter.copy(this.#ball.startCenter);
    this.#ball.startTime = Date.now();
    this.#ball.endTime = this.#ball.startTime;
    this.#notify({
      event: 'newRound',
      state: {
        status: this.#status,
        ball: this.#ball,
      },
    });

    this.#timer.set(() => {
      const xDir = playerServing === 'left' ? 1 : -1;
      const yDir = Math.random() * 2 - 1;

      this.#ball.startTime = Date.now();
      this.#ball.endTime = this.#ball.startTime;
      this.#ballDir = Vec2.create(xDir, yDir).normalize();
      this.#ballSpeed = this.#ballSpeedOnStart;
      this.#calculateNextCollision();
      this.#notify({ state: { ball: this.#ball } });

      this.#previousCollider = null;
    }, this.#startRoundDelay);
  }

  #calculateNextCollision() {
    if (this.#status !== 'running') return;

    if (this.#ballSpeed === 0 || (this.#ballDir.x === 0 && this.#ballDir.y === 0)) return;

    let nextCollision = {
      side: null,
      type: null,
      duration: Infinity,
      normal: null,
      ballOnHit: null,
    };

    // top / bottom
    if (this.#ballDir.y !== 0) {
      const side = this.#ballDir.y > 0 ? 'top' : 'bottom';
      const hitYSign = this.#ballDir.y > 0 ? 1 : -1;
      const ballYOnHit = this.#ballYOnWallCollision * hitYSign;
      const duration = ((ballYOnHit - this.#ball.startCenter.y) / (this.#ballSpeed * this.#ballDir.y)) * 1000;
      if (duration > 0 && duration < nextCollision.duration) {
        nextCollision = {
          side,
          type: 'wall',
          duration,
          normal: new Vec2(0, -hitYSign),
          ballOnHit: new Vec2(
            this.#ball.startCenter.x + (this.#ballDir.x * this.#ballSpeed * duration) / 1000,
            ballYOnHit
          ),
        };
      }
    }

    // left / right
    if (this.#ballDir.x !== 0) {
      const side = this.#ballDir.x > 0 ? 'right' : 'left';
      const hitXSign = this.#ballDir.x > 0 ? 1 : -1;

      // paddle
      if (this.#previousCollider !== side + 'paddle') {
        const ballXOnHit = this.#ballXOnPaddleCollision * hitXSign;
        const duration = ((ballXOnHit - this.#ball.startCenter.x) / (this.#ballSpeed * this.#ballDir.x)) * 1000;
        if (duration > 0 && duration < nextCollision.duration) {
          nextCollision = {
            side,
            type: 'paddle',
            duration,
            normal: new Vec2(-hitXSign, 0),
            ballOnHit: new Vec2(
              ballXOnHit,
              this.#ball.startCenter.y + (this.#ballDir.y * this.#ballSpeed * duration) / 1000
            ),
          };
        }
      }

      // score
      if (this.#ballXOnPaddleCollision - Math.abs(this.#ball.startCenter.x < 1)) {
        const ballXOnHit = this.#ballXOnScore * hitXSign;
        const duration = ((ballXOnHit - this.#ball.startCenter.x) / (this.#ballSpeed * this.#ballDir.x)) * 1000;
        if (duration > 0 && duration < nextCollision.duration) {
          nextCollision = {
            side,
            type: 'score',
            duration,
            normal: new Vec2(-hitXSign, 0),
            ballOnHit: new Vec2(
              ballXOnHit,
              this.#ball.startCenter.y + (this.#ballDir.y * this.#ballSpeed * duration) / 1000
            ),
          };
        }
      }
    }

    if (!isFinite(nextCollision.duration)) return;
    if (this.#status !== 'running') return;

    this.#ball.endCenter = nextCollision.ballOnHit;
    this.#ball.endTime = Date.now() + nextCollision.duration;

    this.#timer.set(() => {
      this.#onBallCollision(nextCollision);
    }, nextCollision.duration);
  }

  #onBallCollision(collision) {
    this.#previousCollider = collision?.side + collision?.type || null;
    this.#ball.startTime = this.#ball.endTime;

    // wall
    if (collision.type === 'wall') {
      this.#ball.startCenter.copy(this.#ball.endCenter);
      this.#ballDir.reflect(collision.normal);
      this.#calculateNextCollision();
      this.#notify({
        event: 'collision',
        state: { ball: this.#ball },
      });
    }

    // paddle
    else if (collision.type === 'paddle') {
      this.#ball.startCenter.copy(this.#ball.endCenter);
      const paddleCenter = collision.side === 'left' ? this.#paddleLeft.center() : this.#paddleRight.center();
      const hitOnPaddle = this.#ball.startCenter.y - paddleCenter.y;
      if (Math.abs(hitOnPaddle) <= this.#hitOnPaddleMax) {
        this.#ballDir.reflect(collision.normal);
        this.#ballSpeed = Math.min(this.#ballAcceleration * this.#ballSpeed, this.#ballSpeedMax);

        if (collision.side === 'left') {
          // alter ball direction based on paddle hit position
          const factor = hitOnPaddle / this.#hitOnPaddleMax;
          this.#ballDir.rotate((factor * Math.PI) / 8);

          // clamp ball direction
          const angle = this.#ballDir.angle();
          if (angle > Math.PI / 4) {
            this.#ballDir = Vec2.create(1, 0).rotate(Math.PI / 4);
          } else if (angle < -Math.PI / 4) {
            this.#ballDir = Vec2.create(1, 0).rotate(-Math.PI / 4);
          }
        } else {
          // alter ball direction based on paddle hit position
          const factor = hitOnPaddle / this.#hitOnPaddleMax;
          this.#ballDir.rotate((-factor * Math.PI) / 8);

          // clamp ball direction
          let angle = this.#ballDir.angle();
          if (angle > 0 && angle < (3 * Math.PI) / 4) {
            this.#ballDir = Vec2.create(-1, 1).normalize();
          } else if (angle < 0 && angle > (-3 * Math.PI) / 4) {
            this.#ballDir = Vec2.create(-1, -1).normalize();
          }
        }
        this.#calculateNextCollision();
        this.#notify({
          event: 'collision',
          state: { ball: this.#ball },
        });
      } else {
        this.#calculateNextCollision();
        this.#notify({
          state: { ball: this.#ball },
        });
      }
    }

    // score
    else if (collision.type === 'score') {
      let isMaxScoreReached;
      this.#ball.stop();

      // update score
      if (collision.side === 'left') {
        this.#scoreRight += 1;
        isMaxScoreReached = this.#scoreRight >= this.#scoreMax;
      } else {
        this.#scoreLeft += 1;
        isMaxScoreReached = this.#scoreLeft >= this.#scoreMax;
      }

      // if max score reached, finish game
      if (isMaxScoreReached) {
        this.#status = 'finished';
      }
      // else, start new round
      else {
        const playerServing = collision.side;
        this.#timer.set(() => {
          this.#startNewRound(playerServing);
        }, this.#endRoundDelay);
      }

      // send update
      this.#notify({
        event: isMaxScoreReached ? 'victory' : 'score',
        state: {
          ball: this.#ball,
          scoreLeft: this.#scoreLeft,
          scoreRight: this.#scoreRight,
          status: this.#status,
        },
      });
    }
  }

  #start() {
    if (this.#status !== 'initialized') {
      this.#notify({ state: { status: this.#status } });
      return;
    }
    this.#startNewRound('left');
  }

  #pause() {
    if (this.#status !== 'running') return;

    this.#isBallMovingBeforePause = this.#ball.startCenter.x === this.#ball.endCenter.x;
    if (this.#isBallMovingBeforePause) {
      this.#timer.pause();
    } else {
      this.#timer.clear();

      this.#ball.stop();
      this.#paddleLeft.stop();
      this.#paddleRight.stop();
    }

    this.#status = 'paused';
    this.#notify({
      state: {
        ball: this.#ball,
        paddleLeft: this.#paddleLeft,
        paddleRight: this.#paddleRight,
        status: this.#status,
      },
    });
  }

  #resume() {
    if (this.#status !== 'paused') return;
    this.#status = 'running';

    if (this.#isBallMovingBeforePause) {
      this.#timer.resume();
    } else {
      this.#ball.startTime = Date.now();
      this.#calculateNextCollision();
    }
    this.#notify({
      state: {
        ball: this.#ball,
        status: this.#status,
      },
    });
  }

  #reset() {
    this.#init();
  }

  #updatePaddleLeftMove(dir) {
    if (this.#status !== 'running') return;

    // check if paddle is already moving in the same direction
    let currentDir = 0;
    if (this.#paddleLeft.endCenter.y > this.#paddleLeft.startCenter.y) currentDir = 1;
    else if (this.#paddleLeft.endCenter.y < this.#paddleLeft.startCenter.y) currentDir = -1;
    if (dir === currentDir) return;

    // update the move
    this.#paddleLeft.stop();
    if (dir !== 0) {
      this.#paddleLeft.endCenter.y = this.#paddleMaxCenterY * dir;
      this.#paddleLeft.endTime =
        this.#paddleLeft.startTime +
        (Math.abs(this.#paddleLeft.endCenter.y - this.#paddleLeft.startCenter.y) / this.#paddleSpeed) * 1000;
    }
    this.#notify({ state: { paddleLeft: this.#paddleLeft } });
  }

  #updatePaddleRightMove(dir) {
    if (this.#status !== 'running') return;

    // check if paddle is already moving in the same direction
    let currentDir = 0;
    if (this.#paddleRight.endCenter.y > this.#paddleRight.startCenter.y) currentDir = 1;
    else if (this.#paddleRight.endCenter.y < this.#paddleRight.startCenter.y) currentDir = -1;
    if (dir === currentDir) return;

    // update the move
    this.#paddleRight.stop();
    if (dir !== 0) {
      this.#paddleRight.endCenter.y = this.#paddleMaxCenterY * dir;
      this.#paddleRight.endTime =
        this.#paddleRight.startTime +
        (Math.abs(this.#paddleRight.endCenter.y - this.#paddleRight.startCenter.y) / this.#paddleSpeed) * 1000;
    }
    this.#notify({ state: { paddleRight: this.#paddleRight } });
  }

  subscribe(callback) {
    this.#listeners.push(callback);
  }

  emit(eventName, data) {
    switch (eventName) {
      case 'init':
        this.#init();
        break;
      case 'start':
        this.#start();
        break;
      case 'pause':
        this.#pause();
        break;
      case 'resume':
        this.#resume();
        break;
      case 'reset':
        this.#reset();
        break;
      case 'updatePaddleLeftMove':
        this.#updatePaddleLeftMove(data);
        break;
      case 'updatePaddleRightMove':
        this.#updatePaddleRightMove(data);
        break;
    }
  }
}

export default GameLocalApi;
