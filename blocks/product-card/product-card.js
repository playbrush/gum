import { createBadgeWrapper, createRating } from '../../scripts/labels-rating.js';

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
    const labelsEl = createBadgeWrapper(tags, 'product');
    content.append(labelsEl);
  }

  if (name) {
    const tag = headingEl?.tagName?.toLowerCase() || 'h3';
    const heading = document.createElement(tag);
    heading.className = 'product-card-name type-body-xl-medium';
    heading.textContent = name;
    content.append(heading);
  }

  if (price || rating) {
    const meta = document.createElement('div');
    meta.className = 'product-card-meta';

    if (price) {
      const priceEl = document.createElement('span');
      priceEl.className = 'product-card-price type-body-l-semibold';
      priceEl.textContent = price;
      meta.append(priceEl);
    }

    if (rating) {
      meta.append(createRating(rating));
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
      const label = document.createElement('span');
      label.textContent = 'Add to Cart';
      btn.append(label);
      buttons.append(btn);
    }

    if (buyInStore) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'link-text';
      btn.textContent = 'Buy in Store';
      buttons.append(btn);
    }

    bottom.append(buttons);
  }

  if (bottom.children.length) card.append(bottom);

  block.replaceChildren(card);
}
