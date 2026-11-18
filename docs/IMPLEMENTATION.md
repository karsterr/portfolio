# Yerel uygulama ve doğrulama durumu

Tarih: 16 Kasım 2026. Commit/push ve public dağıtım yapılmadı.

## Onaylı kapsam ve kullanıcı kararları

- İlk onay Faz 0–1 içindi. Kullanıcı daha sonra çalışan siteyi hazırlamamızı, Pi'ye elle kendisinin yükleyip test edeceğini belirtti. Yerel sayfa ve panel uygulaması bu kapsamda ilerletildi.
- İlk sürüm Türkçe ve İngilizce. URL'ler `/tr/projeler/`, `/tr/yazilar/`, `/tr/rehberler/`, `/tr/deneyim/` ile İngilizce karşılıklarını içerir.
- GitHub içerik deposu/App kurulumu ertelendi. Harici hesapta oluşturma/yazma veya GitHub MCP kullanımı yok.
- SSH bağlantısı yapılmadı. Pi OS, disk, ağ/CGNAT, alan adı, yedek sağlayıcısı ve gerçek Babintech yayın izinleri bilinmiyor. Bunların sahibi kullanıcı; public yayın öncesi kendi doğrulama adımlarında tamamlanacaklar.
- Yerel teslim için statik Astro + ayrı Keystatic seçildi. GitHub bağımlılığı public istek yolunda bulunmuyor; içerik düzenleme şu anda local storage üzerinden çalışıyor.

## Uygulananlar

- Astro 7.4.12, TypeScript 6.0.3, Tailwind 4.3.5, Keystatic core 0.6.9 / Astro paketi 6.0.0, Node adapter 11.1.13; tam sürümler `package-lock.json` dosyasında.
- Node 24.22.3 gereksinimi `.node-version` ve `engines` ile kayıtlı. İlk testler geçici `/tmp/portfolio-node24` araç zinciriyle yapılmıştı. Kullanıcı normal npm komutunda Node 22 hatasını bildirdikten sonra kalıcı Node 24.22.3 mevcut mise kullanıcı dizinine kuruldu; `scripts/runtime.mjs` tüm npm görevlerini uygun runtime'a yönlendirir. Sistem Node 22.23.1 ve global mise yapılandırması değiştirilmedi. Docker'da zaten uyumlu Node bulunduğundan mise gerekmez.
- Public statik ve admin Node hedefleri ayrı kaynak/çıktı dizinlerinde. Admin'in büyük JS paketleri public çıktıda yok. Astro'nun kullanılmayan filesystem session desteği kapalı; Keystatic kendi oturum akışını kullanır.
- Proje, yazı, rehber, deneyim listeleri/detayları; iki dilli ana sayfa, hakkında alanı, dil geçişi ve 404. Sağlanan TR/EN CV'lerinden SME Solutions, Kılıç Holding, Arch of Sigma ve bağımsız Babintech ekip rolü aktarıldı. Kullanıcı beyanıyla 16 Kasım 2026 başlangıçlı Upwork freelance kaydı eklendi; toplam 10 yayımlanmış deneyim kaydı var. Platform işi/puanı veya yeni unvan türetilmedi.
- Ana sayfada fotoğraflı Hakkımda projelerden önce gelir; eğitim/yetkinlik/diller ve daha kişisel Linux/Raspberry Pi notu vardır. İletişimde CV'deki e-posta, GitHub/LinkedIn ve kullanıcının verdiği Upwork bağlantısı kullanılır. Form/veritabanı veya harici entegrasyon yok.
- Profil alanları Keystatic'te isteğe bağlı koşullu alan olarak yönetilir; build şeması normalize eder, eski ayarlar geçerlidir. Deneyim sırası `sortOrder` ile açıkça belirlenir; bilinmeyen başlangıç ay/günleri üretilmedi. Astro glob kimliği frontmatter `id` alanına bağlıdır; aynı slug iki dilde de güvenle kullanılabilir.
- Fotoğraf özgün dosya korunarak `src/assets/profile/` altına taşındı. Astro Image 240/400 px, EXIF'siz WebP üretir; en/boy sabittir ve lazy loading kullanılır. Özgün DOCX dosyaları `design/references/cv/` altında, Git/Docker/public dışında tutulur; CV'deki telefon sitede gösterilmez.
- Yerel panelde koleksiyon düzenleme, site metinleri/bağlantıları ve featured proje listesi. Örnekler kişisel başarı/çalışma iddiası değildir.
- Ortak şemalar, yayın filtresi, tarih/Babintech izni/featured ilişki kontrolü; kısıtlı Markdoc; yalnızca kullanılan raster medya ve EXIF temizliği. Gelecek tarihli yayın ilk sürümde reddedilir.
- `.local` Git dışında. Keystatic'in resmi `makePage`/`makeHandler` girişleriyle yerel API kökü `.local` olarak sınırlandı. Hazır entegrasyonun depo kökünü taraması ve `.gitignore` nedeniyle içeriği saklaması böyle giderildi; vendor dosyaları değiştirilmedi.
- Üretim admin'i GitHub moduna sabit; eksik yapılandırmada 503/no-store/noindex. Başlatıcı eksik sırlarla başlamaz ve `NODE_ENV=production` ayarlar. GitHub/VPN gerçek akışı henüz test edilmedi.
- Alan adı verilirse canonical/hreflang, sitemap ve iki dilde RSS. Alan adı yokken bilerek noindex/robots engeli var.
- Kullanıcının paletiyle Charcoal / Mid Grey nötr yüzeyler, Star Dust metinler, Foggy detaylar ve sınırlı Japanese Indigo / Steel Teal vurguları uygulandı; açık tema da aynı paleti kullanır. Karanlık varsayılandır. Küçük, aynı-origin head script'i ilk boyamadan önce saklanan tema tercihini uygular; depolama kapalıyken arayüz yine çalışır.
- Kök giriş, birincil tarayıcı dili `tr`/`tr-*` ise Türkçe, diğer dillerde İngilizce açılır; manuel dil seçimi saklanır, içerik URL'sinin dili değiştirilmez. Query/hash korunur. JS kapalıysa kök sayfa kullanılabilir İngilizce içerik sunar. Ayrı dil seçim ekranı kaldırıldı.
- Dört özgün logo PNG'si değiştirilmeden `src/assets/brand/originals/` altına taşındı. Küçük boyutta temiz görünüm için temaya uyan SVG sembol/yazı logosu hazırlandı; başlık, giriş ve altbilgide kullanılır. Build, SVG favicon, 180 px Apple Touch ikonu ve özgün banner'dan 1200×400 WebP üretir. `referans.png` yalnızca `design/references/` altında yerel inceleme içindir; Git/Docker/public girdisi değildir.
- Astro ClientRouter / View Transitions, Lenis 1.3.27 ile masaüstü kaydırma, SVG dalga arka planı, kaydırma girişleri, ilerleme çizgisi, yukarı dönme ve ilk sekme ziyaretinde 850 ms giriş animasyonu var. Dokunmatik kaydırma native kalır; sekme arka planda olduğunda sürekli hareket durur. Manuel duraklatma ve sistemin reduced-motion tercihi desteklenir; JS kapalıyken içerik görünür ve dalgalar sabittir.
- CSP yalnızca aynı-origin script/fetch kullanımına açıldı; inline script, eval ve üçüncü taraf script izni eklenmedi. Public JS/CSS bütçesi kontrolü ve taslak/sır sızıntı kontrolü build sırasında devam eder.
- Public Caddy ve isteğe bağlı admin Compose profili; ayrı ağlar, loopback varsayılanları, non-root, read-only, düşürülmüş capability, bellek/PID sınırları ve log rotasyonu.
- Docker temel image'ları multiarch digest ile sabitli. Manuel aktarım için public/runtime tar arşivleri ve SHA-256 dosyaları üreten `npm run archive` komutu var. İmzalı otomatik dağıtımın yerine geçtiği iddia edilmiyor.

## Doğrulanan sonuçlar

Geliştirme host'u Fedora 45 / x86_64, npm 10.9.8, Docker 29.9.3, Compose 5.7.1. Bu ortam Raspberry Pi değildir.

| Kontrol | Sonuç / kapsam |
| --- | --- |
| İçerik testleri | 10/10; iki dil, draft/archive, tarih/izin, featured, kimlik/URL tekilliği, güvenli render, symlink, opsiyonel CMS alanları ve iç içe medya/EXIF |
| Runtime testleri | 3/3; sürüm sınırları, mise fallback, eksik runtime mesajı, alt süreç PATH/argümanları ve çıkış kodu aktarımı. Sistem Node 22.23.1 açıkken normal npm komutuyla Node 24.22.3 seçildi |
| Marka varlıkları testi | 1/1; yalnızca üç optimize çıktı, doğru ikon/banner boyutları, EXIF yok, WebP <100 KiB, favicon'da script veya referans yok |
| Profil şeması testleri | 2/2; CMS aç/kapat biçimi, normalize edilmiş veri, eski ayarlar, temizlenen opsiyonel alanlar, e-posta/tarih doğrulaması ve Upwork URL sınırı |
| Tip kontrolleri | Public ve admin için 0 hata, 0 uyarı; admin ayrı tsconfig ile public content türlerini sıfırlamadan kontrol edilir |
| Public build | 28 HTML sayfa; alan adı yokken toplam 42 çıktı dosyası. Tema/geçiş/kaydırma JS'i gzip yaklaşık 12,5 KiB; CSS gzip yaklaşık 6,7 KiB. 40/30 KiB bütçelerinin altında |
| Üretim SEO denemesi | Örnek `https://portfolio.example.com` ile build; canonical/hreflang, allow robots, sitemap ve iki RSS dosyası doğrulandı. Test alan adı teslim çıktısında bırakılmadı |
| Tarayıcı testleri | Chromium 157: 16/16 başarılı; tüm sayfa/linkler ve yerel script sınırı, iki tema/mobil/klavye, JS kapalı gezinme, ilk boyama/tema kalıcılığı/gerçek client navigation, azaltılmış hareket/duraklatma, engellenmiş depolama, kaydırma/yukarı dönüş/dokunmatik ve üç CMS testi. TR/TR-TR/EN/DE birincil dil, manuel dil kalıcılığı ve doğrudan içerik URL'si, depolamasız kök giriş, logo/favicon, referans/CV dışlama; yeni bölüm sırası, WebP portre/EXIF, iletişim URL'leri, iki dilde deneyim sırası/detayları ve CMS profil kaydı doğrulandı. Gerçek Caddy CSP hedefinde geçti |
| Erişilebilirlik | İki temada yedişer temsilî sayfada axe WCAG A/AA kuralları: sıfır ihlal; kontrast gerçek kaydırma girişlerinin bitmesi beklendikten sonra kontrol edilir. 320 px taşma, skip link, hareket durdurma ve reduced-motion kontrolü geçti. Tam WCAG sertifikası veya ekran okuyucu incelemesi değildir |
| Public sızıntı sınırı | Benzersiz taslak metinleri, taslak URL'si/görseli, CMS rotaları, kaynak dosyalar ve sır isimleri public artifact kontrolünde yok. Referans/palet dosyaları ve özgün PNG'ler yayınlanmaz. Yalnızca derlenmiş `_astro` JS dosyaları ve dış src'li script etiketleri kabul edilir |
| Üretim admin smoke | Sırlar kaldırıldığında `/`, `/keystatic/`, `/api/keystatic/github/login` 503, no-store ve noindex |
| Docker | İki image x86_64 üzerinde derlendi. Caddy config valid; public servis tek kullanımlık konteynerde port yayımlamadan, non-root/read-only ayarlarıyla `/tr/` ve özel health endpoint sundu |
| Bağımlılık taraması | `minimatch` 11.0.1 override sonrası npm audit: 0 açık; kilit dosyası temiz kurulumla Docker build'inde kullanıldı |
| Git koruması | `.env`, `.local` ve `.generated` ignore kontrolü geçti; commit/push yok |

Bilinen build uyarısı: özel CMS bundle'ında 500 kB üstü chunk. Bu paket public sitede JS yükü oluşturmaz. Lighthouse skoru, saha Core Web Vitals, gerçek Pi bellek tüketimi ve sertifika edinimi ölçülmüş gibi raporlanmaz.

## Sonraya bırakılanlar

1. Kullanıcının Pi'de ARM64/native paket, RAM/sıcaklık/SSD, HTTP ve gerçek dış HTTPS testleri. [README](../README.md) komutları içerir.
2. Özel GitHub içerik deposu/App izinleri, OAuth/VPN, yetkisiz gerçek kullanıcı, süre sonu/iptal ve upload senaryoları. Üretim admin kabulü bu testler geçene kadar açık.
3. GitHub proje metadata senkronizasyonu. Mevcut sitede API üzerinden yıldız/fork veya otomatik keşif gösterilmiyor.
4. İmzalı CI, otomatik pull/atomik etkinleştirme, bağımsız şifreli yedek/restore otomasyonu ve dış izleme. Şimdiki akış, kullanıcının SSH ile taşıdığı manuel sürüm dizinleri ve açık geri dönüş adımlarıdır.
5. Gerçek içerikler, profesyonel yayın izinleri, ayrıntılı SEO/JSON-LD, yönlendirme yönetimi ve istenirse çok bölümlü rehber modeli. Şu an rehber tek Markdoc belgesi olarak çalışır.
6. LinkedIn yalnızca manuel veri/bağlantı yaklaşımında kalır; API entegrasyonu veya scraping yok.

M0'ın donanım/ağ envanteri ve M1'in gerçek üretim kimlik/ARM64 kabulü tamamlandı diye işaretlenmedi. Yerelde çalışan teslim, üretime hazır ve tüm yol haritası tamamlanmış teslim anlamına gelmez.
