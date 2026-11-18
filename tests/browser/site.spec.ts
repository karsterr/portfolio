import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseDocument } from '../../scripts/content-pipeline';
import { settingsSchema } from '../../src/shared/content';
import sharp from 'sharp';

async function htmlPaths(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((item) => item.isDirectory() ? htmlPaths(path.join(directory, item.name)) : item.name.endsWith('.html') ? [path.join(directory, item.name)] : []))).flat();
}

async function settleReveals(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y <= document.documentElement.scrollHeight; y += innerHeight * 0.7) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await expect.poll(() => page.locator('[data-reveal]').evaluateAll((elements) => elements.every((element) => getComputedStyle(element).opacity === '1'))).toBe(true);
}

test('üretilen tüm sayfalar ve yerel bağlantılar çalışır; scriptler yerel ve sınırlı', async ({ page, request, baseURL }) => {
  const scripts: string[] = [];
  const errors: string[] = [];
  page.on('request', (req) => { if (req.resourceType() === 'script') scripts.push(req.url()); });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error' && /content security policy/i.test(message.text())) errors.push(message.text()); });
  const files = await htmlPaths('dist/public');
  const checked = new Set<string>();
  for (const filename of files) {
    const pathname = filename.replace(/^dist\/public/, '').replace(/index\.html$/, '');
    await page.goto(pathname);
    await expect(page.locator('h1')).toHaveCount(1);
    for (const href of await page.locator('a[href^="/"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')!))) {
      if (checked.has(href)) continue;
      const response = await request.get(href);
      expect(response.status(), href).toBe(200);
      checked.add(href);
    }
  }
  expect(scripts.length).toBeGreaterThan(0);
  for (const url of scripts) {
    expect(new URL(url).origin).toBe(new URL(baseURL!).origin);
    expect(new URL(url).pathname).toMatch(/^\/_astro\/[A-Za-z0-9_.-]+\.js$/);
  }
  expect(errors).toEqual([]);
  expect((await request.get('/keystatic/')).status()).toBe(404);
  expect((await request.get('/api/keystatic/tree')).status()).toBe(404);
  expect((await request.get('/tr/yazilar/private-draft/')).status()).toBe(404);
  expect((await request.get('/media/private-draft-sentinel.png')).status()).toBe(404);
});

test('iki dil, mobil düzen, klavye ve erişilebilirlik', async ({ page }) => {
  await page.goto('/tr/');
  for (const theme of ['dark', 'light']) {
    await page.evaluate((value) => localStorage.setItem('portfolio:theme', value), theme);
    for (const pathname of ['/tr/', '/en/', '/tr/projeler/', '/en/articles/why-start-static/', '/tr/rehberler/yerel-icerik-akisi/', '/tr/deneyim/', '/en/experience/']) {
      await page.goto(pathname);
      await expect(page.locator('html')).toHaveAttribute('lang', pathname.startsWith('/tr/') ? 'tr' : 'en');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      // Exercise the actual reveal behavior before checking settled text contrast.
      await settleReveals(page);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(result.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => ({ target: node.target, issue: node.failureSummary })) })), `${theme}: ${pathname}`).toEqual([]);
    }
  }
  await page.setViewportSize({ width: 320, height: 800 });
  await page.evaluate(() => localStorage.setItem('portfolio:theme', 'dark'));
  await page.goto('/tr/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'İçeriğe geç' })).toBeFocused();
  await page.getByRole('link', { name: 'İçeriğe geç' }).blur();
  await settleReveals(page);
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await settleReveals(page);
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Açık temaya geç', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.waitForFunction(() => getComputedStyle(document.body).backgroundColor === 'rgb(250, 247, 248)');
  await page.screenshot({ path: 'test-results/home-light.png', fullPage: true });
});

test('hakkımda projelerden önce; portre optimize, iletişim bağlantıları gerçek ayarları kullanır', async ({ page, request }) => {
  const settings = settingsSchema.parse(JSON.parse(await readFile('.local/content/settings.json', 'utf8')));
  for (const locale of ['tr', 'en']) {
    await page.goto(`/${locale}/`);
    expect(await page.locator('#about').evaluate((element) => Boolean(element.compareDocumentPosition(document.getElementById('work')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
    const portrait = page.locator('#about img');
    await portrait.scrollIntoViewIfNeeded();
    await expect(portrait).toHaveAttribute('loading', 'lazy');
    await expect(portrait).toHaveAttribute('width', '400');
    await expect(portrait).toHaveAttribute('height', '400');
    await expect(portrait).toHaveAttribute('alt', /Efe Can Kara/);
    await expect.poll(() => portrait.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const response = await request.get((await portrait.getAttribute('src'))!);
    const body = await response.body();
    expect(body.length).toBeLessThan(60 * 1024);
    const metadata = await sharp(body).metadata();
    expect(metadata.format).toBe('webp');
    expect(metadata.exif).toBeUndefined();
    if (settings.profile) {
      await expect(page.locator('#contact .contact-email')).toHaveAttribute('href', `mailto:${settings.profile.email}`);
      if (settings.profile.upworkUrl) await expect(page.locator('#contact .contact-links a').first()).toHaveAttribute('href', settings.profile.upworkUrl);
    }
    await page.locator('.site-nav').getByRole('link', { name: locale === 'tr' ? 'İletişim' : 'Contact', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/#contact$`));
  }
  for (const asset of ['/photo.jpeg', '/Efe_Can_Kara_CV_TR.docx', '/Efe_Can_Kara_CV_EN.docx', '/design/references/cv/Efe_Can_Kara_CV_TR.docx']) expect((await request.get(asset)).status()).toBe(404);
});

test('deneyim sıralaması, dönemler ve detay sayfaları CMS verisini izler', async ({ page }) => {
  const files = (await readdir('.local/content/experience')).filter((file) => file.endsWith('.mdoc'));
  const documents = await Promise.all(files.map(async (file) => parseDocument(await readFile(path.join('.local/content/experience', file), 'utf8')).data));
  for (const locale of ['tr', 'en']) {
    const expected = documents.filter((entry) => entry.locale === locale && entry.status === 'published').sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || (b.publishedAt || '').localeCompare(a.publishedAt || ''));
    await page.goto(locale === 'tr' ? '/tr/deneyim/' : '/en/experience/');
    await expect(page.locator('.experience-entry')).toHaveCount(expected.length);
    for (let index = 0; index < expected.length; index++) {
      const entry = page.locator('.experience-entry').nth(index);
      await expect(entry.locator('h2')).toHaveText(expected[index]!.title);
      await expect(entry.locator('.experience-period')).toContainText(expected[index]!.period!);
    }
    if (expected.length) {
      await page.locator('.experience-entry h2 a').first().click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(expected[0]!.title);
    }
    await page.goto(locale === 'tr' ? '/tr/deneyim/' : '/en/experience/');
    await settleReveals(page);
    await page.screenshot({ path: `test-results/experience-${locale}.png`, fullPage: true });
  }
});

test('JavaScript kapalıyken karanlık tema ve içerik gezinmesi çalışır', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, locale: 'tr-TR' });
  try {
    const page = await context.newPage();
    await page.goto(new URL('/', baseURL!).href);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('navigation', { name: 'Dil seçimi / Language' })).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('[data-theme-toggle]')).toBeHidden();
    await expect(page.locator('.page-intro')).toBeHidden();
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Projects', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects');
  } finally { await context.close(); }
});

test('ilk giriş birincil tarayıcı diline göre TR veya EN açar; seçim ekranı yok', async ({ browser, baseURL }) => {
  for (const [locale, expected] of [['tr-TR', 'tr'], ['tr', 'tr'], ['en-US', 'en'], ['de-DE', 'en']]) {
    const context = await browser.newContext({ locale });
    try {
      const page = await context.newPage();
      if (locale === 'de-DE') await page.addInitScript(() => Object.defineProperty(navigator, 'languages', { get: () => ['de-DE', 'tr-TR'] }));
      await page.goto(new URL('/?source=test#work', baseURL!).href);
      await expect(page).toHaveURL(new URL(`/${expected}/?source=test#work`, baseURL!).href);
      await expect(page.locator('html')).toHaveAttribute('lang', expected!);
      await expect(page.getByRole('navigation', { name: 'Dil seçimi / Language' })).toHaveCount(0);
    } finally { await context.close(); }
  }
});

test('elle dil seçimi saklanır; açık içerik URL dili otomatik değiştirilmez', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ locale: 'en-US' });
  try {
    const page = await context.newPage();
    await page.goto(new URL('/', baseURL!).href);
    await expect(page).toHaveURL(new URL('/en/', baseURL!).href);
    await page.getByRole('link', { name: 'Türkçe', exact: true }).click();
    await expect(page).toHaveURL(new URL('/tr/', baseURL!).href);
    await expect.poll(() => page.evaluate(() => localStorage.getItem('portfolio:locale'))).toBe('tr');
    await page.goto(new URL('/', baseURL!).href);
    await expect(page).toHaveURL(new URL('/tr/', baseURL!).href);
    await page.goto(new URL('/en/articles/why-start-static/', baseURL!).href);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  } finally { await context.close(); }
});

test('depolama engelliyken kök giriş tarayıcı dilini kullanır', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ locale: 'tr-TR' });
  try {
    await context.addInitScript(() => { Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); }; });
    const page = await context.newPage();
    await page.goto(new URL('/', baseURL!).href);
    await expect(page).toHaveURL(new URL('/tr/', baseURL!).href);
  } finally { await context.close(); }
});

test('logo ve favicon çalışır; kaynak PNG ve referans dosyaları yayınlanmaz', async ({ page, request }) => {
  await page.goto('/tr/');
  await expect(page.locator('.site-brand svg')).toBeVisible();
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/brand/favicon.svg');
  for (const asset of ['/brand/favicon.svg', '/brand/apple-touch-icon.png', '/brand/social.webp']) expect((await request.get(asset)).status()).toBe(200);
  for (const asset of ['/referans.png', '/design/references/referans.png', '/logo_icon.png', '/src/assets/brand/originals/logo_banner.png']) expect((await request.get(asset)).status()).toBe(404);
});

test('karanlık varsayılan; tema ilk boyama, reload ve sayfa geçişinde korunur', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/tr/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-intro', 'complete');
  await page.getByRole('button', { name: 'Açık temaya geç', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.evaluate(() => { (window as Window & { routeMarker?: string }).routeMarker = 'persistent-window'; });
  await page.getByRole('navigation', { name: 'Ana gezinme' }).getByRole('link', { name: 'Projeler', exact: true }).click();
  await expect(page).toHaveURL(/\/tr\/projeler\/$/);
  expect(await page.evaluate(() => (window as Window & { routeMarker?: string }).routeMarker)).toBe('persistent-window');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveAttribute('data-intro', 'complete');
  await page.goBack();
  await expect(page).toHaveURL(/\/tr\/$/);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.page-intro')).toBeHidden();
  // Block the deferred application module: the small head bootstrap must suffice.
  await page.route(/\/_astro\/.*\.js$/, async (route) => {
    if (route.request().url().includes('theme-init')) await route.continue();
    else await route.abort();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('hareketi duraklatma kalıcıdır; sistemin azaltılmış hareket tercihi uygulanır', async ({ page }) => {
  await page.goto('/tr/');
  await expect(page.locator('html')).toHaveAttribute('data-enhanced', 'true');
  await expect(page.locator('html')).toHaveClass(/lenis/);
  await page.getByRole('button', { name: 'Animasyonları duraklat', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
  expect(await page.locator('.wave-field-one').evaluate((element) => getComputedStyle(element).animationPlayState)).toBe('paused');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('[data-motion-toggle]')).toBeDisabled();
  await expect(page.locator('.page-intro')).toBeHidden();
  expect(await page.locator('.wave-field-one').evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
  await page.getByRole('button', { name: 'Animasyonları duraklat', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  await expect(page.locator('html')).toHaveClass(/lenis/);
});

test('depolama engelliyken tema düğmesi ve gezinme hata vermeden çalışır', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  await page.goto('/tr/');
  await page.getByRole('button', { name: 'Açık temaya geç', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('navigation', { name: 'Ana gezinme' }).getByRole('link', { name: 'Rehberler', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rehberler');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(errors).toEqual([]);
});

test('kaydırma ilerlemesi ve yukarı dönüş çalışır; dokunmatik kaydırma doğaldır', async ({ page, browser, baseURL }) => {
  await page.goto('/tr/');
  await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'instant' }));
  await expect(page.getByRole('button', { name: 'Yukarı dön', exact: true })).toBeVisible();
  expect(await page.evaluate(() => Number(document.documentElement.style.getPropertyValue('--scroll-progress')))).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Yukarı dön', exact: true }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(5);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  const touch = await browser.newContext({ isMobile: true, hasTouch: true, viewport: { width: 390, height: 844 } });
  try {
    const mobile = await touch.newPage();
    await mobile.goto(new URL('/tr/', baseURL!).href);
    await expect(mobile.locator('html')).toHaveAttribute('data-enhanced', 'true');
    await expect(mobile.locator('html')).not.toHaveClass(/lenis/);
  } finally { await touch.close(); }
});

test('yerel CMS içerik köküyle sınırlı ve farklı origin yazmaları reddedilir', async ({ request, page }) => {
  const response = await request.get('http://127.0.0.1:4322/api/keystatic/tree', { headers: { 'no-cors': '1' } });
  expect(response.status()).toBe(200);
  const entries = await response.json() as { path: string }[];
  expect(entries.some((item) => item.path === 'content/posts/static-first-tr.mdoc')).toBe(true);
  expect(entries.every((item) => item.path === 'content' || item.path.startsWith('content/'))).toBe(true);
  const rejected = await request.post('http://127.0.0.1:4322/api/keystatic/update', { headers: { origin: 'https://other.example', 'no-cors': '1' }, data: { additions: [], deletions: [] } });
  expect(rejected.status()).toBe(403);
  await page.goto('http://127.0.0.1:4322/keystatic/collection/posts');
  await expect(page.getByText('Empty collection', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('row', { name: 'static-first-tr', exact: true })).toBeVisible();
  await page.goto('http://127.0.0.1:4322/keystatic/collection/posts/item/static-first-tr');
  await expect(page.getByRole('textbox', { name: 'Başlık', exact: true })).toHaveValue('İçerik odaklı bir site neden statik başlar?');
});

test('yerel CMS kaydetme turu ve şema uyumu', async ({ page }) => {
  const filename = '.local/content/posts/private-draft-tr.mdoc';
  const original = await readFile(filename, 'utf8');
  expect(original).toContain('PRIVATE_DRAFT_SENTINEL_7f23');
  try {
    await page.goto('http://127.0.0.1:4322/keystatic/collection/posts/item/private-draft-tr');
    await page.getByRole('textbox', { name: 'Özet', exact: true }).fill('CMS_WRITE_ROUNDTRIP_SAMPLE');
    const saved = page.waitForResponse((response) => response.url().endsWith('/api/keystatic/update') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    expect((await saved).status()).toBe(200);
    const persisted = await readFile(filename, 'utf8');
    expect(parseDocument(persisted).data.summary).toBe('CMS_WRITE_ROUNDTRIP_SAMPLE');
  } finally { await writeFile(filename, original); }
});

test('CMS profil ayarları kaydedilir ve koşullu alan build şemasıyla uyumludur', async ({ page }) => {
  const filename = '.local/content/settings.json';
  const original = await readFile(filename, 'utf8');
  const initial = settingsSchema.parse(JSON.parse(original));
  test.skip(!initial.profile, 'Ayrıntılı profil bu içerik kümesinde kapalı.');
  try {
    await page.goto('http://127.0.0.1:4322/keystatic/singleton/settings');
    const email = page.getByRole('textbox', { name: 'İletişim e-postası', exact: true });
    await expect(email).toHaveValue(initial.profile!.email);
    await email.fill('profile-roundtrip@example.com');
    const saved = page.waitForResponse((response) => response.url().endsWith('/api/keystatic/update') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    expect((await saved).status()).toBe(200);
    const persisted = settingsSchema.parse(JSON.parse(await readFile(filename, 'utf8')));
    expect(persisted.profile?.email).toBe('profile-roundtrip@example.com');
    expect(persisted.profile?.upworkUrl).toBe(initial.profile?.upworkUrl);
  } finally { await writeFile(filename, original); }
});
