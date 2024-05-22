from .Vec2 import Vec2
from .MovableRect import MovableRect
from .PauseableTimeout import PauseableTimeout
from .now import now

import random
import math

class GameEngine:
  def __init__(self):

    self._width = 800
    self._height = 600
    self._wallThickness = 10
    self._wallDepth = 30
    self._ballSize = 20
    self._ballSpeedOnStart = 300
    self._ballAcceleration = 1.05
    self._ballSpeedMax = 500
    self._paddleHeight = 100
    self._paddleWidth = 20
    self._paddleDepth = 20
    self._paddlePadding = 30
    self._paddleSpeed = 300

    self._tableWidth = 1200
    self._tableHeight = 650
    self._tableDepth = 510
    self._tableLegsSize = 340
    self._tableBoardHoleDepth = 30

    self._scoreMax = 5
    self._startRoundDelay = 500
    self._endRoundDelay = 500

    self._innerWidth = self._width - self._wallThickness * 2
    self._innerHeight = self._height - self._wallThickness * 2
    self._paddleStartCenterX = self._innerWidth / 2 - self._paddlePadding - self._paddleWidth / 2
    self._paddleMaxCenterY = self._innerHeight / 2 - self._paddleHeight / 2
    self._ballYOnWallCollision = self._innerHeight / 2 - self._ballSize / 2
    self._ballXOnPaddleCollision = self._paddleStartCenterX - self._paddleWidth / 2 - self._ballSize / 2
    self._ballXOnScore = self._width / 2 + self._ballSize
    self._hitOnPaddleMax = (self._paddleHeight + self._ballSize) / 2
    self._scoreLeft = 0
    self._scoreRight = 0
    self._status = 'initialized'

    self._ball = MovableRect({
      'startCenter': Vec2(0, 0),
      'width': self._ballSize,
      'height': self._ballSize,
    })
    self._paddleLeft = MovableRect({
      'startCenter': Vec2(-self._paddleStartCenterX, 0),
      'height': self._paddleHeight,
      'width': self._paddleWidth,
    })
    self._paddleRight = MovableRect({
      'startCenter': Vec2(self._paddleStartCenterX, 0),
      'height': self._paddleHeight,
      'width': self._paddleWidth,
    })

    self._previousCollider = None
    self._timer = PauseableTimeout()
    self._ballSpeed = 0
    self._ballDir = Vec2(0, 0)
    self._isBallMovingBeforePause = False

    self._listeners = []

  def __del__(self):
    if self._timer:
      self._timer.clear()
  
  def clear(self):
    if self._timer:
      self._timer.clear()
    self._listeners = []
  
  def _getState(self):
    return {
      'width': self._width,
      'height': self._height,
      'wallThickness': self._wallThickness,
      'wallDepth': self._wallDepth,
      'ballSize': self._ballSize,
      'ballSpeedOnStart': self._ballSpeedOnStart,
      'ballAcceleration': self._ballAcceleration,
      'ballSpeedMax': self._ballSpeedMax,
      'ballYOnWallCollision': self._ballYOnWallCollision,
      'ballXOnPaddleCollision': self._ballXOnPaddleCollision,
      'paddleHeight': self._paddleHeight,
      'paddleWidth': self._paddleWidth,
      'paddleDepth': self._paddleDepth,
      'paddlePadding': self._paddlePadding,
      'paddleSpeed': self._paddleSpeed,
      'paddleMaxCenterY': self._paddleMaxCenterY,
      'tableWidth': self._tableWidth,
      'tableHeight': self._tableHeight,
      'tableDepth': self._tableDepth,
      'tableLegsSize': self._tableLegsSize,
      'tableBoardHoleDepth': self._tableBoardHoleDepth,
      'scoreMax': self._scoreMax,
      'innerWidth': self._innerWidth,
      'innerHeight': self._innerHeight,
      'scoreLeft': self._scoreLeft,
      'scoreRight': self._scoreRight,
      'status': self._status,
      'ball': self._ball.json(),
      'paddleLeft': self._paddleLeft.json(),
      'paddleRight': self._paddleRight.json(),
      'startRoundDelay': self._startRoundDelay,
      'endRoundDelay': self._endRoundDelay,
    }
  
  def _notify(self, event):
    for listener in self._listeners:
      listener(event)

  def _init(self):
    if not self._timer:
      self._timer = PauseableTimeout()
    else:
      self._timer.clear()

    self._ball = MovableRect({
      'startCenter': Vec2(0, 0),
      'width': self._ballSize,
      'height': self._ballSize,
    })
    self._paddleLeft = MovableRect({
      'startCenter': Vec2(-self._paddleStartCenterX, 0),
      'height': self._paddleHeight,
      'width': self._paddleWidth,
    })
    self._paddleRight = MovableRect({
      'startCenter': Vec2(self._paddleStartCenterX, 0),
      'height': self._paddleHeight,
      'width': self._paddleWidth,
    })
    self._scoreLeft = 0
    self._scoreRight = 0
    self._ballSpeed = 0
    self._ballDir = Vec2(0, 0)
    self._status = 'initialized'
    self._previousCollider = None

    self._notify({
      'now': now(),
      'type': 'init',
      'state': self._getState(),
    })

  def _startNewRound(self, playerServing):
    self._status = 'running'
    self._ball.startCenter = Vec2(0, 0)
    self._ball.endCenter.copy(self._ball.startCenter)
    self._ball.startTime = now()
    self._ball.endTime = self._ball.startTime
    self._notify({
      'now': now(),
      'type': 'update',
      'event': 'newRound',
      'state': {
        'status': self._status,
        'ball': self._ball.json(),
      },
    })

    def timerFn():
      xDir = 1 if playerServing == 'left' else -1
      yDir = random.random() * 2 - 1
      self._ball.startTime = now()
      self._ball.endTime = self._ball.startTime
      self._ballDir = Vec2(xDir, yDir).normalize()
      self._ballSpeed = self._ballSpeedOnStart
      self._calculateNextCollision()
      self._notify({
        'now': now(),
        'type': 'update',
        'state': { 'ball': self._ball.json() }
      })
      self._previousCollider = None
    
    self._timer.set(timerFn, self._startRoundDelay)

  def _calculateNextCollision(self):
    if (self._status != 'running'):
      return

    if (self._ballSpeed == 0 or (self._ballDir.x == 0 and self._ballDir.y == 0)):
      return

    nextCollision = {
      'side': None,
      'type': None,
      'duration': math.inf,
      'normal': None,
      'ballOnHit': None,
    }

    # top / bottom
    if (self._ballDir.y != 0):
      side = 'top' if self._ballDir.y > 0 else 'bottom'
      hitYSign = 1 if self._ballDir.y > 0 else -1
      ballYOnHit = self._ballYOnWallCollision * hitYSign
      duration = ((ballYOnHit - self._ball.startCenter.y) / (self._ballSpeed * self._ballDir.y)) * 1000
      if (duration > 0 and duration < nextCollision['duration']):
        nextCollision = {
          'side': side,
          'type': 'wall',
          'duration': duration,
          'normal': Vec2(0, -hitYSign),
          'ballOnHit': Vec2(
            self._ball.startCenter.x + (self._ballDir.x * self._ballSpeed * duration) / 1000,
            ballYOnHit
          ),
        }

    # left / right
    if (self._ballDir.x != 0):
      side = 'right' if self._ballDir.x > 0 else 'left'
      hitXSign = 1 if self._ballDir.x > 0 else -1

      # paddle
      if (self._previousCollider != side + 'paddle'):
        ballXOnHit = self._ballXOnPaddleCollision * hitXSign
        duration = ((ballXOnHit - self._ball.startCenter.x) / (self._ballSpeed * self._ballDir.x)) * 1000
        if (duration > 0 and duration < nextCollision['duration']):
          nextCollision = {
            'side': side,
            'type': 'paddle',
            'duration': duration,
            'normal': Vec2(-hitXSign, 0),
            'ballOnHit': Vec2(
              ballXOnHit,
              self._ball.startCenter.y + (self._ballDir.y * self._ballSpeed * duration) / 1000
            ),
          }

      # score
      if (self._ballXOnPaddleCollision - math.fabs(self._ball.startCenter.x < 1)):
        ballXOnHit = self._ballXOnScore * hitXSign
        duration = ((ballXOnHit - self._ball.startCenter.x) / (self._ballSpeed * self._ballDir.x)) * 1000
        if (duration > 0 and duration < nextCollision['duration']):
          nextCollision = {
            'side': side,
            'type': 'score',
            'duration': duration,
            'normal': Vec2(-hitXSign, 0),
            'ballOnHit': Vec2(
              ballXOnHit,
              self._ball.startCenter.y + (self._ballDir.y * self._ballSpeed * duration) / 1000
            ),
          }

    if (not math.isfinite(nextCollision['duration'])):
      return
    if (self._status != 'running'):
      return

    self._ball.endCenter = nextCollision['ballOnHit']
    self._ball.endTime = now() + nextCollision['duration']

    self._timer.set(lambda: self._onBallCollision(nextCollision), nextCollision['duration'])

  def _onBallCollision(self, collision):
    self._previousCollider = None
    if (collision['type']):
       self._previousCollider = collision['side'] + collision['type']
    self._ball.startTime = now()

    # wall
    if (collision['type'] == 'wall'):
      self._ball.startCenter.copy(self._ball.endCenter)
      self._ballDir.reflect(collision['normal'])
      self._calculateNextCollision()
      self._notify({
        'type': 'update',
        'event': 'collision',
        'state': { 'ball': self._ball.json() },
      })

    # paddle
    elif (collision['type'] == 'paddle'):
      self._ball.startCenter.copy(self._ball.endCenter)
      paddleCenter = None
      if (collision['side'] == 'left'):
        paddleCenter = self._paddleLeft.center()
      else:
        paddleCenter = self._paddleRight.center()
      hitOnPaddle = self._ball.startCenter.y - paddleCenter.y
      if (math.fabs(hitOnPaddle) <= self._hitOnPaddleMax):
        self._ballDir.reflect(collision['normal'])
        self._ballSpeed = min(self._ballAcceleration * self._ballSpeed, self._ballSpeedMax)

        if (collision['side'] == 'left'):
          # alter ball direction based on paddle hit position
          factor = hitOnPaddle / self._hitOnPaddleMax
          self._ballDir.rotate((factor * math.pi) / 8)

          # clamp ball direction
          angle = self._ballDir.angle()
          if (angle > math.pi / 4):
            self._ballDir = Vec2(1, 0).rotate(math.pi / 4)
          elif (angle < -math.pi / 4):
            self._ballDir = Vec2(1, 0).rotate(-math.pi / 4)
        else:
          # alter ball direction based on paddle hit position
          factor = hitOnPaddle / self._hitOnPaddleMax
          self._ballDir.rotate((-factor * math.pi) / 8)

          # clamp ball direction
          angle = self._ballDir.angle()
          if (angle > 0 and angle < (3 * math.pi) / 4):
            self._ballDir = Vec2(-1, 1).normalize()
          elif (angle < 0 and angle > (-3 * math.pi) / 4):
            self._ballDir = Vec2(-1, -1).normalize()
        
        self._calculateNextCollision()
        self._notify({
          'now': now(),
          'type': 'update',
          'event': 'collision',
          'state': { 'ball': self._ball.json() },
        })
      else:
        self._calculateNextCollision()
        self._notify({
          'now': now(),
          'type': 'update',
          'state': { 'ball': self._ball.json() },
        })

    # score
    elif (collision['type'] == 'score'):
      isMaxScoreReached = None
      self._ball.stop()

      # update score
      if (collision['side'] == 'left'):
        self._scoreRight += 1
        isMaxScoreReached = self._scoreRight >= self._scoreMax
      else:
        self._scoreLeft += 1
        isMaxScoreReached = self._scoreLeft >= self._scoreMax

      # if max score reached, finish game
      if (isMaxScoreReached):
        self._status = 'finished'
      
      # else, start round
      else:
        playerServing = collision['side']
        self._timer.set(lambda: self._startNewRound(playerServing), self._endRoundDelay)

      # send update
      self._notify({
        'now': now(),
        'type': 'update',
        'event': 'victory' if isMaxScoreReached else 'score',
        'state': {
          'ball': self._ball.json(),
          'scoreLeft': self._scoreLeft,
          'scoreRight': self._scoreRight,
          'status': self._status,
        },
      })

  def _start(self):
    if (self._status != 'initialized'):
      self._notify({
        'now': now(),
        'type': 'update',
        'state': { 'status': self._status }
      })
      return
    self._startNewRound('left')

  def _pause(self):
    if (self._status != 'running'):
      return

    self._isBallMovingBeforePause = self._ball.startCenter.x == self._ball.endCenter.x
    if (self._isBallMovingBeforePause):
      self._timer.pause()
    else:
      self._timer.clear()

      self._ball.stop()
      self._paddleLeft.stop()
      self._paddleRight.stop()

    self._status = 'paused'
    self._notify({
      'now': now(),
      'type': 'update',
      'state': {
        'ball': self._ball.json(),
        'paddleLeft': self._paddleLeft.json(),
        'paddleRight': self._paddleRight.json(),
        'status': self._status,
      },
    })

  def _resume(self):
    if (self._status != 'paused'):
      return
    self._status = 'running'

    if (self._isBallMovingBeforePause):
      self._timer.resume()
    else:
      self._ball.startTime = now()
      self._calculateNextCollision()
    
    self._notify({
      'now': now(),
      'type': 'update',
      'state': {
        'ball': self._ball.json(),
        'status': self._status,
      },
    })

  def _reset(self):
    self._init()

  def _updatePaddleLeftMove(self, data = {}):
    if (self._status != 'running'):
      return

    if ('dir' in data):
      dir = data['dir']

      # check if paddle is already moving in the same direction
      currentDir = 0
      if (self._paddleLeft.endCenter.y > self._paddleLeft.startCenter.y):
        currentDir = 1
      elif (self._paddleLeft.endCenter.y < self._paddleLeft.startCenter.y):
        currentDir = -1
      if (dir == currentDir):
        return
      
      # update the move
      self._paddleLeft.stop()
      if (dir != 0):
        self._paddleLeft.endCenter.y = self._paddleMaxCenterY * dir
        self._paddleLeft.endTime = self._paddleLeft.startTime + (math.fabs(self._paddleLeft.endCenter.y - self._paddleLeft.startCenter.y) / self._paddleSpeed) * 1000

    elif ('targetY' in data):
      targetY = data['targetY']

      currentY = self._paddleLeft.center().y
      self._paddleLeft.stop()
      if (targetY > currentY + self._paddleHeight / 2):
        self._paddleLeft.endCenter.y = targetY
        self._paddleLeft.endTime = self._paddleLeft.startTime + ((targetY - currentY) / self._paddleSpeed) * 1000
      elif (targetY < currentY - self._paddleHeight / 2):
        self._paddleLeft.endCenter.y = targetY
        self._paddleLeft.endTime = self._paddleLeft.startTime + ((currentY - targetY) / self._paddleSpeed) * 1000

    self._notify({
      'now': now(),
      'type': 'update',
      'state': { 'paddleLeft': self._paddleLeft.json() }
    })

  def _updatePaddleRightMove(self, data = {}):
    if (self._status != 'running'):
      return

    if ('dir' in data):
      dir = data['dir']

      # check if paddle is already moving in the same direction
      currentDir = 0
      if (self._paddleRight.endCenter.y > self._paddleRight.startCenter.y):
        currentDir = 1
      elif (self._paddleRight.endCenter.y < self._paddleRight.startCenter.y):
        currentDir = -1
      if (dir == currentDir):
        return

      # update the move
      self._paddleRight.stop()
      if (dir != 0):
        self._paddleRight.endCenter.y = self._paddleMaxCenterY * dir
        self._paddleRight.endTime = self._paddleRight.startTime + (math.fabs(self._paddleRight.endCenter.y - self._paddleRight.startCenter.y) / self._paddleSpeed) * 1000

    elif ('targetY' in data):
      targetY = data['targetY']

      currentY = self._paddleRight.center().y
      self._paddleRight.stop()
      if (targetY > currentY + self._paddleHeight / 2):
        self._paddleRight.endCenter.y = targetY
        self._paddleRight.endTime = self._paddleRight.startTime + ((targetY - currentY) / self._paddleSpeed) * 1000
      elif (targetY < currentY - self._paddleHeight / 2):
        self._paddleRight.endCenter.y = targetY
        self._paddleRight.endTime = self._paddleRight.startTime + ((currentY - targetY) / self._paddleSpeed) * 1000

    self._notify({
      'now': now(),
      'type': 'update',
      'state': { 'paddleRight': self._paddleRight.json() }
    })

  def subscribe(self, callback):
    self._listeners.append(callback)

  def emit(self, eventName, data = None):
    method = getattr(self, '_' + eventName)
    if (method):
      if (eventName in ['updatePaddleLeftMove', 'updatePaddleRightMove']):
        method(data)
      elif (eventName in ['init', 'start', 'pause', 'resume', 'reset']):
        method()
