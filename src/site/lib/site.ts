import { readFile } from 'node:fs/promises';
import { settingsSchema, type Locale, type Kind } from '../../shared/content';

export const settings = settingsSchema.parse(JSON.parse(await readFile('.generated/settings.json', 'utf8')));
export const text = {
  tr: {
    home: 'Ana sayfa', projects: 'Projeler', posts: 'Yazılar', guides: 'Rehberler', experience: 'Deneyim',
    about: 'Hakkımda', contact: 'İletişim', selected: 'Seçilmiş çalışmalar', read: 'İncele', back: 'Listeye dön',
    hello: 'Merhaba, ben', personalSide: 'Biraz da işin kişisel tarafı', education: 'Eğitim', skills: 'Kullandığım araçlar', languages: 'Diller', background: 'Eğitim ve yetkinlikler',
    experienceLink: 'Deneyimime göz at', available: 'Freelance projelere açığım', availabilitySince: 'Freelance başlangıcı',
    contactTitle: 'Birlikte bir şey geliştirelim.', contactIntro: 'Bir model deneyi, Python aracı ya da otomasyon fikrin mi var? Ne yapmak istediğini konuşabiliriz.',
    contactBrief: 'İlk mesajında hedefini, mevcut durumu ve varsa zaman planını paylaşman yeterli.', emailAction: 'E-posta gönder', upworkAction: 'Upwork profilimi incele',
    portraitAlt: 'Efe Can Kara’nın portre fotoğrafı', grade: 'GNO',
    label: 'AI / ML & SİSTEM MÜHENDİSLİĞİ', hero: 'Fikirden, çalışan sisteme.',
    notebook: 'Teknik not defteri', all: 'Tümünü gör', skip: 'İçeriğe geç',
    empty: 'Bu bölüm için henüz yayımlanmış içerik yok.', code: 'Kaynak kod', demo: 'Canlı demo',
    otherLanguage: 'English', lang: 'en', footer: 'Düşün, geliştir, ölç.',
    themeLight: 'Açık temaya geç', themeDark: 'Karanlık temaya geç',
    motionPause: 'Animasyonları duraklat', motionResume: 'Animasyonları devam ettir', motionReduced: 'Sistem tercihi: azaltılmış hareket',
    loading: 'Portföy açılıyor', scrollDown: 'Çalışmaları keşfet', backToTop: 'Yukarı dön', focusAreas: 'Mühendislik odağı',
    sectionInfo: { projects: 'Problemler, tasarım kararları ve sonuçları.', posts: 'Mühendislik kararlarına yakından bir bakış.', guides: 'Uygulanabilir adımlarla, derinlemesine öğrenme.', experience: 'Birlikte ürettiğim işler ve üstlendiğim roller.' },
  },
  en: {
    home: 'Home', projects: 'Projects', posts: 'Articles', guides: 'Guides', experience: 'Experience',
    about: 'About', contact: 'Contact', selected: 'Selected work', read: 'Explore', back: 'Back to list',
    hello: 'Hi, I’m', personalSide: 'A little beyond the job title', education: 'Education', skills: 'Tools I work with', languages: 'Languages', background: 'Education & skills',
    experienceLink: 'Explore my experience', available: 'Open to freelance projects', availabilitySince: 'Freelancing since',
    contactTitle: 'Let’s build something together.', contactIntro: 'Have a model experiment, a Python tool, or an automation idea in mind? Let’s talk about what you want to build.',
    contactBrief: 'Tell me about your goal, where things stand, and any timeline you have in mind.', emailAction: 'Send an email', upworkAction: 'View my Upwork profile',
    portraitAlt: 'Portrait of Efe Can Kara', grade: 'GPA',
    label: 'AI / ML & SYSTEMS ENGINEERING', hero: 'From idea to working system.',
    notebook: 'Engineering notebook', all: 'View all', skip: 'Skip to content',
    empty: 'There is no published content in this section yet.', code: 'Source code', demo: 'Live demo',
    otherLanguage: 'Türkçe', lang: 'tr', footer: 'Think, build, measure.',
    themeLight: 'Switch to light theme', themeDark: 'Switch to dark theme',
    motionPause: 'Pause animations', motionResume: 'Resume animations', motionReduced: 'System preference: reduced motion',
    loading: 'Opening portfolio', scrollDown: 'Explore the work', backToTop: 'Back to top', focusAreas: 'Engineering focus',
    sectionInfo: { projects: 'Problems, design decisions, and outcomes.', posts: 'A closer look at engineering decisions.', guides: 'Practical steps for deeper understanding.', experience: 'The work I have contributed to and the roles I have held.' },
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const kindLabel = (locale: Locale, kind: Kind) => text[locale][kind];
