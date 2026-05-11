const LAYOUT_VALUE_PATTERN = /^layout-[a-z0-9-]+$/;

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  const colCount = cols.length;
  block.classList.add(`columns-${colCount}-cols`);

  // Keep layout variants working across model versions and wrapper metadata placement.
  const wrapper = block.closest('.columns-wrapper');
  const inlineStyle = block.getAttribute('style');
  const rawLayoutValue =
    block.dataset.layout ||
    block.dataset.style ||
    wrapper?.dataset.layout ||
    wrapper?.dataset.style ||
    (inlineStyle && LAYOUT_VALUE_PATTERN.test(inlineStyle) ? inlineStyle : '');

  if (rawLayoutValue) {
    block.classList.add(rawLayoutValue);
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
