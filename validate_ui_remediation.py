from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent
EXCLUDED = {".git", "node_modules", ".agents"}
issues: dict[str, list[str]] = defaultdict(list)
image_sources: Counter[str] = Counter()
pages = 0
lead_forms = 0

for page in sorted(ROOT.rglob("*.html")):
    if any(part in EXCLUDED for part in page.parts):
        continue
    pages += 1
    relative = page.relative_to(ROOT).as_posix()
    soup = BeautifulSoup(page.read_text(encoding="utf-8", errors="ignore"), "html.parser")
    ids = [node.get("id") for node in soup.find_all(id=True)]
    duplicates = [item for item, count in Counter(ids).items() if count > 1]
    if duplicates:
        issues["duplicate_ids"].append(f"{relative}: {', '.join(duplicates)}")
    for label in soup.find_all("label", attrs={"for": True}):
        if not soup.find(id=label["for"]):
            issues["orphan_labels"].append(f"{relative}: {label['for']}")
    for button in soup.find_all("button"):
        if not button.get("type"):
            issues["buttons_without_type"].append(relative)
    for form in soup.find_all("form"):
        if form.has_attr("data-lead-form"):
            lead_forms += 1
            for required in ("website", "source_url"):
                if not form.find(attrs={"name": required}):
                    issues["lead_form_metadata_missing"].append(f"{relative}: {required}")
            if not form.select_one("[data-form-status]"):
                issues["lead_form_status_missing"].append(relative)
        for control in form.find_all(["input", "select", "textarea"]):
            if control.get("type") in {"hidden", "submit", "button", "reset", "image"}:
                continue
            control_id = control.get("id")
            if not control_id or not soup.find("label", attrs={"for": control_id}):
                issues["unlabelled_form_controls"].append(f"{relative}: {control.get('name', control.name)}")
    for image in soup.find_all("img"):
        if not image.get("width") or not image.get("height"):
            image_sources[image.get("src", "(no src)")] += 1

summary = {
    "pages_checked": pages,
    "lead_forms_checked": lead_forms,
    "issue_counts": {key: len(value) for key, value in sorted(issues.items())},
    "issue_samples": {key: value[:20] for key, value in sorted(issues.items())},
    "remaining_images_without_dimensions": sum(image_sources.values()),
    "remaining_image_source_counts": image_sources.most_common(30),
}
(ROOT / "ui_remediation_validation.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
print(json.dumps(summary, indent=2))
