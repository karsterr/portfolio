# Marka kaynakları

`originals/` kullanıcının sağladığı dört özgün PNG'yi içerir. Kökteki dosyalar taşınırken SHA-256 eşitliği doğrulandı; özgün pikseller değiştirilmedi.

- `mark.svg`: terminal/braket sembolünün küçük boyutlar için geometrik SVG uyarlaması.
- `wordmark.svg`: aynı eck kimliğinin temaya uyumlu SVG yazı logosu.
- Özgün `logo_banner.png`: build sırasında küçültülüp WebP sosyal paylaşım görseline dönüştürülür.

SVG renkleri `--brand-left`, `--brand-right` ve `--brand-ink` değişkenleriyle karanlık/açık temaya uyar. `scripts/brand.ts` bu kaynaklardan favicon, Apple Touch ikonu ve sosyal görseli üretir; özgün büyük PNG'ler public çıktıya kopyalanmaz.

`referans.png` burada bulunmaz. Yalnızca inceleme için `design/references/` altında, Git ve Docker bağlamı dışında saklanır; sitede kullanılmaz.
