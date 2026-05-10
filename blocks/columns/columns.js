function getSectionColumnTarget(block) {
  const section = block.closest('.section');
  if (!section) return 0;

  const sectionColsClass = [...section.classList].find((cls) => /^cols-[1-4]$/.test(cls));
  if (sectionColsClass) {
    return Number(sectionColsClass.split('-')[1]);
  }

  const { cols } = section.dataset;
  if (!cols) return 0;

  const match = cols.match(/([1-4])/);
  return match ? Number(match[1]) : 0;
}

function createColumnElement() {
  const col = document.createElement('div');
  col.classList.add('column');
  col.append(document.createElement('div'));
  return col;
}

function getCurrentColumns(block) {
  const directColumns = [...block.children].filter((child) => child.classList.contains('column'));
  const rowColumns = block.firstElementChild ? [...block.firstElementChild.children] : [];
  return { directColumns, rowColumns };
}

export default function decorate(block) {
  const targetCount = getSectionColumnTarget(block);
  const { directColumns, rowColumns } = getCurrentColumns(block);
  let currentCount = directColumns.length || rowColumns.length || 0;

  if (targetCount && currentCount < targetCount) {
    const missingCount = targetCount - currentCount;
    const rowContainer =
      !directColumns.length && block.firstElementChild ? block.firstElementChild : null;

    for (let i = 0; i < missingCount; i += 1) {
      const col = createColumnElement();
      if (rowContainer) {
        rowContainer.append(col);
      } else {
        block.append(col);
      }
    }

    currentCount = targetCount;
  }

  const columnCount = targetCount || currentCount || 1;
  block.classList.remove('columns-1-cols', 'columns-2-cols', 'columns-3-cols', 'columns-4-cols');
  block.classList.add(`columns-${columnCount}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    const candidates = row.classList.contains('column') ? [row] : [...row.children];
    candidates.forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
