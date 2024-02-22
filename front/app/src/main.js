import { verifyUserLoginMain } from './auth.js';
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

verifyUserLoginMain();
// init theme
initTheme();