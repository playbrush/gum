export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  const colCount = cols.length;
  block.classList.add(`columns-${colCount}-cols`);

  // Backward compatibility: support older authored content using layout2 field.
  if (colCount === 2) {
    const layout = block.dataset.layout2 || block.getAttribute('data-layout2');
    if (layout && !block.classList.contains(layout)) {
      block.classList.add(layout);
    }
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
