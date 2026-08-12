from pathlib import Path
from urllib.parse import quote


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
PDF_DIR = DOCS / "handwritten"
OUT = DOCS / "handwritten-notes.md"


def title_from_path(path: Path) -> str:
    return path.stem.replace("_", " ").replace("-", " ")


def url_for(path: Path) -> str:
    rel = path.relative_to(DOCS).as_posix()
    return quote(rel, safe="/")


def main() -> None:
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    pdfs = sorted(PDF_DIR.rglob("*.pdf"), key=lambda p: p.as_posix().lower())

    lines = [
        "# 手写笔记",
        "",
        "这里会自动展示 `docs/handwritten/` 目录下的 PDF 文件。",
        "",
        "你只需要把手写笔记 PDF 放进 `docs/handwritten/`，然后重新生成网站即可。",
        "",
    ]

    if not pdfs:
        lines.extend([
            "## 暂无 PDF",
            "",
            "把 PDF 放到 `docs/handwritten/` 后，运行：",
            "",
            "```bash",
            "python3 scripts/generate_pdf_index.py",
            "python3 scripts/build_site.py",
            "```",
            "",
        ])
    else:
        for pdf in pdfs:
            title = title_from_path(pdf)
            src = url_for(pdf)
            lines.extend([
                f"## {title}",
                "",
                f'<div class="evelina-pdf-preview" data-src="{src}" data-title="{title}"></div>',
                "",
            ])

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Generated {OUT.relative_to(ROOT)} with {len(pdfs)} PDF file(s).")


if __name__ == "__main__":
    main()
