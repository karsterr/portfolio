import { readFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const requiredVersion = readFileSync(new URL('../.node-version', import.meta.url), 'utf8').trim();

export function supportsVersion(version, required = requiredVersion) {
  const parse = (value) => /^v?(\d+)\.(\d+)\.(\d+)$/.exec(value)?.slice(1).map(Number);
  const actual = parse(version);
  const minimum = parse(required);
  if (!actual || !minimum || actual[0] !== minimum[0]) return false;
  return actual[1] > minimum[1] || (actual[1] === minimum[1] && actual[2] >= minimum[2]);
}

function findInstalledNode(required) {
  const result = spawnSync('mise', ['where', `node@${required}`], { encoding: 'utf8' });
  if (result.status !== 0) return undefined;
  const executable = path.join(result.stdout.trim(), 'bin', process.platform === 'win32' ? 'node.exe' : 'node');
  const probe = spawnSync(executable, ['--version'], { encoding: 'utf8' });
  return probe.status === 0 ? { executable, version: probe.stdout.trim() } : undefined;
}

export function selectRuntime({
  version = process.versions.node,
  executable = process.execPath,
  required = requiredVersion,
  findInstalled = findInstalledNode,
} = {}) {
  if (supportsVersion(version, required)) return executable;
  const installed = findInstalled(required);
  if (installed && supportsVersion(installed.version, required)) return installed.executable;
  throw new Error(
    `Bu proje Node ${required} veya daha yeni ${required.split('.')[0]}.x kullanır. ` +
    `Aktif sürüm: ${version}.\n` +
    `Bir kez çalıştırın: mise install node@${required}\n` +
    `Ardından aynı npm komutunu tekrarlayın. Alternatif: uygun Node sürümünü PATH üzerinde etkinleştirin.`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (!process.argv[2]) throw new Error('Kullanım: node scripts/runtime.mjs <script veya Node seçenekleri>');
    const executable = selectRuntime();
    const child = spawn(executable, process.argv.slice(2), {
      stdio: 'inherit',
      env: {
        ...process.env,
        PATH: [path.dirname(executable), process.env.PATH].filter(Boolean).join(path.delimiter),
        npm_node_execpath: executable,
      },
    });
    for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
    child.on('error', (error) => { console.error(`Proje Node süreci başlatılamadı: ${error.message}`); process.exitCode = 1; });
    child.on('exit', (code, signal) => { process.exitCode = code ?? (signal === 'SIGINT' ? 130 : 1); });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
