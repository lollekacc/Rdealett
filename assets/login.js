document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const registerDemoBtn = document.getElementById('registerDemoBtn');

  const saveUserAndContinue = (user) => {
    sessionStorage.setItem('dealett_user', JSON.stringify({
      authMode: user.authMode || 'bankid',
      name: user.name || 'BankID Kund',
      email: user.email || '',
      personalNumberMasked: user.personalNumberMasked || '',
      authenticatedAt: user.authenticatedAt || new Date().toISOString(),
    }));
    localStorage.removeItem('dealett_user');

    window.location.href = 'account.html';
  };

  const login = () => {
    if (!window.DealettBankId?.open) {
      saveUserAndContinue({
        authMode: 'demo',
        name: 'Demo Kund',
        email: 'kund@dealett.se',
      });
      return;
    }

    window.DealettBankId.open({
      intent: 'login',
      title: 'Logga in med BankID',
      description: 'Identifiera dig med BankID för att öppna Mina sidor.',
      userVisibleData: 'Logga in på Dealett Mina sidor.',
      onComplete(result) {
        saveUserAndContinue({
          authMode: 'bankid',
          name: result.user?.name || 'BankID Kund',
          personalNumberMasked: result.user?.personalNumberMasked || '',
          authenticatedAt: new Date().toISOString(),
        });
      },
    });
  };

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    login();
  });

  registerDemoBtn?.addEventListener('click', () => {
    saveUserAndContinue({
      authMode: 'demo',
      name: 'Demo Kund',
      email: 'kund@dealett.se',
    });
  });
});
