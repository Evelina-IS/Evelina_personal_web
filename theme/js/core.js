(function () {
  "use strict";

  /* ============================================================================
     core.js —— 主题运行时基础
     ----------------------------------------------------------------------------
     01. 页面生命周期：首次加载与 instant 导航后的 onPageReady
     02. 共享能力：DOM 创建、主题订阅与运行时 tooltip
     03. 原生界面修正：标题锚点点击后的焦点释放

     不包含任何站点新增功能；贡献图、PDF、LQIP、网格、TOC 与评论区均在
     features/ 下的模块。
     ============================================================================ */

  console.log("welcome to Evelina_IS");

  // 核心：页面生命周期与共享工具。各功能模块通过 window.site.onPageReady 注册。
  window.site = window.site || {};

  function pageRoot() {
    return document.querySelector(".md-content__inner") || document.querySelector(".md-content") || document.body;
  }

  function pageKey(root) {
    return location.pathname + location.search + "::" + (root ? root.textContent.length : 0);
  }

  var pageHandlers = [];
  var scheduled = false;
  var lastKey = "";
  var lastRoot = null;

  function onPageReady(fn) {
    pageHandlers.push(fn);
  }

  // 点击标题书签后，浏览器可能保留链接焦点，使书签一直显示。
  // 失焦不影响锚点跳转；键盘 Tab 导航产生的 focus-visible 仍由 CSS 保留。
  function installHeaderlinkFocusFix() {
    if (document.documentElement.dataset.headerlinkFocusFix) return;
    document.documentElement.dataset.headerlinkFocusFix = "1";
    document.addEventListener("click", function (event) {
      var link = event.target && event.target.closest
        ? event.target.closest(".headerlink")
        : null;
      if (!link) return;
      setTimeout(function () {
        if (document.activeElement === link) link.blur();
      }, 0);
    });
  }

  function schedulePageReady() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () {
      scheduled = false;
      var root = pageRoot();
      var key = pageKey(root);
      if (key === lastKey && root === lastRoot) return;
      lastKey = key;
      lastRoot = root;
      for (var i = 0; i < pageHandlers.length; i++) {
        try {
          pageHandlers[i](root);
        } catch (e) {
          console.error("[site]", e);
        }
      }
    }, 0);
  }

  function initPageLifecycle() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", schedulePageReady, { once: true });
    } else {
      schedulePageReady();
    }

    if (window.document$) {
      window.document$.subscribe(schedulePageReady);
    }
  }


  // 只要页面仍在最顶部，就不显示 header 的底边框；
  // 一旦用户向下滚动，立即恢复正常 shadow。
  function initHeaderTopState() {
    function update() {
      if (window.scrollY < 1) {
        document.body.setAttribute("data-md-at-top", "true");
      } else {
        document.body.removeAttribute("data-md-at-top");
      }
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  // 共享 DOM 工具：供 features/、highlight.js 等后续模块使用。
  function htmlEl(name, attrs, text) {
    var node = document.createElement(name);
    if (attrs) {
      for (var k in attrs) {
        if (attrs[k] != null) node.setAttribute(k, attrs[k]);
      }
    }
    if (text != null) node.textContent = text;
    return node;
  }

  // ---- 主题同步（highlight.js / giscus 订阅）----
  var mq = matchMedia("(prefers-color-scheme: dark)");
  var themeListeners = [];

  function isDark() {
    var attr = document.body.getAttribute("data-md-color-scheme");
    if (attr) return attr === "slate";
    return mq.matches;
  }

  function themeMode() { return isDark() ? "dark" : "light"; }

  function notifyTheme() {
    var m = themeMode();
    themeListeners.forEach(function (fn) { try { fn(m); } catch (e) {} });
  }

  new MutationObserver(notifyTheme).observe(document.body, {
    attributes: true,
    attributeFilter: ["data-md-color-scheme"],
  });
  mq.addEventListener("change", notifyTheme);

  // ---- Material tooltip2 绑定（通用，全站共享）----
  // 贡献图格子、PDF 工具栏按钮等 [title] 元素由 JS 在运行时动态创建，
  // 晚于主题原生 tooltip 扫描（content.tooltips 在 document$ 上同步触发，
  // 而 onPageReady 经 setTimeout(0) 异步执行），因此需要手动补绑。
  // 机制与主题 Ye() 完全一致：移除 title、创建 .md-tooltip2[role=tooltip]
  // 挂到 body，hover/touch 时写入 --md-tooltip-host-x/y 等定位 CSS 变量，
  // 切 --md-tooltip2--top（恒上方）+ --active 触发出场动画。
  function bindTooltips(root, selector, tipClass) {
    var scope = root || document;
    var sel = selector || "[title]";
    var cls = tipClass ? " " + tipClass : "";
    var nodes = scope.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) {
      (function (el) {
        if (el.dataset.siteTooltip) return;
        el.dataset.siteTooltip = "1";
        var text = el.getAttribute("title");
        if (!text) return;
        el.removeAttribute("title");
        var inner = htmlEl("div", { class: "md-tooltip2__inner md-typeset" }, text);
        var tip = htmlEl("div", { class: "md-tooltip2" + cls, role: "tooltip" });
        tip.appendChild(inner);
        tip.style.setProperty("--md-tooltip-tail", "0px");
        document.body.appendChild(tip);

        function show() {
          var r = el.getBoundingClientRect();
          tip.style.setProperty("--md-tooltip-host-x", (r.left + window.scrollX) + "px");
          tip.style.setProperty("--md-tooltip-host-y", (r.top + window.scrollY) + "px");
          tip.style.setProperty("--md-tooltip-x", (r.width / 2) + "px");
          tip.style.setProperty("--md-tooltip-y", -(8 + inner.offsetHeight) + "px");
          tip.style.setProperty("--md-tooltip-width", inner.offsetWidth + "px");
          tip.classList.add("md-tooltip2--top");
          tip.classList.add("md-tooltip2--active");
        }
        function hide() { tip.classList.remove("md-tooltip2--active"); }

        el.addEventListener("mouseenter", show);
        el.addEventListener("mouseleave", hide);
        el.addEventListener("touchstart", show, { passive: true });
        el.addEventListener("touchend", hide, { passive: true });
      })(nodes[i]);
    }
    return nodes.length;
  }

  window.site.onPageReady = onPageReady;
  window.site.htmlEl = htmlEl;
  window.site.bindTooltips = bindTooltips;
  window.site.theme = {
    get mode() { return themeMode(); },
    subscribe: function (fn) {
      themeListeners.push(fn);
      try { fn(themeMode()); } catch (e) {}
      return function () {
        var i = themeListeners.indexOf(fn);
        if (i >= 0) themeListeners.splice(i, 1);
      };
    },
  };

  installHeaderlinkFocusFix();
  initPageLifecycle();
  initHeaderTopState();
})();
