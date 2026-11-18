// Small, blocking, same-origin script: apply the saved theme before first paint.
(() => {
  if (location.pathname === '/' || location.pathname === '/index.html') {
    let locale;
    try { locale = localStorage.getItem('portfolio:locale'); } catch { /* Browser language remains available. */ }
    if (locale !== 'tr' && locale !== 'en') locale = /^tr(?:-|$)/i.test(navigator.language || navigator.languages?.[0] || '') ? 'tr' : 'en';
    location.replace(`/${locale}/${location.search}${location.hash}`);
    return;
  }
  const root = document.documentElement;
  let theme = 'dark';
  let paused = false;
  let seenIntro = true;
  try {
    theme = localStorage.getItem('portfolio:theme') === 'light' ? 'light' : 'dark';
    paused = localStorage.getItem('portfolio:motion') === 'paused';
  } catch { /* Storage may be unavailable in private browsing. */ }
  try {
    seenIntro = sessionStorage.getItem('portfolio:intro') === 'seen';
    sessionStorage.setItem('portfolio:intro', 'seen');
  } catch { /* Skip the intro when session storage is unavailable. */ }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.dataset.theme = theme;
  root.dataset.motionPreference = paused ? 'paused' : 'full';
  root.dataset.motion = reduced ? 'reduced' : paused ? 'paused' : 'full';
  root.dataset.intro = !seenIntro && !paused && !reduced ? 'pending' : 'complete';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111111' : '#faf7f8');
})();
