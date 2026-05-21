export default function decorate(block) {
  // In Universal Editor, preserve the instrumented child slider-product-card blocks.
  if (block.dataset.aueResource) return;

  // On delivery: wrap all child block rows in a horizontal scroll track.
  const track = document.createElement('div');
  track.className = 'ps-track';
  [...block.children].forEach((child) => track.append(child));
  block.append(track);
}
