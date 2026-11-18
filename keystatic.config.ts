import { collection, config, fields, singleton } from '@keystatic/core';

const local = import.meta.env.DEV && import.meta.env.PUBLIC_CMS_STORAGE === 'local';
const repo = import.meta.env.PUBLIC_CONTENT_REPO || 'unconfigured/portfolio-content';
if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) throw new Error('PUBLIC_CONTENT_REPO owner/repo biçiminde olmalı.');
const [owner, name] = repo.split('/') as [string, string];
const base = 'content';
const requiredText = (label: string) => fields.text({ label, validation: { isRequired: true } });
const localized = (label: string) => fields.object({ tr: requiredText('Türkçe'), en: requiredText('English') }, { label });

function documents(label: string, kind: string) {
  return collection({
    label,
    slugField: 'id',
    path: `${base}/${kind}/*`,
    format: { contentField: 'body' },
    schema: {
      schemaVersion: fields.integer({ label: 'Şema sürümü', defaultValue: 1, validation: { min: 1, max: 1 } }),
      id: fields.slug({ name: { label: 'Kalıcı kimlik (ör. sistem-notlari-tr)' } }),
      slug: requiredText('URL kısa adı'),
      locale: fields.select({ label: 'Dil', options: [{ label: 'Türkçe', value: 'tr' }, { label: 'English', value: 'en' }], defaultValue: 'tr' }),
      translationGroupId: requiredText('Çeviri grubu (iki dilde aynı)'),
      title: requiredText('Başlık'),
      summary: fields.text({ label: 'Özet', multiline: true, validation: { isRequired: true } }),
      status: fields.select({ label: 'Yayın durumu', options: [{ label: 'Taslak', value: 'draft' }, { label: 'Yayımlanmış', value: 'published' }, { label: 'Arşiv', value: 'archived' }], defaultValue: 'draft' }),
      publishedAt: fields.date({ label: 'Yayın tarihi (UTC)' }),
      cover: fields.image({ label: 'Kapak (PNG, JPG, WebP, AVIF)', directory: `${base}/media`, publicPath: '/media/' }),
      technologies: fields.array(requiredText('Teknoloji'), { label: 'Teknolojiler', itemLabel: (item) => item.value }),
      origin: fields.select({ label: 'Kaynak', options: [{ label: 'Kişisel', value: 'personal' }, { label: 'Babintech', value: 'babintech' }], defaultValue: 'personal' }),
      publicationApproved: fields.checkbox({ label: 'Babintech yayın izni doğrulandı', defaultValue: false }),
      role: fields.text({ label: 'Rol' }),
      organization: fields.text({ label: 'Kurum' }),
      period: fields.text({ label: 'Dönem' }),
      ...(kind === 'experience' ? { sortOrder: fields.integer({ label: 'Sıralama (küçük değer önce)', validation: { min: 0, max: 999 } }) } : {}),
      repositoryUrl: fields.url({ label: 'Kod bağlantısı (HTTPS)' }),
      demoUrl: fields.url({ label: 'Demo bağlantısı (HTTPS)' }),
      body: fields.markdoc({ label: 'İçerik', options: { image: { directory: `${base}/media`, publicPath: '/media/' } } }),
    },
  });
}

export default config({
  storage: local ? { kind: 'local' } : { kind: 'github', repo: { owner, name } },
  ui: { brand: { name: 'Portfolio / İçerik' } },
  collections: {
    projects: documents('Projeler / Projects', 'projects'),
    posts: documents('Yazılar / Articles', 'posts'),
    guides: documents('Rehberler / Guides', 'guides'),
    experience: documents('Deneyim / Experience', 'experience'),
  },
  singletons: {
    settings: singleton({
      label: 'Site ayarları / Settings',
      path: `${base}/settings`,
      format: { data: 'json' },
      schema: {
        schemaVersion: fields.integer({ label: 'Şema sürümü', defaultValue: 1 }),
        name: requiredText('İsim'),
        title: localized('Profesyonel unvan'),
        intro: localized('Giriş metni'),
        about: localized('Hakkında'),
        profile: fields.conditional(fields.checkbox({ label: 'Ayrıntılı profil alanını göster', defaultValue: false }), {
          true: fields.object({
            location: localized('Konum ve çalışma biçimi'),
            personalNote: localized('Kişisel not'),
            education: fields.object({
              institution: requiredText('Üniversite'), degree: localized('Bölüm / derece'),
              period: requiredText('Dönem'), grade: fields.text({ label: 'Not ortalaması' }),
            }, { label: 'Eğitim' }),
            skillGroups: fields.array(fields.object({ label: localized('Grup'), skills: fields.array(requiredText('Yetkinlik'), { label: 'Yetkinlikler', itemLabel: (item) => item.value }) }), { label: 'Teknik yetkinlik grupları', itemLabel: (item) => item.fields.label.fields.tr.value }),
            languages: localized('Diller'),
            email: requiredText('İletişim e-postası'),
            freelanceAvailable: fields.checkbox({ label: 'Freelance çalışmaya açık', defaultValue: false }),
            freelanceSince: fields.date({ label: 'Freelance başlangıcı' }),
            upworkUrl: fields.url({ label: 'Upwork profil bağlantısı (opsiyonel)' }),
          }),
          false: fields.empty(),
        }),
        featuredProjectIds: fields.array(requiredText('Yayımlanmış proje kimliği'), { label: 'Öne çıkan projeler', itemLabel: (item) => item.value }),
        links: fields.array(fields.object({ label: requiredText('Etiket'), url: fields.url({ label: 'HTTPS / mailto URL', validation: { isRequired: true } }) }), { label: 'İletişim ve sosyal bağlantılar', itemLabel: (item) => item.fields.label.value }),
      },
    }),
  },
});
