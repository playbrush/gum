export default function decorate(block) {
  const heading = block.matches('h1, h2, h3, h4, h5, h6')
    ? block
    : block.querySelector('h1, h2, h3, h4, h5, h6');

  if (heading) {
    const styleClass = [...block.classList].find(
      (cls) => cls === 'heading-display' || /^heading-h[1-6]$/.test(cls)
    );

    if (styleClass) {
      heading.classList.add(styleClass);
    }
  }
}
