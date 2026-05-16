const offersContainer = document.querySelector('#offers-container');
const rewardSection = document.querySelector('#rewardSection');
const rewardGrid = document.querySelector('#rewardGrid');
const totalReward = document.querySelector('#totalReward');
const remainingSum = document.querySelector('#remainingSum');
const rewardProgressFill = document.querySelector('#rewardProgressFill');
const rewardContinueBtn = document.querySelector('#rewardContinueBtn');
const cartDrawer = document.querySelector('#cartDrawer');
const cartItems = document.querySelector('#cartItems');
const summaryArea = document.querySelector('#summaryArea');
const totalPrice = document.querySelector('#totalPrice');

const currency = new Intl.NumberFormat('sv-SE');

const offers = [
  {
    provider: 'Telia',
    label: 'Telia Familj',
    logo: 'images/telia.png',
    accent: '#6E2380',
    members: '4 abonnemang',
    surf: 'Obegr\u00e4nsad surf',
    reward: 5000,
  },
  {
    provider: 'Halebop',
    label: 'Halebop Familj',
    logo: 'images/halebop.webp',
    accent: '#C8175C',
    members: '3 abonnemang',
    surf: '100 GB att dela',
    reward: 3500,
  },
  {
    provider: 'Telenor',
    label: 'Telenor Familj',
    logo: 'images/telenor.jpg',
    accent: '#00437E',
    members: '4 abonnemang',
    surf: 'Obegr\u00e4nsad surf',
    reward: 5000,
  },
  {
    provider: 'Tre',
    label: 'Tre Familj',
    logo: 'images/tre.jpg',
    accent: '#E65C00',
    members: '5 abonnemang',
    surf: 'Obegr\u00e4nsad surf',
    reward: 6000,
  },
  {
    provider: 'Tele2',
    label: 'Tele2 Familj',
    logo: 'images/tele2.png',
    accent: '#003A6E',
    members: '4 abonnemang',
    surf: 'Obegr\u00e4nsad surf',
    reward: 5000,
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

const buildFamilyPlanOffer = (basePlan, addonPlan, offer, answers) => {
  const persons = Number(answers.persons) || 1;
  const addonPrice = Number(addonPlan?.addonPrice ?? addonPlan?.price) || 0;
  const extraCount = Math.max(persons - 1, 0);
  const totalMonthlyPrice = Number(basePlan.price) + extraCount * addonPrice;

  return {
    provider: offer.label,
    operator: offer.provider,
    title: basePlan.title,
    data: getPlanDataLabel(basePlan),
    members: `${persons} abonnemang`,
    surf: `${getPlanDataLabel(basePlan)} surf`,
    price: totalMonthlyPrice,
    pricePerPerson: Math.round(totalMonthlyPrice / persons),
    addonPrice,
    logo: basePlan.logo,
    reward: offer.reward,
    accent: offer.accent,
    answers,
  };
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
  selectedOffer = offer;

  offersContainer?.querySelectorAll('.offer-card').forEach((item) => {
    item.classList.remove('is-selected');
  });

  card.classList.add('is-selected');
  rewardSection?.classList.remove('is-hidden');
  renderRewards(offer);
  rewardSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  offersContainer.innerHTML = '<div class="offers-loading">H\u00e4mtar familjepaket...</div>';

  try {
    const plans = await loadPlans();
    const basePlans = plans
      .filter((plan) => plan.category === 'mobil' && !plan.isFamilyPlan && plan.operator === offer.provider)
      .sort((left, right) => (left.dataAmount || 0) - (right.dataAmount || 0));
    const addonPlan = plans.find((plan) =>
      plan.category === 'mobil' &&
      plan.isFamilyPlan &&
      plan.familyPriceType === 'addon' &&
      plan.operator === offer.provider
    );
    const fragment = document.createDocumentFragment();

    basePlans.forEach((plan) => {
      const selectedPlan = buildFamilyPlanOffer(plan, addonPlan, offer, answers);
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
        createElement('p', '', `${selectedPlan.members} | ${selectedPlan.surf}`)
      );

      const meta = createElement('ul', 'offer-card-meta');
      [
        `${formatCurrency(selectedPlan.price)} kr/m\u00e5n totalt`,
        `${formatCurrency(selectedPlan.pricePerPerson)} kr/person`,
        `${formatCurrency(selectedPlan.reward)} kr presentkort`,
        addonPlan ? `Extra: ${formatCurrency(selectedPlan.addonPrice)} kr/st` : '',
      ].filter(Boolean).forEach((item) => {
        meta.append(createElement('li', '', item));
      });

      const button = createElement('button', 'offer-card-action', 'V\u00e4lj familjepaket');
      button.type = 'button';
      button.addEventListener('click', () => selectOffer(selectedPlan, card));

      card.append(logoWrap, copy, meta, button);
      fragment.append(card);
    });

    offersContainer.replaceChildren(fragment);
  } catch {
    offersContainer.innerHTML = '<div class="offers-loading">Kunde inte h\u00e4mta familjepaket just nu.</div>';
  }
};

const finishOfferQuestions = (offer, answers) => {
  offer.answers = answers;
  renderPlanOffers(offer, answers);
};

const renderCustomerQuestion = (offer, card, answers) => {
  const questionBox = card.querySelector('.offer-card-questions');
  if (!questionBox) return;

  questionBox.innerHTML = [
    '<p class="offer-question-kicker">Fr&aring;ga 2 av 2</p>',
    '<h4>Har n&aring;gon av er redan abonnemang hos denna operat&ouml;r idag?</h4>',
    '<div class="family-status-options">',
    '  <button type="button" data-customer-status="none">Nej, alla blir nya kunder</button>',
    '  <button type="button" data-customer-status="partial">Ja, vissa har redan abonnemang</button>',
    '  <button type="button" data-customer-status="all">Ja, alla har redan abonnemang</button>',
    '</div>',
    '<div class="family-new-customers is-hidden">',
    '  <label for="newCustomersSelect">Hur m&aring;nga blir nya kunder?</label>',
    '  <select id="newCustomersSelect"></select>',
    '  <button class="offer-card-action" type="button" data-finish-customers>Forts&auml;tt</button>',
    '</div>',
  ].join('');

  const newCustomersBox = questionBox.querySelector('.family-new-customers');
  const select = questionBox.querySelector('#newCustomersSelect');
  const maxNewCustomers = Math.max((Number(answers.persons) || 1) - 1, 1);

  if (select) {
    select.innerHTML = '<option value="">V\u00e4lj antal</option>';

    for (let count = 1; count <= maxNewCustomers; count += 1) {
      select.append(new Option(String(count), String(count)));
    }
  }

  questionBox.querySelectorAll('[data-customer-status]').forEach((button) => {
    button.addEventListener('click', () => {
      answers.customerStatus = button.dataset.customerStatus;

      if (answers.customerStatus === 'partial') {
        newCustomersBox?.classList.remove('is-hidden');
        select?.focus();
        return;
      }

      answers.newCustomers = answers.customerStatus === 'none' ? answers.persons : 0;
      finishOfferQuestions(offer, answers);
    });
  });

  questionBox.querySelector('[data-finish-customers]')?.addEventListener('click', () => {
    const value = Number(select?.value) || 0;

    if (!value) {
      select?.focus();
      return;
    }

    answers.newCustomers = value;
    finishOfferQuestions(offer, answers);
  });
};

const renderPersonQuestion = (offer, card) => {
  resetOfferQuestions();
  selectedOffer = null;
  rewardSection?.classList.add('is-hidden');

  const answers = {};
  const questionBox = createElement('div', 'offer-card-questions');
  questionBox.innerHTML = [
    '<p class="offer-question-kicker">Fr&aring;ga 1 av 2</p>',
    '<h4>Hur m&aring;nga abonnemang vill ni ha?</h4>',
    '<div class="family-person-grid">',
    [1, 2, 3, 4, 5].map((count) => `<button type="button" data-persons="${count}">${count}</button>`).join(''),
    '  <button class="family-more-toggle" type="button" data-more-persons aria-expanded="false">Fler</button>',
    '</div>',
    '<div class="family-person-grid family-person-grid--more is-hidden">',
    [6, 7, 8, 9, 10].map((count) => `<button type="button" data-persons="${count}">${count}</button>`).join(''),
    '</div>',
  ].join('');

  card.classList.add('is-answering');
  card.querySelector('.offer-card-details')?.classList.add('is-hidden');
  card.append(questionBox);

  questionBox.querySelector('[data-more-persons]')?.addEventListener('click', (event) => {
    const moreGrid = questionBox.querySelector('.family-person-grid--more');
    const isOpening = moreGrid?.classList.contains('is-hidden');

    moreGrid?.classList.toggle('is-hidden', !isOpening);
    event.currentTarget.classList.toggle('is-active', isOpening);
    event.currentTarget.setAttribute('aria-expanded', String(isOpening));
  });

  questionBox.querySelectorAll('[data-persons]').forEach((button) => {
    button.addEventListener('click', () => {
      answers.persons = Number(button.dataset.persons) || 1;
      renderCustomerQuestion(offer, card, answers);
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
    logo.alt = offer.label;
    logo.loading = 'lazy';
    logo.decoding = 'async';
    logoWrap.append(logo);

    const details = createElement('div', 'offer-card-details');
    const copy = createElement('div');
    copy.append(createElement('p', '', `${offer.members} | ${offer.surf}`));

    const meta = createElement('ul', 'offer-card-meta');
    ['Samlad faktura', 'Fria samtal och sms', `${formatCurrency(offer.reward)} kr presentkort`].forEach((item) => {
      meta.append(createElement('li', '', item));
    });

    const button = createElement('button', 'offer-card-action', 'V\u00e4lj familjepaket');
    button.type = 'button';
    button.addEventListener('click', () => renderPersonQuestion(offer, card));

    details.append(copy, meta, button);
    card.append(logoWrap, details);
    fragment.append(card);
  });

  offersContainer.replaceChildren(fragment);
};

rewardContinueBtn?.addEventListener('click', () => {
  if (!selectedOffer || !rewardGrid || !cartDrawer || !cartItems || !summaryArea) {
    return;
  }

  const allocations = [...rewardGrid.querySelectorAll('.reward-choice')]
    .map((choice) => {
      const name = choice.querySelector('strong')?.textContent || '';
      const value = Math.max(Number(choice.querySelector('input')?.value) || 0, 0);
      return { name, value };
    })
    .filter((item) => item.value > 0);

  const cartLine = createElement('div', 'cart-line');
  cartLine.append(
    createElement('strong', '', selectedOffer.provider),
    createElement('span', '', `${selectedOffer.members} | ${selectedOffer.surf}`),
    createElement('span', '', `${formatCurrency(selectedOffer.price)} kr/m\u00e5n totalt`),
    createElement('span', '', allocations.map((item) => `${item.name}: ${formatCurrency(item.value)} kr`).join(' | '))
  );

  cartItems.replaceChildren(cartLine);
  summaryArea.replaceChildren(createElement('div', '', `Bel\u00f6ningsv\u00e4rde: ${formatCurrency(selectedOffer.reward)} kr`));

  if (totalPrice) {
    totalPrice.textContent = `${formatCurrency(selectedOffer.price)} kr`;
  }

  cartDrawer.classList.remove('hidden');
});

renderOffers();
