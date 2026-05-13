const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
const dropdowns = document.querySelectorAll('.nav-item--dropdown');

dropdowns.forEach((dropdown) => {
  const toggle = dropdown.querySelector('.nav-dropdown-toggle');

  if (!toggle) {
    return;
  }

  toggle.addEventListener('click', () => {
    dropdowns.forEach((item) => {
      if (item !== dropdown) {
        item.classList.remove('open');
      }
    });

    dropdown.classList.toggle('open');
  });
});

document.addEventListener('click', (event) => {
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove('open');
    }
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    dropdowns.forEach((dropdown) => dropdown.classList.remove('open'));
  }
});

const currentPage = window.location.pathname.split('/').pop() || 'index.html';

document.querySelectorAll('.nav-item--active').forEach((item) => {
  item.classList.remove('nav-item--active');
});

document.querySelectorAll('.nav-menu a[href]').forEach((link) => {
  link.classList.remove('is-active');
  link.removeAttribute('aria-current');

  const targetPage = link.getAttribute('href').split('#')[0].split('/').pop() || 'index.html';

  if (targetPage === currentPage) {
    link.classList.add('is-active');
    link.setAttribute('aria-current', 'page');

    const parentDropdown = link.closest('.nav-item--dropdown');
    const parentItem = parentDropdown || link.closest('.nav-item');

    if (parentItem) {
      parentItem.classList.add('nav-item--active');
    }
  }
});

if (header || hero) {
  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateOnScroll = () => {
    const nextScrollY = window.scrollY;

    if (header) {
      if (nextScrollY <= 0 || nextScrollY < lastScrollY) {
        header.classList.remove('is-hidden');
      } else if (nextScrollY > lastScrollY && nextScrollY > 80) {
        header.classList.add('is-hidden');
      }
    }

    if (hero) {
      const heroHeight = hero.offsetHeight || 1;
      const progress = Math.min(Math.max(nextScrollY / heroHeight, 0), 1);
      const shift = Math.round(progress * -90);

      hero.style.setProperty('--hero-shift', `${shift}px`);
    }

    lastScrollY = Math.max(nextScrollY, 0);
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateOnScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateOnScroll();
}
