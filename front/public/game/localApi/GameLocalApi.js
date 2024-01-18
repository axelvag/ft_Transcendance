import Vec2 from './Vec2.js';
import MovableRect from './MovableRect.js';
import PausableTimeout from './PausableTimeout.js';

class GameLocalApi {
  #width = 800;
  #height = 600;
  #wallThickness = 10;
  #ballSize = 20;
  #ballSpeed = 300;
  #ballAcceleration = 1.05;
  #ballSpeedMax = 500;
  #paddleHeight = 100;
  #paddleWidth = 20;
  #paddlePadding = 30;
  #paddleSpeed = 300;
  #scoreMax = 5;

  #innerWidth = this.#width - this.#wallThickness * 2;
  #innerHeight = this.#height - this.#wallThickness * 2;
  #paddleStartCenterX = this.#innerWidth / 2 - this.#paddlePadding - this.#paddleWidth / 2;
  #scoreLeft = 0;
  #scoreRight = 0;
  #status = 'initialized';

  #ball = null;
  #paddleLeft = null;
  #paddleRight = null;

  #nextCollision = null;
  #previousCollider = null;
  #timer = null;
  #ballSpeedOnPause = 0;
  #eventListeners = {};

  constructor() {
    this.#init();
  }

  #getState() {
    return {
      width: this.#width,
      height: this.#height,
      wallThickness: this.#wallThickness,
      ballSize: this.#ballSize,
      ballSpeed: this.#ballSpeed,
      ballAcceleration: this.#ballAcceleration,
      ballSpeedMax: this.#ballSpeedMax,
      paddleHeight: this.#paddleHeight,
      paddleWidth: this.#paddleWidth,
      paddlePadding: this.#paddlePadding,
      paddleSpeed: this.#paddleSpeed,
      scoreMax: this.#scoreMax,
      innerWidth: this.#innerWidth,
      innerHeight: this.#innerHeight,
      paddleStartCenterX: this.#paddleStartCenterX,
      scoreLeft: this.#scoreLeft,
      scoreRight: this.#scoreRight,
      status: this.#status,
      ball: this.#ball,
      paddleLeft: this.#paddleLeft,
      paddleRight: this.#paddleRight,
    };
  }

  #notify(eventName, data) {
    if (!this.#eventListeners[eventName]) return;
    this.#eventListeners[eventName].forEach(callback => callback(JSON.stringify(data)));
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
      dir: new Vec2(0, 1),
      yMin: -this.#innerHeight / 2,
      yMax: this.#innerHeight / 2,
    });
    this.#paddleRight = new MovableRect({
      startCenter: new Vec2(this.#paddleStartCenterX, 0),
      height: this.#paddleHeight,
      width: this.#paddleWidth,
      dir: new Vec2(0, 1),
      yMin: -this.#innerHeight / 2,
      yMax: this.#innerHeight / 2,
    });
    this.#scoreLeft = 0;
    this.#scoreRight = 0;
    this.#status = 'initialized';
    this.#previousCollider = null;
    this.#nextCollision = null;

    this.#notify('init', this.#getState());
  }

  #startNewRound(playerServing) {
    this.#status = 'running';
    this.#notify('update', { status: this.#status });

    this.#timer.set(() => {
      const xDir = playerServing === 'left' ? 1 : -1;
      const yDir = Math.random() * 2 - 1;

      this.#ball.startTime = Date.now();
      this.#ball.startCenter = new Vec2(0, 0);
      this.#ball.dir = Vec2.create(xDir, yDir).normalize();
      this.#ball.speed = this.#ballSpeed;
      this.#notify('update', { ball: this.#ball });

      this.#previousCollider = null;
      this.#scheduleBallCollision();
    }, 500);
  }

  #calculateNextCollision() {
    if (this.#ball.speed === 0 || this.#ball.dir.lengthSquared() === 0) {
      this.#nextCollision = null;
      return;
    }

    let collider = null;
    let time = Infinity;
    let normal = null;

    // top wall
    if (this.#previousCollider !== 'topWall' && this.#ball.dir.y > 0) {
      const collisionTime = ((this.#innerHeight / 2 - this.#ball.top()) / (this.#ball.speed * this.#ball.dir.y)) * 1000;
      if (collisionTime > 0 && collisionTime < time) {
        collider = 'topWall';
        time = collisionTime;
        normal = new Vec2(0, -1);
      }
    }

    // bottom wall
    if (this.#previousCollider !== 'bottomWall' && this.#ball.dir.y < 0) {
      const collisionTime =
        ((-this.#innerHeight / 2 - this.#ball.bottom()) / (this.#ball.speed * this.#ball.dir.y)) * 1000;
      if (collisionTime > 0 && collisionTime < time) {
        collider = 'bottomWall';
        time = collisionTime;
        normal = new Vec2(0, 1);
      }
    }

    // left paddle
    if (this.#previousCollider !== 'leftPaddle' && this.#ball.dir.x < 0) {
      const paddleBorder = this.#paddleLeft.right();
      const collisionTime = ((paddleBorder - this.#ball.left()) / (this.#ball.speed * this.#ball.dir.x)) * 1000;
      if (collisionTime > 0 && collisionTime < time) {
        collider = 'leftPaddle';
        time = collisionTime;
        normal = new Vec2(1, 0);
      }
    }

    // left border
    if (this.#previousCollider !== 'leftBorder' && this.#ball.dir.x < 0) {
      const leftBorder = -this.#width / 2 - this.#ball.width;
      const collisionTime = ((leftBorder - this.#ball.left()) / (this.#ball.speed * this.#ball.dir.x)) * 1000;
      if (collisionTime > 0 && collisionTime < time) {
        collider = 'leftBorder';
        time = collisionTime;
        normal = new Vec2(1, 0);
      }
    }

    // right paddle
    if (this.#previousCollider !== 'rightPaddle' && this.#ball.dir.x > 0) {
      const paddleBorder = this.#paddleRight.left();
      const collisionTime = ((paddleBorder - this.#ball.right()) / (this.#ball.speed * this.#ball.dir.x)) * 1000;
      if (collisionTime > 0 && collisionTime < time) {
        collider = 'rightPaddle';
        time = collisionTime;
        normal = new Vec2(-1, 0);
      }
    }

    // right border
    if (this.#previousCollider !== 'rightBorder' && this.#ball.dir.x > 0) {
      const rightBorder = this.#width / 2 + this.#ball.width;
      const collisionTime = ((rightBorder - this.#ball.right()) / (this.#ball.speed * this.#ball.dir.x)) * 1000;
      if (collisionTime > 0 && collisionTime < time) {
        collider = 'rightBorder';
        time = collisionTime;
        normal = new Vec2(-1, 0);
      }
    }

    if (isFinite(time) && time > 0 && collider) {
      this.#nextCollision = {
        time: time + this.#ball.startTime,
        relativeTime: time,
        collider,
        normal,
      };
      return;
    }
    this.#nextCollision = null;
  }

  #scheduleBallCollision() {
    if (this.#status !== 'running') return;

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
      this.#ball.startCenter = this.#ball.center(this.#nextCollision.time);
      this.#ball.dir.reflect(this.#nextCollision.normal);
      this.#ball.startTime = Date.now();
      this.#notify('update', { ball: this.#ball });
      this.#scheduleBallCollision();
      return;
    }

    if (this.#nextCollision.collider === 'leftPaddle') {
      const ballCenter = this.#ball.center(this.#nextCollision.time);
      const paddleCenter = this.#paddleLeft.center(this.#nextCollision.time);
      const hitOnPaddle = ballCenter.y - paddleCenter.y;
      const hitOnPaddleMax = (this.#paddleHeight + this.#ball.height) / 2;
      if (hitOnPaddle < hitOnPaddleMax && hitOnPaddle > -hitOnPaddleMax) {
        this.#ball.dir.reflect(this.#nextCollision.normal);
        this.#ball.speed = Math.min(this.#ballAcceleration * this.#ball.speed, this.#ballSpeedMax);

        // alter ball direction based on paddle hit position
        const factor = hitOnPaddle / hitOnPaddleMax;
        this.#ball.dir.rotate((factor * Math.PI) / 8);

        // clamp ball direction
        const angle = this.#ball.dir.angle();
        if (angle > Math.PI / 4) {
          this.#ball.dir = Vec2.create(1, 0).rotate(Math.PI / 4);
        } else if (angle < -Math.PI / 4) {
          this.#ball.dir = Vec2.create(1, 0).rotate(-Math.PI / 4);
        }
      }
      this.#ball.startCenter = ballCenter;
      this.#ball.startTime = Date.now();
      this.#notify('update', { ball: this.#ball });
      this.#scheduleBallCollision();
      return;
    }

    if (this.#nextCollision.collider === 'rightPaddle') {
      const ballCenter = this.#ball.center(this.#nextCollision.time);
      const paddleCenter = this.#paddleRight.center(this.#nextCollision.time);
      const hitOnPaddle = ballCenter.y - paddleCenter.y;
      const hitOnPaddleMax = (this.#paddleHeight + this.#ball.height) / 2;
      if (hitOnPaddle < hitOnPaddleMax && hitOnPaddle > -hitOnPaddleMax) {
        this.#ball.dir.reflect(this.#nextCollision.normal);
        this.#ball.speed = Math.min(this.#ballAcceleration * this.#ball.speed, this.#ballSpeedMax);

        // alter ball direction based on paddle hit position
        const factor = hitOnPaddle / hitOnPaddleMax;
        this.#ball.dir.rotate((-factor * Math.PI) / 8);

        // clamp ball direction
        let angle = this.#ball.dir.angle();
        if (angle > 0 && angle < (3 * Math.PI) / 4) {
          this.#ball.dir = Vec2.create(-1, 1).normalize();
        } else if (angle < 0 && angle > (-3 * Math.PI) / 4) {
          this.#ball.dir = Vec2.create(-1, -1).normalize();
        }
      }
      this.#ball.startCenter = ballCenter;
      this.#ball.startTime = Date.now();
      this.#notify('update', { ball: this.#ball });
      this.#scheduleBallCollision();
      return;
    }

    if (this.#nextCollision.collider === 'leftBorder') {
      this.#ball.stop();
      this.#scoreRight += 1;
      if (this.#scoreRight < this.#scoreMax) {
        this.#timer.set(() => {
          this.#startNewRound('left');
        }, 500);
      } else {
        this.#status = 'finished';
      }
      this.#notify('update', {
        ball: this.#ball,
        scoreRight: this.#scoreRight,
        status: this.#status,
      });
      return;
    }

    if (this.#nextCollision.collider === 'rightBorder') {
      this.#ball.stop();
      this.#scoreLeft += 1;
      if (this.#scoreLeft < this.#scoreMax) {
        this.#timer.set(() => {
          this.#startNewRound('right');
        }, 500);
      } else {
        this.#status = 'finished';
      }
      this.#notify('update', {
        ball: this.#ball,
        scoreLeft: this.#scoreLeft,
        status: this.#status,
      });
    }
  }

  #start() {
    if (this.#status !== 'initialized') {
      this.#notify('update', { status: this.#status });
      return this;
    }
    this.#startNewRound('left');
    return this;
  }

  #pause() {
    if (this.#status !== 'running') {
      this.#notify('update', { status: this.#status });
      return this;
    }
    this.#timer.pause();

    this.#ballSpeedOnPause = this.#ball.speed;
    this.#ball.stop();
    this.#paddleLeft.stop();
    this.#paddleRight.stop();

    this.#status = 'paused';

    this.#notify('update', {
      ball: this.#ball,
      status: this.#status,
    });
    return this;
  }

  #resume() {
    if (this.#status !== 'paused') {
      this.#notify('update', { status: this.#status });
      return this;
    }

    this.#ball.speed = this.#ballSpeedOnPause;
    this.#ball.startTime = Date.now();
    this.#calculateNextCollision();

    this.#timer.resume();
    this.#status = 'running';

    this.#notify('update', {
      ball: this.#ball,
      status: this.#status,
    });
    return this;
  }

  #reset() {
    this.#init();
    return this;
  }

  #updatePaddleLeftMove(dir) {
    if (this.#status !== 'running') {
      this.#notify('update', { status: this.#status });
      return this;
    }

    this.#paddleLeft.startCenter = this.#paddleLeft.center();
    this.#paddleLeft.startTime = Date.now();
    this.#paddleLeft.dir.y = dir >= 0 ? 1 : -1;
    this.#paddleLeft.speed = dir !== 0 ? this.#paddleSpeed : 0;
    this.#notify('update', { paddleLeft: this.#paddleLeft });
    return this;
  }

  #updatePaddleRightMove(dir) {
    if (this.#status !== 'running') {
      this.#notify('update', { status: this.#status });
      return this;
    }

    this.#paddleRight.startCenter = this.#paddleRight.center();
    this.#paddleRight.startTime = Date.now();
    this.#paddleRight.dir.y = dir >= 0 ? 1 : -1;
    this.#paddleRight.speed = dir !== 0 ? this.#paddleSpeed : 0;
    this.#notify('update', { paddleRight: this.#paddleRight });
    return this;
  }

  on(eventName, callback) {
    if (!this.#eventListeners[eventName]) {
      this.#eventListeners[eventName] = [];
    }
    this.#eventListeners[eventName].push(callback);

    // trigger immediately init event
    if (eventName === 'init') {
      callback(JSON.stringify(this.#getState()));
    }
  }

  emit(eventName, data) {
    switch (eventName) {
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
