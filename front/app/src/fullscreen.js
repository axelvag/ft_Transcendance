const isFullscreen = () => {
  return Boolean(document.fullscreenElement);
};

const enterFullscreen = () => {
  if (!isFullscreen()) {
    document.documentElement.requestFullscreen();
  }
};

const exitFullscreen = () => {
  if (isFullscreen()) {
    document.exitFullscreen();
  }
};

const toggleFullscreen = () => {
  if (isFullscreen()) {
    exitFullscreen();
  } else {
    enterFullscreen();
  }
};

export { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen };
