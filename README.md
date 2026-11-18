# Efe Can Kara — geliştirici portföyü

Astro, TypeScript ve Tailwind ile Türkçe/İngilizce statik portföy. Projeler, yazılar, rehberler ve deneyim için liste/detay sayfaları; Keystatic ile ayrı içerik paneli bulunur.

Ana site varsayılan karanlık tema kullanır. Charcoal zemin, Star Dust metinler, Foggy detaylar ve ölçülü Japanese Indigo / Steel Teal vurguları açık temada da aynı paleti izler. Sağ üstteki güneş/ay düğmesiyle açık temaya geçebilirsiniz; seçim tarayıcıda saklanır. Yanındaki duraklat düğmesi sürekli animasyonları ve yumuşatılmış kaydırmayı kapatır. Sisteminizde “hareketi azalt” açıksa buna otomatik uyulur. Dokunmatik kaydırma doğal kalır.

Kök adres ilk girişte birincil tarayıcı dili Türkçeyse `/tr/`, diğer dillerde `/en/` açar; dil seçim ekranı yoktur. Üst menüden elle seçilen dil sonraki kök ziyaretlerinde korunur. Paylaşılan `/tr/…` ve `/en/…` bağlantıları kendi dilinde açılır. JavaScript kapalıysa kök sayfa İngilizce içerik sunar; menüden Türkçeye geçilebilir.

Özgün logolar `src/assets/brand/originals/` altında korunur. Temaya uyumlu SVG uyarlamaları başlık, giriş animasyonu, altbilgi ve favicon için kullanılır; banner optimize WebP paylaşım görseline dönüşür. İnceleme için verilen `referans.png`, `design/references/` altında tutulur; Git, Docker ve yayın çıktısından dışlanır.

Arka plandaki dalgalar, kaydırmayla açılan içerikler ve sayfa geçişleri küçük bir istemci katmanıyla çalışır. İlk sekme girişinde kısa bir karşılama animasyonu vardır; sonraki sayfa geçişlerinde tekrar oynatılmaz. JavaScript kapalıyken içerik ve gezinme çalışır, hareketli arka plan sabit kalır. Public çalışma zamanı hâlâ yalnızca statik dosyalar sunar.

Ana sayfanın akışı giriş → fotoğraflı Hakkımda → projeler → yazılar → iletişim şeklindedir. Profil, eğitim ve deneyimler kullanıcının sağladığı TR/EN CV'lerinden derlendi. Upwork'te freelance çalışma durumu, 16 Kasım 2026 başlangıcı ve verilen profil bağlantısıyla eklendi. Proje/yazı/rehber örnekleri sentetiktir.

**Mevcut teslim yerel kullanıma hazırdır.** GitHub hesabı/deposu oluşturulmadı; Raspberry Pi'ye bağlanılmadı ve public yayın yapılmadı. Üretim GitHub girişi, gerçek ARM64 çalışması ve dış HTTPS erişimi ayrıca doğrulanacaktır. Test kanıtları ve açık işler: [uygulama durumu](docs/IMPLEMENTATION.md).

## Yerelde çalıştırma

Proje **Node 24.22.3 veya daha yeni 24.x** ve npm ≥10 kullanır. `.node-version` sürümü belirtir. npm komutları önce aktif Node'u kontrol eder; uyumsuzsa `mise` ile kurulmuş proje sürümünü kullanır ve alt süreçlerin PATH'ini buna göre ayarlar. Global Node sürümü değiştirilmez. Bu makinede Node 24.22.3 kalıcı mise kullanıcı dizinine kuruldu; `/tmp` altındaki ilk deneme kurulumuna bağımlılık kalmadı.

Yeni checkout'ta:

```sh
mise install node@24.22.3
mise exec node@24.22.3 -- npm ci
npm run runtime:version
cp .env.example .env
npm run setup:example
npm run dev
```

Site: **http://127.0.0.1:4321/**, Türkçe `/tr/`, İngilizce `/en/`.

Zaten uygun Node 24 sürümü etkinse `mise` gerekmez; doğrudan `npm ci` kullanabilirsiniz. Node 22 etkin kalıyorsa kurulum için `mise exec … -- npm ci`, günlük çalışma için normal `npm run dev` / `npm run dev:admin` yeterlidir. Komutlar ağdan otomatik runtime indirmez; gerekli sürüm bulunamazsa açık bir kurulum mesajı verir. `node --version` sistem sürümünü, `npm run runtime:version` projenin kullandığı sürümü gösterir.

Bu çalışma dizininde `.env` ve `.local/content` zaten hazırlandı; tekrar kopyalamayın. `setup:example` mevcut içerik üzerine yazmaz. Site ve panel ayrı terminallerde ön planda çalışır; ilgili terminalde `Ctrl-C` ile kapatın. İki hedefin aynı Astro proje kilidine takılmaması ve otomatik arka plan süreci oluşturmaması için geliştirme komutları `--ignore-lock` kullanır.

İkinci terminalde paneli açın:

```sh
npm run dev:admin
```

Panel: **http://127.0.0.1:4322/keystatic/**. `.env` içindeki `PUBLIC_CMS_STORAGE=local` yalnızca geliştirmede etkilidir. Yerel panel kimlik doğrulaması içermez; yalnızca loopback'te dinler ve internete açılmaz. Astro dev/preview üretim sunucusu olarak kullanılmaz.

## İçerik düzenleme

Site ayarlarında **Ayrıntılı profil alanını göster** seçeneği konum, kişisel not, eğitim, yetkinlik grupları, diller, e-posta, freelance durumu ve Upwork bağlantısını açar. Hakkında metninde boş satırla ayrılan paragraflar desteklenir. Deneyim kayıtları **Sıralama** alanına göre küçük değer önce gelecek biçimde listelenir; dönem metni CV'deki yıl/ay hassasiyetinde korunur.

İletişim alanı e-posta ve profil bağlantıları sunar. Mesaj depolayan bir form veya yeni backend servisi eklenmedi. E-posta bağlantısı ziyaretçinin posta uygulamasını açar. Özgün CV dosyaları `design/references/cv/` altında tutulur ve yayımlanmaz; fotoğraf `src/assets/profile/` altında saklanır, build sırasında WebP'ye dönüştürülür.

- Panel koleksiyonlarından proje, yazı, rehber veya deneyim kaydı oluşturun. Site ayarlarından biyografi, unvan, giriş, sosyal bağlantılar ve featured proje kimliklerini düzenleyin.
- Her dil için ayrı kayıt kullanın: örneğin `proje-tr` ve `proje-en`. İki kaydın `translationGroupId` değeri aynı olsun. URL kısa adları küçük ASCII harf, rakam ve tire içerir.
- `draft` kayıtlar panelde görünür; public çıktıya girmez. Yayımlamak için `published` ve bugün veya geçmişte bir yayın tarihi seçin. Babintech kayıtlarında ayrıca yayın izni işaretlenmelidir.
- Featured kimlikler yayımlanmış proje kayıtlarına ait olmalıdır. Bir projeyi taslağa alırken featured listesini de güncelleyin.
- Kaydetme public siteyi otomatik yayımlamaz. İçeriği kaydettikten sonra statik çıktıyı yeniden üretin:

```sh
npm run build
npm run preview
```

Önizleme varsayılanı http://127.0.0.1:4321/ adresidir. Panel ve public önizleme birbirinden bağımsızdır. Önizlemeyi durdurmadan aynı portta `dev` başlatmayın.

Gerçek çalışma içeriği `.local/content` altında ve Git dışındadır. `examples/content` yalnızca başlangıç/test örnekleridir; panel bu örnek dosyalarını değiştirmez. `.local` dizinini ve `.env` dosyasını yedeklerken sırları ayrı şifreli saklayın. Deneyim kayıtları sağlanan CV’lerden, freelance başlangıcı kullanıcı beyanından derlendi. Bu içerik kişisel meslek geçmişidir; Babintech projelerine ilişkin yayın izni ayrıca değerlendirilir.

## Doğrulama

```sh
npm run verify
```

İçerik testleri, her iki hedefin tip kontrolü ve derlemesi, public çıktı sızıntı kontrolü ve sırlar olmadan üretim admin'inin 503 dönmesi test edilir. Smoke testi kısa süreli loopback portu açar.

Tarayıcı testleri için bir kez Chromium kurun veya mevcut Chromium yolunu belirtin:

```sh
npx playwright install chromium
npm run test:browser
```

Fedora'daki mevcut tarayıcıyı kullanmak için:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium-browser npm run test:browser
```

Testler varsayılan olarak Astro önizlemesini açar. Gerçek Caddy/CSP sunumunu da test etmek için çalışan yerel sunucu adresini `PORTFOLIO_BASE_URL=http://127.0.0.1:4180` ile verebilirsiniz. Bu adres geliştirme sırasında kullanılan isteğe bağlı bir test hedefidir; public dağıtım değildir.

Tarayıcı testleri sentetik `private-draft-tr` örneğini düzenler ve orijinalini geri yükler; bu örneği kendi yazınızla değiştirdiyseniz aynı test paketini kişisel içeriğiniz üzerinde çalıştırmayın. Public ve yerel panel sunucuları otomatik başlatılır; hazır sunucular varsa yeniden kullanılır. Görüntüler ve hata trace'leri `test-results/` altında Git dışında kalır.

## Public siteyi Pi'ye elle taşıma

Public çalışma zamanında Node, npm veya CMS gerekmez; Pi yalnızca Caddy ve statik dosyaları çalıştırır. Derlemeyi geliştirme makinesinde yapın. Aşağıdaki alan adı/IP/SSH değerleri örnektir; kendi değerlerinizle değiştirin.

Alan adı hazırsa, **derlemeden önce** `SITE_URL` verin:

```sh
SITE_URL=https://portfolio.example.com npm run build
npm run archive
```

Alan adı henüz yoksa `npm run build` kullanın. URL'siz çıktı bilerek `noindex` ve `robots.txt` engeli taşır; canonical ve RSS için hayali alan adı üretilmez. Gerçek alan adı seçildiğinde yeniden derleyin. Alan adıyla build, iki dilde RSS ve canonical/hreflang üretir.

`dist/portfolio-public.tar.gz`, `dist/portfolio-runtime.tar.gz` ve iki `.sha256` dosyasını kendi SSH bağlantınızla Pi'deki ayrı uygulama dizinine taşıyın. Pakete `.local`, `.env`, taslaklar, kaynak içerik veya `node_modules` konmaz. Checksum bütünlüğü denetler; aktarımı güvenilir SSH bağlantınızla yapın.

Pi'de Docker Engine ve Compose eklentisi hazır olmalıdır. Pi'deki uygulama dizininde:

```sh
sha256sum -c portfolio-public.tar.gz.sha256
sha256sum -c portfolio-runtime.tar.gz.sha256
tar -xzf portfolio-runtime.tar.gz
mkdir -p releases/first/public
tar -xzf portfolio-public.tar.gz -C releases/first/public
cp .env.example .env
```

`.env` dosyasında yerel deneme için:

```dotenv
PUBLIC_DIR=./releases/first/public
WEB_BIND_IP=127.0.0.1
WEB_HTTP_PORT=8080
WEB_HTTPS_PORT=8443
SITE_ADDRESS=:8080
```

Ardından:

```sh
docker compose build web
docker compose run --rm --no-deps web caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
docker compose up -d web
docker compose ps
curl -I http://127.0.0.1:8080/tr/
```

Bilgisayarınızdan SSH port yönlendirmesiyle deneyebilirsiniz:

```sh
ssh -L 8080:127.0.0.1:8080 USER@PI_HOST
```

Tarayıcıda http://127.0.0.1:8080/tr/ açılır. Bu aşama yalnızca özel HTTP denemesidir.

### Gerçek alan adıyla HTTPS

Yönlendirilebilir IP/port erişimi varsa DNS A/AAAA kayıtlarını ve router/firewall'u hazırlayın. Pi `.env` örneği:

```dotenv
SITE_ADDRESS=portfolio.example.com
WEB_BIND_IP=192.168.1.50
WEB_HTTP_PORT=80
WEB_HTTPS_PORT=443
PUBLIC_DIR=./releases/first/public
```

`WEB_BIND_IP`, Pi'nin fiziksel LAN adresidir; örneği aynen kullanmayın. Router TCP 80/443'ü Pi'ye yönlendirir. Caddy konteyner içinde 8080/8443 kullanır; Compose dış portlara eşler. Bu, root ve ek capability gerektirmeden ACME/HTTPS sağlar. [Caddy dahili port ayarları](https://caddyserver.com/docs/caddyfile/options#http-port)

```sh
docker compose up -d --force-recreate web
docker compose logs --tail=100 web
curl -I https://portfolio.example.com/tr/
```

IPv4/IPv6 üzerinden dış ağdan HTTPS, sertifika ve 404 davranışını siz test edin. CGNAT varsa bu doğrudan yol yeterli değildir; tünel sağlayıcısı henüz seçilmedi veya kurulmadı. HSTS preload uygulanmadı. Fedora/SELinux üzerinde bind mount erişimi engellenirse yalnızca public release klasörünü uygun konteyner etiketiyle kullanın; tüm checkout'a geniş etiket/izin değişikliği yapmayın.

### Güncelleme ve geri dönüş

Her yeni arşivi yeni bir dizine açın: örneğin `releases/second/public`. `.env` içindeki `PUBLIC_DIR` değerini bu dizine değiştirip `docker compose up -d --force-recreate web` çalıştırın. Hata varsa önceki dizine dönüp aynı komutla yeniden oluşturun. Son sağlam çıktıyı silmeyin; `.env` ve Caddy volume'larını yedekleyin. Bu teslimde manuel release seçimi var; mimarideki imzalı CI, atomik deploy ve otomatik backup işleri henüz uygulanmadı.

## Üretim yönetimi — GitHub hazır olduğunda

Şu an panelin **çalışan modu yerel geliştirmedir**. Üretim Node build'i, `PUBLIC_CMS_STORAGE=local` verilse bile GitHub modunu kullanır. Eksik yapılandırmada SSR rotaları 503 döner; `start:admin` eksik sırlarla başlamaz.

Gelecekte özel depoda `content/` dizini, yalnızca o depoya kurulu GitHub App ve özel HTTPS callback gerekir. Build sırasında `PUBLIC_CONTENT_REPO` ve `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`; runtime'da `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET` ve en az 32 karakterli `KEYSTATIC_SECRET` verilir. Bunları Git'e veya image'a eklemeyin. Gerçek sırlarla `docker compose config` çıktısını paylaşmayın.

`admin` Compose profili hazırlanmıştır; varsayılan `web` başlatma bunu açmaz. Tam kaynak checkout'u üzerinde, hesap/VPN kurulumundan sonra `docker compose --profile admin build admin` kullanılabilir. Admin portu host'ta yalnızca `127.0.0.1:4322` adresine bağlıdır; özel HTTPS için Tailscale Serve veya eşdeğer erişim gerekir. GitHub/VPN akışı gerçek hesapla henüz doğrulanmadı. [Keystatic GitHub modu](https://keystatic.com/docs/github-mode)

GitHub proje metadata senkronizasyonu ve LinkedIn API entegrasyonu henüz eklenmedi. LinkedIn için scraping yapılmaz. İlgili yol: [mimari](docs/ARCHITECTURE.md), [yol haritası](docs/ROADMAP.md).

## Yapı ve bakım

- `src/site`: statik sayfalar, bileşenler ve stiller.
- `src/admin`: özel panel rotaları ve middleware.
- `src/shared`: iki hedef ve pipeline'ın ortak içerik sözleşmesi.
- `scripts`: içerik doğrulama/aktarım, build sınır kontrolü, smoke ve paketleme.
- `.generated`: yalnızca yayımlanmış build girdisi; `.local` asıl yerel içerik.
- `ops`, `compose.yaml`: manuel Docker çalışma zamanı.

Paketler kilit dosyasıyla, Docker temel image'ları multiarch digest'leriyle sabitlenmiştir. Güncellemede bunları birlikte gözden geçirin. Keystatic'in dolaylı `minimatch` bağımlılığı, [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) nedeniyle 11.0.1'e override edildi; CMS form kaydetmesi bu sürümle test edildi. Körlemesine `npm audit fix --force` kullanmayın.

Kod lisansı: [MIT](LICENSE). Gerçek profesyonel/müşteri materyali için ayrıca yayın hakkını doğrulayın.
