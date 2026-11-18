import './env.ts';

process.env.NODE_ENV = 'production';

const missing = ['KEYSTATIC_GITHUB_CLIENT_ID', 'KEYSTATIC_GITHUB_CLIENT_SECRET', 'KEYSTATIC_SECRET']
  .filter((key) => !process.env[key]);
if (missing.length || (process.env.KEYSTATIC_SECRET?.length ?? 0) < 32) {
  console.error('Admin başlatılmadı: GitHub runtime sırları eksik veya oturum sırrı 32 karakterden kısa. README dosyasını izleyin.');
  process.exitCode = 1;
} else {
  process.env.HOST ??= '127.0.0.1';
  process.env.PORT ??= '4322';
  await import('../dist/admin/server/entry.mjs');
}
