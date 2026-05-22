const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

// className maps to the global .badge-product-* colour rules in styles.css
const BADGES = {
  New: { label: 'New', className: 'badge-product-new' },
  'Best Seller': { label: 'Best Seller', className: 'badge-product-best-seller' },
  'Online Only': { label: 'Online Only', className: 'badge-product-online-only' },
  'Featured Product': { label: 'Featured Product', className: 'badge-product-featured' },
};

function createStarSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="12" height="12" aria-hidden="true"><path d="${STAR_PATH}"/></svg>`;
}

function createChevronSvg(direction = 'right') {
  const path = direction === 'left' ? 'M15 18l-6-6 6-6' : 'M9 6l6 6-6 6';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function getField(el, name) {
  return el.querySelector(`[data-aue-prop="${name}"]`);
}

function getText(el, name) {
  const field = getField(el, name);
  if (!field) return '';
  // UE stores select/reference values in data-aue-value; text fields use textContent
  return field.getAttribute('data-aue-value') || field.textContent?.trim() || '';
}

function getLink(el, name) {
  const field = getField(el, name);
  return field?.querySelector('a')?.href || field?.textContent?.trim() || '';
}

function getBadge(value) {
  return BADGES[value] || null;
}

function getCardImage(card) {
  const imageField = getField(card, 'image');

  let picture = imageField?.querySelector('picture') || card.querySelector('picture');

  if (!picture) {
    const imgEl = imageField?.querySelector('img') || card.querySelector('img');

    if (imgEl) {
      picture = document.createElement('picture');
      picture.append(imgEl);
    } else {
      // In UE a reference field can render as the <a> element itself.
      // Use getAttribute('href') — .href auto-expands "" to the page URL (truthy but wrong).
      const anchor = imageField?.tagName === 'A' ? imageField : imageField?.querySelector('a');
      const src =
        anchor?.getAttribute('href') ||
        imageField?.getAttribute('data-aue-value') ||
        imageField?.textContent?.trim() ||
        '';

      if (src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = getText(card, 'imageAlt') || anchor?.textContent?.trim() || '';
        img.loading = 'lazy';

        picture = document.createElement('picture');
        picture.append(img);
      }
    }
  }

  return picture;
}

function decorateCard(card) {
  // Prefer data-aue-prop fields (Universal Editor); fall back to row/cell structure (delivery).
  // Mirrors the same dual-mode approach used in product-card.js.
  const isUE = !!getField(card, 'content_name');

  let badge;
  let name;
  let nameType;
  let description;
  let rating;
  let ctaLabel;
  let picture;

  if (isUE) {
    badge = getText(card, 'content_badge');
    name = getText(card, 'content_name');
    nameType = getText(card, 'content_nameType') || 'h3';
    description = getText(card, 'content_description');
    rating = getText(card, 'content_rating');
    ctaLabel = getText(card, 'content_ctaLabel');
    picture = getCardImage(card);
  } else {
    // Delivery mode: same row/cell structure as product-card.
    // Row 0 cell — heading = product name, <p> before heading = badge value,
    //             <p> after heading = description / rating / ctaLabel in order.
    // Row 1 cell — image (<picture>, bare <img>, or <a href>).
    const rows = [...card.children];
    const contentCell = rows[0]?.children[0];
    const imageCell = rows[1]?.children[0];

    const headingEl = contentCell?.querySelector('h1,h2,h3,h4,h5,h6');
    const children = [...(contentCell?.children ?? [])];
    const headingIdx = headingEl ? children.indexOf(headingEl) : -1;
    const beforeH = (headingIdx > 0 ? children.slice(0, headingIdx) : []).filter(
      (el) => el.tagName === 'P'
    );
    const afterH = children
      .slice(headingIdx < 0 ? 0 : headingIdx + 1)
      .filter((el) => el.tagName === 'P');

    badge = beforeH[0]?.textContent.trim() || '';
    name = headingEl?.textContent.trim() || '';
    nameType = headingEl?.tagName.toLowerCase() || 'h3';
    description = afterH[0]?.textContent.trim() || '';
    rating = afterH[1]?.textContent.trim() || '';
    ctaLabel = afterH[2]?.textContent.trim() || '';

    let pic = imageCell?.querySelector('picture');
    if (!pic) {
      const imgEl = imageCell?.querySelector('img');
      if (imgEl) {
        pic = document.createElement('picture');
        pic.append(imgEl);
      } else {
        const anchor = imageCell?.querySelector('a');
        // Use getAttribute('href') — .href auto-expands "" to the page URL
        const src = anchor?.getAttribute('href') || imageCell?.textContent?.trim() || '';
        if (src) {
          const img = document.createElement('img');
          img.src = src;
          img.alt = anchor?.textContent?.trim() || '';
          img.loading = 'lazy';
          pic = document.createElement('picture');
          pic.append(img);
        }
      }
    }
    picture = pic;
  }

  const badgeData = getBadge(badge);

  const article = document.createElement('article');
  article.className = 'spc-inner';

  const imageBlock = document.createElement('div');
  imageBlock.className = 'spc-image-block';

  if (badgeData) {
    const badgeWrapper = document.createElement('div');
    badgeWrapper.className = 'badge-wrapper';

    const badgeEl = document.createElement('span');
    badgeEl.className = `badge ${badgeData.className}`;
    badgeEl.textContent = badgeData.label;

    badgeWrapper.append(badgeEl);
    imageBlock.append(badgeWrapper);
  }

  const media = document.createElement('div');
  media.className = 'spc-media';

  if (picture) {
    media.append(picture);
  }

  imageBlock.append(media);

  const content = document.createElement('div');
  content.className = 'spc-content';

  if (name) {
    const heading = document.createElement(nameType);
    heading.className = 'spc-name type-h5';
    heading.textContent = name;
    content.append(heading);
  }

  if (description) {
    const desc = document.createElement('p');
    desc.className = 'spc-description type-body-default-regular';
    desc.textContent = description;
    content.append(desc);
  }

  if (rating) {
    const pill = document.createElement('div');
    pill.className = 'spc-rating';
    pill.setAttribute('aria-label', `${rating} out of 5 stars`);

    const score = document.createElement('span');
    score.className = 'spc-rating-score type-body-small-semibold';
    score.textContent = rating;

    const stars = document.createElement('span');
    stars.className = 'spc-stars';
    stars.setAttribute('aria-hidden', 'true');
    stars.innerHTML = createStarSvg().repeat(5);

    pill.append(score, stars);
    content.append(pill);
  }

  if (ctaLabel) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'spc-cta secondary xsmall';
    button.textContent = ctaLabel;
    content.append(button);
  }

  article.append(imageBlock, content);

  card.classList.add('slider-product-card');
  card.replaceChildren(article);
}

export default function decorate(block) {
  const cards = [
    ...block.querySelectorAll('[data-aue-model="slider-product-card"], .slider-product-card'),
  ];

  cards.forEach(decorateCard);

  const shell = document.createElement('div');
  shell.className = 'ps-shell';

  const track = document.createElement('div');
  track.className = 'ps-track';

  cards.forEach((card) => track.append(card));
  shell.append(track);

  let activeIndex = 0;

  function goTo(index) {
    if (!cards.length) return;

    activeIndex = Math.max(0, Math.min(cards.length - 1, index));

    cards.forEach((card, i) => {
      card.classList.toggle('is-active', i === activeIndex);
    });

    const cardWidth = cards[0].offsetWidth || 306;
    const gap = 36;
    const offset = block.offsetWidth / 2 - cardWidth / 2 - activeIndex * (cardWidth + gap);

    track.style.transform = `translateX(${offset}px)`;
  }

  if (cards.length > 2) {
    shell.classList.add('is-slider');

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'ps-arrow ps-arrow-prev';
    prev.setAttribute('aria-label', 'Previous product');
    prev.innerHTML = createChevronSvg('left');

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'ps-arrow ps-arrow-next';
    next.setAttribute('aria-label', 'Next product');
    next.innerHTML = createChevronSvg('right');

    prev.addEventListener('click', () => goTo(activeIndex - 1));
    next.addEventListener('click', () => goTo(activeIndex + 1));

    shell.append(prev, next);
  }

  const sliderCtaLabel = getText(block, 'ctaLabel') || getText(block, 'ctaText');
  const sliderCtaHref = getLink(block, 'ctaLink');

  if (sliderCtaLabel && sliderCtaHref) {
    const cta = document.createElement('a');
    cta.className = 'ps-cta primary small';
    cta.href = sliderCtaHref;
    cta.innerHTML = `<span>${sliderCtaLabel}</span>${createChevronSvg('right')}`;
    shell.append(cta);
  }

  block.replaceChildren(shell);

  requestAnimationFrame(() => goTo(0));
}
