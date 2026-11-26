#!/usr/bin/env python3
"""Install the Adventure Planner interface refinements into a local repo checkout."""
from pathlib import Path

ROOT = Path.cwd()
PAGES = ("discover.html", "plan-day.html", "my-adventures.html", "shortlist.html")
CSS_LINE = '    <link rel="stylesheet" href="enhancements.css?v=1">'
JS_LINE = '    <script src="enhancements.js?v=1" defer></script>'

missing = [name for name in PAGES if not (ROOT / name).is_file()]
if missing:
    raise SystemExit(
        "Run this script from the repository root. Missing: " + ", ".join(missing)
    )

for name in PAGES:
    path = ROOT / name
    content = path.read_text(encoding="utf-8")
    updated = content

    if "enhancements.css" not in updated:
        marker = '    <link rel="stylesheet" href="refinements.css">'
        marker_versioned = '    <link rel="stylesheet" href="refinements.css?v=3">'
        if marker in updated:
            updated = updated.replace(marker, marker + "\n" + CSS_LINE, 1)
        elif marker_versioned in updated:
            updated = updated.replace(marker_versioned, marker_versioned + "\n" + CSS_LINE, 1)
        else:
            raise SystemExit(f"Could not find refinements.css link in {name}")

    if "enhancements.js" not in updated:
        marker = "</head>"
        if marker not in updated:
            raise SystemExit(f"Could not find </head> in {name}")
        updated = updated.replace(marker, JS_LINE + "\n" + marker, 1)

    if updated != content:
        path.write_text(updated, encoding="utf-8")
        print(f"Updated {name}")
    else:
        print(f"Already installed in {name}")

print("Installation references are in place. Copy enhancements.js and enhancements.css into this directory if you have not already done so.")
