import { decorateIcons } from '../../scripts/aem.js';

function normalizeKey(value) {
  return (value || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-');
}

function getCellText(cell) {
  return cell?.textContent?.trim() || '';
}

function getCellLink(cell) {
  const link = cell?.querySelector('a');
  return link?.href || '';
}

function buildNavigationMarkupFromRows(block) {
  if (block.querySelector(':scope > ul')) return;

  const rows = [...block.children].filter((row) => row.tagName === 'DIV');
  if (!rows.length) return;

  const items = rows
    .map((row, index) => {
      const cols = [...row.children];
      const label = getCellText(cols[0]);
      const link = getCellLink(cols[1]);
      const parent = getCellText(cols[2]);
      const icon = getCellText(cols[3]);
      if (!label || !link) return null;

      return {
        id: `${normalizeKey(label)}-${index}`,
        label,
        link,
        parent: normalizeKey(parent),
        icon,
        children: [],
      };
    })
    .filter(Boolean);

  if (!items.length) return;

  const byLabel = new Map();
  items.forEach((item) => {
    if (!byLabel.has(normalizeKey(item.label))) byLabel.set(normalizeKey(item.label), item);
  });

  const roots = [];
  items.forEach((item) => {
    const parentItem = item.parent ? byLabel.get(item.parent) : null;
    if (parentItem) parentItem.children.push(item);
    else roots.push(item);
  });

  const renderItems = (collection, isChild = false) => {
    const ul = document.createElement('ul');
    collection.forEach((item) => {
      const li = document.createElement('li');
      const anchor = document.createElement('a');
      anchor.href = item.link;
      anchor.textContent = item.label;
      if (isChild && item.icon) anchor.dataset.icon = item.icon;
      li.append(anchor);

      if (item.children.length) li.append(renderItems(item.children, true));
      ul.append(li);
    });
    return ul;
  };

  block.replaceChildren(renderItems(roots));
}

function normalizeSectionState(navSection) {
  const label =
    navSection.querySelector(':scope > a, :scope > span, :scope > p')?.textContent || '';
  return normalizeKey(label);
}

export function applyOpenSectionState(nav, navSections) {
  nav.classList.remove(
    'nav-state-open-menu',
    'nav-state-open-our-products',
    'nav-state-open-education-guides',
    'nav-state-open-where-to-buy'
  );

  const expandedSection = navSections?.querySelector(
    ':scope .default-content-wrapper > ul > li[aria-expanded="true"]'
  );
  if (!expandedSection) {
    if (nav.getAttribute('aria-expanded') === 'true') nav.classList.add('nav-state-open-menu');
    return;
  }

  const state = normalizeSectionState(expandedSection);
  if (state.includes('our-products')) nav.classList.add('nav-state-open-our-products');
  else if (state.includes('education-guides')) nav.classList.add('nav-state-open-education-guides');
  else if (state.includes('where-to-buy')) nav.classList.add('nav-state-open-where-to-buy');
  else nav.classList.add('nav-state-open-menu');
}

function getIconNameFromLink(link) {
  const explicitIcon = link.dataset.icon?.trim();
  if (explicitIcon) return explicitIcon;

  try {
    const url = new URL(link.href, window.location.origin);
    const iconFromParam = url.searchParams.get('icon')?.trim();
    if (iconFromParam) {
      url.searchParams.delete('icon');
      link.href = `${url.pathname}${url.search}${url.hash}`;
      return iconFromParam;
    }
  } catch (e) {
    // Ignore malformed href values and fall back to text parsing.
  }

  const text = link.textContent?.trim() || '';
  const tokenMatch = text.match(/\[icon:([a-z0-9-]+)]$/i);
  if (!tokenMatch) return '';

  const [, iconName] = tokenMatch;
  link.textContent = text.replace(/\s*\[icon:[a-z0-9-]+]$/i, '');
  return iconName;
}

export function decorateChildNavIcons(navSections) {
  if (!navSections) return;

  navSections
    .querySelectorAll(':scope .default-content-wrapper > ul > li > ul > li > a')
    .forEach((link) => {
      const iconName = getIconNameFromLink(link);
      if (!iconName || link.querySelector('span.icon')) return;

      const icon = document.createElement('span');
      icon.className = `icon icon-${iconName}`;
      icon.setAttribute('aria-hidden', 'true');
      link.classList.add('nav-link-with-icon');
      link.closest('li')?.classList.add('has-icon');
      link.append(icon);
    });

  decorateIcons(navSections);
}

export function decorateNavigationComponents(nav, navSections, navTools, hamburger) {
  if (hamburger) hamburger.classList.add('nav-menu');

  if (navSections) {
    navSections.classList.add('nav-navigation');
    const linksContainer = navSections.querySelector(':scope .default-content-wrapper');
    if (linksContainer) linksContainer.classList.add('nav-navigation-links');

    const navigationItems = navSections.querySelectorAll(
      ':scope .default-content-wrapper > ul > li'
    );
    navigationItems.forEach((item) => {
      item.classList.add('nav-navigation-item');
      const topLink = item.querySelector(':scope > a');
      if (topLink) topLink.classList.add('nav-navigation-link');

      const children = item.querySelector(':scope > ul');
      if (!children) return;

      children.classList.add('nav-navigation-children');
      children.querySelectorAll(':scope > li').forEach((childItem) => {
        childItem.classList.add('nav-navigation-child-item');
        const childLink = childItem.querySelector(':scope > a');
        if (childLink) childLink.classList.add('nav-navigation-child-link');
      });
    });
  }

  if (navTools) navTools.classList.add('nav-navigation-meta');
  nav.classList.add('header-menu-shell');
}

export default function decorate(block) {
  buildNavigationMarkupFromRows(block);
  block.classList.add('nav-navigation', 'navigation-ready');
  const linksContainer = block.querySelector(':scope .default-content-wrapper') || block;
  linksContainer.classList.add('nav-navigation-links');
  decorateChildNavIcons(block);
}
