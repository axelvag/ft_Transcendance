# Notifications

## Init

use the `initNotifications` method to initialize the notifications.

```js
import { initNotifications } from "@/notifications.js";
initNotifications();
```

## Usage

Use the `notify` method to show notifications.

Examples:

```js
import { notify } from "@/notifications.js";

notify("Welcome to the app!");

notify({
  message: "The sound is activated!",
  icon: "sound-on",
  iconClass: "text-primary",
  delay: 10000,
});

notify({
  message: '<div class="fs-6 fw-semibold">The authentication failed!</div>',
  icon: "error",
  iconClass: "fs-2 px-1 text-danger-emphasis",
  theme: "danger",
  autohide: false,
  actions: [
    {
      label: "Try again",
      themeClass: "btn-light text-danger",
      onclick: () => alert("Try again clicked"),
    },
    {
      label: "Cancel",
      themeClass: "btn-light text-danger",
      onclick: () => alert("Cancel clicked"),
    },
  ],
});
```
