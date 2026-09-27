# Türkiye Altyapı Sorgulama

Türkiye'de ev internet altyapınızı öğrenmenize yardımcı olan, tamamen statik (derleme gerektirmeyen) bir GitHub Pages sitesi.

## Özellikler

- **Altyapı Sorgula** – İl, ilçe ve adres kodu (UAVT) / BBK kodu girin; kod doğrulanır, panoya kopyalanır ve bölgenize uygun sağlayıcıların resmi altyapı sorgulama sayfalarına yönlendirilirsiniz.
- **Bağlantım** – IP adresiniz, İSS'niz, ASN ve yaklaşık konumunuz ([ipwho.is](https://ipwho.is), yedek olarak Cloudflare).
- **Hız Testi** – Cloudflare'in en yakın sunucusuna gecikme, dalgalanma, indirme ve yükleme ölçümü.
- **Hız Tahmini** – Santral/kabin mesafesine göre ADSL2+, VDSL2 ve Vectoring için tahmini senkron hızı, hat zayıflaması ve paket önerisi.
- **Rehber** – Altyapı türleri, sık sorulan sorular ve resmi e-Devlet/BTK bağlantıları.

> **Neden sonuç doğrudan gösterilmiyor?** İşletmecilerin altyapı servisleri yalnızca kendi sitelerinden çağrılabilir (CORS, bot koruması). Statik bir site bu servisleri izinli olarak çağıramadığından araç, sorguyu resmi sayfalarda tamamlamanız için kodu hazırlar. Adres veya kod bilgileri hiçbir sunucuya gönderilmez; yalnızca tarayıcınızda (localStorage) saklanır.

## Yayınlama

1. Depoyu GitHub'a gönderin ve `main` dalına birleştirin.
2. **Settings › Pages › Build and deployment › Source** alanını **GitHub Actions** olarak ayarlayın.
3. `.github/workflows/pages.yml` iş akışı her `main` gönderiminde siteyi yayınlar:
   `https://<kullanıcı>.github.io/turkiye-altyapi-sorgulama/`

Alternatif olarak Source'u **Deploy from a branch** › `main` / `(root)` yapabilirsiniz.

## Yerelde çalıştırma

```sh
python3 -m http.server 8000
# http://localhost:8000
```

## Dosya yapısı

```
index.html          Sayfa ve sekmeler
assets/style.css    Stil (açık/koyu tema)
assets/app.js       Uygulama mantığı
assets/data.js      İller, sağlayıcılar, ASN'ler, hız tabloları
```

Sağlayıcı bağlantılarını veya hız tablolarını güncellemek için `assets/data.js` dosyasını düzenleyin.

## Sorumluluk reddi

Bu proje bağımsızdır; hiçbir işletmeci veya kamu kurumuyla bağlantısı yoktur. Hız tahminleri yaklaşık değerlerdir.

## Lisans

[MIT](LICENSE)
