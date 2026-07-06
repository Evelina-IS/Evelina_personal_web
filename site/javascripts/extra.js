/**
 * Evelina's Personal Web — 额外交互脚本
 * 功能：阅读进度条 + 卡片入场动画 + 返回顶部平滑滚动
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

  // ==================== 启动 ====================
  document.addEventListener("DOMContentLoaded", function () {
    updateProgress();
    setupReveal();
  });

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
})();
