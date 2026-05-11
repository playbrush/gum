export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  const colCount = cols.length;
  block.classList.add(`columns-${colCount}-cols`);

  // Keep layout variants working across model versions.
  // Preferred source is data-layout; older content may still provide data-style
  // or a raw style attribute value like "layout-60-40".
  const layoutValue =
    block.dataset.layout ||
    block.dataset.style ||
    (block.getAttribute('style') && /^layout-[a-z0-9-]+$/.test(block.getAttribute('style'))
      ? block.getAttribute('style')
      : '');
  if (layoutValue) {
    block.classList.add(layoutValue);
  }

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
