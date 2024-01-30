class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  static create(x, y) {
    return new Vec2(x, y);
  }

  clone() {
    return new Vec2(this.x, this.y);
  }

  copy(b) {
    this.x = b.x;
    this.y = b.y;
    return this;
  }

  add(b) {
    this.x += b.x;
    this.y += b.y;
    return this;
  }
  static add(a, b) {
    return a.clone().add(b);
  }

  sub(b) {
    this.x -= b.x;
    this.y -= b.y;
    return this;
  }
  static sub(a, b) {
    return a.clone().sub(b);
  }

  mul(b) {
    this.x *= b.x;
    this.y *= b.y;
    return this;
  }
  static mul(a, b) {
    return a.clone().mul(b);
  }

  div(b) {
    if (b.x === 0 || b.y === 0) {
      throw new Error('Division by zero');
    }
    this.x /= b.x;
    this.y /= b.y;
    return this;
  }
  static div(a, b) {
    return a.clone().div(b);
  }

  dot(b) {
    return this.x * b.x + this.y * b.y;
  }
  static dot(a, b) {
    return a.dot(b);
  }

  cross(b) {
    return this.x * b.y - this.y * b.x;
  }
  static cross(a, b) {
    return a.cross(b);
  }

  scale(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }
  static scale(a, s) {
    return a.clone().scale(s);
  }

  normalize() {
    const len = this.length();
    if (len !== 0) {
      this.scale(1 / len);
    }
    return this;
  }
  static normalize(a) {
    return a.clone().normalize();
  }

  lengthSquared() {
    return this.x * this.x + this.y * this.y;
  }
  static lengthSquared(a) {
    return a.lengthSquared();
  }

  length() {
    return Math.sqrt(this.lengthSquared());
  }
  static length(a) {
    return a.length();
  }

  static distanceSquared(a, b) {
    return Vec2.sub(b, a).lengthSquared();
  }

  static distance(a, b) {
    return Math.sqrt(Vec2.distanceSquared(a, b));
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }
  static angle(a) {
    return a.angle();
  }

  reflect(normal) {
    const d = this.dot(normal);
    this.sub(Vec2.scale(normal, 2 * d));
    return this;
  }
  static reflect(a, normal) {
    return a.clone().reflect(normal);
  }

  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;
    this.x = x;
    this.y = y;
    return this;
  }
  static rotate(a, angle) {
    return a.clone().rotate(angle);
  }
}

export default Vec2;
