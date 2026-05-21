const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

function chevronSvg(direction) {
  const path = direction === 'left' ? 'M6 1L1 7l5 6' : 'M1 1l5 6-5 6';
  return `<svg viewBox="0 0 7 14" width="7" height="14" fill="none" aria-hidden="true"><path d="${path}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function starSvg() {
  return `<svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true"><path d="${STAR_PATH}" fill="currentColor"></path></svg>`;
}

function field(el, name) {
  return el.querySelector(`[data-aue-prop="${name}"]`);
}

function text(el, name) {
  return field(el, name)?.textContent?.trim() || '';
}

function imageFromEl(el, alt) {
  if (!el) return null;

  // If the element itself is the media element (data-aue-prop placed directly on picture/img)
  if (el.tagName === 'PICTURE' || el.tagName === 'IMG') return el;

  const picture = el.querySelector('picture');
  if (picture) return picture;

  const existingImg = el.querySelector('img');
  if (existingImg) return existingImg;

  const a = el.querySelector('a');
  // Prefer getAttribute so relative paths stay relative (author instance resolves them correctly)
  const src = a?.getAttribute('href') || a?.href || el.textContent.trim();
  if (!src) return null;

  const img = document.createElement('img');
  img.src = src;
  img.alt = alt || '';
  img.loading = 'lazy';
  return img;
}

function makeCard(card) {
  const badge = text(card, 'content_badge');
  const name = text(card, 'content_name');
  const desc = text(card, 'content_description');
  const rating = text(card, 'content_rating');
  const ctaLabel = text(card, 'content_ctaLabel');

  // Move the ENTIRE data-aue-prop="image" wrapper into spc-media.
  // Keeping the wrapper in the DOM (not just extracting its contents) ensures the
  // Universal Editor can still inject the image into it after decoration runs.
  const imageFieldEl = field(card, 'image');
  // Delivery mode: picture or img rendered directly in the card row structure
  const fallbackMedia = !imageFieldEl ? card.querySelector('picture, img') : null;

  const article = document.createElement('article');
  article.className = 'spc-inner';

  article.innerHTML = `
    <div class="spc-image-block">
      <div class="spc-badge type-body-small-medium">${badge || ''}</div>
      <div class="spc-media"></div>
    </div>
    <div class="spc-content">
      ${name ? `<h3 class="spc-name type-h5">${name}</h3>` : ''}
      ${desc ? `<p class="spc-description type-body-default-regular">${desc}</p>` : ''}
      ${
        rating
          ? `<div class="spc-rating" aria-label="${rating} out of 5 stars">
               <span class="spc-rating-score type-body-small-semibold">${rating}</span>
               <span class="spc-stars">${starSvg().repeat(5)}</span>
             </div>`
          : ''
      }
      ${ctaLabel ? `<button type="button" class="spc-card-cta type-body-default-semibold">${ctaLabel}</button>` : ''}
    </div>
  `;

  const mediaSlot = article.querySelector('.spc-media');
  if (imageFieldEl) {
    mediaSlot.append(imageFieldEl);
  } else if (fallbackMedia) {
    mediaSlot.append(fallbackMedia);
  }

  card.classList.add('slider-product-card');
  card.replaceChildren(article);
}

export default function decorate(block) {
  const cards = [
    ...block.querySelectorAll('[data-aue-model="slider-product-card"], .slider-product-card'),
  ];

  cards.forEach(makeCard);

  const shell = document.createElement('div');
  shell.className = 'ps-shell';

  const track = document.createElement('div');
  track.className = 'ps-track';
  cards.forEach((card) => track.append(card));
  shell.append(track);

  let activeIndex = 0;

  function goTo(index) {
    activeIndex = Math.max(0, Math.min(cards.length - 1, index));
    cards.forEach((card, i) => card.classList.toggle('is-active', i === activeIndex));

    const blockWidth = block.offsetWidth || 1200;
    const cardWidth = cards[0]?.offsetWidth || 306;
    // Translate the track so the active card is horizontally centered in the block
    const offset = blockWidth / 2 - cardWidth / 2 - activeIndex * cardWidth;
    track.style.transform = `translateX(${offset}px)`;
  }

  if (cards.length > 1) {
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'ps-arrow ps-arrow-prev';
    prev.setAttribute('aria-label', 'Previous product');
    prev.innerHTML = chevronSvg('left');
    prev.addEventListener('click', () => goTo(activeIndex - 1));

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'ps-arrow ps-arrow-next';
    next.setAttribute('aria-label', 'Next product');
    next.innerHTML = chevronSvg('right');
    next.addEventListener('click', () => goTo(activeIndex + 1));

    shell.append(prev, next);
  }

  // CTA button with chevron icon
  const ctaLabel = text(block, 'ctaLabel');
  const ctaLinkEl = field(block, 'ctaLink');
  const ctaHref =
    ctaLinkEl?.querySelector('a')?.href ||
    ctaLinkEl?.querySelector('a')?.getAttribute('href') ||
    text(block, 'ctaLink');

  // Decorative photo (right-side absolute image)
  const decoEl = field(block, 'decorativeImage');
  const decoMedia = decoEl ? imageFromEl(decoEl, text(block, 'decorativeImageAlt')) : null;

  block.replaceChildren(shell);

  if (ctaLabel && ctaHref) {
    const cta = document.createElement('a');
    cta.className = 'ps-cta type-body-default-semibold';
    cta.href = ctaHref;
    cta.innerHTML = `<span class="ps-cta-label">${ctaLabel}</span>
      <span class="ps-cta-icon" aria-hidden="true">${chevronSvg('right')}</span>`;
    block.append(cta);
  }

  if (decoMedia) {
    const deco = document.createElement('div');
    deco.className = 'ps-deco';
    deco.append(decoMedia);
    block.append(deco);
  }

  // Defer goTo(0) so offsetWidth values are available after layout
  requestAnimationFrame(() => goTo(0));
}
