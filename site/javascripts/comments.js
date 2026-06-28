/**
 * Giscus 评论区 fallback 脚本
 *
 * 如果 Material 主题自带 giscus 未加载，则手动注入。
 * 检测页面是否已存在 giscus iframe，避免重复加载。
 */

(function () {
  "use strict";

  var GISCUS_CONFIG = {
    repo: "Evelina-IS/Evelina_personal_web",
    repoId: "R_kgDORx941w",
    category: "General",
    categoryId: "DIC_kwDORx94184C-y0r",
    mapping: "pathname",
    strict: "0",
    reactionsEnabled: "1",
    emitMetadata: "0",
    inputPosition: "bottom",
    theme: "preferred_color_scheme",
    lang: "zh-CN"
  };

  document.addEventListener("DOMContentLoaded", function () {
    // 等待 Material 主题完成渲染
    setTimeout(injectGiscus, 600);
  });

  function injectGiscus() {
    // 检查是否已有 giscus（包括 Material 主题自动添加的）
    if (document.querySelector(".giscus") || document.querySelector("giscus-widget")) {
      return;
    }

    // 查找文章内容区域
    var article = document.querySelector("article.md-content__inner");
    if (!article) return;

    // 创建 giscus 容器
    var container = document.createElement("div");
    container.id = "giscus-comments";
    container.className = "giscus";

    // 创建 giscus script 标签
    var script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", GISCUS_CONFIG.repo);
    script.setAttribute("data-repo-id", GISCUS_CONFIG.repoId);
    script.setAttribute("data-category", GISCUS_CONFIG.category);
    script.setAttribute("data-category-id", GISCUS_CONFIG.categoryId);
    script.setAttribute("data-mapping", GISCUS_CONFIG.mapping);
    script.setAttribute("data-strict", GISCUS_CONFIG.strict);
    script.setAttribute("data-reactions-enabled", GISCUS_CONFIG.reactionsEnabled);
    script.setAttribute("data-emit-metadata", GISCUS_CONFIG.emitMetadata);
    script.setAttribute("data-input-position", GISCUS_CONFIG.inputPosition);
    script.setAttribute("data-theme", GISCUS_CONFIG.theme);
    script.setAttribute("data-lang", GISCUS_CONFIG.lang);
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    container.appendChild(script);
    article.appendChild(container);
  }
})();
