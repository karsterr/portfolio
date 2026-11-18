import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { locales, entryPath, type Locale } from '../../../shared/content';
import { settings, text } from '../../lib/site';

export const getStaticPaths = () => process.env.SITE_URL ? locales.map((locale) => ({ params: { locale } })) : [];
const xml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const GET: APIRoute = async ({ params, site }) => {
  const locale = params.locale as Locale;
  if (!site) return new Response(null, { status: 404 });
  const posts = (await getCollection('posts')).filter((item) => item.data.locale === locale);
  const items = posts.map(({ data }) => {
    const url = xml(new URL(entryPath(data, 'posts'), site).href);
    return `<item><title>${xml(data.title)}</title><description>${xml(data.summary)}</description><link>${url}</link><guid>${url}</guid><pubDate>${new Date(`${data.publishedAt}T00:00:00Z`).toUTCString()}</pubDate></item>`;
  }).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(settings.name)} — ${text[locale].posts}</title><description>${xml(settings.intro[locale])}</description><link>${xml(new URL(`/${locale}/`, site).href)}</link><language>${locale}</language>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
