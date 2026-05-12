import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-'))
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost'))
      sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

const HEADING_STYLE_PATTERN = /^(heading-display|heading-h[1-6])$/;

/**
 * Copies a heading style class (heading-display, heading-h*) from the .title block
 * wrapper onto the actual heading element so both CSS and UE live-editing work.
 * @param {Element} main
 */
function decorateTitleHeadings(main) {
  main.querySelectorAll('.title.block').forEach((block) => {
    const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
    if (!heading) return;
    const styleClass = [...block.classList].find((c) => HEADING_STYLE_PATTERN.test(c));
    if (styleClass && !heading.classList.contains(styleClass)) {
      heading.classList.add(styleClass);
    }
  });
}

function observeTitleHeadingUpdates(main) {
  const observer = new MutationObserver(() => {
    decorateTitleHeadings(main);
  });

  observer.observe(main, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class'],
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateTitleHeadings(main);
  observeTitleHeadingUpdates(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const headerEl = doc.querySelector('header');
  if (headerEl) {
    headerEl.setAttribute('data-aue-type', 'container');
    headerEl.setAttribute('data-aue-filter', 'header');
  }
  loadHeader(headerEl);

  const main = doc.querySelector('main');
  const pageName = window.location.pathname.split('/').pop().replace('.html', '');
  // On the nav fragment page, restrict UE authoring to navigation components only
  if (main && pageName === 'nav') {
    main.setAttribute('data-aue-filter', 'nav');
  }
  await loadSections(main);
  decorateTitleHeadings(main);
  // After sections are decorated (.section class added by aem.js), override their UE filter
  if (main && pageName === 'nav') {
    main.querySelectorAll('.section').forEach((section) => {
      section.setAttribute('data-aue-filter', 'nav');
    });
  }

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
