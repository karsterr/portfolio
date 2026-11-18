import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import assert from 'node:assert/strict';

const listener = createServer();
listener.listen(0, '127.0.0.1');
await once(listener, 'listening');
const address = listener.address();
assert(address && typeof address !== 'string');
const port = address.port;
await new Promise<void>((resolve) => listener.close(() => resolve()));
const environment = { ...process.env, HOST: '127.0.0.1', PORT: String(port) };
for (const key of ['KEYSTATIC_GITHUB_CLIENT_ID', 'KEYSTATIC_GITHUB_CLIENT_SECRET', 'KEYSTATIC_SECRET']) delete environment[key as keyof typeof environment];
const child = spawn(process.execPath, ['dist/admin/server/entry.mjs'], { env: environment, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '';
child.stdout.on('data', (chunk) => { logs += String(chunk); });
child.stderr.on('data', (chunk) => { logs += String(chunk); });
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error(`Admin erken kapandı: ${logs}`);
    try { await fetch(`http://127.0.0.1:${port}/`); ready = true; break; }
    catch { await new Promise((resolve) => setTimeout(resolve, 100)); }
  }
  assert(ready, 'Admin zamanında başlamadı.');
  for (const route of ['/', '/keystatic/', '/api/keystatic/github/login']) {
    const response = await fetch(`http://127.0.0.1:${port}${route}`);
    assert.equal(response.status, 503, route);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
  }
  console.log('Üretim admin smoke testi geçti: sırlar olmadan rotalar 503 / no-store / noindex.');
} finally {
  child.kill('SIGTERM');
  await once(child, 'exit');
}
