# Icons

## Usage

**1. Configure the list of the svg icons in the config file `icons.js`**

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
import "./components/icons/ui-icon.ce.js";
```

**3. Use the icon component in your HTML file**

```html
<ui-icon name="user"></ui-icon>
```

## Color

The icon uses the CSS `color` property as color of the icon.

```html
<ui-icon name="user" style="color: blue;"></ui-icon>
```

## Size

The icon uses the CSS `font-size` property as vertical size of the icon.

```html
<ui-icon name="user" style="font-size: 1.5rem;"></ui-icon>
```

## Scale

You can adjust the size of the icon by setting the scale attribute.

```html
<ui-icon name="user" scale="1.5"></ui-icon>
```

## Block

By default, the icon is displayed inline. You can display the icon as a block by adding the `block` attribute.

```html
<ui-icon name="user" block></ui-icon>
```

## Rotate

You can rotate the icon by setting the rotate attribute.

```html
<ui-icon name="user" rotate="90"></ui-icon>
```
