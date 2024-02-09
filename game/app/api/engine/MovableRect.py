from .now import now
from .Vec2 import Vec2

class MovableRect:

  def __init__(self, options={}):
    # Todo: Add validation
    self.width = options.get('width', 100)
    self.height = options.get('height', 100)
    self.startCenter = options.get('startCenter', Vec2(0, 0))
    self.startTime = options.get('startTime', now())
    self.endCenter = options.get('endCenter', self.startCenter.clone())
    self.endTime = options.get('endTime', self.startTime)

  def center(self, time=None):
    if time is None:
      time = now()

    if self.startTime >= self.endTime:
      return self.endCenter.clone()
    if time > self.endTime:
      return self.endCenter.clone()
    if time < self.startTime:
      return self.startCenter.clone()

    progress = (time - self.startTime) / (self.endTime - self.startTime)
    center = Vec2(
      self.startCenter.x + (self.endCenter.x - self.startCenter.x) * progress,
      self.startCenter.y + (self.endCenter.y - self.startCenter.y) * progress
    )

    return center

  def stop(self, time=None):
    if time is None:
      time = now()
    self.startCenter = self.center(time)
    self.startTime = time
    self.endCenter.copy(self.startCenter)
    self.endTime = time

  def top(self, time=None):
    if time is None:
      time = now()
    return self.center(time).y + self.height / 2

  def right(self, time=None):
    if time is None:
      time = now()
    return self.center(time).x + self.width / 2

  def bottom(self, time=None):
    if time is None:
      time = now()
    return self.center(time).y - self.height / 2

  def left(self, time=None):
    if time is None:
      time = now()
    return self.center(time).x - self.width / 2
  
  def json(self):
    return {
      'width': self.width,
      'height': self.height,
      'startCenter': self.startCenter.json(),
      'startTime': self.startTime,
      'endCenter': self.endCenter.json(),
      'endTime': self.endTime,
    }
