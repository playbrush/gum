const CLOCK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="7.5"/><polyline points="9,5 9,9 11.5,11.5"/></svg>';

export default function decorate(block) {
  const rows = [...block.children];
  const getCell = (row, idx = 0) => row?.children?.[idx];

  // Expected table structure (2 rows):
  //   Row 0 – content: articleType (p), readTime (p), heading (h2/h3), body (p), link (p)
  //   Row 1 – image:   picture / img / anchor
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

  const articleType = beforeHeading[0]?.textContent.trim() || '';
  const readTime = beforeHeading[1]?.textContent.trim() || '';
  const titleText = headingEl?.textContent.trim() || '';
  const titleTag = headingEl?.tagName?.toLowerCase() || 'h3';
  const body = afterHeading[0]?.textContent.trim() || '';

  // Link: authored as a URL in the paragraph after body
  const rawLink =
    afterHeading[1]?.querySelector('a')?.href || afterHeading[1]?.textContent?.trim() || '';
  const link = /^(https?:\/\/|\/)/.test(rawLink) ? rawLink : '';

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
  inner.className = 'aic-inner';

  // Image
  if (picture) {
    const media = document.createElement('div');
    media.className = 'aic-media';
    media.append(picture);
    inner.append(media);
  }

  // Content
  const content = document.createElement('div');
  content.className = 'aic-content';

  // Eyebrow (article type + read time)
  if (articleType || readTime) {
    const eyebrow = document.createElement('div');
    eyebrow.className = 'aic-eyebrow';

    if (articleType) {
      const typeSpan = document.createElement('span');
      typeSpan.className = 'aic-eyebrow-type';
      typeSpan.textContent = articleType;
      eyebrow.append(typeSpan);
    }

    if (articleType && readTime) {
      const sep = document.createElement('span');
      sep.className = 'aic-eyebrow-sep';
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = '•';
      eyebrow.append(sep);
    }

    if (readTime) {
      const timeEl = document.createElement('span');
      timeEl.className = 'aic-eyebrow-time';
      const clock = document.createElement('span');
      clock.innerHTML = CLOCK_SVG;
      timeEl.append(clock, readTime);
      eyebrow.append(timeEl);
    }

    content.append(eyebrow);
  }

  // Headline
  if (titleText) {
    const heading = document.createElement(titleTag);
    heading.className = 'aic-title';
    heading.textContent = titleText;
    content.append(heading);
  }

  // Body copy
  if (body) {
    const bodyEl = document.createElement('p');
    bodyEl.className = 'aic-body';
    bodyEl.textContent = body;
    content.append(bodyEl);
  }

  inner.append(content);

  // Wrap entire card in link when URL is provided
  if (link) {
    const a = document.createElement('a');
    a.href = link;
    a.className = 'aic-link';
    a.setAttribute('aria-label', titleText);
    a.append(inner);
    block.replaceChildren(a);
  } else {
    block.replaceChildren(inner);
  }
}
