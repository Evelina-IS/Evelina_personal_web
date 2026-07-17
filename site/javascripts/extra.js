/**
 * Evelina's Personal Web — 额外交互脚本
 * 功能：阅读进度条 + 卡片入场动画 + 访问者设备信息面板
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

  // ==================== 访问者设备信息面板 ====================
  function getVisitorInfo() {
    var nav = window.navigator;
    var screenInfo = window.screen || {};
    var connection = nav.connection || nav.mozConnection || nav.webkitConnection || {};

    return {
      page: window.location.href,
      referrer: document.referrer || "",
      userAgent: nav.userAgent,
      language: nav.language,
      languages: nav.languages ? Array.prototype.slice.call(nav.languages) : [],
      platform: nav.platform || "",
      cookieEnabled: nav.cookieEnabled,
      doNotTrack: nav.doNotTrack || window.doNotTrack || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: {
        width: screenInfo.width,
        height: screenInfo.height,
        colorDepth: screenInfo.colorDepth,
        pixelRatio: window.devicePixelRatio || 1
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      preferences: {
        darkMode: window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches,
        reducedMotion: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
      },
      connection: {
        effectiveType: connection.effectiveType || "",
        downlink: connection.downlink || "",
        rtt: connection.rtt || ""
      },
      collectedAt: new Date().toISOString()
    };
  }

  function formatVisitorInfo(info) {
    return [
      "页面: " + info.page,
      "来源: " + (info.referrer || "直接访问/未知"),
      "浏览器 UA: " + info.userAgent,
      "语言: " + info.language,
      "系统平台: " + info.platform,
      "时区: " + info.timezone,
      "屏幕: " + info.screen.width + "x" + info.screen.height + " @ " + info.screen.pixelRatio + "x",
      "视口: " + info.viewport.width + "x" + info.viewport.height,
      "深色模式: " + (info.preferences.darkMode ? "是" : "否"),
      "减少动画: " + (info.preferences.reducedMotion ? "是" : "否"),
      "Cookie: " + (info.cookieEnabled ? "启用" : "禁用"),
      "DNT: " + (info.doNotTrack || "未声明"),
      "网络: " + (info.connection.effectiveType || "未知"),
      "采集时间: " + info.collectedAt
    ].join("\n");
  }

  function getVisitorEndpoint() {
    if (window.EVELINA_VISITOR_ENDPOINT) {
      return window.EVELINA_VISITOR_ENDPOINT;
    }
    var meta = document.querySelector('meta[name="evelina-visitor-endpoint"]');
    return meta ? meta.getAttribute("content") : "";
  }

  function sendVisitorInfo(info) {
    var endpoint = getVisitorEndpoint();
    if (!endpoint || window.sessionStorage.getItem("evelinaVisitorLogged") === "1") {
      return;
    }

    var payload = {
      site: "Evelina_personal_web",
      visitor: info
    };

    fetch(endpoint, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    }).then(function () {
      window.sessionStorage.setItem("evelinaVisitorLogged", "1");
    }).catch(function () {
      // 静默失败，避免第三方接口异常影响页面浏览。
    });
  }

  function setupVisitorInfoPanel() {
    if (document.getElementById("evelina-visitor-info")) return;

    var info = getVisitorInfo();
    var button = document.createElement("button");
    button.id = "evelina-visitor-toggle";
    button.type = "button";
    button.setAttribute("aria-label", "查看浏览器信息");
    button.textContent = "设备信息";

    var panel = document.createElement("section");
    panel.id = "evelina-visitor-info";
    panel.setAttribute("aria-live", "polite");
    panel.hidden = true;
    panel.innerHTML =
      '<div class="evelina-visitor-info__header">' +
      '<strong>当前浏览器信息</strong>' +
      '<button type="button" class="evelina-visitor-info__close" aria-label="关闭">×</button>' +
      "</div>" +
      '<p class="evelina-visitor-info__note">仅显示浏览器主动暴露的基础信息，不读取本地文件、历史记录或精确位置。</p>' +
      '<pre class="evelina-visitor-info__body"></pre>' +
      '<button type="button" class="evelina-visitor-info__copy">复制信息</button>';

    var body = panel.querySelector(".evelina-visitor-info__body");
    var copy = panel.querySelector(".evelina-visitor-info__copy");
    var close = panel.querySelector(".evelina-visitor-info__close");
    body.textContent = formatVisitorInfo(info);

    function setOpen(open) {
      info = getVisitorInfo();
      body.textContent = formatVisitorInfo(info);
      panel.hidden = !open;
      button.setAttribute("aria-expanded", open ? "true" : "false");
    }

    button.addEventListener("click", function () {
      setOpen(panel.hidden);
    });
    close.addEventListener("click", function () {
      setOpen(false);
    });
    copy.addEventListener("click", function () {
      var text = body.textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          copy.textContent = "已复制";
          setTimeout(function () { copy.textContent = "复制信息"; }, 1200);
        });
      }
    });

    document.body.appendChild(button);
    document.body.appendChild(panel);
  }

  // ==================== 启动 ====================
  document.addEventListener("DOMContentLoaded", function () {
    updateProgress();
    setupReveal();
    setupVisitorInfoPanel();
    sendVisitorInfo(getVisitorInfo());
  });

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
})();
