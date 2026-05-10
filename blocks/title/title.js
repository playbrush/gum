export default function decorate(block) {
  // Get the heading element (h1-h6)
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');

  if (heading) {
    // Look for the classes attribute on the heading, the block, or any parent with data-aue-component="title"
    let styleClass = heading.dataset.classes || block.dataset.classes;

    // If not found, search up the parent chain for data-aue-component="title"
    if (!styleClass) {
      const parent = heading.closest('[data-aue-component="title"]');
      if (parent) {
        styleClass = parent.dataset.classes;
      }
    }

    // Apply the heading style class if it exists and is not empty
    if (styleClass && styleClass.trim()) {
      heading.classList.add(styleClass);
    }
  }
}
