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

  // Keep UE-authored DOM structure intact and only add classes.
  const colCount = Math.min(4, Math.max(1, block.children.length || 1));
  block.classList.add(`cols-${colCount}`);
  block.classList.add(`columns-${colCount}-cols`);

  const layoutValue = block.dataset.layout || '';
  if (supportedLayouts.has(layoutValue)) {
    block.classList.add(layoutValue);
  }

  const gapValue = block.dataset.gap || 'medium';
  if (supportedGaps.has(gapValue) && gapValue !== 'medium') {
    block.classList.add(`gap-${gapValue}`);
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
