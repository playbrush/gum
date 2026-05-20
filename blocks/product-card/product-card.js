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
  const rows = [...block.children];
  const getCell = (row, idx = 0) => row?.children?.[idx];

  // 2 rows via element grouping:
  // Row 0: content group (badges <p>, name <h2-h4> via nameType, price <p>, rating <p>, addToCart <p>, buyInStore <p>)
  // Row 1: image (picture, with imageAlt collapsed)
  const [contentRow, imageRow] = rows;

  const contentCell = getCell(contentRow);
  const headingEl = contentCell?.querySelector('h2,h3,h4');
  const contentChildren = [...(contentCell?.children ?? [])];
  const headingIdx = headingEl ? contentChildren.indexOf(headingEl) : -1;
  const beforeHeading = (headingIdx >= 0 ? contentChildren.slice(0, headingIdx) : []).filter(
    (c) => c.tagName === 'P'
  );
  const afterHeading = (
    headingIdx >= 0 ? contentChildren.slice(headingIdx + 1) : contentChildren
  ).filter((c) => c.tagName === 'P');

  // Boolean badge fields: content_isNew (index 0), content_isBestSeller (index 1)
  const BADGE_LABELS = ['New', 'Best Seller'];
  const tags = beforeHeading
    .slice(0, BADGE_LABELS.length)
    .map((el, i) => {
      const v = el.textContent.trim().toLowerCase();
      return v === 'true' || v === 'on' ? BADGE_LABELS[i] : null;
    })
    .filter(Boolean);
  const name = headingEl?.textContent.trim() || '';
  const price = afterHeading[0]?.textContent.trim() || '';
  const rating = afterHeading[1]?.textContent.trim() || '';
  const isTrue = (el) => {
    const v = el?.textContent.trim().toLowerCase();
    return v === 'true' || v === 'on';
  };
  const addToCart = isTrue(afterHeading[2]);
  const buyInStore = isTrue(afterHeading[3]);

  // Image: on live delivery the reference field renders as <picture>; move it directly.
  // In UE the reference renders as <a href="url"> — create a plain <img> from the full URL.
  let picture = getCell(imageRow)?.querySelector('picture');
  if (!picture) {
    const imgCell = getCell(imageRow);
    const imgEl = imgCell?.querySelector('img');
    if (imgEl) {
      // bare <img> without <picture> wrapper — wrap it
      picture = document.createElement('picture');
      picture.append(imgEl);
    } else {
      const anchor = imgCell?.querySelector('a');
      const src = anchor?.href || imgCell?.textContent?.trim() || '';
      if (src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = anchor?.textContent?.trim() || '';
        img.loading = 'lazy';
        picture = document.createElement('picture');
        picture.append(img);
      }
    }
  }

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
      badge.className = `product-card-badge product-card-badge-${normalizeBadgeClass(tag)}`;
      badge.textContent = tag;
      labelsEl.append(badge);
    });
    content.append(labelsEl);
  }

  if (name) {
    const tag = headingEl?.tagName?.toLowerCase() || 'h3';
    const heading = document.createElement(tag);
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

  if (picture) {
    const media = document.createElement('div');
    media.className = 'product-card-media';
    media.append(picture);
    bottom.append(media);
  }

  if (addToCart || buyInStore) {
    const buttons = document.createElement('div');
    buttons.className = 'product-card-buttons';

    if (addToCart) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'product-card-btn-primary';
      btn.textContent = 'Add to Cart';
      buttons.append(btn);
    }

    if (buyInStore) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'product-card-btn-secondary';

      const span = document.createElement('span');
      span.textContent = 'Buy in Store';

      const chevron = document.createElement('span');
      chevron.className = 'product-card-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.innerHTML = createChevronSvg();

      btn.append(span, chevron);
      buttons.append(btn);
    }

    bottom.append(buttons);
  }

  if (bottom.children.length) card.append(bottom);

  block.replaceChildren(card);
}
