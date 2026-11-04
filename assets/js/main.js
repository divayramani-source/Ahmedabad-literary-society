document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      toggle.textContent = nav.classList.contains("open") ? "✕" : "☰";
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.textContent = "☰";
      });
    });
  }

  // simple form-preview copy helper (Join ALS page)
  var copyBtn = document.querySelector("[data-copy-form]");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var form = document.querySelector(copyBtn.getAttribute("data-copy-form"));
      if (!form) return;
      var lines = [];
      form.querySelectorAll("input:not([type=hidden]), select, textarea").forEach(function (el) {
        var label = el.closest(".field");
        var labelText = label ? label.querySelector("label").textContent.trim() : el.name;
        var val = el.value || "(not filled)";
        lines.push(labelText + ": " + val);
      });
      navigator.clipboard.writeText(lines.join("\n")).then(function () {
        copyBtn.textContent = "Copied";
        setTimeout(function () { copyBtn.textContent = "Copy Application Details"; }, 1800);
      });
    });
  }

  /* ---------- scroll reveals ---------- */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = document.querySelectorAll(".rv, .rule, [data-count]");

  function countUp(el) {
    var to = parseFloat(el.getAttribute("data-count"));
    var from = parseFloat(el.getAttribute("data-from") || "0");
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1500, t0 = 0;
    function step(now) {
      if (!t0) t0 = now;
      var k = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e) + suffix;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (reduced || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) {
      el.classList.add("in");
      if (el.hasAttribute("data-count")) {
        el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
      }
    });
    return;
  }

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add("in");
      if (el.hasAttribute("data-count")) countUp(el);
      obs.unobserve(el);
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

  targets.forEach(function (el) { obs.observe(el); });
});
