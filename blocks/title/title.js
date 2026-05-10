export default function decorate(block) {
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');

  if (heading) {
    // Apply heading style class from xwalk model
    const styleClass = block.dataset.classes;
    if (styleClass) {
      heading.classList.add(styleClass);
    }
  }
}
