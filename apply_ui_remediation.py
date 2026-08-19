from __future__ import annotations

import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
EXCLUDED = {".git", "node_modules", ".agents"}
LABELS = {
    "name": "Your full name",
    "email": "Email address",
    "phone": "Phone or WhatsApp number",
    "service": "Service you need",
    "message": "Tell us about your project",
}
REMOTE_IMAGE_DIMENSIONS = {
    "photo-1498050108023-c5249f4df085": (800, 533),
    "photo-1512941937669-90a1b58e7e9c": (800, 533),
    "photo-1460925895917-afdab827c52f": (800, 570),
    "photo-1549317661-bd32c8ce0db2": (800, 533),
    "photo-1593784991095-a205069470b6": (800, 533),
    "photo-1626785774573-4b799315345d": (800, 533),
}


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def local_image_size(src: str, page: Path) -> tuple[int, int] | None:
    placeholder_size = re.search(r"placehold\.co/(\d+)x(\d+)", src)
    if placeholder_size:
        return int(placeholder_size.group(1)), int(placeholder_size.group(2))
    for image_key, dimensions in REMOTE_IMAGE_DIMENSIONS.items():
        if image_key in src:
            return dimensions
    if not src or src.startswith(("http://", "https://", "data:", "//", "#")):
        return None
    candidate = (page.parent / src).resolve()
    if not candidate.exists():
        candidate = (ROOT / src.lstrip("/")).resolve()
    if not candidate.exists() or ROOT not in candidate.parents:
        return None
    try:
        with Image.open(candidate) as image:
            return image.size
    except (OSError, ValueError):
        return None


def add_attribute(tag: str, name: str, value: str) -> str:
    if re.search(rf"\b{re.escape(name)}\s*=", tag, flags=re.I):
        return tag
    return tag[:-1] + f' {name}="{value}">'


def improve_lead_form(match: re.Match[str], page: Path) -> str:
    form = match.group(0)
    opening_match = re.match(r"<form\b[^>]*>", form, flags=re.I)
    if not opening_match:
        return form
    opening = opening_match.group(0)
    opening = re.sub(r'action="mailto:[^"]+"', 'action="/contact.php"', opening, flags=re.I)
    opening = add_attribute(opening, "data-lead-form", "")
    form = opening + form[len(opening_match.group(0)):]
    page_slug = slug(page.parent.name or "home")

    def replace_control(control_match: re.Match[str]) -> str:
        tag_name = control_match.group(1).lower()
        attrs = control_match.group(2)
        name_match = re.search(r'\bname\s*=\s*["\']([^"\']+)["\']', attrs, flags=re.I)
        control_name = name_match.group(1) if name_match else ""
        type_match = re.search(r'\btype\s*=\s*["\']([^"\']+)["\']', attrs, flags=re.I)
        control_type = type_match.group(1).lower() if type_match else "text"
        if tag_name == "input" and control_type in {"hidden", "submit", "button", "reset", "image"}:
            return control_match.group(0)
        label = LABELS.get(control_name, control_name.replace("_", " ").replace("-", " ").title() or "Form field")
        id_match = re.search(r'\bid\s*=\s*["\']([^"\']+)["\']', attrs, flags=re.I)
        control_id = id_match.group(1) if id_match else f"lead-{page_slug}-{slug(control_name or tag_name)}"
        if not id_match:
            attrs += f' id="{control_id}"'
        tag = f"<{tag_name}{attrs}>"
        return f'\n                  <label class="sr-only" for="{control_id}">{label}</label>\n                  {tag}'

    form = re.sub(r"<(input|select|textarea)\b([^>]*)>", replace_control, form, flags=re.I)
    source = page.as_posix().replace(ROOT.as_posix(), "").replace("/index.html", "/") or "/"
    closing = "</form>"
    if 'name="source_url"' not in form:
        form = form.replace(closing, f'\n                <input type="hidden" name="source_url" value="{source}"/>\n                <p class="form-status" data-form-status aria-live="polite"></p>\n              {closing}')
    return form


def ensure_lead_form_metadata(match: re.Match[str], page: Path) -> str:
    form = match.group(0)
    closing = "</form>"
    source = page.as_posix().replace(ROOT.as_posix(), "").replace("/index.html", "/") or "/"
    additions = []
    if 'name="website"' not in form:
        additions.append(
            '<div class="form-honeypot" aria-hidden="true"><label for="website-trap">Leave this field blank</label><input type="text" id="website-trap" name="website" tabindex="-1" autocomplete="off"/></div>'
        )
    if 'name="source_url"' not in form:
        additions.append(f'<input type="hidden" name="source_url" value="{source}"/>')
    if 'data-form-status' not in form:
        additions.append('<p class="form-status" data-form-status aria-live="polite"></p>')
    if additions:
        form = form.replace(closing, "\n                " + "\n                ".join(additions) + "\n              " + closing)
    return form


def improve_html(path: Path) -> tuple[bool, int]:
    text = path.read_text(encoding="utf-8", errors="ignore")
    original = text

    if "id=\"main-content\"" not in text and "id='main-content'" not in text:
        text = re.sub(r"<main\b(?![^>]*\bid=)([^>]*)>", r'<main id="main-content"\1>', text, count=1, flags=re.I)
    if "class=\"skip-link\"" not in text and "class='skip-link'" not in text:
        text = re.sub(r"(<body\b[^>]*>)", r'\1\n  <a class="skip-link" href="#main-content">Skip to main content</a>', text, count=1, flags=re.I)

    text = re.sub(
        r"\s*<!-- ===== GALLERY / PLACEHOLDER GRID ===== -->\s*<section class=\"gallery-section\">.*?</section>",
        "\n",
        text,
        flags=re.I | re.S,
    )

    def button_type(match: re.Match[str]) -> str:
        tag = match.group(0)
        return add_attribute(tag, "type", "button")

    text = re.sub(r"<button\b[^>]*>", button_type, text, flags=re.I)
    text = re.sub(
        r'<form\b[^>]*action="mailto:sales@torandigital\.co\.za"[^>]*>.*?</form>',
        lambda match: improve_lead_form(match, path),
        text,
        flags=re.I | re.S,
    )
    text = re.sub(
        r'<form\b(?=[^>]*data-lead-form)[^>]*>.*?</form>',
        lambda match: ensure_lead_form_metadata(match, path),
        text,
        flags=re.I | re.S,
    )

    def nav_trigger(match: re.Match[str]) -> str:
        tag = match.group(0)
        tag = add_attribute(tag, "aria-controls", "capabilities-menu")
        tag = add_attribute(tag, "type", "button")
        return tag

    text = re.sub(r"<button\b(?=[^>]*class=[\"'][^\"']*nav-dropdown-trigger)[^>]*>", nav_trigger, text, flags=re.I)
    text = re.sub(
        r"<div\b(?=[^>]*class=[\"'][^\"']*mega-dropdown)[^>]*>",
        lambda match: add_attribute(match.group(0), "id", "capabilities-menu"),
        text,
        flags=re.I,
    )
    text = re.sub(
        r'(<div\b[^>]*class=["\'][^"\']*mega-dropdown-(?:left|right)[^"\']*["\'][^>]*)\s+id=["\']capabilities-menu["\']([^>]*>)',
        r'\1\2',
        text,
        flags=re.I,
    )

    def mobile_trigger(match: re.Match[str]) -> str:
        tag = match.group(0)
        tag = add_attribute(tag, "id", "mobileServicesToggle")
        tag = add_attribute(tag, "aria-expanded", "false")
        tag = add_attribute(tag, "aria-controls", "mobileServicesList")
        tag = add_attribute(tag, "type", "button")
        return tag

    text = re.sub(r"<button\b(?=[^>]*class=[\"'][^\"']*mobile-services-toggle)[^>]*>", mobile_trigger, text, flags=re.I)
    text = re.sub(
        r"<div\b(?=[^>]*class=[\"'][^\"']*mobile-services-list)[^>]*>",
        lambda match: add_attribute(match.group(0), "id", "mobileServicesList"),
        text,
        flags=re.I,
    )
    text = re.sub(
        r"<div\b(?=[^>]*class=[\"'][^\"']*mobile-nav)[^>]*>",
        lambda match: add_attribute(add_attribute(match.group(0), "aria-label", "Mobile navigation"), "aria-hidden", "true"),
        text,
        flags=re.I,
    )

    image_updates = 0

    def image_dimensions(match: re.Match[str]) -> str:
        nonlocal image_updates
        tag = match.group(0)
        if re.search(r"\bwidth\s*=", tag, flags=re.I) and re.search(r"\bheight\s*=", tag, flags=re.I):
            return tag
        src_match = re.search(r'\bsrc\s*=\s*["\']([^"\']+)["\']', tag, flags=re.I)
        if not src_match:
            return tag
        dimensions = local_image_size(src_match.group(1), path)
        if not dimensions:
            return tag
        width, height = dimensions
        if not re.search(r"\bwidth\s*=", tag, flags=re.I):
            tag = add_attribute(tag, "width", str(width))
        if not re.search(r"\bheight\s*=", tag, flags=re.I):
            tag = add_attribute(tag, "height", str(height))
        image_updates += 1
        return tag

    text = re.sub(r"<img\b[^>]*>", image_dimensions, text, flags=re.I)
    text = re.sub(r"[ \t]+\n", "\n", text)
    if text != original:
        path.write_text(text, encoding="utf-8")
    return text != original, image_updates


CSS_APPEND = r'''

/* UI remediation: shared keyboard focus, disclosure state, lead feedback, and responsive header safeguards. */
:where(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: 3px solid var(--accent-blue) !important;
  outline-offset: 3px;
  box-shadow: 0 0 0 5px rgba(0, 102, 204, 0.2) !important;
}

.nav-dropdown.is-open .mega-dropdown,
.nav-dropdown:focus-within .mega-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  pointer-events: auto;
}

.nav-dropdown.is-open .nav-dropdown-trigger svg,
.nav-dropdown:focus-within .nav-dropdown-trigger svg {
  transform: rotate(180deg);
}

.mobile-primary-cta {
  display: block;
  margin: 1rem 0 0;
  padding: 0.95rem 1rem;
  background: var(--accent-red);
  color: var(--white) !important;
  font-family: var(--font-display);
  font-weight: 800;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.form-status {
  min-height: 1.2rem;
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  font-weight: 700;
}

.form-status.is-success { color: #116b4a; }
.form-status.is-error { color: #b42318; }

.form-honeypot {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
}

@media (max-width: 1320px) and (min-width: 1025px) {
  .header-inner { gap: 0.35rem; }
  .logo img { height: 44px; }
  .logo-text { font-size: 1.18rem; }
  .nav-menu { gap: 0; }
  .nav-menu a, .nav-menu .nav-link, .nav-dropdown-trigger { font-size: 0.7rem; padding: 9px 8px; }
  .header-cta { gap: 5px; }
  .header-cta .btn { padding: 8px 9px; font-size: 0.64rem; }
}

@media (max-width: 1160px) and (min-width: 1025px) {
  .header-cta .btn-whatsapp { display: none; }
}
'''

JS_APPEND = r'''

// UI remediation: accessible disclosures, interactive states, keyboard slider support, and server-handled lead forms.
document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.querySelector('.nav-dropdown');
  const desktopTrigger = dropdown?.querySelector('.nav-dropdown-trigger');
  const megaMenu = dropdown?.querySelector('.mega-dropdown');
  if (dropdown && desktopTrigger && megaMenu) {
    const closeDesktopMenu = () => {
      dropdown.classList.remove('is-open');
      desktopTrigger.setAttribute('aria-expanded', 'false');
    };
    desktopTrigger.addEventListener('click', (event) => {
      event.preventDefault();
      const open = dropdown.classList.toggle('is-open');
      desktopTrigger.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (event) => {
      if (!dropdown.contains(event.target)) closeDesktopMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeDesktopMenu();
    });
  }

  document.querySelectorAll('.mega-item').forEach((item) => {
    item.addEventListener('focus', () => item.dispatchEvent(new Event('mouseenter')));
  });

  const mobileNav = document.getElementById('mobileNav');
  const hamburger = document.getElementById('hamburger');
  const mobileServiceToggle = document.getElementById('mobileServicesToggle');
  const mobileServiceList = document.getElementById('mobileServicesList');
  if (mobileNav && hamburger) {
    const updateMobileNavState = () => {
      const open = mobileNav.classList.contains('open') || mobileNav.classList.contains('active');
      mobileNav.setAttribute('aria-hidden', String(!open));
      if (open) {
        const firstLink = mobileNav.querySelector('a, button');
        if (firstLink) firstLink.focus();
      }
    };
    hamburger.addEventListener('click', () => window.setTimeout(updateMobileNavState, 0));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        window.setTimeout(() => {
          if (mobileNav.getAttribute('aria-hidden') === 'true') hamburger.focus();
        }, 0);
      }
    });
    if (!mobileNav.querySelector('.mobile-primary-cta')) {
      const action = document.createElement('a');
      action.className = 'mobile-primary-cta';
      action.href = '/contact/';
      action.textContent = 'Get a fast proposal';
      mobileNav.prepend(action);
    }
  }
  if (mobileServiceToggle && mobileServiceList) {
    mobileServiceToggle.addEventListener('click', () => {
      window.setTimeout(() => {
        mobileServiceToggle.setAttribute('aria-expanded', String(mobileServiceList.classList.contains('open')));
      }, 0);
    });
  }

  document.querySelectorAll('.chip-choice, .filter-btn').forEach((button) => {
    const active = button.classList.contains('active');
    button.setAttribute('aria-pressed', String(active));
    button.addEventListener('click', () => {
      const group = button.classList.contains('filter-btn')
        ? document.querySelectorAll('.filter-btn')
        : button.parentElement?.querySelectorAll('.chip-choice') || [];
      group.forEach((option) => option.setAttribute('aria-pressed', String(option === button)));
    });
  });

  const stage = document.getElementById('baStage');
  const handle = document.getElementById('baHandle');
  const afterLayer = document.getElementById('baAfterLayer');
  if (stage && handle && afterLayer) {
    let current = 50;
    const setComparison = (percentage) => {
      current = Math.min(100, Math.max(0, percentage));
      afterLayer.style.width = `${current}%`;
      handle.style.left = `${current}%`;
      handle.setAttribute('aria-valuenow', String(Math.round(current)));
    };
    handle.setAttribute('tabindex', '0');
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', 'Before and after comparison position');
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');
    handle.setAttribute('aria-valuenow', String(current));
    handle.addEventListener('keydown', (event) => {
      const increment = event.shiftKey ? 10 : 5;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') { event.preventDefault(); setComparison(current - increment); }
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') { event.preventDefault(); setComparison(current + increment); }
      if (event.key === 'Home') { event.preventDefault(); setComparison(0); }
      if (event.key === 'End') { event.preventDefault(); setComparison(100); }
    });
  }

  document.querySelectorAll('.faq-question').forEach((button, index) => {
    const item = button.closest('.faq-item');
    const answer = item?.querySelector('.faq-answer');
    if (answer && !answer.id) answer.id = `faq-answer-${index + 1}`;
    if (answer) button.setAttribute('aria-controls', answer.id);
  });

  document.querySelectorAll('form[data-lead-form]').forEach((form) => {
    const status = form.querySelector('[data-form-status]');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const submit = form.querySelector('[type="submit"]');
      const data = new FormData(form);
      data.set('source_url', window.location.href);
      if (submit) submit.disabled = true;
      if (status) { status.className = 'form-status'; status.textContent = 'Sending your request…'; }
      try {
        const response = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.message || 'We could not send your request.');
        form.reset();
        if (status) { status.className = 'form-status is-success'; status.textContent = result.message; }
      } catch (error) {
        if (status) { status.className = 'form-status is-error'; status.textContent = error.message || 'We could not send your request. Please use WhatsApp or call us.'; }
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  });
});
'''


def main() -> None:
    changed_pages = 0
    image_updates = 0
    for page in sorted(ROOT.rglob("*.html")):
        if any(part in EXCLUDED for part in page.parts):
            continue
        changed, images = improve_html(page)
        changed_pages += int(changed)
        image_updates += images
    css_path = ROOT / "index.css"
    css = css_path.read_text(encoding="utf-8")
    if "UI remediation: shared keyboard focus" not in css:
        css_path.write_text(css + CSS_APPEND, encoding="utf-8")
    js_path = ROOT / "index.js"
    js = js_path.read_text(encoding="utf-8")
    if "UI remediation: accessible disclosures" not in js:
        js_path.write_text(js + JS_APPEND, encoding="utf-8")
    print(f"Updated {changed_pages} HTML pages and added dimensions to {image_updates} image tags.")


if __name__ == "__main__":
    main()
