export default function decorate(block) {
  const columns = block.dataset.columns || 1;
  block.classList.add(`col-${columns}`);
}
