# Uygulama yol haritası

Tarih: 16 Kasım 2026 · Durum: **Faz 0–1 onaylı; yerel site ve manuel teslim geliştirildi.**

Bu plan [mimari önerinin](ARCHITECTURE.md) A seçeneğini, yani statik Astro + özel Keystatic/GitHub yönetimini esas alır. İlk hazırlandığında depoda yalnızca lisans vardı. Sonraki onay ve kullanıcı yönlendirmesiyle iki dilli site, yerel CMS, kontroller ve Docker teslim dosyaları eklendi. Güncel sonuçlar [uygulama durumunda](IMPLEMENTATION.md); aşağıdaki fazlar kabul tanımlarıdır, topluca tamamlandı anlamına gelmez.

## 1. İlerleme ve onay sınırları

- **İlk adımda tamamlanan:** depo incelemesi, mimari karşılaştırma, içerik/güvenlik/operasyon tasarımı ve yol haritası.
- **Verilen onay:** Faz 0–1. Kullanıcı daha sonra çalışan Türkçe/İngilizce yerel site ve manuel Pi teslimi istedi; Pi'ye bağlantı yapılmayacak, GitHub kurulumu ertelenecek. Yerel sayfa ve panel işi bu yönlendirmeyle ilerletildi.
- Sonraki fazların kapsamı onayda açıkça genişletilebilir. Onaylanmış kapsam içinde rutin adımlar için tekrar izin istenmez; dış hesap/depo, ücretli hizmet, üretim sırları ve public yayın yetkisi kapsamda açık olmalıdır.
- Commit/push veya dağıtım için mevcut istekte yetki yoktur. Faz 5'te public yayına geçiş, test edilmiş somut aday sürüm ve geri dönüş planı üzerinden ayrıca onaylanır.

Süreler tek geliştiricinin yaklaşık aktif iş günleridir; içerik hazırlığı, donanım/alan adı temini, üçüncü taraf onayları ve bekleme hariçtir. Takvim taahhüdü değildir. Faz 0–5 için toplam yaklaşık **13–19 iş günü**, Faz 1 sonuçlarından sonra yeniden tahmin edilir.

## 2. Fazlar ve kilometre taşları

### Faz 0 — Kararları ve ortamı doğrulama · 0,5–1 gün

İşler:

- Mimari A/B, GitHub bağımlılığı, özel içerik deposu ve VPN tercihini kullanıcıyla karara bağla.
- MVP bilgi mimarisini belirle: ana sayfa, projeler/liste-detay, yazılar/liste-detay, rehberler/liste-detay, hakkında/deneyim, iletişim bağlantısı ve 404.
- Dil, alan adı, başlangıç içerikleri, Babintech izinleri, CI ve yedek bütçesini kaydet.
- İzin verilen cihaz incelemesinde 64 bit OS, RAM, disk, SSD, güç/soğutma, upload, IPv4/IPv6, CGNAT ve router durumunu doğrula; sırları belgeye yazma.
- Doğrudan Caddy veya dışarı yönlü tünel yolunu seç; admin erişim ve kurtarma sorumlusunu belirle.

**M0 kabul:** doğrulanmış ortam envanteri ve kısa karar kaydı var; bilinmeyenler sahip/tarih ile kayıtlı. Alan adı veya donanım beklerken yerel geliştirme ilerleyebilir; public yayın bağımlılıkları açıkça işaretlenir.

Test/kanıt: inceleme çıktıları, gerekli ağ erişimi ölçümü ve yayın izni listesi. Bunlar henüz alınmış ölçümler değildir.

### Faz 1 — En riskli entegrasyonu kanıtlama · 2–3 gün

Bağımlılık: M0 ve uygulama onayı.

İşler:

- Desteklenen Astro/Node/TypeScript/Tailwind/Keystatic/Markdoc/Node adapter sürüm bileşimini seç; paket yöneticisini ve kilit dosyasını belirle.
- Ayrı public statik ve admin server hedefleriyle en küçük uçtan uca örneği kur. Admin'de geliştirme sunucusu kullanma.
- Onay kapsamındaysa özel içerik deposu ve yalnızca ona kurulu GitHub App üzerinden test girişini hazırla; geliştirmede local storage kullanımı üretim güvenliği kanıtı sayılmaz.
- Özel HTTPS/VPN callback, GitHub oturumu, yetkisiz erişim, medya kaydı ve tek bir içerik güncellemesini dene.
- Örnek içerik commit'inden Pi dışında statik arşiv üret; gerçek ARM64 Pi'de admin image'ını ve statik sunumu çalıştır. Sürüm uyumu, native paketler ve bellek kullanımını kaydet.
- Yayınlı örnek, benzersiz taslak metni ve taslak görseliyle public artifact sınırını kanıtla.

**M1 kabul:** yetkili kullanıcı post oluşturup düzenleyebiliyor; taslak yalnızca özel tarafta; public hedefte CMS rotası/JS'i ve sır yok. Repo yazma izni olmayan kullanıcı yönetim yapamıyor. GitHub App'in istenen izinleri ve oturum/CSRF davranışı kayıtlı. ARM64 üretim çalışması başarılı ve gerçek başlangıç tüketimi raporlanmış.

Test/kanıt: entegrasyon raporu, üretim build çıktısı incelemesi, taslak sızıntı testi ve erişim testi. Gerçek Pi yoksa M1'in donanım kabulü açık kalır; masaüstü başarısı onun yerine yazılmaz.

**Dur/yeniden değerlendir koşulu:** CMS/Astro uyumsuzluğu, özel callback'in çalışmaması veya izinlerin kabul edilenden geniş olması. Çözüm sürüm uyumu/alternatif Git CMS değerlendirmesidir; public admin veya kimlik doğrulamasız local moda geçilmez. B seçeneğine geçilecekse mimari ve kalan efor tahmini güncellenir.

### Faz 2 — İçerik sözleşmesi ve public site · 3–5 gün

Bağımlılık: M1'in yazılım kabulü.

İşler:

- Ortak şemalar ile Post, Guide, Project, Experience, Page, Media ve SiteSettings modellerini uygula; kalıcı kimlik ve şema sürümü kullan.
- Yayınlı içerik aktarımını, medya referanslarını, featured sıralamasını ve slug/redirect doğrulamasını kur.
- Gerçek bilgi hiyerarşisiyle responsive Astro bileşenlerini, tipografi ve kod bloklarını uygula; asıl içerik JavaScript'siz okunabilsin.
- Canonical/meta, paylaşım kartları, yapılandırılmış veri, sitemap, RSS ve 404/redirect davranışını ekle.
- En az bir kişisel proje, izinli bir Babintech örneği veya izin bekliyorsa sadece özel taslak, bir yazı, bir rehber ve deneyim kaydıyla akışı doğrula.

**M2 kabul:** bütün MVP sayfa türleri çalışıyor; kırık iç bağlantı/ilişki yok; filtrelenmemiş taslak hiçbir çıktı kanalında bulunmuyor. Featured seçimi yalnızca yayımlanmış projelerde çalışıyor. Klavye gezinmesi ve 320 px'den masaüstüne okunabilir düzen doğrulanmış. Public JS/CSS bütçeleri mimari hedeflerini karşılıyor veya gerekçeli istisna kaydı var.

Test/kanıt: şema ve yayın filtresi testleri, tam statik build, yerel bağlantı taraması, axe taraması, manuel klavye ve örnek ekran okuyucu incelemesi; ana sayfa/proje/yazı/rehber için sabit profilli performans raporu.

### Faz 3 — Editoryal akış ve GitHub senkronizasyonu · 2–3 gün

Bağımlılık: M2; örnek içerik üzerinden geliştirilebilir.

İşler:

- Panelde post/rehber/proje/sayfa oluşturma-düzenleme, featured ve site ayarlarını tamamla. Taslak → yayımlanmış → arşiv akışını belirginleştir; kaydetmenin canlı yayın garantisi olmadığını gösteren kullanım belgesini yaz.
- İlk sürümde gelecekte tarihli yayını reddet; takvimli yayın varmış gibi UI sunma. Taslak önizlemesi eklenirse yalnızca özel origin ve cache kapalı olsun.
- Public repo allowlist'iyle REST veya `gh api` senkronizasyonunu kur: ETag, sıralı sayfalama, limit/backoff, normalize snapshot, atomik yazma ve son geçerli veri.
- Üretilmiş metadata ile editoryal alanları ayır; bot diff sınırını ve özel repo/yeniden adlandırma durumlarını ele al.
- LinkedIn'i manuel içerik ve profil bağlantısı olarak bırak; izin verilmemiş API/scraping işi oluşturma.

**M3 kabul:** içerik ve ayarların tümü panelden yönetilebiliyor. Kaydetme, CI sonucu ve canlı sürüm kimliği takip edilebiliyor. Sync iki kez aynı veriyle çalışınca gereksiz commit/build üretmiyor; editoryal metinleri değiştirmiyor. API arızası mevcut siteyi bozmuyor. Public→private değişimi için bağlantı/metrik gizleme ve gecikme davranışı kanıtlı.

Test/kanıt: gerçek örnekle yönetim smoke testi; GitHub fixture'larıyla 200/304, çok sayfa, 403/429, 404, timeout, bozuk yanıt, repo adı/görünürlük değişimi ve alan sahipliği testleri. 401/403'ün her zaman “repo private oldu” anlamına gelmediği doğrulanır.

### Faz 4 — Tekrarlanabilir dağıtım ve kurtarma · 3–4 gün

Bağımlılık: M1 donanım kabulü, M2; sync entegrasyonu M3 sonrası tamamlanır.

İşler:

- Dockerfile/Compose, non-root/salt okunur ayarlar, ARM64 image'lar, healthcheck, log rotasyonu ve cgroup limitlerini hazırla.
- Seçilen DNS/HTTPS yolunu, özel Tailscale Serve erişimini, IPv4/IPv6 firewall ve ev ağı ayrımını uygula. Public Caddy ile özel HTTPS portlarının çakışmadığını doğrula.
- Güvenilen CI ile kod/içerik commit'ine bağlı arşiv, doğrulanabilir manifest ve sınırlı yetkili host pull-deploy timer'ı oluştur. CI imza/üretici güveni, arşiv güvenliği ve eski build yarışlarını test et.
- Ayrı release dizini, atomik etkinleştirme, asset geçiş penceresi, disk eşiği, son 3 başarılı release ve rollback komutunu kur.
- Bağımsız şifreli Git/medya/ayar/secret yedeklerini, saklama politikasını ve kurtarma rehberini hazırla. Sırlar CI loglarında veya public artifact'te bulunmasın.
- Hafif host kontrolü ve dış uptime/sertifika kontrolünü kur; uyarıların alıcısı/kanalı kullanıcı tarafından belirlenir. Mesaj gönderme entegrasyonu ayrıca yetkili kapsamda olmalıdır.

**M4 kabul:** temiz hedefte belgelerle kurulum tekrar edilebiliyor; yalnızca seçilen public ingress açık. Admin VPN dışında erişilemiyor. Başarısız build/indirme/imza kontrolü/asset kontrolü eski siteyi yerinde bırakıyor. Yanlış yayın ≤5 dakikada geri alınabiliyor. Yedek, ayrı boş hedefe geri yüklenerek RPO ≤24 saat ve hazır donanımda RTO ≤4 saat hedefleri ölçülmüş.

Test/kanıt: Compose/image kontrolleri, dış ağdan IPv4/IPv6 port ve rota testleri, geçersiz imza/arşiv/disk dolması denemesi, kesilen deploy, eski build yarışı, reboot, GitHub/VPN kesintisi ve geri yükleme tatbikatı. Güç kesintisi testi yalnızca kontrollü ve uygun donanımla yapılır; çalışma diskini bozarak test yapılmaz.

### Faz 5 — Yayın adayı ve kontrollü açılış · 2–3 gün

Bağımlılık: M0–M4 kabulü ve yayınlanabilir içerikler.

İşler:

- Yayın adayını dondur; onaylı Babintech içeriği, iletişim, gerçek tarihler ve linkleri gözden geçir.
- Mobil/masaüstü, klavye/ekran okuyucu, JS kapalı senaryo, SEO ve güvenlik kontrollerini tamamla.
- Pi üzerinde 24 saat gözlem: toplam RAM/disk/sıcaklık, restart, backup/sync/deploy eskiliği. Ayrı 10 dakikalık LAN yük denemesi: örneğin 20 eşzamanlı istemciyle temsili statik sayfalar; test koşulları rapora yazılır.
- HTTPS sertifika izleme, HSTS uygunluğu, kaldırılan içerik/asset ve cache davranışı ile operatör runbook'unu doğrula.
- Kullanıcıya aday sürüm, ölçüm raporu, kalan kusurlar, seçilen dış servisler/maliyetler ve rollback adımını sun; **public yayın onayını al**.

**M5 kabul / MVP tamam:** onaylı aday public HTTPS üzerinden erişilebilir; yönetim özel kalır. Kritik/yüksek açıklar giderilmiş veya kullanıcı tarafından somut kapsamıyla değerlendirilmiş; auth atlatma, sır/taslak sızıntısı ve test edilmemiş geri yükleme açıkken yayın yapılmaz. OOM/restart döngüsü yok, en az 1 GiB kullanılabilir bellek hedefi sağlanıyor; yük testinde beklenmeyen 5xx yok ve LAN p95 TTFB <200 ms hedefi karşılanıyor veya ölçüme dayalı kapasite kararı alınmış.

Performans kabulü: sabit mobil Lighthouse profilinde ana sayfa, proje ve yazı/rehber şablonlarında üç koşunun medyanı Performance ≥90, Accessibility ≥95, SEO ≥95. Bu skorlar WCAG veya saha Core Web Vitals garantisi değildir. Saha LCP/INP/CLS, yeterli veri oluştuktan sonra ayrıca değerlendirilir.

Yayın onaylanmadıysa aday hazır ve özel kalır; MVP'nin public yayın kabulü tamamlandı diye raporlanmaz.

### Faz 6 — Ölçüme göre geliştirme · ayrı kapsam

- Gerçek kullanım varsa statik arama, çok dil, rehber serileri ve ek içerik blokları.
- Takvimli yayın gerekiyorsa UTC tarih filtresi ve güvenilir scheduled build; zaman dilimi/saat değişimi ve kaçırılan tetikleme testleriyle birlikte.
- Yeterli trafik varsa gizlilik gözeten analitik veya RUM; saklama ve çerez kararı açıkça değerlendirilir.
- Resmi erişim/scope onayları varsa LinkedIn entegrasyonu için ayrı karar; izin yoksa manuel akış sürer.
- Çok editör/karmaşık iş akışı oluşursa B backend/DB seçeneğini yeniden değerlendir. Export/import, kimlik/URL koruma, medya aktarımı ve rollback provası tamamlanmadan geçiş yapma.
- Pi erişilebilirliği yetersizse statik public çıktıyı CDN/harici host'a taşı; özel admin ve içerik modeli korunabilir.

## 3. Test stratejisi

Amaç, işlevin kritik sözleşmelerini ve güvenlik sınırlarını doğrulamaktır. Basit sunum ayrıntılarını tekrar eden gereksiz birim testleri yazılmaz; schema, yayınlama, kimlik ve operasyon testleri önceliklidir.

| Katman | Kritik senaryolar | Çalıştırma yeri / sıklığı |
| --- | --- | --- |
| Tip ve içerik sözleşmesi | Zorunlu alanlar, yinelenen slug/id, tarih ve ilişki, featured, yayın izni, şema sürümü | Her ilgili kod/içerik değişikliğinde CI |
| Yayın filtresi | Draft/archived/gelecek tarih; HTML, RSS, sitemap, arama, JSON-LD, asset ve payload sızıntısı | Her public build; benzersiz sentinelli fixture |
| Render güvenliği | Script/HTML/tehlikeli URL, Markdoc component allowlist, SVG/MIME/boyut, EXIF | İçerik/medya işleme değişikliklerinde |
| CMS ve auth | Yetkili/yetkisiz repo kullanıcısı, VPN dışı erişim, CSRF/Origin, callback, logout, süre sonu ve erişim iptali | M1/M3, auth/proxy güncellemesi ve yayın öncesi |
| GitHub sync | Limit, ETag, pagination, idempotency, bozuk/kısmi snapshot, private repo ve editoryal alan koruması | Deterministik CI fixture'ları; canlı API ile sınırlı smoke |
| Public E2E | Liste→detay, featured, rehber sırası, 404/redirect, responsive, JS kapalı gezinme | İlgili şablon değişikliklerinde Playwright; ana tarayıcılar |
| Erişilebilirlik | axe + manuel klavye/focus, kontrast, zoom/reflow, ekran okuyucu ve reduced motion | Şablon değişikliği; yayın öncesi tüm ana şablonlar |
| SEO/performans | Canonical, structured data, index kapsamı, asset/JS bütçeleri, sabit profilli Lighthouse | Public build ve yayın adayı; dış bağlantılar ayrı/periyodik |
| Güvenlik/tedarik zinciri | Secret ve bağımlılık/image taraması, Docker izinleri, public rota/portlar, IPv6, CSP | Kod/image değişikliği; ingress değişikliğinde dış ağ testi |
| Operasyon/kurtarma | Bozuk artifact, eski build, atomik geçiş, rollback, reboot, disk eşiği, bağımsız restore | M4, dağıtım akışı değişikliği; restore üç ayda bir |
| Donanım/kapasite | Gerçek ARM64, toplam bellek, OOM, throttle, upload, 24 saat gözlem | M1/M4/M5, önemli runtime/image değişikliği |

PR CI'si tip/şema, gerekli birim/entegrasyon testleri, statik build ve artifact sızıntı kontrolünü çalıştırır. Deploy anahtarları yalnızca güvenilen korumalı yayın işinde bulunur; dış katkı/fork veya içerik verisi tarafından çalıştırılan koda verilmez. Asıl anahtarlarla auth testi public CI loglarına taşınmaz.

Gerektiğinde kullanıcı/izin iptalini test etmek için ayrı test hesabı kullanılır; üretim sahibinin tek kurtarma erişimi kaldırılmaz. Tüm test raporları kod/içerik commit'i, cihaz, tarayıcı ve profil bilgisiyle ilişkilendirilir. Aynı girdilerle geçen kontroller gerekçesiz tekrar edilmez.

## 4. Gelecekte uzman alt ajanlarla iş bölümü

Bu görevde alt ajan çalıştırılmadı; aşağıdaki dağılım gelecekteki uygulama için öneridir. Lead agent mimari sözleşmeler, kapsam, entegrasyon ve kabulden sorumlu kalır. Ajan sayısı görev karmaşıklığına göre artırılır; aynı dosyada eşzamanlı düzenleme yapılmaz.

| Uzman | Sınırlandırılmış iş / sahiplik | Teslim ve kabul |
| --- | --- | --- |
| Frontend, erişilebilirlik ve SEO | Astro sayfaları, layout/bileşenler, Tailwind, metadata; auth/deploy dosyalarını değiştirmez | Responsive sayfalar, klavye/axe raporu, JS ve performans bütçesi |
| İçerik ve CMS | Ortak modeller, Keystatic alanları, yayın filtresi ve medya; şema değişimini lead ile koordine eder | Tipli sözleşme, panel akışı, taslak sızıntı ve ilişki testleri |
| Entegrasyon ve otomasyon | GitHub sync, snapshot alan sahipliği, CI içerik tetikleme | Limit/idempotency/hata testleri; ayrı kimlikler ve minimum izin kaydı |
| Platform ve güvenlik | Docker/Compose, ARM64, özel erişim, HTTPS, deploy, backup/runbook | Dış ağ sınır testleri, kaynak ölçümleri, rollback ve restore kanıtı |
| Bağımsız kalite incelemesi | Yukarıdaki teslimleri salt okunur inceleme, kritik E2E ve tehdit senaryoları | Öncelikli bulgular ve M5 kabul raporu; kendi değişikliğini tek başına onaylamaz |

Önerilen sıra: M0–M1 lead + gerektiğinde CMS/platform uzmanlığı; sözleşmeler sabitlenince M2 frontend ve CMS paralel; M3 sync ve M4 platform bağımsız dosya sınırlarıyla paralel; M5 bağımsız inceleme. Beş eşzamanlı slot varsa lead ve en çok dört uzman aynı anda çalışır; bağımsız kalite incelemesi uygun aşamada bir uzmanın yerini alır.

Her iş paketi; onaylı kapsam, dosya sahipliği, beklenen teslim, kabul testi ve değişmeyecek arayüz sözleşmesini içerir. Şema değişikliği diğer ajanlara bildirilmeden yapılmaz. Ajanlara üretim sırrı dağıtılmaz; dış serviste yazma/dağıtım yetkisini lead kullanıcının onay kapsamına göre yönetir.

## 5. Başlangıç ve tamamlanma tanımı

Faz 0–1 için onay alındı. Yerel geliştirme kanıtları toplandı; gerçek Pi tüketimi ve GitHub/VPN erişim akışı henüz doğrulanmadı. Bunlar kullanıcı tercihiyle sonraya bırakıldı; yerel başarı M1'in donanım/üretim kimlik kabulünün yerine yazılmaz.

MVP ancak public portföy, özel içerik yönetimi, GitHub snapshot akışı, HTTPS, izleme, yedek/restore ve rollback kabulü birlikte tamamlandığında bitmiş sayılır. Teknik rapor ve operatör rehberi teslim edilir; açık varsayımlar doğrulanmış olgu olarak sunulmaz.
