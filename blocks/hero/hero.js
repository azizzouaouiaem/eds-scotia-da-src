export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;
  const cells = [...row.children];
  // identify image cell (the one whose only meaningful content is a picture/img)
  let imageCell = cells.find((c) => c.querySelector('picture, img') && c.textContent.trim() === '');
  let contentCell = cells.find((c) => c !== imageCell);
  if (!imageCell && cells.length === 2) {
    [contentCell, imageCell] = cells;
  }
  if (imageCell) imageCell.classList.add('hero-media');
  if (contentCell) {
    contentCell.classList.add('hero-content');
    // group the small circle icons (leading images before the H1) into a row
    const icons = [...contentCell.querySelectorAll('p')].find((p) => p.querySelectorAll('img, picture').length >= 2);
    if (icons) icons.classList.add('hero-icons');
    // style button groups
    contentCell.querySelectorAll('p.button-wrapper a').forEach((a, i) => {
      a.classList.add('button');
      a.classList.add(i === 0 ? 'primary' : 'secondary');
    });
    // group label + button pairs into a CTA row
    const btnWrappers = [...contentCell.querySelectorAll('p.button-wrapper')];
    if (btnWrappers.length) {
      const ctaRow = document.createElement('div');
      ctaRow.className = 'hero-cta-row';
      btnWrappers.forEach((bw) => {
        const group = document.createElement('div');
        group.className = 'hero-cta-group';
        const label = bw.previousElementSibling;
        if (label && label.tagName === 'P' && !label.classList.contains('button-wrapper')) {
          label.classList.add('hero-cta-label');
          group.append(label);
        }
        group.append(bw);
        ctaRow.append(group);
      });
      contentCell.append(ctaRow);
    }
  }
}
