# Kawaii Care — Landing Page Development Plan

---

## 1. Project Overview

| Parameter | Value |
|---|---|
| **URL** | kawaiicare.com |
| **Hosting** | GitHub Pages (static) |
| **CTA Target** | http://eepurl.com/jzI29o (Mailchimp waitlist) |
| **Hero Background** | `herovideo.webm` (looping video) |
| **Content Source** | `kawaii-care-landing-v4.md` (14 блоков) |
| **Design References** | sanrio.com (kawaii-эстетика, пастель, персонажи) · bearaby.com (чистый layout, product storytelling, секции benefits/reviews/how-it-works) |

---

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Markup | Semantic HTML5 | GitHub Pages, без сборки |
| Styles | Single CSS file (`styles.css`) | Custom properties, no dependencies |
| Interactivity | Vanilla JS (`main.js`) | Intersection Observer animations, mobile menu, smooth scroll |
| Fonts | Google Fonts — **Nunito** (body) + **Quicksand** (headings) | Rounded, kawaii-friendly, бесплатные |
| Icons | Inline SVG / CSS emoji | Zero dependencies |
| Video | `<video>` tag с `poster` fallback | WebM + mp4 fallback |
| Deploy | GitHub Actions → `gh-pages` branch | Автоматический deploy при push |

---

## 3. Design System

### 3.1 Color Palette (вдохновлено Sanrio + Bearaby)

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#FF6B9D` | CTA кнопки, акценты (розовый kawaii) |
| `--color-primary-hover` | `#FF4785` | Hover state для CTA |
| `--color-secondary` | `#C084FC` | Градиенты, вторичные акценты (лаванда) |
| `--color-accent` | `#FFC857` | Highlights, badges, звездочки |
| `--color-bg` | `#FFF8F0` | Основной фон (тёплый крем, как у Bearaby) |
| `--color-bg-alt` | `#FFF0F5` | Чередующиеся секции (lavender blush) |
| `--color-text` | `#2D2D2D` | Основной текст |
| `--color-text-muted` | `#6B7280` | Подписи, small text |
| `--color-white` | `#FFFFFF` | Карточки, контрастные блоки |

### 3.2 Typography Scale

```
--fs-hero:    clamp(2.5rem, 5vw, 4.5rem)
--fs-h2:      clamp(1.75rem, 3.5vw, 3rem)
--fs-h3:      clamp(1.25rem, 2.5vw, 1.75rem)
--fs-body:    clamp(1rem, 1.2vw, 1.125rem)
--fs-small:   0.875rem
--fs-tag:     0.75rem
```

### 3.3 Spacing & Layout

- Container max-width: `1200px`, padding inline `clamp(1rem, 5vw, 4rem)`
- Section vertical padding: `clamp(4rem, 8vw, 8rem)`
- Border radius: `16px` (карточки), `999px` (кнопки — pill shape, как у Sanrio)
- Shadows: мягкие `box-shadow: 0 4px 24px rgba(0,0,0,0.06)`

### 3.4 Animations

- Fade-in-up при scroll (Intersection Observer, `threshold: 0.15`)
- Мягкие hover-transitions на карточках (`transform: translateY(-4px)`)
- Floating animation для декоративных элементов (CSS `@keyframes float`)
- Видео hero: плавный gradient overlay снизу для перехода к контенту

---

## 4. File Structure

```
KawaiiCareLanding/
├── index.html              # Single-page landing
├── styles.css              # All styles
├── main.js                 # Interactions & animations
├── assets/
│   ├── herovideo.webm      # Hero background video
│   ├── herovideo-poster.jpg # Fallback poster for video
│   ├── logo.svg            # Kawaii Care logo
│   ├── og-image.jpg        # Open Graph image (1200×630)
│   ├── favicon.ico         # Favicon
│   └── images/             # Section images & illustrations
│       ├── product-hero.png
│       ├── founder.jpg
│       ├── face-happy.svg
│       ├── face-sleepy.svg
│       ├── face-hangry.svg
│       ├── face-pouty.svg
│       ├── face-proud.svg
│       ├── skin-bear.svg
│       ├── skin-dragon.svg
│       ├── skin-cat.svg
│       └── ...
├── kawaii-care-landing-v4.md
├── kawaii-care-landing-plan.md
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages deploy action
├── CNAME                   # Custom domain (kawaiicare.com)
└── .nojekyll               # Bypass Jekyll processing
```

---

## 5. Page Sections (mapping контента v4 → HTML)

### Section 1 — Navigation (sticky)
- Логотип слева
- Навигация: Problem · Product · How It Works · Story · Pricing
- CTA кнопка "Join Waitlist" справа (→ eepurl.com/jzI29o)
- Mobile: hamburger → slide-in drawer (right)
- Стиль: frosted glass (`backdrop-filter: blur(12px)`) как у Bearaby

### Section 2 — Hero (Block 1)
- **Background**: `herovideo.webm` autoplay muted loop с gradient overlay
- **Poster**: статичный jpg для загрузки/мобильных с экономией трафика
- **Content**: headline + subheadline + CTA кнопка + small text
- CTA: "Get on the Waitlist" → http://eepurl.com/jzI29o
- Layout: centered text поверх видео, вертикальное выравнивание
- Mobile: видео заменяется на poster через `<source media>` или JS

### Section 3 — The Problem (Block 2)
- Tag badge: `real talk`
- Headline + stacked paragraphs
- Дизайн: мягкий alt-bg, текст по центру, max-width ~720px
- Декор: subtle kawaii illustrations по бокам (CSS pseudo-elements)

### Section 4 — The Shift (Block 3)
- Tag: `but here's the thing`
- Переходная секция — крупный текст, контрастный фон
- Стиль: gradient фон (primary → secondary), белый текст

### Section 5 — Product Intro (Block 4)
- Tag: `meet kawaii care`
- Headline + intro copy
- **3 Feature Cards** в ряд (grid) — по дизайну Bearaby benefits:
  - "It Talks to You" — иконка + текст
  - "It Feels With You" — иконка + текст
  - "It Goes Where You Go" — иконка + текст
- Mobile: stack вертикально
- Hover: карточки приподнимаются с тенью

### Section 6 — Founder Story (Block 5)
- Tag: `why this exists`
- Layout: 2 колонки — фото слева, текст справа (как у Bearaby product story)
- Фото основательницы с устройством
- Mobile: фото сверху, текст снизу

### Section 7 — How It Works (Block 6)
- Tag: `stupidly simple`
- **3 шага** — numbered steps с иконками
- Layout: horizontal timeline / staggered cards
- Визуально: 1-2-3 с connecting line между ними
- Стиль по референсу Bearaby "How It Works" секции
- Mobile: вертикальный timeline

### Section 8 — Before/After (Block 7)
- Tag: `picture this`
- 2-panel split layout
- Left (Before): тёмный/серый тон, грустный текст
- Right (After 90 days): яркий/розовый тон, позитивный текст
- Mobile: stack, before сверху → after снизу
- Визуальный контраст как storytelling device

### Section 9 — Quiet Urgency (Block 8)
- Tag: `gentle heads up`
- Full-width секция с мягким фоном
- Headline + copy + CTA "I'm Ready to Start" → waitlist
- Small text под кнопкой

### Section 10 — Emotions Gallery (Block 9)
- Tag: `a face for every feeling`
- **Grid** из face expressions (3×3 или scrollable row)
- Character skins selector (bear/dragon/cat) — tab UI
- Hover: faces анимируются (wiggle/bounce)
- Стиль: вдохновлен Sanrio "Who's Your Favorite?" каруселью

### Section 11 — Gamification (Block 10)
- Tag: `why you'll actually stick with it`
- Feature list с иконками: Streaks, Friends Leaderboard, Unlockable Outfits, Apple Health Sync
- Визуал: mockup экрана устройства с примером streak
- Сравнение "Tamagotchi meets life coach"

### Section 12 — Social Proof (Block 11)
- Tag: `don't take our word for it`
- "As seen on Shark Tank" badge
- **Testimonial cards** — quote + name + location
- Стиль: как Bearaby reviews section
- Возможно carousel на mobile

### Section 13 — Pricing / Waitlist (Block 12)
- Tag: `take the first step`
- Pricing card по центру: $79 (зачёркнутый $129)
- Включено: Device + cable + app + 3 skins
- "No credit card. Fully refundable. Zero risk."
- Большая CTA "Join the Waitlist — It's Free" → waitlist
- Counter: "2,000+ women already in"

### Section 14 — FAQ (Block 13)
- Accordion UI (details/summary или JS toggle)
- 6 вопросов из контента
- Clean, minimal стиль как у Bearaby FAQ

### Section 15 — Final CTA (Block 14)
- Full-width emotional closing section
- Gradient или видео-background
- Headline + copy + финальная CTA кнопка → waitlist

### Section 16 — Footer
- Логотип + tagline
- Social links (Instagram, TikTok, Twitter)
- Legal: Privacy Policy · Terms
- © 2026 Kawaii Care

---

## 6. Mobile-First Responsive Strategy

### Breakpoints
```css
/* Mobile first */
/* Small phones */   @media (min-width: 375px)  { ... }
/* Large phones */   @media (min-width: 480px)  { ... }
/* Tablets */        @media (min-width: 768px)  { ... }
/* Desktop */        @media (min-width: 1024px) { ... }
/* Wide */           @media (min-width: 1280px) { ... }
```

### Mobile-Specific Adaptations
| Element | Mobile | Desktop |
|---|---|---|
| Nav | Hamburger → slide drawer | Horizontal links + CTA |
| Hero video | Poster image (save data) | Autoplay video |
| Feature cards | 1 column stack | 3 columns grid |
| Before/After | Stacked vertical | Side-by-side split |
| Founder section | Image top, text bottom | 2-column layout |
| How It Works | Vertical timeline | Horizontal steps |
| Emotions grid | 2-column + scroll | 3×3 grid |
| FAQ | Full-width accordion | Centered max-width |
| Typography | Smaller clamp values | Larger clamp values |
| Section padding | 3rem top/bottom | 6-8rem top/bottom |
| CTA buttons | Full-width | Auto-width, centered |

### Touch & Mobile UX
- Tap targets ≥ 44×44px
- No hover-dependent interactions (дублировать on tap)
- Smooth scroll с `scroll-behavior: smooth`
- `prefers-reduced-motion` — отключить анимации
- Lazy loading для images (`loading="lazy"`)
- `<meta name="viewport" content="width=device-width, initial-scale=1">`

---

## 7. Performance & SEO

### Performance
- Inline critical CSS в `<head>`
- Defer non-critical JS (`defer` attribute)
- `herovideo.webm` — оптимизировать: ≤ 5MB, 720p, 24fps
- Все изображения: WebP формат, srcset для retina
- `loading="lazy"` для below-the-fold images
- Предзагрузка hero видео: `<link rel="preload" as="video">`
- Google Fonts: `display=swap`, preconnect

### SEO
- Semantic HTML: `<header>`, `<main>`, `<section>`, `<footer>`, `<article>`
- `<h1>` — один на страницу (hero headline)
- Meta description, Open Graph tags, Twitter Card
- Structured data (JSON-LD): Product + Organization
- `robots.txt` + `sitemap.xml`
- Canonical URL

### Accessibility
- Colour contrast WCAG AA (4.5:1 для текста)
- Alt text для всех изображений
- ARIA labels для интерактивных элементов
- Skip-to-content link
- Focus states для keyboard navigation
- `prefers-reduced-motion` и `prefers-color-scheme` media queries

---

## 8. Deployment (GitHub Pages)

### GitHub Actions Workflow
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - uses: actions/deploy-pages@v4
```

### Checklist
- [ ] Файл `CNAME` с `kawaiicare.com`
- [ ] Файл `.nojekyll` (пустой)
- [ ] DNS: A-записи → GitHub Pages IPs
- [ ] HTTPS включен в Settings → Pages

---

## 9. Implementation Phases

### Phase 1 — Skeleton & Hero
1. Создать `index.html` с semantic structure всех секций
2. Подключить Google Fonts, создать `styles.css` с CSS custom properties
3. Реализовать sticky navigation (desktop + mobile hamburger)
4. Hero секция с video background + overlay + CTA

### Phase 2 — Content Sections (верхняя половина)
5. Section "The Problem" — текстовая секция с tag badge
6. Section "The Shift" — gradient переходная секция
7. Section "Product Intro" — 3 feature cards grid
8. Section "Founder Story" — 2-column layout
9. Section "How It Works" — 3-step timeline

### Phase 3 — Content Sections (нижняя половина)
10. Section "Before/After" — split panel layout
11. Section "Quiet Urgency" — CTA секция
12. Section "Emotions Gallery" — face grid + skins
13. Section "Gamification" — feature list
14. Section "Social Proof" — testimonial cards

### Phase 4 — Conversion & Close
15. Section "Pricing/Waitlist" — pricing card + CTA
16. Section "FAQ" — accordion component
17. Section "Final CTA" — closing section
18. Footer

### Phase 5 — Polish & Deploy
19. Scroll animations (Intersection Observer)
20. Mobile testing и responsive fine-tuning
21. Performance audit (Lighthouse ≥ 90)
22. SEO meta tags, OG tags, structured data
23. GitHub Actions deploy workflow
24. Final QA: cross-browser (Chrome, Safari, Firefox, Edge), device testing

---

## 10. Design Principles (из анализа референсов)

### От Sanrio
- **Kawaii-эстетика**: скруглённые формы, мягкие тени, пастельные цвета
- **Character-driven**: персонажи как центр бренда
- **Playful typography**: rounded fonts, крупные заголовки
- **"Who's Your Favorite?"**: интерактивная галерея персонажей → адаптировать для Emotions Gallery
- **Clean navigation** с pill-shaped CTA

### От Bearaby
- **Product storytelling**: benefits показаны через иконки + короткие тексты
- **Social proof integration**: reviews встроены в поток страницы
- **"How It Works" pattern**: пошаговое объяснение
- **Warm, cozy aesthetic**: кремовые фоны, натуральные тона
- **Section rhythm**: чередование белого и alt-bg для визуального ритма
- **Trust signals**: "As seen in" press logos, review stars

### Синтез для Kawaii Care
- Цветовая палитра: **кремово-розовая** с лавандовыми акцентами (Bearaby warmth + Sanrio kawaii)
- Tone: **дерзкий и милый** одновременно (как в контент-документе)
- Layout: **чистые секции** (Bearaby) с **игривыми деталями** (Sanrio)
- CTA кнопки: **pill-shaped**, яркий розовый, с мягкой тенью
- Все interactions — **мягкие, bouncy** (ease-out, spring-like transforms)
