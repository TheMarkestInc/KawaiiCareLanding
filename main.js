/**
 * Kawaii Care Landing — Main JS
 * Handles: mobile nav, scroll animations, nav scroll state
 */

(function () {
  'use strict';

  // ---- Marquee Gif Circles ----
  var gifCircles = document.querySelectorAll('.marquee__gif');
  if (gifCircles.length) {
    var frameCount = 5;
    var tick = 0;
    // Set initial frame based on data-offset
    gifCircles.forEach(function (circle) {
      var offset = parseInt(circle.getAttribute('data-offset'), 10) || 0;
      var imgs = circle.querySelectorAll('img');
      imgs.forEach(function (img, i) {
        if (i === offset % frameCount) img.classList.add('marquee__gif--active');
      });
    });
    setInterval(function () {
      tick++;
      gifCircles.forEach(function (circle) {
        var offset = parseInt(circle.getAttribute('data-offset'), 10) || 0;
        var imgs = circle.querySelectorAll('img');
        var active = (tick + offset) % frameCount;
        imgs.forEach(function (img, i) {
          if (i === active) img.classList.add('marquee__gif--active');
          else img.classList.remove('marquee__gif--active');
        });
      });
    }, 500);
  }

  // ---- Hero Rotating Word ----
  var rotatingEl = document.getElementById('rotatingWord');
  if (rotatingEl) {
    var words = ['life', 'routine', 'habits', 'burnout', 'self-care', 'energy', 'sleep', 'wellness', 'balance', 'focus', 'stability', 'rhythm'];
    var wordColors = ['#ff6b9d', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1', '#f43f5e', '#14b8a6', '#a855f7', '#e11d48', '#0ea5e9'];
    var wordIndex = 0;
    var firstDelay = 2000; // "life" stays 2s
    var wordDelay = 1000;  // rest 1s each

    function flipToNext() {
      rotatingEl.classList.add('flip-out');
      setTimeout(function () {
        wordIndex = (wordIndex + 1) % words.length;
        rotatingEl.textContent = words[wordIndex];
        rotatingEl.style.color = wordColors[wordIndex];
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
  // SVG feDisplacementMap in backdrop-filter only works in Chromium-based browsers.
  // Non-Chromium browsers get a WebGL (Three.js) fallback; if WebGL is unavailable, CSS blur.
  var ua = navigator.userAgent.toLowerCase();
  var isChromium = ua.indexOf('chrome') !== -1 || ua.indexOf('edg') !== -1 || ua.indexOf('opr') !== -1 || ua.indexOf('opera') !== -1;

  if (!isChromium) {
    (function webglFallback() {
      // Hero glass — fallback to CSS blur for non-Chromium
      var heroGlassEl = document.getElementById('heroGlass');
      if (heroGlassEl) {
        heroGlassEl.classList.remove('liquid-glass');
        heroGlassEl.classList.add('liquid-glass-fallback');
      }

      var glassEl = document.getElementById('navGlass');
      // Check WebGL support
      var testCanvas = document.createElement('canvas');
      var hasWebGL = !!(testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'));
      if (!hasWebGL) {
        glassEl.classList.remove('liquid-glass');
        glassEl.classList.add('liquid-glass-fallback');
        return;
      }
      glassEl.classList.remove('liquid-glass');
      glassEl.classList.add('liquid-glass-webgl');

      // Load Three.js dynamically, then initialise the WebGL glass
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.crossOrigin = 'anonymous';
      s.onerror = function () {
        glassEl.classList.remove('liquid-glass-webgl');
        glassEl.classList.add('liquid-glass-fallback');
      };
      s.onload = function () { initWebGLGlass(glassEl); };
      document.head.appendChild(s);
    })();
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
    var heroGlassEl = document.getElementById('heroGlass');
    var lgTimer;

    // Hero glass parameters (tuned for a larger content card)
    var HERO_GLASS_THICKNESS = 60;
    var HERO_BEZEL_WIDTH = 50;
    var HERO_IOR = 2.5;
    var HERO_BLUR_AMT = 1.0;
    var HERO_SPEC_OPACITY = 0.35;
    var HERO_SPEC_SAT = 3;
    var HERO_BORDER_RADIUS = 32; // ~2rem

    function buildFilterSVG(id, el, thickness, bezel, ior, blurAmt, specOpacity, specSat, borderRadius) {
      var w = el.offsetWidth, h = el.offsetHeight;
      if (w < 2 || h < 2) return '';
      var clampedBezel = Math.min(bezel, borderRadius > 0 ? borderRadius - 1 : Math.min(w, h) / 2 - 1);
      var profile = calcRefractionProfile(thickness, clampedBezel, surfaceFn, ior, 128);
      var maxDisp = 1;
      for (var i = 0; i < profile.length; i++) {
        var absV = Math.abs(profile[i]);
        if (absV > maxDisp) maxDisp = absV;
      }
      var dispUrl = genDisplacementMap(w, h, borderRadius || Math.min(w, h) / 2, clampedBezel, profile, maxDisp);
      var specUrl = genSpecularMap(w, h, borderRadius || Math.min(w, h) / 2, clampedBezel * 2.5);
      var scale = maxDisp * SCALE_RATIO;
      return '<filter id="' + id + '" x="0%" y="0%" width="100%" height="100%">' +
        '<feGaussianBlur in="SourceGraphic" stdDeviation="' + blurAmt + '" result="blurred_source" />' +
        '<feImage href="' + dispUrl + '" x="0" y="0" width="' + w + '" height="' + h + '" result="disp_map" />' +
        '<feDisplacementMap in="blurred_source" in2="disp_map" scale="' + scale + '" xChannelSelector="R" yChannelSelector="G" result="displaced" />' +
        '<feColorMatrix in="displaced" type="saturate" values="' + specSat + '" result="displaced_sat" />' +
        '<feImage href="' + specUrl + '" x="0" y="0" width="' + w + '" height="' + h + '" result="spec_layer" />' +
        '<feComposite in="displaced_sat" in2="spec_layer" operator="in" result="spec_masked" />' +
        '<feComponentTransfer in="spec_layer" result="spec_faded">' +
          '<feFuncA type="linear" slope="' + specOpacity + '" />' +
        '</feComponentTransfer>' +
        '<feBlend in="spec_masked" in2="displaced" mode="normal" result="with_sat" />' +
        '<feBlend in="spec_faded" in2="with_sat" mode="normal" />' +
      '</filter>';
    }

    function rebuildGlassFilter() {
      var svgDefs = document.getElementById('svg-defs');
      if (!svgDefs) return;
      var navSvg = buildFilterSVG('liquid-glass-filter', glassEl, GLASS_THICKNESS, BEZEL_WIDTH, IOR, BLUR_AMT, SPEC_OPACITY, SPEC_SAT, BORDER_RADIUS);
      var heroSvg = heroGlassEl ? buildFilterSVG('hero-glass-filter', heroGlassEl, HERO_GLASS_THICKNESS, HERO_BEZEL_WIDTH, HERO_IOR, HERO_BLUR_AMT, HERO_SPEC_OPACITY, HERO_SPEC_SAT, HERO_BORDER_RADIUS) : '';
      svgDefs.innerHTML = navSvg + heroSvg;
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

  // ---- WebGL Liquid Glass (fallback for non-Chromium browsers) ----
  // backdrop-filter sees the actual composited pixels behind the element.
  // We can't access those from WebGL, so we paint the hero video + overlay
  // gradient onto an offscreen canvas each frame and sample from that.
  function initWebGLGlass(navEl) {
    var THICKNESS = 80, BEZEL = 60, IOR = 3.0;
    var BLUR_AMT = 1.2, SPEC = 0.5, TINT = 0.06;

    /* --- WebGL canvas inside nav --- */
    var cvs = document.createElement('canvas');
    cvs.style.cssText = 'position:absolute;inset:0;z-index:-1;border-radius:inherit;pointer-events:none;';
    navEl.insertBefore(cvs, navEl.firstChild);

    var dpr = Math.min(window.devicePixelRatio, 2);
    var renderer = new THREE.WebGLRenderer({ canvas: cvs, alpha: true, antialias: false });
    renderer.setPixelRatio(dpr);
    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    /* --- offscreen canvas: composites what the user actually sees --- */
    var heroVideo = document.querySelector('.hero__video');
    var heroSection = document.querySelector('.hero');
    var offCanvas = document.createElement('canvas');
    var offCtx = offCanvas.getContext('2d');
    var bgTexture = new THREE.CanvasTexture(offCanvas);
    bgTexture.minFilter = THREE.LinearFilter;
    bgTexture.magFilter = THREE.LinearFilter;

    function paintBgCanvas() {
      var vw = window.innerWidth, vh = window.innerHeight;
      // size the offscreen canvas to viewport (only re-allocate on change)
      if (offCanvas.width !== vw || offCanvas.height !== vh) {
        offCanvas.width = vw;
        offCanvas.height = vh;
      }

      // hero rect in viewport coords (accounts for scroll)
      var heroRect = heroSection ? heroSection.getBoundingClientRect() : { left: 0, top: 0, width: vw, height: vh };

      // 1) fill with the page background colour (below the hero)
      offCtx.fillStyle = '#fff8f0';
      offCtx.fillRect(0, 0, vw, vh);

      // 2) draw the video into the hero region (object-fit: cover)
      if (heroVideo && heroVideo.readyState >= 2 && heroVideo.videoWidth > 0) {
        var vidW = heroVideo.videoWidth, vidH = heroVideo.videoHeight;
        var hrW = heroRect.width, hrH = heroRect.height;
        var vidAspect = vidW / vidH, hrAspect = hrW / hrH;
        var sx, sy, sw, sh;
        if (vidAspect > hrAspect) {
          sh = vidH; sw = vidH * hrAspect;
          sx = (vidW - sw) / 2; sy = 0;
        } else {
          sw = vidW; sh = vidW / hrAspect;
          sx = 0; sy = (vidH - sh) / 2;
        }
        // draw the video into the hero's on-screen region
        offCtx.drawImage(heroVideo, sx, sy, sw, sh,
                         heroRect.left, heroRect.top, hrW, hrH);
      }

      // 3) the hero overlay gradient (same as CSS .hero__overlay)
      var grad = offCtx.createLinearGradient(0, heroRect.top, 0, heroRect.top + heroRect.height);
      grad.addColorStop(0,   'rgba(255,248,240,0.6)');
      grad.addColorStop(0.5, 'rgba(255,248,240,0.75)');
      grad.addColorStop(1,   'rgba(255,248,240,0.95)');
      offCtx.fillStyle = grad;
      offCtx.fillRect(heroRect.left, heroRect.top, heroRect.width, heroRect.height);

      bgTexture.needsUpdate = true;
    }

    /* --- shader: much simpler now — texture IS the viewport image --- */
    var VS = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}';
    var FS = [
      'precision highp float;',
      'varying vec2 vUv;',
      '',
      'uniform vec2  uNavSize;',   // nav px * dpr
      'uniform vec2  uNavPos;',    // nav (left,top) px * dpr
      'uniform vec2  uViewport;',  // viewport px * dpr
      'uniform float uRadius;',
      'uniform float uBezel;',
      'uniform float uThick;',
      'uniform float uIOR;',
      'uniform float uBlur;',
      'uniform float uSpec;',
      'uniform float uTint;',
      'uniform sampler2D uBgTex;',
      '',
      'float sdRR(vec2 p,vec2 h,float r){',
      '  vec2 q=abs(p)-h+r;',
      '  return min(max(q.x,q.y),0.0)+length(max(q,0.0))-r;',
      '}',
      'float surf(float t){float s=1.0-t;return pow(1.0-s*s*s*s,0.25);}',
      '',
      'vec3 sampleBg(vec2 vpUV){',
      '  vec2 c=clamp(vpUV,0.0,1.0);',
      '  c.y=1.0-c.y;',
      '  return texture2D(uBgTex,c).rgb;',
      '}',
      '',
      '/* 32-tap golden-angle spiral blur with Gaussian weights */',
      'vec3 sampleBlur(vec2 vpUV,float r){',
      '  if(r<0.5)return sampleBg(vpUV);',
      '  vec3 sum=sampleBg(vpUV);',
      '  float tw=1.0;',
      '  vec2 px=1.0/uViewport;',
      '  const float GA=2.39996323;',
      '  for(int i=0;i<32;i++){',
      '    float fi=float(i+1);',
      '    float ri=sqrt(fi/32.0)*r;',
      '    float th=float(i)*GA;',
      '    vec2 o=vec2(cos(th),sin(th))*ri*px;',
      '    float w=exp(-2.0*ri*ri/(r*r));',
      '    sum+=sampleBg(vpUV+o)*w;',
      '    tw+=w;',
      '  }',
      '  return sum/tw;',
      '}',
      '',
      'void main(){',
      '  vec2 lp=vec2(vUv.x,1.0-vUv.y)*uNavSize;',
      '  vec2 ctr=uNavSize*0.5;',
      '  vec2 p=lp-ctr;',
      '  vec2 hs=uNavSize*0.5;',
      '',
      '  float sd=sdRR(p,hs,uRadius);',
      '  if(sd>0.0){gl_FragColor=vec4(0.0);return;}',
      '',
      '  float d=-sd;',
      '  float bz=min(uBezel,min(uRadius,min(hs.x,hs.y))-1.0);',
      '  float t=clamp(d/bz,0.0,1.0);',
      '  float h=surf(t);',
      '  float dt=0.001;float h2=surf(min(t+dt,1.0));float dh=(h2-h)/dt;',
      '  float sa=atan(dh*(uThick/bz));',
      '  float sr=clamp(sin(sa)/uIOR,-1.0,1.0);',
      '  float tr=asin(sr);',
      '  float disp=h*uThick*(tan(sa)-tan(tr));',
      '',
      '  vec2 g;float eps=0.5;',
      '  g.x=sdRR(p+vec2(eps,0.0),hs,uRadius)-sd;',
      '  g.y=sdRR(p+vec2(0.0,eps),hs,uRadius)-sd;',
      '  g=normalize(g);',
      '',
      '  /* local px + displacement → viewport UV */',
      '  vec2 vpUV=(lp-g*disp+uNavPos)/uViewport;',
      '',
      '  vec3 col=sampleBlur(vpUV,uBlur);',
      '',
      '  vec2 ld=normalize(vec2(0.5,-0.7));',
      '  float rd=abs(dot(g,ld));',
      '  float rf=1.0-smoothstep(0.0,bz*0.4,d);',
      '  col+=vec3(pow(rd*rf,1.5)*uSpec);',
      '',
      '  float is2=1.0-smoothstep(0.0,bz*0.6,d);',
      '  col*=mix(1.0,0.7,is2*0.3);',
      '',
      '  float ir=smoothstep(0.0,2.0,d)*(1.0-smoothstep(2.0,5.0,d));',
      '  col+=vec3(ir*0.15*uSpec);',
      '',
      '  col=mix(col,vec3(1.0),uTint);',
      '  float a=smoothstep(0.0,1.5,d);',
      '  gl_FragColor=vec4(col,a);',
      '}'
    ].join('\n');

    var mat = new THREE.ShaderMaterial({
      vertexShader: VS, fragmentShader: FS,
      uniforms: {
        uNavSize:  { value: new THREE.Vector2() },
        uNavPos:   { value: new THREE.Vector2() },
        uViewport: { value: new THREE.Vector2() },
        uRadius:   { value: 999.0 },
        uBezel:    { value: BEZEL },
        uThick:    { value: THICKNESS },
        uIOR:      { value: IOR },
        uBlur:     { value: BLUR_AMT },
        uSpec:     { value: SPEC },
        uTint:     { value: TINT },
        uBgTex:    { value: bgTexture }
      },
      transparent: true, depthTest: false
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    function resize() {
      var w = navEl.offsetWidth, h = navEl.offsetHeight;
      if (w < 2 || h < 2) return;
      renderer.setSize(w, h);
      mat.uniforms.uNavSize.value.set(w * dpr, h * dpr);
      mat.uniforms.uViewport.value.set(window.innerWidth * dpr, window.innerHeight * dpr);
      var r = Math.min(999, Math.min(w, h) / 2);
      mat.uniforms.uRadius.value = r * dpr;
    }

    function frame() {
      paintBgCanvas();
      var rect = navEl.getBoundingClientRect();
      mat.uniforms.uNavPos.value.set(rect.left * dpr, rect.top * dpr);
      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    }

    resize();
    requestAnimationFrame(frame);

    var lgResizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(lgResizeTimer);
      lgResizeTimer = setTimeout(resize, 150);
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

  // ---- Pricing 3D Scene (Three.js) — lazy-loaded ----
  var pricingSection = document.getElementById('pricing');
  var canvas3d = document.getElementById('pricing3d');

  if (pricingSection && canvas3d && !prefersReducedMotion) {
    var threeLoaded = false;
    var lazyThreeObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !threeLoaded) {
        threeLoaded = true;
        lazyThreeObserver.disconnect();
        var s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        s.onload = function () { initPricing3D(); };
        document.head.appendChild(s);
      }
    }, { rootMargin: '200px' });
    lazyThreeObserver.observe(pricingSection);
  }

  function initPricing3D() {
    var pricingSection = document.getElementById('pricing');
    var canvas3d = document.getElementById('pricing3d');
    if (!pricingSection || !canvas3d || typeof THREE === 'undefined') return;
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

  // ---- Problem Slider ----
  var slides = document.querySelectorAll('.problem-slider__slide');
  var dots = document.querySelectorAll('.problem-slider__dot');
  var prevBtn = document.getElementById('sliderPrev');
  var nextBtn = document.getElementById('sliderNext');

  if (slides.length > 0) {
    var currentSlide = 0;
    var slideCount = slides.length;
    var autoInterval = null;

    function goToSlide(index) {
      slides[currentSlide].classList.remove('problem-slider__slide--active');
      dots[currentSlide].classList.remove('problem-slider__dot--active');
      currentSlide = (index + slideCount) % slideCount;
      slides[currentSlide].classList.add('problem-slider__slide--active');
      dots[currentSlide].classList.add('problem-slider__dot--active');
    }

    function startAuto() {
      autoInterval = setInterval(function () { goToSlide(currentSlide + 1); }, 4000);
    }

    function resetAuto() {
      clearInterval(autoInterval);
      startAuto();
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goToSlide(currentSlide - 1); resetAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goToSlide(currentSlide + 1); resetAuto(); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () { goToSlide(parseInt(this.dataset.slide, 10)); resetAuto(); });
    });

    startAuto();
  }

  // ---- Dashboard cards center-spotlight effect ----
  var heroImg = document.querySelector('.problem-hero-img');
  if (heroImg) {
    var cards = heroImg.querySelectorAll('.dash-card');
    // Only run spotlight JS if backdrop-filter is supported (modern device)
    var supportsBackdrop = CSS.supports && CSS.supports('backdrop-filter', 'blur(1px)');
    if (supportsBackdrop) {
      function updateDashCards() {
        var rect = heroImg.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var half = rect.width / 2;
        cards.forEach(function (card) {
          var cr = card.getBoundingClientRect();
          var cardCenter = cr.left + cr.width / 2;
          var dist = Math.abs(cardCenter - centerX);
          var t = Math.max(0, 1 - dist / half); // 1 at center, 0 at edges
          var opacity = 0.4 + t * 0.6;
          var scale = 1 + t * 0.12;
          var lift = t * -8;
          card.style.opacity = opacity;
          card.style.transform = 'scale(' + scale + ') translateY(' + lift + 'px)';
          var glowOuter = 8 + t * 24;
          var glowAlpha = 0.06 + t * 0.35;
          var glowInner = 4 + t * 12;
          var glowInnerAlpha = 0.03 + t * 0.15;
          var borderAlpha = 0.1 + t * 0.45;
          card.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2), 0 0 ' + glowOuter + 'px rgba(255,255,255,' + glowAlpha + '), inset 0 0 ' + glowInner + 'px rgba(255,255,255,' + glowInnerAlpha + ')';
          card.style.borderColor = 'rgba(255,255,255,' + borderAlpha + ')';
          var dsBlur1 = 1 + t * 1.5;
          var dsAlpha1 = 0.4 + t * 0.5;
          var dsBlur2 = 3 + t * 4;
          var dsAlpha2 = 0.15 + t * 0.3;
          card.style.filter = 'drop-shadow(0 0 ' + dsBlur1 + 'px rgba(255,255,255,' + dsAlpha1 + ')) drop-shadow(0 0 ' + dsBlur2 + 'px rgba(255,255,255,' + dsAlpha2 + '))';
        });
        requestAnimationFrame(updateDashCards);
      }
      requestAnimationFrame(updateDashCards);
    }
  }

  // SVG badges parallax removed — icons are now static

  // ---- Founder Card Scroll-Driven Fly-In ----
  (function founderFlyIn() {
    var card = document.querySelector('.founder-card');
    if (!card) return;

    // Remove the generic animate-in so we drive it entirely via scroll
    card.classList.remove('animate-in');
    card.classList.add('founder-card--flying');

    // Initial hidden state
    card.style.opacity = '0';
    card.style.transform = 'translateY(140px) scale(0.82) rotate(-3deg)';

    var ticking = false;
    var prevProgress = -1;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function update() {
      ticking = false;
      var rect = card.getBoundingClientRect();
      var vh = window.innerHeight;

      // Start animating when the card's top enters the bottom 15% of viewport
      // Fully visible when the card center reaches viewport center
      var startTrigger = vh * 1.0;   // card top at bottom of viewport
      var endTrigger   = vh * 0.35;  // card top at ~35% from top

      var rawProgress = (startTrigger - rect.top) / (startTrigger - endTrigger);
      var progress = Math.max(0, Math.min(1, rawProgress));

      // Avoid redundant repaints
      if (Math.abs(progress - prevProgress) < 0.001) return;
      prevProgress = progress;

      var p = easeOutCubic(progress);

      var translateY = 140 * (1 - p);
      var scale      = 0.82 + 0.18 * p;
      var rotate     = -3 * (1 - p);
      var opacity    = p;

      card.style.opacity   = opacity;
      card.style.transform =
        'translateY(' + translateY + 'px) scale(' + scale + ') rotate(' + rotate + 'deg)';
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once immediately in case section is already in view
    update();
  })();

  // ---- Flyby Collage Images (scroll-driven) ----
  (function flybyImages() {
    var flyby = document.querySelector('.flyby');
    if (!flyby) return;

    var imgLeft  = flyby.querySelector('.flyby__img--left');
    var imgRight = flyby.querySelector('.flyby__img--right');
    if (!imgLeft || !imgRight) return;

    var ticking = false;
    var prevP = -1;

    function easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function update() {
      ticking = false;
      var rect = flyby.getBoundingClientRect();
      var vh = window.innerHeight;

      // Animate across a tall scroll range — start much earlier than the flyby element
      var rangeStart = vh * 1.2;    // start when flyby is still well below viewport
      var rangeEnd   = -vh * 0.3;   // continue until past

      var rawP = (rangeStart - rect.top) / (rangeStart - rangeEnd);
      var p = Math.max(0, Math.min(1, rawP));

      if (Math.abs(p - prevP) < 0.0005) return;
      prevP = p;

      // Opacity: fade in from 0–0.25, full from 0.25–0.75, fade out 0.75–1
      var opacity;
      if (p < 0.2)       opacity = p / 0.2;
      else if (p > 0.8)  opacity = (1 - p) / 0.2;
      else                opacity = 1;

      // Travel: images fly from +180px to -200px (left moves faster)
      var travelLeft  = 180 - 380 * p;
      var travelRight = 160 - 340 * p;

      // Rotation: gentle swing
      var rotLeft  = -12 + 20 * p;
      var rotRight =  10 - 18 * p;

      // Scale: start small, peak in middle, shrink slightly
      var scaleBase = 0.7 + 0.35 * (1 - Math.abs(p - 0.5) * 2);

      imgLeft.style.opacity = opacity;
      imgLeft.style.transform =
        'translateY(' + travelLeft + 'px) rotate(' + rotLeft + 'deg) scale(' + scaleBase + ')';

      imgRight.style.opacity = opacity;
      imgRight.style.transform =
        'translateY(' + travelRight + 'px) rotate(' + rotRight + 'deg) scale(' + scaleBase + ')';
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  })();

})();
