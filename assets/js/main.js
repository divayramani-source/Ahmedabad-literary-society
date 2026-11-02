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
});
