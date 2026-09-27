/* Statik veri: iller, sağlayıcılar, bilinen ASN'ler ve hız tahmin tabloları. */
window.ALTYAPI_DATA = {
  iller: [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin",
    "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale",
    "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum",
    "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin",
    "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli",
    "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş",
    "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas",
    "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak",
    "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan",
    "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
  ],

  // Kablo internet (Türksat Kablonet) hizmetinin yaygın olduğu bilinen iller.
  // Kesin kapsama bilgisi değildir; yalnızca ipucu olarak gösterilir.
  kabloIller: [
    "Adana", "Ankara", "Antalya", "Bursa", "Diyarbakır", "Erzurum", "Eskişehir", "Gaziantep",
    "İstanbul", "İzmir", "Kayseri", "Kocaeli", "Konya", "Mersin", "Samsun", "Trabzon",
    "Denizli", "Manisa", "Malatya", "Sakarya", "Elazığ", "Sivas"
  ],

  // Sağlayıcı bağlantıları sağlayıcıların kendi sitelerine gider.
  // Sayfa adresleri zamanla değişebilir; ana sayfadaki "Altyapı Sorgulama" bölümünü kullanın.
  saglayicilar: [
    {
      ad: "Türk Telekom",
      aciklama: "Bakır ve fiber şebekenin büyük kısmının sahibi. Diğer pek çok İSS bu altyapıyı toptan kiralar.",
      url: "https://www.turktelekom.com.tr/",
      teknolojiler: ["ADSL", "VDSL", "Fiber"],
      altyapiSahibi: true
    },
    {
      ad: "Turkcell Superonline",
      aciklama: "Kendi fiber şebekesi olan bölgelerde FTTH/FTTB, diğer yerlerde Türk Telekom altyapısı.",
      url: "https://www.superonline.net/altyapi-sorgulama",
      teknolojiler: ["Fiber", "VDSL", "ADSL"],
      altyapiSahibi: true
    },
    {
      ad: "TürkNet",
      aciklama: "Türk Telekom altyapısında hizmet verir; bazı bölgelerde kendi GigaFiber şebekesi vardır.",
      url: "https://turk.net/altyapi-sorgulama/",
      teknolojiler: ["Fiber", "VDSL", "ADSL"],
      altyapiSahibi: false
    },
    {
      ad: "Vodafone Net",
      aciklama: "Kendi fiber şebekesi ve Türk Telekom toptan altyapısı üzerinden hizmet verir.",
      url: "https://www.vodafone.com.tr/",
      teknolojiler: ["Fiber", "VDSL", "ADSL"],
      altyapiSahibi: true
    },
    {
      ad: "Türksat Kablonet",
      aciklama: "Koaksiyel kablo TV şebekesi üzerinden kablo internet. Yalnızca kablo altyapısı olan bölgelerde.",
      url: "https://www.turksatkablo.com.tr/",
      teknolojiler: ["Kablo"],
      altyapiSahibi: true
    },
    {
      ad: "Millenicom",
      aciklama: "Türk Telekom toptan altyapısı üzerinden hizmet veren alternatif İSS.",
      url: "https://www.millenicom.com.tr/",
      teknolojiler: ["Fiber", "VDSL", "ADSL"],
      altyapiSahibi: false
    },
    {
      ad: "D-Smart",
      aciklama: "Türk Telekom toptan altyapısı üzerinden internet ve TV paketleri.",
      url: "https://www.dsmart.com.tr/internet/altyapi-sorgulama",
      teknolojiler: ["Fiber", "VDSL", "ADSL"],
      altyapiSahibi: false
    }
  ],

  resmiBaglantilar: [
    {
      ad: "e-Devlet · Adres Bilgilerim",
      aciklama: "Yerleşim yerinizin 10 haneli adres kodunu (UAVT) buradan öğrenebilirsiniz.",
      url: "https://www.turkiye.gov.tr/adres-bilgilerim"
    },
    {
      ad: "e-Devlet · BTK Tarife Karşılaştırma",
      aciklama: "İşletmecilerin bireysel abonelere açık tarifelerini karşılaştırın.",
      url: "https://www.turkiye.gov.tr/btk-tarife-karsilastirma"
    },
    {
      ad: "e-Devlet · Abonelik Nakil Başvurusu",
      aciklama: "Taşınırken mevcut aboneliğinizin nakli için BTK başvurusu.",
      url: "https://www.turkiye.gov.tr/btk-abonelik-nakil-basvurusu"
    },
    {
      ad: "BTK",
      aciklama: "Bilgi Teknolojileri ve İletişim Kurumu – pazar verileri ve tüketici hakları.",
      url: "https://www.btk.gov.tr/"
    }
  ],

  // Bilinen Türk İSS otonom sistem numaraları.
  asnler: {
    9121: { ad: "Türk Telekom (TTNet)", tur: "Sabit" },
    47331: { ad: "Türk Telekom (TTNet)", tur: "Sabit" },
    34984: { ad: "Turkcell Superonline", tur: "Sabit" },
    12735: { ad: "TürkNet", tur: "Sabit" },
    8386: { ad: "Vodafone Net", tur: "Sabit" },
    15897: { ad: "Vodafone Türkiye", tur: "Mobil" },
    16135: { ad: "Turkcell", tur: "Mobil" },
    20978: { ad: "Türk Telekom Mobil", tur: "Mobil" }
  },

  // Mesafe (m) -> tahmini senkron hızı (Mbps). Tipik 0,4 mm bakır kablo varsayımıyla
  // kaba yaklaşık değerlerdir; gürültü, ek yerleri ve kablo kalitesi sonucu değiştirir.
  hizTablolari: {
    adsl2: {
      ad: "ADSL2+",
      noktalar: [[0, 24], [500, 22], [1000, 19], [1500, 16], [2000, 13], [2500, 10], [3000, 8], [3500, 6], [4000, 4], [5000, 2], [6000, 1], [7000, 0.5]]
    },
    vdsl2: {
      ad: "VDSL2 (17a)",
      noktalar: [[0, 100], [300, 95], [500, 80], [800, 60], [1000, 50], [1200, 40], [1500, 28], [2000, 16], [2500, 10], [3000, 6], [3500, 3], [4000, 0]]
    },
    vectoring: {
      ad: "VDSL2 + Vectoring",
      noktalar: [[0, 100], [300, 100], [500, 95], [800, 75], [1000, 62], [1200, 50], [1500, 35], [2000, 20], [2500, 12], [3000, 7], [3500, 3], [4000, 0]]
    }
  }
};
