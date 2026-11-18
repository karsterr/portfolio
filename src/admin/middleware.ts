import { defineMiddleware } from 'astro:middleware';
import { getSecret } from 'astro:env/server';

export const onRequest = defineMiddleware(async (context, next) => {
  const headers = {
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
  };
  const respond = (message: string, status: number) => new Response(message, { status, headers });
  if (!import.meta.env.DEV) {
    const configured = import.meta.env.PUBLIC_CONTENT_REPO &&
      import.meta.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG &&
      getSecret('KEYSTATIC_GITHUB_CLIENT_ID') && getSecret('KEYSTATIC_GITHUB_CLIENT_SECRET') &&
      (getSecret('KEYSTATIC_SECRET')?.length ?? 0) >= 32;
    if (!configured) return respond('Yönetim yapılandırılmadı. GitHub/VPN kurulumunu tamamlayın.', 503);
  }
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(context.request.method) &&
      context.request.headers.get('origin') !== context.url.origin)
    return respond('Origin doğrulanamadı.', 403);
  const response = await next();
  for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
  return response;
});
