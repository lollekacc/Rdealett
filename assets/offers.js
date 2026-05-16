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
    card.querySelector('.offer-card-action')?.classList.remove('is-hidden');
  });
};

const finishOfferQuestions = (offer, card, answers) => {
  offer.answers = answers;
  const questionBox = card.querySelector('.offer-card-questions');

  if (questionBox) {
    questionBox.innerHTML = [
      '<p class="offer-question-kicker">Svar sparade</p>',
      '<h4>Du kan forts&auml;tta med presentkortet.</h4>'
    ].join('');
  }

  selectOffer(offer, card);
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
    '</div>'
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
      finishOfferQuestions(offer, card, answers);
    });
  });

  questionBox.querySelector('[data-finish-date]')?.addEventListener('click', () => {
    const dateInput = questionBox.querySelector('#bindingEndDate');
    answers.bindingEndDate = dateInput?.value || null;

    if (!answers.bindingEndDate) {
      dateInput?.focus();
      return;
    }

    finishOfferQuestions(offer, card, answers);
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
    '</div>'
  ].join('');

  card.classList.add('is-answering');
  card.querySelector('.offer-card-action')?.classList.add('is-hidden');
  card.append(questionBox);

  questionBox.querySelectorAll('[data-current-operator]').forEach((button) => {
    button.addEventListener('click', () => {
      answers.currentOperator = button.dataset.currentOperator;

      if (answers.currentOperator === 'no') {
        answers.binding = 'no';
        answers.bindingEndDate = null;
        finishOfferQuestions(offer, card, answers);
        return;
      }

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

    const copy = createElement('div');
    copy.append(createElement('p', '', 'Obegränsad surf'));

    const meta = createElement('ul', 'offer-card-meta');
    ['Fria samtal och sms', '5G & eSIM', `${formatCurrency(offer.reward)} kr presentkort`].forEach((item) => {
      meta.append(createElement('li', '', item));
    });

    const button = createElement('button', 'offer-card-action', 'Välj');
    button.type = 'button';
    button.addEventListener('click', () => startOfferQuestions(offer, card));

    card.append(logoWrap, copy, meta, button);
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
    createElement('span', '', 'Obegränsad surf'),
    createElement('span', '', allocations.map((item) => `${item.name}: ${formatCurrency(item.value)} kr`).join(' | '))
  );

  cartItems.replaceChildren(cartLine);
  summaryArea.replaceChildren(createElement('div', '', `Belöningsvärde: ${formatCurrency(selectedOffer.reward)} kr`));
  cartDrawer.classList.remove('hidden');
});

renderOffers();
