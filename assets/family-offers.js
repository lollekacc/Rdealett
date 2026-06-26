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
    label: 'Telia Familj',
    logo: 'images/telia.png',
    accent: '#6E2380',
    members: '4 abonnemang',
    surf: 'Obegr\u00e4nsad surf',
    reward: 5000,
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

const openCartDrawer = (cart) => {
  window.DealettCart?.openDrawer(cart);
};

const getPlanDataLabel = (plan) => {
  if (plan.data) return plan.data;
  if (Number(plan.dataAmount) >= 999) return 'Obegr\u00e4nsad';
  if (Number(plan.dataAmount) > 0) return `${plan.dataAmount} GB`;
  return plan.title || 'Mobilabonnemang';
};

const loadPlans = async () => {
  if (plansCache) return plansCache;

  const data = await window.DealettNetwork.fetchJson('/api/mobile/plans', {
    label: 'Familjabonnemang data',
  });

  if (!Array.isArray(data)) {
    throw new Error('Familjabonnemang data must be an array.');
  }

  plansCache = data;
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

const getFamilyCustomerStatusLabel = (answers) => {
  if (answers.customerStatus === 'none') return 'Alla blir nya kunder';
  if (answers.customerStatus === 'all') return 'Alla har redan abonnemang';
  return `${Number(answers.newCustomers) || 0} blir nya kunder`;
};

const getFamilyAnswerSummary = (answers) => [
  {
    label: 'Antal abonnemang',
    value: `${Number(answers.persons) || 1} abonnemang`,
  },
  {
    label: 'Kundstatus',
    value: getFamilyCustomerStatusLabel(answers),
  },
];

const getFamilyAnswerFacts = (answers = {}) => getFamilyAnswerSummary(answers)
  .filter((item) => item.value)
  .map((item) => ({ label: item.label, value: item.value }));

const createCompareButton = (item) => {
  const button = createElement('button', 'offer-compare-button offer-compare-button--icon');
  button.type = 'button';
  button.setAttribute('aria-label', 'J\u00e4mf\u00f6r');
  if (window.DealettOfferCompare) {
    window.DealettOfferCompare.bindButton(button, item);
  } else {
    button.innerHTML = '<img src="images/jamfor2.png" alt="" class="offer-compare-button__image" loading="lazy" decoding="async" aria-hidden="true">';
  }
  return button;
};

const buildBaseCompareItem = (offer) => ({
  id: `family-operator-${offer.provider}`,
  title: offer.label,
  operator: offer.provider,
  type: 'Familjepaket',
  logo: offer.logo,
  accent: offer.accent,
  facts: [
    { label: 'Typ', value: 'Familjabonnemang' },
    { label: 'Antal abonnemang', value: offer.members },
    { label: 'Surf', value: offer.surf },
    { label: 'Samtal & SMS', value: 'Fria samtal och SMS' },
    { label: 'Presentkort', value: `${formatCurrency(offer.reward)} kr` },
  ],
});

const buildFamilyCompareItem = (selectedPlan, plan, answers) => ({
  id: `family-plan-${selectedPlan.operator}-${plan.id || selectedPlan.title}-${Number(answers.persons) || 1}`,
  title: selectedPlan.title,
  operator: selectedPlan.operator,
  type: 'Familjepaket',
  logo: selectedPlan.logo,
  accent: selectedPlan.accent,
  facts: [
    { label: 'Typ', value: 'Familjabonnemang' },
    { label: 'Antal abonnemang', value: selectedPlan.members },
    { label: 'Surf', value: selectedPlan.surf },
    { label: 'Pris', value: `${formatCurrency(selectedPlan.price)} kr/m\u00e5n totalt` },
    { label: 'Pris per person', value: `${formatCurrency(selectedPlan.pricePerPerson)} kr/person` },
    { label: 'Extra abonnemang', value: selectedPlan.addonPrice ? `${formatCurrency(selectedPlan.addonPrice)} kr/st` : '-' },
    { label: 'Presentkort', value: `${formatCurrency(selectedPlan.reward)} kr` },
    ...getFamilyAnswerFacts(answers),
  ],
});

const renderAnswerSummary = (offer, panel, answers, sourceCard) => {
  let questionBox = panel.querySelector('.offer-card-questions');

  if (!questionBox) {
    questionBox = createElement('div', 'offer-card-questions');
    panel.append(questionBox);
  }

  const kicker = createElement('p', 'offer-question-kicker', 'Dina svar');
  const heading = createElement('h4', '', `${offer.label} matchas med svaren nedan`);
  const list = createElement('dl', 'offer-answer-list');
  const editButton = createElement('button', 'offer-answer-edit', '\u00c4ndra svar');

  getFamilyAnswerSummary(answers).forEach((item) => {
    list.append(
      createElement('dt', '', item.label),
      createElement('dd', '', item.value)
    );
  });

  editButton.type = 'button';
  editButton.addEventListener('click', () => renderPersonQuestion(offer, sourceCard));

  questionBox.replaceChildren(kicker, heading, list, editButton);
};

const getExpandedOfferPanel = (card) => {
  offersContainer?.querySelectorAll('.offer-card-expanded-panel').forEach((panel) => {
    panel.remove();
  });

  const panel = createElement('div', 'offer-card-expanded-panel');
  panel.style.setProperty('--offer-accent', card.style.getPropertyValue('--offer-accent') || 'var(--accent)');
  card.after(panel);
  return panel;
};

const getPlanResultsBox = (panel) => {
  let resultsBox = panel.querySelector('.offer-card-results');

  if (!resultsBox) {
    resultsBox = createElement('div', 'offer-card-results');
    panel.append(resultsBox);
  }

  return resultsBox;
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
  const selectedCard = card.closest?.('.offer-card') || card;

  offersContainer?.querySelectorAll('.offer-card, .operator-plan-row').forEach((item) => {
    item.classList.remove('is-selected');
  });

  selectedCard.classList.add('is-selected');
  card.classList.add('is-selected');
  rewardSection?.classList.remove('is-hidden');
  renderRewards(offer);
  rewardSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const resetOfferQuestions = () => {
  offersContainer?.querySelectorAll('.offer-card-expanded-panel').forEach((panel) => {
    panel.remove();
  });

  offersContainer?.querySelectorAll('.offer-card').forEach((card) => {
    card.classList.remove('is-answering', 'is-selected');
    card.querySelector('.offer-card-questions')?.remove();
    card.querySelector('.offer-card-details')?.classList.remove('is-hidden');
  });
};

const renderPlanOffers = async (offer, answers, card) => {
  if (!offersContainer || !card) return;

  card.classList.remove('is-answering');
  card.classList.add('is-selected');
  card.querySelector('.offer-card-details')?.classList.remove('is-hidden');
  card.querySelector('.offer-card-questions')?.remove();

  const panel = getExpandedOfferPanel(card);
  renderAnswerSummary(offer, panel, answers, card);

  const resultsBox = getPlanResultsBox(panel);
  resultsBox.innerHTML = '<div class="offers-loading">H\u00e4mtar familjepaket...</div>';

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
      const row = createElement('div', 'operator-plan-row offer-card--plan');
      row.style.setProperty('--offer-accent', selectedPlan.accent);

      const copy = createElement('div', 'operator-plan-copy');
      copy.append(
        createElement('h3', '', plan.title),
        createElement('p', '', `${selectedPlan.members} | ${selectedPlan.surf}`)
      );

      const meta = createElement('ul', 'offer-card-meta operator-plan-meta');
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
      button.addEventListener('click', () => selectOffer(selectedPlan, row));

      const compareButton = createCompareButton(buildFamilyCompareItem(selectedPlan, plan, answers));

      const actions = createElement('div', 'offer-card-actions');
      actions.append(button);

      row.append(compareButton, copy, meta, actions);
      fragment.append(row);
    });

    if (!fragment.childNodes.length) {
      resultsBox.innerHTML = '<div class="offers-loading">Inga familjepaket hittades f\u00f6r den h\u00e4r operat\u00f6ren just nu.</div>';
    } else {
      resultsBox.replaceChildren(fragment);
    }
  } catch {
    resultsBox.innerHTML = '<div class="offers-loading">Kunde inte h\u00e4mta familjepaket just nu.</div>';
  }
};

const finishOfferQuestions = (offer, answers, card) => {
  offer.answers = answers;
  renderPlanOffers(offer, answers, card);
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
      finishOfferQuestions(offer, answers, card);
    });
  });

  questionBox.querySelector('[data-finish-customers]')?.addEventListener('click', () => {
    const value = Number(select?.value) || 0;

    if (!value) {
      select?.focus();
      return;
    }

    answers.newCustomers = value;
    finishOfferQuestions(offer, answers, card);
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
    logoWrap.append(logo, createCompareButton(buildBaseCompareItem(offer)));

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

    const actions = createElement('div', 'offer-card-actions');
    actions.append(button);

    details.append(copy, meta, actions);
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
  const persons = Number(selectedOffer.answers?.persons) || Number.parseInt(selectedOffer.members, 10) || 1;
  const cartItem = {
    cartItemId: `${selectedOffer.operator || selectedOffer.provider}-${Date.now()}`,
    offerId: selectedOffer.title,
    operator: selectedOffer.operator || selectedOffer.provider,
    title: selectedOffer.title || 'Familjepaket',
    logo: selectedOffer.logo,
    data: selectedOffer.surf || selectedOffer.data,
    price: selectedOffer.price || 0,
    pricePerPerson: selectedOffer.pricePerPerson || 0,
    persons,
    phoneLines: persons,
    productType: 'family',
    unitLabel: 'abonnemang',
    rewardTotal: selectedOffer.reward,
    rewardMixLabel: `Presentkort ${formatCurrency(selectedOffer.reward)} kr`,
    rewards,
    answers: selectedOffer.answers || {},
    features: [
      selectedOffer.members,
      'Samlad faktura',
      'Fria samtal och sms',
      selectedOffer.addonPrice ? `Extra abonnemang ${formatCurrency(selectedOffer.addonPrice)} kr/st` : '',
    ].filter(Boolean),
  };

  const cart = window.DealettCart.appendItem(cartItem, {
    state: {
      persons,
      operator: cartItem.operator,
      wishes: ['Familjabonnemang'],
      answers: cartItem.answers,
    },
  });
  openCartDrawer(cart);
});

window.DealettCart?.bindDrawerEvents();
renderOffers();
})();
