const cartDrawer = document.querySelector('#cartDrawer');
const cartOverlay = document.querySelector('#cartOverlay');
const closeCart = document.querySelector('#closeCart');

const closeCartDrawer = () => {
  if (cartDrawer) {
    cartDrawer.classList.add('hidden');
  }
};

[cartOverlay, closeCart].forEach((element) => {
  element?.addEventListener('click', closeCartDrawer);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeCartDrawer();
  }
});
