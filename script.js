(() => {
  const partials = {
    header: 'partials/header.html',
    footer: 'partials/footer.html',
  };

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const readCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('dealettCart') || '[]');
      return Array.isArray(cart) ? cart.length : 0;
    } catch {
      return 0;
    }
  };

  const updateCartCount = () => {
    const count = readCartCount();

    document.querySelectorAll('[data-cart-count]').forEach((badge) => {
      badge.textContent = String(count);
      badge.classList.toggle('is-hidden', count <= 0);
      badge.setAttribute('aria-label', `${count} ${count === 1 ? 'vara' : 'varor'} i varukorgen`);
    });
  };

  window.DEALETT_updateCartCount = updateCartCount;

  const includePartials = async () => {
    const includeTargets = [...document.querySelectorAll('[data-include]')];

    await Promise.all(includeTargets.map(async (target) => {
      const includeName = target.dataset.include;
      const partialPath = partials[includeName];

      if (!partialPath) {
        return;
      }

      try {
        const response = await fetch(partialPath);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const template = document.createElement('template');
        template.innerHTML = (await response.text()).trim();
        target.replaceWith(template.content.cloneNode(true));
      } catch {
        target.hidden = true;
      }
    }));
  };

  const setHeaderActiveState = () => {
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

        parentItem?.classList.add('nav-item--active');
      }
    });

    document.querySelectorAll('.header-topbar-link').forEach((link) => {
      const targetPage = link.getAttribute('href').split('#')[0].split('/').pop() || 'index.html';
      const isMainArea = currentPage !== 'foretag.html';
      const isActive = targetPage === currentPage || (targetPage === 'index.html' && isMainArea);

      link.classList.toggle('is-active', isActive);
    });
  };

  const initDropdowns = () => {
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
  };

  const initHeaderMotion = () => {
    const header = document.querySelector('.site-header');
    const hero = document.querySelector('.hero');

    if (!header && !hero) {
      return;
    }

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
        const maxShift = window.matchMedia('(max-width: 680px)').matches ? 32 : 90;
        const shift = Math.round(progress * -maxShift);

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
  };

  const initCoveragePreview = () => {
    const coverageApp = document.querySelector('#coverageApp');
    const hasDedicatedCoverageController = document.body.classList.contains('jamfor-page');

    if (!coverageApp || hasDedicatedCoverageController) {
      return;
    }

    coverageApp.querySelectorAll('.operator-card').forEach((operatorButton) => {
      operatorButton.addEventListener('click', () => {
        coverageApp.querySelectorAll('.operator-card').forEach((button) => {
          button.classList.remove('is-active');
        });

        operatorButton.classList.add('is-active');
      });
    });

    coverageApp.querySelectorAll('.coverage-filter').forEach((filterButton) => {
      filterButton.addEventListener('click', () => {
        filterButton.classList.toggle('is-active');
      });
    });

    const zoomLabel = coverageApp.querySelector('#visibleZoomLabel');
    let mapZoom = zoomLabel ? Number(zoomLabel.textContent) || 5 : 5;

    const setMapZoom = (nextZoom) => {
      mapZoom = Math.min(Math.max(nextZoom, 1), 12);

      if (zoomLabel) {
        zoomLabel.textContent = mapZoom;
      }
    };

    coverageApp.querySelectorAll('#zoomInBtn, #zoomInBtn2').forEach((button) => {
      button.addEventListener('click', () => setMapZoom(mapZoom + 1));
    });

    coverageApp.querySelectorAll('#zoomOutBtn, #zoomOutBtn2').forEach((button) => {
      button.addEventListener('click', () => setMapZoom(mapZoom - 1));
    });

    const mapSearchInput = coverageApp.querySelector('#mapSearchInput');
    const mapSearchButton = coverageApp.querySelector('#mapSearchBtn');

    if (mapSearchButton && mapSearchInput) {
      mapSearchButton.addEventListener('click', () => {
        mapSearchInput.focus();
      });
    }

    const mapCard = coverageApp.querySelector('.coverage-map-card');
    const fullscreenButton = coverageApp.querySelector('#fullscreenMapBtn');

    if (mapCard && fullscreenButton) {
      fullscreenButton.addEventListener('click', () => {
        mapCard.classList.toggle('is-fullscreen');
      });
    }
  };

  const initGlobalBehaviors = () => {
    setHeaderActiveState();
    updateCartCount();
    initDropdowns();
    initHeaderMotion();
    initCoveragePreview();
  };

  window.addEventListener('storage', (event) => {
    if (event.key === 'dealettCart') {
      updateCartCount();
    }
  });

  window.DEALETT_includesReady = includePartials().finally(initGlobalBehaviors);
})();
