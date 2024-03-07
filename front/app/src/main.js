// style
import '@/assets/scss/style.scss';

// fonts
import '@fontsource/orbitron/500.css';

// bootstrap js
import 'bootstrap/dist/js/bootstrap.min.js';

// router
import './router.js';

// ui components
import '@/components/icons/ui-icon.ce.js';
import '@/components/ui-loader.ce.js';

// router
import '@/router.js';

// theme
import { initTheme } from '@/theme.js';

// init theme
initTheme();

if (localStorage.getItem('isLogged') === null) {
  localStorage.setItem('isLogged', 'false');
}
