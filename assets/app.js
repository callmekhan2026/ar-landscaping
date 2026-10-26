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
      try { navigator.clipboard.writeText(v).then(function () { toast("Copied " + v); }, function () { toast(v); }); } catch (e) { toast(v); }
    });
  });

  /* Reveal on scroll */
  var rev = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    rev.forEach(function (el) { io.observe(el); });
  }
  setTimeout(function () { rev.forEach(function (el) { el.classList.add("in"); }); }, 2500);

  /* Gallery filters */
  var filters = $(".filters");
  if (filters) {
    filters.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var f = b.getAttribute("data-f");
      $$("button", filters).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $$(".gal figure").forEach(function (fig) { fig.hidden = !(f === "all" || fig.getAttribute("data-cat") === f); });
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
  var NAMES = { herringbone: "Herringbone 45°", running: "Running bond", basket: "Basketweave", cobble: "Cobblestone", charcoal: "Charcoal blend", granite: "Granite grey", tan: "Tan blend", brick: "Brick red" };
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
  function drawDesigner() {
    var cv = $("#dzCanvas"); if (!cv) return;
    var r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.min(1400, Math.round(r.width * dpr)), h = Math.round(w * 10 / 16);
    cv.width = w; cv.height = h; var c = cv.getContext("2d"), d = design();
    var g = w * .16, u = Math.max(12, w / 48);
    grass(c, 0, 0, g, h, 91); grass(c, w - g, 0, g, h, 92);
    paverField(c, g, 0, w - 2 * g, h, d.p, d.c, u, 93, d.p === "herringbone");
    if (d.b) { var R = rng(94), bl = []; for (var y = -u; y < h; y += u) { bl.push([g, y, 2 * u, u]); bl.push([w - g - 2 * u, y, 2 * u, u]); } c.fillStyle = "#24221f"; c.fillRect(g, 0, 2 * u, h); c.fillRect(w - g - 2 * u, 0, 2 * u, h); drawBricks(c, bl, PAVERS[BORDER[d.c]], Math.max(1.5, u * .09), R, 2); }
    c.fillStyle = "rgba(0,0,0,.35)"; c.fillRect(g - 3, 0, 3, h); c.fillRect(w - g, 0, 3, h);
    shrub(c, g * .45, h * .22, g * .3, 95); shrub(c, g * .5, h * .72, g * .26, 96); shrub(c, w - g * .5, h * .45, g * .32, 97);
    var vg = c.createRadialGradient(w * .45, h * .35, Math.min(w, h) * .2, w / 2, h / 2, Math.max(w, h) * .75); vg.addColorStop(0, "rgba(255,240,210,.06)"); vg.addColorStop(1, "rgba(0,0,0,.35)"); c.fillStyle = vg; c.fillRect(0, 0, w, h);
    $("#dzLabel").textContent = NAMES[d.p] + " · " + NAMES[d.c] + (d.b ? " · " + NAMES[BORDER[d.c]] + " border" : "");
  }
  if ($("#dzCanvas")) {
    $$("input[name=pat],input[name=col],#dzBorder").forEach(function (el) { el.addEventListener("change", drawDesigner); });
    $("#dzQuote").addEventListener("click", function () {
      var d = design(), msg = "Interested in a " + NAMES[d.p] + " driveway, " + NAMES[d.c] + (d.b ? ", with a " + NAMES[BORDER[d.c]] + " border course" : "") + ".";
      try { sessionStorage.setItem("ar-design", msg); } catch (e) {}
      location.href = "contact.html#estimate";
    });
    drawDesigner();
    var lw = window.innerWidth, rz; window.addEventListener("resize", function () { if (Math.abs(window.innerWidth - lw) < 40) return; lw = window.innerWidth; clearTimeout(rz); rz = setTimeout(drawDesigner, 200); });
  }

  /* ---- Estimate form ---- */
  var form = $("#estForm");
  if (form) {
    try { var saved = sessionStorage.getItem("ar-design"); if (saved) { $("#f-notes").value = saved; $("#f-svc").value = "Driveway or walkway paving"; sessionStorage.removeItem("ar-design"); } } catch (e) {}
    var q = new URLSearchParams(location.search).get("service"); if (q) { $$("#f-svc option").forEach(function (o) { if (o.value === q) $("#f-svc").value = q; }); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = $("#f-name").value.trim(), p = $("#f-phone").value.trim(), err = $("#f-err");
      if (!n || !p) { err.textContent = !n ? "Add your name so we know who to ask for." : "Add a phone number so we can schedule the visit."; err.hidden = false; (n ? $("#f-phone") : $("#f-name")).focus(); return; }
      if ($("#f-hp").value) return;
      err.hidden = true;
      var btn = $("button[type=submit]", form); btn.disabled = true; btn.textContent = "Sending…";
      var data = { name: n, phone: p, email: $("#f-email").value.trim(), town: $("#f-town").value.trim(), service: $("#f-svc").value, details: $("#f-notes").value.trim(), _subject: "New estimate request: " + $("#f-svc").value };
      function done(sent) {
        $("#f-sum").textContent = n + ", " + data.service.toLowerCase() + (data.town ? " in " + data.town : "") + ".";
        $("#f-msg").textContent = sent ? "We have your request and will call you to schedule the visit." : "Call us to lock in your estimate visit:";
        $("#f-done").hidden = false; btn.textContent = "Request received"; $("#f-done").scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (!FORM_ENDPOINT) { done(false); return; }
      fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw 0; done(true); })
        .catch(function () { btn.disabled = false; btn.textContent = "Request my free estimate"; err.textContent = "That didn't go through. Please call 781.299.2751 or try again."; err.hidden = false; });
    });
  }
})();
