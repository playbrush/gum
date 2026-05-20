import { createOptimizedPicture } from '../../scripts/aem.js';

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

const CHEVRON_PATH = 'M1 1l6 6-6 6';

function createStarSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="12" height="12" fill="var(--color-pink,#ea0089)" aria-hidden="true"><path d="${STAR_PATH}"/></svg>`;
}

function createChevronSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 14" width="8" height="14" aria-hidden="true" focusable="false"><path d="${CHEVRON_PATH}" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function normalizeBadgeClass(tag) {
  return tag.toLowerCase().trim().replace(/\s+/g, '-');
}

export default function decorate(block) {
  if (block.dataset.aueResource) return;

  const rows = [...block.children];
  const getCell = (row, idx = 0) => row?.children?.[idx];
  const getText = (el) => el?.textContent?.trim() || '';

  const [tagsRow, nameRow, priceRow, ratingRow, imageRow, primaryRow, secondaryRow] = rows;

  const tags = getText(getCell(tagsRow))
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const name = getText(getCell(nameRow));
  const price = getText(getCell(priceRow));
  const rating = getText(getCell(ratingRow));
  const imgEl = getCell(imageRow)?.querySelector('picture, img');
  const primaryLink = getCell(primaryRow)?.querySelector('a');
  const secondaryLink = getCell(secondaryRow)?.querySelector('a');

  // ── Article card ────────────────────────────────────────────────────────
  const card = document.createElement('article');
  card.className = 'product-card-inner';

  // ── Content (top) ───────────────────────────────────────────────────────
  const content = document.createElement('div');
  content.className = 'product-card-content';

  if (tags.length) {
    const labelsEl = document.createElement('div');
    labelsEl.className = 'product-card-labels';
    tags.forEach((tag) => {
      const badge = document.createElement('span');
      badge.className = `product-card-badge product-card-badge--${normalizeBadgeClass(tag)}`;
      badge.textContent = tag;
      labelsEl.append(badge);
    });
    content.append(labelsEl);
  }

  if (name) {
    const heading = document.createElement('h3');
    heading.className = 'product-card-name';
    heading.textContent = name;
    content.append(heading);
  }

  if (price || rating) {
    const meta = document.createElement('div');
    meta.className = 'product-card-meta';

    if (price) {
      const priceEl = document.createElement('span');
      priceEl.className = 'product-card-price';
      priceEl.textContent = price;
      meta.append(priceEl);
    }

    if (rating) {
      const pill = document.createElement('div');
      pill.className = 'product-card-rating';
      pill.setAttribute('aria-label', `${rating} out of 5 stars`);

      const score = document.createElement('span');
      score.className = 'product-card-rating-score';
      score.setAttribute('aria-hidden', 'true');
      score.textContent = rating;

      const stars = document.createElement('span');
      stars.className = 'product-card-stars';
      stars.setAttribute('aria-hidden', 'true');
      stars.innerHTML = createStarSvg().repeat(5);

      pill.append(score, stars);
      meta.append(pill);
    }

    content.append(meta);
  }

  card.append(content);

  // ── Bottom (image + buttons) ─────────────────────────────────────────────
  const bottom = document.createElement('div');
  bottom.className = 'product-card-bottom';

  if (imgEl) {
    const media = document.createElement('div');
    media.className = 'product-card-media';
    const img = imgEl.tagName === 'IMG' ? imgEl : imgEl.querySelector('img');
    if (img) {
      media.append(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '600' }]));
    }
    bottom.append(media);
  }

  if (primaryLink || secondaryLink) {
    const buttons = document.createElement('div');
    buttons.className = 'product-card-buttons';

    if (primaryLink) {
      const btn = document.createElement('a');
      btn.href = primaryLink.href;
      btn.className = 'product-card-btn-primary';
      btn.textContent = primaryLink.textContent.trim() || 'Add to cart';
      buttons.append(btn);
    }

    if (secondaryLink) {
      const link = document.createElement('a');
      link.href = secondaryLink.href;
      link.className = 'product-card-btn-secondary';

      const span = document.createElement('span');
      span.textContent = secondaryLink.textContent.trim() || 'Buy in store';

      const chevron = document.createElement('span');
      chevron.className = 'product-card-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.innerHTML = createChevronSvg();

      link.append(span, chevron);
      buttons.append(link);
    }

    bottom.append(buttons);
  }

  if (bottom.children.length) card.append(bottom);

  block.replaceChildren(card);
}
