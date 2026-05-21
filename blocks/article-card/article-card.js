const CLOCK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="7.5"/><polyline points="9,5 9,9 11.5,11.5"/></svg>';

// Chevron-in-circle: Large (Default size — 61px total: 8px pad + 45px icon + 8px pad)
const CHEVRON_LARGE =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 61 61" width="61" height="61" aria-hidden="true"><circle cx="30.5" cy="30.5" r="30.5" fill="var(--button-primary, #154734)"/><polyline points="24,20 37,30.5 24,41" fill="none" stroke="var(--button-fill-primary, #a5dc43)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Chevron-in-circle: Small (Mini size — 30px total: 3px pad + 24px icon + 3px pad)
const CHEVRON_SMALL =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30" aria-hidden="true"><circle cx="15" cy="15" r="15" fill="var(--button-primary, #154734)"/><polyline points="11.5,9 19,15 11.5,21" fill="none" stroke="var(--button-fill-primary, #a5dc43)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export default function decorate(block) {
  if (block.dataset.aueResource) return;

  const isMini = block.classList.contains('mini');
  const contentCell = block.children[0]?.children[0];

  const headingEl = contentCell?.querySelector('h2,h3,h4');
  const contentChildren = [...(contentCell?.children ?? [])];
  const headingIdx = headingEl ? contentChildren.indexOf(headingEl) : -1;

  const beforeHeading = (headingIdx >= 0 ? contentChildren.slice(0, headingIdx) : []).filter(
    (c) => c.tagName === 'P'
  );
  const afterHeading = (
    headingIdx >= 0 ? contentChildren.slice(headingIdx + 1) : contentChildren
  ).filter((c) => c.tagName === 'P');

  const tag = !isMini ? beforeHeading[0]?.textContent.trim() || '' : '';
  const titleText = headingEl?.textContent.trim() || '';
  const titleTag = headingEl?.tagName?.toLowerCase() || 'h3';

  // If 2+ paragraphs follow the heading, the first is readTime and second is the link.
  // If only 1 follows, it is the link.
  const readTime =
    !isMini && afterHeading.length >= 2 ? afterHeading[0]?.textContent.trim() || '' : '';
  const linkP = afterHeading.length >= 2 ? afterHeading[1] : afterHeading[0];
  const rawLink = linkP?.querySelector('a')?.href || linkP?.textContent?.trim() || '';
  const link = /^(https?:\/\/|\/)/.test(rawLink) ? rawLink : '';

  // ── Build DOM ────────────────────────────────────────────────────────────
  const inner = document.createElement('div');
  inner.className = 'ac-inner';

  // Chevron-in-circle (decorative)
  const chevron = document.createElement('div');
  chevron.className = 'ac-chevron';
  chevron.setAttribute('aria-hidden', 'true');
  chevron.innerHTML = isMini ? CHEVRON_SMALL : CHEVRON_LARGE;
  inner.append(chevron);

  // Content area
  const content = document.createElement('div');
  content.className = 'ac-content';

  if (!isMini && tag) {
    const tagEl = document.createElement('p');
    tagEl.className = 'ac-tag';
    tagEl.textContent = tag;
    content.append(tagEl);
  }

  if (titleText) {
    const titleEl = document.createElement(titleTag);
    titleEl.className = 'ac-title';
    titleEl.textContent = titleText;
    content.append(titleEl);
  }

  if (!isMini && readTime) {
    const readTimeEl = document.createElement('div');
    readTimeEl.className = 'ac-readtime';
    readTimeEl.innerHTML = `${CLOCK_SVG}<p>${readTime}</p>`;
    content.append(readTimeEl);
  }

  inner.append(content);

  block.innerHTML = '';

  if (link) {
    const a = document.createElement('a');
    a.className = 'ac-link';
    a.href = link;
    a.setAttribute('aria-label', titleText);
    a.append(inner);
    block.append(a);
  } else {
    // No link — apply hover class directly to inner so hover CSS still works
    inner.classList.add('ac-link');
    block.append(inner);
  }
}
