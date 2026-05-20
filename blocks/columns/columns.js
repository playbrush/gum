import { decorateBlock, loadBlock } from '../../scripts/aem.js';

export default async function decorate(block) {
  const cols = [...block.firstElementChild.children];
  const colCount = cols.length;
  block.classList.add(`columns-${colCount}-cols`);

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

  // Decorate and load nested blocks inside column cells (e.g. product-card)
  const nested = [...block.querySelectorAll(':scope > div > div > div')].filter(
    (el) => el.classList.length > 0 && !el.dataset.blockStatus
  );
  nested.forEach(decorateBlock);
  await Promise.all(nested.filter((el) => el.dataset.blockName).map(loadBlock));
}
