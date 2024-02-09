import threading
import time

class PauseableTimeout:
  def __init__(self):
    self._timer = None
    self._start = None
    self._delay = None
    self._callback = None

  def set(self, callback, delay):
    self.clear()
    self._callback = callback
    self._delay = delay / 1000.0  # Convert milliseconds to seconds
    self._start = time.time()
    self._timer = threading.Timer(self._delay, self._callback)
    self._timer.start()

  def pause(self):
    if not self._timer:
      return
    self._timer.cancel()
    self._delay -= time.time() - self._start
    self._timer = None
    if self._delay < 0:
      self.clear()

  def resume(self):
    if self._delay is None or self._callback is None:
      return
    self._start = time.time()
    self._timer = threading.Timer(self._delay, self._callback)
    self._timer.start()

  def clear(self):
    if self._timer:
      self._timer.cancel()
    self._timer = None
    self._start = None
    self._delay = None
    self._callback = None
