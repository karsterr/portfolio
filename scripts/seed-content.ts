import { cp, mkdir, access } from 'node:fs/promises';

try {
  await access('.local/content');
  console.error('.local/content zaten var; mevcut içerik üzerine yazılmadı.');
  process.exitCode = 1;
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  await mkdir('.local', { recursive: true });
  await cp('examples/content', '.local/content', { recursive: true, errorOnExist: true, force: false });
  for (const kind of ['projects', 'posts', 'guides', 'experience', 'media'])
    await mkdir(`.local/content/${kind}`, { recursive: true });
  console.log('Sentetik örnekler .local/content dizinine kopyalandı. Bu dizin Git dışında.');
}
