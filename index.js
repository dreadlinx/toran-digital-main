/**
 * Toran Digital — Core JavaScript Engine
 * Handles: JHB Studio Clock, Before/After Slider, Live Project Estimator with WhatsApp Dispatch,
 * Portfolio Filters, FAQ Accordions, Mega Dropdown, Mobile Drawer Nav, and Active Page Link Resolver.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. Live Johannesburg Studio Clock (GMT+2)
  function initJhbClock() {
    const clockEl = document.getElementById('jhbClock');
    if (!clockEl) return;

    function updateTime() {
      const now = new Date();
      const options = {
        timeZone: 'Africa/Johannesburg',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const timeStr = new Intl.DateTimeFormat('en-GB', options).format(now);
      clockEl.textContent = `JHB GMT+2 — ${timeStr}`;
    }

    updateTime();
    setInterval(updateTime, 1000);
  }
  initJhbClock();

  // 2. Header Scroll Elevation
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // 3. Mega-Dropdown Tab Switcher
  const megaItems = document.querySelectorAll('.mega-item');
  const megaPanels = document.querySelectorAll('.mega-sub-panel');

  megaItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      const targetId = item.getAttribute('data-target');
      if (!targetId) return;

      megaItems.forEach((btn) => btn.classList.remove('active'));
      megaPanels.forEach((panel) => panel.classList.remove('active'));

      item.classList.add('active');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // 4. Interactive Before/After Transformation Slider
  function initBeforeAfterSlider() {
    const stage = document.getElementById('baStage');
    const afterLayer = document.getElementById('baAfterLayer');
    const handle = document.getElementById('baHandle');

    if (!stage || !afterLayer || !handle) return;

    let isDragging = false;

    function setPosition(xPos) {
      const rect = stage.getBoundingClientRect();
      let offsetX = xPos - rect.left;
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rect.width) offsetX = rect.width;

      const percentage = (offsetX / rect.width) * 100;
      afterLayer.style.width = `${percentage}%`;
      handle.style.left = `${percentage}%`;
    }

    stage.addEventListener('mousedown', (e) => {
      isDragging = true;
      setPosition(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      setPosition(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    stage.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches.length > 0) {
        setPosition(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length === 0) return;
      setPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }
  initBeforeAfterSlider();

  // 5. Interactive Cost Estimator & Live WhatsApp Dispatch (Homepage & Contact Page)
  function initEstimators() {
    // ── A. Homepage Linear Estimator Matrix ──
    const verticalButtons = document.querySelectorAll('#verticalChoices .chip-choice');
    const scaleButtons = document.querySelectorAll('#scaleChoices .chip-choice');
    const urgencyButtons = document.querySelectorAll('#urgencyChoices .chip-choice');

    const priceDisplay = document.getElementById('calcPriceDisplay');
    const timelineDisplay = document.getElementById('calcTimelineDisplay');
    const specDetails = document.getElementById('summarySpecDetails');
    const whatsappBtn = document.getElementById('whatsappDispatchBtn');

    if (priceDisplay && whatsappBtn) {
      let currentVertical = { val: 'Web Platform / E-Commerce', cost: 4500, days: 5 };
      let currentScale = { label: 'Starter / Single Unit', mult: 1.0 };
      let currentUrgency = { urgency: 'Standard Schedule', extra: 0 };

      function calculateHomepageTotal() {
        const baseCost = currentVertical.cost;
        const multiplier = currentScale.mult;
        const extraCost = currentUrgency.extra;

        const totalCost = Math.round((baseCost * multiplier) + extraCost);
        const formattedCost = new Intl.NumberFormat('en-ZA').format(totalCost);

        const calculatedDays = Math.max(1, Math.round(currentVertical.days * (currentScale.mult > 2 ? 1.8 : (currentScale.mult > 1 ? 1.4 : 1.0))));

        priceDisplay.textContent = `R ${formattedCost}`;
        if (timelineDisplay) {
          timelineDisplay.innerHTML = `&bull; Estimated Delivery: <strong>${calculatedDays} Business Days</strong> (${currentUrgency.urgency})`;
        }

        if (specDetails) {
          specDetails.innerHTML = `
            Vertical: <strong>${currentVertical.val}</strong><br>
            Scale: <strong>${currentScale.label}</strong><br>
            Timeline: <strong>~${calculatedDays} Business Days</strong> (${currentUrgency.urgency})
          `;
        }

        const msg = `Hi Toran Digital, I configured a project estimate on your website:%0A%0A` +
          `*Vertical:* ${encodeURIComponent(currentVertical.val)}%0A` +
          `*Scale:* ${encodeURIComponent(currentScale.label)}%0A` +
          `*Urgency:* ${encodeURIComponent(currentUrgency.urgency)}%0A` +
          `*Estimated Investment:* R ${formattedCost}%0A%0A` +
          `I would like to proceed with a formal quote.`;

        whatsappBtn.href = `https://wa.me/27696219479?text=${msg}`;
      }

      verticalButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          verticalButtons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          currentVertical = {
            val: btn.getAttribute('data-val') || 'Web Platform',
            cost: parseFloat(btn.getAttribute('data-cost')) || 4500,
            days: parseInt(btn.getAttribute('data-days'), 10) || 5
          };
          calculateHomepageTotal();
        });
      });

      scaleButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          scaleButtons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          currentScale = {
            label: btn.getAttribute('data-label') || 'Starter',
            mult: parseFloat(btn.getAttribute('data-mult')) || 1.0
          };
          calculateHomepageTotal();
        });
      });

      urgencyButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          urgencyButtons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          currentUrgency = {
            urgency: btn.getAttribute('data-urgency') || 'Standard Schedule',
            extra: parseFloat(btn.getAttribute('data-extra')) || 0
          };
          calculateHomepageTotal();
        });
      });

      calculateHomepageTotal();
    }

    // ── B. Contact Page Multi-Step Quote Calculator ──
    const calcOptionBtns = document.querySelectorAll('.calc-option-btn');
    const calcScopeSelect = document.getElementById('calc-scope-select');
    const calcAddonsContainer = document.getElementById('calc-addons-container');
    const calcTotalPrice = document.getElementById('calc-total-price');
    const calcWhatsappBtn = document.getElementById('calc-whatsapp-btn');

    if (calcOptionBtns.length && calcScopeSelect && calcAddonsContainer && calcTotalPrice && calcWhatsappBtn) {
      const calculatorData = {
        web: {
          name: 'Web Design & Apps',
          scopes: [
            { id: 'web-starter', name: 'Starter Business Website (1–5 Pages)', minPrice: 3500, maxPrice: 5000 },
            { id: 'web-ecommerce', name: 'Full E-Commerce Store (Shopify / PayFast)', minPrice: 8500, maxPrice: 14500 },
            { id: 'web-platform', name: 'Custom Next.js Web App / Client Portal', minPrice: 18000, maxPrice: 35000 },
            { id: 'web-redesign', name: 'Legacy Website Speed & SEO Redesign', minPrice: 4500, maxPrice: 7500 }
          ],
          addons: [
            { id: 'add-seo', name: 'Google Business Profile 3-Pack SEO Setup', price: 1500 },
            { id: 'add-copy', name: 'Professional Copywriting & Content Kit', price: 1200 },
            { id: 'add-speed', name: 'Sub-Second PageSpeed CDN Optimization', price: 1800 },
            { id: 'add-crm', name: 'WhatsApp & CRM Lead Funnel Integration', price: 1000 }
          ]
        },
        vehicle: {
          name: 'Vehicle Branding',
          scopes: [
            { id: 'veh-decals', name: 'Spot Graphics & Decals (Door / Tailgate)', minPrice: 2500, maxPrice: 4500 },
            { id: 'veh-partial', name: 'Half / Partial Vehicle Wrap (3M Vinyl)', minPrice: 6500, maxPrice: 9500 },
            { id: 'veh-full', name: 'Full Commercial Wrap (Bakkie / Van / Sedan)', minPrice: 12500, maxPrice: 18500 },
            { id: 'veh-fleet', name: 'Commercial Logistics Fleet Livery (3+ Units)', minPrice: 24000, maxPrice: 55000 }
          ],
          addons: [
            { id: 'add-reflective', name: 'ECE104 Night Reflective Contours', price: 1800 },
            { id: 'add-anti-scratch', name: 'Heavy-Duty Anti-Scratch UV Overlaminate', price: 2200 },
            { id: 'add-roof', name: 'Roof Wrap / Extended Cab Coverage', price: 1900 },
            { id: 'add-onsite', name: 'On-Site Fleet Application at Your Depot', price: 1500 }
          ]
        },
        field: {
          name: 'DSTV & Security CCTV',
          scopes: [
            { id: 'dstv-single', name: 'DSTV Explora / HD Single Point Setup', minPrice: 1200, maxPrice: 2200 },
            { id: 'dstv-extra', name: 'Triple View / Multi-Room Cabling Setup', minPrice: 2800, maxPrice: 4800 },
            { id: 'cctv-4cam', name: '4-Camera 4K IP CCTV Security System', minPrice: 6500, maxPrice: 9500 },
            { id: 'cctv-8cam', name: '8-Camera Commercial Surveillance Grid', minPrice: 12500, maxPrice: 19500 }
          ],
          addons: [
            { id: 'add-mount', name: 'Flush Heavy-Duty TV Wall Bracket & Mount', price: 650 },
            { id: 'add-ups', name: 'Load Shedding Backup Battery for CCTV', price: 1800 },
            { id: 'add-cable', name: 'Concealed Conduit & Trunking Finish', price: 850 },
            { id: 'add-remote', name: 'Mobile App Live Camera Stream Setup', price: 500 }
          ]
        }
      };

      let activeCategory = 'web';

      function renderCalculatorOptions() {
        const catData = calculatorData[activeCategory];
        if (!catData) return;

        // Render Scopes Dropdown
        calcScopeSelect.innerHTML = catData.scopes.map((s, idx) => `
          <option value="${s.id}" data-min="${s.minPrice}" data-max="${s.maxPrice}" ${idx === 0 ? 'selected' : ''}>
            ${s.name} (R${new Intl.NumberFormat('en-ZA').format(s.minPrice)} – R${new Intl.NumberFormat('en-ZA').format(s.maxPrice)})
          </option>
        `).join('');

        // Render Addons Checkboxes
        calcAddonsContainer.innerHTML = catData.addons.map((addon) => `
          <label class="calc-addon-item">
            <input type="checkbox" class="calc-addon-check" value="${addon.id}" data-price="${addon.price}" data-name="${addon.name}">
            <div style="flex-grow: 1;">
              <div style="font-weight: 700; font-size: 0.92rem; color: var(--white);">${addon.name}</div>
              <div style="font-size: 0.8rem; color: var(--accent-red); font-family: var(--font-mono);">+ R${new Intl.NumberFormat('en-ZA').format(addon.price)}</div>
            </div>
          </label>
        `).join('');

        // Attach addon change listeners
        calcAddonsContainer.querySelectorAll('.calc-addon-check').forEach((chk) => {
          chk.addEventListener('change', updateContactCalculatorTotal);
        });

        updateContactCalculatorTotal();
      }

      function updateContactCalculatorTotal() {
        const catData = calculatorData[activeCategory];
        const selectedOption = calcScopeSelect.options[calcScopeSelect.selectedIndex];
        if (!selectedOption) return;

        const baseMin = parseFloat(selectedOption.getAttribute('data-min')) || 0;
        const baseMax = parseFloat(selectedOption.getAttribute('data-max')) || 0;
        const scopeText = selectedOption.text.split(' (')[0];

        let addonsTotal = 0;
        const selectedAddons = [];

        calcAddonsContainer.querySelectorAll('.calc-addon-check:checked').forEach((chk) => {
          const price = parseFloat(chk.getAttribute('data-price')) || 0;
          const name = chk.getAttribute('data-name') || '';
          addonsTotal += price;
          selectedAddons.push(name);
        });

        const totalMin = baseMin + addonsTotal;
        const totalMax = baseMax + addonsTotal;

        const formattedMin = new Intl.NumberFormat('en-ZA').format(totalMin);
        const formattedMax = new Intl.NumberFormat('en-ZA').format(totalMax);

        calcTotalPrice.textContent = `R${formattedMin} – R${formattedMax}`;

        // Build WhatsApp Dispatch URL
        let msg = `Hi Toran Digital, I calculated an estimate on your contact page:%0A%0A` +
          `*Service Category:* ${encodeURIComponent(catData.name)}%0A` +
          `*Package Scope:* ${encodeURIComponent(scopeText)}%0A`;

        if (selectedAddons.length > 0) {
          msg += `*Selected Extras:* ${encodeURIComponent(selectedAddons.join(', '))}%0A`;
        }

        msg += `*Estimated Range:* R${formattedMin} – R${formattedMax}%0A%0A` +
          `Please provide a confirmed quote and timeline for this project.`;

        calcWhatsappBtn.href = `https://wa.me/27696219479?text=${msg}`;
      }

      calcOptionBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          calcOptionBtns.forEach((b) => {
            b.classList.remove('active');
            b.style.borderColor = '#27272a';
            b.style.background = '#27272a';
            const icon = b.querySelector('.calc-icon');
            if (icon) icon.style.color = '#a1a1aa';
          });

          btn.classList.add('active');
          btn.style.borderColor = 'var(--accent-red)';
          btn.style.background = 'rgba(255, 51, 0, 0.12)';
          const activeIcon = btn.querySelector('.calc-icon');
          if (activeIcon) activeIcon.style.color = 'var(--accent-red)';

          activeCategory = btn.getAttribute('data-category') || 'web';
          renderCalculatorOptions();
        });
      });

      calcScopeSelect.addEventListener('change', updateContactCalculatorTotal);

      // Initial Render
      renderCalculatorOptions();
    }
  }
  initEstimators();

  // 6. Scroll-Triggered Reveal Animations (IntersectionObserver)
  function initScrollReveals() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      });

      revealElements.forEach((el) => observer.observe(el));
    } else {
      // Fallback if IntersectionObserver not supported
      revealElements.forEach((el) => el.classList.add('reveal-visible'));
    }
  }
  initScrollReveals();

  // 7. Stat Rollup Number Counter Animations
  function initStatCounters() {
    const counters = document.querySelectorAll('.stat-counter, [data-count-target]');
    if (!counters.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const targetVal = parseFloat(el.getAttribute('data-count-target')) || parseFloat(el.textContent.replace(/[^0-9.]/g, ''));
            const prefix = el.getAttribute('data-prefix') || '';
            const suffix = el.getAttribute('data-suffix') || '';
            const decimals = parseInt(el.getAttribute('data-decimals'), 10) || 0;
            const duration = 1600;
            const startTime = performance.now();

            function updateCount(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out quad
              const easeOut = 1 - Math.pow(1 - progress, 3);
              const currentVal = (targetVal * easeOut).toFixed(decimals);
              el.textContent = `${prefix}${currentVal}${suffix}`;

              if (progress < 1) {
                requestAnimationFrame(updateCount);
              } else {
                el.textContent = `${prefix}${targetVal}${suffix}`;
              }
            }

            requestAnimationFrame(updateCount);
            obs.unobserve(el);
          }
        });
      }, { threshold: 0.2 });

      counters.forEach((c) => observer.observe(c));
    }
  }
  initStatCounters();


  // 6. Portfolio Category Filter Engine (Universal for Home & Portfolio Page)
  function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll('.portfolio-filter-bar .filter-btn');
    const projectItems = document.querySelectorAll('.project-item');

    if (!filterBtns.length || !projectItems.length) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => {
          b.classList.remove('active');
          b.classList.remove('btn-primary');
          if (!b.classList.contains('btn-outline')) b.classList.add('btn-outline');
        });
        btn.classList.add('active');
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-outline');

        const filter = btn.getAttribute('data-filter') || 'all';

        projectItems.forEach((item) => {
          const category = item.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }
  initPortfolioFilters();

  // 7. Tactical FAQ Accordion
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach((item) => {
      const questionBtn = item.querySelector('.faq-question');
      if (!questionBtn) return;

      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Close others
        faqItems.forEach((other) => {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }
  initFaqAccordion();

  // 8. Universal Mobile Navigation Toggle
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  function openMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.add('open');
    mobileNav.classList.add('active');
    if (hamburger) {
      hamburger.classList.add('open');
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    mobileNav.classList.remove('active');
    if (hamburger) {
      hamburger.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }

  function toggleMobileNav(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!mobileNav) return;
    const isOpen = mobileNav.classList.contains('open') || mobileNav.classList.contains('active');
    if (isOpen) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMobileNav);
  }

  // Close mobile drawer when clicking any standard nav link
  if (mobileNav) {
    mobileNav.querySelectorAll('a:not(.mobile-services-toggle)').forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileNav();
      });
    });
  }

  // Mobile Services Sub-List Accordion
  const mobileServicesToggle = document.querySelector('.mobile-services-toggle');
  const mobileServicesList = document.querySelector('.mobile-services-list');
  if (mobileServicesToggle && mobileServicesList) {
    mobileServicesToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      mobileServicesList.classList.toggle('open');
      const chevron = mobileServicesToggle.querySelector('svg');
      if (chevron) {
        chevron.style.transform = mobileServicesList.classList.contains('open') ? 'rotate(180deg)' : 'none';
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav && (mobileNav.classList.contains('open') || mobileNav.classList.contains('active'))) {
      closeMobileNav();
    }
  });

  // Close when resizing to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && mobileNav && (mobileNav.classList.contains('open') || mobileNav.classList.contains('active'))) {
      closeMobileNav();
    }
  });

  // 9. Automatic Active Navigation Link Resolver
  function initActiveNavLinks() {
    const rawPath = window.location.pathname.toLowerCase().replace(/\/index\.html$/, '').replace(/\/$/, '');
    const currentPath = rawPath === '' ? '/' : rawPath;

    const navLinks = document.querySelectorAll('.nav-menu a, .mobile-nav a');

    navLinks.forEach((link) => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return;

      try {
        const linkUrl = new URL(link.href, window.location.href);
        const linkPath = linkUrl.pathname.toLowerCase().replace(/\/index\.html$/, '').replace(/\/$/, '') || '/';

        if ((currentPath === '/' || currentPath.endsWith('toran-digital')) && (linkPath === '/' || href === '/' || href === './' || href === '../' || href === '../../')) {
          link.classList.add('active');
        } else if (currentPath !== '/' && linkPath !== '/' && currentPath === linkPath) {
          link.classList.add('active');
        } else if (currentPath !== '/' && linkPath !== '/' && currentPath.endsWith(linkPath) && linkPath.length > 1) {
          link.classList.add('active');
        }
      } catch (e) {
        // ignore parse error
      }
    });

    // Check if on services subpage to highlight "Our Services" dropdown trigger
    if (
      currentPath.includes('/web-design') ||
      currentPath.includes('/mobile-apps') ||
      currentPath.includes('/seo-marketing') ||
      currentPath.includes('/vehicle-branding') ||
      currentPath.includes('/dstv-installations') ||
      currentPath.includes('/graphic-design') ||
      currentPath.includes('/services')
    ) {
      const servicesTrigger = document.querySelector('.nav-dropdown-trigger');
      if (servicesTrigger) servicesTrigger.classList.add('active');
    }
  }
  initActiveNavLinks();
});
