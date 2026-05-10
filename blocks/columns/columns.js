import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const supportedLayouts = new Set([
    'col-6-col-6',
    'col-5-col-5-inset',
    'col-4-col-6-inset',
    'col-6-col-4-inset',
    'col-7-col-3-inset',
    'col-4-col-8',
    'col-3-col-4-col-1',
    'col-3-col-3-col-3-col-3',
    'col-2-col-2-col-2-col-2-col-2-inset',
    'full-width',
  ]);
  const supportedGaps = new Set(['small', 'medium', 'large']);

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

  // Columns count is derived from child items and clamped to supported values.
  const itemCount = ul.children.length;
  const derivedCols = Math.min(4, Math.max(1, itemCount || 1));
  block.classList.add(`cols-${derivedCols}`);

  // Backward compatibility: keep support for existing authored data attrs, but only allow supported values.
  const layoutValue = block.dataset.layout || '';
  if (supportedLayouts.has(layoutValue)) {
    block.classList.add(layoutValue);
  }

  const gapValue = block.dataset.gap || 'medium';
  if (supportedGaps.has(gapValue) && gapValue !== 'medium') {
    block.classList.add(`gap-${gapValue}`);
  }

  block.replaceChildren(ul);
}
