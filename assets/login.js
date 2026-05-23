document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const registerDemoBtn = document.getElementById('registerDemoBtn');

  const login = () => {
    const email = emailInput?.value.trim();
    const password = passwordInput?.value.trim();

    if (!email || !password) return;

    sessionStorage.setItem('dealett_user', JSON.stringify({
      authMode: 'demo',
      name: email.split('@')[0] || 'Kund',
      email,
    }));
    localStorage.removeItem('dealett_user');

    window.location.href = 'account.html';
  };

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    login();
  });

  registerDemoBtn?.addEventListener('click', () => {
    if (emailInput && !emailInput.value) {
      emailInput.value = 'kund@dealett.se';
    }

    if (passwordInput && !passwordInput.value) {
      passwordInput.value = 'demo1234';
    }

    login();
  });
});
