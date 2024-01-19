import Vec2 from './Vec2.js';

class MovableRect {
  constructor(options) {
    options = options || {};
    // todo: add validation
    this.width = options.width || 100;
    this.height = options.height || 100;
    this.startCenter = options.startCenter || new Vec2(0, 0);
    this.startTime = options.startTime || Date.now();
    this.dir = options.dir || new Vec2(1, 0);
    this.speed = options.speed || 0;
    this.xMin = options.xMin || -Infinity;
    this.xMax = options.xMax || Infinity;
    this.yMin = options.yMin || -Infinity;
    this.yMax = options.yMax || Infinity;
  }

  center(time) {
    time = time || Date.now();
    const elapsedTime = time - this.startTime;
    const dist = (elapsedTime / 1000) * this.speed;
    const center = Vec2.add(this.startCenter, Vec2.scale(this.dir, dist));

    if (center.x - this.width / 2 < this.xMin) {
      center.x = this.xMin + this.width / 2;
    }
    if (center.x + this.width / 2 > this.xMax) {
      center.x = this.xMax - this.width / 2;
    }
    if (center.y - this.height / 2 < this.yMin) {
      center.y = this.yMin + this.height / 2;
    }
    if (center.y + this.height / 2 > this.yMax) {
      center.y = this.yMax - this.height / 2;
    }

    return center;
  }

  stop(time) {
    time = time || Date.now();
    this.startCenter = this.center(time);
    this.startTime = time;
    this.speed = 0;
  }

  top(time) {
    time = time || Date.now();
    return this.center(time).y + this.height / 2;
  }

  right(time) {
    time = time || Date.now();
    return this.center(time).x + this.width / 2;
  }

  bottom(time) {
    time = time || Date.now();
    return this.center(time).y - this.height / 2;
  }

  left(time) {
    time = time || Date.now();
    return this.center(time).x - this.width / 2;
  }
}

export default MovableRect;
