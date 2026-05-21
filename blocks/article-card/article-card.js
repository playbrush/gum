const CLOCK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="var(--icon-primary, #006341)" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="7.5"/><polyline points="9,5 9,9 11.5,11.5"/></svg>';

// Chevron-in-circle: Large (61px — from /icons/chevron-large.svg)
const CHEVRON_LARGE =
  '<svg width="61" height="61" viewBox="0 0 61 61" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="61" height="61" rx="30.5" fill="#154734"/><path d="M25.4243 18.4243C26.1565 17.6921 27.3434 17.6921 28.0757 18.4243L39.3257 29.6743C40.0579 30.4065 40.0579 31.5934 39.3257 32.3257L28.0757 43.5757C27.3434 44.3079 26.1565 44.3079 25.4243 43.5757C24.6921 42.8434 24.6921 41.6565 25.4243 40.9243L35.3486 31L25.4243 21.0757C24.6921 20.3434 24.6921 19.1565 25.4243 18.4243Z" fill="#00EA8B"/></svg>';

// Chevron-in-circle: Small (30px — from /icons/chevron.svg)
const CHEVRON_SMALL =
  '<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="30" height="30" rx="15" fill="#154734"/><path d="M12.293 8.29295C12.6835 7.90243 13.3165 7.90243 13.707 8.29295L19.707 14.293C20.0975 14.6835 20.0975 15.3165 19.707 15.707L13.707 21.707C13.3165 22.0975 12.6835 22.0975 12.293 21.707C11.9024 21.3165 11.9024 20.6835 12.293 20.293L17.5859 15L12.293 9.70702C11.9024 9.31649 11.9024 8.68348 12.293 8.29295Z" fill="#00EA8B"/></svg>';

export default function decorate(block) {
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
