/**
 * Kawaii Care Landing — Main JS
 * Handles: mobile nav, scroll animations, nav scroll state
 */

(function () {
  'use strict';

  // ---- Hero Rotating Word ----
  var rotatingEl = document.getElementById('rotatingWord');
  if (rotatingEl) {
    var words = ['life', 'routine', 'habits', 'burnout', 'self-care', 'energy', 'sleep', 'wellness', 'balance', 'focus', 'stability', 'rhythm'];
    var wordIndex = 0;
    var firstDelay = 2000; // "life" stays 2s
    var wordDelay = 1000;  // rest 1s each

    function flipToNext() {
      rotatingEl.classList.add('flip-out');
      setTimeout(function () {
        wordIndex = (wordIndex + 1) % words.length;
        rotatingEl.textContent = words[wordIndex];
        rotatingEl.classList.remove('flip-out');
        rotatingEl.classList.add('flip-in');
        setTimeout(function () {
          rotatingEl.classList.remove('flip-in');
        }, 350);
      }, 350);
    }

    setTimeout(function () {
      flipToNext();
      setInterval(flipToNext, wordDelay);
    }, firstDelay);
  }

  // ---- Liquid Glass: physics-based refraction (archisvaze/liquid-glass) ----
  var ua = navigator.userAgent.toLowerCase();
  var isChromium = ua.indexOf('chrome') !== -1 || ua.indexOf('edg') !== -1 || ua.indexOf('opr') !== -1 || ua.indexOf('opera') !== -1;

  if (!isChromium) {
    var lgElements = document.querySelectorAll('.liquid-glass');
    lgElements.forEach(function (el) {
      el.classList.remove('liquid-glass');
      el.classList.add('liquid-glass-fallback');
    });
  } else {
    // Glass parameters (tuned for a nav bar)
    var GLASS_THICKNESS = 80;
    var BEZEL_WIDTH = 60;
    var IOR = 3.0;
    var SCALE_RATIO = 1.0;
    var BLUR_AMT = 1.2;
    var SPEC_OPACITY = 0.5;
    var SPEC_SAT = 4;
    var BORDER_RADIUS = 0;

    var surfaceFn = function (x) {
      return Math.pow(1 - Math.pow(1 - x, 4), 0.25);
    };

    function calcRefractionProfile(thickness, bezel, heightFn, ior, samples) {
      samples = samples || 128;
      var eta = 1 / ior;
      var profile = new Float64Array(samples);
      for (var i = 0; i < samples; i++) {
        var x = i / samples;
        var y = heightFn(x);
        var dx = x < 1 ? 0.0001 : -0.0001;
        var y2 = heightFn(x + dx);
        var deriv = (y2 - y) / dx;
        var mag = Math.sqrt(deriv * deriv + 1);
        var nx = -deriv / mag;
        var ny = -1 / mag;
        var dot = ny;
        var k = 1 - eta * eta * (1 - dot * dot);
        if (k < 0) { profile[i] = 0; continue; }
        var sq = Math.sqrt(k);
        var refX = eta * nx - (eta * dot + sq) * nx;
        var refY = eta - (eta * dot + sq) * ny;
        profile[i] = refX * ((y * bezel + thickness) / refY);
      }
      return profile;
    }

    function genDisplacementMap(w, h, radius, bezel, profile, maxDisp) {
      var c = document.createElement('canvas');
      c.width = w; c.height = h;
      var ctx = c.getContext('2d');
      var img = ctx.createImageData(w, h);
      var d = img.data;
      for (var i = 0; i < d.length; i += 4) {
        d[i] = 128; d[i + 1] = 128; d[i + 2] = 0; d[i + 3] = 255;
      }
      var r = radius, rSq = r * r, r1Sq = (r + 1) * (r + 1);
      var rBSq = Math.max(r - bezel, 0) * Math.max(r - bezel, 0);
      var wB = w - r * 2, hB = h - r * 2, S = profile.length;
      for (var y1 = 0; y1 < h; y1++) {
        for (var x1 = 0; x1 < w; x1++) {
          var px = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
          var py = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
          var dSq = px * px + py * py;
          if (dSq > r1Sq || dSq < rBSq) continue;
          var dist = Math.sqrt(dSq);
          var fromSide = r - dist;
          var op = dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));
          if (op <= 0 || dist === 0) continue;
          var cos = px / dist, sin = py / dist;
          var bi = Math.min(((fromSide / bezel) * S) | 0, S - 1);
          var disp = profile[bi] || 0;
          var dX = (-cos * disp) / maxDisp, dY = (-sin * disp) / maxDisp;
          var idx = (y1 * w + x1) * 4;
          d[idx] = (128 + dX * 127 * op + 0.5) | 0;
          d[idx + 1] = (128 + dY * 127 * op + 0.5) | 0;
        }
      }
      ctx.putImageData(img, 0, 0);
      return c.toDataURL();
    }

    function genSpecularMap(w, h, radius, bezel, angle) {
      angle = angle != null ? angle : Math.PI / 3;
      var c = document.createElement('canvas');
      c.width = w; c.height = h;
      var ctx = c.getContext('2d');
      var img = ctx.createImageData(w, h);
      var d = img.data;
      d.fill(0);
      var r = radius, rSq = r * r, r1Sq = (r + 1) * (r + 1);
      var rBSq = Math.max(r - bezel, 0) * Math.max(r - bezel, 0);
      var wB = w - r * 2, hB = h - r * 2;
      var sv = [Math.cos(angle), Math.sin(angle)];
      for (var y1 = 0; y1 < h; y1++) {
        for (var x1 = 0; x1 < w; x1++) {
          var px = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
          var py = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
          var dSq = px * px + py * py;
          if (dSq > r1Sq || dSq < rBSq) continue;
          var dist = Math.sqrt(dSq);
          var fromSide = r - dist;
          var op = dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));
          if (op <= 0 || dist === 0) continue;
          var cos = px / dist, sin = -py / dist;
          var dot = Math.abs(cos * sv[0] + sin * sv[1]);
          var edge = Math.sqrt(Math.max(0, 1 - (1 - fromSide) * (1 - fromSide)));
          var coeff = dot * edge;
          var col = (255 * coeff) | 0;
          var alpha = (col * coeff * op) | 0;
          var idx = (y1 * w + x1) * 4;
          d[idx] = col; d[idx + 1] = col; d[idx + 2] = col; d[idx + 3] = alpha;
        }
      }
      ctx.putImageData(img, 0, 0);
      return c.toDataURL();
    }

    var glassEl = document.getElementById('navGlass');
    var lgTimer;

    function rebuildGlassFilter() {
      var w = glassEl.offsetWidth, h = glassEl.offsetHeight;
      if (w < 2 || h < 2) return;
      var clampedBezel = Math.min(BEZEL_WIDTH, BORDER_RADIUS > 0 ? BORDER_RADIUS - 1 : Math.min(w, h) / 2 - 1);
      var profile = calcRefractionProfile(GLASS_THICKNESS, clampedBezel, surfaceFn, IOR, 128);
      var maxDisp = 1;
      for (var i = 0; i < profile.length; i++) {
        var absV = Math.abs(profile[i]);
        if (absV > maxDisp) maxDisp = absV;
      }
      var dispUrl = genDisplacementMap(w, h, BORDER_RADIUS || Math.min(w, h) / 2, clampedBezel, profile, maxDisp);
      var specUrl = genSpecularMap(w, h, BORDER_RADIUS || Math.min(w, h) / 2, clampedBezel * 2.5);
      var scale = maxDisp * SCALE_RATIO;

      var svgDefs = document.getElementById('svg-defs');
      if (svgDefs) {
        svgDefs.innerHTML =
          '<filter id="liquid-glass-filter" x="0%" y="0%" width="100%" height="100%">' +
            '<feGaussianBlur in="SourceGraphic" stdDeviation="' + BLUR_AMT + '" result="blurred_source" />' +
            '<feImage href="' + dispUrl + '" x="0" y="0" width="' + w + '" height="' + h + '" result="disp_map" />' +
            '<feDisplacementMap in="blurred_source" in2="disp_map" scale="' + scale + '" xChannelSelector="R" yChannelSelector="G" result="displaced" />' +
            '<feColorMatrix in="displaced" type="saturate" values="' + SPEC_SAT + '" result="displaced_sat" />' +
            '<feImage href="' + specUrl + '" x="0" y="0" width="' + w + '" height="' + h + '" result="spec_layer" />' +
            '<feComposite in="displaced_sat" in2="spec_layer" operator="in" result="spec_masked" />' +
            '<feComponentTransfer in="spec_layer" result="spec_faded">' +
              '<feFuncA type="linear" slope="' + SPEC_OPACITY + '" />' +
            '</feComponentTransfer>' +
            '<feBlend in="spec_masked" in2="displaced" mode="normal" result="with_sat" />' +
            '<feBlend in="spec_faded" in2="with_sat" mode="normal" />' +
          '</filter>';
      }
    }

    // Build filter once DOM is ready, and rebuild on resize
    requestAnimationFrame(function () {
      requestAnimationFrame(rebuildGlassFilter);
    });
    window.addEventListener('resize', function () {
      clearTimeout(lgTimer);
      lgTimer = setTimeout(rebuildGlassFilter, 150);
    });
  }

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
  var navContainer = document.getElementById('navGlass') || document.querySelector('.nav__container');
  var scrollThreshold = 50;

  function updateNav() {
    if (window.scrollY > scrollThreshold) {
      navContainer.classList.add('nav--scrolled');
    } else {
      navContainer.classList.remove('nav--scrolled');
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

  // ---- Pricing 3D Scene (Three.js) ----
  var pricingSection = document.getElementById('pricing');
  var canvas3d = document.getElementById('pricing3d');

  if (pricingSection && canvas3d && typeof THREE !== 'undefined' && !prefersReducedMotion) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 12);

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas3d,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Lighting — soft studio setup
    var ambientLight = new THREE.AmbientLight(0xfff0f5, 0.6);
    scene.add(ambientLight);

    var keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(5, 8, 10);
    scene.add(keyLight);

    var fillLight = new THREE.DirectionalLight(0xffc0cb, 0.4);
    fillLight.position.set(-6, 2, 4);
    scene.add(fillLight);

    var rimLight = new THREE.DirectionalLight(0xc084fc, 0.35);
    rimLight.position.set(0, -4, -6);
    scene.add(rimLight);

    // Materials — glossy physical
    var pinkMat = new THREE.MeshStandardMaterial({
      color: 0xFF6B9D, roughness: 0.18, metalness: 0.1,
      emissive: 0xFF6B9D, emissiveIntensity: 0.05
    });
    var lavenderMat = new THREE.MeshStandardMaterial({
      color: 0xC084FC, roughness: 0.15, metalness: 0.12,
      emissive: 0xC084FC, emissiveIntensity: 0.05
    });
    var goldMat = new THREE.MeshStandardMaterial({
      color: 0xFFC857, roughness: 0.2, metalness: 0.3,
      emissive: 0xFFC857, emissiveIntensity: 0.04
    });
    var softPinkMat = new THREE.MeshStandardMaterial({
      color: 0xFFB6C1, roughness: 0.25, metalness: 0.05,
      emissive: 0xFFB6C1, emissiveIntensity: 0.03
    });
    var glassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 0.05, metalness: 0.1,
      transparent: true, opacity: 0.45,
      emissive: 0xffe0f0, emissiveIntensity: 0.08
    });

    // Geometries
    var sphereGeo = new THREE.SphereGeometry(1, 64, 64);
    var torusGeo = new THREE.TorusGeometry(0.8, 0.35, 32, 64);
    var icoGeo = new THREE.IcosahedronGeometry(0.7, 0);
    var capsuleGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.4, 32, 1, false);
    // Round the capsule ends
    var capTop = new THREE.SphereGeometry(0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    var capBot = new THREE.SphereGeometry(0.4, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    var smallSphereGeo = new THREE.SphereGeometry(0.55, 48, 48);
    var ringGeo = new THREE.TorusGeometry(0.65, 0.12, 24, 64);

    // Meshes with positions — arranged around the sides
    var meshes = [];

    // 1. Big pink sphere — top left
    var sphere1 = new THREE.Mesh(sphereGeo, pinkMat);
    sphere1.position.set(-4.5, 2.5, -1);
    sphere1.scale.setScalar(1.3);
    scene.add(sphere1);
    meshes.push({ mesh: sphere1, basePos: sphere1.position.clone(), floatSpeed: 0.25, floatAmp: 0.4, rotSpeed: { x: 0.0015, y: 0.0025, z: 0.001 } });

    // 2. Small lavender sphere — top right
    var sphere2 = new THREE.Mesh(smallSphereGeo, lavenderMat);
    sphere2.position.set(4.2, 2.8, 0.5);
    scene.add(sphere2);
    meshes.push({ mesh: sphere2, basePos: sphere2.position.clone(), floatSpeed: 0.35, floatAmp: 0.3, rotSpeed: { x: 0.002, y: 0.003, z: 0.0015 } });

    // 3. Torus — middle left
    var torus = new THREE.Mesh(torusGeo, lavenderMat);
    torus.position.set(-4.8, -1.5, 0);
    torus.rotation.set(0.5, 0.3, 0);
    scene.add(torus);
    meshes.push({ mesh: torus, basePos: torus.position.clone(), floatSpeed: 0.2, floatAmp: 0.35, rotSpeed: { x: 0.004, y: 0.006, z: 0.002 } });

    // 4. Gold capsule (pill) — bottom right
    var pill = new THREE.Group();
    var pillBody = new THREE.Mesh(capsuleGeo, goldMat);
    var pillTop = new THREE.Mesh(capTop, goldMat);
    pillTop.position.y = 0.7;
    var pillBot = new THREE.Mesh(capBot, goldMat);
    pillBot.position.y = -0.7;
    pill.add(pillBody, pillTop, pillBot);
    pill.position.set(4.8, -2.2, -0.5);
    pill.rotation.set(0, 0, 0.5);
    scene.add(pill);
    meshes.push({ mesh: pill, basePos: pill.position.clone(), floatSpeed: 0.175, floatAmp: 0.45, rotSpeed: { x: 0.003, y: 0.002, z: 0.005 } });

    // 5. Glass icosahedron — center right
    var ico = new THREE.Mesh(icoGeo, glassMat);
    ico.position.set(5, 0.5, 1);
    ico.scale.setScalar(1.1);
    scene.add(ico);
    meshes.push({ mesh: ico, basePos: ico.position.clone(), floatSpeed: 0.3, floatAmp: 0.25, rotSpeed: { x: 0.005, y: 0.004, z: 0.003 } });

    // 6. Soft pink ring — bottom left
    var ring = new THREE.Mesh(ringGeo, softPinkMat);
    ring.position.set(-3.8, -3, 0.5);
    ring.rotation.set(0.8, 0.2, -0.3);
    scene.add(ring);
    meshes.push({ mesh: ring, basePos: ring.position.clone(), floatSpeed: 0.275, floatAmp: 0.3, rotSpeed: { x: 0.0035, y: 0.005, z: 0.0025 } });

    // Mouse tracking state
    var mouseTarget = { x: 0, y: 0 };
    var mouseCurrent = { x: 0, y: 0 };

    function onPointerMove(px, py) {
      var rect = pricingSection.getBoundingClientRect();
      mouseTarget.x = ((px - rect.left) / rect.width - 0.5) * 2;
      mouseTarget.y = ((py - rect.top) / rect.height - 0.5) * 2;
    }

    pricingSection.addEventListener('mousemove', function (e) {
      onPointerMove(e.clientX, e.clientY);
    });
    pricingSection.addEventListener('mouseleave', function () {
      mouseTarget.x = 0;
      mouseTarget.y = 0;
    });
    pricingSection.addEventListener('touchmove', function (e) {
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    pricingSection.addEventListener('touchend', function () {
      mouseTarget.x = 0;
      mouseTarget.y = 0;
    }, { passive: true });

    // Resize handler
    function resizeRenderer() {
      var w = pricingSection.offsetWidth;
      var h = pricingSection.offsetHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resizeRenderer();
    window.addEventListener('resize', resizeRenderer);

    // Render only when visible
    var isVisible = false;
    var pricingObserver = new IntersectionObserver(function (entries) {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    pricingObserver.observe(pricingSection);

    // Animation loop
    var clock = new THREE.Clock();
    (function animate() {
      requestAnimationFrame(animate);
      if (!isVisible) return;

      var t = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.05;
      mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.05;

      // Rotate entire scene gently based on mouse
      scene.rotation.y = mouseCurrent.x * 0.25;
      scene.rotation.x = -mouseCurrent.y * 0.15;

      // Animate each mesh: float + self-rotate
      for (var i = 0; i < meshes.length; i++) {
        var m = meshes[i];
        var mesh = m.mesh;
        // Floating bob
        mesh.position.y = m.basePos.y + Math.sin(t * m.floatSpeed + i * 1.5) * m.floatAmp;
        mesh.position.x = m.basePos.x + Math.sin(t * m.floatSpeed * 0.7 + i) * m.floatAmp * 0.3;
        // Self rotation
        mesh.rotation.x += m.rotSpeed.x;
        mesh.rotation.y += m.rotSpeed.y;
        mesh.rotation.z += m.rotSpeed.z;
      }

      renderer.render(scene, camera);
    })();
  }
})();
