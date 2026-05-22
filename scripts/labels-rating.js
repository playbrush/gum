const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

const BADGE_TYPES = {
  product: {
    new: { label: 'New', className: 'badge-product-new' },
    bestseller: { label: 'Best Seller', className: 'badge-product-best-seller' },
    best: { label: 'Best Seller', className: 'badge-product-best-seller' },
    onlineonly: { label: 'Online Only', className: 'badge-product-online-only' },
    featured: { label: 'Featured Product', className: 'badge-product-featured' },
    featuredproduct: { label: 'Featured Product', className: 'badge-product-featured' },
    recommended: { label: 'Recommended', className: 'badge-product-recommended' },
  },
  subject: {
    advancedgumcare: {
      label: 'Advanced Gum Care',
      className: 'badge-subject-advanced-gum-care',
    },
    sensitive: { label: 'Sensitive Teeth', className: 'badge-subject-sensitive-teeth' },
    sensitiveteeth: { label: 'Sensitive Teeth', className: 'badge-subject-sensitive-teeth' },
  },
  special: {
    new: { label: 'New', className: 'badge-special badge-special-new' },
    bestseller: { label: 'Best Seller', className: 'badge-special badge-special-best-seller' },
    best: { label: 'Best Seller', className: 'badge-special badge-special-best-seller' },
    onlineonly: { label: 'Online Only', className: 'badge-special badge-special-online-only' },
    featured: { label: 'Featured Product', className: 'badge-special badge-special-featured' },
    featuredproduct: {
      label: 'Featured Product',
      className: 'badge-special badge-special-featured',
    },
  },
};

function normalizeBadgeValue(value) {
  return `${value || ''}`
    .trim()
    .replace(/^badge-product-/i, '')
    .replace(/^badge-special-/i, '')
    .replace(/^badge-subject-/i, '')
    .replace(/^badge-/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function createStarSvg() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('width', '12');
  svg.setAttribute('height', '12');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('rating-star');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', STAR_PATH);
  svg.append(path);

  return svg;
}

export function getBadgeData(value, variant = 'product') {
  return BADGE_TYPES[variant]?.[normalizeBadgeValue(value)] || null;
}

export function createBadge(value, variant = 'product') {
  const badgeData = getBadgeData(value, variant);
  if (!badgeData) return null;

  const badge = document.createElement('span');
  badge.className = `badge ${badgeData.className}`;
  badge.textContent = badgeData.label;
  return badge;
}

export function createBadgeWrapper(values, variant = 'product') {
  const badges = (Array.isArray(values) ? values : [values])
    .map((value) => createBadge(value, variant))
    .filter(Boolean);

  if (!badges.length) return null;

  const wrapper = document.createElement('div');
  wrapper.className = 'badge-wrapper';
  wrapper.append(...badges);
  return wrapper;
}

export function createRating(value) {
  const scoreValue = `${value || ''}`.trim();
  if (!scoreValue) return null;

  const rating = document.createElement('div');
  rating.className = 'rating';
  rating.setAttribute('aria-label', `Rated ${scoreValue} out of 5`);

  const score = document.createElement('span');
  score.className = 'rating-value';
  score.textContent = scoreValue;

  const stars = document.createElement('span');
  stars.className = 'rating-stars';
  stars.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < 5; i += 1) {
    stars.append(createStarSvg());
  }

  rating.append(score, stars);
  return rating;
}
