import Vec2 from './Vec2.js';

class MovableRect {
  constructor(options) {
    options = options || {};
    // todo: add validation
    this.width = options.width || 100;
    this.height = options.height || 100;
    this.startCenter = options.startCenter || new Vec2(0, 0);
    this.startTime = options.startTime || Date.now();
    this.endCenter = options.endCenter || this.startCenter.clone();
    this.endTime = options.endTime || this.startTime;
  }

  center(time) {
    time = time || Date.now();

    if (this.startTime >= this.endTime) return this.endCenter.clone();
    if (time > this.endTime) return this.endCenter.clone();
    if (time < this.startTime) return this.startCenter.clone();

    const progress = (time - this.startTime) / (this.endTime - this.startTime);
    const center = new Vec2(
      this.startCenter.x + (this.endCenter.x - this.startCenter.x) * progress,
      this.startCenter.y + (this.endCenter.y - this.startCenter.y) * progress
    );

    return center;
  }

  stop(time) {
    time = time || Date.now();
    this.startCenter = this.center(time);
    this.startTime = time;
    this.endCenter.copy(this.startCenter);
    this.endTime = time;
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
