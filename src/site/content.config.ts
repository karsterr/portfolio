import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { documentSchema } from '../shared/content';

const collection = (kind: string) => defineCollection({
  // Frontmatter slugs may match across languages; the validated content ID is globally unique.
  loader: glob({ base: `./.generated/content/${kind}`, pattern: '**/*.mdoc', generateId: ({ data }) => String(data.id) }),
  schema: documentSchema,
});
export const collections = {
  projects: collection('projects'),
  posts: collection('posts'),
  guides: collection('guides'),
  experience: collection('experience'),
};
