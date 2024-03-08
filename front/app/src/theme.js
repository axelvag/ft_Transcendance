const getStoredTheme = () => localStorage.getItem('theme');

const setStoredTheme = theme => localStorage.setItem('theme', theme);

const getPreferredTheme = () => {
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyPreferredTheme = () => {
  const preferredTheme = getPreferredTheme();
  if (preferredTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-bs-theme', preferredTheme);
  }
};

const getAppliedTheme = () => document.documentElement.getAttribute('data-bs-theme');

const selectTheme = theme => {
  setStoredTheme(theme);
  applyPreferredTheme();
};

const toggleTheme = () => {
  const newTheme = getPreferredTheme() === 'dark' ? 'light' : 'dark';
  selectTheme(newTheme);
};

const initTheme = () => {
  document.addEventListener('DOMContentLoaded', applyPreferredTheme);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const storedTheme = getStoredTheme();
    if (storedTheme !== 'light' && storedTheme !== 'dark') {
      applyPreferredTheme();
    }
  });
};

export { initTheme, selectTheme, toggleTheme, getAppliedTheme };
