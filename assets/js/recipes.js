/* HOKU method switcher: accessible keyboard and touch navigation. */
(() => {
  'use strict';
  const tabs = Array.from(document.querySelectorAll('.brew-tab[role="tab"]'));
  if (!tabs.length) return;
  function activate(tab, focus = false) {
    for (const button of tabs) {
      const selected = button === tab;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    }
    if (focus) tab.focus();
    const method = tab.id.replace('brew-tab-', '');
    document.dispatchEvent(new CustomEvent('hoku:analytics', {detail: {event: 'select_content', params: {content_type: 'brew_guide', item_id: method}}}));
    if (typeof window.gtag === 'function') window.gtag('event', 'select_content', {content_type: 'brew_guide', item_id: method});
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
      else if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
      else if (event.key === 'Home') next = tabs[0];
      else if (event.key === 'End') next = tabs[tabs.length - 1];
      else return;
      event.preventDefault();
      activate(next, true);
    });
  });
})();
