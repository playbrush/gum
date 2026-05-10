export default function decorate(block) {
  // Get column count from section's cols class
  const section = block.closest('.section');
  let colsClass = '';
  if (section) {
    const sectionColsClass = [...section.classList].find((cls) => /^cols-[1-4]$/.test(cls));
    if (sectionColsClass) {
      colsClass = sectionColsClass;
      block.classList.add(colsClass);
    }
  }

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'column';
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
