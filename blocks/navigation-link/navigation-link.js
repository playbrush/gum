function getCellText(cell) {
  return cell?.textContent?.trim() || '';
}

function getCellLink(cell) {
  const link = cell?.querySelector('a');
  return link?.href || '';
}

export default function decorate(block) {
  if (block.dataset.aueResource) return;

  const rows = [...block.children].filter((r) => r.tagName === 'DIV');
  const label = getCellText(rows[0]?.children[0]);
  const link = getCellLink(rows[1]?.children[0]);
  if (!label) return;

  const li = document.createElement('li');
  const anchor = document.createElement('a');
  anchor.href = link || '#';
  anchor.textContent = label;
  li.append(anchor);

  const subRows = rows.slice(2);
  if (subRows.length) {
    const subUl = document.createElement('ul');
    subRows.forEach((subRow) => {
      const cols = [...subRow.children].filter((c) => c.tagName === 'DIV');
      const subLabel = getCellText(cols[0]);
      const subLink = getCellLink(cols[1]);
      const icon = getCellText(cols[2]);
      if (!subLabel) return;

      const subLi = document.createElement('li');
      const subAnchor = document.createElement('a');
      subAnchor.href = subLink || '#';
      subAnchor.textContent = subLabel;
      if (icon) subAnchor.dataset.icon = icon;
      subLi.append(subAnchor);
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
