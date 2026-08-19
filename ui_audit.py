from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent
EXCLUDED = {".git", "node_modules", ".agents"}


def clean(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def page_url(path: Path) -> str:
    relative = path.relative_to(ROOT).as_posix()
    if relative == "index.html":
        return "/"
    if relative.endswith("/index.html"):
        return "/" + relative[:-10]
    return "/" + relative


def has_accessible_name(node) -> bool:
    if clean(node.get("aria-label")) or clean(node.get("aria-labelledby")):
        return True
    if clean(node.get_text(" ", strip=True)):
        return True
    if node.find("img", alt=True) and clean(node.find("img").get("alt")):
        return True
    return False


records = []
findings = defaultdict(list)
form_actions = Counter()
all_html = [path for path in ROOT.rglob("*.html") if not any(part in EXCLUDED for part in path.parts)]

for path in sorted(all_html):
    raw = path.read_text(encoding="utf-8", errors="ignore")
    soup = BeautifulSoup(raw, "html.parser")
    url = page_url(path)
    body = soup.body
    has_nav = bool(soup.find("nav", attrs={"aria-label": re.compile(r"main navigation", re.I)}))
    has_mobile_nav = bool(soup.select_one(".mobile-nav"))
    skip = soup.select_one(".skip-link")
    skip_target_ok = False
    if skip and skip.get("href", "").startswith("#"):
        skip_target_ok = bool(soup.find(id=skip.get("href", "")[1:]))
    forms = soup.find_all("form")
    form_mailto = 0
    missing_control_labels = 0
    for form in forms:
        action = clean(form.get("action")) or "(no action)"
        form_actions[action] += 1
        if action.lower().startswith("mailto:"):
            form_mailto += 1
        for field in form.find_all(["input", "textarea", "select"]):
            field_type = field.get("type", "text").lower()
            if field_type in {"hidden", "submit", "button", "reset", "image"}:
                continue
            field_id = clean(field.get("id"))
            explicit_label = bool(field_id and soup.find("label", attrs={"for": field_id}))
            nested_label = bool(field.find_parent("label"))
            aria_name = bool(clean(field.get("aria-label")) or clean(field.get("aria-labelledby")))
            if not (explicit_label or nested_label or aria_name):
                missing_control_labels += 1
    blank_missing_rel = 0
    hash_links = 0
    for anchor in soup.find_all("a", href=True):
        href = clean(anchor.get("href"))
        if href == "#":
            hash_links += 1
        if anchor.get("target") == "_blank":
            rel = " ".join(anchor.get("rel", []))
            if "noopener" not in rel:
                blank_missing_rel += 1
    buttons_without_type = sum(1 for button in soup.find_all("button") if not button.get("type"))
    unnamed_buttons = sum(1 for button in soup.find_all("button") if not has_accessible_name(button))
    images = soup.find_all("img")
    missing_dimensions = sum(1 for image in images if not image.get("width") or not image.get("height"))
    lazy_images = sum(1 for image in images if image.get("loading") == "lazy")
    records.append({
        "file": path.relative_to(ROOT).as_posix(),
        "url": url,
        "section": url.strip("/").split("/")[0] or "home",
        "has_main_nav": has_nav,
        "has_mobile_nav": has_mobile_nav,
        "has_skip_link": bool(skip),
        "skip_target_ok": skip_target_ok,
        "form_count": len(forms),
        "mailto_form_count": form_mailto,
        "unlabelled_form_controls": missing_control_labels,
        "target_blank_missing_noopener": blank_missing_rel,
        "buttons_without_type": buttons_without_type,
        "unnamed_buttons": unnamed_buttons,
        "hash_links": hash_links,
        "image_count": len(images),
        "images_missing_dimensions": missing_dimensions,
        "lazy_images": lazy_images,
    })
    for key, amount in records[-1].items():
        if key in {"file", "url", "section", "has_main_nav", "has_mobile_nav", "has_skip_link", "skip_target_ok"}:
            continue
        if isinstance(amount, int) and amount:
            findings[key].append(url)
    if not has_nav:
        findings["missing_main_navigation"].append(url)
    if not has_mobile_nav:
        findings["missing_mobile_navigation"].append(url)
    if not skip:
        findings["missing_skip_link"].append(url)
    elif not skip_target_ok:
        findings["broken_skip_target"].append(url)

css = (ROOT / "index.css").read_text(encoding="utf-8", errors="ignore")
js = (ROOT / "index.js").read_text(encoding="utf-8", errors="ignore")
summary = {
    "pages": len(records),
    "shared_css_bytes": len(css.encode("utf-8")),
    "shared_js_bytes": len(js.encode("utf-8")),
    "css_focus_visible_rules": len(re.findall(r"focus-visible", css)),
    "css_focus_rules": len(re.findall(r":focus(?!-visible)", css)),
    "css_reduced_motion_rules": len(re.findall(r"prefers-reduced-motion", css)),
    "css_hover_rules": len(re.findall(r":hover", css)),
    "css_mobile_breakpoints": len(re.findall(r"@media\s*\([^)]*max-width", css)),
    "js_domcontentloaded_handlers": len(re.findall(r"DOMContentLoaded", js)),
    "js_click_listeners": len(re.findall(r"addEventListener\(['\"]click", js)),
    "form_actions": dict(form_actions),
    "pages_with_main_navigation": sum(record["has_main_nav"] for record in records),
    "pages_with_mobile_navigation": sum(record["has_mobile_nav"] for record in records),
    "pages_with_skip_links": sum(record["has_skip_link"] for record in records),
    "pages_with_valid_skip_target": sum(record["skip_target_ok"] for record in records),
    "total_forms": sum(record["form_count"] for record in records),
    "total_mailto_forms": sum(record["mailto_form_count"] for record in records),
    "total_unlabelled_form_controls": sum(record["unlabelled_form_controls"] for record in records),
    "total_blank_missing_noopener": sum(record["target_blank_missing_noopener"] for record in records),
    "total_buttons_without_type": sum(record["buttons_without_type"] for record in records),
    "total_unnamed_buttons": sum(record["unnamed_buttons"] for record in records),
    "total_hash_links": sum(record["hash_links"] for record in records),
    "total_images_missing_dimensions": sum(record["images_missing_dimensions"] for record in records),
    "total_lazy_images": sum(record["lazy_images"] for record in records),
    "finding_page_counts": {key: len(value) for key, value in sorted(findings.items())},
    "finding_url_samples": {key: value[:20] for key, value in sorted(findings.items())},
}

(ROOT / "ui_audit_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
with (ROOT / "ui_audit_pages.csv").open("w", newline="", encoding="utf-8") as output:
    writer = csv.DictWriter(output, fieldnames=records[0].keys())
    writer.writeheader()
    writer.writerows(records)
print(json.dumps({key: summary[key] for key in [
    "pages", "pages_with_main_navigation", "pages_with_mobile_navigation", "pages_with_skip_links",
    "pages_with_valid_skip_target", "total_forms", "total_mailto_forms", "total_unlabelled_form_controls",
    "total_blank_missing_noopener", "total_buttons_without_type", "total_unnamed_buttons", "total_hash_links",
    "total_images_missing_dimensions", "css_focus_visible_rules", "css_reduced_motion_rules", "css_mobile_breakpoints"
]}, indent=2))
