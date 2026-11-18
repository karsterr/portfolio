import { z } from 'zod';

export const locales = ['tr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const kinds = ['projects', 'posts', 'guides', 'experience'] as const;
export type Kind = (typeof kinds)[number];
export const sections: Record<Locale, Record<Kind, string>> = {
  tr: { projects: 'projeler', posts: 'yazilar', guides: 'rehberler', experience: 'deneyim' },
  en: { projects: 'projects', posts: 'articles', guides: 'guides', experience: 'experience' },
};

const identifier = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const safeUrl = z.string().refine((value) => {
  try { return ['https:', 'mailto:'].includes(new URL(value).protocol); }
  catch { return false; }
}, 'HTTPS veya mailto bağlantısı bekleniyor.');

export const documentSchema = z.object({
  schemaVersion: z.literal(1),
  id: identifier,
  slug: identifier,
  locale: z.enum(locales),
  translationGroupId: identifier,
  title: z.string().min(1).max(160),
  summary: z.string().min(1).max(400),
  status: z.enum(['draft', 'published', 'archived']),
  publishedAt: z.iso.date().optional(),
  cover: z.string().optional(),
  technologies: z.array(z.string().min(1).max(60)).max(20).default([]),
  origin: z.enum(['personal', 'babintech']).default('personal'),
  publicationApproved: z.boolean().default(false),
  role: z.string().max(160).optional(),
  organization: z.string().max(160).optional(),
  period: z.string().max(80).optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
  repositoryUrl: safeUrl.optional(),
  demoUrl: safeUrl.optional(),
}).strict();

export type DocumentData = z.infer<typeof documentSchema>;
const localizedText = z.object({ tr: z.string().min(1), en: z.string().min(1) }).strict();
const upworkUrl = z.url().refine((value) => {
  const url = new URL(value);
  return url.protocol === 'https:' && ['upwork.com', 'www.upwork.com'].includes(url.hostname) && !url.username && !url.password;
}, 'Upwork profilinin HTTPS bağlantısını kullanın.');
export const profileSchema = z.object({
  location: localizedText,
  personalNote: localizedText,
  education: z.object({ institution: z.string().min(1).max(160), degree: localizedText, period: z.string().min(1).max(80), grade: z.string().max(60).default('') }).strict(),
  skillGroups: z.array(z.object({ label: localizedText, skills: z.array(z.string().min(1).max(60)).min(1).max(16) }).strict()).max(6),
  languages: localizedText,
  email: z.email(),
  freelanceAvailable: z.boolean(),
  freelanceSince: z.preprocess((value) => value === '' || value === null ? undefined : value, z.iso.date().optional()),
  upworkUrl: z.preprocess((value) => value === '' || value === null ? undefined : value, upworkUrl.optional()),
}).strict();
export const settingsSchema = z.object({
  schemaVersion: z.literal(1),
  name: z.string().min(1).max(100),
  title: localizedText,
  intro: localizedText,
  about: localizedText,
  profile: z.preprocess((value) => {
    // Keystatic conditional fields store { discriminant, value }; builds use the normalized profile.
    if (value && typeof value === 'object' && 'discriminant' in value) {
      if (value.discriminant === false) return undefined;
      if (value.discriminant === true && 'value' in value) return value.value;
    }
    return value;
  }, profileSchema.optional()),
  featuredProjectIds: z.array(identifier).max(8),
  links: z.array(z.object({ label: z.string().min(1).max(60), url: safeUrl }).strict()).max(10),
}).strict().superRefine((value, context) => {
  if (new Set(value.featuredProjectIds).size !== value.featuredProjectIds.length)
    context.addIssue({ code: 'custom', message: 'Featured kimlikleri tekil olmalı.' });
});

export function entryPath(data: Pick<DocumentData, 'locale' | 'slug'>, kind: Kind) {
  return `/${data.locale}/${sections[data.locale][kind]}/${data.slug}/`;
}
