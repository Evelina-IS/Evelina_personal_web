/* ============================================================================
   mathjax.js —— 数学公式运行时
   ----------------------------------------------------------------------------
   01. MathJax 配置
   02. navigation.instant 下的按页重载与显式 typeset
   ============================================================================ */

var MATHJAX_CONFIG = {
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true,
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex",
  },
};

// 每次返回深拷贝：MathJax 库加载后会往 window.MathJax 上添加内部属性，
// 如果用同一对象引用，第二次赋值时旧属性还在，MathJax 跳过初始化。
function mathjaxConfig() {
  return JSON.parse(JSON.stringify(MATHJAX_CONFIG));
}

window.MathJax = mathjaxConfig();

// navigation.instant 模式下，每次页面切换强制重新加载 MathJax 库。
// MathJax 4.x auto-typeset 会等待 window load 事件（readyState=complete），
// 首次加载时图片等资源拖慢 load 事件，导致公式迟迟不渲染。
// 因此在 CDN 脚本 onload 后显式 typesetPromise()，不等 auto-typeset。
document$.subscribe(function () {
  window.MathJax = mathjaxConfig();
  document.querySelectorAll('script[src*="cdnjs.cloudflare.com/ajax/libs/mathjax"]').forEach(function (s) {
    s.remove();
  });
  var script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/4.1.3/tex-mml-chtml.js";
  script.async = true;
  script.onload = function () {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  };
  document.head.appendChild(script);
});
