import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { locales, kinds, sections, entryPath } from '../../shared/content';

export const GET: APIRoute = async ({ site }) => {
  const paths = locales.flatMap((locale) => [`/${locale}/`, ...kinds.map((kind) => `/${locale}/${sections[locale][kind]}/`)]);
  for (const kind of kinds) for (const item of await getCollection(kind)) paths.push(entryPath(item.data, kind));
  const urls = site ? paths.map((item) => `<url><loc>${new URL(item, site).href.replace(/&/g, '&amp;')}</loc></url>`).join('') : '';
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
