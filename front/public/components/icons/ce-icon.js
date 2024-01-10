import { icons } from './ce-icons.config.js';

class CeIcon extends HTMLElement {
	static #fallbackIcon = `
		<svg viewBox="0 0 24 24">
			<path d="M3,3 L21,3 L21,21 L3,21 L3,3 M3,3 L21,21 M21,3 L3,21" fill="none" stroke="currentColor" stroke-width="1"/>
		</svg>
	`;
	static #icons = icons;

	#attrs = {};

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.#attrs.name = this.getAttribute('name');
		this.#attrs.scale = this.getAttribute('scale');
		this.#attrs.block = this.getAttribute('block');
		this.#attrs.rotate = this.getAttribute('rotate');
	}

	connectedCallback() {
		this.#render();
	}

	static get observedAttributes() {
		return ['name', 'scale', 'block', 'rotate'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;
		this.#attrs[name] = newValue;
		this.#render();
	}

	#render() {
		const iconSvg = CeIcon.#icons[this.#attrs.name] || CeIcon.#fallbackIcon;

		const display = this.#attrs.block != null ? 'grid' : 'inline-grid';
		const scale = parseFloat(this.#attrs.scale || '1');
		const rotate = parseFloat(this.#attrs.rotate || '0') + 'deg';
		const verticalAlign = this.#attrs.block != null ? '0' : '-0.2em';

		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: ${display};
					place-items: center;
					vertical-align: ${verticalAlign};
				}
				svg {
					height: ${scale}em;
					fill: currentColor;
					transform: rotate(${rotate});
				}
			</style>
			${iconSvg}
		`;
	}
}

customElements.define('ce-icon', CeIcon);

export default CeIcon;
