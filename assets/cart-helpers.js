(() => {
  const currency = new Intl.NumberFormat('sv-SE');

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
      // Keep the shopping flow usable even if storage is unavailable.
    }
  };

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const formatCurrency = (value) => currency.format(Math.max(Number(value) || 0, 0));

  const readCart = () => {
    const storedCart = readJson('dealettCart', []);
    return Array.isArray(storedCart) ? storedCart : [];
  };

  const getProductType = (item) => {
    if (item.productType) return item.productType;

    const searchable = `${item.offerId || ''} ${item.title || ''} ${item.data || ''}`.toLowerCase();
    return searchable.includes('bredband') || searchable.includes('fiber') ? 'broadband' : 'mobile';
  };

  const getUnitLabel = (item) => item.unitLabel || (getProductType(item) === 'broadband' ? 'bredband' : 'abonnemang');

  const getPhoneLines = (item) => {
    if (Number.isFinite(Number(item.phoneLines))) {
      return Math.max(Number(item.phoneLines), 0);
    }

    if (getProductType(item) === 'broadband') {
      return 0;
    }

    return Math.max(Number(item.persons) || 1, 1);
  };

  const getTotals = (cart) => cart.reduce((totals, item) => ({
    price: totals.price + Math.max(Number(item.price) || 0, 0),
    reward: totals.reward + Math.max(Number(item.rewardTotal) || 0, 0),
    phoneLines: totals.phoneLines + getPhoneLines(item),
  }), { price: 0, reward: 0, phoneLines: 0 });

  const buildSelectedOffer = (item) => ({
    id: item.offerId,
    operator: item.operator,
    title: item.title,
    logo: item.logo,
    dataAmount: item.dataAmount,
    finalPrice: item.price,
    pricePerPerson: item.pricePerPerson,
    rewardTotal: item.rewardTotal,
    rewardMixLabel: item.rewardMixLabel,
  });

  const appendItem = (cartItem, options = {}) => {
    const item = {
      ...cartItem,
      cartItemId: cartItem.cartItemId || `${cartItem.offerId || cartItem.title || 'cart-item'}-${Date.now()}`,
    };
    const cart = [...readCart(), item];

    writeJson('dealettCart', cart);
    writeJson('selectedOffer', options.selectedOffer || buildSelectedOffer(item));

    if (options.state) {
      writeJson('dealettState', options.state);
    }

    if (item.rewards) {
      writeJson('rewardDistribution', item.rewards);
    }

    localStorage.removeItem('rewardChoice');
    return cart;
  };

  const renderDrawerLine = (item, index) => {
    const count = Math.max(Number(item.persons) || 1, 1);
    const countLabel = `${count} ${getUnitLabel(item)}`;
    const features = (item.features || []).filter(Boolean).map(escapeHtml).join(' · ');

    return `
      <div class="cart-line">
        <strong>${index + 1}. ${escapeHtml(item.operator)} ${escapeHtml(item.title)}</strong>
        ${item.data ? `<span>${escapeHtml(item.data)}</span>` : ''}
        <span>${escapeHtml(countLabel)} · ${formatCurrency(item.price)} kr/mån</span>
        ${features ? `<span>${features}</span>` : ''}
        ${item.addon ? `<span>Tillägg: ${escapeHtml(item.addon.title)}</span>` : ''}
        ${item.logo ? `<img src="${escapeHtml(item.logo)}" alt="${escapeHtml(item.operator)}" style="max-width: 120px; max-height: 42px; object-fit: contain;" />` : ''}
      </div>
    `;
  };

  const renderDrawer = (elements, cart) => {
    const safeCart = Array.isArray(cart) && cart.length ? cart : readCart();
    const { cartItems, summaryArea, totalPrice } = elements;

    if (!cartItems || !summaryArea || !totalPrice) return;

    const totals = getTotals(safeCart);

    cartItems.innerHTML = safeCart.map(renderDrawerLine).join('');
    summaryArea.innerHTML = `
      <div>Varor i varukorg: ${safeCart.length}</div>
      <div>Presentkort totalt: ${formatCurrency(totals.reward)} kr</div>
      <div>Månadspris totalt: ${formatCurrency(totals.price)} kr/mån</div>
    `;
    totalPrice.textContent = `${formatCurrency(totals.price)} kr/mån`;
  };

  window.DealettCart = {
    appendItem,
    escapeHtml,
    formatCurrency,
    getPhoneLines,
    getProductType,
    getTotals,
    getUnitLabel,
    readCart,
    renderDrawer,
  };
})();
