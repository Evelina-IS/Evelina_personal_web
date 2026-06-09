/**
 * 页面互动组件：阅读次数 + 点赞按钮
 *
 * 功能：
 *   1. 阅读计数器 — localStorage 持久化，30分钟窗口内同页不重复计数
 *   2. 点赞按钮 — localStorage 持久化，每个页面独立计数，可切换
 *
 * 修复：
 *   - 移除未使用变量 sessionData
 *   - 用 localStorage + 时间窗口替代 sessionStorage（避免跨标签页重复计数）
 *   - 新增点赞功能
 */

(function () {
  "use strict";

  // ==================== 配置 ====================
  const STORAGE_KEY_VIEWS = "reader_counter_data";   // 阅读计数数据
  const STORAGE_KEY_LIKES = "page_likes_data";       // 点赞数据
  const STORAGE_KEY_VISIT = "reader_counter_visit";  // 访问时间记录
  const DEDUP_WINDOW_MS = 30 * 60 * 1000;            // 30分钟去重窗口

  // ==================== 初始化 ====================
  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(buildInteractionBar, 300);
  });

  // ==================== 工具函数 ====================

  function getPagePath() {
    return window.location.pathname;
  }

  function safeGetJSON(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function safeSetJSON(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn("localStorage 写入失败:", e);
    }
  }

  // ==================== 阅读计数 ====================

  function getViewCount() {
    const pagePath = getPagePath();
    const data = safeGetJSON(STORAGE_KEY_VIEWS);
    const visitData = safeGetJSON(STORAGE_KEY_VISIT);

    const now = Date.now();
    const lastVisit = visitData[pagePath] || 0;
    const isNewVisit = (now - lastVisit) > DEDUP_WINDOW_MS;

    let count = data[pagePath] || 0;

    if (isNewVisit) {
      count += 1;
      data[pagePath] = count;
      visitData[pagePath] = now;
      safeSetJSON(STORAGE_KEY_VIEWS, data);
      safeSetJSON(STORAGE_KEY_VISIT, visitData);
    }

    return count;
  }

  // ==================== 点赞功能 ====================

  function getLikeData() {
    const pagePath = getPagePath();
    const data = safeGetJSON(STORAGE_KEY_LIKES);
    return {
      count: data[pagePath + "_count"] || 0,
      liked: data[pagePath + "_liked"] || false
    };
  }

  function toggleLike() {
    const pagePath = getPagePath();
    const data = safeGetJSON(STORAGE_KEY_LIKES);
    const countKey = pagePath + "_count";
    const likedKey = pagePath + "_liked";

    let count = data[countKey] || 0;
    const liked = data[likedKey] || false;

    if (liked) {
      // 取消点赞
      count = Math.max(0, count - 1);
      data[likedKey] = false;
    } else {
      // 点赞
      count += 1;
      data[likedKey] = true;
    }

    data[countKey] = count;
    safeSetJSON(STORAGE_KEY_LIKES, data);

    return { count, liked: !liked };
  }

  // ==================== 构建 UI ====================

  function buildInteractionBar() {
    const article = document.querySelector("article.md-content__inner");
    if (!article) return;

    // --- 阅读计数 ---
    const viewCount = getViewCount();

    // --- 点赞数据 ---
    const likeData = getLikeData();

    // --- 创建容器 ---
    const wrapper = document.createElement("div");
    wrapper.className = "interaction-bar";

    // 阅读计数部分
    const viewsEl = document.createElement("div");
    viewsEl.className = "interaction-item interaction-views";
    viewsEl.innerHTML =
      '<span class="interaction-icon">👁️</span>' +
      '<span class="interaction-label">阅读</span>' +
      '<span class="interaction-number" id="view-count-number">' +
      viewCount +
      "</span>";

    // 点赞按钮部分
    const likesEl = document.createElement("div");
    likesEl.className = "interaction-item interaction-likes";
    likesEl.id = "like-button-container";
    likesEl.innerHTML =
      '<span class="interaction-icon" id="like-icon">' +
      (likeData.liked ? "❤️" : "🤍") +
      "</span>" +
      '<span class="interaction-label">点赞</span>' +
      '<span class="interaction-number" id="like-count-number">' +
      likeData.count +
      "</span>";

    wrapper.appendChild(viewsEl);
    wrapper.appendChild(likesEl);

    // --- 点赞点击事件 ---
    likesEl.addEventListener("click", function () {
      const result = toggleLike();
      const likeIcon = document.getElementById("like-icon");
      const likeCount = document.getElementById("like-count-number");

      if (likeIcon) {
        likeIcon.textContent = result.liked ? "❤️" : "🤍";
        // 点赞动画
        likeIcon.style.transform = "scale(1.4)";
        setTimeout(function () {
          likeIcon.style.transform = "scale(1)";
        }, 200);
      }
      if (likeCount) {
        likeCount.textContent = result.count;
      }

      // 容器闪烁反馈
      likesEl.classList.add("liked-flash");
      setTimeout(function () {
        likesEl.classList.remove("liked-flash");
      }, 400);
    });

    // 光标指示可点击
    likesEl.style.cursor = "pointer";
    likesEl.title = likeData.liked ? "取消点赞" : "点赞支持";

    article.appendChild(wrapper);
  }
})();
