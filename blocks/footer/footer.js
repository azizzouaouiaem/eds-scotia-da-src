import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/ca/en/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  const footer = document.createElement('div');
  footer.className = 'footer-inner';
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const sections = [...footer.children];
  const [supportWrap, socialWrap, legalWrap, copyWrap] = sections;

  // --- support cards (grouped by H2) ---
  if (supportWrap) {
    supportWrap.classList.add('footer-support');
    const cards = [];
    let cur = null;
    [...supportWrap.children].forEach((ch) => {
      if (ch.tagName === 'H2') { cur = document.createElement('div'); cur.className = 'footer-card'; cards.push(cur); cur.append(ch); } else if (cur) cur.append(ch);
    });
    const iconFor = (t) => {
      const s = t.toLowerCase();
      if (s.includes('question')) return 'question';
      if (s.includes('support')) return 'phone';
      if (s.includes('advice')) return 'calendar';
      return 'question';
    };
    supportWrap.textContent = '';
    cards.forEach((c) => {
      const title = c.querySelector('h2');
      const icon = document.createElement('span');
      icon.className = `icon icon-${iconFor(title ? title.textContent : '')}`;
      c.prepend(icon);
      c.querySelectorAll('a').forEach((a) => a.classList.add('footer-card-link'));
      supportWrap.append(c);
    });
  }

  // --- social ---
  if (socialWrap) {
    socialWrap.classList.add('footer-social');
    socialWrap.querySelectorAll('a').forEach((a) => {
      const label = (a.getAttribute('aria-label') || a.textContent || '').trim().toLowerCase();
      let key = label;
      if (label.includes('twitter') || label === 'x') key = 'x';
      if (label.includes('youtube')) key = 'youtube';
      a.setAttribute('aria-label', a.getAttribute('aria-label') || label);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      a.innerHTML = `<span class="icon icon-${key}"></span>`;
    });
  }

  if (legalWrap) legalWrap.classList.add('footer-legal');
  if (copyWrap) copyWrap.classList.add('footer-copyright');

  block.append(footer);
}
