export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  const colCount = cols.length;
  block.classList.add(`columns-${colCount}-cols`);

  // Support both current and legacy authoring fields.
  const layoutFromClasses = (block.dataset.classes || '')
    .split(/\s+/)
    .find((value) => /^layout-(60-40|40-60|70-30|30-70|4-8|4-6)$/.test(value));

  const layout = block.dataset.layout || block.dataset.layout2 || layoutFromClasses;
  if (layout && !block.classList.contains(layout)) {
    block.classList.add(layout);
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
