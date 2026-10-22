"""Stamp a fresh version on every local script and stylesheet URL.

Hostinger's CDN can keep serving old cached copies of files after a deploy.
If old and new scripts mix, the site breaks. A new ?v= on every URL makes
each release load as a complete, matching set.

Run before every commit that changes the site:
    python3 tools/stamp-version.py
"""
import pathlib, re, time

ROOT = pathlib.Path(__file__).resolve().parent.parent
VERSION = time.strftime("%Y%m%d%H%M")

html_ref = re.compile(r'((?:src|href)=")((?:assets|data)/[^"?#]+\.(?:js|css))(?:\?v=[^"]*)?(")')
js_import = re.compile(r'''((?:from\s+|import\s*\(\s*)["'])(\.{1,2}/[^"'?]+\.js)(?:\?v=[^"']*)?(["'])''')

changed = 0
for path in [*ROOT.glob("*.html"), *ROOT.glob("assets/js/**/*.js"), *ROOT.glob("data/*.js")]:
    text = path.read_text(encoding="utf-8")
    pattern = html_ref if path.suffix == ".html" else js_import
    new = pattern.sub(lambda m: f"{m.group(1)}{m.group(2)}?v={VERSION}{m.group(3)}", text)
    if new != text:
        path.write_text(new, encoding="utf-8")
        changed += 1
print(f"Stamped version {VERSION} in {changed} files.")
