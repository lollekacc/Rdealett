document.addEventListener("DOMContentLoaded", () => {
  const quiz = createIndexQuiz();
  quiz.init();
});

function createIndexQuiz() {
  const state = {
    currentStep: 0,
    persons: null,
    operators: [],
    selectedOperator: null,
    customerStatus: null,
    newCustomers: null,
    data: null,
    price: null,
    binding: null
  };

  const dom = {
    intro: document.getElementById("quiz-intro"),
    wrapper: document.getElementById("quiz-steps-wrapper"),
    slot: document.getElementById("quiz-slot"),
    stack: document.getElementById("quiz-card-stack"),
    startButton: document.getElementById("quiz-start"),
    heroStartButton: document.getElementById("hero-start-analysis"),
    hero: document.querySelector(".hero"),
    heroVisual: document.querySelector(".hero-visual"),
    heroMount: document.getElementById("hero-quiz-mount"),
    familyOfferGrid: document.querySelector(".family-offer-grid"),
    operatorContainer: document.getElementById("operator-per-person"),
    operatorTemplate: document.getElementById("operator-picker-template"),
    personExtraOptions: document.getElementById("person-extra-options"),
    personMoreToggle: document.getElementById("person-more-toggle"),
    customerOperatorGrid: document.getElementById("customer-operator-grid"),
    customerStatusQuestion: document.getElementById("customer-status-question"),
    newCustomersField: document.getElementById("new-customers-field"),
    newCustomersSelect: document.getElementById("new-customers-select"),
    offersContainer: document.getElementById("offers-container"),
    deploymentGrid: document.querySelector(".deployment-card-grid")
  };

  const steps = Array.from(document.querySelectorAll("#quiz-card-stack .quiz-step-card"));
  const questionStepCount = Math.max(steps.length - 1, 0);
  const resultStepIndex = Math.max(steps.length - 1, 0);
  const sectionWrapperAnchor = document.createComment("quiz section mount");
  let plans = null;
  let recommendationsRequestId = 0;

  function init() {
    if (!dom.wrapper || !dom.stack || !steps.length) return;

    window.abonState = state;

    bindEvents();
    updateStepState(0);
    syncProgress();
    syncStackHeight();
  }

  function bindEvents() {
    dom.startButton?.addEventListener("click", startQuiz);
    dom.heroStartButton?.addEventListener("click", event => {
      event.preventDefault();
      startQuiz({ inHero: true });
    });
    dom.familyOfferGrid?.addEventListener("click", handleFamilyOfferClick);
    dom.wrapper.addEventListener("click", handleWrapperClick);
    dom.wrapper.addEventListener("change", handleWrapperChange);
    window.addEventListener("resize", syncStackHeight);
    bindStaticOfferCards();

    steps.forEach((step, index) => {
      const backButton = step.querySelector(".quiz-back-inline");
      backButton?.addEventListener("click", event => {
        event.preventDefault();

        if (index === 0) {
          showIntro();
          return;
        }

        showStep(index - 1);
      });
    });
  }

  function handleWrapperClick(event) {
    const personToggle = event.target.closest("[data-person-toggle]");
    if (personToggle) {
      toggleExtraPersonOptions();
      return;
    }

    const option = event.target.closest(".quiz-option");
    if (option) {
      handleOptionClick(option);
      return;
    }

    const stackedStep = event.target.closest(".quiz-step-card.stacked-card");
    if (!stackedStep || event.target.closest("button")) return;

    const stackedIndex = steps.indexOf(stackedStep);
    if (stackedIndex >= 0) {
      showStep(stackedIndex);
    }
  }

  function handleWrapperChange(event) {
    if (event.target !== dom.newCustomersSelect) return;

    const newCustomers = Number(dom.newCustomersSelect.value);
    if (!newCustomers) return;

    state.newCustomers = newCustomers;
    applyCustomerState();
    showStep(2);
  }

  function handleFamilyOfferClick(event) {
    const card = event.target.closest("[data-family-offer]");
    if (!card) return;

    event.preventDefault();

    const item = buildFamilyCartItem(card);
    const cart = readCart();
    cart.push(item);

    localStorage.setItem("dealettCart", JSON.stringify(cart));
    localStorage.setItem("selectedOffer", JSON.stringify({
      id: item.offerId,
      operator: item.operator,
      title: item.title,
      logo: item.logo,
      dataAmount: item.dataAmount,
      finalPrice: item.price,
      pricePerPerson: item.pricePerPerson,
      rewardTotal: item.rewardTotal,
      rewardMixLabel: item.rewardMixLabel
    }));
    localStorage.setItem("dealettState", JSON.stringify({
      persons: 4,
      data: getDataTier(item.dataAmount),
      operator: item.operator,
      binding: null,
      bindingEndDate: null,
      wishes: ["Familjeabonnemang"],
      operatorsByPerson: Array.from({ length: 4 }, () => "Andra / Ingen"),
      bindingsByPerson: Array.from({ length: 4 }, () => null),
      bindingEndDatesByPerson: Array.from({ length: 4 }, () => null)
    }));
    localStorage.removeItem("rewardChoice");
    localStorage.setItem("rewardDistribution", JSON.stringify(item.rewards));

    window.DEALETT_updateCartCount?.();
    window.location.href = "varukorg.html";
  }

  function bindStaticOfferCards() {
    if (!dom.deploymentGrid) return;

    dom.deploymentGrid.addEventListener("click", event => {
      const card = event.target.closest("[data-static-offer]");
      if (!card || !dom.deploymentGrid.contains(card)) return;

      event.preventDefault();
      saveStaticOfferAndNavigate(card);
    });

    dom.deploymentGrid.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;

      const card = event.target.closest("[data-static-offer]");
      if (!card || !dom.deploymentGrid.contains(card)) return;

      event.preventDefault();
      saveStaticOfferAndNavigate(card);
    });
  }

  function saveStaticOfferAndNavigate(card) {
    const item = buildStaticCartItem(card);
    let savedOffer = false;

    try {
      const cart = readCart();
      cart.push(item);

      localStorage.setItem("dealettCart", JSON.stringify(cart));
      localStorage.setItem("selectedOffer", JSON.stringify({
        id: item.offerId,
        operator: item.operator,
        title: item.title,
        logo: item.logo,
        dataAmount: item.dataAmount,
        finalPrice: item.price,
        pricePerPerson: item.pricePerPerson,
        rewardTotal: item.rewardTotal,
        rewardMixLabel: item.rewardMixLabel
      }));
      localStorage.setItem("dealettState", JSON.stringify({
        persons: item.persons,
        data: "high",
        operator: item.operator,
        binding: null,
        bindingEndDate: null,
        wishes: ["Startsida"],
        operatorsByPerson: Array.from({ length: item.persons }, () => "Andra / Ingen"),
        bindingsByPerson: Array.from({ length: item.persons }, () => null),
        bindingEndDatesByPerson: Array.from({ length: item.persons }, () => null)
      }));
      localStorage.removeItem("rewardChoice");
      localStorage.setItem("rewardDistribution", JSON.stringify(item.rewards));
      savedOffer = true;
    } catch {
      // The query string fallback still lets the cart page render the selected offer.
    }

    window.DEALETT_updateCartCount?.();
    window.location.href = savedOffer
      ? "varukorg.html"
      : card.querySelector(".provider-button")?.getAttribute("href") || "varukorg.html";
  }

  function saveRecommendationAndNavigate(plan) {
    const item = buildRecommendationCartItem(plan);
    const cart = readCart();
    cart.push(item);

    localStorage.setItem("dealettCart", JSON.stringify(cart));
    localStorage.setItem("selectedOffer", JSON.stringify({
      id: item.offerId,
      operator: item.operator,
      title: item.title,
      logo: item.logo,
      dataAmount: item.dataAmount,
      finalPrice: item.price,
      pricePerPerson: item.pricePerPerson,
      rewardTotal: item.rewardTotal,
      rewardMixLabel: item.rewardMixLabel
    }));
    localStorage.setItem("dealettState", JSON.stringify({
      persons: item.persons,
      data: state.data || getDataTier(item.dataAmount),
      operator: item.operator,
      binding: state.binding,
      bindingEndDate: null,
      wishes: [item.productType === "family" ? "Familjeabonnemang" : "Mobilabonnemang"],
      answers: {
        customerStatus: state.customerStatus,
        newCustomers: state.newCustomers,
        currentOperator: state.selectedOperator,
        binding: state.binding
      },
      operatorsByPerson: state.operators.length ? state.operators : Array.from({ length: item.persons }, () => "Andra / Ingen"),
      bindingsByPerson: Array.from({ length: item.persons }, () => state.binding || null),
      bindingEndDatesByPerson: Array.from({ length: item.persons }, () => null)
    }));
    localStorage.removeItem("rewardChoice");
    localStorage.setItem("rewardDistribution", JSON.stringify(item.rewards));

    window.DEALETT_updateCartCount?.();
    window.location.href = "varukorg.html";
  }

  function buildStaticCartItem(card) {
    const rewardTotal = Number(card.dataset.rewardTotal) || 0;
    const title = card.dataset.title || "4 abonnemang";
    const persons = Number((title.match(/\d+/) || [])[0]) || 1;
    const dataTitle = card.dataset.dataTitle || "Obegr\u00e4nsad surf";
    const features = String(card.dataset.features || "")
      .split("|")
      .map(item => item.trim())
      .filter(Boolean);

    return {
      cartItemId: `${card.dataset.offerId || "homepage-offer"}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      offerId: card.dataset.offerId || "",
      operator: card.dataset.operator || "",
      title,
      logo: card.dataset.logo || "",
      data: dataTitle,
      dataAmount: Number(card.dataset.dataAmount) || 0,
      price: Number(card.dataset.price) || 0,
      pricePerPerson: Number(card.dataset.pricePerPerson) || 0,
      persons,
      phoneLines: persons,
      productType: "family",
      unitLabel: "abonnemang",
      rewardTotal,
      rewardMixLabel: rewardTotal ? `Presentkort ${new Intl.NumberFormat("sv-SE").format(rewardTotal)} kr` : "",
      rewards: rewardTotal > 0 ? { Presentkort: rewardTotal } : {},
      features,
      source: "homepage-provider-card"
    };
  }

  function readCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem("dealettCart") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function buildFamilyCartItem(card) {
    const rewardTotal = Number(card.dataset.rewardTotal) || 0;
    const title = card.dataset.title || "Familjeabonnemang";
    const persons = Number((title.match(/\d+/) || [])[0]) || 1;

    return {
      cartItemId: `${card.dataset.offerId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      offerId: card.dataset.offerId,
      operator: card.dataset.operator,
      title,
      logo: card.dataset.logo,
      dataAmount: Number(card.dataset.dataAmount) || 0,
      price: Number(card.dataset.price) || 0,
      pricePerPerson: Number(card.dataset.pricePerPerson) || 0,
      persons,
      phoneLines: persons,
      productType: "family",
      unitLabel: "abonnemang",
      rewardTotal,
      rewardMixLabel: card.dataset.rewardMixLabel || "",
      rewards: rewardTotal > 0 ? { Presentkort: rewardTotal } : {}
    };
  }

  function buildRecommendationCartItem(plan) {
    const persons = state.persons || 1;
    const rewardTotal = 4000;

    return {
      cartItemId: `${plan.id || "recommended-offer"}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      offerId: plan.id || plan.title,
      operator: plan.operator,
      title: plan.title || plan.data || "Mobilabonnemang",
      logo: plan.logo,
      data: plan.data || (plan.dataAmount >= 999 ? "Obegränsad" : `${plan.dataAmount} GB`),
      dataAmount: Number(plan.dataAmount) || 0,
      price: Number(plan.finalPrice ?? plan.price) || 0,
      pricePerPerson: persons > 1 ? Number(plan.pricePerPerson) || 0 : 0,
      persons,
      phoneLines: persons,
      productType: persons > 1 ? "family" : "mobile",
      unitLabel: "abonnemang",
      rewardTotal,
      rewardMixLabel: `Presentkort ${new Intl.NumberFormat("sv-SE").format(rewardTotal)} kr`,
      rewards: { Presentkort: rewardTotal },
      answers: {
        customerStatus: state.customerStatus,
        newCustomers: state.newCustomers,
        currentOperator: state.selectedOperator,
        binding: state.binding
      },
      features: [
        persons > 1 ? `${persons} abonnemang` : "1 abonnemang",
        "Fria samtal och sms",
        "5G & eSIM",
        plan.text || "",
      ].filter(Boolean),
      source: "homepage-quiz"
    };
  }

  function getDataTier(dataAmount) {
    if (dataAmount >= 999) return "high";
    if (dataAmount >= 20) return "medium";
    return "low";
  }

  function handleOptionClick(option) {
    const step = option.closest(".quiz-step-card");
    if (!step) return;

    const stepIndex = steps.indexOf(step);
    if (stepIndex < 0) return;

    switch (stepIndex) {
      case 0:
        handlePersonsStep(option, step);
        break;
      case 1:
        handleOperatorStep(option);
        break;
      case 2:
        handleSingleChoiceStep(step, "[data-data]", option, () => {
          state.data = option.dataset.data || null;
        });
        break;
      case 3:
        handleSingleChoiceStep(step, "[data-price]", option, () => {
          state.price = option.dataset.price || null;
        });
        break;
      case 4:
        handleSingleChoiceStep(step, "[data-binding]", option, () => {
          state.binding = option.dataset.binding || null;
        });
        break;
      default:
        break;
    }
  }

  function handlePersonsStep(option, step) {
    const persons = Number(option.dataset.persons);
    if (!persons) return;

    state.persons = persons;
    state.operators = Array.from({ length: persons }, () => null);
    state.selectedOperator = null;
    state.customerStatus = null;
    state.newCustomers = null;

    setSelected(step, "[data-persons]", option);
    resetCustomerStep();
    showStep(1);
  }

  function handleOperatorStep(option) {
    if (option.dataset.currentOperator) {
      state.selectedOperator = option.dataset.currentOperator;
      setSelected(steps[1], "[data-current-operator]", option);
      updateCustomerStatusQuestion();
      return;
    }

    if (!option.dataset.customerStatus) return;

    if (!state.selectedOperator) {
      dom.customerOperatorGrid?.classList.add("needs-choice");
      window.setTimeout(() => dom.customerOperatorGrid?.classList.remove("needs-choice"), 420);
      return;
    }

    state.customerStatus = option.dataset.customerStatus;
    setSelected(steps[1], "[data-customer-status]", option);

    if (state.customerStatus === "partial") {
      renderNewCustomersSelect();
      dom.newCustomersField?.classList.remove("hidden");
      return;
    }

    state.newCustomers = state.customerStatus === "none" ? state.persons : 0;
    dom.newCustomersField?.classList.add("hidden");
    applyCustomerState();
    showStep(2);
  }

  function toggleExtraPersonOptions() {
    if (!dom.personExtraOptions || !dom.personMoreToggle) return;

    const isOpening = dom.personExtraOptions.classList.contains("hidden");
    dom.personExtraOptions.classList.toggle("hidden", !isOpening);
    dom.personMoreToggle.setAttribute("aria-expanded", String(isOpening));
    dom.personMoreToggle.textContent = isOpening ? "Dölj" : "Visa fler";
  }

  function resetCustomerStep() {
    const customerStep = steps[1];
    if (!customerStep) return;

    customerStep.querySelectorAll("[data-current-operator], [data-customer-status]").forEach(button => {
      button.classList.remove("selected", "active");
      button.setAttribute("aria-pressed", "false");
    });

    const partialOption = customerStep.querySelector('[data-customer-status="partial"]');
    if (partialOption) {
      partialOption.disabled = (state.persons || 0) < 2;
    }

    dom.newCustomersField?.classList.add("hidden");
    if (dom.newCustomersSelect) {
      dom.newCustomersSelect.innerHTML = '<option value="">Välj antal</option>';
    }

    updateCustomerStatusQuestion();
  }

  function updateCustomerStatusQuestion() {
    if (!dom.customerStatusQuestion) return;

    const operator = state.selectedOperator && state.selectedOperator !== "Other"
      ? state.selectedOperator
      : "vald operatör";

    dom.customerStatusQuestion.textContent = `Har någon av er redan abonnemang hos ${operator} idag?`;
  }

  function renderNewCustomersSelect() {
    if (!dom.newCustomersSelect) return;

    const persons = state.persons || 1;
    const maxNewCustomers = Math.max(persons - 1, 1);
    const options = ['<option value="">Välj antal</option>'];

    for (let index = 1; index <= maxNewCustomers; index += 1) {
      options.push(`<option value="${index}">${index}</option>`);
    }

    dom.newCustomersSelect.innerHTML = options.join("");
  }

  function applyCustomerState() {
    const persons = state.persons || 1;
    const operators = Array.from({ length: persons }, () => null);

    if (state.selectedOperator && state.selectedOperator !== "Other" && state.customerStatus !== "none") {
      const existingCustomers = state.customerStatus === "all"
        ? persons
        : Math.max(persons - (state.newCustomers || 0), 0);

      for (let index = 0; index < existingCustomers; index += 1) {
        operators[index] = state.selectedOperator;
      }
    }

    state.operators = operators;
  }

  function handleSingleChoiceStep(step, selector, option, applyState) {
    applyState();
    setSelected(step, selector, option);

    const nextIndex = Math.min(state.currentStep + 1, resultStepIndex);
    showStep(nextIndex);
  }

  function setSelected(scope, selector, activeOption) {
    scope.querySelectorAll(selector).forEach(button => {
      button.classList.remove("selected", "active");
      button.setAttribute("aria-pressed", button === activeOption ? "true" : "false");
    });

    activeOption.classList.add("selected", "active");
    activeOption.setAttribute("aria-pressed", "true");
  }

  function renderOperatorChoices() {
    if (!dom.operatorContainer || !dom.operatorTemplate || !state.persons) return;

    dom.operatorContainer.innerHTML = "";

    state.operators.forEach((selectedOperator, personIndex) => {
      const fragment = dom.operatorTemplate.content.cloneNode(true);
      const card = fragment.firstElementChild;

      card?.setAttribute("data-operator-group", "");

      const personNumber = fragment.querySelector("[data-person-number]");
      if (personNumber) {
        personNumber.textContent = String(personIndex + 1);
      }

      fragment.querySelectorAll("[data-operator]").forEach(button => {
        button.dataset.personIndex = String(personIndex);
        button.setAttribute("aria-pressed", button.dataset.operator === selectedOperator ? "true" : "false");

        if (button.dataset.operator === selectedOperator) {
          button.classList.add("selected", "active");
        } else {
          button.classList.remove("selected", "active");
        }
      });

      dom.operatorContainer.appendChild(fragment);
    });

    syncStackHeight();
  }

  function mountQuizInHero() {
    if (!dom.heroMount || !dom.wrapper) return;

    if (!sectionWrapperAnchor.parentNode) {
      dom.wrapper.parentNode?.insertBefore(sectionWrapperAnchor, dom.wrapper);
    }

    dom.heroMount.appendChild(dom.wrapper);
    dom.hero?.classList.add("quiz-in-hero");
    dom.heroVisual?.classList.add("is-quiz-active");
  }

  function mountQuizInSection() {
    if (!dom.wrapper) return;

    sectionWrapperAnchor.parentNode?.insertBefore(dom.wrapper, sectionWrapperAnchor);
    dom.hero?.classList.remove("quiz-in-hero");
    dom.heroVisual?.classList.remove("is-quiz-active");
  }

  function startQuiz(options = {}) {
    if (options.inHero) {
      mountQuizInHero();
    } else {
      mountQuizInSection();
    }

    dom.intro?.classList.add("hidden");
    dom.wrapper?.classList.remove("hidden");
    document.getElementById("analys")?.classList.add("quiz-running");

    requestAnimationFrame(() => {
      dom.wrapper?.classList.remove("opacity-0");
      showStep(0);
    });
  }

  function showIntro() {
    mountQuizInSection();
    dom.wrapper?.classList.add("hidden", "opacity-0");
    dom.intro?.classList.remove("hidden");
    document.getElementById("analys")?.classList.remove("quiz-running");
    updateStepState(0);
    syncProgress();
  }

  function showStep(index) {
    const safeIndex = Math.max(0, Math.min(index, resultStepIndex));

    state.currentStep = safeIndex;
    updateStepState(safeIndex);
    syncProgress();
    syncStackHeight();

    if (safeIndex === resultStepIndex) {
      renderRecommendations();
    }
  }

  function updateStepState(activeIndex) {
    steps.forEach((step, index) => {
      step.classList.remove("active-step", "stacked-card", "upcoming-card", "hidden-step");
      step.setAttribute("aria-hidden", index === activeIndex ? "false" : "true");

      if (index < activeIndex) {
        step.classList.add("stacked-card");
      } else if (index === activeIndex) {
        step.classList.add("active-step");
      } else {
        step.classList.add("upcoming-card");
      }
    });
  }

  function syncProgress() {
    const visibleStep = Math.min(state.currentStep + 1, questionStepCount);
    const progressWidth = questionStepCount
      ? `${(visibleStep / questionStepCount) * 100}%`
      : "0%";

    document.querySelectorAll(".quiz-step-current").forEach(node => {
      node.textContent = String(visibleStep);
    });

    document.querySelectorAll(".quiz-step-total").forEach(node => {
      node.textContent = String(questionStepCount);
    });

    document.querySelectorAll(".quiz-progress-inline").forEach(node => {
      node.style.width = progressWidth;
    });
  }

  function syncStackHeight() {
    if (dom.stack) dom.stack.style.minHeight = "";
    if (dom.slot)  dom.slot.style.minHeight  = "";
  }

  async function renderRecommendations() {
    if (!dom.offersContainer) return;

    const requestId = ++recommendationsRequestId;
    dom.offersContainer.innerHTML = [
      '<div class="quiz-loading" role="status" aria-live="polite">',
      '  <span class="quiz-loading-spinner" aria-hidden="true"></span>',
      '  <span>Analyserar svar...</span>',
      '</div>'
    ].join("");

    const [recommendedPlans] = await Promise.all([
      getRecommendedPlans(),
      wait(850)
    ]);

    if (requestId !== recommendationsRequestId) return;

    dom.offersContainer.innerHTML = "";

    if (!recommendedPlans.length) {
      dom.offersContainer.innerHTML = [
        '<article class="offer-card offer-card--empty">',
        '<h4 class="offer-card__title">Inga träffar just nu</h4>',
        '<p class="offer-card__empty-text">Testa att gå tillbaka och justera prisnivå eller surfbehov så visar vi fler relevanta alternativ.</p>',
        "</article>"
      ].join("");
      syncStackHeight();
      return;
    }

    recommendedPlans.forEach((plan, index) => {
      dom.offersContainer.appendChild(buildRecommendationCard(plan, index));
    });

    syncStackHeight();
  }

  function wait(duration) {
    return new Promise(resolve => {
      window.setTimeout(resolve, duration);
    });
  }

  async function getRecommendedPlans() {
    const allPlans = await loadPlans();
    const basePlans = allPlans.filter(plan => plan.category === "mobil" && !plan.isFamilyPlan);
    const currentOperators = new Set(
      state.operators
        .filter(Boolean)
        .filter(operator => operator !== "Other")
    );

    const candidates = basePlans
      .map(plan => enrichPlan(plan, allPlans))
      .filter(Boolean)
      .filter(plan => !state.data || plan.tier === state.data)
      .map(plan => ({
        ...plan,
        score: scorePlan(plan, currentOperators)
      }))
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        if (left.finalPrice !== right.finalPrice) return left.finalPrice - right.finalPrice;
        return left.operator.localeCompare(right.operator, "sv");
      });

    return candidates.slice(0, 3);
  }

  function enrichPlan(plan, allPlans) {
    const persons = state.persons || 1;
    let finalPrice = plan.price;
    let pricePerPerson = plan.price;

    if (persons > 1) {
      const addon = allPlans.find(candidate =>
        candidate.operator === plan.operator &&
        candidate.isFamilyPlan === true &&
        candidate.familyPriceType === "addon"
      );

      if (!addon) return null;

      finalPrice = plan.price + (persons - 1) * addon.addonPrice;
      pricePerPerson = Math.round(finalPrice / persons);
    }

    return {
      ...plan,
      finalPrice,
      pricePerPerson
    };
  }

  function scorePlan(plan, currentOperators) {
    let score = 0;

    if (matchesPriceExpectation(plan.pricePerPerson)) {
      score += 4;
    }

    if (currentOperators.has(plan.operator)) {
      score += 2;
    }

    if (state.binding === "yes" && currentOperators.has(plan.operator)) {
      score += 1;
    }

    if (state.binding === "no" && !currentOperators.has(plan.operator)) {
      score += 1;
    }

    return score;
  }

  function matchesPriceExpectation(pricePerPerson) {
    if (!state.price) return true;

    if (state.price === "under300") return pricePerPerson < 300;
    if (state.price === "300-400") return pricePerPerson >= 300 && pricePerPerson < 400;
    if (state.price === "400-500") return pricePerPerson >= 400;

    return true;
  }

  async function loadPlans() {
    if (plans) return plans;

    const response = await fetch("./data/plans.json");
    plans = await response.json();
    return plans;
  }

  function buildRecommendationCard(plan, index) {
    const article = document.createElement("article");
    const providerClass = getProviderClass(plan.operator);
    article.className = [
      "offer-card",
      index === 0 ? "offer-card--top" : "",
      providerClass ? `provider-card--${providerClass}` : ""
    ].filter(Boolean).join(" ");

    const topLabel = index === 0 ? "Bäst match" : `Alternativ ${index + 1}`;
    const isMulti = state.persons && state.persons > 1;
    const priceMain = isMulti ? `${plan.pricePerPerson} kr/p` : `${plan.finalPrice} kr/mån`;
    const priceSub  = isMulti ? `${plan.finalPrice} kr totalt` : null;
    const dataText  = plan.dataAmount >= 999 ? "Obegränsad" : `${plan.dataAmount} GB`;

    article.innerHTML = [
      '<div class="offer-card__accent"></div>',
      '<div class="offer-card__inner">',
      '  <div class="offer-card__top">',
      `    <span class="offer-card__label">${topLabel}</span>`,
      '  </div>',
      '  <div class="offer-card__head">',
      `    <img src="${plan.logo}" alt="${plan.operator}" class="offer-card__logo ${providerClass ? `offer-card__logo--${providerClass}` : ""}" />`,
      '  </div>',
      plan.text ? `  <p class="offer-card__desc">${plan.text}</p>` : '',
      '  <div class="offer-card__stats">',
      '    <div class="offer-card__stat">',
      '      <span class="offer-card__stat-icon"><i class="fa-solid fa-signal"></i></span>',
      '      <div>',
      '        <p class="offer-card__stat-label">Surf</p>',
      `        <p class="offer-card__stat-value">${dataText}</p>`,
      '      </div>',
      '    </div>',
      '    <div class="offer-card__stat">',
      '      <span class="offer-card__stat-icon"><i class="fa-solid fa-tag"></i></span>',
      '      <div>',
      '        <p class="offer-card__stat-label">Pris</p>',
      `        <p class="offer-card__stat-value">${priceMain}</p>`,
      priceSub ? `        <p class="offer-card__stat-sub">${priceSub}</p>` : '',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <a href="varukorg.html" class="offer-card__cta" data-recommendation-cart>Till varukorg <i class="fa-solid fa-cart-shopping"></i></a>',
      '</div>'
    ].join("\n");

    article.querySelector("[data-recommendation-cart]")?.addEventListener("click", event => {
      event.preventDefault();
      saveRecommendationAndNavigate(plan);
    });

    return article;
  }

  function getProviderClass(operator) {
    return String(operator || "")
      .toLowerCase()
      .replace("å", "a")
      .replace("ä", "a")
      .replace("ö", "o")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  return { init };
}
