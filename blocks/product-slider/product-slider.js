import { createBadge, createRating, getBadgeData } from '../../scripts/labels-rating.js';

const FIELD_ALIASES = {
  content_badge: ['content_badge', 'badge', 'label', 'content_label'],
  image: ['image', 'content_image', 'productImage', 'product_image'],
  decorativeImage: ['decorativeImage', 'rightSideImage', 'secondaryImage', 'lifestyleImage'],
};

function createChevronSvg(direction = 'right') {
  const path = direction === 'left' ? 'M15 18l-6-6 6-6' : 'M9 6l6 6-6 6';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function getField(el, name) {
  const names = FIELD_ALIASES[name] || [name];
  const exact = names
    .map((fieldName) => el.querySelector(`[data-aue-prop="${fieldName}"]`))
    .find(Boolean);

  if (exact) return exact;

  const normalizedNames = names.map((fieldName) => fieldName.toLowerCase());
  return (
    [...el.querySelectorAll('[data-aue-prop]')].find((field) => {
      const prop = field.getAttribute('data-aue-prop')?.toLowerCase();
      return normalizedNames.some(
        (fieldName) => prop === fieldName || prop.endsWith(`_${fieldName}`)
      );
    }) || null
  );
}

function getFieldValue(field) {
  if (!field) return '';
  const selectedOption = field.querySelector('option:checked');
  const select = field.tagName === 'SELECT' ? field : field.querySelector('select');

  return (
    select?.value ||
    selectedOption?.value ||
    selectedOption?.textContent?.trim() ||
    field.getAttribute('data-aue-value') ||
    field.getAttribute('value') ||
    field.getAttribute('href') ||
    field.getAttribute('src') ||
    field.textContent?.trim() ||
    ''
  );
}

function getText(el, name) {
  const field = getField(el, name);
  // UE stores select/reference values in data-aue-value; text fields use textContent
  return getFieldValue(field);
}

function getLink(el, name) {
  const field = getField(el, name);
  return field?.querySelector('a')?.href || field?.textContent?.trim() || '';
}

function getBadgeField(card) {
  return (
    getField(card, 'content_badge') ||
    [...card.querySelectorAll('[data-aue-label], [data-aue-prop]')].find((el) => {
      const label = el.getAttribute('data-aue-label')?.toLowerCase() || '';
      const prop = el.getAttribute('data-aue-prop')?.toLowerCase() || '';
      return label.includes('badge') || prop.includes('badge');
    }) ||
    null
  );
}

function getReferenceHref(el) {
  if (!el) return '';

  const anchor = el.tagName === 'A' ? el : el.querySelector('a[href]');
  const img = el.tagName === 'IMG' ? el : el.querySelector('img[src]');

  return (
    anchor?.getAttribute('href') ||
    img?.getAttribute('src') ||
    el.getAttribute('data-aue-value') ||
    el.textContent?.trim() ||
    ''
  );
}

function isImageReference(el) {
  const src = getReferenceHref(el);
  return /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(src) || src.includes('/content/dam/');
}

function createLiveBadgeWrapper(badgeField, initialValue) {
  const badgeWrapper = document.createElement('div');
  badgeWrapper.className = 'badge-wrapper';

  let badgeEl;

  const syncBadge = () => {
    const badgeValue = getFieldValue(badgeField) || initialValue;
    const nextBadge = createBadge(badgeValue, 'special') || createBadge('New', 'special');

    if (badgeEl) badgeEl.remove();

    badgeEl = nextBadge;

    if (!badgeEl) {
      badgeWrapper.hidden = true;
      return;
    }

    badgeWrapper.hidden = false;
    badgeWrapper.prepend(badgeEl);
  };

  syncBadge();

  if (badgeField) {
    badgeField.hidden = true;
    badgeWrapper.append(badgeField);

    const observer = new MutationObserver(syncBadge);
    observer.observe(badgeField, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });
  }

  return badgeWrapper;
}

function getCardImage(card, name = 'image', altName = 'imageAlt', allowGenericFallback = true) {
  const imageField =
    getField(card, name) ||
    (allowGenericFallback
      ? [...card.querySelectorAll('[data-aue-label], [data-aue-prop], a[href]')].find((el) => {
          const label = el.getAttribute('data-aue-label')?.toLowerCase() || '';
          return label.includes('image') || isImageReference(el);
        })
      : null);

  let picture =
    imageField?.querySelector('picture') ||
    (allowGenericFallback ? card.querySelector('picture') : null);

  if (!picture) {
    const imgEl =
      imageField?.querySelector('img') || (allowGenericFallback ? card.querySelector('img') : null);

    if (imgEl) {
      picture = document.createElement('picture');
      picture.append(imgEl);
    } else {
      const src = getReferenceHref(imageField);

      if (src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = getText(card, altName) || imageField?.textContent?.trim() || '';
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
  const badgeField = isUE ? getBadgeField(card) : null;
  const imageField = isUE ? getField(card, 'image') : null;

  let badge;
  let name;
  let nameType;
  let description;
  let rating;
  let ctaLabel;
  let picture;
  let decorativePicture;

  if (isUE) {
    badge = getFieldValue(badgeField) || 'New';
    name = getText(card, 'content_name');
    nameType = getText(card, 'content_nameType') || 'h3';
    description = getText(card, 'content_description');
    rating = getText(card, 'content_rating');
    ctaLabel = getText(card, 'content_ctaLabel');
    picture = getCardImage(card);
    decorativePicture = getCardImage(card, 'decorativeImage', 'decorativeImageAlt', false);
  } else {
    // Delivery mode: same row/cell structure as product-card.
    // Row 0 cell — heading = product name, <p> before heading = badge value,
    //             <p> after heading = description / rating / ctaLabel in order.
    // Row 1 cell — image (<picture>, bare <img>, or <a href>).
    const rows = [...card.children];
    const contentCell = rows[0]?.children[0];
    const imageCell = rows[1]?.children[0];
    const decorativeImageCell = rows[2]?.children[0];

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

    let decorativePic = decorativeImageCell?.querySelector('picture');
    if (!decorativePic) {
      const imgEl = decorativeImageCell?.querySelector('img');
      if (imgEl) {
        decorativePic = document.createElement('picture');
        decorativePic.append(imgEl);
      } else {
        const anchor = decorativeImageCell?.querySelector('a');
        const src = anchor?.getAttribute('href') || decorativeImageCell?.textContent?.trim() || '';
        if (src) {
          const img = document.createElement('img');
          img.src = src;
          img.alt = anchor?.textContent?.trim() || '';
          img.loading = 'lazy';
          decorativePic = document.createElement('picture');
          decorativePic.append(img);
        }
      }
    }
    decorativePicture = decorativePic;
  }

  const badgeData = getBadgeData(badge, 'special');

  const article = document.createElement('article');
  article.className = 'spc-inner';

  const imageBlock = document.createElement('div');
  imageBlock.className = 'spc-image-block';

  if (badgeData || badgeField) {
    imageBlock.append(createLiveBadgeWrapper(badgeField, badge));
  }

  const media = document.createElement('div');
  media.className = 'spc-media';

  if (picture) {
    media.append(picture);
  } else if (imageField) {
    // Preserve the live UE field node so AEM can still hydrate the image after decoration.
    media.append(imageField);
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
    content.append(createRating(rating));
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
  card.psDecorativePicture = decorativePicture;
  card.replaceChildren(article);
}

export default function decorate(block) {
  let cards = [
    ...block.querySelectorAll('[data-aue-model="slider-product-card"], .slider-product-card'),
  ];

  cards.forEach(decorateCard);

  const shell = document.createElement('div');
  shell.className = 'ps-shell';

  const track = document.createElement('div');
  track.className = 'ps-track';

  shell.append(track);

  const deco = document.createElement('div');
  deco.className = 'ps-deco';
  shell.append(deco);

  function render() {
    if (!cards.length) return;

    track.replaceChildren(...cards);

    cards.forEach((card, i) => {
      card.classList.toggle('is-active', i === 0);
    });

    deco.replaceChildren();
    const decorativePicture = cards[0]?.psDecorativePicture;
    deco.hidden = !decorativePicture;
    if (decorativePicture) {
      deco.append(decorativePicture);
    }
  }

  if (cards.length > 1) {
    shell.classList.add('is-slider');
    shell.classList.toggle('is-pair', cards.length === 2);

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

    prev.addEventListener('click', () => {
      cards = [cards.at(-1), ...cards.slice(0, -1)];
      render();
    });
    next.addEventListener('click', () => {
      cards = [...cards.slice(1), cards[0]];
      render();
    });

    shell.append(prev, next);
  }

  const sliderCtaLabel =
    getText(block, 'ctaLabel') || getText(block, 'ctaText') || 'Explore all products';
  const sliderCtaHref = getLink(block, 'ctaLink');

  if (sliderCtaLabel && sliderCtaHref) {
    const cta = document.createElement('a');
    cta.className = 'ps-cta primary small';
    cta.href = sliderCtaHref;
    cta.innerHTML = `<span>${sliderCtaLabel}</span><span class="ps-cta-icon">${createChevronSvg('right')}</span>`;
    shell.append(cta);
  }

  block.replaceChildren(shell);

  requestAnimationFrame(render);
}
