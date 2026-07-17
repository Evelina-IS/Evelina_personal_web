#!/usr/bin/env bash
set -euo pipefail

python3 scripts/generate_pdf_index.py
mkdocs gh-deploy --force
