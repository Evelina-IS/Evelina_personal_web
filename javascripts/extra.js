/**
 * Evelina's Personal Web — 额外交互脚本
 * 功能：阅读进度条 + 卡片入场动画 + PDF 预览
 */
(function () {
  "use strict";

  // ==================== 阅读进度条 ====================
  var bar = document.getElementById("evelina-progress");

  function updateProgress() {
    if (!bar) return;
    var h = document.documentElement;
    var scrolled = h.scrollTop || document.body.scrollTop;
    var height = h.scrollHeight - h.clientHeight;
    var pct = height > 0 ? (scrolled / height) * 100 : 0;
    bar.style.width = pct + "%";
  }

  // ==================== 卡片 / 元素入场动画 ====================
  function setupReveal() {
    var els = document.querySelectorAll(
      ".evelina-card, .evelina-info, .evelina-hero__tags"
    );
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.style.opacity = "1"; });
      return;
    }
    els.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            setTimeout(function () {
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
            }, (i % 8) * 60);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach(function (el) { io.observe(el); });
  }

  // ==================== PDF 预览 ====================
  function setupPdfPreviews() {
    var previews = document.querySelectorAll(".evelina-pdf-preview[data-src]");
    previews.forEach(function (preview) {
      if (preview.dataset.ready === "1") return;
      var src = preview.getAttribute("data-src");
      var title = preview.getAttribute("data-title") || "PDF 预览";
      var download = preview.getAttribute("data-download") || src;
      var iframe = document.createElement("iframe");
      var actions = document.createElement("div");
      var openLink = document.createElement("a");
      var downloadLink = document.createElement("a");

      iframe.src = src + "#toolbar=1&navpanes=0";
      iframe.title = title;
      iframe.loading = "lazy";
      iframe.className = "evelina-pdf-preview__frame";

      actions.className = "evelina-pdf-preview__actions";
      openLink.href = src;
      openLink.target = "_blank";
      openLink.rel = "noopener";
      openLink.textContent = "新窗口打开";
      downloadLink.href = download;
      downloadLink.download = "";
      downloadLink.textContent = "下载 PDF";

      actions.appendChild(openLink);
      actions.appendChild(downloadLink);
      preview.appendChild(iframe);
      preview.appendChild(actions);
      preview.dataset.ready = "1";
    });
  }

  // ==================== 启动 ====================
  document.addEventListener("DOMContentLoaded", function () {
    updateProgress();
    setupReveal();
    setupPdfPreviews();
  });

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
})();
