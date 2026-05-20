import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|avif|gif|svg)(\?|$)/i;

function isImageLink(div) {
  const link = div.querySelector('p > a, a');
  return link && IMAGE_EXTENSIONS.test(link.href);
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else if (isImageLink(div)) {
        // AEM Assets delivery URLs render as <a href> links instead of <picture>
        const link = div.querySelector('p > a, a');
        const picture = document.createElement('picture');
        const img = document.createElement('img');
        img.src = link.href;
        img.alt = link.title || '';
        img.loading = 'lazy';
        picture.append(img);
        div.replaceChildren(picture);
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const imgUrl = new URL(img.src, window.location.href);
    if (imgUrl.origin !== window.location.origin) {
      // Cross-origin AEM delivery URL — keep original picture, skip Helix CDN optimization
      return;
    }
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.replaceChildren(ul);
}
