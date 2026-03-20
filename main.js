/**
 * Kawaii Care Landing — Main JS
 * Handles: mobile nav, scroll animations, nav scroll state
 */

(function () {
  'use strict';

  // ---- Liquid Glass: SVG filter injection + browser detection ----
  var liquidGlassSvg = '<svg width="100%" height="100%" viewBox="0 0 100% 100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<filter id="liquid-glass-filter">' +
      '<feImage xlink:href="data:image/svg+xml,%3Csvg width=\'100%\' height=\'100%\' viewBox=\'0 0 100% 100%\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect x=\'0\' y=\'0\' width=\'100%\' height=\'100%\' rx=\'32\' fill=\'rgb%280 0 0 %2F100 / 2.55}%25%29\' /%3E%3Crect x=\'0\' y=\'0\' width=\'100%\' height=\'100%\' rx=\'32\' fill=\'%23FFF\' style=\'filter:blur(10}px)\' /%3E%3C/svg%3E" x="0%" y="0%" width="100%" height="100%" result="first" id="first" />' +
      '<feImage xlink:href="data:image/svg+xml,%3Csvg width=\'100%\' height=\'100%\' viewBox=\'0 0 100% 100%\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect x=\'0\' y=\'0\' width=\'100%\' height=\'100%\' rx=\'32\' fill=\'rgb%28255 255 255 %2F0 / 2.55}%25%29\' style=\'filter:blur(0px)\' /%3E%3C/svg%3E" x="0%" y="0%" width="100%" height="100%" result="second" id="second" />' +
      '<feImage xlink:href="data:image/svg+xml,%3Csvg width=\'100%\' height=\'100%\' viewBox=\'0 0 100% 100%\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect x=\'0\' y=\'0\' width=\'100%\' height=\'100%\' rx=\'32\' fill=\'%23000\' /%3E%3C/svg%3E" x="0%" y="0%" width="100%" height="100%" result="third" id="third" />' +
      '<feImage xlink:href="data:image/svg+xml,%3Csvg width=\'100%\' height=\'100%\' viewBox=\'0 0 100% 100%\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3ClinearGradient id=\'gradient1\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'0%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%23000\'/%3E%3Cstop offset=\'100%25\' stop-color=\'%2300F\'/%3E%3C/linearGradient%3E%3ClinearGradient id=\'gradient2\' x1=\'0%25\' y1=\'0%25\' x2=\'0%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%23000\'/%3E%3Cstop offset=\'100%25\' stop-color=\'%230F0\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x=\'0\' y=\'0\' width=\'100%\' height=\'100%\' rx=\'32\' fill=\'%237F7F7F\' /%3E%3Crect x=\'0\' y=\'0\' width=\'100%\' height=\'100%\' rx=\'32\' fill=\'%23000\' /%3E%3Crect x=\'0\' y=\'0\' width=\'100%\' height=\'100%\' rx=\'32\' fill=\'url(%23gradient1)\' style=\'mix-blend-mode: screen\' /%3E%3Crect x=\'0\' y=\'0\' width=\'100%\' height=\'100%\' rx=\'32\' fill=\'url(%23gradient2)\' style=\'mix-blend-mode: screen\' /%3E%3Crect x=\'0\' y=\'0\' width=\'100%\' height=\'100%\' rx=\'32\' fill=\'rgb%28127 127 127 %2F100%25%29\' style=\'filter:blur(40px)\' /%3E%3C/svg%3E" x="0%" y="0%" width="100%" height="100%" result="fourth" id="fourth" />' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />' +
      '<feGaussianBlur in="noise" stdDeviation="2" result="blurred" />' +
      '<feGaussianBlur stdDeviation="2.2" id="preblur" in="SourceGraphic" result="preblur" />' +
      '<feOffset dx="43" dy="43" in="preblur" result="preblurOffset" />' +
      '<feDisplacementMap in="preblurOffset" in2="blurred" scale="39" xChannelSelector="R" yChannelSelector="G" result="displaced" />' +
      '<feDisplacementMap id="dispR" in2="fourth" in="displaced" scale="-137" xChannelSelector="B" yChannelSelector="G" />' +
      '<feColorMatrix type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="disp1" />' +
      '<feDisplacementMap id="dispG" in2="fourth" in="displaced" scale="-150" xChannelSelector="B" yChannelSelector="G" />' +
      '<feColorMatrix type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="disp2" />' +
      '<feDisplacementMap id="dispB" in2="fourth" in="displaced" scale="-163" xChannelSelector="B" yChannelSelector="G" />' +
      '<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="disp3" />' +
      '<feBlend in2="disp2" mode="screen" />' +
      '<feBlend in2="disp1" mode="screen" />' +
      '<feGaussianBlur stdDeviation="0.9" id="postblur" />' +
      '<feBlend in2="second" mode="screen" />' +
      '<feBlend in2="first" mode="multiply" />' +
      '<feComposite in2="third" operator="in" />' +
    '</filter>' +
  '</svg>';

  var ua = navigator.userAgent.toLowerCase();
  var isChromium = ua.indexOf('chrome') !== -1 || ua.indexOf('edg') !== -1 || ua.indexOf('opr') !== -1 || ua.indexOf('opera') !== -1;

  var glassElements = document.querySelectorAll('.liquid-glass');
  glassElements.forEach(function (el) {
    if (isChromium) {
      el.insertAdjacentHTML('beforeend', liquidGlassSvg);
    } else {
      el.classList.remove('liquid-glass');
      el.classList.add('liquid-glass-fallback');
    }
  });

  // ---- Mobile Navigation ----
  const navToggle = document.getElementById('navToggle');
  const navDrawer = document.getElementById('navDrawer');
  const drawerLinks = navDrawer.querySelectorAll('.nav__drawer-link');

  function openDrawer() {
    navToggle.setAttribute('aria-expanded', 'true');
    navDrawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-open');
  }

  function closeDrawer() {
    navToggle.setAttribute('aria-expanded', 'false');
    navDrawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
  }

  navToggle.addEventListener('click', function () {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  // Close drawer when clicking a link
  drawerLinks.forEach(function (link) {
    link.addEventListener('click', closeDrawer);
  });

  // Close drawer when clicking the overlay (body::after)
  document.addEventListener('click', function (e) {
    if (
      document.body.classList.contains('nav-open') &&
      !navDrawer.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      closeDrawer();
    }
  });

  // Close drawer on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
      closeDrawer();
      navToggle.focus();
    }
  });

  // ---- Scroll Animations (Intersection Observer) ----
  var animatedElements = document.querySelectorAll('.animate-in');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    animatedElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all elements immediately
    animatedElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // ---- Sticky Nav Background on Scroll ----
  var nav = document.getElementById('nav');
  var scrollThreshold = 50;

  function updateNav() {
    if (window.scrollY > scrollThreshold) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // ---- Smooth scroll for anchor links (fallback for older browsers) ----
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var navHeight = nav.offsetHeight;
        var targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ---- Floating Emojis Across the Site ----
  var emojiPool = [
    '✨', '💖', '⭐', '🌸', '💫', '🎀', '💕', '🌟',
    '🩷', '🌷', '🦋', '🍡', '🧸', '💗', '🎶', '☁️',
    '🫧', '🪷', '🍰', '🌈', '💜', '🌺', '🐾', '🧁'
  ];

  var floatAnims = ['float-drift', 'float-sway', 'float-spin', 'float-zigzag', 'float-gentle'];

  // Sections that receive floating emojis, with count per section
  var emojiSections = [
    { selector: '#problem',      count: 4 },
    { selector: '#shift',        count: 3 },
    { selector: '#product',      count: 5 },
    { selector: '#founder',      count: 3 },
    { selector: '#how-it-works', count: 4 },
    { selector: '#before-after', count: 3 },
    { selector: '#urgency',      count: 3 },
    { selector: '#emotions',     count: 5 },
    { selector: '#gamification', count: 4 },
    { selector: '#social-proof', count: 3 },
    { selector: '#pricing',      count: 4 },
    { selector: '#faq',          count: 3 },
    { selector: '#final-cta',    count: 3 }
  ];

  // Respect reduced-motion preference
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    emojiSections.forEach(function (cfg) {
      var section = document.querySelector(cfg.selector);
      if (!section) return;

      for (var i = 0; i < cfg.count; i++) {
        var span = document.createElement('span');
        span.className = 'floating-emoji';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = emojiPool[Math.floor(Math.random() * emojiPool.length)];

        // Randomized placement and animation
        var top = (10 + Math.random() * 75).toFixed(1);
        var left = (3 + Math.random() * 90).toFixed(1);
        var size = (0.9 + Math.random() * 1.1).toFixed(2);
        var duration = (5 + Math.random() * 8).toFixed(1);
        var delay = (Math.random() * 6).toFixed(1);
        var opacity = (0.2 + Math.random() * 0.25).toFixed(2);
        var anim = floatAnims[Math.floor(Math.random() * floatAnims.length)];

        span.style.setProperty('--emoji-size', size + 'rem');
        span.style.setProperty('--emoji-duration', duration + 's');
        span.style.setProperty('--emoji-delay', delay + 's');
        span.style.setProperty('--emoji-opacity', opacity);
        span.style.setProperty('--emoji-anim', anim);
        span.style.top = top + '%';
        span.style.left = left + '%';

        section.appendChild(span);
      }
    });
  }
})();
