import { makeHandler } from '@keystatic/astro/api';
import path from 'node:path';
import config from '../../../../../keystatic.config';

// Yerel tarama .local içinde başlar; üst deponun gitignore kuralları içeriği gizlemez.
// Böylece .local Git dışında kalırken CMS yalnızca bu dizini görür.
export const ALL = makeHandler({ config, localBaseDirectory: path.resolve('.local') });
export const prerender = false;
