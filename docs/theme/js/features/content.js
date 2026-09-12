(function () {
  "use strict";

  /* ============================================================================
     features/content.js —— 内容组件运行时
     ----------------------------------------------------------------------------
     全站加载；目标 DOM 不存在时直接返回。

     目录
     01. 内容组件
         1.1 GitHub 贡献图：本地数据兜底 + 实时刷新 + tooltip
         1.2 终端：打字机、命令输入与快捷跳转

     友链 DOM 由 blocks.py 构建；样式均由 features.css 负责。
     ============================================================================ */

  window.site = window.site || {};
  var htmlEl = window.site.htmlEl;

  /* ---- 构建期友链内容 ------------------------------------------------------
     头像、handle 和描述由 scripts/blocks.py 在构建期写入 HTML；
     运行时不处理（头像 img 加载失败由 onerror="this.remove()" 内联处理，
     露出首字母占位 span）。 */

  /* ---- 01.1 GitHub 贡献图 ------------------------------------------------
     两步渐进：1) 静态 JSON（本地面板，always）→ 立即渲染；2) CORS 代理实时
     抓取贡献页（8s 超时，成功则替换刷新）。渲染为 GitHub 风格 53×7 日方格
     表格，并为每个格子绑定 Material tooltip。 */
  var CONTRIBUTIONS_URL = "theme/data/contributions.json";
  var WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var WEEKDAY_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var contributionRun = 0;

  /* ---- 实时抓取（CORS 代理，无需 token） ---- */
  var DEFAULT_USER = "Evelina-IS";
  var MIN_CELLS = 300;
  var MONTH_FULL = {
    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
  };
  var PROXIES = [
    function (u) {
      return fetch("https://proxy.cors.sh/" + u, { cache: "no-store" })
        .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.text(); });
    }
  ];
  function levelFromCount(count, t) { return count <= 0 ? 0 : count <= t[0] ? 1 : count <= t[1] ? 2 : count <= t[2] ? 3 : 4; }
  function computeThresholds(cells) {
    var i, max = 0; for (i = 0; i < cells.length; i++) if (cells[i].count > max) max = cells[i].count;
    if (max <= 0) return [1, 2, 4];
    var q1 = (max / 4) | 0, q2 = (max / 2) | 0, q3 = (3 * max / 4) | 0;
    if (q1 < q2) q2 = Math.max(q2, q1 + 1); if (q2 < q3) q3 = Math.max(q3, q2 + 1);
    return [q1, q2, q3];
  }
  function sortByDate(a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; }
  function packageCells(cells, total, user) {
    var t = computeThresholds(cells), i, sum = 0;
    for (i = 0; i < cells.length; i++) { cells[i].level = levelFromCount(cells[i].count, t); sum += cells[i].count; }
    cells.sort(sortByDate);
    if (total !== sum) total = sum;
    var dates = cells.map(function (c) { return c.date; });
    return { user: user, totalContributions: total, from: dates.length ? dates[0] : null, to: dates.length ? dates[dates.length - 1] : null, fetchedAt: new Date().toISOString(), contributions: cells };
  }
  function parseHtml(html, user) {
    var total = 0, i, tm = html.match(/id="js-contribution-activity-description"[^>]*>\s*([0-9,]+)\s*contributions/);
    if (tm) total = parseInt(tm[1].replace(/,/g, ""), 10);
    var cells = [], re = /data-date="([^"]+)"[^>]*data-level="([0-4])"/g, m;
    while ((m = re.exec(html))) cells.push({ date: m[1], count: null });
    var tips = [];
    re = />([0-9]+|No) contributions? on (\w+) (\d+)\w{2}\.</g;
    while ((m = re.exec(html))) {
      var mn = MONTH_FULL[m[2]];
      if (mn == null) continue;
      tips.push([mn, parseInt(m[3], 10), m[1] === "No" ? 0 : parseInt(m[1], 10)]);
    }
    var pending = {};
    for (i = 0; i < tips.length; i++) {
      var key = tips[i][0] + ":" + tips[i][1];
      (pending[key] = pending[key] || []).push(tips[i][2]);
    }
    for (i = 0; i < cells.length; i++) {
      var d = new Date(cells[i].date + "T00:00:00Z");
      var q = pending[d.getUTCMonth() + 1 + ":" + d.getUTCDate()];
      cells[i].count = (q && q.length) ? q.shift() : 0;
    }
    return packageCells(cells, total, user);
  }
  function fetchViaProxy(url) {
    return PROXIES.reduce(function (chain, make) { return chain.catch(function () { return make(url); }); }, Promise.reject(new Error("no proxy tried")));
  }

  function screenReader(text) { return htmlEl("span", { class: "sr-only" }, text); }
  function plural(n, one, many) { return n === 1 ? one : many; }

  function prettyDate(iso) {
    var d = new Date(iso + "T00:00:00Z"), day = d.getUTCDate(), suffix = "th";
    if (day % 10 === 1 && day !== 11) suffix = "st";
    else if (day % 10 === 2 && day !== 12) suffix = "nd";
    else if (day % 10 === 3 && day !== 13) suffix = "rd";
    return MONTHS[d.getUTCMonth()] + " " + day + suffix;
  }

  function firstRealDay(week) {
    for (var i = 0; i < week.length; i++) if (week[i]) return week[i];
    return null;
  }

  function toWeeks(days) {
    if (!days.length) return [];
    var first = new Date(days[0].date + "T00:00:00Z"), weeks = [], current = [];
    for (var pad = 0; pad < first.getUTCDay(); pad++) current.push(null);
    for (var i = 0; i < days.length; i++) {
      current.push(days[i]);
      if (current.length === 7) { weeks.push(current); current = []; }
    }
    if (current.length) { while (current.length < 7) current.push(null); weeks.push(current); }
    return weeks;
  }

  function monthCells(weeks) {
    var cells = [], i = 0;
    while (i < weeks.length) {
      var day = firstRealDay(weeks[i]);
      if (!day) { cells.push({ month: "", colspan: 1 }); i++; continue; }
      var month = new Date(day.date + "T00:00:00Z").getUTCMonth(), span = 1;
      while (i + span < weeks.length) {
        var next = firstRealDay(weeks[i + span]);
        if (!next || new Date(next.date + "T00:00:00Z").getUTCMonth() !== month) break;
        span++;
      }
      cells.push({ month: MONTH_SHORT[month], full: MONTHS[month], colspan: span });
      i += span;
    }
    return cells;
  }

  function renderGithubHeader(root, total) {
    var h = htmlEl("div", { class: "ghc-header" });
    h.appendChild(htmlEl("h2", { class: "ghc-title" }, total + " " + plural(total, "contribution", "contributions") + " in the last year"));
    root.appendChild(h);
  }

  function renderGithubCalendar(root, data) {
    var weeks = toWeeks(data.contributions);
    var tableWidth = 28 + weeks.length * 10 + (weeks.length + 2) * 3;
    var table = htmlEl("table", { class: "ContributionCalendar-grid", role: "grid", "aria-readonly": "true", "aria-label": "Contribution Graph" });
    table.style.width = tableWidth + "px";
    table.appendChild(htmlEl("caption", { class: "sr-only" }, "Contribution Graph"));

    var colgroup = htmlEl("colgroup");
    colgroup.appendChild(htmlEl("col", { class: "ghc-weekday-col" }));
    for (var col = 0; col < weeks.length; col++) colgroup.appendChild(htmlEl("col", { class: "ghc-week-col" }));
    table.appendChild(colgroup);

    var thead = htmlEl("thead"), headRow = htmlEl("tr");
    var corner = htmlEl("td", { class: "ContributionCalendar-label ghc-corner" });
    corner.appendChild(screenReader("Day of Week"));
    headRow.appendChild(corner);

    monthCells(weeks).forEach(function (cell) {
      var td = htmlEl("td", { class: "ContributionCalendar-label", colspan: cell.colspan });
      if (cell.month) {
        td.appendChild(screenReader(cell.full));
        td.appendChild(htmlEl("span", { "aria-hidden": "true", style: "position: absolute; top: 0" }, cell.month));
      }
      headRow.appendChild(td);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = htmlEl("tbody");
    for (var dow = 0; dow < 7; dow++) {
      var row = htmlEl("tr");
      var label = htmlEl("td", { class: "ContributionCalendar-label ghc-day-label" });
      label.appendChild(screenReader(WEEKDAYS[dow]));
      if (dow % 2 === 1) label.appendChild(htmlEl("span", { "aria-hidden": "true" }, WEEKDAY_SHORT[dow]));
      row.appendChild(label);
      for (var w = 0; w < weeks.length; w++) {
        var day = weeks[w][dow];
        if (!day) { row.appendChild(htmlEl("td", { class: "ghc-empty-day" })); continue; }
        var count = day.count || 0;
        var cell = htmlEl("td", {
          tabindex: "0", "aria-selected": "false",
          "aria-label": (count ? count + " " + plural(count, "contribution", "contributions") : "No contributions") + " on " + prettyDate(day.date) + ".",
          "data-date": day.date, "data-level": String(day.level || 0),
          role: "gridcell", class: "ContributionCalendar-day"
        });
        cell.title = cell.getAttribute("aria-label");
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    }
    table.appendChild(tbody);
    var scroller = htmlEl("div", { class: "ghc-calendar-scroller" });
    scroller.appendChild(table);
    root.appendChild(scroller);
  }

  function renderGithubLegend(root) {
    var legend = htmlEl("div", { class: "ghc-footer" });
    legend.appendChild(htmlEl("a", { class: "ghc-help", href: "https://docs.github.com/articles/why-are-my-contributions-not-showing-up-on-my-profile" }, "Learn how we count contributions"));
    var scale = htmlEl("div", { class: "ghc-legend", "aria-hidden": "true" });
    scale.appendChild(htmlEl("span", null, "Less"));
    for (var i = 0; i <= 4; i++) scale.appendChild(htmlEl("span", { class: "ContributionCalendar-day ghc-legend-day", "data-level": String(i) }));
    scale.appendChild(htmlEl("span", null, "More"));
    legend.appendChild(scale);
    root.appendChild(legend);
  }

  function initGithubCalendar(root) {
    var container = (root || document).querySelector(".github-calendar-wrap");
    if (!container) return;
    var user = container.getAttribute("data-user") || DEFAULT_USER;
    var pageUrl = "https://github.com/users/" + user + "/contributions";
    var runId = ++contributionRun;
    container.setAttribute("data-ghc-state", "loading");

    /* ---- 构建日历 shell 的通用函数 ---- */
    function buildShell(data) {
      if (runId !== contributionRun || !container.isConnected) return;
      var shell = htmlEl("section", { class: "ghc-shell", "aria-label": "GitHub contributions" });
      renderGithubHeader(shell, data.totalContributions);
      renderGithubCalendar(shell, data);
      renderGithubLegend(shell);
      /* 替换 shell 前：清掉历次 shell 残留在 body 的 tooltip div。
         tooltip 是 appendChild 到 body（非 shell 内），container.innerHTML=""
         带不走它们；instant 切页重入会累积，hover 中遇异步刷新也会留下孤立的
         active tooltip。此处统一移除（含正在显示的，元素一删即消失）。 */
      document.querySelectorAll(".ghc-tooltip").forEach(function (t) { t.remove(); });
      container.innerHTML = "";
      container.appendChild(shell);
      container.setAttribute("data-ghc-state", "ready");
      window.site.bindTooltips(shell, ".ContributionCalendar-day[title]", "ghc-tooltip");
    }

    /* ---- Step 1: 静态 JSON（本地，极快，始终兜底）---- */
    fetch(CONTRIBUTIONS_URL, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        return packageCells(data.contributions, undefined, user);
      })
      .then(buildShell)
      .catch(function (err) {
        if (runId !== contributionRun || !container.isConnected) return;
        container.innerHTML = '<div class="ghc-error">GitHub contribution graph failed to load: ' + (err.message || "read failed") + "</div>";
        container.setAttribute("data-ghc-state", "error");
      });

    /* ---- Step 2（不阻塞）: CORS 代理实时抓取，8s 超时（成功则替换刷新）---- */
    var timeoutP = new Promise(function (_, reject) {
      setTimeout(reject, 8000);
    });
    var liveP = fetchViaProxy(pageUrl).then(function (html) {
      var data = parseHtml(html, user);
      if (data.contributions.length < MIN_CELLS) throw new Error("proxy truncated");
      return data;
    });
    Promise.race([liveP, timeoutP])
      .then(buildShell)
      .catch(function () { /* 超时或失败 → 静态 JSON 已展示，无操作 */ });
  }

  // 贡献图 tooltip：复用 core.js 的通用 bindTooltips（机制与主题 Material
  // tooltip2 完全一致），fetch 回调内手动补绑——动态创建的 DOM 晚于主题
  // 原生 tooltip 扫描（onPageReady 经 setTimeout(0) 异步执行）。

  // ---- 01.2 终端 ------------------------------------------------------
  // 终端窗口(.site-terminal)的逐字敲入动画 + 简易命令解析 + 隐藏输入。
  // DOM 由 blocks.py render_terminal() 烘焙；此处只驱动文字。
  // 字号/高度/布局全在 features.css，JS 不修改任何尺寸。
  var typewriterTimers = [], typewriterRun = 0;

  function rememberTimer(id) { typewriterTimers.push(id); return id; }
  function forgetTimer(id) { var i = typewriterTimers.indexOf(id); if (i >= 0) typewriterTimers.splice(i, 1); }
  function makeCursor() { return htmlEl("span", { class: "typed-cursor" }, "\u2588"); }

  function clearTypewriter() {
    typewriterRun++;
    typewriterTimers.forEach(clearTimeout);
    typewriterTimers = [];
    document.querySelectorAll(".typed-cursor").forEach(function (e) { e.remove(); });
    document.querySelectorAll(".typed-text").forEach(function (e) { e.textContent = ""; e.style.display = "none"; });
    document.querySelectorAll(".site-terminal__line--prompt, .terminal-hidden-input, .site-terminal__keys").forEach(function (e) { e.style.display = "none"; });
  }

  function startTerminalTypewriter(root) {
    clearTypewriter();
    var scope = root || document;
    var line1Host = scope.querySelector("#typed-line-1-host");
    var line1Separator = scope.querySelector("#typed-line-1-separator");
    var line1Prompt = scope.querySelector("#typed-line-1-prompt");
    var line1Command = scope.querySelector("#typed-line-1-command");
    var el2 = scope.querySelector("#typed-line-2");
    var el3 = scope.querySelector("#typed-line-3");
    var finalPrompt = scope.querySelector(".site-terminal__line--prompt");
    var finalCommand = scope.querySelector("#typed-line-4-command");
    if (!line1Host || !line1Command || !el2 || !el3 || !finalPrompt || !finalCommand) return;

    var run = typewriterRun;
    function delay(ms, done) {
      var timer = rememberTimer(setTimeout(function () { forgetTimer(timer); if (run === typewriterRun) done(); }, ms));
    }
    function typeText(el, text, speed, done, cursor) {
      var i = 0;
      if (!cursor) { cursor = makeCursor(); el.insertAdjacentElement("afterend", cursor); }
      el.style.display = "";
      function step() {
        if (run !== typewriterRun || !document.body.contains(el)) return;
        el.textContent = text.slice(0, i);
        if (i >= text.length) { if (done) done(cursor); return; }
        i++;
        var timer = rememberTimer(setTimeout(function () { forgetTimer(timer); step(); }, speed));
      }
      step();
    }
    function showOutputLine(el, text, hold, done, showCursor) {
      if (run !== typewriterRun || !document.body.contains(el)) return;
      el.textContent = text; el.style.display = "";
      if (showCursor !== false) { var c = makeCursor(); el.insertAdjacentElement("afterend", c); }
      if (done) delay(hold, function () { if (showCursor !== false) c.remove(); done(); });
    }

    var SITE_SECTIONS = [
      { id: 1, name: "reports", label: "实验报告 Reports", path: "reports/" },
      { id: 2, name: "fds", label: "FDS 数据结构", path: "fds/" },
      { id: 3, name: "discrete", label: "离散数学", path: "discrete-math/" },
      { id: 4, name: "sys", label: "SYS 体系结构", path: "SYS1/指令集/" },
      { id: 5, name: "probability", label: "概率论", path: "probability/" },
      { id: 6, name: "physics", label: "大学物理", path: "大物/力学与振动/" }
    ];
    var terminalScreen = scope.querySelector(".site-terminal__screen");
    var currentCmd = null, hiddenInput = null;

    function addOutput(text) {
      if (!terminalScreen) return;
      var line = htmlEl("div", { class: "site-terminal__line site-terminal__line--output" });
      line.appendChild(htmlEl("span", { class: "typed-text" }, text));
      terminalScreen.appendChild(line);
    }
    function removeCurrentCursor() {
      if (currentCmd && currentCmd.nextSibling && currentCmd.nextSibling.classList && currentCmd.nextSibling.classList.contains("typed-cursor")) currentCmd.nextSibling.remove();
    }
    function addSectionLinks() {
      if (!terminalScreen) return;
      var line = htmlEl("div", { class: "site-terminal__line site-terminal__line--output" });
      var keys = htmlEl("span", { class: "site-terminal__keys", role: "group", "aria-label": "快速跳转数字链接" });
      for (var i = 0; i < SITE_SECTIONS.length; i++) {
        var s = SITE_SECTIONS[i];
        keys.appendChild(htmlEl("a", { href: s.path, class: "site-terminal__link", "data-goto": String(s.id) }, s.id + ":" + s.label));
      }
      line.appendChild(keys); terminalScreen.appendChild(line);
    }
    function spawnPrompt(dir) {
      removeCurrentCursor();
      var line = htmlEl("div", { class: "site-terminal__line site-terminal__line--prompt" });
      line.appendChild(htmlEl("span", { class: "typed-text--host" }, "evelina@ZJU"));
      line.appendChild(htmlEl("span", { class: "typed-text--separator" }, ":"));
      line.appendChild(htmlEl("span", { class: "typed-text--prompt" }, dir ? "~/site/" + dir + "$ " : "~/site$ "));
      var cmd = htmlEl("span", { class: "typed-text typed-text--command" });
      line.appendChild(cmd);
      if (terminalScreen) terminalScreen.appendChild(line);
      var cursor = makeCursor();
      cmd.insertAdjacentElement("afterend", cursor);
      currentCmd = cmd; return cmd;
    }
    function gotoSection(sec) {
      if (currentCmd && document.body.contains(currentCmd)) currentCmd.textContent = "cd ~/site/" + sec.name;
      removeCurrentCursor(); spawnPrompt(sec.name);
      delay(900, function () { if (run === typewriterRun) window.location.href = sec.path; });
    }
    function executeCommand(raw) {
      var text = raw.trim();
      if (text === "") { spawnPrompt(); return; }
      if (text === "ls") { addSectionLinks(); spawnPrompt(); return; }
      if (text === "help" || text === "?") { addOutput("输入编号进入对应页面 (移动端可点击)"); addSectionLinks(); spawnPrompt(); return; }
      var num = parseInt(text, 10);
      if (num >= 1 && num <= SITE_SECTIONS.length) { gotoSection(SITE_SECTIONS[num - 1]); return; }
      var cdMatch = text.match(/^cd(?:\s+(.+))?$/);
      if (cdMatch) {
        var target = cdMatch[1] ? cdMatch[1].trim() : "";
        if (!target) { addOutput("当前目录 ~/site"); removeCurrentCursor(); spawnPrompt(); return; }
        var norm = target.replace(/^~\/site\/?/, "").replace(/^~\/?/, "").replace(/^\//, "").replace(/\/+$/, "");
        for (var i = 0; i < SITE_SECTIONS.length; i++) { if (SITE_SECTIONS[i].name === norm || String(SITE_SECTIONS[i].id) === norm) { gotoSection(SITE_SECTIONS[i]); return; } }
        addOutput("cd: no such directory: " + target);
        addOutput(SITE_SECTIONS.map(function (s) { return s.id + ":" + s.name; }).join("  "));
        spawnPrompt(); return;
      }
      addOutput("command not found: " + text); addOutput("try \"ls\""); spawnPrompt();
    }
    function focusTerminal() {
      if (!hiddenInput || !document.body.contains(hiddenInput)) return;
      if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
      hiddenInput.focus();
    }
    function setupTerminalInput() {
      if (!terminalScreen || hiddenInput) return;
      hiddenInput = htmlEl("input", { class: "terminal-hidden-input", autocomplete: "off", autocapitalize: "off", autocorrect: "off", spellcheck: "false", "aria-label": "terminal input" });
      terminalScreen.appendChild(hiddenInput);
      terminalScreen.addEventListener("click", focusTerminal);
      hiddenInput.addEventListener("keydown", function (e) {
        if (!currentCmd || !document.body.contains(currentCmd)) return;
        if (e.key === "Enter") { e.preventDefault(); executeCommand(currentCmd.textContent); return; }
        if (e.key === "Backspace") { e.preventDefault(); currentCmd.textContent = currentCmd.textContent.slice(0, -1); return; }
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) currentCmd.textContent += e.key;
      });
      requestAnimationFrame(focusTerminal);
    }
    function showFinalPrompt() {
      if (run !== typewriterRun || !document.body.contains(finalPrompt)) return;
      finalPrompt.style.display = "";
      var fc = makeCursor();
      finalCommand.insertAdjacentElement("afterend", fc);
      delay(120, function () {
        typeText(finalCommand, "welcome to Evelina_IS", 20, function (dc) {
          delay(100, function () { dc.remove(); addOutput("输入编号进入对应页面 (移动端可点击)"); addSectionLinks(); spawnPrompt(); setupTerminalInput(); });
        }, fc);
      });
    }
    function bindTerminalKeys() {
      if (!terminalScreen) return;
      terminalScreen.addEventListener("click", function (e) {
        var link = e.target && e.target.closest ? e.target.closest(".site-terminal__link") : null;
        if (!link) return;
        e.preventDefault();
        var num = parseInt(link.getAttribute("data-goto"), 10);
        if (currentCmd && document.body.contains(currentCmd)) currentCmd.textContent = String(num);
        executeCommand(String(num)); focusTerminal();
      });
    }

    bindTerminalKeys();
    line1Host.textContent = "evelina@ZJU"; line1Separator.textContent = ":"; line1Prompt.textContent = "~/site$ ";
    line1Host.style.display = ""; line1Separator.style.display = ""; line1Prompt.style.display = "";
    var lc = makeCursor();
    line1Command.insertAdjacentElement("afterend", lc);
    delay(100, function () {
      typeText(line1Command, "whoami", 62, function (c1) {
        delay(180, function () {
          c1.remove();
          showOutputLine(el2, "evelina@ZJU", 10, function () {
            showOutputLine(el3, "flag{1nforMati0n_$3cUrity_0x86_l0gg3d_1n}", 10, function () {}, false);
            delay(10, showFinalPrompt);
          }, false);
        });
      }, lc);
    });
  }

  // ---- init ----
  window.site.onPageReady(initGithubCalendar);
  window.site.onPageReady(startTerminalTypewriter);
})();
