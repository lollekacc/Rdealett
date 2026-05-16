(() => {
  const els = {
    cartSummaryContainer: document.querySelector('#cartSummaryContainer'),
    contactSection: document.querySelector('#contactSection'),
    contactEmail: document.querySelector('#contactEmail'),
    contactPhone: document.querySelector('#contactPhone'),
    contactContinueBtn: document.querySelector('#contactContinueBtn'),
    contactMessage: document.querySelector('#contactMessage'),
    numberSection: document.querySelector('#numberSection'),
    phoneInputsContainer: document.querySelector('#phoneInputsContainer'),
    confirmNumbersBtn: document.querySelector('#confirmNumbersBtn'),
    numberMessage: document.querySelector('#numberMessage'),
    startDateSection: document.querySelector('#startDateSection'),
    startDateOptions: document.querySelector('#startDateOptions'),
    startDateText: document.querySelector('#startDateText'),
    startDateValue: document.querySelector('#startDateValue'),
    goToSignBtn: document.querySelector('#goToSignBtn'),
    signMessage: document.querySelector('#signMessage')
  };

  const currency = new Intl.NumberFormat('sv-SE');
  const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const providerAccents = {
    telia: '#6E2380',
    halebop: '#C8175C',
    telenor: '#00437E',
    tre: '#E65C00',
    tele2: '#003A6E'
  };

  const homepageOffers = {
    'telia-home-unlimited-4': {
      offerId: 'telia-home-unlimited-4',
      operator: 'Telia',
      logo: 'images/telia.png'
    },
    'halebop-home-unlimited-4': {
      offerId: 'halebop-home-unlimited-4',
      operator: 'Halebop',
      logo: 'images/halebop.webp'
    },
    'telenor-home-unlimited-4': {
      offerId: 'telenor-home-unlimited-4',
      operator: 'Telenor',
      logo: 'images/telenor.jpg'
    },
    'tre-home-unlimited-4': {
      offerId: 'tre-home-unlimited-4',
      operator: 'Tre',
      logo: 'images/tre.jpg'
    },
    'tele2-home-unlimited-4': {
      offerId: 'tele2-home-unlimited-4',
      operator: 'Tele2',
      logo: 'images/tele2.png'
    }
  };

  let cart = [];
  let selectedStartDate = '';

  const readJson = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const writeJson = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage failures so the checkout UI remains usable.
    }
  };

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const formatCurrency = (value) => currency.format(Math.max(Number(value) || 0, 0));

  const slugProvider = (operator) => String(operator || '')
    .toLowerCase()
    .replace(/\u00e5/g, 'a')
    .replace(/\u00e4/g, 'a')
    .replace(/\u00f6/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const getAccent = (operator) => providerAccents[slugProvider(operator)] || '#da392b';

  const sumRewards = (rewards) => {
    if (!rewards || typeof rewards !== 'object') return 0;
    return Object.values(rewards).reduce((sum, value) => sum + Math.max(Number(value) || 0, 0), 0);
  };

  const getHomepageOfferFromQuery = () => {
    const offerId = new URLSearchParams(window.location.search).get('offer');
    const offer = homepageOffers[offerId];

    if (!offer) return null;

    return {
      ...offer,
      cartItemId: `${offer.offerId}-${Date.now()}`,
      title: '4 abonnemang',
      data: 'Obegr\u00e4nsad surf',
      dataAmount: 9999,
      persons: 4,
      rewardTotal: 4000,
      rewardMixLabel: 'Presentkort 4 000 kr',
      rewards: { Presentkort: 4000 },
      features: ['Obegr\u00e4nsad surf', 'Samtal & SMS ing\u00e5r', '5G & eSIM']
    };
  };

  const getDataLabel = (item) => {
    if (item.data) return item.data;
    if (item.surf) return item.surf;

    const dataAmount = Number(item.dataAmount) || 0;
    if (dataAmount >= 999) return 'Obegr\u00e4nsad surf';
    if (dataAmount > 0) return `${dataAmount} GB surf`;

    return 'Mobilabonnemang';
  };

  const getPersons = (item, state) => {
    if (Number.isFinite(Number(item.persons)) && Number(item.persons) > 0) return Number(item.persons);
    if (Number(state?.persons)) return Number(state.persons);

    const titleMatch = String(item.title || item.members || '').match(/\d+/);
    return titleMatch ? Number(titleMatch[0]) : 1;
  };

  const normalizeItem = (item, state, rewardDistribution) => {
    const rewards = item.rewards && typeof item.rewards === 'object'
      ? item.rewards
      : rewardDistribution;
    const rewardTotal = Number(item.rewardTotal ?? item.reward) || sumRewards(rewards);
    const title = item.title || item.members || 'Abonnemang';
    const productType = item.productType || window.DealettCart?.getProductType(item) || 'mobile';
    const persons = getPersons(item, state);
    const phoneLines = Number.isFinite(Number(item.phoneLines))
      ? Math.max(Number(item.phoneLines), 0)
      : productType === 'broadband' ? 0 : persons;
    const unitLabel = item.unitLabel || (productType === 'broadband' ? 'bredband' : 'abonnemang');

    return {
      cartItemId: item.cartItemId || `${item.offerId || item.id || 'offer'}-${Date.now()}`,
      offerId: item.offerId || item.id || '',
      operator: item.operator || item.provider || 'Dealett',
      title,
      logo: item.logo || '',
      data: getDataLabel(item),
      dataAmount: Number(item.dataAmount) || 0,
      price: Number(item.price ?? item.finalPrice) || 0,
      pricePerPerson: Number(item.pricePerPerson) || 0,
      persons,
      phoneLines,
      productType,
      unitLabel,
      rewardTotal,
      rewardMixLabel: item.rewardMixLabel || (rewardTotal ? `Presentkort ${formatCurrency(rewardTotal)} kr` : ''),
      rewards: rewards || {},
      features: Array.isArray(item.features) && item.features.length
        ? item.features
        : ['Fria samtal och sms', '5G & eSIM']
    };
  };

  const loadCart = () => {
    const state = readJson('dealettState', {});
    const rewardDistribution = readJson('rewardDistribution', {});
    const queryOffer = getHomepageOfferFromQuery();

    if (queryOffer) {
      const normalizedOffer = normalizeItem(queryOffer, state, queryOffer.rewards);
      writeJson('dealettCart', [normalizedOffer]);
      writeJson('selectedOffer', {
        id: normalizedOffer.offerId,
        operator: normalizedOffer.operator,
        title: normalizedOffer.title,
        logo: normalizedOffer.logo,
        dataAmount: normalizedOffer.dataAmount,
        finalPrice: normalizedOffer.price,
        pricePerPerson: normalizedOffer.pricePerPerson,
        rewardTotal: normalizedOffer.rewardTotal,
        rewardMixLabel: normalizedOffer.rewardMixLabel
      });
      writeJson('rewardDistribution', normalizedOffer.rewards);
      return [normalizedOffer];
    }

    const storedCart = readJson('dealettCart', []);

    if (Array.isArray(storedCart) && storedCart.length) {
      return storedCart.map((item) => normalizeItem(item, state, rewardDistribution));
    }

    const selectedOffer = readJson('selectedOffer', null);
    if (selectedOffer) {
      return [normalizeItem({
        offerId: selectedOffer.id,
        operator: selectedOffer.operator,
        title: selectedOffer.title,
        logo: selectedOffer.logo,
        dataAmount: selectedOffer.dataAmount,
        price: selectedOffer.finalPrice,
        pricePerPerson: selectedOffer.pricePerPerson,
        rewardTotal: selectedOffer.rewardTotal,
        rewardMixLabel: selectedOffer.rewardMixLabel,
        rewards: rewardDistribution
      }, state, rewardDistribution)];
    }

    return [];
  };

  const renderEmptyCart = () => {
    if (!els.cartSummaryContainer) return;

    els.cartSummaryContainer.innerHTML = [
      '<div class="empty-cart-card">',
      '  <h3>Varukorgen \u00e4r tom</h3>',
      '  <p>V\u00e4lj ett abonnemangspaket p\u00e5 startsidan f\u00f6r att forts\u00e4tta h\u00e4r.</p>',
      '  <a class="primary-btn" href="index.html">Till startsidan</a>',
      '</div>'
    ].join('');

    els.contactSection?.classList.add('is-hidden');
  };

  const renderSummaryCard = (item) => {
    const accent = getAccent(item.operator);
    const accentSoft = `${accent}14`;
    const rewardLabel = item.rewardTotal ? `${formatCurrency(item.rewardTotal)} kr presentkort` : 'Presentkort v\u00e4ljs senare';
    const priceLabel = item.price > 0 ? `${formatCurrency(item.price)} kr/m\u00e5n` : rewardLabel;
    const totalLabel = item.price > 0 ? 'M\u00e5nadspris' : 'Presentkort';
    const priceNote = item.price > 0
      ? `Presentkort: ${formatCurrency(item.rewardTotal)} kr`
      : 'M\u00e5nadspris bekr\u00e4ftas vid signering.';
    const countIcon = item.productType === 'broadband' ? 'fa-wifi' : 'fa-users';

    return [
      `<article class="cart-summary-card" style="--cart-accent:${accent}; --cart-accent-soft:${accentSoft};">`,
      '  <div class="cart-summary-top">',
      '    <div class="cart-summary-logo">',
      item.logo ? `      <img src="${escapeHtml(item.logo)}" alt="${escapeHtml(item.operator)}" loading="lazy" decoding="async" />` : '',
      '    </div>',
      '    <div class="cart-summary-main">',
      `      <h3>${escapeHtml(item.operator)} ${escapeHtml(item.title)}</h3>`,
      `      <p>${escapeHtml(item.data)}</p>`,
      '      <div class="cart-summary-meta">',
      `        <span class="cart-summary-pill"><i class="fa-solid ${countIcon}"></i>${item.persons} ${escapeHtml(item.unitLabel || 'abonnemang')}</span>`,
      `        <span class="cart-summary-pill"><i class="fa-solid fa-gift"></i>${escapeHtml(rewardLabel)}</span>`,
      item.pricePerPerson ? `        <span class="cart-summary-pill"><i class="fa-solid fa-tag"></i>${formatCurrency(item.pricePerPerson)} kr/person</span>` : '',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div class="cart-summary-bottom">',
      '    <ul class="cart-feature-list">',
      ...item.features.map((feature) => `      <li><i class="fa-solid fa-check"></i>${escapeHtml(feature)}</li>`),
      '    </ul>',
      '    <div class="cart-total-box">',
      `      <span>${totalLabel}</span>`,
      `      <strong>${escapeHtml(priceLabel)}</strong>`,
      `      <p class="cart-price-note">${escapeHtml(priceNote)}</p>`,
      '    </div>',
      '  </div>',
      '</article>'
    ].join('');
  };

  const renderCartSummary = () => {
    if (!els.cartSummaryContainer) return;

    if (!cart.length) {
      renderEmptyCart();
      return;
    }

    els.cartSummaryContainer.innerHTML = cart.map(renderSummaryCard).join('');
  };

  const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isPhoneValid = (value) => /^\+?\d[\d\s-]{6,}$/.test(value);

  const showMessage = (element, message) => {
    if (element) element.textContent = message;
  };

  const scrollToSection = (section) => {
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getPhoneLineCount = () => cart.reduce((sum, item) => sum + Math.max(Number(item.phoneLines) || 0, 0), 0);

  const renderPhoneInputs = () => {
    if (!els.phoneInputsContainer || !els.confirmNumbersBtn) return;

    const count = getPhoneLineCount();
    if (count <= 0) {
      els.phoneInputsContainer.replaceChildren();
      els.confirmNumbersBtn.classList.add('is-hidden');
      return;
    }

    const fragment = document.createDocumentFragment();

    for (let index = 1; index <= count; index += 1) {
      const field = document.createElement('div');
      field.className = 'phone-input-field';

      const label = document.createElement('label');
      label.setAttribute('for', `transferPhone${index}`);
      label.textContent = `Nummer ${index}`;

      const input = document.createElement('input');
      input.id = `transferPhone${index}`;
      input.type = 'tel';
      input.placeholder = '07XXXXXXXX';
      input.autocomplete = 'tel';
      input.inputMode = 'tel';

      field.append(label, input);
      fragment.append(field);
    }

    els.phoneInputsContainer.replaceChildren(fragment);
    els.confirmNumbersBtn.classList.remove('is-hidden');
  };

  const addDays = (days) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return date;
  };

  const toIsoDate = (date) => date.toISOString().slice(0, 10);

  const updateStartDate = (value) => {
    selectedStartDate = value;

    document.querySelectorAll('.start-date-choice').forEach((choice) => {
      const input = choice.querySelector('input');
      choice.classList.toggle('is-selected', input?.value === value);
    });

    const selected = [...document.querySelectorAll('input[name="startDate"]')]
      .find((input) => input.value === value);
    const label = selected?.dataset.label || value;

    if (els.startDateValue && els.startDateText) {
      els.startDateValue.textContent = label;
      els.startDateText.classList.remove('is-hidden');
    }
  };

  const renderStartDates = () => {
    if (!els.startDateOptions) return;

    const options = [
      {
        value: 'snarast',
        title: 'Snarast m\u00f6jligt',
        text: 'Vi startar processen direkt efter signering.'
      },
      {
        value: toIsoDate(addDays(14)),
        title: dateFormatter.format(addDays(14)),
        text: 'Passar om du vill ha lite marginal.'
      },
      {
        value: toIsoDate(addDays(30)),
        title: dateFormatter.format(addDays(30)),
        text: 'Bra vid planerat operat\u00f6rsbyte.'
      }
    ];

    els.startDateOptions.innerHTML = options.map((option, index) => [
      `<label class="start-date-choice${index === 0 ? ' is-selected' : ''}">`,
      `  <input type="radio" name="startDate" value="${escapeHtml(option.value)}" data-label="${escapeHtml(option.title)}"${index === 0 ? ' checked' : ''} />`,
      '  <span>',
      `    <strong>${escapeHtml(option.title)}</strong>`,
      `    <span>${escapeHtml(option.text)}</span>`,
      '  </span>',
      '</label>'
    ].join('')).join('');

    updateStartDate(options[0].value);
  };

  const getContact = () => ({
    email: els.contactEmail?.value.trim() || '',
    phone: els.contactPhone?.value.trim() || ''
  });

  const saveCheckout = (extra = {}) => {
    const existing = readJson('dealettCheckout', {});
    writeJson('dealettCheckout', {
      ...existing,
      cart,
      contact: getContact(),
      startDate: selectedStartDate,
      updatedAt: new Date().toISOString(),
      ...extra
    });
  };

  const handleContactContinue = () => {
    const contact = getContact();

    if (!isEmailValid(contact.email)) {
      showMessage(els.contactMessage, 'Ange en giltig mejladress.');
      els.contactEmail?.focus();
      return;
    }

    if (!isPhoneValid(contact.phone)) {
      showMessage(els.contactMessage, 'Ange ett giltigt mobilnummer.');
      els.contactPhone?.focus();
      return;
    }

    showMessage(els.contactMessage, '');
    saveCheckout();

    if (getPhoneLineCount() > 0) {
      renderPhoneInputs();
      els.numberSection?.classList.remove('is-hidden');
      scrollToSection(els.numberSection);
      return;
    }

    saveCheckout({ phoneNumbers: [] });
    els.startDateSection?.classList.remove('is-hidden');
    scrollToSection(els.startDateSection);
  };

  const handleConfirmNumbers = () => {
    const inputs = [...(els.phoneInputsContainer?.querySelectorAll('input') || [])];
    const phoneNumbers = inputs.map((input) => input.value.trim());
    const invalidInput = inputs.find((input) => !isPhoneValid(input.value.trim()));

    if (invalidInput) {
      showMessage(els.numberMessage, 'Fyll i alla nummer som ska flyttas.');
      invalidInput.focus();
      return;
    }

    showMessage(els.numberMessage, '');
    saveCheckout({ phoneNumbers });
    els.startDateSection?.classList.remove('is-hidden');
    scrollToSection(els.startDateSection);
  };

  const handleSignContinue = () => {
    if (!selectedStartDate) {
      showMessage(els.signMessage, 'V\u00e4lj startdatum innan signering.');
      return;
    }

    saveCheckout({ readyForSigning: true });
    showMessage(els.signMessage, 'Uppgifterna \u00e4r sparade. Du kan forts\u00e4tta till signering.');
    if (els.goToSignBtn) {
      els.goToSignBtn.textContent = 'Redo f\u00f6r signering';
    }
  };

  const bindEvents = () => {
    els.contactContinueBtn?.addEventListener('click', handleContactContinue);
    els.confirmNumbersBtn?.addEventListener('click', handleConfirmNumbers);
    els.goToSignBtn?.addEventListener('click', handleSignContinue);

    els.startDateOptions?.addEventListener('change', (event) => {
      if (event.target.name === 'startDate') {
        updateStartDate(event.target.value);
        saveCheckout();
      }
    });
  };

  const init = () => {
    cart = loadCart();
    renderCartSummary();
    renderStartDates();
    bindEvents();
  };

  init();
})();
