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

  /* 確認モード：検索エンジンに載せない＋上部に案内を表示 */
  if (S.previewMode) {
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex, nofollow";
    document.head.appendChild(m);
    document.documentElement.classList.add("is-preview");
    document.body.insertAdjacentHTML("afterbegin",
      '<div class="preview-bar">公開前の確認用ページです（部外秘）</div>');
  }
  const list = (arr) => Array.isArray(arr) ? arr : [];
  const pad = (n) => String(n).padStart(2, "0");
  const DOTS = ["var(--c-green)", "var(--c-yellow)", "var(--c-orange)", "var(--c-pink)", "var(--c-sky)"];

  /* data-bind="a.b" → S.a.b を差し込む */
  document.querySelectorAll("[data-bind]").forEach((el) => {
    const v = el.dataset.bind.split(".").reduce((o, k) => (o ? o[k] : ""), S);
    el.innerHTML = v || "";
  });

  /* 劇団について */
  if (S.about) {
    $("about-text").innerHTML =
      `<p class="lead">${S.about.lead || ""}</p>` +
      list(S.about.body).map((p) => `<p>${p}</p>`).join("");
    $("about-points").innerHTML = list(S.about.points).map((p, i) => `
      <li>
        <span class="num" style="--dot:${DOTS[i % DOTS.length]}">${pad(i + 1)}</span>
        <div><h3>${p.title}</h3><p>${p.text}</p></div>
      </li>`).join("");
  }

  /* 次回公演 */
  const ns = S.nextStage || {};
  if (ns.show) {
    const btn = ns.reserveUrl
      ? `<a href="${ns.reserveUrl}" class="btn btn-primary" target="_blank" rel="noopener">ご予約はこちら</a>`
      : `<span class="btn btn-disabled">ご予約受付は準備中です</span>`;
    const row = (k, v) => v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : "";
    const place = ns.place
      ? ns.place + (ns.mapUrl ? `<br><a class="map-link" href="${ns.mapUrl}" target="_blank" rel="noopener">Google マップで見る ↗</a>` : "")
      : "";
    const flyers = [ns.flyer, ns.flyerBack].filter(Boolean);
    const visual = ns.flyer
      ? `<figure class="stage-visual">
           <a href="images/${ns.flyer}" target="_blank" rel="noopener" class="flyer-main"><img src="images/${ns.flyer}" alt="公演フライヤー（表）"></a>
           ${flyers.length > 1 ? `<figcaption class="flyer-links">${flyers.map((f, i) => `<a href="images/${f}" target="_blank" rel="noopener">${i === 0 ? "表面" : "裏面"}を拡大</a>`).join("")}</figcaption>` : ""}
         </figure>`
      : `<figure class="stage-visual no-flyer"><img src="images/logo.webp" alt=""><figcaption>Coming Soon</figcaption></figure>`;
    $("next-stage").innerHTML = `
      <article class="stage-card reveal">
        ${visual}
        <div class="stage-body">
          <p class="stage-type">${ns.type || ""}</p>
          <h3 class="stage-title">${ns.title || ""}</h3>
          <p class="stage-credit">${ns.credit || ""}</p>
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
    hn.innerHTML = `
      ${ns.flyer ? `<img src="images/${ns.flyer}" alt="">` : ""}
      <span class="hn-text"><small>Next Stage — ${ns.type || ""}</small><strong>${ns.title || ""}</strong><em>${(ns.date || "").split("<br>")[0]}</em></span>
      <span class="hn-arrow" aria-hidden="true">→</span>`;
    hn.hidden = false;
  } else {
    $("next-stage").innerHTML = `
      <div class="stage-empty reveal">
        <p>次回公演の情報は準備中です。<br>決まり次第、お知らせやSNSでお伝えします。</p>
      </div>`;
  }

  $("past-list").innerHTML = list(S.pastStages).length
    ? list(S.pastStages).map((p) => `
      <li class="reveal"><span class="past-date">${p.date}</span><span class="past-name">${p.title}</span><span class="past-tag">${p.tag || ""}</span></li>`).join("")
    : `<li class="past-empty">過去の公演は順次追加していきます。</li>`;

  /* お知らせ */
  const CAT = { "お知らせ": "cat-info", "公演": "cat-stage", "募集": "cat-join" };
  $("news-list").innerHTML = list(S.news).map((n) => `
    <li class="reveal"><time>${n.date}</time><span class="news-cat ${CAT[n.category] || "cat-info"}">${n.category || "お知らせ"}</span><p>${n.text}</p></li>`).join("");

  /* 活動内容 */
  const a = S.activity || {};
  $("activity-basic").innerHTML = [["活動日", a.day], ["時間", a.time], ["場所", a.place], ["部員数", a.members]]
    .filter(([, v]) => v)
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");

  $("timeline").innerHTML = list(S.schedule).map((t, i) => `
    <li class="reveal" style="--dot:${DOTS[i % DOTS.length]}"><span class="tl-month">${t.month}</span><h4>${t.title}</h4><p>${t.text}</p></li>`).join("");

  /* 入団案内 */
  const j = S.join || {};
  $("join-faq").innerHTML = list(j.faq).map((f) => `
    <div><dt>${f.q}</dt><dd>${f.a}</dd></div>`).join("");
  const jb = $("join-btn");
  if (j.buttonText) jb.textContent = j.buttonText;
  if (j.formUrl) { jb.href = j.formUrl; jb.target = "_blank"; jb.rel = "noopener"; }

  /* お問い合わせ */
  const c = S.contact || {};
  const item = (href, name, sub, ext) => `
    <li class="reveal"><a href="${href}" ${ext ? 'target="_blank" rel="noopener"' : ""}>
      <span class="ct-name">${name}</span><span class="ct-id">${sub}</span><span class="ct-arrow" aria-hidden="true">${ext ? "↗" : "→"}</span>
    </a></li>`;
  let ch = "";
  if (c.instagram && c.instagram.url) ch += item(c.instagram.url, "Instagram", c.instagram.id, true);
  if (c.x && c.x.url) ch += item(c.x.url, "X", c.x.id, true);
  if (c.note && c.note.url) ch += item(c.note.url, "note", c.note.id, true);
  if (c.email) ch += item(`mailto:${c.email}`, "Mail", c.email, false);
  $("contact-grid").innerHTML = ch;

  $("year").textContent = new Date().getFullYear();

  /* ---------- 演出 ---------- */

  /* 歩く足あと */
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
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "メニューを開く" : "メニューを閉じる");
    nav.classList.toggle("open", !open);
  });
  nav.querySelectorAll("a").forEach((l) => l.addEventListener("click", () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("open");
  }));

  /* スクロールでヘッダーに線 */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
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
