function getCellText(cell) {
  return cell?.textContent?.trim() || '';
}

export default function decorate(block) {
  const rows = [...block.children].filter((r) => r.tagName === 'DIV');

  // Row 0: navigation-link content — link + linkText field-collapsed into a single <a>
  const mainAnchor = rows[0]?.children[0]?.querySelector('a');
  const label = mainAnchor?.textContent.trim() || '';
  const link = mainAnchor?.href || '';
  if (!label) return;

  const li = document.createElement('li');

  // Preserve data-aue-* and class attributes on the li for Universal Editor support
  [...block.attributes].forEach((attr) => {
    if (attr.name.startsWith('data-aue-') || attr.name === 'class') {
      li.setAttribute(attr.name, attr.value);
    }
  });

  const anchor = document.createElement('a');
  anchor.href = link || '#';
  anchor.textContent = label;
  li.append(anchor);

  // Rows 1+: navigation-sub-link items — cell 0 = collapsed <a>, cell 1 = icon
  const subRows = rows.slice(1);
  if (subRows.length) {
    const subUl = document.createElement('ul');
    subRows.forEach((subRow) => {
      const cols = [...subRow.children].filter((c) => c.tagName === 'DIV');
      const subAnchor = cols[0]?.querySelector('a');
      const subLabel = subAnchor?.textContent.trim() || '';
      const subLink = subAnchor?.href || '';
      const icon = getCellText(cols[1]);
      if (!subLabel) return;

      const subLi = document.createElement('li');

      // Preserve data-aue-* and class attributes on sub-li for Universal Editor support
      [...subRow.attributes].forEach((attr) => {
        if (attr.name.startsWith('data-aue-') || attr.name === 'class') {
          subLi.setAttribute(attr.name, attr.value);
        }
      });

      const subLinkEl = document.createElement('a');
      subLinkEl.href = subLink || '#';
      subLinkEl.textContent = subLabel;
      if (icon) subLinkEl.dataset.icon = icon;
      subLi.append(subLinkEl);
      subUl.append(subLi);
    });
    if (subUl.children.length) li.append(subUl);
  }

  // Put the <li> into default-content-wrapper > ul inside the parent section.
  // This makes header.js's ':scope .default-content-wrapper > ul > li' selector work.
  const section = block.closest('.section');
  if (section) {
    let wrapper = section.querySelector(':scope > .default-content-wrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.classList.add('default-content-wrapper');
      section.prepend(wrapper);
    }
    let ul = wrapper.querySelector(':scope > ul');
    if (!ul) {
      ul = document.createElement('ul');
      wrapper.append(ul);
    }
    ul.append(li);
  }

  block.remove();
}
