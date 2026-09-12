/* ============================================================================
   highlight.js —— 运行时语法高亮（CDN + 本脚本控制渲染）
   ----------------------------------------------------------------------------
   01. 主题样式加载与预加载
   02. 代码块高亮
   03. 主题切换与 navigation.instant 后重新高亮
   ============================================================================ */
(function () {
  "use strict";

  var hljsLib = window.hljs;
  if (!hljsLib) return;

  var STYLE_ID = "hljs-theme";
  var DARK_URL = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";
  var LIGHT_URL = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";

  function preloadAlternate(mode) {
    var altUrl = mode === "dark" ? LIGHT_URL : DARK_URL;
    if (document.getElementById("hljs-theme-preload")) return;
    var preload = document.createElement("link");
    preload.id = "hljs-theme-preload";
    preload.rel = "preload";
    preload.as = "style";
    preload.href = altUrl;
    document.head.appendChild(preload);
  }

  function applyTheme(mode) {
    var link = document.getElementById(STYLE_ID);
    if (!link) {
      link = document.createElement("link");
      link.id = STYLE_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    var url = mode === "dark" ? DARK_URL : LIGHT_URL;
    if (link.href !== url) link.href = url;
    preloadAlternate(mode);
    return link;
  }

  function whenThemeReady(callback) {
    var link = applyTheme(currentMode());
    if (link.sheet) { callback(); return; }
    link.addEventListener("load", callback, { once: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(callback);
  }

  function highlightRoot(root) {
    if (!hljsLib.highlightElement) return;
    root = root || document;
    // 同时处理代码块（pre > code）与行内代码（#!python 等 inlinehilite 产物）。
    // 行内 code 带 language-xxx / highlight class，由 hljs 运行时上色。
    root.querySelectorAll("code[class*='language-'], code.highlight").forEach(function (el) {
      if (el.dataset.hljsDone === "1") return;
      if (el.classList.contains("language-asm")) {
        el.classList.remove("language-asm");
        el.classList.add("language-x86asm");
      }
      hljsLib.highlightElement(el);
      el.dataset.hljsDone = "1";
    });
  }

  function currentMode() {
    if (window.site && window.site.theme)
      return window.site.theme.mode;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  if (window.site && window.site.theme)
    window.site.theme.subscribe(applyTheme);

  if (window.document$) {
    window.document$.subscribe(function () {
      whenThemeReady(function () { highlightRoot(document); });
    });
  } else {
    whenThemeReady(function () { highlightRoot(document); });
  }
})();
