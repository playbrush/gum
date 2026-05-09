// Section component script

document.querySelectorAll('.section').forEach((section) => {
  const columns = section.dataset.columns || 1;
  section.classList.add(`col-${columns}`);
});
