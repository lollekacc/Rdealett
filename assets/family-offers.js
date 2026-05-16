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
    provider: 'Telia Familj',
    logo: 'images/telia.png',
    accent: '#6E2380',
    members: '4 abonnemang',
    surf: 'Obegränsad surf',
    reward: 5000,
  },
  {
    provider: 'Halebop Familj',
    logo: 'images/halebop.webp',
    accent: '#C8175C',
    members: '3 abonnemang',
    surf: '100 GB att dela',
    reward: 3500,
  },
  {
    provider: 'Telenor Familj',
    logo: 'images/telenor.jpg',
    accent: '#00437E',
    members: '4 abonnemang',
    surf: 'Obegränsad surf',
    reward: 5000,
  },
  {
    provider: 'Tre Familj',
    logo: 'images/tre.jpg',
    accent: '#E65C00',
    members: '5 abonnemang',
    surf: 'Obegränsad surf',
    reward: 6000,
  },
  {
    provider: 'Tele2 Familj',
    logo: 'images/tele2.png',
    accent: '#003A6E',
    members: '4 abonnemang',
    surf: 'Obegränsad surf',
    reward: 5000,
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
    copy.append(createElement('p', '', `${offer.members} | ${offer.surf}`));

    const meta = createElement('ul', 'offer-card-meta');
    ['Samlad faktura', 'Fria samtal och sms', `${formatCurrency(offer.reward)} kr presentkort`].forEach((item) => {
      meta.append(createElement('li', '', item));
    });

    const button = createElement('button', 'offer-card-action', 'Välj familjepaket');
    button.type = 'button';
    button.addEventListener('click', () => selectOffer(offer, card));

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
    createElement('span', '', `${selectedOffer.members} | ${selectedOffer.surf}`),
    createElement('span', '', allocations.map((item) => `${item.name}: ${formatCurrency(item.value)} kr`).join(' | '))
  );

  cartItems.replaceChildren(cartLine);
  summaryArea.replaceChildren(createElement('div', '', `Belöningsvärde: ${formatCurrency(selectedOffer.reward)} kr`));
  cartDrawer.classList.remove('hidden');
});

renderOffers();
