import Vec2 from './Vec2.js';
import MovableRect from './MovableRect.js';
import PausableTimeout from './PausableTimeout.js';

class PongGame {
  width = 800;
  height = 600;
  wallThickness = 10;
  ballSize = 20;
  ballSpeed = 300;
  ballAcceleration = 1.05;
  ballSpeedMax = 500;
  paddleHeight = 100;
  paddleWidth = 20;
  paddlePadding = 30;
  paddleSpeed = 300;
  scoreMax = 5;

  innerWidth = this.width - this.wallThickness * 2;
  innerHeight = this.height - this.wallThickness * 2;
  paddleStartCenterX = this.innerWidth / 2 - this.paddlePadding - this.paddleWidth / 2;
  scoreLeft = 0;
  scoreRight = 0;
  status = 'initialized';

  #nextCollision = null;
  #previousCollider = null;
  #timer = null;
  #ballSpeedOnPause = 0;

  constructor() {
    this.#init();

    this.start = this.start.bind(this);
    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.reset = this.reset.bind(this);
    this.updatePaddleLeftMove = this.updatePaddleLeftMove.bind(this);
    this.updatePaddleRightMove = this.updatePaddleRightMove.bind(this);
  }

  #init() {
    if (!this.#timer) {
      this.#timer = new PausableTimeout();
    } else {
      this.#timer.clear();
    }
    this.ball = new MovableRect({
      startCenter: new Vec2(0, 0),
      width: this.ballSize,
      height: this.ballSize,
    });
    this.paddleLeft = new MovableRect({
      startCenter: new Vec2(-this.paddleStartCenterX, 0),
      height: this.paddleHeight,
      width: this.paddleWidth,
      dir: new Vec2(0, 1),
      yMin: -this.innerHeight / 2,
      yMax: this.innerHeight / 2,
    });
    this.paddleRight = new MovableRect({
      startCenter: new Vec2(this.paddleStartCenterX, 0),
      height: this.paddleHeight,
      width: this.paddleWidth,
      dir: new Vec2(0, 1),
      yMin: -this.innerHeight / 2,
      yMax: this.innerHeight / 2,
    });
    this.scoreLeft = 0;
    this.scoreRight = 0;
    this.status = 'initialized';
    this.#previousCollider = null;
    this.#nextCollision = null;
  }

  #startNewRound(playerServing) {
    this.status = 'running';
    this.#timer.set(() => {
      const xDir = playerServing === 'left' ? 1 : -1;
      const yDir = Math.random() * 2 - 1;

      this.ball.startTime = Date.now();
      this.ball.startCenter = new Vec2(0, 0);
      this.ball.dir = Vec2.create(xDir, yDir).normalize();
      this.ball.speed = this.ballSpeed;

      this.#previousCollider = null;
      this.#scheduleBallCollision();
    }, 500);
  }

  #calculateNextCollision() {
    if (this.ball.speed === 0 || this.ball.dir.lengthSquared() === 0) {
      this.#nextCollision = null;
      return;
    }

    let collider = null;
    let time = Infinity;
    let normal = null;

    // top wall
    if (this.#previousCollider !== 'topWall' && this.ball.dir.y > 0) {
      const collisionTime = ((this.innerHeight / 2 - this.ball.top()) / (this.ball.speed * this.ball.dir.y)) * 1000;
      if (collisionTime > 0 && collisionTime < time) {
        collider = 'topWall';
        time = collisionTime;
        normal = new Vec2(0, -1);
      }
    }

    // bottom wall
    if (this.#previousCollider !== 'bottomWall' && this.ball.dir.y < 0) {
      const collisionTime = ((-this.innerHeight / 2 - this.ball.bottom()) / (this.ball.speed * this.ball.dir.y)) * 1000;
      if (collisionTime > 0 && collisionTime < time) {
        collider = 'bottomWall';
        time = collisionTime;
        normal = new Vec2(0, 1);
      }
    }

    // left paddle
    if (this.#previousCollider !== 'leftPaddle' && this.ball.dir.x < 0) {
      const paddleBorder = this.paddleLeft.right();
      const collisionTime = ((paddleBorder - this.ball.left()) / (this.ball.speed * this.ball.dir.x)) * 1000;
      if (collisionTime > 0 && collisionTime < time) {
        collider = 'leftPaddle';
        time = collisionTime;
        normal = new Vec2(1, 0);
      }
    }

    // left border
    if (this.#previousCollider !== 'leftBorder' && this.ball.dir.x < 0) {
      const leftBorder = -this.width / 2 - this.ball.width;
      const collisionTime = ((leftBorder - this.ball.left()) / (this.ball.speed * this.ball.dir.x)) * 1000;
      if (collisionTime > 0 && collisionTime < time) {
        collider = 'leftBorder';
        time = collisionTime;
        normal = new Vec2(1, 0);
      }
    }

    // right paddle
    if (this.#previousCollider !== 'rightPaddle' && this.ball.dir.x > 0) {
      const paddleBorder = this.paddleRight.left();
      const collisionTime = ((paddleBorder - this.ball.right()) / (this.ball.speed * this.ball.dir.x)) * 1000;
      if (collisionTime > 0 && collisionTime < time) {
        collider = 'rightPaddle';
        time = collisionTime;
        normal = new Vec2(-1, 0);
      }
    }

    // right border
    if (this.#previousCollider !== 'rightBorder' && this.ball.dir.x > 0) {
      const rightBorder = this.width / 2 + this.ball.width;
      const collisionTime = ((rightBorder - this.ball.right()) / (this.ball.speed * this.ball.dir.x)) * 1000;
      if (collisionTime > 0 && collisionTime < time) {
        collider = 'rightBorder';
        time = collisionTime;
        normal = new Vec2(-1, 0);
      }
    }

    if (isFinite(time) && time > 0 && collider) {
      this.#nextCollision = {
        time: time + this.ball.startTime,
        relativeTime: time,
        collider,
        normal,
      };
      return;
    }
    this.#nextCollision = null;
  }

  #scheduleBallCollision() {
    if (this.status !== 'running') return;

    this.#calculateNextCollision();
    if (!this.#nextCollision) {
      throw new Error('No collision found');
    }

    this.#timer.set(() => {
      this.#onBallCollision();
    }, this.#nextCollision.relativeTime);
  }

  #onBallCollision() {
    this.#previousCollider = this.#nextCollision.collider;

    if (this.#nextCollision.collider === 'topWall' || this.#nextCollision.collider === 'bottomWall') {
      this.ball.startCenter = this.ball.center(this.#nextCollision.time);
      this.ball.dir.reflect(this.#nextCollision.normal);
      this.ball.startTime = Date.now();
      this.#scheduleBallCollision();
      return;
    }

    if (this.#nextCollision.collider === 'leftPaddle') {
      const ballCenter = this.ball.center(this.#nextCollision.time);
      const paddleCenter = this.paddleLeft.center(this.#nextCollision.time);
      const hitOnPaddle = ballCenter.y - paddleCenter.y;
      const hitOnPaddleMax = (this.paddleHeight + this.ball.height) / 2;
      if (hitOnPaddle < hitOnPaddleMax && hitOnPaddle > -hitOnPaddleMax) {
        this.ball.dir.reflect(this.#nextCollision.normal);
        this.ball.speed = Math.min(this.ballAcceleration * this.ball.speed, this.ballSpeedMax);

        // alter ball direction based on paddle hit position
        const factor = hitOnPaddle / hitOnPaddleMax;
        this.ball.dir.rotate((factor * Math.PI) / 8);

        // clamp ball direction
        const angle = this.ball.dir.angle();
        if (angle > Math.PI / 4) {
          this.ball.dir = Vec2.create(1, 0).rotate(Math.PI / 4);
        } else if (angle < -Math.PI / 4) {
          this.ball.dir = Vec2.create(1, 0).rotate(-Math.PI / 4);
        }
      }
      this.ball.startCenter = ballCenter;
      this.ball.startTime = Date.now();
      this.#scheduleBallCollision();
      return;
    }

    if (this.#nextCollision.collider === 'rightPaddle') {
      const ballCenter = this.ball.center(this.#nextCollision.time);
      const paddleCenter = this.paddleRight.center(this.#nextCollision.time);
      const hitOnPaddle = ballCenter.y - paddleCenter.y;
      const hitOnPaddleMax = (this.paddleHeight + this.ball.height) / 2;
      if (hitOnPaddle < hitOnPaddleMax && hitOnPaddle > -hitOnPaddleMax) {
        this.ball.dir.reflect(this.#nextCollision.normal);
        this.ball.speed = Math.min(this.ballAcceleration * this.ball.speed, this.ballSpeedMax);

        // alter ball direction based on paddle hit position
        const factor = hitOnPaddle / hitOnPaddleMax;
        this.ball.dir.rotate((-factor * Math.PI) / 8);

        // clamp ball direction
        let angle = this.ball.dir.angle();
        if (angle > 0 && angle < (3 * Math.PI) / 4) {
          this.ball.dir = Vec2.create(-1, 1).normalize();
        } else if (angle < 0 && angle > (-3 * Math.PI) / 4) {
          this.ball.dir = Vec2.create(-1, -1).normalize();
        }
      }
      this.ball.startCenter = ballCenter;
      this.ball.startTime = Date.now();
      this.#scheduleBallCollision();
      return;
    }

    if (this.#nextCollision.collider === 'leftBorder') {
      this.ball.stop();
      this.scoreRight += 1;
      if (this.scoreRight < this.scoreMax) {
        this.#timer.set(() => {
          this.#startNewRound('left');
        }, 500);
      } else {
        this.status = 'finished';
      }
      return;
    }

    if (this.#nextCollision.collider === 'rightBorder') {
      this.ball.stop();
      this.scoreLeft += 1;
      if (this.scoreLeft < this.scoreMax) {
        this.#timer.set(() => {
          this.#startNewRound('right');
        }, 500);
      } else {
        this.status = 'finished';
      }
    }
  }

  start() {
    if (this.status !== 'initialized') return this;
    this.#startNewRound('left');
    return this;
  }

  pause() {
    if (this.status !== 'running') return this;
    this.#timer.pause();

    this.#ballSpeedOnPause = this.ball.speed;
    this.ball.stop();
    this.paddleLeft.stop();
    this.paddleRight.stop();

    this.status = 'paused';
    return this;
  }

  resume() {
    if (this.status !== 'paused') return this;

    this.ball.speed = this.#ballSpeedOnPause;
    this.ball.startTime = Date.now();
    this.#calculateNextCollision();

    this.#timer.resume();
    this.status = 'running';
    return this;
  }

  reset() {
    this.#init();
    return this;
  }

  updatePaddleLeftMove(dir) {
    if (this.status !== 'running') return this;
    this.paddleLeft.startCenter = this.paddleLeft.center();
    this.paddleLeft.startTime = Date.now();
    this.paddleLeft.dir.y = dir >= 0 ? 1 : -1;
    this.paddleLeft.speed = dir !== 0 ? this.paddleSpeed : 0;
    return this;
  }

  updatePaddleRightMove(dir) {
    if (this.status !== 'running') return this;
    this.paddleRight.startCenter = this.paddleRight.center();
    this.paddleRight.startTime = Date.now();
    this.paddleRight.dir.y = dir >= 0 ? 1 : -1;
    this.paddleRight.speed = dir !== 0 ? this.paddleSpeed : 0;
    return this;
  }
}

export default PongGame;
