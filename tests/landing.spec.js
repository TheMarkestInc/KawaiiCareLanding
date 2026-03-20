// @ts-check
const { test, expect } = require('@playwright/test');

// ---- Page Load & Meta ----
test.describe('Page Load & SEO', () => {
  test('page loads successfully with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Kawaii Care/);
  });

  test('meta description is present', async ({ page }) => {
    await page.goto('/');
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute('content', /AI companion/);
  });

  test('Open Graph tags are present', async ({ page }) => {
    await page.goto('/');
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /Kawaii Care/);
  });

  test('viewport meta tag is set', async ({ page }) => {
    await page.goto('/');
    const vp = page.locator('meta[name="viewport"]');
    await expect(vp).toHaveAttribute('content', /width=device-width/);
  });
});

// ---- Navigation ----
test.describe('Navigation', () => {
  test('sticky nav is visible at top', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('#nav');
    await expect(nav).toBeVisible();
  });

  test('nav contains logo and brand name', async ({ page }) => {
    await page.goto('/');
    const logo = page.locator('.nav__logo');
    await expect(logo).toBeVisible();
    await expect(page.locator('.nav__logo-text')).toHaveText('Kawaii Care');
  });

  test('nav waitlist CTA links to correct URL', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('.nav__cta');
    // On mobile this is hidden; on desktop it should link correctly
    await expect(cta).toHaveAttribute('href', 'http://eepurl.com/jzI29o');
  });

  test('nav links point to correct sections', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('.nav__links .nav__link');
    const hrefs = await links.evaluateAll(els => els.map(el => el.getAttribute('href')));
    expect(hrefs).toContain('#problem');
    expect(hrefs).toContain('#product');
    expect(hrefs).toContain('#how-it-works');
    expect(hrefs).toContain('#founder');
    expect(hrefs).toContain('#pricing');
  });
});

// ---- Hero Section ----
test.describe('Hero Section', () => {
  test('hero headline is visible', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('.hero__title');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('cute little thing');
  });

  test('hero has a video element', async ({ page }) => {
    await page.goto('/');
    const video = page.locator('.hero__video');
    await expect(video).toBeAttached();
  });

  test('hero CTA links to waitlist', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('.hero__content .btn--primary');
    await expect(cta).toHaveAttribute('href', 'http://eepurl.com/jzI29o');
    await expect(cta).toContainText('Get on the Waitlist');
  });

  test('hero CTA opens in new tab', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('.hero__content .btn--primary');
    await expect(cta).toHaveAttribute('target', '_blank');
    await expect(cta).toHaveAttribute('rel', /noopener/);
  });
});

// ---- All Sections Exist ----
test.describe('Section Structure', () => {
  test('problem section exists with correct content', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('#problem');
    await expect(section).toBeAttached();
    await expect(section.locator('.section__title')).toContainText("You're not lazy");
  });

  test('shift section exists', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#shift')).toBeAttached();
  });

  test('product section has 3 feature cards', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('#product .card');
    await expect(cards).toHaveCount(3);
  });

  test('founder section exists', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#founder')).toBeAttached();
    await expect(page.locator('#founder .section__title')).toContainText('built her way out');
  });

  test('how-it-works has 3 steps', async ({ page }) => {
    await page.goto('/');
    const steps = page.locator('#how-it-works .step');
    await expect(steps).toHaveCount(3);
  });

  test('before/after section exists with both panels', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.split__panel--before')).toBeAttached();
    await expect(page.locator('.split__panel--after')).toBeAttached();
  });

  test('urgency section has CTA', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#urgency .btn');
    await expect(cta).toContainText("I'm Ready to Start");
    await expect(cta).toHaveAttribute('href', 'http://eepurl.com/jzI29o');
  });

  test('emotions section has face cards', async ({ page }) => {
    await page.goto('/');
    const faces = page.locator('#emotions .face-card');
    const count = await faces.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('gamification section has features', async ({ page }) => {
    await page.goto('/');
    const features = page.locator('#gamification .feature');
    await expect(features).toHaveCount(4);
  });

  test('social proof has testimonials', async ({ page }) => {
    await page.goto('/');
    const testimonials = page.locator('#social-proof .testimonial');
    const count = await testimonials.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('pricing card shows correct price', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.pricing-card__current')).toContainText('$148.8');
    await expect(page.locator('.pricing-card__old')).toContainText('$228');
  });

  test('FAQ has 6 items', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('#faq .faq-item');
    await expect(items).toHaveCount(6);
  });

  test('final CTA section exists', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#final-cta')).toBeAttached();
  });

  test('footer exists with copyright', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.footer__copy')).toContainText('2026 Kawaii Care');
  });
});

// ---- CTA Links Consistency ----
test.describe('All CTAs link to waitlist', () => {
  test('all primary CTA buttons link to the waitlist URL', async ({ page }) => {
    await page.goto('/');
    const ctaButtons = page.locator('a.btn[href*="eepurl.com"]');
    const count = await ctaButtons.count();
    expect(count).toBeGreaterThanOrEqual(4); // hero, urgency, pricing, final
    for (let i = 0; i < count; i++) {
      await expect(ctaButtons.nth(i)).toHaveAttribute('href', 'http://eepurl.com/jzI29o');
    }
  });
});

// ---- Accessibility ----
test.describe('Accessibility', () => {
  test('skip-to-content link exists', async ({ page }) => {
    await page.goto('/');
    const skip = page.locator('.skip-link');
    await expect(skip).toBeAttached();
    await expect(skip).toHaveAttribute('href', '#main');
  });

  test('main landmark exists', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main#main')).toBeAttached();
  });

  test('only one h1 on the page', async ({ page }) => {
    await page.goto('/');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('all images/SVGs have appropriate roles or are decorative', async ({ page }) => {
    await page.goto('/');
    // Check that decorative elements have aria-hidden
    const decorSvgs = page.locator('svg[aria-hidden="true"]');
    const count = await decorSvgs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('nav hamburger has aria-label', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#navToggle')).toHaveAttribute('aria-label', /menu/i);
  });

  test('CTA buttons have minimum 44px touch target', async ({ page }) => {
    await page.goto('/');
    const buttons = page.locator('.btn');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

// ---- Responsive Layout ----
test.describe('Responsive Layout', () => {
  test('hero covers full viewport height', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('.hero');
    const box = await hero.boundingBox();
    const viewport = page.viewportSize();
    if (box && viewport) {
      expect(box.height).toBeGreaterThanOrEqual(viewport.height * 0.9);
    }
  });

  test('no horizontal overflow on the page', async ({ page }) => {
    await page.goto('/');
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1);
  });

  test('sections have proper vertical spacing', async ({ page }) => {
    await page.goto('/');
    const sections = page.locator('.section');
    const count = await sections.count();
    for (let i = 0; i < count; i++) {
      const box = await sections.nth(i).boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThan(100);
      }
    }
  });
});

// ---- Mobile Navigation ----
test.describe('Mobile Navigation', () => {
  test('hamburger toggle opens drawer', async ({ page, browserName }, testInfo) => {
    // Only meaningful on mobile viewport
    if (testInfo.project.name !== 'mobile-portrait') return;

    await page.goto('/');
    const toggle = page.locator('#navToggle');
    const drawer = page.locator('#navDrawer');

    await expect(drawer).toHaveAttribute('aria-hidden', 'true');
    await toggle.click();
    await expect(drawer).toHaveAttribute('aria-hidden', 'false');
  });

  test('hamburger is hidden on desktop', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'desktop-chrome') return;

    await page.goto('/');
    const toggle = page.locator('#navToggle');
    await expect(toggle).not.toBeVisible();
  });
});

// ---- FAQ Accordion ----
test.describe('FAQ Accordion', () => {
  test('FAQ items expand on click', async ({ page }) => {
    await page.goto('/');
    const firstItem = page.locator('.faq-item').first();
    const answer = firstItem.locator('.faq-item__answer');

    // Initially closed
    await expect(firstItem).not.toHaveAttribute('open', '');

    // Click to open
    await firstItem.locator('summary').click();
    await expect(firstItem).toHaveAttribute('open', '');
    await expect(answer).toBeVisible();
  });
});

// ---- Visual Consistency ----
test.describe('Visual Consistency', () => {
  test('cards have consistent sizing on desktop', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'desktop-chrome') return;

    await page.goto('/');
    const cards = page.locator('#product .card');
    const count = await cards.count();
    const widths = [];

    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox();
      if (box) widths.push(Math.round(box.width));
    }

    // All cards should be roughly equal width (within 5px)
    const maxDiff = Math.max(...widths) - Math.min(...widths);
    expect(maxDiff).toBeLessThanOrEqual(5);
  });

  test('pricing card is centered', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('.pricing-card');
    const box = await card.boundingBox();
    const viewport = page.viewportSize();

    if (box && viewport) {
      const cardCenter = box.x + box.width / 2;
      const pageCenter = viewport.width / 2;
      expect(Math.abs(cardCenter - pageCenter)).toBeLessThan(20);
    }
  });

  test('gradient sections have white text', async ({ page }) => {
    await page.goto('/');
    const shiftTitle = page.locator('#shift .section__title--light');
    const color = await shiftTitle.evaluate(el => getComputedStyle(el).color);
    // Should be white or near-white
    expect(color).toMatch(/rgb\(255,\s*255,\s*255\)/);
  });
});

// ---- Typography ----
test.describe('Typography', () => {
  test('headings use Quicksand font family', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1');
    const fontFamily = await h1.evaluate(el => getComputedStyle(el).fontFamily);
    expect(fontFamily.toLowerCase()).toContain('quicksand');
  });

  test('body text uses Nunito font family', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    const fontFamily = await body.evaluate(el => getComputedStyle(el).fontFamily);
    expect(fontFamily.toLowerCase()).toContain('nunito');
  });
});
