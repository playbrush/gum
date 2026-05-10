export default function decorate(block) {
  // Get the heading element (h1-h6)
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');

  if (heading) {
    // The heading itself is the title component (data-aue-component="title")
    // Get the classes field value from the heading element's dataset
    const styleClass = heading.dataset.classes;

    // Apply the heading style class if it exists and is not empty
    if (styleClass && styleClass.trim()) {
      heading.classList.add(styleClass);
    }
  }
}
