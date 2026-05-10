const LAYOUT_PATTERN = /^layout-(60-40|40-60|70-30|30-70|4-8|4-6)$/;

function extractLayoutToken(source) {
  if (!source) return null;

  const fromDataset = [source.dataset.layout, source.dataset.layout2].find(
    (value) => value && LAYOUT_PATTERN.test(value)
  );
  if (fromDataset) return fromDataset;

  const fromClasses = (source.dataset.classes || '')
    .split(/\s+/)
    .find((value) => LAYOUT_PATTERN.test(value));
  if (fromClasses) return fromClasses;

  return [...source.classList].find((value) => LAYOUT_PATTERN.test(value)) || null;
}

function resolveLayoutToken(block) {
  const sources = [
    block,
    block.parentElement,
    block.closest('.columns-wrapper'),
    block.closest('[data-aue-resource]'),
  ];

  return sources.map((source) => extractLayoutToken(source)).find(Boolean) || null;
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  const colCount = cols.length;
  block.classList.add(`columns-${colCount}-cols`);

  const layout = resolveLayoutToken(block);
  [...block.classList]
    .filter((value) => LAYOUT_PATTERN.test(value) && value !== layout)
    .forEach((value) => block.classList.remove(value));

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
