document.addEventListener('click', (event) => {
  const button = event.target.closest('.business-size');
  if (!button) return;

  document.querySelectorAll('.business-size').forEach((item) => {
    item.classList.toggle('is-selected', item === button);
  });

  localStorage.setItem('business_size', button.dataset.size || '');
});
