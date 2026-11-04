/* ============================================================
   ALS — Hero Title Sequence
   A 15-second motion graphics piece.
   Single rAF timeline, scrubbable, no dependencies.
   ============================================================ */

(function () {
  "use strict";

  var reel = document.getElementById("als-reel");
  if (!reel) return;

  /* ---------- refs ---------- */
  var svg      = reel.querySelector(".reel-svg");
  var inkG     = svg.querySelector("#reel-ink");
  var seedLine = svg.querySelector("#reel-seedline");
  var seedDot  = svg.querySelector("#reel-seeddot");
  var bookG    = svg.querySelector("#reel-book");
  var treeG    = svg.querySelector("#reel-tree");
  var leafG    = svg.querySelector("#reel-leaves");
  var stage    = reel.querySelector(".reel-stage");
  var canvas   = reel.querySelector(".reel-canvas");
  var ctx      = canvas.getContext("2d");
  var kicker   = reel.querySelector(".reel-kicker");
  var words    = Array.prototype.slice.call(reel.querySelectorAll(".reel-word"));
  var sub      = reel.querySelector(".reel-sub");
  var sweep    = reel.querySelector(".reel-sweep");
  var photo    = reel.querySelector(".reel-photo");
  var replay   = reel.querySelector(".reel-replay");

  var NS = "http://www.w3.org/2000/svg";
  var DUR = 15.0;

  /* ---------- easing ---------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function seg(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  var E = {
    lin:  function (x) { return x; },
    out:  function (x) { return 1 - Math.pow(1 - x, 3); },
    out4: function (x) { return 1 - Math.pow(1 - x, 4); },
    io:   function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
    expo: function (x) { return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x); },
    back: function (x) { var c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }
  };

  /* ---------- geometry ----------
     viewBox is 400 x 400. The book sits on the baseline ~y=292,
     the tree grows out of its spine at y=256 up to y=92.          */

  var BOOK = [
    // outer page edges
    { d: "M200,258 C168,237 120,229 68,241",  w: 2.4, a: 1.10, b: 2.05 },
    { d: "M200,258 C232,237 280,229 332,241", w: 2.4, a: 1.18, b: 2.13 },
    // fore-edges
    { d: "M68,241 L63,277",                   w: 2.4, a: 1.80, b: 2.15 },
    { d: "M332,241 L337,277",                 w: 2.4, a: 1.86, b: 2.21 },
    // bottom sweep of the pages
    { d: "M63,277 C116,265 166,272 200,292",  w: 2.4, a: 2.00, b: 2.70 },
    { d: "M337,277 C284,265 234,272 200,292", w: 2.4, a: 2.06, b: 2.76 },
    // spine
    { d: "M200,258 L200,292",                 w: 2.4, a: 1.95, b: 2.35 },
    // interior page lines (detail)
    { d: "M186,262 C158,247 120,241 82,250",  w: 1.1, a: 2.50, b: 3.10 },
    { d: "M214,262 C242,247 280,241 318,250", w: 1.1, a: 2.56, b: 3.16 },
    { d: "M178,272 C152,259 118,254 86,261",  w: 1.0, a: 2.62, b: 3.22 },
    { d: "M222,272 C248,259 282,254 314,261", w: 1.0, a: 2.68, b: 3.28 }
  ];

  // trunk first, then branch pairs working upward
  var TREE = [
    { d: "M200,256 C200,226 197,196 200,120", w: 3.0, a: 2.90, b: 4.30, leaf: false },
    { d: "M200,216 C184,208 164,198 143,181", w: 2.1, a: 3.70, b: 4.60, leaf: true },
    { d: "M200,216 C216,208 236,198 257,181", w: 2.1, a: 3.78, b: 4.68, leaf: true },
    { d: "M200,194 C186,184 170,170 158,152", w: 1.9, a: 4.05, b: 4.95, leaf: true },
    { d: "M200,194 C214,184 230,170 242,152", w: 1.9, a: 4.13, b: 5.03, leaf: true },
    { d: "M200,170 C188,159 177,145 171,129", w: 1.7, a: 4.42, b: 5.30, leaf: true },
    { d: "M200,170 C212,159 223,145 229,129", w: 1.7, a: 4.50, b: 5.38, leaf: true },
    { d: "M200,146 C191,134 184,121 182,106", w: 1.5, a: 4.78, b: 5.62, leaf: true },
    { d: "M200,146 C209,134 216,121 218,106", w: 1.5, a: 4.86, b: 5.70, leaf: true },
    { d: "M200,120 C199,110 200,101 200,92",  w: 1.5, a: 5.05, b: 5.60, leaf: true },
    // short inner twigs
    { d: "M174,196 C166,189 158,184 149,181", w: 1.1, a: 5.20, b: 5.75, leaf: true },
    { d: "M226,196 C234,189 242,184 251,181", w: 1.1, a: 5.26, b: 5.81, leaf: true },
    { d: "M190,160 C183,152 178,145 176,137", w: 1.0, a: 5.40, b: 5.92, leaf: true },
    { d: "M210,160 C217,152 222,145 224,137", w: 1.0, a: 5.46, b: 5.98, leaf: true }
  ];

  var LEAF_D = "M0,0 C4.5,-5.4 12.5,-6.2 17,-0.2 C12.5,5.8 4.5,5.2 0,0 Z";

  /* ---------- build the artwork ---------- */
  var bookPaths = [], treePaths = [], leaves = [];

  function mkPath(spec, parent, cls) {
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", spec.d);
    p.setAttribute("class", cls);
    p.setAttribute("stroke-width", spec.w);
    parent.appendChild(p);
    var len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
    return { el: p, len: len, a: spec.a, b: spec.b };
  }

  BOOK.forEach(function (s) { bookPaths.push(mkPath(s, bookG, "reel-stroke")); });

  TREE.forEach(function (s) {
    var rec = mkPath(s, treeG, "reel-stroke reel-branch");
    treePaths.push(rec);
    if (!s.leaf) return;

    // Sample the branch and drop leaves along it, alternating sides.
    var n = Math.max(3, Math.round(rec.len / 15));
    for (var i = 0; i < n; i++) {
      var tt = 0.26 + (i / (n - 1 || 1)) * 0.74;        // skip the inner stub
      var pt = rec.el.getPointAtLength(rec.len * tt);
      var nx = rec.el.getPointAtLength(Math.min(rec.len, rec.len * tt + 1.2));
      var ang = Math.atan2(nx.y - pt.y, nx.x - pt.x) * 180 / Math.PI;
      var side = i % 2 ? 1 : -1;
      var tip = tt > 0.93;
      var scale = tip ? 1.06 : 0.62 + Math.random() * 0.3;
      var spread = tip ? 0 : side * (26 + Math.random() * 16);

      var g = document.createElementNS(NS, "g");
      var lf = document.createElementNS(NS, "path");
      lf.setAttribute("d", LEAF_D);
      lf.setAttribute("class", "reel-leaf");
      g.appendChild(lf);
      leafG.appendChild(g);

      // leaf appears just after its stretch of branch is drawn
      var at = s.a + (s.b - s.a) * tt + 0.22 + Math.random() * 0.5;
      leaves.push({
        el: g, x: pt.x, y: pt.y,
        rot: ang + spread,
        scale: scale,
        a: at, b: at + 0.62,
        spin: (Math.random() - 0.5) * 48
      });
    }
  });

  // Draw tips last so they sit on top
  leaves.sort(function (p, q) { return p.a - q.a; });

  var seedLen = seedLine.getTotalLength();
  seedLine.style.strokeDasharray = seedLen;
  seedLine.style.strokeDashoffset = seedLen;

  /* ---------- particle field ---------- */
  var GLYPHS = ["अ","आ","क","ख","ग","म","य","र","स","ह","ा","ृ",
                "A","E","K","M","R","S","W","i","·","“","”","¶"];
  var parts = [];
  var W = 0, H = 0, dpr = 1;

  function sizeCanvas() {
    var r = reel.getBoundingClientRect();
    if (!r.width) return;
    W = r.width; H = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeCanvas();
  if (window.ResizeObserver) new ResizeObserver(sizeCanvas).observe(reel);
  else window.addEventListener("resize", sizeCanvas);

  /* Where the book actually sits on screen, in reel-local pixels.
     Read live, so the glyphs lift off the page in both layouts
     and stay correct through the composition shift and any resize. */
  function bookAnchor() {
    var rb = bookG.getBoundingClientRect();
    var rr = reel.getBoundingClientRect();
    if (!rb.width) return { cx: W * 0.3, cy: H * 0.72, w: W * 0.3, h: H * 0.12 };
    return {
      cx: rb.left + rb.width / 2 - rr.left,
      cy: rb.top + rb.height / 2 - rr.top,
      w: rb.width,
      h: rb.height
    };
  }

  function spawn(anchor) {
    var size = 10 + Math.random() * 20;
    parts.push({
      x: anchor.cx + (Math.random() - 0.5) * anchor.w * 1.15,
      y: anchor.cy + (Math.random() - 0.35) * anchor.h * 1.6,
      vy: -(14 + Math.random() * 30),
      sway: 10 + Math.random() * 26,
      phase: Math.random() * Math.PI * 2,
      freq: 0.5 + Math.random() * 0.9,
      size: size,
      rot: (Math.random() - 0.5) * 0.5,
      vr: (Math.random() - 0.5) * 0.5,
      life: 0,
      max: 3.4 + Math.random() * 3.2,
      ch: GLYPHS[(Math.random() * GLYPHS.length) | 0],
      warm: Math.random() < 0.3
    });
  }

  function drawParticles(t, dt, master) {
    ctx.clearRect(0, 0, W, H);
    if (master <= 0) return;
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.life += dt;
      if (p.life > p.max) { parts.splice(i, 1); continue; }
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      var k = p.life / p.max;
      // fade in fast, fade out slow
      var al = (k < 0.16 ? k / 0.16 : 1 - (k - 0.16) / 0.84) * 0.9 * master;
      if (al <= 0) continue;
      var x = p.x + Math.sin(p.phase + p.life * p.freq) * p.sway;
      ctx.save();
      ctx.translate(x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = al;
      ctx.fillStyle = p.warm ? "#e0b96a" : "#a89a7e";
      ctx.font = "500 " + p.size.toFixed(1) + "px Fraunces, Georgia, serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.ch, 0, 0);
      ctx.restore();
    }
  }

  /* ---------- the timeline ---------- */
  function render(t, dt) {
    /* -- ink drop: a line falls, a dot rides its leading edge -- */
    var ink = seg(t, 0.30, 1.45), inkE = E.io(ink);
    seedLine.style.strokeDashoffset = seedLen * (1 - inkE);
    seedDot.setAttribute("cy", 44 + (258 - 44) * inkE);
    var inkFade = 1 - seg(t, 1.35, 2.30);
    inkG.style.opacity = (t < 0.30 ? 0 : 1) * inkFade;
    seedDot.style.opacity = (1 - seg(t, 1.30, 1.70)) * inkFade;

    /* -- book draws out from the spine -- */
    for (var i = 0; i < bookPaths.length; i++) {
      var bp = bookPaths[i];
      var pr = E.out(seg(t, bp.a, bp.b));
      bp.el.style.strokeDashoffset = bp.len * (1 - pr);
      bp.el.style.opacity = pr > 0 ? 1 : 0;
    }

    /* -- branches -- */
    for (var j = 0; j < treePaths.length; j++) {
      var tp = treePaths[j];
      var pg = E.out(seg(t, tp.a, tp.b));
      tp.el.style.strokeDashoffset = tp.len * (1 - pg);
      tp.el.style.opacity = pg > 0 ? 1 : 0;
    }

    /* -- leaves pop, overshoot, settle -- */
    for (var k = 0; k < leaves.length; k++) {
      var lf = leaves[k];
      var lp = seg(t, lf.a, lf.b);
      if (lp <= 0) { lf.el.style.opacity = 0; continue; }
      var s = E.back(lp) * lf.scale;
      var r = lf.rot + lf.spin * (1 - E.out(lp));
      lf.el.style.opacity = Math.min(1, lp * 2.4);
      lf.el.setAttribute("transform",
        "translate(" + lf.x.toFixed(2) + "," + lf.y.toFixed(2) + ") rotate(" + r.toFixed(2) + ") scale(" + s.toFixed(3) + ")");
    }

    /* -- particle field: glyphs rising off the page -- */
    var pMaster = seg(t, 5.30, 6.20) * (1 - seg(t, 12.40, 13.90));
    if (pMaster > 0.02 && t < 12.6) {
      var anchor = bookAnchor();
      spawnAcc += dt * (13 * pMaster);
      while (spawnAcc >= 1) { spawn(anchor); spawnAcc -= 1; }
    }
    drawParticles(t, dt, pMaster);

    /* -- composition shift: art moves aside, type takes the stage -- */
    var layout = E.io(seg(t, 6.90, 8.70));
    stage.style.setProperty("--p", layout.toFixed(4));

    /* -- kicker: letterspacing collapses in -- */
    var kp = seg(t, 7.50, 8.80), kE = E.expo(kp);
    kicker.style.opacity = kp;
    kicker.style.letterSpacing = (0.62 - 0.44 * kE).toFixed(3) + "em";
    kicker.style.transform = "translateY(" + ((1 - kE) * 10).toFixed(2) + "px)";

    /* -- headline: word by word, unblurring as it rises -- */
    for (var w = 0; w < words.length; w++) {
      var ws = 8.40 + w * 0.34;
      var wp = seg(t, ws, ws + 0.92), wE = E.out4(wp);
      words[w].style.opacity = Math.min(1, wp * 1.7).toFixed(3);
      words[w].style.transform =
        "translateY(" + ((1 - wE) * 52).toFixed(2) + "px) scale(" + (0.94 + 0.06 * wE).toFixed(3) + ")";
      words[w].style.filter = wp < 1 ? "blur(" + ((1 - wE) * 9).toFixed(2) + "px)" : "none";
    }

    /* -- the four-word coda, staccato -- */
    var sp = seg(t, 11.30, 12.20), sE = E.out(sp);
    sub.style.opacity = sp;
    sub.style.letterSpacing = (0.42 - 0.22 * sE).toFixed(3) + "em";

    /* -- the real photograph surfaces behind it all -- */
    var ph = E.io(seg(t, 11.70, 14.30));
    photo.style.opacity = (ph * 0.30).toFixed(3);
    photo.style.transform = "scale(" + (1.16 - 0.08 * ph).toFixed(4) + ")";

    /* -- gold sweep across the lockup -- */
    var sw = seg(t, 12.50, 13.80);
    sweep.style.opacity = sw > 0 && sw < 1 ? 1 : 0;
    sweep.style.transform = "translateX(" + (-130 + 260 * E.io(sw)).toFixed(2) + "%) skewX(-14deg)";

    /* -- art dims a touch at the end so the words carry the frame -- */
    svg.style.opacity = (1 - 0.22 * E.io(seg(t, 12.20, 14.00))).toFixed(3);
  }

  var spawnAcc = 0;

  /* ---------- transport ---------- */
  var started = false, raf = 0, t0 = 0, last = 0, done = false;

  function frame(now) {
    if (!t0) { t0 = now; last = now; }
    var t = (now - t0) / 1000;
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (t >= DUR) {
      render(DUR, 0);
      finish();
      return;
    }
    render(t, dt);
    raf = requestAnimationFrame(frame);
  }

  function finish() {
    done = true;
    reel.classList.add("is-done");
    // let the glyphs drift out rather than snapping off
    var fade = performance.now();
    (function drift(now) {
      var e = (now - fade) / 1000;
      var dt = Math.min(0.05, e > 0 ? 0.016 : 0);
      drawParticles(0, dt, Math.max(0, 1 - e / 1.6));
      if (e < 1.7) requestAnimationFrame(drift);
      else ctx.clearRect(0, 0, W, H);
    })(fade);
  }

  function play() {
    cancelAnimationFrame(raf);
    parts.length = 0; spawnAcc = 0; t0 = 0; last = 0; done = false;
    reel.classList.remove("is-done");
    reel.classList.add("is-playing");
    raf = requestAnimationFrame(frame);
  }

  /* reduced motion: show the resolved frame, skip the choreography */
  var rm = window.matchMedia("(prefers-reduced-motion: reduce)");
  function staticFrame() {
    render(DUR, 0);
    ctx.clearRect(0, 0, W, H);
    reel.classList.add("is-done");
  }

  if (rm.matches) {
    staticFrame();
  } else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !started) { started = true; play(); io.disconnect(); }
      });
    }, { threshold: 0.35 });
    io.observe(reel);
  } else {
    started = true; play();
  }

  replay.addEventListener("click", function () {
    if (rm.matches) { staticFrame(); return; }
    play();
  });

  // pause the loop if the tab goes away mid-sequence
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (started && !done) { t0 = 0; raf = requestAnimationFrame(frame); }
  });
})();
