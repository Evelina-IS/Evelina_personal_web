/**
 * 阅读次数计数器
 * 
 * 功能：在每个页面的底部显示阅读次数
 * 原理：使用 localStorage 存储每个页面的访问计数
 * 特点：同一页面刷新不重复计数（按会话session去重）
 */

(function () {
  "use strict";

  // ==================== 配置 ====================
  const STORAGE_KEY = "reader_counter_data"; // localStorage 键名
  const SESSION_KEY = "reader_counter_session"; // 会话标记键名

  // ==================== 初始化 ====================
  document.addEventListener("DOMContentLoaded", function () {
    // 等待页面内容完全加载后添加计数器
    setTimeout(addReaderCounter, 300);
  });

  // ==================== 核心功能 ====================

  /**
   * 获取当前页面的路径（用作唯一标识）
   */
  function getPagePath() {
    return window.location.pathname;
  }

  /**
   * 从 localStorage 读取计数数据
   */
  function getCounterData() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.warn("读取阅读次数失败:", e);
      return {};
    }
  }

  /**
   * 将计数数据写入 localStorage
   */
  function saveCounterData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("保存阅读次数失败:", e);
    }
  }

  /**
   * 获取当前页面的阅读次数，并递增
   * 同一会话中刷新页面不重复计数
   */
  function getAndIncrementCount() {
    const pagePath = getPagePath();
    const data = getCounterData();
    const sessionData = getCounterData(); // 用于会话检查

    // 生成当前页面的会话 ID
    const pageSessionId = pagePath + "_" + getSessionId();

    // 检查是否已经在本次会话中访问过
    const sessionVisited = isSessionVisited(pageSessionId);

    // 获取当前计数
    let count = data[pagePath] || 0;

    if (!sessionVisited) {
      // 首次访问（新会话），计数 +1
      count += 1;
      data[pagePath] = count;
      saveCounterData(data);

      // 标记会话已访问
      markSessionVisited(pageSessionId);
    }

    return count;
  }

  /**
   * 获取会话 ID（浏览器会话级别的唯一标识）
   */
  function getSessionId() {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  /**
   * 检查当前页面是否已在本次会话中被访问过
   * 使用会话级 localStorage 键
   */
  function isSessionVisited(pageSessionId) {
    try {
      const visitedData = sessionStorage.getItem("reader_counter_visited");
      if (!visitedData) return false;
      const visited = JSON.parse(visitedData);
      return visited[pageSessionId] === true;
    } catch (e) {
      return false;
    }
  }

  /**
   * 标记当前页面在本次会话中已访问
   */
  function markSessionVisited(pageSessionId) {
    try {
      const visitedData = sessionStorage.getItem("reader_counter_visited");
      const visited = visitedData ? JSON.parse(visitedData) : {};
      visited[pageSessionId] = true;
      sessionStorage.setItem("reader_counter_visited", JSON.stringify(visited));
    } catch (e) {
      // 静默失败
    }
  }

  /**
   * 在页面底部添加阅读次数显示
   */
  function addReaderCounter() {
    // 获取计数（会自动递增）
    const count = getAndIncrementCount();

    // 查找文章内容容器
    const article = document.querySelector("article.md-content__inner");
    if (!article) return;

    // 创建计数器元素
    const counterWrapper = document.createElement("div");
    counterWrapper.className = "reader-counter-wrapper";
    counterWrapper.innerHTML =
      '<span class="counter-icon">👁️</span>' +
      '<span class="counter-label">本文已被阅读</span>' +
      '<span class="counter-number" id="reader-count-number">' +
      count +
      "</span>" +
      '<span class="counter-label">次</span>';

    // 插入到文章底部
    article.appendChild(counterWrapper);
  }
})();
