import './env.ts';
import { prepareContent } from './content-pipeline.ts';
import { prepareBrand } from './brand.ts';

try {
  const result = await prepareContent(process.env.CONTENT_DIR || '.local/content', '.generated');
  await prepareBrand('.generated/public/brand');
  console.log(`Public build girdisi: ${result.count} içerik, ${result.mediaCount} medya.`);
} catch (error) {
  console.error('İçerik hazırlanamadı. İlk kurulum: npm run setup:example.');
  console.error(error instanceof Error ? error.message : 'Bilinmeyen içerik hatası.');
  process.exitCode = 1;
}
