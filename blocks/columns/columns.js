export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  const colCount = cols.length;
  block.classList.add(`columns-${colCount}-cols`);

  // Always get layout value from dataset, default to 'equal' for 2 columns
  const layout2 = colCount === 2 ? block.dataset.layout2 || 'equal' : null;

  // Apply layout class for 2-column layouts
  if (colCount === 2) {
    if (layout2 !== 'equal') {
      block.classList.add(layout2);
    }
    // Add identifier classes for all 2-col layouts (for CSS targeting)
    block.classList.add('layout-set');
    cols.forEach((col, index) => {
      col.classList.add(`col-${index + 1}`);
    });
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
