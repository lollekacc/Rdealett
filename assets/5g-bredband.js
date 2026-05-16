const currency = new Intl.NumberFormat('sv-SE');

const providerLogos = {
  Telia: 'images/telia.png',
  Tele2: 'images/tele2.png',
  Tre: 'images/tre.jpg',
  Telenor: 'images/telenor.jpg',
  Halebop: 'images/halebop.webp',
};

const providerAccents = {
  Telia: '#6E2380',
  Tele2: '#003A6E',
  Tre: '#E65C00',
  Telenor: '#00437E',
  Halebop: '#C8175C',
};

const channelLogos = {
  svt1: 'https://www.telia.se/images/j6b4qnxw7ufu/4Fq8uxCGToyw7NNX75uqEf/a631bbec5393e926fb32f16e1bb9546a/svt1.png?fm=webp&w=128&q=75&h=128',
  svt2: 'https://www.telia.se/images/j6b4qnxw7ufu/3NoMCuXDQbHS4lwP0dIc8m/8ad0153f89511d90da94a4e957745185/svt2.png?fm=webp&w=128&q=75&h=128',
  tv3: 'https://www.telia.se/images/j6b4qnxw7ufu/6gTu9t8ikn5qnQc3lChJWi/abd5223ed4a7ac4f6d38d0088bda595e/tv3.png?fm=webp&w=128&q=75&h=128',
  tv4: 'https://www.telia.se/images/j6b4qnxw7ufu/1NzwvcDwlVIzxj1J2V8gHA/e7e875668baae14a69df698aa9000a65/tv4.png?fm=webp&w=128&q=75&h=128',
  kanal5: 'https://www.telia.se/images/j6b4qnxw7ufu/1O5VLxSp45CSbAhRy537HI/808d1b0c88263b6eb2c58c8d45129285/kanal_5_ny.png?fm=webp&w=128&q=75&h=128',
  tv6: 'https://www.telia.se/images/j6b4qnxw7ufu/7gBxKTcBDSviuwIgrHxa5U/5e26f9609247f707103c36744da57c9a/tv6.png?fm=webp&w=128&q=75&h=128',
  sjuan: 'https://www.telia.se/images/j6b4qnxw7ufu/4GCCAhOFC3JRO5eXEIkK3b/6218c2b69285279fd74fb22e3ec6c5a3/sjuan.png?fm=webp&w=128&q=75&h=128',
  tv8: 'https://www.telia.se/images/j6b4qnxw7ufu/71jSsQmSKbLfxwPV41VuGX/835d0c05d217a61cea02981120f1cfee/tv8.png?fm=webp&w=128&q=75&h=128',
  kanal9: 'https://www.telia.se/images/j6b4qnxw7ufu/6Q8yLzFypNwLc6STtFrbcn/ab6c89dd26617956d86eafee04323352/nian_ny.png?fm=webp&w=128&q=75&h=128',
  tv10: 'https://www.telia.se/images/j6b4qnxw7ufu/6cu9gwORJ9W1iGfUXr5Tdb/6fbc196f67e2d98c74570656eee19609/tv10.png?fm=webp&w=64&q=75&h=64',
};

const els = {
  addressSearchForm: document.querySelector('#addressSearchForm'),
  addressInput: document.querySelector('#addressInput'),
  searchMsg: document.querySelector('#searchMsg'),
  offers: document.querySelector('#offers'),
  resultsCount: document.querySelector('#resultsCount'),
  techFilter: document.querySelector('#techFilter'),
  speedFilter: document.querySelector('#speedFilter'),
  sortSelect: document.querySelector('#sortSelect'),
  stickyBar: document.querySelector('#stickyBar'),
  continueBtn: document.querySelector('#continueBtn'),
  selectedPlanText: document.querySelector('#selectedPlanText'),
  channelsModal: document.querySelector('#channelsModal'),
  channelsTitle: document.querySelector('#channelsTitle'),
  channelsGrid: document.querySelector('#channelsGrid'),
  closeChannelsModal: document.querySelector('#closeChannelsModal'),
  coverageModal: document.querySelector('#coverageModal'),
  openCoverageModal: document.querySelector('#openCoverageModal'),
  closeCoverageModal: document.querySelector('#closeCoverageModal'),
  coverageOverlay: document.querySelector('#coverageOverlay'),
  cartDrawer: document.querySelector('#cartDrawer'),
  cartItems: document.querySelector('#cartItems'),
  summaryArea: document.querySelector('#summaryArea'),
  totalPrice: document.querySelector('#totalPrice'),
  cartOverlay: document.querySelector('#cartOverlay'),
  closeCart: document.querySelector('#closeCart'),
  cartContinueBtn: document.querySelector('#cartContinueBtn'),
};

let bredbandPlans = [];
let selectedPlan = null;
let coverageMap = null;
let coverageLayer = null;
let searchMarker = null;

const formatCurrency = (value) => currency.format(Math.max(Number(value) || 0, 0));

const calculateReward = (price) => {
  if (price < 299) return 1000;
  if (price < 399) return 2000;
  if (price < 499) return 3000;
  if (price < 699) return 4000;
  return 5000;
};

const formatBinding = (plan) => (plan.bindingMonths ? `${plan.bindingMonths} mån bindningstid` : 'Ingen bindningstid');

const getRecommendedPlan = (plans) => {
  if (!plans.length) return null;

  return [...plans].sort((a, b) => (b.speedMbps / Math.max(b.price, 1)) - (a.speedMbps / Math.max(a.price, 1)))[0];
};

const setSearchMessage = (message, state = '') => {
  if (!els.searchMsg) return;
  els.searchMsg.textContent = message;
  els.searchMsg.className = `bredband-search-msg ${state}`.trim();
};

const getFilteredOffers = () => {
  let offers = [...bredbandPlans];
  const tech = els.techFilter?.value || 'all';
  const minSpeed = Number(els.speedFilter?.value) || 0;
  const sort = els.sortSelect?.value || 'price';

  if (tech !== 'all') {
    offers = offers.filter((plan) => plan.technology === tech);
  }

  if (minSpeed > 0) {
    offers = offers.filter((plan) => plan.speedMbps >= minSpeed);
  }

  if (sort === 'price') {
    offers.sort((a, b) => a.price - b.price);
  } else if (sort === 'speed') {
    offers.sort((a, b) => b.speedMbps - a.speedMbps);
  } else {
    offers.sort((a, b) => (b.speedMbps / b.price) - (a.speedMbps / a.price));
  }

  return offers;
};

const renderOffers = () => {
  if (!els.offers) return;

  if (!bredbandPlans.length) {
    setSearchMessage('Kunde inte ladda bredbandsdata.', 'error');
    els.offers.innerHTML = '<div class="bredband-empty-state">Inga erbjudanden kunde visas just nu.</div>';
    return;
  }

  const offers = getFilteredOffers();
  const recommended = getRecommendedPlan(offers);

  if (els.resultsCount) {
    els.resultsCount.textContent = `${offers.length} erbjudanden`;
  }

  if (!offers.length) {
    setSearchMessage('Vi hittade inga bredband som matchar filtren.', 'error');
    els.offers.innerHTML = '<div class="bredband-empty-state">Prova en lägre hastighet eller byt teknikfilter.</div>';
    return;
  }

  const address = els.addressInput?.value.trim();
  setSearchMessage(address ? `Sökningen är klar för ${address}.` : 'Sökningen är klar.', 'success');

  els.offers.innerHTML = offers.map((plan) => {
    const reward = calculateReward(plan.price);
    const isRecommended = recommended?.id === plan.id;
    const logo = providerLogos[plan.operator] || '';
    const accent = providerAccents[plan.operator] || 'var(--accent)';
    const features = (plan.features || ['Snabb installation', 'Stabil uppkoppling', 'Support ingår']).slice(0, 4);

    return `
      <article class="bredband-offer-card ${isRecommended ? 'recommended' : ''}" data-id="${plan.id}" style="--provider-accent: ${accent}">
        ${isRecommended ? '<div class="bredband-best-badge"><i class="fa-solid fa-star"></i> Bäst värde</div>' : ''}
        <div class="bredband-offer-selected"><i class="fa-solid fa-check"></i></div>

        <div class="bredband-offer-top">
          <div class="bredband-offer-brand">
            <div class="bredband-operator-logo-wrap">
              <img src="${logo}" alt="${plan.operator}" loading="lazy" decoding="async" />
            </div>
            <div>
              <p class="bredband-operator-name">${plan.operator}</p>
              <p class="bredband-operator-speed">${plan.speed}</p>
            </div>
          </div>

          <button class="bredband-reward-btn gift-btn" data-reward="${reward}" type="button">
            <span>Presentkort</span>
            <strong>${formatCurrency(reward)} kr</strong>
          </button>
        </div>

        <div class="bredband-price-row">
          <div>
            <p class="bredband-price">${formatCurrency(plan.price)} kr/mån</p>
            <p class="bredband-binding">${formatBinding(plan)}</p>
          </div>
          <div class="bredband-speed-chip">${formatCurrency(plan.speedMbps)} Mbit/s</div>
        </div>

        <ul class="bredband-feature-list">
          ${features.map((feature) => `<li><i class="fa-solid fa-check"></i><span>${feature}</span></li>`).join('')}
        </ul>

        <div class="bredband-offer-footer">
          ${
            plan.tv
              ? `<button class="bredband-tv-btn channels-btn" data-plan-id="${plan.id}" type="button"><i class="fa-solid fa-tv"></i> Se kanaler</button>`
              : '<div class="bredband-footer-note">Bredband utan TV-paket</div>'
          }
          <button class="bredband-choose-btn" type="button">Välj bredband</button>
        </div>
      </article>
    `;
  }).join('');

  restoreSelection();
};

const selectPlanById = (planId) => {
  const plan = bredbandPlans.find((item) => String(item.id) === String(planId));
  const card = document.querySelector(`.bredband-offer-card[data-id="${planId}"]`);

  if (!plan || !card) return;

  document.querySelectorAll('.bredband-offer-card').forEach((item) => item.classList.remove('active'));
  card.classList.add('active');
  selectedPlan = plan;

  sessionStorage.setItem('selectedBredbandId', plan.id);

  if (els.selectedPlanText) {
    els.selectedPlanText.textContent = `${plan.operator} · ${plan.speed} · ${formatCurrency(plan.price)} kr/mån`;
  }

  els.stickyBar?.classList.remove('hidden');

  if (els.continueBtn) {
    els.continueBtn.disabled = false;
  }
};

const restoreSelection = () => {
  const savedId = sessionStorage.getItem('selectedBredbandId');
  if (savedId) {
    selectPlanById(savedId);
  }
};

const openChannelsModal = (planId) => {
  const plan = bredbandPlans.find((item) => String(item.id) === String(planId));

  if (!plan?.tv?.channels?.length || !els.channelsModal || !els.channelsGrid || !els.channelsTitle) {
    return;
  }

  els.channelsTitle.textContent = `${plan.title || plan.operator} - Ingående kanaler`;
  els.channelsGrid.innerHTML = plan.tv.channels.map((channel) => `
    <div class="bredband-channel-card">
      <img src="${channelLogos[channel] || ''}" alt="${channel}" loading="lazy" decoding="async" />
      <span>${channel}</span>
    </div>
  `).join('');

  els.channelsModal.classList.remove('hidden');
  els.channelsModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeChannelsModal = () => {
  els.channelsModal?.classList.add('hidden');
  els.channelsModal?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

const openCart = () => {
  els.cartDrawer?.classList.remove('hidden');
  els.cartDrawer?.setAttribute('aria-hidden', 'false');
};

const closeBredbandCart = () => {
  els.cartDrawer?.classList.add('hidden');
  els.cartDrawer?.setAttribute('aria-hidden', 'true');
};

window.openCart = openCart;

const addSelectedPlanToCart = () => {
  if (!selectedPlan || !els.cartItems || !els.summaryArea || !els.totalPrice) return;

  const reward = calculateReward(selectedPlan.price);
  const logo = providerLogos[selectedPlan.operator] || '';
  const cartItem = {
    cartItemId: `${selectedPlan.id}-${Date.now()}`,
    offerId: selectedPlan.id,
    operator: selectedPlan.operator,
    title: selectedPlan.title || selectedPlan.speed || '5G-bredband',
    logo,
    data: selectedPlan.speed,
    price: selectedPlan.price || 0,
    pricePerPerson: 0,
    persons: 1,
    phoneLines: 0,
    productType: 'broadband',
    unitLabel: 'bredband',
    rewardTotal: reward,
    rewardMixLabel: `Presentkort ${formatCurrency(reward)} kr`,
    rewards: { Presentkort: reward },
    features: [
      formatBinding(selectedPlan),
      `${selectedPlan.technology.toUpperCase()} · ${formatCurrency(selectedPlan.speedMbps)} Mbit/s`,
      ...(selectedPlan.features || []),
    ].filter(Boolean),
  };

  const cart = window.DealettCart.appendItem(cartItem, {
    state: {
      persons: 1,
      operator: cartItem.operator,
      wishes: ['5G-bredband'],
      answers: {},
    },
  });

  window.DealettCart.renderDrawer({
    cartItems: els.cartItems,
    summaryArea: els.summaryArea,
    totalPrice: els.totalPrice,
  }, cart);

  openCart();
};

const coverageStyles = {
  telia: { color: '#6E2380', fillColor: '#6E2380' },
  tele2: { color: '#003A6E', fillColor: '#003A6E' },
  telenor: { color: '#00437E', fillColor: '#00437E' },
  tre: { color: '#E65C00', fillColor: '#E65C00' },
};

const coverageShapes = {
  telia: [
    [62.4, 15.6, 650000],
    [57.7, 12.0, 260000],
    [59.3, 18.1, 280000],
  ],
  tele2: [
    [61.7, 14.8, 560000],
    [55.8, 13.0, 230000],
    [59.0, 17.8, 250000],
  ],
  telenor: [
    [62.1, 16.0, 590000],
    [57.5, 12.4, 240000],
    [63.8, 20.2, 260000],
  ],
  tre: [
    [59.4, 18.0, 350000],
    [57.9, 12.3, 260000],
    [55.8, 13.4, 190000],
  ],
};

const setCoverageOperator = (operator) => {
  if (!coverageMap || !window.L) return;

  document.querySelectorAll('.coverage-operator').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.operator === operator);
  });

  if (coverageLayer) {
    coverageMap.removeLayer(coverageLayer);
  }

  const style = coverageStyles[operator] || coverageStyles.telia;
  const layers = (coverageShapes[operator] || coverageShapes.telia).map(([lat, lng, radius]) => L.circle([lat, lng], {
    ...style,
    radius,
    opacity: 0.58,
    fillOpacity: 0.18,
    weight: 2,
  }));

  coverageLayer = L.layerGroup(layers).addTo(coverageMap);
};

const initCoverageMap = () => {
  if (coverageMap || !window.L || !document.querySelector('#coverageLeafletMap')) return;

  const swedenBounds = [
    [55.0, 10.0],
    [69.5, 24.5],
  ];

  coverageMap = L.map('coverageLeafletMap', {
    zoomControl: false,
    attributionControl: false,
    maxBounds: swedenBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 5,
  }).setView([62.0, 15.0], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
  }).addTo(coverageMap);

  setCoverageOperator('telia');
};

const searchAddress = async (query) => {
  if (!query || !coverageMap || !window.L) return;

  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
  const data = await response.json();

  if (!data.length) return;

  const lat = Number(data[0].lat);
  const lon = Number(data[0].lon);

  coverageMap.setView([lat, lon], 14);

  if (searchMarker) {
    coverageMap.removeLayer(searchMarker);
  }

  searchMarker = L.marker([lat, lon]).addTo(coverageMap);
};

const openCoverageModal = () => {
  initCoverageMap();
  els.coverageModal?.classList.remove('hidden');
  els.coverageModal?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    coverageMap?.invalidateSize();
  }, 160);
};

const closeCoverageModal = () => {
  els.coverageModal?.classList.add('hidden');
  els.coverageModal?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

const bindEvents = () => {
  els.addressSearchForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    renderOffers();
    document.querySelector('#offersSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  [els.techFilter, els.speedFilter, els.sortSelect].forEach((element) => {
    element?.addEventListener('change', renderOffers);
  });

  document.addEventListener('click', (event) => {
    const giftButton = event.target.closest('.gift-btn');

    if (giftButton) {
      event.stopPropagation();
      const rewardValue = Number(giftButton.dataset.reward) || 0;
      localStorage.setItem('rewardChoice', JSON.stringify({ reward: rewardValue }));
      setSearchMessage(`Presentkort på ${formatCurrency(rewardValue)} kr sparat. Välj bredband och fortsätt till varukorgen.`, 'success');
      return;
    }

    const channelsButton = event.target.closest('.channels-btn');

    if (channelsButton) {
      event.stopPropagation();
      openChannelsModal(channelsButton.dataset.planId);
      return;
    }

    const chooseButton = event.target.closest('.bredband-choose-btn');

    if (chooseButton) {
      const card = chooseButton.closest('.bredband-offer-card');
      if (card) selectPlanById(card.dataset.id);
      return;
    }

    const card = event.target.closest('.bredband-offer-card');

    if (card) {
      selectPlanById(card.dataset.id);
    }

    if (event.target.matches('[data-modal-close]')) {
      closeChannelsModal();
    }
  });

  els.closeChannelsModal?.addEventListener('click', closeChannelsModal);
  els.continueBtn?.addEventListener('click', addSelectedPlanToCart);
  els.cartOverlay?.addEventListener('click', closeBredbandCart);
  els.closeCart?.addEventListener('click', closeBredbandCart);
  els.cartContinueBtn?.addEventListener('click', () => {
    window.location.href = 'varukorg.html';
  });

  els.openCoverageModal?.addEventListener('click', openCoverageModal);
  els.closeCoverageModal?.addEventListener('click', closeCoverageModal);
  els.coverageOverlay?.addEventListener('click', closeCoverageModal);

  document.querySelectorAll('.coverage-operator').forEach((button) => {
    button.addEventListener('click', () => setCoverageOperator(button.dataset.operator));
  });

  document.querySelector('#zoomInBtn')?.addEventListener('click', () => coverageMap?.zoomIn());
  document.querySelector('#zoomOutBtn')?.addEventListener('click', () => coverageMap?.zoomOut());
  document.querySelector('#resetViewBtn')?.addEventListener('click', () => coverageMap?.setView([62.0, 15.0], 5));
  document.querySelector('#clearLayerBtn')?.addEventListener('click', () => {
    if (searchMarker && coverageMap) {
      coverageMap.removeLayer(searchMarker);
      searchMarker = null;
    }
  });

  document.querySelector('#mapSearchBtn')?.addEventListener('click', () => {
    searchAddress(document.querySelector('#mapSearchInput')?.value.trim());
  });

  document.querySelector('#mapSearchInput')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchAddress(event.target.value.trim());
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeChannelsModal();
    closeCoverageModal();
    closeBredbandCart();
  });
};

const loadPlans = async () => {
  try {
    const response = await fetch('./data/5Gbredband.json');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    bredbandPlans = await response.json();
    renderOffers();
  } catch (error) {
    console.error('Kunde inte ladda 5Gbredband.json', error);
    setSearchMessage('Kunde inte ladda bredbandsdata.', 'error');
    els.offers.innerHTML = '<div class="bredband-empty-state">Kunde inte ladda bredbandsdata.</div>';
  }
};

bindEvents();
loadPlans();
