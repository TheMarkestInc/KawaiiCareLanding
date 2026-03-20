/**
 * Kawaii Care Landing — Main JS
 * Handles: mobile nav, scroll animations, nav scroll state
 */

(function () {
  'use strict';

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
