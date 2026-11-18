import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { settingsSchema } from '../src/shared/content.ts';

const text = { tr: 'Örnek', en: 'Example' };
const profile = {
  location: text, personalNote: text,
  education: { institution: 'Example University', degree: text, period: '2022–2026', grade: '' },
  skillGroups: [{ label: text, skills: ['Python'] }], languages: text,
  email: 'person@example.com', freelanceAvailable: true, freelanceSince: '2026-11-16',
  upworkUrl: 'https://www.upwork.com/freelancers/example',
};
const base = JSON.parse(await readFile('examples/content/settings.json', 'utf8'));

test('CMS profil aç/kapat biçimi normalize edilir; eski ayarlar geçerlidir', () => {
  assert.equal(settingsSchema.parse(base).profile, undefined);
  const normalized = settingsSchema.parse({ ...base, profile: { discriminant: true, value: profile } });
  assert.equal(normalized.profile?.email, profile.email);
  assert.deepEqual(settingsSchema.parse(normalized), normalized);
  assert.equal(settingsSchema.parse({ ...base, profile: { discriminant: false, value: null } }).profile, undefined);
  const cleared = settingsSchema.parse({ ...base, profile: { ...profile, upworkUrl: null, freelanceSince: '' } });
  assert.equal(cleared.profile?.upworkUrl, undefined);
  assert.equal(cleared.profile?.freelanceSince, undefined);
  assert.equal(settingsSchema.parse({ ...base, profile: { ...profile, education: { ...profile.education, grade: undefined } } }).profile?.education.grade, '');
});

test('profil iletişim alanları geçersiz adres ve sahte Upwork alan adlarını reddeder', () => {
  for (const url of ['http://www.upwork.com/freelancers/example', 'https://upwork.com.example.org/', 'https://user:secret@www.upwork.com/', 'javascript:alert(1)'])
    assert.throws(() => settingsSchema.parse({ ...base, profile: { ...profile, upworkUrl: url } }));
  assert.throws(() => settingsSchema.parse({ ...base, profile: { ...profile, email: 'person@example.com?subject=x' } }));
  assert.throws(() => settingsSchema.parse({ ...base, profile: { ...profile, freelanceSince: '2026-02-30' } }));
});
