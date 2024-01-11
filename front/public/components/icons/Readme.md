# Icons

## Usage

**1. Configure the list of the svg icons in the config file `ce-icons.config.js`**

```js
export const icons = {
	user: `
		<svg viewBox="0 0 24 24">
			<path fill="currentColor" d="M12 12q-1.65 ... "/>
		</svg>
	`,
	// ...
};
```

> **TIP:** Find icons on [icones.js.org](https://icones.js.org)

**1. Import the icon component in your javascript file**

```js
import './components/icons/ce-icon.js';
```

**3. Use the icon component in your HTML file**

```html
<ce-icon name="user"></ce-icon>
```

## Color

The icon uses the CSS `color` property as color of the icon.

```html
<ce-icon name="user" style="color: blue;"></ce-icon>
```

## Size

The icon uses the CSS `font-size` property as vertical size of the icon.

```html
<ce-icon name="user" style="font-size: 1.5rem;"></ce-icon>
```

## Scale

You can adjust the size of the icon by setting the scale attribute.

```html
<ce-icon name="user" scale="1.5"></ce-icon>
```

## Block

By default, the icon is displayed inline. You can display the icon as a block by adding the `block` attribute.

```html
<ce-icon name="user" block></ce-icon>
```

## Rotate

You can rotate the icon by setting the rotate attribute.

```html
<ce-icon name="user" rotate="90"></ce-icon>
```
