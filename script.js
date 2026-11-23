/* =====================================================================
   表示用プログラム（content.js の内容をページに流し込みます）
   ※ ふだんの更新では触らなくて大丈夫です。
   ===================================================================== */
(function () {
  "use strict";

  if (typeof SITE === "undefined") {
    document.body.insertAdjacentHTML("afterbegin",
      '<div style="background:#c00;color:#fff;padding:12px 16px;font-weight:700">' +
      'content.js の読み込みに失敗しました。カンマ「,」や「"」の付け忘れがないか確認してください。</div>');
    return;
  }

  const S = SITE;
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const list = (arr) => Array.isArray(arr) ? arr : [];
  const pad = (n) => String(n).padStart(2, "0");
  const DOTS = ["var(--c-green)", "var(--c-yellow)", "var(--c-orange)", "var(--c-pink)", "var(--c-sky)"];
  const ext = 'target="_blank" rel="noopener"';

  /* 確認モード：検索エンジンに載せない＋上部に案内を表示 */
  if (S.previewMode) {
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex, nofollow";
    document.head.appendChild(m);
    root.classList.add("is-preview");
    document.body.insertAdjacentHTML("afterbegin",
      '<div class="preview-bar">公開前の確認用ページです（部外秘）</div>');
  }

  /* data-bind="a.b" → S.a.b を差し込む */
  document.querySelectorAll("[data-bind]").forEach((el) => {
    const v = el.dataset.bind.split(".").reduce((o, k) => (o ? o[k] : ""), S);
    el.innerHTML = v || "";
  });

  /* トップの写真（なければロゴ） */
  if (S.heroPhoto) {
    const hv = $("hero-visual");
    hv.innerHTML = `<img class="hero-photo" src="images/${S.heroPhoto}" alt="劇団あしあとの舞台写真">`;
    hv.removeAttribute("aria-hidden");
    root.classList.add("has-hero-photo");
  }

  /* 劇団について */
  if (S.about) {
    const ab = S.about;
    $("about-text").innerHTML =
      `<p class="lead">${ab.lead || ""}</p>` +
      list(ab.body).map((p) => `<p>${p}</p>`).join("") +
      (ab.photo ? `<figure class="about-photo"><img src="images/${ab.photo}" alt="${ab.photoCaption || "劇団あしあとの活動の様子"}" loading="lazy">${ab.photoCaption ? `<figcaption>${ab.photoCaption}</figcaption>` : ""}</figure>` : "");
    $("about-points").innerHTML = list(ab.points).map((p, i) => `
      <li>
        <span class="num" style="--dot:${DOTS[i % DOTS.length]}">${pad(i + 1)}</span>
        <div><h3>${p.title}</h3><p>${p.text}</p></div>
      </li>`).join("");
  }

  /* 次回公演 */
  const ns = S.nextStage || {};
  if (ns.show) {
    const btn = ns.reserveUrl
      ? `<a href="${ns.reserveUrl}" class="btn btn-primary" ${ext}>ご予約はこちら（無料）</a>`
      : `<span class="btn btn-disabled">ご予約受付は準備中です</span>`;
    const row = (k, v) => v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : "";
    const place = ns.place
      ? ns.place + (ns.mapUrl ? `<br><a class="map-link" href="${ns.mapUrl}" ${ext}>Google マップで見る ↗</a>` : "")
      : "";
    const flyers = [ns.flyer, ns.flyerBack].filter(Boolean);
    const visual = ns.flyer
      ? `<figure class="stage-visual">
           <a href="images/${ns.flyer}" ${ext} class="flyer-main"><img src="images/${ns.flyer}" alt="公演フライヤー（表）"></a>
           ${flyers.length > 1 ? `<figcaption class="flyer-links">${flyers.map((f, i) => `<a href="images/${f}" ${ext}>${i === 0 ? "表面" : "裏面"}を拡大</a>`).join("")}</figcaption>` : ""}
         </figure>`
      : `<figure class="stage-visual no-flyer"><img src="images/logo.webp" alt=""><figcaption>Coming Soon</figcaption></figure>`;
    $("next-stage").innerHTML = `
      <article class="stage-card reveal">
        ${visual}
        <div class="stage-body">
          <p class="stage-type">${ns.type || ""}</p>
          <h3 class="stage-title">${ns.title || ""}</h3>
          <p class="stage-credit">${ns.credit || ""}</p>
          <div class="stage-cta-top">${btn}</div>
          ${ns.quote ? `<blockquote class="stage-quote">「${ns.quote}」</blockquote>` : ""}
          <dl class="stage-info">
            ${row("日時", ns.date || "未定")}
            ${row("上演時間", ns.runtime)}
            ${row("会場", place || "未定")}
            ${row("アクセス", ns.access)}
            ${row("料金", ns.price)}
            ${row("予約", ns.reserveNote)}
          </dl>
          ${btn}
          ${ns.synopsis ? `<details class="synopsis"><summary>あらすじ</summary><p>${ns.synopsis}</p></details>` : ""}
        </div>
      </article>`;

    /* トップの「次回公演」バナー */
    const hn = $("hero-next");
    const first = (s) => (s || "").split("<br>")[0];
    hn.innerHTML = `
      ${ns.flyer ? `<span class="hn-thumb"><img src="images/${ns.flyer}" alt=""></span>` : ""}
      <span class="hn-text">
        <span class="hn-label">Next Stage</span>
        <small>${ns.type || ""}</small>
        <strong>${ns.title || ""}</strong>
        <em>${first(ns.date)}${ns.place ? `<span class="hn-sep">／</span><span class="hn-place">${first(ns.place)}</span>` : ""}</em>
      </span>
      <span class="hn-cta">${ns.reserveUrl ? "公演情報・ご予約" : "公演情報を見る"}<span aria-hidden="true">→</span></span>`;
    hn.hidden = false;
    root.classList.add("has-next");
  } else {
    $("next-stage").innerHTML = `
      <div class="stage-empty reveal">
        <p>次回公演の情報は準備中です。<br>決まり次第、お知らせやSNSでお伝えします。</p>
      </div>`;
  }

  /* 過去の公演（なければ見出しごと隠す） */
  const past = list(S.pastStages);
  if (past.length) {
    const anyPhoto = past.some((p) => p.photo);  // 1枚でもあれば全行に写真枠を付けて列をそろえる
    $("past-list").innerHTML = past.map((p) => `
      <li class="reveal ${anyPhoto ? "has-photo" : ""}">
        ${p.photo ? `<img class="past-photo" src="images/${p.photo}" alt="${p.title || ""}の舞台写真" loading="lazy">` : (anyPhoto ? `<span class="past-photo past-photo-empty"></span>` : "")}
        <span class="past-date">${p.date || ""}</span><span class="past-name">${p.title || ""}</span><span class="past-tag">${p.tag || ""}</span>
      </li>`).join("");
    $("past").hidden = false;
  }

  /* お知らせ */
  const CAT = { "お知らせ": "cat-info", "公演": "cat-stage", "募集": "cat-join" };
  $("news-list").innerHTML = list(S.news).map((n) => `
    <li class="reveal"><time>${n.date}</time><span class="news-cat ${CAT[n.category] || "cat-info"}">${n.category || "お知らせ"}</span><p>${n.text}</p></li>`).join("");

  /* 活動内容 */
  const a = S.activity || {};
  $("activity-basic").innerHTML = [["活動日", a.day], ["時間", a.time], ["場所", a.place], ["団員数", a.members]]
    .filter(([, v]) => v)
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");

  $("timeline").innerHTML = list(S.schedule).map((t, i) => `
    <li class="reveal" style="--dot:${DOTS[i % DOTS.length]}"><span class="tl-month">${t.month}</span><h4>${t.title}</h4><p>${t.text}</p></li>`).join("");

  /* 入団案内 */
  const j = S.join || {};
  $("join-faq").innerHTML = list(j.faq).map((f) => `
    <div><dt>${f.q}</dt><dd>${f.a}</dd></div>`).join("");
  let jb = "";
  if (j.formUrl) jb += `<a href="${j.formUrl}" class="btn btn-primary" ${ext}>${j.formText || "フォームで申し込む"}</a>`;
  if (j.dmUrl) jb += `<a href="${j.dmUrl}" class="btn ${j.formUrl ? "btn-line" : "btn-primary"}" ${ext}>${j.dmText || "InstagramのDMで申し込む"}</a>`;
  if (!jb) jb = `<a href="#contact" class="btn btn-primary">見学・体験を申し込む</a>`;
  $("join-actions").innerHTML = jb;

  /* お問い合わせ・フッターのSNS */
  const c = S.contact || {};
  const links = [];
  /* SNSアイコン（文字色と同じ色で表示される） */
  const svg = (inner) => `<svg class="sns-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${inner}</svg>`;
  const icons = {
    instagram: svg(`<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.4" cy="6.6" r="1.3" fill="currentColor"/>`),
    x: svg(`<path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>`),
    note: svg(`<path d="M6 19V8.8A2.8 2.8 0 0 1 8.8 6h6.4A2.8 2.8 0 0 1 18 8.8V19" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>`),
    mail: svg(`<rect x="2.5" y="5" width="19" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`),
  };
  if (c.instagram && c.instagram.url) links.push({ href: c.instagram.url, name: "Instagram", sub: c.instagram.id, out: true, icon: icons.instagram });
  if (c.x && c.x.url) links.push({ href: c.x.url, name: "X", sub: c.x.id, out: true, icon: icons.x });
  if (c.note && c.note.url) links.push({ href: c.note.url, name: "note", sub: c.note.id, out: true, icon: icons.note });
  if (c.email) links.push({ href: `mailto:${c.email}`, name: "Mail", sub: c.email, out: false, icon: icons.mail });
  $("contact-grid").innerHTML = links.map((l) => `
    <li class="reveal"><a href="${l.href}" ${l.out ? ext : ""}>
      <span class="ct-name">${l.icon}${l.name}</span><span class="ct-id">${l.sub}</span><span class="ct-arrow" aria-hidden="true">${l.out ? "↗" : "→"}</span>
    </a></li>`).join("");
  $("footer-sns").innerHTML = links.map((l) => `
    <li><a href="${l.href}" ${l.out ? ext : ""}>${l.icon}<span>${l.name}</span></a></li>`).join("");

  $("year").textContent = new Date().getFullYear();

  /* ---------- 演出・操作 ---------- */

  /* 歩くあしあと */
  const trail = $("footsteps-trail");
  if (trail) {
    let html = "";
    for (let i = 0; i < 13; i++) {
      const x = 60 + i * 90, up = i % 2 === 1;
      html += `<use href="#foot" class="fs" style="--i:${i}" transform="translate(${x} ${up ? 52 : 82}) rotate(${80 + (up ? 2 : -2)})${up ? " scale(-1 1)" : ""}"/>`;
    }
    trail.innerHTML = html;
  }

  /* スマホメニュー */
  const toggle = document.querySelector(".nav-toggle");
  const nav = $("nav");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    nav.classList.toggle("open", open);
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach((l) => l.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* スクロール：ヘッダーの線＋今いるセクションをメニューで示す */
  const header = document.querySelector(".site-header");
  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = navLinks.map((l) => document.querySelector(l.getAttribute("href"))).filter(Boolean);
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    header.classList.toggle("scrolled", window.scrollY > 10);
    const line = header.getBoundingClientRect().bottom + window.innerHeight * 0.3;
    let current = null;
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= line) current = s; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections[sections.length - 1];
    navLinks.forEach((l) => {
      const on = current && l.getAttribute("href") === "#" + current.id;
      l.classList.toggle("is-current", !!on);
      if (on) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
    });
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ふわっと表示 */
  const els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add("in"));
  }
})();
