#!/usr/bin/env python3
"""Render custom homepage blocks into static HTML.

支持块语法（::terminal:: / ::changelog:: / ::friends:: / ::activity::）：

::friends::
gE | gE0650 | https://0-rangE.cn | Orange
dreamem0ra1n | dreamem0ra1n | https://dreamem0ra1n.github.io/ISYS/ | ISYS
::/friends::

  字段：显示名 | GitHub用户名 | URL | 描述（可选，无描述留空）
  标题来自紧邻块上方的 Markdown H2；没有 H2 时渲染无标题分区。

::changelog::
2026.08.16: 修复公式问题。重构 css。
::/changelog::

  字段：日期: 内容（内容经 Markdown 行内渲染，支持 <url> 与 [text](url)）。

::activity:: —— 块语法，参数为 GitHub 用户名（::activity::user::/activity::）。

用法: uv run python scripts/blocks.py
"""
from __future__ import annotations

import html
import os
import re
from pathlib import Path
from urllib.parse import quote

import markdown

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
os.chdir(DOCS)


def friend_initials(name: str, github: str) -> str:
    """与 features/content.js 的友链显示逻辑一致：中文取首字；多词取前两词首字母；单词取前两字符。"""
    source = (name or github or "?").strip()
    if not source:
        return "?"
    if "一" <= source[0] <= "龥":
        return source[0]
    parts = source.split()
    if len(parts) > 1:
        return (parts[0][0] + parts[1][0]).upper()
    return source[:2]


def github_avatar_url(github: str) -> str:
    """与 features/content.js 的头像 URL 逻辑一致（encodeURIComponent → quote(safe='')）。"""
    return f"https://avatars.githubusercontent.com/{quote(github, safe='')}?size=160" if github else ""


def render_avatar(name: str, github: str) -> str:
    """构建头像 span：首字母占位 + 叠加 GitHub 头像 img。

    img 初始 opacity:0（不可见，首字母露出）；加载完成后 onload 设 opacity:1
    带 blur-up 过渡淡入；加载失败 onerror 移除 img，首字母保持。"""
    initials = html.escape(friend_initials(name, github))
    src = github_avatar_url(github)
    img = (
        f'<img src="{html.escape(src, quote=True)}" alt="" width="96" height="96" '
        f'class="lqip" style="opacity:0" '
        f'onload="this.style.opacity=1" '
        f'onerror="this.remove()">'
        if src
        else ""
    )
    return f'<span class="site-friend-card__avatar">{initials}{img}</span>'


def render_inline_markdown(text: str) -> str:
    """把单行文本经 Markdown 渲染，并剥掉外层 <p>…</p>，支持 <url> 与 [text](url)。"""
    rendered = markdown.markdown(text.strip())
    if rendered.startswith("<p>") and rendered.endswith("</p>"):
        rendered = rendered[len("<p>") : -len("</p>")]
    return rendered


def heading_block_pattern(tag: str) -> re.Pattern[str]:
    """匹配“Markdown H2 + 自定义块”的整段 HTML。"""
    return re.compile(
        rf'<h2(?P<attrs>[^>]*)>(?P<title>(?:(?!</h2>).)*?)</h2>\s*'
        rf'<p>::{tag}::(?P<content>.*?)::/{tag}::</p>',
        re.DOTALL,
    )


def plain_block_pattern(tag: str) -> re.Pattern[str]:
    """匹配没有标题的自定义块。"""
    return re.compile(rf"<p>::{tag}::(.*?)::/{tag}::</p>", re.DOTALL)


def parse_heading(match: re.Match[str]) -> tuple[str, str | None]:
    """从 Markdown 生成的 H2 中提取纯文本标题和 id。"""
    attrs = match.group("attrs")
    raw_title = re.sub(
        r'<a\s+class="headerlink"[^>]*>.*?</a>\s*$',
        "",
        match.group("title"),
        flags=re.DOTALL,
    ).strip()
    title = html.unescape(re.sub(r"<[^>]+>", "", raw_title)).strip()
    id_match = re.search(r'id="([^"]+)"', attrs)
    return title, id_match.group(1) if id_match else None


def section_shell(
    title: str | None,
    section_id: str | None,
    body: str,
    extra_class: str = "",
) -> str:
    """生成主页分区外壳；标题为空时不输出标题栏。"""
    classes = "site-section" + (f" {extra_class}" if extra_class else "")
    aria = f' aria-labelledby="{html.escape(section_id)}"' if section_id else ""
    head = ""
    if title:
        heading_id = f' id="{html.escape(section_id)}"' if section_id else ""
        head = (
            '    <div class="home-section__head">\n'
            f'      <h2{heading_id} class="home-section__title">{html.escape(title)}</h2>\n'
            "    </div>\n"
        )
    return f'<section class="{classes}"{aria}>\n{head}{body}</section>'


def render_changelog(lines: str, title: str | None = None, section_id: str | None = None) -> str:
    items = []
    for line in lines.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        if ":" not in line:
            continue
        date, text = line.split(":", 1)
        rendered = render_inline_markdown(text)
        items.append(
            f'      <div class="site-changelog__entry">\n'
            f'        <span class="site-changelog__date">{html.escape(date.strip())}</span>\n'
            f"        <span>{rendered}</span>\n"
            f"      </div>"
        )
    body = (
        '    <div class="site-changelog">\n'
        '      <div class="site-changelog__scroller">\n'
        + "\n".join(items)
        + "\n      </div>\n"
        + "    </div>\n"
    )
    return section_shell(title, section_id, body)


def render_friends(lines: str, title: str | None = None, section_id: str | None = None) -> str:
    items = []
    for line in lines.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        parts = [p.strip() for p in line.split("|", 3)]
        if len(parts) < 3:
            continue
        # 显示名 | GitHub用户名 | URL | 描述（可选，缺省留空）
        name, github_id, href = parts[0], parts[1], parts[2]
        desc = parts[3] if len(parts) > 3 else ""
        attrs = f'href="{html.escape(href)}" target="_blank" rel="noopener"'
        # 头像：构建期生成首字母 + GitHub 头像 img（onerror 移除 img 露出首字母）。
        avatar = render_avatar(name, github_id)
        # handle：仅当有 GitHub 用户名时输出 @用户名。
        handle = (
            f'\n        <span class="site-friend-card__handle">@{html.escape(github_id)}</span>'
            if github_id
            else ""
        )
        # 描述：过一遍 Markdown 渲染，支持 <url> 与 [text](url)，直接以正文 span 输出。
        # 无描述时附加 --empty class（CSS 将其 display:none），保留 \xa0 占位；
        # 有描述时正常显示。卡片通过 justify-content: center 统一垂直居中，
        # 2 行（name + handle）和 3 行（+ meta）均适用。
        has_desc = bool(desc)
        meta_content = render_inline_markdown(desc) if has_desc else "\xa0"
        meta_cls = "site-friend-card__meta" + ("" if has_desc else " site-friend-card__meta--empty")
        meta = f'\n        <span class="{meta_cls}">{meta_content}</span>'
        items.append(
            f'      <a class="site-friend-card" {attrs}>\n'
            f"        {avatar}\n"
            f'        <span class="site-friend-card__body">\n'
            f"          <strong>{html.escape(name)}</strong>{handle}{meta}\n"
            f"        </span>\n"
            f"      </a>"
        )
    body = '    <div class="site-friend-list">\n' + "\n".join(items) + "\n    </div>\n"
    return section_shell(title, section_id, body)


def render_terminal() -> str:
    return (
        '<section aria-label="homepage intro">\n'
        '      <div class="site-terminal" aria-label="evelina terminal intro">\n'
        '        <div class="site-terminal__bar">\n'
        '          <span class="site-terminal__dot site-terminal__dot--red"></span>\n'
        '          <span class="site-terminal__dot site-terminal__dot--yellow"></span>\n'
        '          <span class="site-terminal__dot site-terminal__dot--green"></span>\n'
        '          <span class="site-terminal__title">evelina@ZJU:~</span>\n'
        '        </div>\n'
        '        <div class="site-terminal__screen">\n'
        '          <div class="site-terminal__line">\n'
        '            <span id="typed-line-1-host" class="typed-text typed-text--host" style="display:none;"></span><span id="typed-line-1-separator" class="typed-text typed-text--separator" style="display:none;"></span><span id="typed-line-1-prompt" class="typed-text typed-text--prompt" style="display:none;"></span><span id="typed-line-1-command" class="typed-text typed-text--command" style="display:none;"></span>\n'
        '          </div>\n'
        '          <div class="site-terminal__line site-terminal__line--user">\n'
        '            <span id="typed-line-2" class="typed-text" style="display:none;"></span>\n'
        '          </div>\n'
        '          <div class="site-terminal__line site-terminal__line--flag">\n'
        '            <span id="typed-line-3" class="typed-text" style="display:none;"></span>\n'
        '          </div>\n'
        '          <div class="site-terminal__line site-terminal__line--prompt" style="display:none;">\n'
        '            <span class="typed-text--host">evelina@ZJU</span><span class="typed-text--separator">:</span><span class="typed-text--prompt">~/site$ </span><span id="typed-line-4-command" class="typed-text typed-text--command" style="display:none;"></span>\n'
        '          </div>\n'
        '        </div>\n'
        '      </div>\n'
        '</section>'
    )


def render_activity(user: str = "", title: str | None = None, section_id: str | None = None) -> str:
    user_attr = f' data-user="{html.escape(user)}"' if user else ""
    body = (
        f'    <div class="github-calendar-wrap"{user_attr}>\n'
        '      <div class="ghc-loading">正在加载 GitHub 贡献图...</div>\n'
        "    </div>\n"
    )
    return section_shell(title, section_id, body, extra_class="site-component--activity")


def replace_home_blocks(content: str, is_home_page: bool) -> str:
    """展开自定义块；仅首页将紧邻 H2 变为首页分区标题。"""
    content = re.sub(r"<p>::terminal::</p>", render_terminal(), content)

    def render_block(renderer, block: str, title: str | None = None, section_id: str | None = None) -> str:
        return renderer(block, title, section_id)

    renderers = {
        "friends": render_friends,
        "changelog": render_changelog,
        "activity": lambda content, title=None, section_id=None: render_activity(
            content.strip(), title, section_id
        ),
    }

    for tag, renderer in renderers.items():
        def replace_heading(match: re.Match[str]) -> str:
            title, section_id = parse_heading(match)
            if is_home_page:
                return render_block(renderer, match.group("content"), title, section_id)
            heading = f'<h2{match.group("attrs")}>{match.group("title")}</h2>\n'
            return heading + render_block(renderer, match.group("content"))

        content = heading_block_pattern(tag).sub(replace_heading, content)
        content = plain_block_pattern(tag).sub(
            lambda match: render_block(renderer, match.group(1)), content
        )

    return content


def process_file(path: Path) -> bool:
    content = path.read_text(encoding="utf-8")
    if not any(tag in content for tag in ("::terminal::", "::changelog::", "::friends::", "::activity::")):
        return False

    # 首页由 content.html 根据 front matter 包装为 .home-page；该 div 还可带
    # data-page-counter 等状态属性，不能假定 class 后立刻闭合标签。
    is_home_page = bool(re.search(r'<div\b[^>]*\bclass="[^"]*\bhome-page\b[^"]*"', content))
    patched = replace_home_blocks(content, is_home_page)
    if patched == content:
        return False

    path.write_text(patched, encoding="utf-8")
    print(f"  patched: {path}")
    return True


def main() -> None:
    count = 0
    for source in Path(".").rglob("*.md"):
        html_file = (
            DOCS.parent / "site" / source.parent / "index.html"
            if source.name == "index.md"
            else DOCS.parent / "site" / source.with_suffix("") / "index.html"
        )
        if html_file.is_file() and process_file(html_file):
            count += 1
    print(f"Done: {count} files patched")


if __name__ == "__main__":
    main()
