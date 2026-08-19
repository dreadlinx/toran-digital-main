const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const { all500Locations } = require('./data_500_locations.js');

console.log(`Building Areas Directory with ${all500Locations.length} locations and interactive real-time search engine...`);

// Group counts by service
const serviceCounts = {
  all: all500Locations.length,
  'web-design': all500Locations.filter(l => l.serviceId === 'web-design').length,
  'vehicle-branding': all500Locations.filter(l => l.serviceId === 'vehicle-branding').length,
  'mobile-apps': all500Locations.filter(l => l.serviceId === 'mobile-apps').length,
  'dstv-installation': all500Locations.filter(l => l.serviceId === 'dstv-installation').length,
  'seo-marketing': all500Locations.filter(l => l.serviceId === 'seo-marketing').length,
  'graphic-design': all500Locations.filter(l => l.serviceId === 'graphic-design').length,
};

// Unique regions
const regionsList = ['All Regions', 'Johannesburg North', 'Johannesburg Central', 'East Rand', 'Pretoria & Centurion', 'West Rand', 'JHB South & Vaal', 'Midrand & Corridor', 'National Metros'];

const areasHtml = `<!DOCTYPE html>
<html lang="en-ZA">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  
  <!-- Primary SEO Meta Tags -->
  <title>Coverage Areas &amp; Regional Hubs (500+ Locations) | Toran Digital</title>
  <meta name="description" content="Explore Toran Digital's 500+ dedicated service locations across Gauteng and South Africa. Web design, vehicle wraps, mobile apps, DSTV, and SEO in Johannesburg, Pretoria, Sandton &amp; East Rand."/>
  <meta name="author" content="Toran Digital"/>
  <meta name="robots" content="index, follow"/>
  <link rel="canonical" href="https://torandigital.co.za/areas/"/>

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website"/>
  <meta property="og:url" content="https://torandigital.co.za/areas/"/>
  <meta property="og:title" content="Coverage Areas &amp; Regional Hubs (500+ Locations) | Toran Digital"/>
  <meta property="og:description" content="Explore Toran Digital's 500+ service locations across Johannesburg, Pretoria, Sandton, East Rand, and South Africa."/>
  <meta property="og:image" content="https://torandigital.co.za/logo/toran_logo.webp"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:image:type" content="image/webp"/>

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="Regional Hubs &amp; Coverage Directory | Toran Digital"/>
  <meta name="twitter:description" content="Search across 500+ localized hubs for web design, vehicle branding, mobile apps, and technical field installations."/>
  <meta name="twitter:image" content="https://torandigital.co.za/logo/toran_logo.webp"/>

  <!-- Favicons -->
  <link href="../logo/toran_logo.webp" rel="icon" type="image/webp"/>
  <link href="../logo/toran_logo.webp" rel="apple-touch-icon"/>

  <!-- Typography & CSS -->
  <link href="https://fonts.googleapis.com" rel="preconnect"/>
  <link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&family=Syne:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  <link href="../index.css" rel="stylesheet"/>

  <!-- Schema Markup -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://torandigital.co.za/areas/#webpage",
    "url": "https://torandigital.co.za/areas/",
    "name": "Toran Digital National & Regional Coverage Directory",
    "description": "Comprehensive regional coverage directory for Toran Digital across 500+ commercial locations in South Africa.",
    "publisher": {
      "@type": "Organization",
      "name": "Toran Digital",
      "url": "https://torandigital.co.za/",
      "logo": "https://torandigital.co.za/logo/toran_logo.webp"
    }
  }
  </script>
  <script type="application/ld+json">
  {
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
        "name": "Areas Directory",
        "item": "https://torandigital.co.za/areas/"
      }
    ]
  }
  </script>

  <style>
    /* Areas Hub Search & Filter Styles */
    .areas-search-wrapper {
      background: var(--white);
      border: 3px solid var(--dark-950);
      box-shadow: var(--shadow-brutal);
      padding: 2rem;
      margin: -40px auto 3rem;
      max-width: 1000px;
      position: relative;
      z-index: 10;
    }

    .search-input-group {
      display: flex;
      gap: 1rem;
      position: relative;
      margin-bottom: 1.5rem;
    }

    .search-input-field {
      flex: 1;
      font-family: var(--font-sans);
      font-size: 1.15rem;
      font-weight: 600;
      padding: 1rem 1.25rem 1rem 3.25rem;
      border: 2px solid var(--dark-950);
      background: var(--bg-secondary);
      color: var(--dark-950);
      outline: none;
      transition: all var(--transition);
    }

    .search-input-field:focus {
      background: var(--white);
      border-color: var(--accent-red);
      box-shadow: 0 0 0 3px rgba(255, 51, 0, 0.2);
    }

    .search-icon-box {
      position: absolute;
      left: 1.1rem;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: var(--dark-500);
    }

    .search-clear-btn {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: var(--dark-200);
      border: none;
      color: var(--dark-700);
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 10px;
      cursor: pointer;
      display: none;
    }

    .search-clear-btn:hover {
      background: var(--accent-red);
      color: var(--white);
    }

    .filter-pills-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    .filter-pill {
      font-family: var(--font-mono);
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 6px 14px;
      border: 2px solid var(--dark-950);
      background: var(--white);
      color: var(--dark-950);
      cursor: pointer;
      transition: all var(--transition);
    }

    .filter-pill:hover {
      background: var(--dark-100);
      transform: translateY(-2px);
    }

    .filter-pill.active {
      background: var(--dark-950);
      color: var(--white);
      border-color: var(--dark-950);
      box-shadow: 2px 2px 0px var(--accent-red);
    }

    .region-select-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .region-select {
      font-family: var(--font-sans);
      font-size: 0.9rem;
      font-weight: 700;
      padding: 8px 14px;
      border: 2px solid var(--dark-950);
      background: var(--white);
      color: var(--dark-950);
      cursor: pointer;
      outline: none;
    }

    .results-counter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 2px solid var(--dark-950);
      margin-bottom: 2.5rem;
    }

    .results-count-text {
      font-family: var(--font-mono);
      font-size: 0.88rem;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--dark-950);
    }

    .results-count-number {
      color: var(--accent-red);
      font-size: 1.1rem;
    }

    .area-card-link {
      background: var(--white);
      border: 2px solid var(--dark-950);
      padding: 1.5rem;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-brutal-sm);
      transition: transform var(--transition), box-shadow var(--transition);
      position: relative;
    }

    .area-card-link:hover {
      transform: translate(-4px, -4px);
      box-shadow: var(--shadow-brutal);
      border-color: var(--accent-red);
    }

    .area-card-badge {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 3px 8px;
      border: 1px solid var(--dark-950);
      display: inline-block;
      align-self: flex-start;
      margin-bottom: 0.75rem;
      background: var(--bg-secondary);
    }

    .area-card-badge.web-design { color: var(--accent-red); }
    .area-card-badge.vehicle-branding { color: var(--accent-blue); }
    .area-card-badge.mobile-apps { color: #0284c7; }
    .area-card-badge.dstv-installation { color: #059669; }
    .area-card-badge.seo-marketing { color: #d97706; }
    .area-card-badge.graphic-design { color: #7c3aed; }

    .area-card-title {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--dark-950);
      margin: 0 0 0.5rem;
      line-height: 1.2;
    }

    .area-card-region {
      font-size: 0.8rem;
      color: var(--dark-500);
      font-family: var(--font-mono);
      margin-bottom: 0.75rem;
    }

    .area-card-desc {
      font-size: 0.85rem;
      color: var(--dark-700);
      line-height: 1.5;
      margin-bottom: 1rem;
      flex-grow: 1;
    }

    .area-card-cta {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--accent-blue);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .area-card-link:hover .area-card-cta {
      color: var(--accent-red);
    }

    .no-results-box {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      background: var(--white);
      border: 2px dashed var(--dark-400);
      display: none;
    }

    @media (max-width: 768px) {
      .areas-search-wrapper { padding: 1.25rem; margin-top: -20px; }
      .search-input-field { font-size: 0.95rem; padding-left: 2.75rem; }
      .filter-pills-row { gap: 0.35rem; }
      .filter-pill { font-size: 0.7rem; padding: 5px 10px; }
    }
  </style>
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
            ACTIVE NATIONAL &amp; REGIONAL DISPATCH: 500+ LOCATIONS
          </span>
          <span class="jhb-clock" id="jhbClock">JHB GMT+2 — 08:00:00</span>
        </div>
        <div class="utility-right">
          <span>14 Jordaan St, Benoni</span>
          <a class="utility-link" href="tel:+27696219479">CALL: +27 69 621 9479</a>
          <a class="utility-link" href="https://wa.me/27696219479?text=Hi%20Toran%20Digital%2C%20I%27d%20like%20a%20free%20quote" rel="noopener" target="_blank">WHATSAPP DISPATCH &rarr;</a>
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
          <a class="btn btn-whatsapp" href="https://wa.me/27696219479?text=Hi%20Toran%20Digital%2C%20I%27d%20like%20a%20free%20quote" rel="noopener" target="_blank">WhatsApp</a>
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
    <a class="btn btn-whatsapp btn-lg" href="https://wa.me/27696219479?text=Hi%20Toran%20Digital%2C%20I%27d%20like%20a%20free%20quote" rel="noopener" target="_blank" style="margin-top: 1rem;">
      WhatsApp Hotline
    </a>
  </div>

  <main id="main-content">
    <!-- ==================== HERO SECTION ==================== -->
    <section class="section section-dark" style="padding: 120px 0 80px; text-align: center; background: linear-gradient(135deg, #09090B 0%, #121215 100%); border-bottom: var(--border-dark-thick);">
      <div class="container">
        <div style="max-width: 900px; margin: 0 auto;">
          <div class="editorial-badge accent reveal">National Geographic Directory</div>
          <h1 class="reveal reveal-delay-1" style="font-family: var(--font-display); font-size: clamp(2rem, 5.5vw, 4.2rem); font-weight: 900; line-height: 1.1; color: #fff; margin-bottom: 1.5rem; letter-spacing: -0.03em;">
            500+ Dedicated <span class="gradient-text">Regional Hubs</span>
          </h1>
          <p class="reveal reveal-delay-2" style="font-size: clamp(1.05rem, 2vw, 1.25rem); color: var(--dark-300); line-height: 1.6; max-width: 750px; margin: 0 auto;">
            Direct technical dispatch, enterprise web engineering, commercial fleet wrapping, and accredited installations across all commercial nodes in Gauteng and South Africa.
          </p>
        </div>
      </div>
    </section>

    <!-- ==================== SEARCH & DIRECTORY SECTION ==================== -->
    <section class="section" style="background: var(--bg-primary); padding-top: 0;">
      <div class="container">
        
        <!-- Interactive Search Wrapper -->
        <div class="areas-search-wrapper">
          <div class="search-input-group">
            <svg class="search-icon-box" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="areaSearchInput" class="search-input-field" placeholder="Search by suburb, city, or keyword (e.g. Sandton, Pomona, Centurion, Wraps, iOS)..." autocomplete="off" aria-label="Search locations"/>
            <button id="searchClearBtn" class="search-clear-btn" type="button" aria-label="Clear Search">CLEAR</button>
          </div>

          <!-- Service Discipline Filter Pills -->
          <div class="filter-pills-row">
            <span style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--dark-600); margin-right: 0.5rem;">Service:</span>
            <button class="filter-pill active" data-service="all">All Services (${serviceCounts.all})</button>
            <button class="filter-pill" data-service="web-design">Web Design (${serviceCounts['web-design']})</button>
            <button class="filter-pill" data-service="vehicle-branding">Vehicle Wraps (${serviceCounts['vehicle-branding']})</button>
            <button class="filter-pill" data-service="mobile-apps">Mobile Apps (${serviceCounts['mobile-apps']})</button>
            <button class="filter-pill" data-service="dstv-installation">DSTV &amp; CCTV (${serviceCounts['dstv-installation']})</button>
            <button class="filter-pill" data-service="seo-marketing">SEO &amp; Ads (${serviceCounts['seo-marketing']})</button>
            <button class="filter-pill" data-service="graphic-design">Brand &amp; Signs (${serviceCounts['graphic-design']})</button>
          </div>

          <!-- Region Filter Dropdown -->
          <div class="region-select-wrap">
            <span style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--dark-600);">Region:</span>
            <select id="regionSelect" class="region-select" aria-label="Filter by Region">
              ${regionsList.map(r => `<option value="${r}">${r}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Results Counter & Status Bar -->
        <div class="results-counter-bar">
          <div class="results-count-text">
            Showing <span class="results-count-number" id="matchCount">${all500Locations.length}</span> of ${all500Locations.length} Regional Locations
          </div>
          <div id="activeFilterBadge" style="display: none; font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700; color: var(--accent-red);">
            [Filtered View]
          </div>
        </div>

        <!-- 500 Location Cards Grid -->
        <div class="service-grid" id="locationsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
          ${all500Locations.map(loc => `
            <a href="../${loc.folder}/" class="area-card-link" data-service="${loc.serviceId}" data-region="${loc.region}" data-locality="${loc.locality.toLowerCase()}" data-search="${loc.locality.toLowerCase()} ${loc.region.toLowerCase()} ${loc.serviceName.toLowerCase()} ${loc.suburbs.join(' ').toLowerCase()} ${loc.arterials.toLowerCase()}">
              <div class="area-card-badge ${loc.serviceId}">${loc.serviceName}</div>
              <h3 class="area-card-title">${loc.locality}</h3>
              <div class="area-card-region">${loc.region}</div>
              <p class="area-card-desc">${loc.hero_desc}</p>
              <div class="area-card-cta">
                View Local Hub &rarr;
              </div>
            </a>
          `).join('')}

          <!-- Empty State -->
          <div id="noResultsState" class="no-results-box">
            <h3 style="font-family: var(--font-display); font-size: 1.5rem; color: var(--dark-950); margin-bottom: 0.5rem;">No matching locations found</h3>
            <p style="color: var(--dark-600); margin-bottom: 1.5rem;">We service all commercial corridors across Gauteng and South Africa even if your suburb is not explicitly listed.</p>
            <a href="https://wa.me/27696219479?text=Hi%20Toran%20Digital%2C%20do%20you%20service%20my%20area%3F" class="btn btn-whatsapp" target="_blank" rel="noopener">
              Inquire via WhatsApp Desk &rarr;
            </a>
          </div>
        </div>

      </div>
    </section>
  </main>

  <!-- ==================== FOOTER ==================== -->
  <footer class="site-footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <a class="logo" href="../">
            <img alt="Toran Digital Logo" height="36" src="../logo/toran_logo.webp" width="36" decoding="async"/>
            <span class="logo-text">TORAN <span>DIGITAL</span></span>
          </a>
          <p class="footer-tagline">
            Gauteng's premier multi-disciplinary studio: Custom Web Design, Mobile Applications, Commercial Fleet Wraps, and Technical Field Installations.
          </p>
          <div class="footer-contact-info">
            <p><strong>Physical Workshop &amp; Studio:</strong> 14 Jordaan St, Benoni, 1501</p>
            <p><strong>Direct Line:</strong> <a href="tel:+27696219479">+27 69 621 9479</a></p>
            <p><strong>Project Email:</strong> <a href="mailto:info@torandigital.co.za">info@torandigital.co.za</a></p>
          </div>
        </div>

        <div class="footer-col">
          <h3 class="footer-heading">Capabilities</h3>
          <ul class="footer-links">
            <li><a href="../web-design/">Web &amp; E-Commerce</a></li>
            <li><a href="../mobile-apps/">Mobile Applications</a></li>
            <li><a href="../seo-marketing/">SEO &amp; Growth Marketing</a></li>
            <li><a href="../vehicle-branding/">Vehicle Wraps &amp; Fleet</a></li>
            <li><a href="../dstv-installations/">DSTV &amp; CCTV Security</a></li>
            <li><a href="../graphic-design/">Brand Design &amp; Signs</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h3 class="footer-heading">Studio &amp; Hubs</h3>
          <ul class="footer-links">
            <li><a href="../about/">About Toran Digital</a></li>
            <li><a href="../portfolio/">Commercial Portfolio</a></li>
            <li><a href="../areas/">Regional Areas Directory</a></li>
            <li><a href="../blog/">Technical Engineering Blog</a></li>
            <li><a href="../contact/">Contact Dispatch</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h3 class="footer-heading">Dispatch Radius</h3>
          <p style="font-size: 0.85rem; color: var(--dark-400); line-height: 1.6; margin-bottom: 1rem;">
            Operating across Johannesburg, Pretoria, Sandton, East Rand, West Rand, Vaal Triangle, and key South African economic hubs.
          </p>
          <a class="btn btn-outline" href="../contact/" style="font-size: 0.78rem; padding: 6px 12px; color: var(--white); border-color: var(--dark-600);">
            Contact Regional Dispatch &rarr;
          </a>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} Toran Digital (Pty) Ltd. All Rights Reserved. Reg: 2024/718302/07.</p>
        <div class="footer-bottom-links">
          <a href="../privacy-policy/">Privacy Policy</a>
          <a href="../terms/">Terms of Service</a>
          <a href="../sitemap.xml">XML Sitemap</a>
        </div>
      </div>
    </div>
  </footer>

  <!-- Tactical Floating HUD -->
  <div class="tactical-hud">
    <a class="hud-btn whatsapp-float" href="https://wa.me/27696219479?text=Hi%20Toran%20Digital%2C%20I%27d%20like%20a%20quote" rel="noopener" target="_blank" aria-label="WhatsApp Dispatch">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      <span>WhatsApp</span>
    </a>
  </div>

  <!-- Real-Time Search & Filter Script -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const searchInput = document.getElementById('areaSearchInput');
      const clearBtn = document.getElementById('searchClearBtn');
      const filterPills = document.querySelectorAll('.filter-pill');
      const regionSelect = document.getElementById('regionSelect');
      const cards = document.querySelectorAll('.area-card-link');
      const matchCount = document.getElementById('matchCount');
      const noResultsState = document.getElementById('noResultsState');
      const activeFilterBadge = document.getElementById('activeFilterBadge');

      let currentService = 'all';
      let currentRegion = 'All Regions';
      let currentQuery = '';

      function filterLocations() {
        let visibleCount = 0;
        const q = currentQuery.trim().toLowerCase();

        cards.forEach(card => {
          const cardService = card.getAttribute('data-service');
          const cardRegion = card.getAttribute('data-region');
          const cardSearchData = card.getAttribute('data-search') || '';

          const matchesService = (currentService === 'all' || cardService === currentService);
          const matchesRegion = (currentRegion === 'All Regions' || cardRegion === currentRegion);
          const matchesQuery = (!q || cardSearchData.includes(q));

          if (matchesService && matchesRegion && matchesQuery) {
            card.style.display = 'flex';
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });

        matchCount.textContent = visibleCount;
        noResultsState.style.display = visibleCount === 0 ? 'block' : 'none';
        clearBtn.style.display = (q.length > 0) ? 'block' : 'none';

        if (currentService !== 'all' || currentRegion !== 'All Regions' || q.length > 0) {
          activeFilterBadge.style.display = 'block';
        } else {
          activeFilterBadge.style.display = 'none';
        }
      }

      // Live search input
      searchInput.addEventListener('input', function(e) {
        currentQuery = e.target.value;
        filterLocations();
      });

      // Clear button
      clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        currentQuery = '';
        searchInput.focus();
        filterLocations();
      });

      // Service filter pills
      filterPills.forEach(pill => {
        pill.addEventListener('click', function() {
          filterPills.forEach(p => p.classList.remove('active'));
          this.classList.add('active');
          currentService = this.getAttribute('data-service');
          filterLocations();
        });
      });

      // Region select
      regionSelect.addEventListener('change', function(e) {
        currentRegion = e.target.value;
        filterLocations();
      });

      // Check URL parameters for pre-filtering (e.g. ?service=web-design&q=sandton)
      const urlParams = new URLSearchParams(window.location.search);
      const paramQ = urlParams.get('q');
      const paramService = urlParams.get('service');
      const paramRegion = urlParams.get('region');

      if (paramQ) {
        searchInput.value = paramQ;
        currentQuery = paramQ;
      }
      if (paramService) {
        const matchingPill = document.querySelector('.filter-pill[data-service="' + paramService + '"]');
        if (matchingPill) {
          filterPills.forEach(p => p.classList.remove('active'));
          matchingPill.classList.add('active');
          currentService = paramService;
        }
      }
      if (paramRegion && regionsList.includes(paramRegion)) {
        regionSelect.value = paramRegion;
        currentRegion = paramRegion;
      }

      if (paramQ || paramService || paramRegion) {
        filterLocations();
      }
    });
  </script>
  <script src="../index.js" defer></script>
</body>
</html>`;

fs.writeFileSync(path.join(ROOT_DIR, 'areas', 'index.html'), areasHtml, 'utf8');
console.log(`Successfully generated areas/index.html with real-time interactive search and ${all500Locations.length} locations!`);
