const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

function createStarSvg() {
  return `
    <svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true">
      <path d="${STAR_PATH}" fill="currentColor"></path>
    </svg>
  `;
}

function getCell(row, idx = 0) {
  return row?.children?.[idx];
}

function buildCard(card) {
  if (card.dataset.productSliderCardDecorated === 'true') return;

  const rows = [...card.children];
  const [contentRow, imageRow] = rows;

  const contentCell = getCell(contentRow);
  const imageCell = getCell(imageRow);

  const heading = contentCell?.querySelector('h1,h2,h3,h4,h5,h6');
  const paragraphs = [...(contentCell?.querySelectorAll('p') || [])];

  const badge = paragraphs[0]?.textContent.trim() || '';
  const title = heading?.textContent.trim() || '';
  const description = paragraphs[1]?.textContent.trim() || '';
  const rating = paragraphs[2]?.textContent.trim() || '';
  const ctaText = paragraphs[3]?.textContent.trim() || '';

  const picture = imageCell?.querySelector('picture');
  const img = imageCell?.querySelector('img');

  const inner = document.createElement('article');
  inner.className = 'spc-inner';

  const imageBlock = document.createElement('div');
  imageBlock.className = 'spc-image-block';

  if (badge) {
    const badgeEl = document.createElement('div');
    badgeEl.className = 'spc-badge type-body-small-medium';
    badgeEl.textContent = badge;
    imageBlock.append(badgeEl);
  }

  if (picture || img) {
    const media = document.createElement('div');
    media.className = 'spc-media';
    media.append(picture || img);
    imageBlock.append(media);
  }

  const content = document.createElement('div');
  content.className = 'spc-content';

  if (title) {
    const titleEl = document.createElement(heading?.tagName?.toLowerCase() || 'h3');
    titleEl.className = 'spc-name type-h5';
    titleEl.textContent = title;
    content.append(titleEl);
  }

  if (description) {
    const desc = document.createElement('p');
    desc.className = 'spc-description type-body-default-regular';
    desc.textContent = description;
    content.append(desc);
  }

  if (rating) {
    const ratingEl = document.createElement('div');
    ratingEl.className = 'spc-rating';
    ratingEl.setAttribute('aria-label', `${rating} out of 5 stars`);
    ratingEl.innerHTML = `
      <span class="spc-rating-score type-body-small-semibold">${rating}</span>
      <span class="spc-stars" aria-hidden="true">${createStarSvg().repeat(5)}</span>
    `;
    content.append(ratingEl);
  }

  if (ctaText) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'spc-cta type-body-default-semibold';
    button.textContent = ctaText;
    content.append(button);
  }

  inner.append(imageBlock, content);

  card.textContent = '';
  card.append(inner);
  card.dataset.productSliderCardDecorated = 'true';
}

export default function decorate(block) {
  const cards = [
    ...block.querySelectorAll('.slider-product-card, [data-aue-model="slider-product-card"]'),
  ];

  cards.forEach((card) => {
    card.classList.add('slider-product-card');
    buildCard(card);
  });

  if (block.querySelector(':scope > .ps-track')) return;

  const track = document.createElement('div');
  track.className = 'ps-track';

  cards.forEach((card) => track.append(card));

  block.textContent = '';
  block.append(track);
}
