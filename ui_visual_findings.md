# Rendered UI Findings

## Homepage desktop preview

The shared header becomes horizontally congested at a standard desktop viewport. The full navigation, utility information, and primary proposal CTA compete for the same line; the right-side CTA is visibly clipped in the inspected viewport. The header should collapse or simplify earlier, before the current tablet breakpoint.

The hero visual has a coherent dark technical aesthetic and distinct service positioning, but the oversized headline and technical visual cause the primary proposal CTA to sit below the first visible hero frame. The main commercial action should be visible alongside the opening proposition without scrolling.

The hero presents multiple competing actions: proposal, capabilities, WhatsApp, and scope estimator. The page should nominate one primary route per intent and demote the remaining actions to secondary or contextual actions.

## Shared navigation and interaction observations

The desktop mega-menu uses a button disclosure label but relies on hover styling and mouseenter panel changes. The current interaction model needs click, keyboard, focus-management, and disclosure-state support. The mobile services disclosure similarly needs `aria-expanded` and `aria-controls` state updates.

## Visual-consistency observations

The brand system—dark technical background, mono labels, strong orange CTA, and physical/digital service imagery—is distinctive. The main UI opportunity is not a rebrand; it is reducing simultaneous claims, calls to action, marquee movement, and interactive modules so that primary conversion paths are clearer.

## Ecommerce service-page preview

The shared service-page header has the same width issue as the homepage: the WhatsApp CTA is clipped at the right side of a standard desktop viewport. This confirms that header composition is a shared template defect rather than a single-page issue.

The ecommerce hero uses a powerful visual treatment but the display heading occupies most of the initial frame, delaying the supporting conversion copy and primary quote CTA. The headline needs a more constrained desktop type scale and a clear first-viewport action cluster.

The template contains portfolio cards labelled `Project Name`. These must be replaced with genuine, permissioned project proof or removed; generic portfolio placeholders weaken trust and are not suitable on an active commercial page.

The visible revenue, satisfaction, work-volume, availability, and response-time claims should be backed by evidence and reviewed for consistency across templates. The quote form itself uses a `mailto:` action and placeholder-only inputs, so it should inherit the accessible, server-handled contact-page form pattern.

## Remediation validation note

The first breakpoint adjustment was still visually rendered with the previous full-navigation state in the browser preview. The shared header was therefore changed to a more reliable compact-navigation model that switches to the hamburger at 1320px rather than attempting to compress every desktop link. The next validation pass must use a refreshed preview response to avoid stale CSS.

## Exact viewport validation

At 1280px, the revised header now resolves as a deliberate compact header: the logo, proposal CTA, and menu button are fully visible without clipping. At 375px, the header and hero remain readable and the primary proposal CTA is visible without a scroll. The mobile capture also showed the fixed tactical HUD overlapping the secondary hero action; that floating control is being removed on small screens because the mobile drawer and hero CTA already provide contact routes without obscuring content.
