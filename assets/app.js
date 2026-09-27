(function () {
  "use strict";

  var D = window.ALTYAPI_DATA;
  var $ = function (sel) { return document.querySelector(sel); };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { node.appendChild(c); });
    return node;
  }

  function fmt(n, digits) {
    return n.toLocaleString("tr-TR", { maximumFractionDigits: digits, minimumFractionDigits: digits });
  }

  /* ---------- Sekmeler ---------- */

  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  var tabHooks = {};

  function selectTab(name, focus) {
    var tab = document.getElementById("tab-" + name);
    if (!tab) return;
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
    if (history.replaceState) history.replaceState(null, "", "#" + name);
    if (tabHooks[name]) tabHooks[name]();
  }

  tabs.forEach(function (t, i) {
    var name = t.id.replace("tab-", "");
    t.addEventListener("click", function () { selectTab(name); });
    t.addEventListener("keydown", function (e) {
      var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = tabs[(i + dir + tabs.length) % tabs.length];
      selectTab(next.id.replace("tab-", ""), true);
    });
  });

  document.addEventListener("click", function (e) {
    var link = e.target.closest("[data-goto]");
    if (!link) return;
    e.preventDefault();
    selectTab(link.getAttribute("data-goto"), true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Altyapı sorgula ---------- */

  var ilSelect = $("#il");
  D.iller.slice().sort(function (a, b) { return a.localeCompare(b, "tr"); }).forEach(function (il) {
    ilSelect.appendChild(el("option", { value: il, text: il }));
  });

  var sonKod = "";

  function kopyala(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
    }
    return Promise.resolve(false);
  }

  function saglayiciKarti(s, il) {
    var chips = s.teknolojiler.map(function (t) { return el("span", { class: "chip", text: t }); });
    if (s.altyapiSahibi) chips.push(el("span", { class: "chip ok", text: "Kendi şebekesi" }));
    if (s.teknolojiler.indexOf("Kablo") !== -1) {
      var var_ = D.kabloIller.indexOf(il) !== -1;
      chips.push(el("span", {
        class: "chip " + (var_ ? "ok" : "warn"),
        text: var_ ? il + "'de yaygın" : il + "'de sınırlı olabilir"
      }));
    }
    var link = el("a", {
      class: "btn primary",
      href: s.url,
      target: "_blank",
      rel: "noopener",
      text: s.ad + " ile sorgula ↗"
    });
    link.addEventListener("click", function () { if (sonKod) kopyala(sonKod); });
    return el("article", { class: "provider" }, [
      el("h3", { text: s.ad }),
      el("div", { class: "chips" }, chips),
      el("p", { text: s.aciklama }),
      link
    ]);
  }

  $("#sorgu-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var hata = $("#form-hata");
    var il = ilSelect.value;
    var ilce = $("#ilce").value.trim();
    var kod = $("#adres-kodu").value.replace(/\D/g, "");
    hata.textContent = "";

    if (!il) { hata.textContent = "Lütfen il seçin."; ilSelect.focus(); return; }
    if (kod && (kod.length < 6 || kod.length > 12)) {
      hata.textContent = "Kod 6–12 haneli olmalıdır.";
      $("#adres-kodu").focus();
      return;
    }

    sonKod = kod;
    var yer = ilce ? ilce + " / " + il : il;
    $("#sonuc-baslik").textContent = yer + " için sağlayıcılar";
    var ozet;
    if (!kod) ozet = "Kod girmediniz; sağlayıcı sayfalarında adresinizi il › ilçe › mahalle › sokak › bina › daire sırasıyla seçebilirsiniz.";
    else if (kod.length === 10) ozet = "Kod: " + kod + " — 10 haneli olduğu için büyük olasılıkla UAVT adres kodu.";
    else ozet = "Kod: " + kod + " — BBK (Bina Bazlı Kod) olarak kullanılabilir.";
    $("#sonuc-ozet").textContent = ozet;
    $("#kopyala").hidden = !kod;

    var liste = $("#saglayici-listesi");
    liste.textContent = "";
    // Yalnızca kablo hizmeti veren sağlayıcıyı kablo altyapısı yaygın olmayan illerde sona at.
    D.saglayicilar.slice()
      .sort(function (a, b) {
        var ak = a.teknolojiler.length === 1 && a.teknolojiler[0] === "Kablo" && D.kabloIller.indexOf(il) === -1;
        var bk = b.teknolojiler.length === 1 && b.teknolojiler[0] === "Kablo" && D.kabloIller.indexOf(il) === -1;
        return ak - bk;
      })
      .forEach(function (s) { liste.appendChild(saglayiciKarti(s, il)); });

    $("#sorgu-sonuc").hidden = false;
    if (kod) kopyala(kod);
    try { localStorage.setItem("altyapi-form", JSON.stringify({ il: il, ilce: ilce, kod: kod })); } catch (_) { /* yok say */ }
    $("#sorgu-sonuc").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("#kopyala").addEventListener("click", function () {
    var btn = this;
    kopyala(sonKod).then(function (ok) {
      btn.textContent = ok ? "Kopyalandı ✓" : "Kopyalanamadı";
      setTimeout(function () { btn.textContent = "Kodu kopyala"; }, 1800);
    });
  });

  try {
    var kayit = JSON.parse(localStorage.getItem("altyapi-form") || "null");
    if (kayit) {
      ilSelect.value = kayit.il || "";
      $("#ilce").value = kayit.ilce || "";
      $("#adres-kodu").value = kayit.kod || "";
    }
  } catch (_) { /* yok say */ }

  /* ---------- Resmi bağlantılar ---------- */

  var resmi = $("#resmi-liste");
  D.resmiBaglantilar.forEach(function (b) {
    resmi.appendChild(el("li", {}, [
      el("a", { href: b.url, target: "_blank", rel: "noopener", text: b.ad + " ↗" }),
      el("span", { text: b.aciklama })
    ]));
  });

  /* ---------- Bağlantım ---------- */

  function fetchJson(url, ms) {
    var ctrl = "AbortController" in window ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, ms || 8000) : null;
    return fetch(url, { cache: "no-store", signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .finally(function () { if (timer) clearTimeout(timer); });
  }

  function baglantiBilgisiAl() {
    return fetchJson("https://ipwho.is/").then(function (j) {
      if (!j.success) throw new Error(j.message || "ipwho.is hata");
      return {
        ip: j.ip,
        asn: j.connection && j.connection.asn,
        org: j.connection && (j.connection.isp || j.connection.org),
        sehir: j.city,
        bolge: j.region,
        ulke: j.country,
        ulkeKodu: j.country_code
      };
    }).catch(function () {
      return fetchJson("https://speed.cloudflare.com/meta").then(function (j) {
        return {
          ip: j.clientIp,
          asn: j.asn,
          org: j.asOrganization,
          sehir: j.city,
          bolge: j.region,
          ulke: j.country,
          ulkeKodu: j.country
        };
      });
    });
  }

  function bilgiSatiri(dt, dd) {
    return el("div", {}, [el("dt", { text: dt }), el("dd", { text: dd || "—" })]);
  }

  function baglantiYukle() {
    var dl = $("#baglanti-bilgi");
    dl.textContent = "";
    dl.appendChild(bilgiSatiri("Durum", "Yükleniyor…"));

    baglantiBilgisiAl().then(function (b) {
      var bilinen = b.asn && D.asnler[b.asn];
      dl.textContent = "";
      dl.appendChild(bilgiSatiri("IP adresi", b.ip));
      dl.appendChild(bilgiSatiri("İnternet sağlayıcı", bilinen ? bilinen.ad : b.org));
      dl.appendChild(bilgiSatiri("Bağlantı türü", bilinen ? bilinen.tur : "Bilinmiyor"));
      dl.appendChild(bilgiSatiri("ASN", b.asn ? "AS" + b.asn + (b.org ? " · " + b.org : "") : ""));
      dl.appendChild(bilgiSatiri("Konum (yaklaşık)", [b.sehir, b.bolge, b.ulke].filter(Boolean).join(", ")));

      var net = navigator.connection;
      if (net && net.effectiveType) {
        dl.appendChild(bilgiSatiri("Tarayıcı ağ tahmini", net.effectiveType.toUpperCase() + (net.downlink ? " · ~" + net.downlink + " Mbps" : "")));
      }
      if (b.ulkeKodu && b.ulkeKodu !== "TR") {
        dl.appendChild(bilgiSatiri("Not", "Türkiye dışından (veya VPN ile) bağlanıyor görünüyorsunuz."));
      }
    }).catch(function () {
      dl.textContent = "";
      dl.appendChild(bilgiSatiri("Durum", "Bilgi alınamadı. Reklam engelleyici veya ağ kısıtlaması bu isteği engellemiş olabilir."));
    });
  }

  var baglantiYuklendi = false;
  tabHooks.baglanti = function () {
    if (baglantiYuklendi) return;
    baglantiYuklendi = true;
    baglantiYukle();
  };
  $("#baglanti-yenile").addEventListener("click", baglantiYukle);

  /* ---------- Hız testi ---------- */

  var CF = "https://speed.cloudflare.com";
  var bar = $("#test-bar");

  function now() { return performance.now(); }

  function median(arr) {
    var s = arr.slice().sort(function (a, b) { return a - b; });
    var m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  function percentile(arr, p) {
    var s = arr.slice().sort(function (a, b) { return a - b; });
    return s[Math.min(s.length - 1, Math.floor(p * s.length))];
  }

  function olcGecikme(n) {
    var sonuclar = [];
    var i = 0;
    var hatalar = 0;
    function tek() {
      var t0 = now();
      var f = zamanliFetch(CF + "/__down?bytes=0&r=" + Math.random(), {}, 3000);
      return f.istek
        .then(function (r) { return r.arrayBuffer(); })
        .then(function () { sonuclar.push(now() - t0); }, function () { hatalar++; })
        .then(function () {
          f.bitir();
          i++;
          bar.style.width = (i / n) * 20 + "%";
          if (hatalar > 3) throw new Error("Gecikme ölçülemedi");
          if (i < n) return tek();
        });
    }
    return tek().then(function () {
      if (sonuclar.length < 2) throw new Error("Gecikme ölçülemedi");
      sonuclar.shift(); // ilk istek bağlantı kurulumunu içerir
      var jit = 0;
      for (var k = 1; k < sonuclar.length; k++) jit += Math.abs(sonuclar[k] - sonuclar[k - 1]);
      return { ping: median(sonuclar), jitter: jit / Math.max(1, sonuclar.length - 1) };
    });
  }

  // Bir isteği, süre bütçesi dolduğunda iptal edilecek şekilde başlatır.
  function zamanliFetch(url, secenek, ms) {
    var ctrl = "AbortController" in window ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, ms) : null;
    secenek.signal = ctrl ? ctrl.signal : undefined;
    secenek.cache = "no-store";
    return { istek: fetch(url, secenek), bitir: function () { if (timer) clearTimeout(timer); } };
  }

  // Örnekler arasında büyük transferleri tercih ederek hız sonucunu hesaplar.
  function hizSonucu(ornekler) {
    var buyuk = ornekler.filter(function (o) { return o.bayt >= 1e6; });
    var kullan = (buyuk.length ? buyuk : ornekler).map(function (o) { return o.mbps; });
    if (!kullan.length) throw new Error("Hız ölçülemedi");
    return percentile(kullan, 0.9);
  }

  function olcIndirme(butceMs, baslangic, pay) {
    var boyutlar = [1e5, 1e6, 1e7, 2.5e7, 5e7, 1e8];
    var ornekler = [];
    var t0 = now();
    var idx = 0;
    var hatalar = 0;
    function tek() {
      var boyut = boyutlar[Math.min(idx, boyutlar.length - 1)];
      var kalan = Math.max(1500, butceMs - (now() - t0));
      var bayt = 0;
      var ts = now();
      var f = zamanliFetch(CF + "/__down?bytes=" + boyut + "&r=" + Math.random(), {}, kalan);
      return f.istek
        .then(function (r) {
          // Gövdeyi parça parça okuyarak iptal edilse bile alınan baytları sayar.
          var okuyucu = r.body.getReader();
          function oku() {
            return okuyucu.read().then(function (p) {
              if (p.done) return;
              bayt += p.value.length;
              return oku();
            });
          }
          return oku();
        })
        .catch(function () { /* zaman aşımı veya ağ hatası */ })
        .then(function () {
          f.bitir();
          var sure = now() - ts;
          if (bayt > 0) {
            var mbps = (bayt * 8) / (sure / 1000) / 1e6;
            ornekler.push({ bayt: bayt, mbps: mbps });
            $("#m-down").textContent = fmt(mbps, 1);
            // Transfer 1 saniyeden kısa sürdüyse bir sonraki boyuta geç.
            if (bayt === boyut && sure < 1000) idx++;
          } else if (++hatalar > 3) {
            throw new Error("İndirme ölçülemedi");
          }
          var gecen = now() - t0;
          bar.style.width = baslangic + Math.min(1, gecen / butceMs) * pay + "%";
          if (gecen < butceMs) return tek();
        });
    }
    return tek().then(function () { return hizSonucu(ornekler); });
  }

  function olcYukleme(butceMs, baslangic, pay) {
    var boyutlar = [1e5, 1e6, 5e6, 1e7, 2.5e7];
    var ornekler = [];
    var t0 = now();
    var idx = 0;
    var hatalar = 0;
    function tek() {
      var boyut = boyutlar[Math.min(idx, boyutlar.length - 1)];
      var kalan = Math.max(3000, butceMs - (now() - t0) + 2000);
      var ts = now();
      var f = zamanliFetch(CF + "/__up?r=" + Math.random(), { method: "POST", body: new Uint8Array(boyut) }, kalan);
      return f.istek
        .then(function (r) { return r.text().then(function () { return true; }); })
        .catch(function () { return false; })
        .then(function (ok) {
          f.bitir();
          var sure = now() - ts;
          if (ok) {
            var mbps = (boyut * 8) / (sure / 1000) / 1e6;
            ornekler.push({ bayt: boyut, mbps: mbps });
            $("#m-up").textContent = fmt(mbps, 1);
            if (sure < 1000) idx++;
          } else if (++hatalar > 3) {
            throw new Error("Yükleme ölçülemedi");
          } else if (idx > 0) {
            idx--; // Zaman aşımı: daha küçük parçayla devam et.
          }
          var gecen = now() - t0;
          bar.style.width = baslangic + Math.min(1, gecen / butceMs) * pay + "%";
          if (gecen < butceMs) return tek();
        });
    }
    return tek().then(function () { return hizSonucu(ornekler); });
  }

  function testYorumu(down, up, ping) {
    var parcalar = [];
    if (down >= 100) parcalar.push("İndirme hızınız fiber seviyesinde.");
    else if (down >= 35) parcalar.push("İndirme hızınız iyi bir VDSL veya giriş seviyesi fiber hattına uygun.");
    else if (down >= 12) parcalar.push("İndirme hızınız VDSL/ADSL2+ aralığında. Altyapınızda fiber veya daha yakın bir kabin olup olmadığını sorgulayın.");
    else parcalar.push("İndirme hızınız düşük. Kablolu bağlantıyla tekrar deneyin; sonuç değişmezse modemdeki senkron hızını kontrol edin.");
    if (ping > 60) parcalar.push("Gecikme yüksek; oyun ve görüntülü görüşmelerde sorun yaşayabilirsiniz.");
    if (up > 0 && down / up > 15) parcalar.push("Yükleme hızı indirmeye göre çok düşük; bu bakır (DSL) hatlarda olağandır.");
    return parcalar.join(" ");
  }

  $("#test-baslat").addEventListener("click", function () {
    var btn = this;
    var durum = $("#test-durum");
    var yorum = $("#test-yorum");
    btn.disabled = true;
    yorum.hidden = true;
    ["#m-ping", "#m-jitter", "#m-down", "#m-up"].forEach(function (s) { $(s).textContent = "–"; });
    bar.style.width = "0";

    var sonuc = {};
    durum.textContent = "Gecikme ölçülüyor…";
    olcGecikme(11)
      .then(function (g) {
        sonuc.ping = g.ping;
        $("#m-ping").textContent = fmt(g.ping, 0);
        $("#m-jitter").textContent = fmt(g.jitter, 1);
        durum.textContent = "İndirme hızı ölçülüyor…";
        return olcIndirme(8000, 20, 45);
      })
      .then(function (d) {
        sonuc.down = d;
        $("#m-down").textContent = fmt(d, 1);
        durum.textContent = "Yükleme hızı ölçülüyor…";
        return olcYukleme(6000, 65, 35);
      })
      .then(function (u) {
        sonuc.up = u;
        $("#m-up").textContent = fmt(u, 1);
        bar.style.width = "100%";
        durum.textContent = "Test tamamlandı.";
        yorum.textContent = testYorumu(sonuc.down, sonuc.up, sonuc.ping);
        yorum.hidden = false;
      })
      .catch(function () {
        durum.textContent = "Test başarısız oldu. Bağlantınızı veya reklam engelleyicinizi kontrol edip tekrar deneyin.";
      })
      .finally(function () { btn.disabled = false; });
  });

  /* ---------- Hız tahmini ---------- */

  var mesafe = $("#mesafe");
  var mesafeSayi = $("#mesafe-sayi");
  var turSec = $("#altyapi-turu");
  var canvas = $("#tahmin-grafik");
  var DB_PER_KM = 13.8; // 0,4 mm bakır, ~300 kHz'de tipik zayıflama

  function hizTahmini(tur, m) {
    var n = D.hizTablolari[tur].noktalar;
    if (m <= n[0][0]) return n[0][1];
    for (var i = 1; i < n.length; i++) {
      if (m <= n[i][0]) {
        var a = n[i - 1], b = n[i];
        return a[1] + (b[1] - a[1]) * ((m - a[0]) / (b[0] - a[0]));
      }
    }
    return 0;
  }

  function paketOnerisi(hiz, tur) {
    if (hiz < 1) return "Bu mesafede " + D.hizTablolari[tur].ad + " ile hizmet alınması pek olası değil. Fiber veya mobil ev interneti seçeneklerini değerlendirin.";
    var paketler = [8, 16, 24, 35, 50, 100];
    var uygun = paketler.filter(function (p) { return p <= hiz * 1.05; }).pop();
    if (!uygun) return "Hız çok düşük; yalnızca en temel paketler verimli çalışır.";
    return "Verimli kullanabileceğiniz en yüksek paket yaklaşık " + uygun + " Mbps. Daha yüksek bir paket alsanız da hattınız bu hızı aşamayabilir.";
  }

  function renk(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

  function grafikCiz(tur, m) {
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var W = canvas.clientWidth || 760;
    var H = Math.max(200, Math.round(W * 0.34));
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    var pad = { l: 44, r: 24, t: 12, b: 30 };
    var maxM = 6000, maxV = 100;
    var x = function (v) { return pad.l + (v / maxM) * (W - pad.l - pad.r); };
    var y = function (v) { return H - pad.b - (v / maxV) * (H - pad.t - pad.b); };

    var muted = renk("--muted"), border = renk("--border"), accent = renk("--accent"), text = renk("--text");
    ctx.font = "12px system-ui, sans-serif";
    ctx.lineWidth = 1;

    // Izgara
    ctx.strokeStyle = border;
    ctx.fillStyle = muted;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    [0, 25, 50, 75, 100].forEach(function (v) {
      ctx.beginPath(); ctx.moveTo(pad.l, y(v)); ctx.lineTo(W - pad.r, y(v)); ctx.stroke();
      ctx.fillText(v, pad.l - 6, y(v));
    });
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (var km = 0; km <= 6; km++) ctx.fillText(km + " km", x(km * 1000), H - pad.b + 8);

    // Diğer eğriler soluk, seçili eğri vurgulu
    Object.keys(D.hizTablolari).forEach(function (k) {
      var secili = k === tur;
      ctx.strokeStyle = secili ? accent : muted;
      ctx.globalAlpha = secili ? 1 : 0.35;
      ctx.lineWidth = secili ? 2.5 : 1.5;
      ctx.beginPath();
      for (var d = 0; d <= maxM; d += 50) {
        var px = x(d), py = y(hizTahmini(k, d));
        if (d === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // İşaretçi
    var v = hizTahmini(tur, m);
    ctx.fillStyle = accent;
    ctx.beginPath(); ctx.arc(x(m), y(v), 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = text;
    ctx.textAlign = m > 4500 ? "right" : "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(fmt(v, 1) + " Mbps", x(m) + (m > 4500 ? -8 : 8), y(v) - 6);
  }

  function tahminGuncelle(kaynak) {
    var m = Math.max(0, Math.min(6000, Number(kaynak.value) || 0));
    if (kaynak === mesafe) mesafeSayi.value = m; else mesafe.value = m;
    $("#mesafe-cikti").textContent = m.toLocaleString("tr-TR");
    var tur = turSec.value;
    var hiz = hizTahmini(tur, m);
    $("#tahmin-hiz").textContent = fmt(hiz, hiz < 10 ? 1 : 0);
    $("#tahmin-zayiflama").textContent = fmt((m / 1000) * DB_PER_KM, 1);
    $("#tahmin-paket").textContent = paketOnerisi(hiz, tur);
    grafikCiz(tur, m);
  }

  mesafe.addEventListener("input", function () { tahminGuncelle(mesafe); });
  mesafeSayi.addEventListener("input", function () { tahminGuncelle(mesafeSayi); });
  turSec.addEventListener("change", function () { tahminGuncelle(mesafe); });
  tabHooks.tahmin = function () { tahminGuncelle(mesafe); };
  window.addEventListener("resize", function () {
    if (!$("#panel-tahmin").hidden) tahminGuncelle(mesafe);
  });
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var yenidenCiz = function () { if (!$("#panel-tahmin").hidden) tahminGuncelle(mesafe); };
    if (mq.addEventListener) mq.addEventListener("change", yenidenCiz);
  }

  /* ---------- Başlangıç ---------- */

  var ilk = (location.hash || "").replace("#", "");
  selectTab(document.getElementById("tab-" + ilk) ? ilk : "sorgu");
})();
