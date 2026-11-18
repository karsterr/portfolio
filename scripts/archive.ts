import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

execFileSync(process.execPath, ['scripts/check-public.ts'], { stdio: 'inherit' });
const archives = [
  { filename: 'dist/portfolio-public.tar.gz', args: ['-C', 'dist/public', '.'] },
  { filename: 'dist/portfolio-runtime.tar.gz', args: ['compose.yaml', 'ops', '.env.example'] },
];
for (const archive of archives) {
  execFileSync('tar', ['-czf', archive.filename, ...archive.args], { stdio: 'inherit' });
  const hash = createHash('sha256').update(await readFile(archive.filename)).digest('hex');
  await writeFile(`${archive.filename}.sha256`, `${hash}  ${path.basename(archive.filename)}\n`);
  console.log(`Manuel aktarım paketi: ${archive.filename}`);
}
