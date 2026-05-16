(() => {
const offersContainer = document.querySelector('#offers-container');
const rewardSection = document.querySelector('#rewardSection');
const rewardGrid = document.querySelector('#rewardGrid');
const totalReward = document.querySelector('#totalReward');
const remainingSum = document.querySelector('#remainingSum');
const rewardProgressFill = document.querySelector('#rewardProgressFill');
const rewardContinueBtn = document.querySelector('#rewardContinueBtn');

const currency = new Intl.NumberFormat('sv-SE');

const offers = [
  {
    provider: 'Telia',
    logo: 'images/telia.png',
    accent: '#6E2380',
    reward: 4000,
  },
  {
    provider: 'Halebop',
    logo: 'images/halebop.webp',
    accent: '#C8175C',
    reward: 4000,
  },
  {
    provider: 'Telenor',
    logo: 'images/telenor.jpg',
    accent: '#00437E',
    reward: 4000,
  },
  {
    provider: 'Tre',
    logo: 'images/tre.jpg',
    accent: '#E65C00',
    reward: 4000,
  },
  {
    provider: 'Tele2',
    logo: 'images/tele2.png',
    accent: '#003A6E',
    reward: 4000,
  },
];

const giftCards = ['Apollo', 'H&M', 'Hotel', 'ICA Maxi', 'Mio', 'Zalando', 'Elgiganten', 'Ticketmaster'];

let selectedOffer = null;
let plansCache = null;

const formatCurrency = (value) => currency.format(Math.max(Number(value) || 0, 0));

const createElement = (tag, className, text) => {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text) {
    element.textContent = text;
  }

  return element;
};

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const ensureCartDrawer = () => {
  if (document.querySelector('#cartDrawer')) return;

  const drawer = document.createElement('div');
  drawer.id = 'cartDrawer';
  drawer.className = 'cart-drawer hidden';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML = [
    '<div id="cartOverlay" class="cart-drawer-overlay"></div>',
    '<aside class="cart-drawer-panel" aria-label="Din varukorg">',
    '  <div class="cart-drawer-head">',
    '    <h2>Din varukorg</h2>',
    '    <button id="closeCart" class="cart-drawer-close" type="button" aria-label="St&auml;ng varukorg">&times;</button>',
    '  </div>',
    '  <div id="cartItems" class="cart-drawer-items"></div>',
    '  <div class="cart-drawer-footer">',
    '    <div id="summaryArea" class="cart-drawer-summary"></div>',
    '    <div class="cart-drawer-total-row">',
    '      <span>Totalt</span>',
    '      <strong id="totalPrice">0 kr/m&aring;n</strong>',
    '    </div>',
    '    <button id="cartBankIdButton" class="adeala-btn full-btn" type="button">Fortsätt till varukorg</button>',
    '  </div>',
    '</aside>',
  ].join('');

  document.body.append(drawer);
};

const getCartDrawerElements = () => ({
  cartDrawer: document.querySelector('#cartDrawer'),
  cartItems: document.querySelector('#cartItems'),
  summaryArea: document.querySelector('#summaryArea'),
  totalPrice: document.querySelector('#totalPrice'),
  cartOverlay: document.querySelector('#cartOverlay'),
  closeCart: document.querySelector('#closeCart'),
  cartBankIdButton: document.querySelector('#cartBankIdButton'),
});

const closeCartDrawer = () => {
  const { cartDrawer } = getCartDrawerElements();
  cartDrawer?.classList.add('hidden');
  cartDrawer?.setAttribute('aria-hidden', 'true');
};

const renderCartDrawer = (cartItem) => {
  ensureCartDrawer();

  const { cartItems, summaryArea, totalPrice } = getCartDrawerElements();
  if (!cartItems || !summaryArea || !totalPrice) return;

  const rewardEntries = Object.entries(cartItem.rewards || {}).filter(([, value]) => Number(value) > 0);
  const rewardText = rewardEntries.length
    ? rewardEntries.map(([name, value]) => `${escapeHtml(name)} ${formatCurrency(value)} kr`).join(', ')
    : `${formatCurrency(cartItem.rewardTotal)} kr`;
  const features = (cartItem.features || []).filter(Boolean).map(escapeHtml).join(' · ');

  cartItems.innerHTML = `
    <div class="cart-line">
      <strong>${escapeHtml(cartItem.operator)} ${escapeHtml(cartItem.title)}</strong>
      ${cartItem.data ? `<span>${escapeHtml(cartItem.data)}</span>` : ''}
      ${features ? `<span>${features}</span>` : ''}
      ${cartItem.addon ? `<span>Tillägg: ${escapeHtml(cartItem.addon.title)}</span>` : ''}
      ${cartItem.logo ? `<img src="${escapeHtml(cartItem.logo)}" alt="${escapeHtml(cartItem.operator)}" style="max-width: 120px; max-height: 42px; object-fit: contain;" />` : ''}
    </div>
  `;

  summaryArea.innerHTML = `
    <div>Presentkort: ${rewardText}</div>
    <div>Månadspris: ${formatCurrency(cartItem.price)} kr/mån</div>
  `;
  totalPrice.textContent = `${formatCurrency(cartItem.price)} kr/mån`;
};

const openCartDrawer = (cartItem) => {
  renderCartDrawer(cartItem);

  const { cartDrawer, cartBankIdButton } = getCartDrawerElements();
  cartDrawer?.classList.remove('hidden');
  cartDrawer?.setAttribute('aria-hidden', 'false');
  cartBankIdButton?.focus();
};

const bindCartDrawerEvents = () => {
  ensureCartDrawer();

  const { cartOverlay, closeCart, cartBankIdButton } = getCartDrawerElements();
  cartOverlay?.addEventListener('click', closeCartDrawer);
  closeCart?.addEventListener('click', closeCartDrawer);
  cartBankIdButton?.addEventListener('click', () => {
    window.location.href = 'varukorg.html';
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeCartDrawer();
    }
  });
};

const getOperatorOffer = (operator) => offers.find((offer) => offer.provider === operator) || {};

const getPlanDataLabel = (plan) => {
  if (plan.data) return plan.data;
  if (Number(plan.dataAmount) >= 999) return 'Obegr\u00e4nsad';
  if (Number(plan.dataAmount) > 0) return `${plan.dataAmount} GB`;
  return plan.title || 'Mobilabonnemang';
};

const loadPlans = async () => {
  if (plansCache) return plansCache;

  const response = await fetch('./data/plans.json');
  plansCache = await response.json();
  return plansCache;
};

const buildSelectedPlanOffer = (plan, answers) => {
  const operatorOffer = getOperatorOffer(plan.operator);

  return {
    provider: plan.operator,
    operator: plan.operator,
    title: plan.title,
    data: getPlanDataLabel(plan),
    price: plan.price,
    logo: plan.logo,
    reward: operatorOffer.reward || 4000,
    accent: operatorOffer.accent || 'var(--accent)',
    answers,
  };
};

const syncAddonButtons = () => {
  offersContainer?.querySelectorAll('[data-addon-button]').forEach((button) => {
    button.disabled = !selectedOffer;
    button.textContent = selectedOffer ? 'Lägg till' : 'Välj abonnemang först';
  });
};

const updateRewardState = () => {
  if (!selectedOffer || !rewardGrid || !remainingSum || !rewardProgressFill || !rewardContinueBtn) {
    return;
  }

  const inputs = [...rewardGrid.querySelectorAll('input')];
  const allocated = inputs.reduce((sum, input) => sum + Math.max(Number(input.value) || 0, 0), 0);
  const remaining = Math.max(selectedOffer.reward - allocated, 0);
  const progress = selectedOffer.reward ? Math.min((allocated / selectedOffer.reward) * 100, 100) : 0;

  remainingSum.textContent = formatCurrency(remaining);
  rewardProgressFill.style.width = `${progress}%`;
  rewardContinueBtn.disabled = allocated !== selectedOffer.reward;
};

const renderRewards = (offer) => {
  if (!rewardGrid || !totalReward || !remainingSum || !rewardProgressFill || !rewardContinueBtn) {
    return;
  }

  rewardGrid.replaceChildren();
  totalReward.textContent = formatCurrency(offer.reward);
  remainingSum.textContent = formatCurrency(offer.reward);
  rewardProgressFill.style.width = '0%';
  rewardContinueBtn.disabled = true;

  giftCards.forEach((name) => {
    const choice = createElement('label', 'reward-choice');
    const label = createElement('strong', '', name);
    const input = document.createElement('input');

    input.type = 'number';
    input.min = '0';
    input.step = '100';
    input.value = '0';
    input.inputMode = 'numeric';
    input.setAttribute('aria-label', name);
    input.addEventListener('input', updateRewardState);

    choice.append(label, input);
    rewardGrid.append(choice);
  });
};

const selectOffer = (offer, card) => {
  selectedOffer = { ...offer, addon: null };

  offersContainer?.querySelectorAll('.offer-card').forEach((item) => {
    item.classList.remove('is-selected');
  });

  card.classList.add('is-selected');
  rewardSection?.classList.remove('is-hidden');
  renderRewards(offer);
  syncAddonButtons();
  rewardSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const selectAddon = (addon, card) => {
  if (!selectedOffer) return;

  selectedOffer.addon = {
    title: addon.title,
    price: addon.price,
    addonPrice: addon.addonPrice,
    text: addon.text,
  };

  offersContainer?.querySelectorAll('.offer-card--addon').forEach((item) => {
    item.classList.remove('is-selected');
  });

  card.classList.add('is-selected');
  card.querySelector('[data-addon-button]').textContent = 'Tillagd';
};

const resetOfferQuestions = () => {
  offersContainer?.querySelectorAll('.offer-card').forEach((card) => {
    card.classList.remove('is-answering', 'is-selected');
    card.querySelector('.offer-card-questions')?.remove();
    card.querySelector('.offer-card-details')?.classList.remove('is-hidden');
  });
};

const renderPlanOffers = async (offer, answers) => {
  if (!offersContainer) return;

  offersContainer.innerHTML = '<div class="offers-loading">H\u00e4mtar abonnemang...</div>';

  try {
    const plans = await loadPlans();
    const operatorPlans = plans
      .filter((plan) => plan.category === 'mobil' && !plan.isFamilyPlan && plan.operator === offer.provider)
      .sort((left, right) => (left.dataAmount || 0) - (right.dataAmount || 0));
    const addonPlan = plans.find((plan) =>
      plan.category === 'mobil' &&
      plan.isFamilyPlan &&
      plan.familyPriceType === 'addon' &&
      plan.operator === offer.provider
    );

    const fragment = document.createDocumentFragment();

    operatorPlans.forEach((plan) => {
      const selectedPlan = buildSelectedPlanOffer(plan, answers);
      const card = createElement('article', 'offer-card offer-card--plan');
      card.style.setProperty('--offer-accent', selectedPlan.accent);

      const logoWrap = createElement('div', 'offer-card-logo');
      const logo = document.createElement('img');
      logo.src = plan.logo;
      logo.alt = plan.operator;
      logo.loading = 'lazy';
      logo.decoding = 'async';
      logoWrap.append(logo);

      const copy = createElement('div', 'offer-card-copy');
      copy.append(
        createElement('h3', '', plan.title),
        createElement('p', '', plan.text || 'Fria samtal och sms')
      );

      const meta = createElement('ul', 'offer-card-meta');
      [
        `${getPlanDataLabel(plan)} surf`,
        `${formatCurrency(plan.price)} kr/m\u00e5n`,
        `${formatCurrency(selectedPlan.reward)} kr presentkort`,
      ].forEach((item) => {
        meta.append(createElement('li', '', item));
      });

      const button = createElement('button', 'offer-card-action', 'V\u00e4lj abonnemang');
      button.type = 'button';
      button.addEventListener('click', () => selectOffer(selectedPlan, card));

      card.append(logoWrap, copy, meta, button);
      fragment.append(card);
    });

    if (addonPlan) {
      const card = createElement('article', 'offer-card offer-card--addon');
      card.style.setProperty('--offer-accent', offer.accent);

      const logoWrap = createElement('div', 'offer-card-logo');
      const logo = document.createElement('img');
      logo.src = addonPlan.logo;
      logo.alt = addonPlan.operator;
      logo.loading = 'lazy';
      logo.decoding = 'async';
      logoWrap.append(logo);

      const copy = createElement('div', 'offer-card-copy');
      copy.append(
        createElement('h3', '', addonPlan.title),
        createElement('p', '', addonPlan.text || `Extra familjemedlem för ${formatCurrency(addonPlan.price)} kr/mån`)
      );

      const meta = createElement('ul', 'offer-card-meta');
      [
        `${formatCurrency(addonPlan.addonPrice ?? addonPlan.price)} kr/mån`,
        'Extra familjemedlem',
      ].forEach((item) => {
        meta.append(createElement('li', '', item));
      });

      const button = createElement('button', 'offer-card-action', 'Välj abonnemang först');
      button.type = 'button';
      button.disabled = true;
      button.dataset.addonButton = 'true';
      button.addEventListener('click', () => selectAddon(addonPlan, card));

      card.append(logoWrap, copy, meta, button);
      fragment.append(card);
    }

    offersContainer.replaceChildren(fragment);
    syncAddonButtons();
  } catch {
    offersContainer.innerHTML = '<div class="offers-loading">Kunde inte h\u00e4mta abonnemang just nu.</div>';
  }
};

const finishOfferQuestions = (offer, answers) => {
  offer.answers = answers;
  renderPlanOffers(offer, answers);
};

const renderBindingQuestion = (offer, card, answers) => {
  const questionBox = card.querySelector('.offer-card-questions');
  if (!questionBox) return;

  questionBox.innerHTML = [
    '<p class="offer-question-kicker">Fr&aring;ga 2 av 2</p>',
    '<h4>Har du bindningstid?</h4>',
    '<div class="offer-question-actions">',
    '  <button type="button" data-binding="yes">Ja</button>',
    '  <button type="button" data-binding="no">Nej</button>',
    '  <button type="button" data-binding="unknown">Vet ej</button>',
    '</div>',
    '<div class="offer-binding-date is-hidden">',
    '  <label for="bindingEndDate">N&auml;r upph&ouml;r den?</label>',
    '  <input id="bindingEndDate" type="date" />',
    '  <button class="offer-card-action" type="button" data-finish-date>Forts&auml;tt</button>',
    '</div>',
  ].join('');

  questionBox.querySelectorAll('[data-binding]').forEach((button) => {
    button.addEventListener('click', () => {
      answers.binding = button.dataset.binding;

      if (answers.binding === 'yes') {
        questionBox.querySelector('.offer-binding-date')?.classList.remove('is-hidden');
        questionBox.querySelector('#bindingEndDate')?.focus();
        return;
      }

      answers.bindingEndDate = null;
      finishOfferQuestions(offer, answers);
    });
  });

  questionBox.querySelector('[data-finish-date]')?.addEventListener('click', () => {
    const dateInput = questionBox.querySelector('#bindingEndDate');
    answers.bindingEndDate = dateInput?.value || null;

    if (!answers.bindingEndDate) {
      dateInput?.focus();
      return;
    }

    finishOfferQuestions(offer, answers);
  });
};

const startOfferQuestions = (offer, card) => {
  resetOfferQuestions();
  selectedOffer = null;
  rewardSection?.classList.add('is-hidden');

  const answers = {};
  const questionBox = createElement('div', 'offer-card-questions');
  questionBox.innerHTML = [
    '<p class="offer-question-kicker">Fr&aring;ga 1 av 2</p>',
    `<h4>Har du ${offer.provider} idag?</h4>`,
    '<div class="offer-question-actions">',
    '  <button type="button" data-current-operator="yes">Ja</button>',
    '  <button type="button" data-current-operator="no">Nej</button>',
    '</div>',
  ].join('');

  card.classList.add('is-answering');
  card.querySelector('.offer-card-details')?.classList.add('is-hidden');
  card.append(questionBox);

  questionBox.querySelectorAll('[data-current-operator]').forEach((button) => {
    button.addEventListener('click', () => {
      answers.currentOperator = button.dataset.currentOperator;
      renderBindingQuestion(offer, card, answers);
    });
  });
};

const renderOffers = () => {
  if (!offersContainer) {
    return;
  }

  const fragment = document.createDocumentFragment();

  offers.forEach((offer) => {
    const card = createElement('article', 'offer-card');
    card.style.setProperty('--offer-accent', offer.accent);

    const logoWrap = createElement('div', 'offer-card-logo');
    const logo = document.createElement('img');
    logo.src = offer.logo;
    logo.alt = offer.provider;
    logo.loading = 'lazy';
    logo.decoding = 'async';
    logoWrap.append(logo);

    const details = createElement('div', 'offer-card-details');
    const copy = createElement('div');
    copy.append(createElement('p', '', 'Obegr\u00e4nsad surf'));

    const meta = createElement('ul', 'offer-card-meta');
    ['Fria samtal och sms', '5G & eSIM', `${formatCurrency(offer.reward)} kr presentkort`].forEach((item) => {
      meta.append(createElement('li', '', item));
    });

    const button = createElement('button', 'offer-card-action', 'V\u00e4lj');
    button.type = 'button';
    button.addEventListener('click', () => startOfferQuestions(offer, card));

    details.append(copy, meta, button);
    card.append(logoWrap, details);
    fragment.append(card);
  });

  offersContainer.replaceChildren(fragment);
};

rewardContinueBtn?.addEventListener('click', () => {
  if (!selectedOffer || !rewardGrid) {
    return;
  }

  const allocations = [...rewardGrid.querySelectorAll('.reward-choice')]
    .map((choice) => {
      const name = choice.querySelector('strong')?.textContent || '';
      const value = Math.max(Number(choice.querySelector('input')?.value) || 0, 0);
      return { name, value };
    })
    .filter((item) => item.value > 0);
  const rewards = allocations.reduce((result, item) => {
    result[item.name] = item.value;
    return result;
  }, {});

  const cartItem = {
    cartItemId: `${selectedOffer.operator || selectedOffer.provider}-${Date.now()}`,
    offerId: selectedOffer.title,
    operator: selectedOffer.operator || selectedOffer.provider,
    title: selectedOffer.title || selectedOffer.data || 'Mobilabonnemang',
    logo: selectedOffer.logo,
    data: selectedOffer.data,
    price: selectedOffer.price || 0,
    pricePerPerson: selectedOffer.pricePerPerson || 0,
    rewardTotal: selectedOffer.reward,
    rewardMixLabel: `Presentkort ${formatCurrency(selectedOffer.reward)} kr`,
    rewards,
    addon: selectedOffer.addon || null,
    answers: selectedOffer.answers || {},
    features: [
      'Fria samtal och sms',
      '5G & eSIM',
      selectedOffer.addon ? selectedOffer.addon.title : '',
    ].filter(Boolean),
  };

  localStorage.setItem('dealettCart', JSON.stringify([cartItem]));
  localStorage.setItem('selectedOffer', JSON.stringify({
    id: cartItem.offerId,
    operator: cartItem.operator,
    title: cartItem.title,
    logo: cartItem.logo,
    finalPrice: cartItem.price,
    pricePerPerson: cartItem.pricePerPerson,
    rewardTotal: cartItem.rewardTotal,
    rewardMixLabel: cartItem.rewardMixLabel,
  }));
  localStorage.setItem('dealettState', JSON.stringify({
    persons: 1,
    operator: cartItem.operator,
    wishes: ['Mobilabonnemang'],
    answers: cartItem.answers,
  }));
  localStorage.setItem('rewardDistribution', JSON.stringify(rewards));
  localStorage.removeItem('rewardChoice');
  openCartDrawer(cartItem);
});

bindCartDrawerEvents();
renderOffers();
})();
