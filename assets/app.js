/* A R Landscaping & Construction — site script */
(function () {
  "use strict";

  /* ---- Estimate form destination ----------------------------------------
     Leave empty to run the form in demo mode (shows a confirmation, sends nothing).
     To receive requests by email for free, set this to
     "https://formsubmit.co/ajax/YOUR-EMAIL@example.com"  (first submission
     sends a one-time activation email to that address). */
  var FORM_ENDPOINT = "";

  document.documentElement.classList.add("js");
  var ES = (document.documentElement.lang || "").indexOf("es") === 0;
  var L = ES ? {
    copied: "Copiado ", border: " de borde", want: function (p, c, b) { return "Me interesa una entrada en " + p + ", " + c + (b ? ", con borde " + b : "") + "."; },
    errName: "Escriba su nombre para saber por quién preguntar.", errPhone: "Escriba un teléfono para programar la visita.",
    sending: "Enviando…", received: "Solicitud recibida", in_: " en ", submit: "Solicitar mi presupuesto gratis",
    sent: "Recibimos su solicitud y lo llamaremos para programar la visita.", callUs: "Llámenos para confirmar su visita de presupuesto:",
    fail: "No se pudo enviar. Llame al 781.299.2751 o intente de nuevo.", subject: "Nueva solicitud de presupuesto: ",
    names: { herringbone: "Espiga 45°", running: "Hilera corrida", basket: "Canasta", cobble: "Adoquín rústico", charcoal: "Mezcla carbón", granite: "Gris granito", tan: "Mezcla canela", brick: "Rojo ladrillo" }
  } : {
    copied: "Copied ", border: " border", want: function (p, c, b) { return "Interested in a " + p + " driveway, " + c + (b ? ", with a " + b + " border course" : "") + "."; },
    errName: "Add your name so we know who to ask for.", errPhone: "Add a phone number so we can schedule the visit.",
    sending: "Sending…", received: "Request received", in_: " in ", submit: "Request my free estimate",
    sent: "We have your request and will call you to schedule the visit.", callUs: "Call us to lock in your estimate visit:",
    fail: "That didn't go through. Please call 781.299.2751 or try again.", subject: "New estimate request: ",
    names: { herringbone: "Herringbone 45°", running: "Running bond", basket: "Basketweave", cobble: "Cobblestone", charcoal: "Charcoal blend", granite: "Granite grey", tan: "Tan blend", brick: "Brick red" }
  };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Mobile menu */
  var menuBtn = $(".menu-btn"), nav = $("#site-nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }); });
  }

  /* Toast + copy buttons */
  var toastT;
  function toast(m) { var t = $("#toast"); if (!t) return; t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 1800); }
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var v = b.getAttribute("data-copy");
      try { navigator.clipboard.writeText(v).then(function () { toast(L.copied + v); }, function () { toast(v); }); } catch (e) { toast(v); }
    });
  });

  /* ---- Motion ---- */
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var hasIO = "IntersectionObserver" in window;

  /* Hero headline: words rise in one after another */
  var h1 = $(".hero .hero-title");
  if (h1 && !reduce) {
    var wi = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var s = document.createElement("span"); s.className = "w"; s.style.setProperty("--d", (wi++ * 70) + "ms"); s.textContent = p; frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) { walk(n); }
      });
    })(h1);
    h1.classList.add("wsplit");
  }

  /* Reveal on scroll, staggered within each group */
  $$(".gal figure").forEach(function (f) { f.classList.add("reveal"); });
  var rev = $$(".reveal");
  rev.forEach(function (el) { var p = el.parentNode; p._n = p._n || 0; el.style.transitionDelay = Math.min(p._n, 5) * 90 + "ms"; p._n++; });
  if (hasIO && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    rev.forEach(function (el) { io.observe(el); });
  } else { rev.forEach(function (el) { el.classList.add("in"); }); }

  /* Counters */
  var counters = $$("[data-count]");
  function countUp(el) {
    var to = +el.getAttribute("data-count"), t0 = null;
    function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1400), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  if (hasIO && !reduce && counters.length) {
    counters.forEach(function (el) { el.textContent = "0"; });
    var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } }); }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* Scroll: progress bar, compact header, hero parallax, mobile call bar */
  var hdr = $(".hdr"), heroImg = $(".hero > img") || $(".banner > img"), callbar = $(".callbar"), ticking = false;
  var prog = document.createElement("div"); prog.className = "progress-bar"; prog.setAttribute("aria-hidden", "true"); document.body.appendChild(prog);
  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0, H = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.transform = "scaleX(" + (H > 0 ? Math.min(1, y / H) : 0) + ")";
    if (hdr) hdr.classList.toggle("scrolled", y > 40);
    if (heroImg && !reduce && y < 1400) heroImg.style.translate = "0 " + (y * 0.3).toFixed(1) + "px";
    if (callbar) callbar.classList.toggle("show", y > 280);
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* Gallery filters */
  var filters = $(".filters");
  if (filters) {
    filters.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var f = b.getAttribute("data-f");
      $$("button", filters).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $$(".gal figure").forEach(function (fig) {
        var show = f === "all" || fig.getAttribute("data-cat") === f;
        fig.hidden = !show;
        if (show && !reduce) { fig.classList.remove("pop"); void fig.offsetWidth; fig.classList.add("pop"); }
      });
    });
  }

  /* ---- Driveway designer (canvas) ---- */
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hex(h) { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function c255(v) { return v < 0 ? 0 : v > 255 ? 255 : v | 0; }
  function rgb(a, f) { return "rgb(" + c255(a[0] * f) + "," + c255(a[1] * f) + "," + c255(a[2] * f) + ")"; }
  function patBricks(type, W, H, u, R) {
    var b = [], i, j, n, k;
    if (type === "herringbone") { var N = Math.ceil((W + H) / u) + 4;
      for (n = -N; n < N; n++) for (k = -N; k < N; k++) { var x = (n + 2 * k) * u, y = (n - 2 * k) * u;
        if (x > -3 * u && x < W + u && y > -3 * u && y < H + u) { b.push([x, y, 2 * u, u]); b.push([x, y + u, u, 2 * u]); } } }
    else if (type === "running") { for (j = -1; j * u < H + u; j++) { var off = (j % 2 ? u : 0) - 2 * u; for (i = 0; off + i * 2 * u < W + 2 * u; i++) b.push([off + i * 2 * u, j * u, 2 * u, u]); } }
    else if (type === "basket") { for (j = -1; j * 2 * u < H + 2 * u; j++) for (i = -1; i * 2 * u < W + 2 * u; i++) { var x0 = i * 2 * u, y0 = j * 2 * u;
      if ((i + j) & 1) { b.push([x0, y0, 2 * u, u]); b.push([x0, y0 + u, 2 * u, u]); } else { b.push([x0, y0, u, 2 * u]); b.push([x0 + u, y0, u, 2 * u]); } } }
    else if (type === "cobble") { var cu = u * 1.15; for (j = -1; j * cu < H + cu; j++) { var o2 = R() * cu; for (i = -1; i * cu < W + cu; i++) { var sz = cu * (.86 + R() * .16); b.push([o2 + i * cu + (cu - sz) / 2, j * cu + (cu - sz) / 2, sz, sz * (.9 + R() * .12)]); } } }
    return b;
  }
  function drawBricks(ctx, list, pal, joint, R, rough) {
    var P = pal.map(hex), e = Math.max(1, joint * .5);
    for (var q = 0; q < list.length; q++) { var r = list[q], c = P[(R() * P.length) | 0], f = .86 + R() * .26, j = joint / 2, x = r[0] + j, y = r[1] + j, w = r[2] - joint, h = r[3] - joint;
      if (w <= 0 || h <= 0) continue;
      ctx.fillStyle = rgb(c, f); ctx.fillRect(x, y, w, h);
      ctx.fillStyle = rgb(c, f * 1.18); ctx.fillRect(x, y, w, e); ctx.fillRect(x, y, e, h);
      ctx.fillStyle = rgb(c, f * .7); ctx.fillRect(x, y + h - e, w, e); ctx.fillRect(x + w - e, y, e, h);
      for (var z = 0; z < rough; z++) { ctx.fillStyle = rgb(c, .6 + R() * .7); var s2 = 1 + R() * 2.5; ctx.fillRect(x + R() * (w - s2), y + R() * (h - s2), s2, s2); } }
  }
  var PAVERS = { charcoal: ["#3b3d3f", "#45474a", "#2f3133", "#50524f", "#3a3936"], granite: ["#8a8c8a", "#7b7e7c", "#999b97", "#6f7270", "#a3a39d"], tan: ["#b59a74", "#a6896a", "#c4ab83", "#8f7457", "#bca17a"], brick: ["#8e4434", "#7d3a2d", "#9c5040", "#6f3328", "#a35a45"] };
  var NAMES = L.names;
  var BORDER = { charcoal: "granite", granite: "charcoal", tan: "brick", brick: "charcoal" };
  function paverField(ctx, x, y, w, h, type, col, u, seed, rot) {
    var R = rng(seed); ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = "#2c2924"; ctx.fillRect(x, y, w, h);
    var jt = Math.max(1.5, u * .09), rough = type === "cobble" ? 6 : 2;
    if (rot) { var D = Math.sqrt(w * w + h * h) + 4 * u; ctx.translate(x + w / 2, y + h / 2); ctx.rotate(Math.PI / 4); ctx.translate(-D / 2, -D / 2); drawBricks(ctx, patBricks(type, D, D, u, R), PAVERS[col], jt, R, rough); }
    else { ctx.translate(x, y); drawBricks(ctx, patBricks(type, w, h, u, R), PAVERS[col], jt, R, rough); }
    ctx.restore();
  }
  function grass(ctx, x, y, w, h, seed) {
    var R = rng(seed); ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = "#3c6b2c"; ctx.fillRect(x, y, w, h);
    var sw = Math.max(24, h / 6); for (var s = 0; s * sw < h; s++) if (s % 2) { ctx.fillStyle = "rgba(255,255,255,.05)"; ctx.fillRect(x, y + s * sw, w, sw); }
    ctx.lineWidth = 1.2; var n = Math.floor(w * h / 40), cols = ["#2f5a22", "#4a7d35", "#57903e", "#335f26", "#65a046"];
    for (var i = 0; i < n; i++) { var gx = x + R() * w, gy = y + R() * h, l = 2 + R() * 5; ctx.strokeStyle = cols[(R() * 5) | 0]; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + (R() - .5) * 2, gy - l); ctx.stroke(); }
    ctx.restore();
  }
  function shrub(ctx, cx, cy, r, seed) { var R = rng(seed), cols = ["#2f6b2a", "#3e8a34", "#4fa043", "#285c24", "#5fae4a"]; ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.arc(cx + r * .15, cy + r * .18, r, 0, 7); ctx.fill();
    for (var i = 0; i < 26; i++) { var a = R() * 6.283, dd = R() * r * .7; ctx.fillStyle = cols[(R() * 5) | 0]; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * dd, cy + Math.sin(a) * dd, r * (.25 + R() * .3), 0, 7); ctx.fill(); } }
  function design() { return { p: $("input[name=pat]:checked").value, c: $("input[name=col]:checked").value, b: $("#dzBorder").checked }; }
  var dzRaf = 0;
  function drawDesigner(anim) {
    var cv = $("#dzCanvas"); if (!cv) return;
    var r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.min(1400, Math.round(r.width * dpr)), h = Math.round(w * 10 / 16);
    cv.width = w; cv.height = h;
    var off = document.createElement("canvas"); off.width = w; off.height = h;
    var c = off.getContext("2d"), d = design();
    var g = w * .16, u = Math.max(12, w / 48);
    /* prepared gravel bed shown before the pavers are laid */
    var bed = document.createElement("canvas"); bed.width = w; bed.height = h; var bc = bed.getContext("2d"), BR = rng(98);
    grass(bc, 0, 0, g, h, 91); grass(bc, w - g, 0, g, h, 92);
    bc.fillStyle = "#77736a"; bc.fillRect(g, 0, w - 2 * g, h);
    for (var q = 0; q < (w - 2 * g) * h / 30; q++) { bc.fillStyle = ["#8d887d", "#5f5b54", "#a19b8e", "#6c675e"][(BR() * 4) | 0]; bc.fillRect(g + BR() * (w - 2 * g), BR() * h, 1 + BR() * 3, 1 + BR() * 3); }
    grass(c, 0, 0, g, h, 91); grass(c, w - g, 0, g, h, 92);
    paverField(c, g, 0, w - 2 * g, h, d.p, d.c, u, 93, d.p === "herringbone");
    if (d.b) { var R = rng(94), bl = []; for (var y = -u; y < h; y += u) { bl.push([g, y, 2 * u, u]); bl.push([w - g - 2 * u, y, 2 * u, u]); } c.fillStyle = "#24221f"; c.fillRect(g, 0, 2 * u, h); c.fillRect(w - g - 2 * u, 0, 2 * u, h); drawBricks(c, bl, PAVERS[BORDER[d.c]], Math.max(1.5, u * .09), R, 2); }
    c.fillStyle = "rgba(0,0,0,.35)"; c.fillRect(g - 3, 0, 3, h); c.fillRect(w - g, 0, 3, h);
    shrub(c, g * .45, h * .22, g * .3, 95); shrub(c, g * .5, h * .72, g * .26, 96); shrub(c, w - g * .5, h * .45, g * .32, 97);
    var vg = c.createRadialGradient(w * .45, h * .35, Math.min(w, h) * .2, w / 2, h / 2, Math.max(w, h) * .75); vg.addColorStop(0, "rgba(255,240,210,.06)"); vg.addColorStop(1, "rgba(0,0,0,.35)"); c.fillStyle = vg; c.fillRect(0, 0, w, h);
    $("#dzLabel").textContent = NAMES[d.p] + " · " + NAMES[d.c] + (d.b ? " · " + NAMES[BORDER[d.c]] + L.border : "");
    var vc = cv.getContext("2d");
    cancelAnimationFrame(dzRaf);
    if (!anim || reduce) { vc.drawImage(off, 0, 0); return; }
    /* lay the pavers from the street end (bottom) up to the garage */
    var t0 = null;
    function frame(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 1100), e = 1 - Math.pow(1 - p, 3), edge = Math.round(h * (1 - e));
      vc.drawImage(bed, 0, 0);
      if (h - edge > 0) vc.drawImage(off, 0, edge, w, h - edge, 0, edge, w, h - edge);
      if (p < 1) { vc.fillStyle = "rgba(108,192,74,.95)"; vc.fillRect(g, Math.max(0, edge - 2), w - 2 * g, 3); dzRaf = requestAnimationFrame(frame); }
    }
    dzRaf = requestAnimationFrame(frame);
  }
  if ($("#dzCanvas")) {
    $$("input[name=pat],input[name=col],#dzBorder").forEach(function (el) { el.addEventListener("change", function () { drawDesigner(true); }); });
    $("#dzQuote").addEventListener("click", function () {
      var d = design(), msg = L.want(NAMES[d.p], NAMES[d.c], d.b ? NAMES[BORDER[d.c]] : "");
      try { sessionStorage.setItem("ar-design", msg); } catch (e) {}
      location.href = "contact.html#estimate";
    });
    drawDesigner(false);
    if (hasIO && !reduce) {
      var dio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { drawDesigner(true); dio.disconnect(); } }, { threshold: 0.45 });
      dio.observe($("#dzCanvas"));
    }
    var lw = window.innerWidth, rz; window.addEventListener("resize", function () { if (Math.abs(window.innerWidth - lw) < 40) return; lw = window.innerWidth; clearTimeout(rz); rz = setTimeout(function () { drawDesigner(false); }, 200); });
  }

  /* ---- Estimate form ---- */
  var form = $("#estForm");
  if (form) {
    try { var saved = sessionStorage.getItem("ar-design"); if (saved) { $("#f-notes").value = saved; $("#f-svc").selectedIndex = 0; sessionStorage.removeItem("ar-design"); } } catch (e) {}
    var q = new URLSearchParams(location.search).get("service"); if (q) { $$("#f-svc option").forEach(function (o) { if (o.value === q) $("#f-svc").value = q; }); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = $("#f-name").value.trim(), p = $("#f-phone").value.trim(), err = $("#f-err");
      if (!n || !p) { err.textContent = !n ? L.errName : L.errPhone; err.hidden = false; (n ? $("#f-phone") : $("#f-name")).focus(); return; }
      if ($("#f-hp").value) return;
      err.hidden = true;
      var btn = $("button[type=submit]", form); btn.disabled = true; btn.textContent = L.sending;
      var data = { name: n, phone: p, email: $("#f-email").value.trim(), town: $("#f-town").value.trim(), service: $("#f-svc").value, details: $("#f-notes").value.trim(), _subject: L.subject + $("#f-svc").value };
      function done(sent) {
        $("#f-sum").textContent = n + ", " + data.service.toLowerCase() + (data.town ? L.in_ + data.town : "") + ".";
        $("#f-msg").textContent = sent ? L.sent : L.callUs;
        $("#f-done").hidden = false; btn.textContent = L.received; $("#f-done").scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (!FORM_ENDPOINT) { done(false); return; }
      fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw 0; done(true); })
        .catch(function () { btn.disabled = false; btn.textContent = L.submit; err.textContent = L.fail; err.hidden = false; });
    });
  }
  /* ---- Rain test: live grading demo ---- */
  var rc = $("#rainCanvas");
  if (rc) (function () {
    var RL = ES ? { house: "CASA", basement: "SÓTANO", street: "HACIA LA CALLE →", spout: "BAJANTE", toward: "El agua corre hacia sus cimientos", flat: "Terreno plano: el agua se encharca", away: "El agua se aleja de la casa", wet: "Agua en el sótano", dry: "Sótano seco" }
                 : { house: "HOUSE", basement: "BASEMENT", street: "TO THE STREET →", spout: "DOWNSPOUT", toward: "Water is running toward your foundation", flat: "Flat yard: water sits and puddles", away: "Water runs away from the house", wet: "Water in the basement", dry: "Dry basement" };
    var ctx = rc.getContext("2d"), W = 0, H = 0, dpr = 1, xH = 0, gy = 0, A = 0, wallTop = 0, peakY = 0, bTop = 0, bBot = 0, bL = 0;
    var range = $("#rainSlope"), statusEl = $("#rainStatus"), presets = $$("[data-slope]");
    var slope = range ? range.value / 100 : -0.6, target = slope;
    var drops = [], runs = [], sparks = [], drips = [], pool = 120, base = 0.2, visible = false, raf = 0, last = 0, burst = 0, lastState = "";
    function size() {
      var r = rc.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      W = Math.max(300, Math.round(r.width * dpr)); H = Math.max(200, Math.round(r.height * dpr)); rc.width = W; rc.height = H;
      xH = W * 0.32; gy = H * 0.6; A = H * 0.2; wallTop = gy - H * 0.3; peakY = wallTop - H * 0.15;
      bL = W * 0.05; bTop = gy + A * 0.5 + 8 * dpr; bBot = Math.min(H - 8 * dpr, bTop + H * 0.24);
    }
    function groundY(x) { var u = x < xH ? 0 : (x - xH) / (W - xH); return gy + slope * A * (u - 0.5); }
    function roofY(x) { var mid = xH * 0.5; return x <= mid ? wallTop - (peakY - wallTop) * -1 * (x / mid) : peakY + (wallTop - peakY) * ((x - mid) / (xH + 10 * dpr - mid)); }
    function poolLevel() { return Math.min(A * 0.42, Math.sqrt(Math.max(0, pool)) * 1.6 * dpr); }
    function poolEdge(Ly) { var x = xH; while (x < W && groundY(x) > Ly) x += 3; return x; }
    function spawn(n) {
      for (var i = 0; i < n && drops.length < 420; i++) drops.push({ x: Math.random() * W, y: -Math.random() * H * 0.3, v: (900 + Math.random() * 500) * dpr / 1.5 });
    }
    function setStatus() {
      var st = slope < -0.12 ? "warn" : slope > 0.12 ? "ok" : "flat";
      var txt = (st === "warn" ? RL.toward : st === "ok" ? RL.away : RL.flat) + " · " + (base > 0.06 ? RL.wet : RL.dry);
      if (txt !== lastState && statusEl) { statusEl.textContent = txt; statusEl.className = "rain-status " + st; lastState = txt; }
    }
    function step(dt) {
      slope += (target - slope) * Math.min(1, dt * 3.5);
      spawn(Math.round((150 + burst * 900) * dt * (W / (900 * dpr)) + Math.random()));
      burst = Math.max(0, burst - dt * 0.6);
      var Ly = poolLevel() > 1 ? groundY(xH) - poolLevel() : 1e9, pe = Ly < 1e9 ? poolEdge(Ly) : xH, roofEnd = xH + 10 * dpr;
      for (var i = drops.length - 1; i >= 0; i--) {
        var d = drops[i]; d.y += d.v * dt;
        if (d.x < roofEnd && d.y >= roofY(d.x)) { drops.splice(i, 1); runs.push({ x: xH + 8 * dpr + Math.random() * 6 * dpr, life: 3 + Math.random() * 2, spout: true }); continue; }
        if (d.x >= roofEnd) {
          if (Ly < 1e9 && d.x < pe && d.y >= Ly) { drops.splice(i, 1); pool += 0.25; sparks.push({ x: d.x, y: Ly, vx: (Math.random() - .5) * 60 * dpr, vy: -120 * dpr * Math.random(), life: .35 }); continue; }
          var g = groundY(d.x);
          if (d.y >= g) {
            drops.splice(i, 1);
            if (Math.random() < .5) sparks.push({ x: d.x, y: g - 1, vx: (Math.random() - .5) * 90 * dpr, vy: -(60 + Math.random() * 120) * dpr, life: .3 + Math.random() * .2 });
            if (Math.random() < .55) runs.push({ x: d.x, life: 2 + Math.random() * 2.5 });
            continue;
          }
        }
        if (d.y > H) drops.splice(i, 1);
      }
      var speed = 230 * dpr * slope;
      for (var j = runs.length - 1; j >= 0; j--) {
        var r = runs[j]; r.life -= dt * (Math.abs(slope) < 0.1 ? 1.6 : 0.5);
        r.x += (speed + (r.spout ? speed * 0.4 : 0)) * dt * (0.75 + Math.random() * 0.5);
        if (r.x <= xH + 2 * dpr) { runs.splice(j, 1); pool += 1; continue; }
        if (r.x >= W || r.life <= 0) { runs.splice(j, 1); continue; }
        if (Ly < 1e9 && r.x < pe) { runs.splice(j, 1); pool += 0.6; continue; }
      }
      if (runs.length > 900) runs.splice(0, runs.length - 900);
      for (var k = sparks.length - 1; k >= 0; k--) { var s = sparks[k]; s.life -= dt; s.vy += 900 * dpr * dt; s.x += s.vx * dt; s.y += s.vy * dt; if (s.life <= 0) sparks.splice(k, 1); }
      if (slope > 0.12) pool = Math.max(0, pool - dt * (60 + pool * 0.6)); else pool = Math.max(0, pool - dt * 4);
      pool = Math.min(pool, 900);
      if (pool > 20 && slope < 0.12) { base = Math.min(1, base + dt * pool * 0.00006); if (Math.random() < dt * 6) drips.push({ x: xH - 6 * dpr - Math.random() * 4 * dpr, y: bTop + 6 * dpr, vy: 0 }); }
      else base = Math.max(0, base - dt * (slope > 0.12 ? 0.22 : 0.04));
      for (var m = drips.length - 1; m >= 0; m--) { var q = drips[m]; q.vy += 700 * dpr * dt; q.y += q.vy * dt; if (q.y > bBot - (bBot - bTop) * 0.6 * base - 2) drips.splice(m, 1); }
      setStatus();
    }
    function draw() {
      var c = ctx, sky = c.createLinearGradient(0, 0, 0, gy);
      sky.addColorStop(0, "#0a1510"); sky.addColorStop(1, "#14271c"); c.fillStyle = sky; c.fillRect(0, 0, W, H);
      /* rain */
      c.strokeStyle = "rgba(175,205,235,.55)"; c.lineWidth = 1.2 * dpr; c.beginPath();
      for (var i = 0; i < drops.length; i++) { var d = drops[i]; c.moveTo(d.x, d.y); c.lineTo(d.x - 1.5 * dpr, d.y - 14 * dpr); }
      c.stroke();
      /* ground */
      c.beginPath(); c.moveTo(0, groundY(0));
      for (var x = 0; x <= W; x += 6) c.lineTo(x, groundY(x));
      c.lineTo(W, H); c.lineTo(0, H); c.closePath();
      var soil = c.createLinearGradient(0, gy - A, 0, H); soil.addColorStop(0, "#5b4632"); soil.addColorStop(1, "#2e2318"); c.fillStyle = soil; c.fill();
      c.strokeStyle = "#4b8a36"; c.lineWidth = 7 * dpr; c.beginPath(); c.moveTo(xH, groundY(xH)); for (x = xH; x <= W; x += 6) c.lineTo(x, groundY(x)); c.stroke();
      /* basement cutaway */
      var bh = bBot - bTop; c.fillStyle = "#121a16"; c.fillRect(bL, bTop, xH - bL, bh);
      if (base > 0.01) { c.fillStyle = "rgba(79,163,217,.75)"; c.fillRect(bL, bBot - bh * 0.6 * base, xH - bL, bh * 0.6 * base); }
      c.fillStyle = "rgba(79,163,217,.9)"; for (var m = 0; m < drips.length; m++) c.fillRect(drips[m].x, drips[m].y, 2 * dpr, 5 * dpr);
      c.strokeStyle = "#8a8c8a"; c.lineWidth = 6 * dpr; c.strokeRect(bL, bTop, xH - bL, bh);
      c.fillStyle = "rgba(220,225,220,.55)"; c.font = "700 " + Math.round(11 * dpr) + "px Poppins, sans-serif"; c.textAlign = "center";
      c.fillText(RL.basement, (bL + xH) / 2, bTop + 20 * dpr);
      /* house */
      c.fillStyle = "#6f726f"; c.fillRect(bL - 6 * dpr, groundY(xH) - 6 * dpr, xH - bL + 6 * dpr, bTop - groundY(xH) + 6 * dpr);
      c.fillStyle = "#2c3d33"; c.fillRect(bL - 6 * dpr, wallTop, xH - bL + 6 * dpr, groundY(xH) - wallTop - 4 * dpr);
      c.strokeStyle = "rgba(255,255,255,.05)"; c.lineWidth = 1 * dpr; for (var yy = wallTop + 10 * dpr; yy < groundY(xH); yy += 10 * dpr) { c.beginPath(); c.moveTo(bL - 6 * dpr, yy); c.lineTo(xH, yy); c.stroke(); }
      var winW = (xH - bL) * 0.26, winH = (gy - wallTop) * 0.34, wx = bL + (xH - bL) * 0.18, wy = wallTop + (gy - wallTop) * 0.22;
      c.fillStyle = "#f2c66d"; c.globalAlpha = .85; c.fillRect(wx, wy, winW, winH); c.fillRect(wx + winW * 1.6, wy, winW, winH); c.globalAlpha = 1;
      c.fillStyle = "#4a3b34"; c.beginPath(); c.moveTo(bL - 16 * dpr, wallTop); c.lineTo(xH * 0.5, peakY); c.lineTo(xH + 10 * dpr, wallTop); c.closePath(); c.fill();
      c.fillStyle = "#5d635e"; c.fillRect(xH, wallTop, 5 * dpr, groundY(xH) - wallTop - 4 * dpr);
      c.fillStyle = "rgba(220,225,220,.6)"; c.fillText(RL.house, (bL + xH) / 2, wallTop + (gy - wallTop) * 0.8);
      c.textAlign = "left"; c.font = "600 " + Math.round(10 * dpr) + "px Poppins, sans-serif"; c.fillText(RL.spout, xH + 9 * dpr, wallTop + 14 * dpr);
      /* pool against the foundation */
      var pl = poolLevel();
      if (pl > 1) {
        var Ly = groundY(xH) - pl, pe = poolEdge(Ly);
        c.beginPath(); c.moveTo(xH + 2, Ly); c.lineTo(pe, Ly); for (var px = pe; px >= xH; px -= 4) c.lineTo(px, groundY(px)); c.closePath();
        c.fillStyle = "rgba(79,163,217,.78)"; c.fill();
        c.strokeStyle = "rgba(200,230,255,.8)"; c.lineWidth = 1.5 * dpr; c.beginPath(); c.moveTo(xH + 2, Ly); c.lineTo(pe, Ly); c.stroke();
      }
      /* runoff */
      c.fillStyle = "rgba(120,185,235,.85)";
      for (var j = 0; j < runs.length; j++) { var r = runs[j]; c.fillRect(r.x, groundY(r.x) - 3 * dpr, 3 * dpr, 2 * dpr); }
      c.fillStyle = "rgba(190,220,245,.9)";
      for (var k = 0; k < sparks.length; k++) c.fillRect(sparks[k].x, sparks[k].y, 1.6 * dpr, 1.6 * dpr);
      c.textAlign = "right"; c.fillStyle = "rgba(220,225,220,.6)"; c.font = "700 " + Math.round(11 * dpr) + "px Poppins, sans-serif";
      c.fillText(RL.street, W - 12 * dpr, H - 14 * dpr);
    }
    function loop(ts) {
      var dt = Math.min(0.05, (ts - (last || ts)) / 1000); last = ts;
      step(dt); draw();
      if (visible) raf = requestAnimationFrame(loop); else last = 0;
    }
    function start() { if (!visible) { visible = true; last = 0; raf = requestAnimationFrame(loop); } }
    function stop() { visible = false; cancelAnimationFrame(raf); }
    function setTarget(v) {
      target = v / 100; if (range) range.value = v;
      presets.forEach(function (b) { b.setAttribute("aria-pressed", (+b.getAttribute("data-slope") > 0) === (v > 0) ? "true" : "false"); });
      if (reduce) { slope = target; pool = slope < -0.12 ? 260 : 0; base = slope < -0.12 ? 0.5 : 0; setStatus(); draw(); }
    }
    if (range) range.addEventListener("input", function () { setTarget(+range.value); });
    presets.forEach(function (b) { b.addEventListener("click", function () { setTarget(+b.getAttribute("data-slope")); }); });
    rc.addEventListener("click", function () { burst = 1; });
    size(); setTarget(range ? +range.value : -60); setStatus(); draw();
    if (!reduce) {
      for (var w = 0; w < 40; w++) spawn(4);
      if (hasIO) { new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }, { threshold: 0.15 }).observe(rc); } else start();
    }
    var lw2 = window.innerWidth; window.addEventListener("resize", function () { if (Math.abs(window.innerWidth - lw2) < 40) return; lw2 = window.innerWidth; size(); draw(); });
  })();

  /* ---- Dust kicked up when the gravel compacts and the pavers land ---- */
  var lay = $(".layers");
  if (lay && !reduce) (function () {
    var fig = lay.parentNode, dc = document.createElement("canvas"); dc.className = "dust"; dc.setAttribute("aria-hidden", "true"); fig.appendChild(dc);
    var dctx = dc.getContext("2d"), parts = [], running = false, lastT = 0, dp = Math.min(window.devicePixelRatio || 1, 1.75);
    function fit() { dc.width = Math.round(dc.clientWidth * dp); dc.height = Math.round(dc.clientHeight * dp); }
    function puff(el, n) {
      fit();
      var fr = dc.getBoundingClientRect(), er = el.getBoundingClientRect(), y = (er.top - fr.top) * dp;
      for (var i = 0; i < n; i++) parts.push({ x: Math.random() * dc.width, y: y + (Math.random() - .3) * 8 * dp, vx: (Math.random() - .5) * 120 * dp, vy: -(20 + Math.random() * 90) * dp, r: (4 + Math.random() * 12) * dp, life: 1, decay: .5 + Math.random() * .6, tone: Math.random() < .5 ? "205,187,146" : "160,150,132" });
      if (!running) { running = true; lastT = 0; requestAnimationFrame(tick); }
    }
    function tick(ts) {
      var dt = Math.min(0.05, (ts - (lastT || ts)) / 1000); lastT = ts;
      dctx.clearRect(0, 0, dc.width, dc.height);
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i]; p.life -= dt * p.decay; p.vx *= 0.98; p.vy *= 0.97; p.x += p.vx * dt; p.y += p.vy * dt; p.r += 14 * dp * dt;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        dctx.fillStyle = "rgba(" + p.tone + "," + (p.life * 0.35).toFixed(3) + ")"; dctx.beginPath(); dctx.arc(p.x, p.y, p.r, 0, 6.283); dctx.fill();
      }
      if (parts.length) requestAnimationFrame(tick); else { running = false; dctx.clearRect(0, 0, dc.width, dc.height); }
    }
    var l3 = $(".l3", lay), l1 = $(".l1", lay);
    if (l3) l3.addEventListener("animationend", function () { puff(l3, 60); });
    if (l1) l1.addEventListener("animationend", function () { puff(l1, 90); });
  })();

  /* ---- 3D tilt on cards (mouse only) ---- */
  if (!reduce && window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$(".svc, .theme, .value").forEach(function (card) {
      var raf2 = 0;
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        cancelAnimationFrame(raf2);
        raf2 = requestAnimationFrame(function () {
          card.classList.add("tilt");
          card.style.setProperty("--ry", ((x - .5) * 10).toFixed(2) + "deg");
          card.style.setProperty("--rx", ((.5 - y) * 8).toFixed(2) + "deg");
          card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
          card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
        });
      });
      card.addEventListener("pointerleave", function () { cancelAnimationFrame(raf2); card.classList.remove("tilt"); card.style.removeProperty("--rx"); card.style.removeProperty("--ry"); });
    });
  }
  /* ---- Site mascot: a crew member who walks along with the scroll ---- */
  (function () {
    var LINES = ES ? { design: "Elija un patrón. Yo lo coloco.", base: "Primero la base. Siempre.", rain: "¿Pendiente mal? Saque el paraguas.", reviews: "¡59 reseñas y contando!", faq: "Pregúnteme lo que sea.", cta: "¿Listo? Pida su presupuesto gratis." }
                   : { design: "Pick a pattern. I'll lay it.", base: "Base first. Always.", rain: "Wrong slope? Grab an umbrella.", reviews: "59 reviews and counting!", faq: "Ask me anything.", cta: "Ready? Get your free estimate." };
    var TOOL = { design: "t-shovel", base: "t-shovel", rain: "t-umbrella", reviews: "t-clip", faq: "t-clip", cta: "t-clip" };
    var SVG = '<svg viewBox="0 -12 80 132" aria-hidden="true" focusable="false">' +
      '<ellipse cx="40" cy="113" rx="17" ry="3.5" fill="rgba(0,0,0,.35)"/>' +
      '<g class="leg leg-a"><rect x="33" y="76" width="8.5" height="30" rx="3" fill="#2a3a31"/><rect x="31" y="102" width="13" height="7" rx="2.5" fill="#4a3424"/></g>' +
      '<g class="leg leg-b"><rect x="40" y="76" width="8.5" height="30" rx="3" fill="#33473b"/><rect x="39" y="102" width="13" height="7" rx="2.5" fill="#5a4030"/></g>' +
      '<g class="upper">' +
        '<rect x="30" y="50" width="7" height="22" rx="3" fill="#35793a"/>' +
        '<rect x="28" y="45" width="26" height="35" rx="7" fill="#F08A24"/>' +
        '<rect x="28" y="60" width="26" height="4" fill="#DCE1DC"/><rect x="33" y="45" width="3.5" height="35" fill="#DCE1DC"/><rect x="46" y="45" width="3.5" height="35" fill="#DCE1DC"/>' +
        '<circle cx="41" cy="33" r="11" fill="#C98E62"/>' +
        '<circle cx="46" cy="32" r="1.7" fill="#14201A"/><path d="M43 38 q3 2 6 -1" stroke="#14201A" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
        '<path d="M30 28 Q41 10 52 28 Z" fill="#F2C230"/><rect x="27" y="26.5" width="29" height="4" rx="2" fill="#E0AE1C"/><rect x="39.5" y="15" width="3" height="12" rx="1.5" fill="#E0AE1C"/>' +
        '<g class="arm">' +
          '<g class="tool tool-shovel"><line x1="47" y1="38" x2="53" y2="98" stroke="#8B5A2B" stroke-width="3.2" stroke-linecap="round"/><path d="M47.5 95 L58.5 94 L57 108 Q53.5 113 50 108 Z" fill="#9aa3a0"/></g>' +
          '<g class="tool tool-umbrella"><path d="M49 72 L49 20" stroke="#222" stroke-width="2.4"/><path d="M22 22 Q49 -10 76 22 Q69 17 62 22 Q55.5 16 49 22 Q42.5 16 36 22 Q29 17 22 22 Z" fill="#4FA043" stroke="#2f6b2a" stroke-width="1.2"/></g>' +
          '<g class="tool tool-clip"><rect x="49" y="58" width="17" height="21" rx="2" fill="#8B5A2B"/><rect x="51" y="61" width="13" height="16" rx="1" fill="#fff"/><rect x="54.5" y="56" width="6" height="4" rx="1" fill="#9aa3a0"/><path d="M53 66h9M53 70h9M53 74h6" stroke="#4FA043" stroke-width="1.4"/></g>' +
          '<rect x="45" y="49" width="7" height="22" rx="3" fill="#3E8E3A"/><circle cx="48.5" cy="72" r="3.8" fill="#C98E62"/>' +
        '</g>' +
      '</g></svg>';
    var w = document.createElement("a");
    w.className = "worker t-shovel"; w.href = "contact.html";
    w.setAttribute("aria-label", ES ? "Pida un presupuesto gratis" : "Get a free estimate");
    w.innerHTML = '<span class="bubble" aria-hidden="true"></span>' + SVG;
    document.body.appendChild(w);
    var bubble = $(".bubble", w), lastY = window.scrollY || 0, idleT, bubT, cur = "", queued = false;
    function say(txt) { if (!txt) return; bubble.textContent = txt; bubble.classList.add("show"); clearTimeout(bubT); bubT = setTimeout(function () { bubble.classList.remove("show"); }, 2800); }
    function place() {
      queued = false;
      var y = window.scrollY || window.pageYOffset || 0, Hd = document.documentElement.scrollHeight - window.innerHeight;
      var p = Hd > 0 ? Math.min(1, Math.max(0, y / Hd)) : 0, size = w.offsetWidth || 60, m = 12;
      var x = m + p * (window.innerWidth - size - 2 * m);
      w.style.setProperty("--wx", x.toFixed(1) + "px");
      w.classList.toggle("bright", x > window.innerWidth / 2);
      if (y !== lastY && !reduce) {
        w.classList.toggle("left", y < lastY); w.classList.add("walking");
        clearTimeout(idleT); idleT = setTimeout(function () { w.classList.remove("walking"); }, 180);
      }
      lastY = y;
    }
    window.addEventListener("scroll", function () { if (!queued) { queued = true; requestAnimationFrame(place); } }, { passive: true });
    window.addEventListener("resize", place);
    place();
    var targets = [["design", $("#design")], ["base", lay ? lay.parentNode : null], ["rain", $("#rain")], ["reviews", $("#reviews")], ["faq", $("#faq")], ["cta", $(".cta")]].filter(function (t) { return t[1]; });
    if (hasIO && targets.length) {
      var sio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var k = e.target._mk; if (k === cur) return; cur = k;
          w.className = w.className.replace(/\bt-[a-z]+/, TOOL[k] || "t-shovel");
          say(LINES[k]);
        });
      }, { rootMargin: "-40% 0px -40% 0px" });
      targets.forEach(function (t) { t[1]._mk = t[0]; sio.observe(t[1]); });
    }
    w.addEventListener("mouseenter", function () { say(LINES.cta); });
  })();

  /* ---- Short film: call → drive → quote → fix → done ---- */
  var film = $("#film");
  if (film) (function () {
    var svg = $("svg", film), S = [0, 3.2, 8, 11, 14.2, 18], D = 18;
    var sc = [1, 2, 3, 4, 5].map(function (i) { return $("#sc" + i, svg); });
    var route = $("#froute", svg), truck = $("#truck", svg), eta = $("#f-eta", svg), cap = $("#f-cap", svg), prog = $("#f-prog", svg), calling = $("#f-calling", svg);
    var rips = $$(".rip", svg), rows = $$(".qrow", svg), stamp = $("#stamp", svg), fixrect = $("#fixrect", svg), edge = $("#f-edge", svg), ba = $("#f-ba", svg), stars = $$(".fstar", svg), fcheck = $("#fcheck", svg), conf = $("#conf", svg);
    var chapters = $$(".chapters button", film), sideCap = $(".film-cap", film), replay = $(".film-replay", film);
    var caps = chapters.map(function (b) { return b.getAttribute("data-cap"); });
    var TXT = { calling: film.getAttribute("data-calling"), eta: film.getAttribute("data-eta"), arrived: film.getAttribute("data-arrived"), before: film.getAttribute("data-before"), after: film.getAttribute("data-after") };
    var RL = route.getTotalLength(); route.style.strokeDasharray = RL + " " + RL;
    var cps = [], NS = "http://www.w3.org/2000/svg", cols = ["#6CC04A", "#FBBC04", "#F08A24", "#DCE1DC", "#4FA043"];
    for (var i = 0; i < 46; i++) { var r = document.createElementNS(NS, "rect"); r.setAttribute("width", (6 + Math.random() * 6).toFixed(1)); r.setAttribute("height", (10 + Math.random() * 8).toFixed(1)); r.setAttribute("fill", cols[i % 5]); conf.appendChild(r); cps.push({ el: r, x: Math.random() * 600, d: Math.random() * 0.9, sp: 200 + Math.random() * 230, rot: Math.random() * 360, vr: (Math.random() - .5) * 540, sw: 10 + Math.random() * 30 }); }
    function cl(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function ez(v) { v = cl(v); return v < .5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2; }
    function back(v) { v = cl(v); var c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2); }
    var t = 0, raf = 0, last = 0, lastK = -1, seen = false, inView = false;
    function render() {
      var k = 4; for (var q = 0; q < 5; q++) if (t < S[q + 1]) { k = q; break; }
      for (var j = 0; j < 5; j++) {
        var a = S[j], b = S[j + 1], fi = j === 0 ? 1 : cl((t - a) / .35), fo = j === 4 ? 1 : cl((b - t) / .35), o = Math.min(fi, fo);
        sc[j].style.opacity = o.toFixed(3); sc[j].style.visibility = o > .001 ? "visible" : "hidden";
      }
      /* 1 · call */
      var u = t;
      rips.forEach(function (c, n) { var ph = (u * .9 + n / 3) % 1; c.setAttribute("r", (52 + ph * 110).toFixed(1)); c.setAttribute("opacity", ((1 - ph) * .7).toFixed(2)); });
      calling.textContent = TXT.calling + ["", ".", "..", "..."][Math.floor(u * 3) % 4];
      /* 2 · drive */
      var p = ez((t - 3.6) / 3.7), pt = route.getPointAtLength(RL * p), pn = route.getPointAtLength(Math.min(RL, RL * p + 2)), pb = route.getPointAtLength(Math.max(0, RL * p - 2));
      var ang = Math.atan2(pn.y - pb.y, pn.x - pb.x) * 180 / Math.PI;
      route.style.strokeDashoffset = (RL * (1 - p)).toFixed(1);
      truck.setAttribute("transform", "translate(" + pt.x.toFixed(1) + " " + (pt.y - 2).toFixed(1) + ") rotate(" + ang.toFixed(1) + ")");
      eta.textContent = p < .999 ? TXT.eta.replace("%d", Math.max(1, Math.ceil(12 * (1 - p)))) : TXT.arrived;
      /* 3 · quote */
      u = t - 8;
      rows.forEach(function (g, n) { var o = cl((u - .3 - n * .5) / .3); g.setAttribute("opacity", o.toFixed(2)); g.setAttribute("transform", "translate(" + ((1 - o) * -24).toFixed(1) + " 0)"); });
      var st = cl((u - 2.1) / .35), sb = 1.7 - .7 * back((u - 2.1) / .35);
      stamp.setAttribute("opacity", st.toFixed(2)); stamp.setAttribute("transform", "translate(380 446) rotate(-12) scale(" + (st > 0 ? sb : 1).toFixed(3) + ")");
      /* 4 · fix */
      u = t - 11;
      var f = ez((u - .4) / 2.1), top = 600 - (600 - 192) * f;
      fixrect.setAttribute("y", top.toFixed(1)); fixrect.setAttribute("height", (600 - top).toFixed(1));
      edge.setAttribute("y", (top - 2).toFixed(1)); edge.setAttribute("opacity", f > 0 && f < 1 ? "1" : "0");
      ba.textContent = f < .5 ? TXT.before : TXT.after;
      /* 5 · done */
      u = t - 14.2;
      cps.forEach(function (c) { var tt = Math.max(0, u - c.d), y = -30 + tt * c.sp, x = c.x + Math.sin(tt * 3 + c.sw) * c.sw; c.el.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + (c.rot + tt * c.vr).toFixed(0) + ")"); c.el.setAttribute("opacity", u > c.d ? "1" : "0"); });
      fcheck.style.transform = "scale(" + (u > 0 ? back(u / .45) : 0).toFixed(3) + ")";
      stars.forEach(function (s, n) { s.style.opacity = cl((u - .5 - n * .15) / .2); });
      prog.setAttribute("width", (600 * t / D).toFixed(1));
      if (k !== lastK) { cap.textContent = caps[k]; sideCap.textContent = caps[k]; chapters.forEach(function (b, n) { if (n === k) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); }); lastK = k; }
    }
    function frame(ts) {
      var dt = Math.min(.05, (ts - (last || ts)) / 1000); last = ts; t += dt;
      if (t >= D) { t = D; render(); film.classList.add("ended"); return; }
      render(); if (inView) raf = requestAnimationFrame(frame);
    }
    function play(from) {
      t = from || 0; film.classList.remove("ended"); cancelAnimationFrame(raf);
      if (reduce) { render(); return; }
      last = 0; raf = requestAnimationFrame(frame);
    }
    chapters.forEach(function (b) { b.addEventListener("click", function () { play(S[+b.getAttribute("data-i")] + .01); }); });
    replay.addEventListener("click", function () { play(0); });
    if (reduce) { t = D; render(); }
    else {
      render();
      if (hasIO) new IntersectionObserver(function (es) {
        inView = es[0].isIntersecting;
        if (inView && !seen) { seen = true; play(0); }
        else if (inView && t < D) { last = 0; raf = requestAnimationFrame(frame); }
        else cancelAnimationFrame(raf);
      }, { threshold: .45 }).observe(svg);
      else { inView = true; play(0); }
    }
  })();

})();
