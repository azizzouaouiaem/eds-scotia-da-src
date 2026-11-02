import { loadCSS } from '../../scripts/aem.js';
import decorateCards from '../cards/cards.js';

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards.css`);

  const rows = [...block.children];
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');
  const panels = document.createElement('div');
  panels.className = 'tabs-panels';

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const label = (cells[0] ? cells[0].textContent : `Tab ${i + 1}`).trim();
    const panelContent = cells[1] || document.createElement('div');

    const id = `tab-${i}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
    const btn = document.createElement('button');
    btn.className = 'tabs-tab';
    btn.id = `${id}-tab`;
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', `${id}-panel`);
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.tabIndex = i === 0 ? 0 : -1;
    btn.textContent = label;

    const panel = document.createElement('div');
    panel.className = 'tabs-panel';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `${id}-tab`);
    if (i !== 0) panel.hidden = true;
    while (panelContent.firstElementChild) panel.append(panelContent.firstElementChild);

    // decorate nested cards
    panel.querySelectorAll('.cards').forEach((c) => decorateCards(c));

    btn.addEventListener('click', () => {
      tablist.querySelectorAll('[role="tab"]').forEach((t) => { t.setAttribute('aria-selected', 'false'); t.tabIndex = -1; });
      panels.querySelectorAll('[role="tabpanel"]').forEach((p) => { p.hidden = true; });
      btn.setAttribute('aria-selected', 'true');
      btn.tabIndex = 0;
      panel.hidden = false;
    });

    tablist.append(btn);
    panels.append(panel);
  });

  // keyboard navigation
  tablist.addEventListener('keydown', (e) => {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const idx = tabs.indexOf(document.activeElement);
    if (idx < 0) return;
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
    else return;
    e.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  });

  block.replaceChildren(tablist, panels);
}
