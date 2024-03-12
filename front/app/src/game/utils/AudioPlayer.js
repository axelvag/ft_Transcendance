class AudioPlayer {
  #audioContext = null;
  #sounds = {};

  constructor() {
    this.#audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  async load(name, url) {
    try {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const audioBuffer = await this.#audioContext.decodeAudioData(buffer);
      this.#sounds[name] = audioBuffer;
    } catch (error) {
      console.error('Loading audio failed', error);
    }
  }

  play(name) {
    if (!this.#sounds[name]) return;
    const source = this.#audioContext.createBufferSource();
    source.buffer = this.#sounds[name];
    source.connect(this.#audioContext.destination);
    source.start(0);
  }
}

export default AudioPlayer;
