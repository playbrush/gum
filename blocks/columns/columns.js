import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Get column configuration from block's data attributes (from model)
  const colsValue = block.dataset.cols || '2';
  const layoutValue = block.dataset.layout || 'equal';
  const gapValue = block.dataset.gap || 'medium';

  // Apply columns class based on cols value
  if (/^[1-4]$/.test(colsValue)) {
    block.classList.add(`cols-${colsValue}`);
  }

  // Apply layout variant class
  if (layoutValue && layoutValue !== 'equal') {
    block.classList.add(layoutValue);
  }

  // Apply gap variant class
  if (gapValue && gapValue !== 'medium') {
    block.classList.add(`gap-${gapValue}`);
  }

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'column';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    // setup image columns
    [...li.children].forEach((div) => {
      const pic = div.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-img-col');
        }
      }
    });

    ul.append(li);
  });
  block.replaceChildren(ul);
}
