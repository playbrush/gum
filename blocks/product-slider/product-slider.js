const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

function starSvg() {
  return `<svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true"><path d="${STAR_PATH}" fill="currentColor"></path></svg>`;
}

function field(card, name) {
  return card.querySelector(`[data-aue-prop="${name}"]`);
}

function text(card, name) {
  return field(card, name)?.textContent?.trim() || '';
}

function image(card) {
  const el = field(card, 'image');
  if (!el) return null;

  const picture = el.querySelector('picture');
  if (picture) return picture;

  const existingImg = el.querySelector('img');
  if (existingImg) return existingImg;

  const a = el.querySelector('a');
  const src = a?.href || el.textContent.trim();

  if (!src) return null;

  const img = document.createElement('img');
  img.src = src;
  img.alt = text(card, 'imageAlt');
  img.loading = 'lazy';

  return img;
}

function makeCard(card) {
  const badge = text(card, 'content_badge');
  const name = text(card, 'content_name');
  const desc = text(card, 'content_description');
  const rating = text(card, 'content_rating');
  const ctaLabel = text(card, 'content_ctaLabel');
  const media = image(card);

  const article = document.createElement('article');
  article.className = 'spc-inner';

  article.innerHTML = `
    <div class="spc-image-block">
      ${badge ? `<div class="spc-badge type-body-small-medium">${badge}</div>` : ''}
      <div class="spc-media"></div>
    </div>

    <div class="spc-content">
      ${name ? `<h3 class="spc-name type-h5">${name}</h3>` : ''}
      ${desc ? `<p class="spc-description type-body-default-regular">${desc}</p>` : ''}
      ${
        rating
          ? `
        <div class="spc-rating" aria-label="${rating} out of 5 stars">
          <span class="spc-rating-score type-body-small-semibold">${rating}</span>
          <span class="spc-stars">${starSvg().repeat(5)}</span>
        </div>
      `
          : ''
      }
      ${ctaLabel ? `<button type="button" class="spc-card-cta type-body-default-semibold">${ctaLabel}</button>` : ''}
    </div>
  `;

  if (media) article.querySelector('.spc-media').append(media);

  card.classList.add('slider-product-card');
  card.replaceChildren(article);
}

function scroll(track, direction) {
  const card = track.querySelector('.slider-product-card');
  const amount = card ? card.offsetWidth + 24 : 320;
  track.scrollBy({ left: amount * direction, behavior: 'smooth' });
}

export default function decorate(block) {
  const cards = [
    ...block.querySelectorAll('[data-aue-model="slider-product-card"], .slider-product-card'),
  ];

  cards.forEach(makeCard);

  const slider = document.createElement('div');
  slider.className = 'ps-shell';

  const track = document.createElement('div');
  track.className = 'ps-track';

  cards.forEach((card) => track.append(card));
  slider.append(track);

  if (cards.length > 2) {
    slider.classList.add('is-slider');

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'ps-arrow ps-arrow-prev';
    prev.setAttribute('aria-label', 'Previous product');
    prev.innerHTML = '‹';

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'ps-arrow ps-arrow-next';
    next.setAttribute('aria-label', 'Next product');
    next.innerHTML = '›';

    prev.addEventListener('click', () => scroll(track, -1));
    next.addEventListener('click', () => scroll(track, 1));

    slider.append(prev, next);
  }

  const ctaLabel = text(block, 'ctaText') || text(block, 'ctaLabel');
  const ctaLink = text(block, 'ctaLink');

  if (ctaLabel && ctaLink) {
    const cta = document.createElement('a');
    cta.className = 'ps-cta type-body-default-semibold';
    cta.href = ctaLink;
    cta.textContent = ctaLabel;
    slider.append(cta);
  }

  block.replaceChildren(slider);
}
