import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
let theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
let paused = document.documentElement.dataset.motionPreference === 'paused';
let lenis: Lenis | undefined;
let observer: IntersectionObserver | undefined;
let scrollFrame = 0;

function store(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* The current tab still works. */ }
}

function updateControls() {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111111' : '#faf7f8');
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    const label = theme === 'dark' ? button.dataset.labelLight! : button.dataset.labelDark!;
    button.hidden = false;
    button.setAttribute('aria-label', label);
    button.title = label;
  });
  document.querySelectorAll<HTMLButtonElement>('[data-motion-toggle]').forEach((button) => {
    button.hidden = false;
    button.disabled = reducedMotion.matches;
    button.setAttribute('aria-pressed', String(paused || reducedMotion.matches));
    button.title = reducedMotion.matches ? button.dataset.labelReduced! : paused ? button.dataset.labelResume! : button.dataset.labelPause!;
  });
}

function configureScrolling() {
  lenis?.destroy();
  lenis = undefined;
  if (paused || reducedMotion.matches || !finePointer.matches || document.hidden) return;
  lenis = new Lenis({ autoRaf: true, lerp: 0.1, smoothWheel: true, syncTouch: false, anchors: true,
    prevent: (element) => element.matches('pre, [data-native-scroll]'),
  });
}

function revealContent() {
  observer?.disconnect();
  const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (paused || reducedMotion.matches || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }
  observer = new IntersectionObserver((entries) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      target.classList.add('is-visible');
      observer?.unobserve(target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
  elements.forEach((element) => {
    if (element.getBoundingClientRect().top < innerHeight * 0.96) element.classList.add('is-visible');
    else observer!.observe(element);
  });
}

function updateScrollPosition() {
  scrollFrame = 0;
  const root = document.documentElement;
  const maximum = root.scrollHeight - innerHeight;
  root.style.setProperty('--scroll-progress', String(maximum > 0 ? Math.min(1, Math.max(0, scrollY / maximum)) : 0));
  root.toggleAttribute('data-scrolled', scrollY > 24);
  const top = document.querySelector<HTMLButtonElement>('[data-scroll-top]');
  if (top) top.hidden = scrollY < 480;
}

function mountPage() {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.motionPreference = paused ? 'paused' : 'full';
  root.dataset.motion = reducedMotion.matches ? 'reduced' : paused ? 'paused' : 'full';
  revealContent();
  root.dataset.enhanced = 'true';
  updateControls();
  configureScrolling();
  updateScrollPosition();
}

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const locale = event.target.closest<HTMLElement>('[data-locale-switch]')?.dataset.localeSwitch;
  if (locale === 'tr' || locale === 'en') store('portfolio:locale', locale);
  if (event.target.closest('[data-theme-toggle]')) {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    store('portfolio:theme', theme);
    updateControls();
  }
  if (event.target.closest('[data-motion-toggle]') && !reducedMotion.matches) {
    paused = !paused;
    store('portfolio:motion', paused ? 'paused' : 'full');
    document.documentElement.dataset.intro = 'complete';
    mountPage();
  }
  if (event.target.closest('[data-scroll-top]')) {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: paused || reducedMotion.matches ? 'instant' : 'smooth' });
    document.getElementById('main')?.focus({ preventScroll: true });
  }
});

document.addEventListener('astro:before-preparation', () => document.documentElement.setAttribute('data-navigating', ''));
document.addEventListener('astro:before-swap', (event) => {
  lenis?.destroy();
  lenis = undefined;
  observer?.disconnect();
  event.newDocument.documentElement.dataset.theme = theme;
  event.newDocument.documentElement.dataset.motionPreference = paused ? 'paused' : 'full';
  event.newDocument.documentElement.dataset.motion = reducedMotion.matches ? 'reduced' : paused ? 'paused' : 'full';
  event.newDocument.documentElement.dataset.intro = 'complete';
  event.newDocument.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111111' : '#faf7f8');
});
document.addEventListener('astro:page-load', () => {
  document.documentElement.removeAttribute('data-navigating');
  mountPage();
});
document.addEventListener('animationend', (event) => {
  if (event.animationName === 'intro-dismiss') document.documentElement.dataset.intro = 'complete';
});
document.addEventListener('visibilitychange', () => {
  document.documentElement.toggleAttribute('data-page-hidden', document.hidden);
  configureScrolling();
});
window.addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollPosition);
}, { passive: true });
window.addEventListener('pageshow', () => {
  document.documentElement.removeAttribute('data-navigating');
  mountPage();
});
reducedMotion.addEventListener('change', () => {
  document.documentElement.dataset.intro = 'complete';
  mountPage();
});
finePointer.addEventListener('change', configureScrolling);
mountPage();
