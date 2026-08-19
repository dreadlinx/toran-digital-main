const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;

// Load datasets
const { webDesignAreas } = require('./data_web_design.js');
const { vehicleBrandingAreas } = require('./data_vehicle_branding.js');
const { mobileAppAreas } = require('./data_mobile_apps.js');

const allAreas = [...webDesignAreas, ...vehicleBrandingAreas, ...mobileAppAreas];

console.log(`Regenerating ${allAreas.length} area pages with animation classes, tactical hover states, and internal link silos...`);

function generatePageHtml(data) {
  const canonicalUrl = `https://torandigital.co.za/${data.folder}/`;
  const encodedWaText = encodeURIComponent(`Hi Toran Digital, I%27d like a quote for ${data.serviceName} in ${data.locality}`);

  // Build FAQ JSON-LD
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faq.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  // LocalBusiness schema
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${canonicalUrl}#localbusiness`,
    "name": `Toran Digital - ${data.serviceName} ${data.locality}`,
    "url": canonicalUrl,
    "telephone": "+27696219479",
    "email": "sales@torandigital.co.za",
    "priceRange": "ZAR",
    "image": "https://torandigital.co.za/logo/toran_logo.webp",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "14 Jordaan Street",
      "addressLocality": "Benoni",
      "addressRegion": "Gauteng",
      "postalCode": "1501",
      "addressCountry": "ZA"
    },
    "areaServed": [
      { "@type": "City", "name": data.locality },
      ...data.suburbs.map(s => ({ "@type": "AdministrativeArea", "name": s }))
    ],
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": data.lat || -26.1713,
      "longitude": data.lng || 28.2435
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Saturday"],
        "opens": "09:00",
        "closes": "14:00"
      }
    ]
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://torandigital.co.za/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Areas",
        "item": "https://torandigital.co.za/areas/"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${data.serviceName} in ${data.locality}`,
        "item": canonicalUrl
      }
    ]
  };

  // Pricing packages HTML
  let pricingHtml = '';
  if (data.packages && data.packages.length === 3) {
    pricingHtml = `
    <div class="pricing-grid reveal reveal-delay-2" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 3rem;">
      ${data.packages.map((pkg, idx) => `
        <div class="pricing-card card-tactile ${pkg.popular ? 'popular' : ''}" style="background: var(--dark-900); border: 2px solid ${pkg.popular ? 'var(--accent-red)' : 'var(--dark-700)'}; border-radius: 0px; padding: 2.5rem; text-align: center; position: relative; box-shadow: ${pkg.popular ? '8px 8px 0px var(--accent-red)' : '4px 4px 0px var(--dark-950)'};">
          ${pkg.popular ? '<div class="popular-badge" style="position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: var(--accent-red); color: #fff; padding: 4px 16px; font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; border: 1px solid var(--dark-950);">RECOMMENDED</div>' : ''}
          <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-red); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.5rem; font-weight: 700;">${pkg.tier}</div>
          <h3 style="font-size: 1.5rem; font-family: var(--font-display); color: #fff; margin-bottom: 0.5rem;">${pkg.name}</h3>
          <p style="color: var(--dark-400); font-size: 0.9rem; min-height: 48px; line-height: 1.5;">${pkg.tagline}</p>
          <div style="font-family: var(--font-display); font-size: 2.5rem; font-weight: 800; color: #fff; margin: 1.5rem 0;">${pkg.price} <span style="font-size: 0.9rem; color: var(--dark-400); font-weight: 400; font-family: var(--font-body);">${pkg.period || 'once-off'}</span></div>
          <ul style="list-style: none; padding: 0; margin: 1.5rem 0; text-align: left;">
            ${pkg.features.map(f => `
              <li style="margin-bottom: 0.75rem; display: flex; align-items: flex-start; gap: 10px; color: var(--dark-300); font-size: 0.9rem;">
                <svg style="width: 18px; height: 18px; color: var(--accent-red); flex-shrink: 0; margin-top: 2px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                <span>${f}</span>
              </li>
            `).join('')}
          </ul>
          <a href="https://wa.me/27696219479?text=${encodeURIComponent(`Hi Toran Digital, I%27d like a quote for the ${pkg.name} package in ${data.locality}`)}" class="btn ${pkg.popular ? 'btn-accent' : 'btn-outline'}" style="width: 100%;" target="_blank" rel="noopener">Request Quote &rarr;</a>
        </div>
      `).join('')}
    </div>`;
  }

  // Feature cards HTML
  const featuresHtml = data.features.map(feat => `
    <div class="card-tactile" style="background: var(--dark-900); border: 2px solid var(--dark-700); border-radius: 0px; padding: 2rem; box-shadow: 4px 4px 0px var(--dark-950);">
      <div style="width: 48px; height: 48px; background: rgba(255, 51, 0, 0.1); border: 1px solid var(--accent-red); display: flex; align-items: center; justify-content: center; color: var(--accent-red); margin-bottom: 1.25rem;">
        ${feat.iconSvg}
      </div>
      <h3 style="font-size: 1.25rem; font-family: var(--font-display); color: #fff; margin-bottom: 0.75rem;">${feat.title}</h3>
      <p style="color: var(--dark-400); font-size: 0.95rem; line-height: 1.6; margin: 0;">${feat.desc}</p>
    </div>
  `).join('');

  // Internal linking silo block based on category
  let siloLinksHtml = '';
  if (data.folder.startsWith('web-design-')) {
    siloLinksHtml = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
        <a href="../web-design/" class="card-tactile" style="background: var(--white); border: 2px solid var(--dark-950); padding: 1.5rem; text-decoration: none; display: block; box-shadow: var(--shadow-brutal-sm);">
          <div style="color: var(--accent-red); font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem;">Core Capability</div>
          <h4 style="font-family: var(--font-display); font-size: 1.15rem; color: var(--dark-950); margin: 0 0 0.5rem;">Web Design &amp; E-Commerce Matrix</h4>
          <span style="color: var(--accent-blue); font-size: 0.85rem; font-weight: 700;">Explore Full Web Stack &rarr;</span>
        </a>
        <a href="../blog/nextjs-vs-wordpress-johannesburg-enterprises/" class="card-tactile" style="background: var(--white); border: 2px solid var(--dark-950); padding: 1.5rem; text-decoration: none; display: block; box-shadow: var(--shadow-brutal-sm);">
          <div style="color: var(--accent-red); font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem;">Technical Guide</div>
          <h4 style="font-family: var(--font-display); font-size: 1.15rem; color: var(--dark-950); margin: 0 0 0.5rem;">Next.js vs WordPress for Gauteng Enterprises</h4>
          <span style="color: var(--accent-blue); font-size: 0.85rem; font-weight: 700;">Read Architecture Review &rarr;</span>
        </a>
        <a href="../portfolio/" class="card-tactile" style="background: var(--white); border: 2px solid var(--dark-950); padding: 1.5rem; text-decoration: none; display: block; box-shadow: var(--shadow-brutal-sm);">
          <div style="color: var(--accent-red); font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem;">Case Studies</div>
          <h4 style="font-family: var(--font-display); font-size: 1.15rem; color: var(--dark-950); margin: 0 0 0.5rem;">Live E-Commerce &amp; Web Platform Proof</h4>
          <span style="color: var(--accent-blue); font-size: 0.85rem; font-weight: 700;">View 18+ Live Builds &rarr;</span>
        </a>
      </div>
    `;
  } else if (data.folder.startsWith('vehicle-branding-')) {
    siloLinksHtml = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
        <a href="../vehicle-branding/" class="card-tactile" style="background: var(--white); border: 2px solid var(--dark-950); padding: 1.5rem; text-decoration: none; display: block; box-shadow: var(--shadow-brutal-sm);">
          <div style="color: var(--accent-red); font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem;">Workshop Capability</div>
          <h4 style="font-family: var(--font-display); font-size: 1.15rem; color: var(--dark-950); margin: 0 0 0.5rem;">Commercial Fleet Wraps &amp; Livery</h4>
          <span style="color: var(--accent-blue); font-size: 0.85rem; font-weight: 700;">Explore Vehicle Solutions &rarr;</span>
        </a>
        <a href="../blog/vehicle-wrap-maintenance-guide-south-africa/" class="card-tactile" style="background: var(--white); border: 2px solid var(--dark-950); padding: 1.5rem; text-decoration: none; display: block; box-shadow: var(--shadow-brutal-sm);">
          <div style="color: var(--accent-red); font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem;">Fleet Care Guide</div>
          <h4 style="font-family: var(--font-display); font-size: 1.15rem; color: var(--dark-950); margin: 0 0 0.5rem;">Maintaining 3M Cast Wraps in South African UV</h4>
          <span style="color: var(--accent-blue); font-size: 0.85rem; font-weight: 700;">Read Maintenance Guide &rarr;</span>
        </a>
        <a href="../portfolio/" class="card-tactile" style="background: var(--white); border: 2px solid var(--dark-950); padding: 1.5rem; text-decoration: none; display: block; box-shadow: var(--shadow-brutal-sm);">
          <div style="color: var(--accent-red); font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem;">Fleet Gallery</div>
          <h4 style="font-family: var(--font-display); font-size: 1.15rem; color: var(--dark-950); margin: 0 0 0.5rem;">Heavy Logistics &amp; Bakkie Branding Gallery</h4>
          <span style="color: var(--accent-blue); font-size: 0.85rem; font-weight: 700;">View Commercial Portfolio &rarr;</span>
        </a>
      </div>
    `;
  } else {
    siloLinksHtml = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
        <a href="../mobile-apps/" class="card-tactile" style="background: var(--white); border: 2px solid var(--dark-950); padding: 1.5rem; text-decoration: none; display: block; box-shadow: var(--shadow-brutal-sm);">
          <div style="color: var(--accent-blue); font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem;">Mobile Systems</div>
          <h4 style="font-family: var(--font-display); font-size: 1.15rem; color: var(--dark-950); margin: 0 0 0.5rem;">Native iOS &amp; Android App Engineering</h4>
          <span style="color: var(--accent-blue); font-size: 0.85rem; font-weight: 700;">Explore App Architecture &rarr;</span>
        </a>
        <a href="../blog/react-native-vs-flutter-south-africa/" class="card-tactile" style="background: var(--white); border: 2px solid var(--dark-950); padding: 1.5rem; text-decoration: none; display: block; box-shadow: var(--shadow-brutal-sm);">
          <div style="color: var(--accent-blue); font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem;">Framework Guide</div>
          <h4 style="font-family: var(--font-display); font-size: 1.15rem; color: var(--dark-950); margin: 0 0 0.5rem;">React Native vs Flutter for SA Businesses</h4>
          <span style="color: var(--accent-blue); font-size: 0.85rem; font-weight: 700;">Read Technical Comparison &rarr;</span>
        </a>
        <a href="../portfolio/" class="card-tactile" style="background: var(--white); border: 2px solid var(--dark-950); padding: 1.5rem; text-decoration: none; display: block; box-shadow: var(--shadow-brutal-sm);">
          <div style="color: var(--accent-blue); font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem;">App Case Studies</div>
          <h4 style="font-family: var(--font-display); font-size: 1.15rem; color: var(--dark-950); margin: 0 0 0.5rem;">Logistics Driver &amp; Field Dispatch Apps</h4>
          <span style="color: var(--accent-blue); font-size: 0.85rem; font-weight: 700;">View Live App Builds &rarr;</span>
        </a>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en-ZA">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  
  <!-- Primary SEO Meta Tags -->
  <title>${data.title}</title>
  <meta name="description" content="${data.desc}"/>
  <meta name="author" content="Toran Digital"/>
  <meta name="robots" content="index, follow"/>
  <link rel="canonical" href="${canonicalUrl}"/>

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website"/>
  <meta property="og:url" content="${canonicalUrl}"/>
  <meta property="og:title" content="${data.title}"/>
  <meta property="og:description" content="${data.desc}"/>
  <meta property="og:image" content="https://torandigital.co.za/logo/toran_logo.webp"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:image:type" content="image/png"/>

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${data.title}"/>
  <meta name="twitter:description" content="${data.desc}"/>
  <meta name="twitter:image" content="https://torandigital.co.za/logo/toran_logo.webp"/>

  <!-- Favicons -->
  <link href="../logo/toran_logo.webp" rel="icon" type="image/png"/>
  <link href="../logo/toran_logo.webp" rel="apple-touch-icon"/>

  <!-- Typography & CSS -->
  <link href="https://fonts.googleapis.com" rel="preconnect"/>
  <link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&family=Syne:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  <link href="../index.css" rel="stylesheet"/>

  <!-- Schema Markup -->
  <script type="application/ld+json">
  ${JSON.stringify(businessSchema, null, 2)}
  </script>
  <script type="application/ld+json">
  ${JSON.stringify(breadcrumbSchema, null, 2)}
  </script>
  <script type="application/ld+json">
  ${JSON.stringify(faqSchema, null, 2)}
  </script>
</head>
<body>
  <div class="bg-noise-overlay" aria-hidden="true"></div>
  <a class="skip-link" href="#main-content">Skip to main content</a>

  <!-- ==================== TOP UTILITY BAR ==================== -->
  <div class="studio-utility-bar">
    <div class="container">
      <div class="utility-bar-inner">
        <div class="utility-left">
          <span class="live-status-indicator">
            <span class="live-status-dot"></span>
            ACTIVE REGIONAL CREW: ${data.locality.toUpperCase()}
          </span>
          <span class="jhb-clock" id="jhbClock">JHB GMT+2 — 08:00:00</span>
        </div>
        <div class="utility-right">
          <span>14 Jordaan St, Benoni</span>
          <a class="utility-link" href="tel:+27696219479">CALL: +27 69 621 9479</a>
          <a class="utility-link" href="https://wa.me/27696219479?text=${encodedWaText}" rel="noopener" target="_blank">WHATSAPP DISPATCH &rarr;</a>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== MAIN SITE HEADER ==================== -->
  <header class="site-header" id="header">
    <div class="container">
      <div class="header-inner">
        <a aria-label="Toran Digital Home" class="logo" href="../">
          <img alt="Toran Digital Logo" height="40" src="../logo/toran_logo.webp" width="40" decoding="async"/>
          <span class="logo-text">TORAN <span>DIGITAL</span></span>
        </a>

        <!-- Desktop Navigation -->
        <nav aria-label="Main Navigation" class="nav-menu" id="navMenu">
          <a class="nav-link" href="../">Home</a>

          <!-- Services Mega Dropdown -->
          <div class="nav-dropdown">
            <button aria-expanded="false" aria-haspopup="true" class="nav-dropdown-trigger">
              Capabilities
              <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div class="mega-dropdown">
              <div class="mega-dropdown-left">
                <a class="mega-item active" data-target="mega-web" href="../web-design/">
                  Web &amp; E-Commerce
                  <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </a>
                <a class="mega-item" data-target="mega-apps" href="../mobile-apps/">
                  Mobile Apps
                  <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </a>
                <a class="mega-item" data-target="mega-seo" href="../seo-marketing/">
                  SEO &amp; Growth
                  <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </a>
                <a class="mega-item" data-target="mega-vehicle" href="../vehicle-branding/">
                  Vehicle Wraps
                  <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </a>
                <a class="mega-item" data-target="mega-dstv" href="../dstv-installations/">
                  DSTV &amp; Security
                  <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </a>
                <a class="mega-item" data-target="mega-graphic" href="../graphic-design/">
                  Brand &amp; Signs
                  <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </a>
              </div>
              <div class="mega-dropdown-right">
                <div class="mega-sub-panel active" id="mega-web">
                  <a href="../web-design/ecommerce/">Ecommerce Storefronts (Shopify &amp; Next.js)</a>
                  <a href="../web-design/custom-web-apps/">Custom Web Applications &amp; Client Portals</a>
                  <a href="../web-design/wordpress/">High-Speed WordPress Platforms</a>
                  <a class="view-all-services" href="../web-design/">View All Web Capabilities &rarr;</a>
                </div>
                <div class="mega-sub-panel" id="mega-apps">
                  <a href="../mobile-apps/ios-development/">Native iOS Swift Applications</a>
                  <a href="../mobile-apps/android-development/">Native Android Kotlin Applications</a>
                  <a href="../mobile-apps/cross-platform/">Cross-Platform (React Native / Flutter)</a>
                  <a class="view-all-services" href="../mobile-apps/">View All App Solutions &rarr;</a>
                </div>
                <div class="mega-sub-panel" id="mega-seo">
                  <a href="../seo-marketing/local-seo/">Local SEO &amp; Organic SERP Growth</a>
                  <a href="../seo-marketing/google-ads/">Google Ads PPC Campaign Management</a>
                  <a href="../seo-marketing/google-business-profile/">Google Business Profile 3-Pack Optimization</a>
                  <a class="view-all-services" href="../seo-marketing/">View All Growth Services &rarr;</a>
                </div>
                <div class="mega-sub-panel" id="mega-vehicle">
                  <a href="../vehicle-branding/full-wraps/">Full 3M Cast Vinyl Vehicle Wraps</a>
                  <a href="../vehicle-branding/fleet-wrapping/">Commercial Logistics Fleet Livery</a>
                  <a href="../vehicle-branding/bakkie-branding/">Double Cab &amp; Commercial Bakkie Decals</a>
                  <a class="view-all-services" href="../vehicle-branding/">View All Wrapping Solutions &rarr;</a>
                </div>
                <div class="mega-sub-panel" id="mega-dstv">
                  <a href="../dstv-installations/dstv/">Accredited DSTV Explora &amp; Extra View</a>
                  <a href="../dstv-installations/cctv/">Commercial 4K IP CCTV Security Grids</a>
                  <a href="../dstv-installations/tv-mounting/">Flush TV Wall Mounting &amp; Concealed Cabling</a>
                  <a class="view-all-services" href="../dstv-installations/">View All Field Installations &rarr;</a>
                </div>
                <div class="mega-sub-panel" id="mega-graphic">
                  <a href="../graphic-design/corporate-identity/">Corporate Identity &amp; Vector Brand Kits</a>
                  <a href="../graphic-design/logo-design/">Bespoke Logo Design &amp; Typography</a>
                  <a href="../graphic-design/signage/">Architectural 3D Illuminated Storefront Signs</a>
                  <a class="view-all-services" href="../graphic-design/">View All Design Services &rarr;</a>
                </div>
              </div>
            </div>
          </div>

          <a class="nav-link" href="../portfolio/">Portfolio</a>
          <a class="nav-link" href="../about/">About</a>
          <a class="nav-link active" href="../areas/">Areas</a>
          <a class="nav-link" href="../blog/">Blog</a>
          <a class="nav-link" href="../contact/">Contact</a>
        </nav>

        <!-- Header CTA Buttons -->
        <div class="header-cta">
          <a class="btn btn-whatsapp" href="https://wa.me/27696219479?text=${encodedWaText}" rel="noopener" target="_blank">WhatsApp</a>
          <a class="btn btn-primary" href="../contact/">Get Quote</a>
          <button aria-controls="mobileNav" aria-expanded="false" aria-label="Open navigation menu" class="hamburger" id="hamburger" type="button">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Mobile Navigation Drawer -->
  <div class="mobile-nav" id="mobileNav">
    <a class="mobile-nav-link" href="../">Home</a>
    <button class="mobile-nav-link mobile-services-toggle" type="button">
      Our Capabilities
      <svg fill="none" height="16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="16"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </button>
    <div class="mobile-services-list">
      <a href="../web-design/">Website Design</a>
      <a href="../mobile-apps/">Mobile Apps</a>
      <a href="../seo-marketing/">SEO &amp; Google Ads</a>
      <a href="../vehicle-branding/">Vehicle Branding</a>
      <a href="../dstv-installations/">DSTV Installations</a>
      <a href="../graphic-design/">Graphic Design</a>
      <a href="../services/" style="font-weight: 700; color: var(--accent-red); margin-top: 5px;">All Services &rarr;</a>
    </div>
    <a class="mobile-nav-link" href="../portfolio/">Portfolio</a>
    <a class="mobile-nav-link" href="../about/">About</a>
    <a class="mobile-nav-link active" href="../areas/">Areas</a>
    <a class="mobile-nav-link" href="../blog/">Blog</a>
    <a class="mobile-nav-link" href="../contact/">Contact</a>
    <a class="btn btn-whatsapp btn-lg" href="https://wa.me/27696219479?text=${encodedWaText}" rel="noopener" target="_blank" style="margin-top: 1rem;">
      WhatsApp Hotline
    </a>
  </div>

  <main id="main-content">
    <!-- ==================== HERO SECTION ==================== -->
    <section class="section section-dark" style="padding: 100px 0 80px; position: relative; overflow: hidden; background: linear-gradient(135deg, #09090B 0%, #121215 100%); border-bottom: var(--border-dark-thick);">
      <div class="container">
        <div style="max-width: 920px; margin: 0 auto; text-align: center;">
          <div class="editorial-badge accent reveal">
            ${data.serviceBadge} &bull; ${data.locality}
          </div>
          <h1 class="reveal reveal-delay-1" style="font-family: var(--font-display); font-size: clamp(1.85rem, 5vw, 4.0rem); font-weight: 900; line-height: 1.12; color: #fff; margin-bottom: 1.5rem; letter-spacing: -0.03em; overflow-wrap: break-word; word-break: break-word; hyphens: auto;">
            ${data.h1_prefix} <span class="gradient-text">${data.h1_highlight}</span>
          </h1>
          <p class="reveal reveal-delay-2" style="font-size: clamp(1.05rem, 2vw, 1.25rem); color: var(--dark-300); line-height: 1.6; max-width: 780px; margin: 0 auto 2.5rem;">
            ${data.hero_desc}
          </p>
          <div class="reveal reveal-delay-3" style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <a class="btn btn-accent btn-lg" href="../contact/">Get Free Consultation &rarr;</a>
            <a class="btn btn-whatsapp btn-lg" href="https://wa.me/27696219479?text=${encodedWaText}" rel="noopener" target="_blank">Instant WhatsApp Quote</a>
          </div>
          
          <!-- Key Stats Grid -->
          <div class="reveal reveal-delay-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--dark-800);">
            <div class="card-tactile" style="background: var(--dark-900); border: 1px solid var(--dark-700); padding: 1.25rem;">
              <div style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; color: var(--accent-red);">${data.stats[0].val}</div>
              <div style="color: var(--dark-400); font-size: 0.78rem; text-transform: uppercase; font-family: var(--font-mono); font-weight: 700;">${data.stats[0].label}</div>
            </div>
            <div class="card-tactile" style="background: var(--dark-900); border: 1px solid var(--dark-700); padding: 1.25rem;">
              <div style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; color: #fff;">${data.stats[1].val}</div>
              <div style="color: var(--dark-400); font-size: 0.78rem; text-transform: uppercase; font-family: var(--font-mono); font-weight: 700;">${data.stats[1].label}</div>
            </div>
            <div class="card-tactile" style="background: var(--dark-900); border: 1px solid var(--dark-700); padding: 1.25rem;">
              <div style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; color: var(--accent-red);">${data.stats[2].val}</div>
              <div style="color: var(--dark-400); font-size: 0.78rem; text-transform: uppercase; font-family: var(--font-mono); font-weight: 700;">${data.stats[2].label}</div>
            </div>
            <div class="card-tactile" style="background: var(--dark-900); border: 1px solid var(--dark-700); padding: 1.25rem;">
              <div style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; color: #fff;">${data.stats[3].val}</div>
              <div style="color: var(--dark-400); font-size: 0.78rem; text-transform: uppercase; font-family: var(--font-mono); font-weight: 700;">${data.stats[3].label}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== LOCAL MARKET CONTEXT ==================== -->
    <section class="section" style="padding: 90px 0; background: var(--bg-primary); border-bottom: var(--border-dark-thick);">
      <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 4rem; align-items: center;">
          <div class="reveal">
            <span class="section-label">Local Market Dynamics</span>
            <h2 style="font-family: var(--font-display); font-size: clamp(1.8rem, 3.5vw, 2.6rem); font-weight: 900; color: var(--dark-950); line-height: 1.15; margin-bottom: 1.5rem; letter-spacing: -0.02em;">
              ${data.section2_title}
            </h2>
            <p style="color: var(--dark-700); font-size: 1.05rem; line-height: 1.7; margin-bottom: 1.25rem;">
              ${data.section2_p1}
            </p>
            <p style="color: var(--dark-700); font-size: 1.05rem; line-height: 1.7; margin-bottom: 2rem;">
              ${data.section2_p2}
            </p>
            <div style="background: var(--bg-secondary); border-left: 4px solid var(--accent-red); padding: 1.25rem 1.5rem; border-top: 1px solid var(--dark-200); border-right: 1px solid var(--dark-200); border-bottom: 1px solid var(--dark-200);">
              <p style="color: var(--dark-950); font-size: 0.95rem; line-height: 1.6; margin: 0; font-weight: 600;">
                <strong style="color: var(--accent-red);">Target Industry Node:</strong> ${data.commercialFocus}
              </p>
            </div>
          </div>
          <div class="reveal reveal-delay-1" style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
            ${featuresHtml}
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== PACKAGES & PRICING ==================== -->
    <section class="section section-dark" style="padding: 90px 0; background: var(--dark-950); border-bottom: var(--border-dark-thick);">
      <div class="container">
        <div class="section-header center reveal">
          <span class="section-label">Transparent Rates</span>
          <h2 class="section-title" style="color: #fff;">
            ${data.serviceName} Packages in ${data.locality}
          </h2>
          <p class="section-subtitle" style="color: var(--dark-400);">Engineered to deliver high commercial return and long-term scalability.</p>
        </div>
        ${pricingHtml}
      </div>
    </section>

    <!-- ==================== LOCAL MAP & COVERAGE ==================== -->
    <section class="section" style="padding: 90px 0; background: var(--bg-secondary); border-bottom: var(--border-dark-thick);">
      <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 3rem; align-items: center;">
          <div class="reveal" style="border: var(--border-dark-thick); box-shadow: var(--shadow-brutal); overflow: hidden; background: #000;">
            <iframe src="${data.mapSrc}" width="100%" height="420" style="border:0; display: block;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map of ${data.locality}"></iframe>
          </div>
          <div class="reveal reveal-delay-1">
            <span class="section-label">Regional Coverage Area</span>
            <h2 style="font-family: var(--font-display); font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 900; color: var(--dark-950); line-height: 1.2; margin-bottom: 1.25rem;">
              Serving ${data.locality} &amp; Surrounding Nodes
            </h2>
            <p style="color: var(--dark-700); font-size: 1.05rem; line-height: 1.6; margin-bottom: 1.5rem;">
              Our specialized digital engineering and on-site branding units operate across ${data.locality} and adjacent commercial corridors:
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 2rem;">
              ${data.suburbs.map(s => `
                <span class="card-tactile" style="background: var(--white); border: 2px solid var(--dark-950); color: var(--dark-950); padding: 6px 14px; font-size: 0.85rem; font-family: var(--font-mono); font-weight: 700; box-shadow: 2px 2px 0px var(--dark-950); display: inline-block;">${s}</span>
              `).join('')}
            </div>
            <p style="color: var(--dark-600); font-size: 0.9rem; line-height: 1.6;">
              <strong>Key Transport Corridors:</strong> ${data.arterials}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== INTERNAL LINK SILO SECTION ==================== -->
    <section class="section" style="padding: 70px 0; background: var(--bg-primary); border-bottom: var(--border-dark-thick);">
      <div class="container">
        <div class="reveal" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;">
          <div>
            <span class="section-label">Knowledge &amp; Proof</span>
            <h3 style="font-family: var(--font-display); font-size: clamp(1.4rem, 2.5vw, 1.8rem); font-weight: 900; color: var(--dark-950); margin: 0;">
              Related Engineering Guides &amp; Case Studies
            </h3>
          </div>
          <a href="../blog/" class="btn btn-outline">Explore All Articles &rarr;</a>
        </div>
        <div class="reveal reveal-delay-1">
          ${siloLinksHtml}
        </div>
      </div>
    </section>

    <!-- ==================== FAQ ACCORDION ==================== -->
    <section class="section" style="padding: 90px 0; background: var(--bg-secondary); border-bottom: var(--border-dark-thick);">
      <div class="container" style="max-width: 860px;">
        <div class="section-header center reveal">
          <span class="section-label">Common Questions</span>
          <h2 class="section-title">
            ${data.serviceName} in ${data.locality}: FAQ
          </h2>
        </div>
        <div class="faq-accordion reveal reveal-delay-1" style="display: flex; flex-direction: column; gap: 1rem;">
          ${data.faq.map((item, idx) => `
            <div class="faq-item card-tactile" style="border: var(--border-dark-thick); box-shadow: var(--shadow-brutal-sm); background: var(--white);">
              <button class="faq-question" type="button" style="width: 100%; text-align: left; padding: 1.5rem; font-family: var(--font-display); font-size: 1.15rem; font-weight: 800; color: var(--dark-950); display: flex; justify-content: space-between; align-items: center; background: transparent; border: none; cursor: pointer;">
                <span>${item.q}</span>
                <svg style="width: 18px; height: 18px; color: var(--accent-red); transition: transform 0.25s ease;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
              </button>
              <div class="faq-answer" style="padding: 0 1.5rem 1.5rem;">
                <p style="color: var(--dark-700); font-size: 0.98rem; line-height: 1.65; margin: 0;">
                  ${item.a}
                </p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- ==================== FINAL CTA BANNER ==================== -->
    <section class="section section-dark" style="padding: 100px 0; background: var(--dark-950); text-align: center;">
      <div class="container reveal" style="max-width: 800px;">
        <div class="editorial-badge accent" style="margin-bottom: 1.5rem;">Direct Studio Consultation</div>
        <h2 style="font-family: var(--font-display); font-size: clamp(2.2rem, 4.5vw, 3.4rem); font-weight: 900; color: #fff; line-height: 1.1; margin-bottom: 1.25rem; letter-spacing: -0.02em;">
          Ready to Elevate Your Business in ${data.locality}?
        </h2>
        <p style="color: var(--dark-300); font-size: 1.15rem; line-height: 1.6; margin-bottom: 2.5rem;">
          Speak directly with our senior engineers and vehicle branding leads. Get an itemized quote within 24 hours.
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <a class="btn btn-accent btn-lg" href="../contact/">Request Written Proposal &rarr;</a>
          <a class="btn btn-whatsapp btn-lg" href="https://wa.me/27696219479?text=${encodedWaText}" rel="noopener" target="_blank">Chat on WhatsApp</a>
        </div>
      </div>
    </section>
  </main>

  <!-- ==================== FOOTER ==================== -->
  <footer class="site-footer" style="background: var(--dark-950); border-top: var(--border-dark-thick); color: var(--white); padding: 70px 0 30px;">
    <div class="container">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 3rem; margin-bottom: 4rem;">
        <div>
          <a aria-label="Toran Digital Home" class="logo" href="../" style="display: inline-flex; align-items: center; gap: 10px; margin-bottom: 1.25rem;">
            <img alt="Toran Digital Logo" height="38" src="../logo/toran_logo.webp" width="38" decoding="async"/>
            <span class="logo-text" style="color: #fff; font-family: var(--font-display); font-weight: 900; font-size: 1.2rem;">TORAN <span style="color: var(--accent-red);">DIGITAL</span></span>
          </a>
          <p style="color: var(--dark-400); font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem;">
            Gauteng's premier technical studio engineering high-performance web applications, commercial fleet branding, mobile apps, and enterprise SEO.
          </p>
          <div style="color: var(--dark-400); font-size: 0.85rem; font-family: var(--font-mono);">
            HQ: 14 Jordaan St, Benoni, Gauteng
          </div>
        </div>
        <div>
          <h4 style="color: #fff; font-family: var(--font-display); font-size: 1rem; margin-bottom: 1.25rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Capabilities</h4>
          <ul style="list-style: none; padding: 0; margin: 0; line-height: 2;">
            <li><a href="../web-design/" style="color: var(--dark-400); text-decoration: none;">Web Design &amp; E-Commerce</a></li>
            <li><a href="../vehicle-branding/" style="color: var(--dark-400); text-decoration: none;">Vehicle Branding &amp; Wraps</a></li>
            <li><a href="../mobile-apps/" style="color: var(--dark-400); text-decoration: none;">Mobile App Development</a></li>
            <li><a href="../seo-marketing/" style="color: var(--dark-400); text-decoration: none;">SEO &amp; Growth Marketing</a></li>
            <li><a href="../graphic-design/" style="color: var(--dark-400); text-decoration: none;">Corporate Identity &amp; Signage</a></li>
            <li><a href="../dstv-installations/" style="color: var(--dark-400); text-decoration: none;">DSTV &amp; CCTV Security</a></li>
          </ul>
        </div>
        <div>
          <h4 style="color: #fff; font-family: var(--font-display); font-size: 1rem; margin-bottom: 1.25rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Coverage Hubs</h4>
          <ul style="list-style: none; padding: 0; margin: 0; line-height: 2;">
            <li><a href="../web-design-sandton/" style="color: var(--dark-400); text-decoration: none;">Sandton &amp; JHB North</a></li>
            <li><a href="../web-design-pretoria/" style="color: var(--dark-400); text-decoration: none;">Pretoria &amp; Centurion</a></li>
            <li><a href="../web-design-benoni/" style="color: var(--dark-400); text-decoration: none;">Benoni &amp; East Rand</a></li>
            <li><a href="../areas/" style="color: var(--accent-red); text-decoration: none; font-weight: 700;">All 120+ Gauteng Areas &rarr;</a></li>
          </ul>
        </div>
        <div>
          <h4 style="color: #fff; font-family: var(--font-display); font-size: 1rem; margin-bottom: 1.25rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Direct Studio</h4>
          <p style="color: var(--dark-400); font-size: 0.9rem; margin-bottom: 0.75rem;">
            Phone: <a href="tel:+27696219479" style="color: #fff; text-decoration: none; font-weight: 700;">+27 69 621 9479</a>
          </p>
          <p style="color: var(--dark-400); font-size: 0.9rem; margin-bottom: 0.75rem;">
            Email: <a href="mailto:sales@torandigital.co.za" style="color: #fff; text-decoration: none;">sales@torandigital.co.za</a>
          </p>
          <p style="color: var(--dark-400); font-size: 0.9rem; margin-bottom: 1.25rem;">
            WhatsApp: <a href="https://wa.me/27696219479" style="color: #25D366; text-decoration: none; font-weight: 700;" target="_blank" rel="noopener">+27 69 621 9479</a>
          </p>
          <div style="font-size: 0.8rem; color: var(--dark-500); font-family: var(--font-mono);">Mon - Fri: 08:00 - 18:00<br/>Sat: 09:00 - 14:00</div>
        </div>
      </div>
      <div style="border-top: 1px solid var(--dark-800); padding-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; color: var(--dark-500); font-size: 0.85rem;">
        <div>&copy; 2026 Toran Digital (Pty) Ltd. All rights reserved.</div>
        <div style="display: flex; gap: 1.5rem;">
          <a href="../privacy-policy/" style="color: var(--dark-500); text-decoration: none;">Privacy Policy</a>
          <a href="../terms/" style="color: var(--dark-500); text-decoration: none;">Terms of Service</a>
          <a href="../sitemap.xml" style="color: var(--dark-500); text-decoration: none;">Sitemap</a>
        </div>
      </div>
    </div>
  </footer>

  <script src="../index.js" defer></script>
</body>
</html>`;
}

// Generate all pages
let count = 0;
allAreas.forEach(area => {
  const dirPath = path.join(ROOT_DIR, area.folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  const filePath = path.join(dirPath, 'index.html');
  const html = generatePageHtml(area);
  fs.writeFileSync(filePath, html, 'utf8');
  count++;
});

console.log(`Successfully regenerated ${count} area pages with animation classes and internal link silos!`);
