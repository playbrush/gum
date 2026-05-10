const HEADING_STYLE_PATTERN = /^(heading-display|heading-h[1-6])$/;

export default function decorate(block) {
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  if (!heading) return;

  // xwalk multiselect `classes` field adds the chosen value as a class on the block wrapper.
  // Copy it to the heading so element-level CSS and UE both work.
  const styleClass = [...block.classList].find((c) => HEADING_STYLE_PATTERN.test(c));
  if (styleClass) heading.classList.add(styleClass);
}
