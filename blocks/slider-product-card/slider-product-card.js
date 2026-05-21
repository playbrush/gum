const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

function createStarSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="12" height="12" fill="var(--color-pink,#ea0089)" aria-hidden="true"><path d="${STAR_PATH}"/></svg>`;
}

export default function decorate(block) {
  const rows = [...block.children];
  const getCell = (row, idx = 0) => row?.children?.[idx];

  // Expected table structure (2 rows):
  //   Row 0 – content cell: badge (p), name heading (h2-h4 via nameType),
  //                          description (p), rating (p), ctaLabel (p, optional)
  //   Row 1 – image cell:   picture / img / anchor
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

  const badge = beforeHeading[0]?.textContent.trim() || '';
  const nameText = headingEl?.textContent.trim() || '';
  const nameTag = headingEl?.tagName?.toLowerCase() || 'h3';
  const description = afterHeading[0]?.textContent.trim() || '';
  const ratingScore = afterHeading[1]?.textContent.trim() || '';
  const ctaLabel = afterHeading[2]?.textContent.trim() || '';

  // Image: prefer <picture>, fall back to bare <img> or anchor href.
  let picture = getCell(imageRow)?.querySelector('picture');
  if (!picture) {
    const imgCell = getCell(imageRow);
    const imgEl = imgCell?.querySelector('img');
    if (imgEl) {
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

  // ── Build DOM ────────────────────────────────────────────────────────────
  const inner = document.createElement('article');
  inner.className = 'spc-inner';

  // ── Image block (badge + product image) ──────────────────────────────────
  const imageBlock = document.createElement('div');
  imageBlock.className = 'spc-image-block';

  // Special Product Type Badge — full-width bar, centered label
  const badgeEl = document.createElement('div');
  badgeEl.className = 'spc-badge type-body-small-medium';
  badgeEl.textContent = badge;
  imageBlock.append(badgeEl);

  if (picture) {
    const media = document.createElement('div');
    media.className = 'spc-media';
    media.append(picture);
    imageBlock.append(media);
  }

  inner.append(imageBlock);

  // ── Content block ─────────────────────────────────────────────────────────
  const content = document.createElement('div');
  content.className = 'spc-content';

  if (nameText) {
    const heading = document.createElement(nameTag);
    heading.className = 'spc-name type-h5';
    heading.textContent = nameText;
    content.append(heading);
  }

  if (description) {
    const desc = document.createElement('p');
    desc.className = 'spc-description type-body-default-regular';
    desc.textContent = description;
    content.append(desc);
  }

  if (ratingScore) {
    const ratingPill = document.createElement('div');
    ratingPill.className = 'spc-rating';
    ratingPill.setAttribute('aria-label', `${ratingScore} out of 5 stars`);

    const score = document.createElement('span');
    score.className = 'spc-rating-score type-body-small-semibold';
    score.setAttribute('aria-hidden', 'true');
    score.textContent = ratingScore;

    const stars = document.createElement('span');
    stars.className = 'spc-stars';
    stars.setAttribute('aria-hidden', 'true');
    stars.innerHTML = createStarSvg().repeat(5);

    ratingPill.append(score, stars);
    content.append(ratingPill);
  }

  // CTA button — hidden by default, shown on hover via CSS
  if (ctaLabel) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'spc-cta type-body-default-semibold';
    btn.textContent = ctaLabel;
    content.append(btn);
  }

  inner.append(content);
  block.replaceChildren(inner);
}
