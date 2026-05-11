import { moveInstrumentation } from '../../scripts/scripts.js';

const HEADING_STYLE_PATTERN = /^(heading-display|heading-h[1-6])$/;

export default function decorate(block) {
  let heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  if (!heading) return;

  const parent = heading.parentElement;
  if (parent && parent !== block) {
    moveInstrumentation(parent, heading);
    block.prepend(heading);

    // Remove empty wrapper divs left by block rendering.
    if (!parent.textContent.trim() && parent.childElementCount === 0) parent.remove();
    const container = block.firstElementChild;
    if (
      container &&
      container !== heading &&
      !container.textContent.trim() &&
      container.childElementCount === 0
    ) {
      container.remove();
    }

    heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  }

  // xwalk multiselect `classes` field adds the chosen value as a class on the block wrapper.
  // Copy it to the heading so element-level CSS and UE both work.
  const styleClass = [...block.classList].find((c) => HEADING_STYLE_PATTERN.test(c));
  if (styleClass && heading) heading.classList.add(styleClass);
}
