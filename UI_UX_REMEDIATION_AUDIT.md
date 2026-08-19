# Toran Digital UI/UX Remediation Audit

**Scope:** Repository-wide static audit of 624 HTML pages, shared `index.css` and `index.js`, rendered homepage and ecommerce service-template previews, and representative conversion forms.
**Audit status:** Review complete; no UI production changes have been applied.
**Prepared:** 19 August 2026.

## Executive conclusion

Toran Digital has a **distinctive visual system**: the dark technical field, sharp display typography, orange action colour, technical labels, and blended software/field-service positioning make the site recognisable. The strongest opportunity is not a brand redesign. It is to make the shared interface **simpler, more accessible, more conversion-directed, and more stable at common viewport widths**.

The most urgent UI work is shared-template work. The rendered homepage and ecommerce template both show a congested desktop header with a clipped right-side CTA, while the tablet breakpoint removes every header CTA. Service pages also use `mailto:` quote forms with placeholder-only controls. Addressing those three shared patterns first will improve most of the site without requiring page-by-page cosmetic edits.

> **Do not begin with visual polishing.** First correct serving, header responsiveness, lead capture, accessible controls, and entity-proof presentation. Then reduce the amount of competing content and promotion inside the existing visual language.

## Quantified UI baseline

| Area | Evidence | Interpretation |
|---|---:|---|
| HTML pages reviewed | 624 | The audit covers the full static page footprint. |
| Pages with desktop main navigation | 624 | Shared navigation coverage is complete. |
| Pages with a mobile navigation container | 624 | A common mobile-drawer system exists. |
| Pages with a valid skip link | 623 | The homepage is the single template exception. |
| Forms | 19 | Lead capture is concentrated in service templates and the contact page. |
| `mailto:` forms | 18 | Most commercial forms depend on a visitor’s mail client. |
| Unlabelled form controls | 90 | The 18 `mailto:` forms use placeholder-only controls. |
| Buttons without explicit `type` | 724 across 616 pages | A widespread component hygiene issue; risky in or near forms. |
| Explicit `:focus-visible` rules | 0 | Keyboard focus is not consistently authored across shared controls. |
| Image instances without dimensions | 123 | Layout-shift risk requires image sizing rules. |
| Reduced-motion rule | 1 | The shared stylesheet has a useful baseline, but it should cover all interaction patterns. |

## Priority remediation queue

| Priority | Fix | Why it matters | Scope | Definition of done |
|---|---|---|---|---|
| **P0** | Restore the intended production site before UI launch | The public root previously returned a directory listing and `/index.html` returned 404. No UI can convert or be reliably tested until the intended site is served. | Hosting/deployment | Home, assets, forms, `robots.txt`, sitemap, and representative templates return the intended page/status. |
| **P0** | Rebuild the shared header at an earlier desktop breakpoint | The full nav, utility bar, and right-side CTA are visibly clipped at a standard desktop preview width. | `index.css` + all shared templates | No horizontal clipping at 1280px; CTA remains legible or the nav collapses before collision. |
| **P0** | Replace the 18 `mailto:` quote forms | Mail-client dependence interrupts mobile conversion, prevents reliable completion, and has no consistent confirmation/attribution. | Service templates | All retained quote forms post to the verified handler, preserve page/service source, and show success/error feedback. |
| **P0** | Give every service-form control a label | 90 input/select/textarea controls rely on placeholders only. W3C guidance requires labels or instructions for controls accepting input. [2] | 18 service forms | Visible labels or screen-reader labels are correctly associated with every field; error/help text is exposed when needed. |
| **P1** | Add a global, high-contrast `:focus-visible` system | The site has no shared authored focus-visible treatment; keyboard users need to see the active control. [1] | `index.css` | Links, buttons, fields, menu triggers, FAQ controls, filters, and CTA controls have a clearly visible focus indicator. |
| **P1** | Make desktop and mobile menus real disclosures | Desktop capability panels are hover/mouseenter-driven; mobile services toggle does not update expanded state or identify its controlled region. | `index.html`, shared templates, `index.js` | Click, Enter, and Space open/close controls; `aria-expanded` stays accurate; controlled content is named via `aria-controls`. [3] |
| **P1** | Preserve a primary mobile conversion path | At `max-width: 1024px`, header CTA buttons are removed; mobile navigation does not supply an equivalent visible proposal/WhatsApp CTA. | `index.css` + mobile nav markup | A single prominent contact route remains visible on tablet/mobile without obscuring content. |
| **P1** | Correct interaction semantics | Estimator choices and portfolio filters only change CSS classes; the before/after slider is mouse/touch-only; FAQ controls lack controlled-region relationships. | `index.html`, `index.js` | Filters/choices expose selected state, slider supports keyboard or uses a native range pattern, and disclosure controls identify panels. |
| **P1** | Add intrinsic image dimensions/aspect ratios | 123 image instances lack declared dimensions. | Shared image/template rules | Every content image reserves space before loading; hero media has a deliberate aspect ratio. |
| **P2** | Rebalance hero hierarchy and CTA density | Homepage and service heroes use highly dominant display headings; first actions can fall below the opening viewport and multiple CTAs compete. | Home/service templates | One primary CTA per commercial intent is visible above the fold; secondary choices remain contextual. |
| **P2** | Replace generic portfolio placeholders with real proof | Ecommerce service cards visibly use `Project Name`; generic placeholders reduce credibility. | Service templates | Real permissioned work is shown with meaningful title, visual, scope, and outcome; otherwise the section is removed. |
| **P2** | Validate every numerical/trust claim | The UI includes claims such as conversion lifts, client satisfaction, store counts, response times, guarantees, and testimonials. | Home/service content | Every public claim has evidence and approval; unsupported claims are removed or rewritten as a truthful process statement. |
| **P3** | Reduce simultaneous promotional motion and density | Marquees, floating controls, hero visuals, cards, estimators, reels, tables, proof blocks, and FAQs all compete for attention. | Home + shared CSS | The home page follows a clearer sequence: proposition → proof → primary conversion → secondary services. |

## Detailed findings

### 1. Shared header: responsive collision and CTA loss

The homepage and ecommerce service template show the same shared-header defect at the inspected desktop viewport: the navigation occupies the available line and the right-side CTA is visibly clipped. The current CSS only removes desktop navigation at `max-width: 1024px`; it does not create an intermediate composition for the range where the logo, seven navigation links, header actions, and utility information no longer fit.

At the same `max-width: 1024px` breakpoint, `.header-cta .btn` is set to `display: none`, leaving a hamburger control but no equivalent action in the primary header. This can be fixed without changing the visual identity by introducing a two-stage navigation model: a compact desktop state around 1200–1320px, and a mobile/tablet drawer that contains one large quote/WhatsApp action at the top.

### 2. Lead forms: conversion and accessibility must converge

The contact page provides the correct architectural direction: it posts to `/contact.php`, uses `autocomplete` attributes, and has screen-reader labels. Eighteen service templates do not follow that pattern. Their quote forms submit via `mailto:sales@torandigital.co.za` and rely on placeholders for field names.

The reusable fix is a single server-handled quote form partial. It should include a visible field label, optional helper text, required-state messaging, service/page-source hidden fields, a successful confirmation state, a failure fallback that preserves WhatsApp/call, and a compact consent note. Do not duplicate the form markup across every service template.

### 3. Keyboard and disclosure control gaps

The site has a good starting point: skip-link styling exists and 623 pages have a working skip target; the shared JavaScript supports Escape to close the mobile drawer. However, authored keyboard focus styles exist only for a small set of form controls and not the navigation, CTA, filters, FAQ buttons, or estimator options. W3C’s Focus Visible success criterion requires a visible focus indicator for keyboard-operable controls. [1]

The desktop mega menu uses a button marked `aria-expanded="false"` yet visual/open-panel behaviour is driven by hover and `mouseenter`. The mobile “Our Services” control has no `aria-expanded` or `aria-controls` relationship. A disclosure pattern requires a button that reports `aria-expanded` truthfully when it shows or hides content; `aria-controls` is the appropriate connection to the controlled region. [3]

### 4. Interactive components need state that users and assistive technology can understand

The homepage contains an estimator, portfolio category filters, a before/after comparison, and FAQ accordions. The estimator and filters set `.active` classes but do not expose selected state; the before/after comparison handles mouse and touch movement but not keyboard movement. These tools should be retained only if they behave as robust controls.

Use `aria-pressed` for mutually exclusive presentation controls only where it accurately represents toggled state, or a radio-group pattern where a single option is selected. Expose estimator result updates through an appropriate live region. Replace the comparison slider with a native range input or a fully keyboard-operable ARIA slider. The portfolio filter should update both visible items and a concise result count.

### 5. Visual hierarchy should be tightened, not redesigned

The visual language is cohesive. The issue is content competition. The homepage stacks a large hero, technical badge strip, six services, reels, a comparison slider, a matrix, an estimator, a portfolio filter, case studies, social proof, and FAQs. This does demonstrate breadth, but it delays decision-making and scatters the user across too many actions.

The home page should lead with one primary commercial route—such as **Get a proposal**—and one secondary exploration route. Move the estimator to a dedicated project-planning experience or lower it after proof. Use vehicle-branding images as verified case-study proof rather than generic “reel” placeholders. Keep the visual energy, but choose fewer moments for movement and high-contrast decoration.

### 6. Content-proof components require editorial governance

The ecommerce service page visibly includes generic `Project Name` cards. These should never be published as placeholder proof. Replace them with permissioned projects, including image, service scope, vehicle/platform type, area only if factually relevant, and a truthful outcome. If a project cannot be described credibly, remove the card.

The same principle applies to testimonials, satisfaction figures, conversion statistics, project counts, and guarantees. This audit does not determine whether existing claims are true; it requires the business to verify them before continuing to display them as proof. Do not invent, seed, or maintain unverified reviews.

## Safe implementation sequence

| Sprint | Shared implementation work | Page-level rollout |
|---|---|---|
| **1. Foundation** | Fix deployment, establish header breakpoints, add global focus-visible styles, restore the homepage skip link, and set explicit button types. | Test home, a service hub, ecommerce, contact, and a location template at desktop/tablet/mobile. |
| **2. Conversion** | Build one accessible server-handled quote form partial and one consistent success/error state. | Replace all 18 `mailto:` forms; retain WhatsApp/call as intentional alternatives. |
| **3. Interaction** | Upgrade menu/disclosure semantics, estimator, filters, FAQ regions, and comparison slider. | Remove or defer any component that cannot meet the selected interaction pattern. |
| **4. Stability and proof** | Set image dimensions/aspect ratios, reduce autoplay/marquee pressure, and formalise content-proof rules. | Replace placeholders with real, permissioned work; verify public claims. |
| **5. Location migration** | Resume the two-location schema and proof-led vehicle-branding work. | Retain pages only after the shared form, proof, navigation, and accessibility systems are stable. |

## Acceptance checklist before rollout

| Test | Pass condition |
|---|---|
| Desktop header | At 1280px, no link, logo, or CTA is clipped; one deliberate action is visible. |
| Tablet/mobile header | Navigation opens/closes by pointer, Enter, Space, and Escape; a primary contact path remains present. |
| Keyboard traversal | Focus is visible on every interactive element and returns sensibly after closing the mobile navigation. |
| Forms | Every field is labelled, submissions work without a local email client, and success/failure are communicated. |
| Interactive modules | Selected states and result changes are programmatically exposed; comparison controls are keyboard operable. |
| Layout stability | No visible image-driven content jump occurs while representative pages load. |
| Content proof | No generic project placeholder, unsupported metric, or unverified review remains. |

## References

[1]: https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html "W3C WAI: Understanding Focus Visible"
[2]: https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html "W3C WAI: Understanding Labels or Instructions"
[3]: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/ "W3C WAI-ARIA Authoring Practices: Disclosure Pattern"
