import { decorateBlock, loadBlock } from '../../scripts/aem.js';

export default async function decorate(block) {
  // In Universal Editor the DOM is already instrumented — leave it untouched.
  if (block.dataset.aueResource) return;

  // decorateBlocks() in aem.js only finds div.section > div > div.
  // Nested blocks inside a container are invisible to it, so we must load them
  // manually here before building the scroll track.
  const cards = [...block.querySelectorAll('.slider-product-card')];
  cards.forEach(decorateBlock);
  await Promise.all(cards.map(loadBlock));

  // Move cards as direct children of the scroll track.
  const track = document.createElement('div');
  track.className = 'ps-track';
  cards.forEach((card) => track.append(card));
  block.replaceChildren(track);
}
