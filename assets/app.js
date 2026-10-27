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
  var h1 = $(".hero h1");
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
    h1.classList.add("split");
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
})();
