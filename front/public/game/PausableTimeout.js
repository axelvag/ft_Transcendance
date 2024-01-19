class PausableTimeout {
	#timerId = null;
	#start = null;
	#delay = null;
	#callback = null;

	constructor() {}

	set(callback, delay) {
		this.clear();
		this.#callback = callback;
		this.#delay = delay;
		this.#start = Date.now();
		this.#timerId = setTimeout(this.#callback, this.#delay);
	}

	pause() {
		if (!this.#timerId) return;
		clearTimeout(this.#timerId);
		this.#delay -= Date.now() - this.#start;
		if (this.#delay < 0) this.clear();
	}

	resume() {
		if (!this.#timerId) return;
		this.#start = Date.now();
		clearTimeout(this.#timerId);
		this.#timerId = setTimeout(this.#callback, this.#delay);
	}

	clear() {
		clearTimeout(this.#timerId);
		this.#timerId = null;
		this.#start = null;
		this.#delay = null;
		this.#callback = null;
	}
}

export default PausableTimeout;
