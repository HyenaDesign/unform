(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');

  if (menu && mobileNav) {
    function closeMenu() {
      menu.setAttribute('aria-expanded', 'false');
      mobileNav.hidden = true;
      menu.querySelector('span').textContent = '+';
    }

    menu.addEventListener('click', () => {
      const expanded = menu.getAttribute('aria-expanded') === 'true';
      menu.setAttribute('aria-expanded', String(!expanded));
      mobileNav.hidden = expanded;
      menu.querySelector('span').textContent = expanded ? '+' : '−';
    });
    mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
