export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  const colCount = cols.length;
  block.classList.add(`columns-${colCount}-cols`);

  const layout2 = block.dataset.layout2 || 'equal';
  if (colCount === 2 && layout2 !== 'equal') {
    block.classList.add(layout2);
    // Apply individual column identifier classes for nth-child targeting
    cols.forEach((col, index) => {
      col.classList.add(`col-${index + 1}-of-${colCount}`);
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
