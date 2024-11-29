export const themeScript = `
(function() {
  function getInitialTheme() {
    const persistedTheme = localStorage.getItem('theme');
    if (persistedTheme) return persistedTheme;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    return mediaQuery.matches ? 'dark' : 'light';
  }

  const theme = getInitialTheme();
  const root = document.documentElement;
  
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  
  // Store theme directly as a data attribute
  root.dataset.theme = theme;
})();
`;
