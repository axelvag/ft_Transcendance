import math

class Vec2:
  def __init__(self, x, y):
    self.x = x
    self.y = y

  def json(self):
    return {
      'x': self.x,
      'y': self.y,
    }

  def clone(self):
    return Vec2(self.x, self.y)

  def copy(self, b):
    self.x = b.x
    self.y = b.y
    return self

  def add(self, b):
    self.x += b.x
    self.y += b.y
    return self

  @staticmethod
  def static_add(a, b):
    return a.clone().add(b)

  def sub(self, b):
    self.x -= b.x
    self.y -= b.y
    return self

  @staticmethod
  def static_sub(a, b):
    return a.clone().sub(b)

  def mul(self, b):
    self.x *= b.x
    self.y *= b.y
    return self

  @staticmethod
  def static_mul(a, b):
    return a.clone().mul(b)

  def div(self, b):
    if b.x == 0 or b.y == 0:
      raise ValueError('Division by zero')
    self.x /= b.x
    self.y /= b.y
    return self

  @staticmethod
  def static_div(a, b):
    return a.clone().div(b)

  def dot(self, b):
    return self.x * b.x + self.y * b.y

  @staticmethod
  def static_dot(a, b):
    return a.dot(b)

  def cross(self, b):
    return self.x * b.y - self.y * b.x

  @staticmethod
  def static_cross(a, b):
    return a.cross(b)

  def scale(self, s):
    self.x *= s
    self.y *= s
    return self

  @staticmethod
  def static_scale(a, s):
    return a.clone().scale(s)

  def normalize(self):
    len = self.length()
    if len != 0:
      self.scale(1 / len)
    return self

  @staticmethod
  def static_normalize(a):
    return a.clone().normalize()

  def length_squared(self):
    return self.x ** 2 + self.y ** 2

  @staticmethod
  def static_length_squared(a):
    return a.length_squared()

  def length(self):
    return math.sqrt(self.length_squared())

  @staticmethod
  def static_length(a):
    return a.length()

  @staticmethod
  def static_distance_squared(a, b):
    return Vec2.sub(b, a).length_squared()

  @staticmethod
  def static_distance(a, b):
    return math.sqrt(Vec2.distance_squared(a, b))

  def angle(self):
    return math.atan2(self.y, self.x)

  @staticmethod
  def static_angle(a):
    return a.angle()

  def reflect(self, normal):
    d = self.dot(normal)
    self.sub(Vec2.scale(normal, 2 * d))
    return self

  @staticmethod
  def static_reflect(a, normal):
    return a.clone().reflect(normal)

  def rotate(self, angle):
    cos = math.cos(angle)
    sin = math.sin(angle)
    x = self.x * cos - self.y * sin
    y = self.x * sin + self.y * cos
    self.x = x
    self.y = y
    return self

  @staticmethod
  def static_rotate(a, angle):
    return a.clone().rotate(angle)
