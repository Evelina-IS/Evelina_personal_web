(function () {
  "use strict";
  /* ============================================================================
     features/enhancements.js —— 站点增强
     ----------------------------------------------------------------------------
     目录
     01. 运行时常量
     02. LQIP 图片渐进加载
     03. 页面状态与 TOC
     04. Giscus 评论区
     05. 脚注回跳修正
     06. 瞬时导航后的 tooltip 回收
     ============================================================================ */
  // ---- TOC：逐条淡入的时间间隔 ------------------------------------------
  var TOC_DELAY_STEP_MS = 100;
  // ---- LQIP：预览图 → 全分辨率 ------------------------------------------
  var LQIP_MAX_WAIT = 15000;

  // 所有渐进图片共用同一套收尾逻辑：至少让模糊占位绘制一帧，
  // 再移除 lqip 触发 CSS 的 blur → clear 过渡。15 秒是最长等待时间，
  // 避免网络失败时图片永久模糊。
  function revealLqip(img) {
    if (!img) return;
    if (img.dataset.lqipTimer) {
      clearTimeout(Number(img.dataset.lqipTimer));
      img.dataset.lqipTimer = "";
    }
    var frame = window.requestAnimationFrame || function (fn) { return setTimeout(fn, 16); };
    frame(function () {
      frame(function () { img.classList.remove("lqip"); });
    });
  }

  function scheduleLqipTimeout(img) {
    if (!img || img.dataset.lqipTimer) return;
    img.dataset.lqipTimer = String(setTimeout(function () {
      img.dataset.lqipTimer = "";
      revealLqip(img);
    }, LQIP_MAX_WAIT));
  }

  function initLqip(root) {
    var scope = root || document;
    var imgs = scope.querySelectorAll("img.lqip, img[data-fullsrc]");
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        scheduleLqipTimeout(img);
        if (img.hasAttribute("data-fullsrc")) return;
        img.addEventListener("load", function () { revealLqip(img); }, { once: true });
        img.addEventListener("error", function () { revealLqip(img); }, { once: true });
        if (img.complete) {
          if (img.naturalWidth > 0) revealLqip(img);
        }
      })(imgs[i]);
    }
  }

  function upgradeImages(root) {
    var scope = root || document;
    var imgs = scope.querySelectorAll("img[data-fullsrc]");
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        var fullSrc = img.getAttribute("data-fullsrc");
        if (!fullSrc) return;
        scheduleLqipTimeout(img);
        var full = new Image();
        full.onload = function () {
          img.src = fullSrc;
          revealLqip(img);
        };
        full.onerror = function () { revealLqip(img); };
        full.src = fullSrc;
      })(imgs[i]);
    }
  }
  // ---- 页面状态（全站功能）----
  function setPageState(name, value) {
    document.body.setAttribute("data-page-" + name, value ? "true" : "false");
  }

  function syncPageState(root) {
    var scope = root || document;
    setPageState("home", !!scope.querySelector(".home-page"));
    setPageState("rainbow", !!scope.querySelector(".rainbow-page"));
    setPageState("grid", !scope.querySelector('[data-page-grid="false"]'));
    setPageState("counter", !scope.querySelector('[data-page-counter="false"]'));
    setPageState("fold-toc", !!scope.querySelector('[data-page-fold-toc="true"]'));
  }

  // ---- 右侧 TOC：统一绝对时间轴的逐条淡入 ----
  // 折叠状态完全交给 CSS 处理；这里只负责按完整 TOC 顺序注入 animation-delay。
  // 动画必须等 delay 写完后再加 .toc-fade-ready，否则刷新时 CSS 可能先以
  // delay=0 开始播放，JS 随后修改 delay，形成时序竞争。
  function initToc() {
    var sidebar = document.querySelector(".md-sidebar--secondary");
    var toc = sidebar && sidebar.querySelector('[data-md-component="toc"]');
    if (!toc) return;

    var links = toc.querySelectorAll(".md-nav__link");
    for (var i = 0; i < links.length; i++) {
      links[i].classList.remove("toc-fade-ready");
      links[i].style.animationDelay = (i * TOC_DELAY_STEP_MS) + "ms";
    }
    for (var i = 0; i < links.length; i++) {
      links[i].classList.add("toc-fade-ready");
    }
  }

  // ---- 窄屏 TOC：禁用官方跟随定位 ----
  // Zensical 的 toc.follow 在移动抽屉中也会平滑滚动到 active 项；
  // 这里只在 active 更新后把面板拉回顶部，不阻止用户手动滚动。
  var mobileTocTopMedia = null;
  function resetMobileTocTop() {
    var panel = document.querySelector(".md-sidebar--secondary .md-sidebar__inner");
    if (panel) panel.scrollTop = 0;
  }

  function initMobileTocTop() {
    var panel = document.querySelector(".md-sidebar--secondary .md-sidebar__inner");
    if (!panel || !window.matchMedia) return;

    function syncScrollTo() {
      var narrow = window.matchMedia("(max-width: 59.984375em)").matches;
      if (narrow) {
        // 拦截官方 toc.follow 的平滑定位调用；触摸滚动不经过这里。
        panel.scrollTo = function () { panel.scrollTop = 0; };
        panel.scrollTop = 0;
      } else if (Object.prototype.hasOwnProperty.call(panel, "scrollTo")) {
        delete panel.scrollTo;
      }
    }

    if (!mobileTocTopMedia && window.matchMedia) {
      mobileTocTopMedia = window.matchMedia("(max-width: 59.984375em)");
      if (mobileTocTopMedia.addEventListener) mobileTocTopMedia.addEventListener("change", syncScrollTo);
      else if (mobileTocTopMedia.addListener) mobileTocTopMedia.addListener(syncScrollTo);
    }
    syncScrollTo();
  }

  // ---- Giscus 评论区 ----
  // 通过 onPageReady 注册：首次加载 + instant 换页（document$）都会触发，
  // 覆盖 navigation.instant 的 SPA 切换，无需再单独订阅 document$。
  // 主题用 window.site.theme 总线同步；换页时先退订旧的再订阅，避免监听器累积。
  var GISCUS_ATTRS = {
    "data-repo": "Evelina-IS/Evelina_personal_web",
    "data-repo-id": "R_kgDORx941w",
    "data-category": "General",
    "data-category-id": "DIC_kwDORx94184C-y0r",
    "data-mapping": "pathname",
    "data-strict": "1",
    "data-reactions-enabled": "1",
    "data-emit-metadata": "0",
    "data-input-position": "bottom",
    "data-lang": "zh-CN",
    "crossorigin": "anonymous"
  };
  var giscusUnsubscribe = null;

  function setGiscusTheme(mode) {
    var frame = document.querySelector(".giscus-frame");
    if (!frame || !frame.contentWindow) return;
    try {
      frame.contentWindow.postMessage(
        { giscus: { setConfig: { theme: mode === "dark" ? "dark" : "light" } } },
        "https://giscus.app"
      );
    } catch (e) { /* iframe 未就绪或跨域受限（代理/超时），静默跳过 */ }
  }

  function initGiscus() {
    // 换页前退订上一次的主题同步，避免 listeners 累积
    if (giscusUnsubscribe) { giscusUnsubscribe(); giscusUnsubscribe = null; }

    var container = document.querySelector(".giscus");
    if (!container) return;

    // 已有 iframe（非 instant 的普通渲染）则只补主题即可
    if (!container.querySelector("iframe.giscus-frame")) {
      var scheme = document.documentElement.getAttribute("data-md-color-scheme");
      container.innerHTML = "";
      var script = document.createElement("script");
      script.src = "https://giscus.app/client.js";
      script.async = true;
      for (var key in GISCUS_ATTRS) script.setAttribute(key, GISCUS_ATTRS[key]);
      script.setAttribute("data-theme", scheme === "slate" ? "dark" : "light");
      container.appendChild(script);
    }

    // 换页后 1.5s 补发一次主题，覆盖新页面 iframe 就绪的窗口。
    // 用实时主题，即使稍晚也保证正确。
    setTimeout(function () { setGiscusTheme(window.site.theme.mode); }, 1500);

    // 切主题：立即（subscribe 内触发）+ 0.8s + 3.5s 分层补发。
    // 若主题切换发生在 iframe 加载完成之前，前面的广播会因 iframe 不存在而落空
    // （setGiscusTheme 内直接 return）；后面的延时补发覆盖 iframe 刚就绪的窗口。
    giscusUnsubscribe = window.site.theme.subscribe(function (mode) {
      setGiscusTheme(mode);                       // 立即
      setTimeout(function () { setGiscusTheme(window.site.theme.mode); }, 800);  // 0.8s
      setTimeout(function () { setGiscusTheme(window.site.theme.mode); }, 1600); // 1.6s
      setTimeout(function () { setGiscusTheme(window.site.theme.mode); }, 4500); // 4.5s
      setTimeout(function () { setGiscusTheme(window.site.theme.mode); }, 12000); // 12s
    });
  }

  function initLqipBlur(root) {
    var scope = root || document;
    var imgs = scope.querySelectorAll("img.lqip");
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      var m = /zoom\s*:\s*([\d.]+)%/i.exec(img.getAttribute("style") || "");
      if (m) {
        var zoom = parseFloat(m[1]) / 100;
        img.style.setProperty("--lqip-blur", Math.round(6 / zoom) + "px");
      }
    }
  }

  // ---- Python-Markdown 脚注回跳修正 --------------------------------------
  function lastFootnoteListTarget(list) {
    var node = list;
    while (node) {
      var child = node.lastElementChild;
      if (!child) return node;
      if (child.tagName === "UL" || child.tagName === "OL" || child.tagName === "LI") {
        node = child;
        continue;
      }
      if (child.tagName === "P") return child;
      return node;
    }
    return null;
  }

  function normalizeFootnoteBackrefs(root) {
    var scope = root || document;
    var items = scope.querySelectorAll(".footnote ol > li");
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var paragraph = item.lastElementChild;
      if (!paragraph || paragraph.tagName !== "P") continue;

      var link = paragraph.firstElementChild;
      if (!link || !link.classList.contains("footnote-backref") || paragraph.children.length !== 1) continue;

      var list = paragraph.previousElementSibling;
      if (!list || (list.tagName !== "UL" && list.tagName !== "OL")) continue;

      var target = lastFootnoteListTarget(list);
      if (!target) continue;

      target.appendChild(document.createTextNode("\u00A0"));
      target.appendChild(link);
      paragraph.remove();
    }
  }

  // 换页时清除上一页残留在 body 的 tooltip（append 到 body 的，不受
  // container.innerHTML="" 影响，instant 切页会累积）。动态组件（贡献图、PDF
  // 工具栏）各自创建 tooltip，换页时由这里统一回收。
  function purgeTooltips() {
    document.querySelectorAll(".ghc-tooltip, .pdf-tooltip").forEach(function (t) { t.remove(); });
  }
  window.site.onPageReady(syncPageState);
  window.site.onPageReady(upgradeImages);
  window.site.onPageReady(initLqip);
  window.site.onPageReady(initLqipBlur);
  window.site.onPageReady(initToc);
  window.site.onPageReady(initMobileTocTop);
  window.site.onPageReady(initGiscus);
  window.site.onPageReady(normalizeFootnoteBackrefs);
  window.site.onPageReady(purgeTooltips);
})();
