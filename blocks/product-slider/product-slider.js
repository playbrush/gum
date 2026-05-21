const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

function starSvg() {
  return `<svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true"><path d="${STAR_PATH}" fill="currentColor"></path></svg>`;
}

function readField(card, name) {
  const el = card.querySelector(`[data-aue-prop="${name}"]`);
  return el?.textContent?.trim() || '';
}

function readImage(card) {
  const imageProp = card.querySelector('[data-aue-prop="image"]');
  const picture = imageProp?.querySelector('picture');
  const img = imageProp?.querySelector('img');

  if (picture) return picture;
  if (img) return img;

  const src = imageProp?.textContent?.trim();
  if (!src) return null;

  const newImg = document.createElement('img');
  newImg.src = src;
  newImg.alt = readField(card, 'imageAlt');
  newImg.loading = 'lazy';
  return newImg;
}

function buildCard(card) {
  if (card.dataset.productSliderCardDecorated === 'true') return;

  const badge = readField(card, 'content_badge');
  const name = readField(card, 'content_name');
  const description = readField(card, 'content_description');
  const rating = readField(card, 'content_rating');
  const ctaLabel = readField(card, 'content_ctaLabel');
  const image = readImage(card);

  const article = document.createElement('article');
  article.className = 'spc-inner';

  article.innerHTML = `
    <div class="spc-image-block">
      ${badge ? `<div class="spc-badge type-body-small-medium">${badge}</div>` : ''}
      <div class="spc-media"></div>
    </div>
    <div class="spc-content">
      ${name ? `<h3 class="spc-name type-h5">${name}</h3>` : ''}
      ${description ? `<p class="spc-description type-body-default-regular">${description}</p>` : ''}
      ${
        rating
          ? `
        <div class="spc-rating" aria-label="${rating} out of 5 stars">
          <span class="spc-rating-score type-body-small-semibold">${rating}</span>
          <span class="spc-stars" aria-hidden="true">${starSvg().repeat(5)}</span>
        </div>
      `
          : ''
      }
      ${ctaLabel ? `<button type="button" class="spc-cta type-body-default-semibold">${ctaLabel}</button>` : ''}
    </div>
  `;

  if (image) {
    article.querySelector('.spc-media').append(image);
  }

  card.replaceChildren(article);
  card.classList.add('slider-product-card');
  card.dataset.productSliderCardDecorated = 'true';
}

export default function decorate(block) {
  const cards = [
    ...block.querySelectorAll('[data-aue-model="slider-product-card"], .slider-product-card'),
  ];

  cards.forEach(buildCard);

  const track = document.createElement('div');
  track.className = 'ps-track';

  cards.forEach((card) => track.append(card));

  block.replaceChildren(track);
}
