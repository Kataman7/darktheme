// popup.js - Gestion du popup

document.addEventListener('DOMContentLoaded', () => {
  // Charger le token sauvegardé
  chrome.storage.local.get(['apiToken'], (result) => {
    if (result.apiToken) {
      document.getElementById('apiToken').value = result.apiToken;
    }
  });

  // Sauvegarder le token
  document.getElementById('saveBtn').addEventListener('click', () => {
    const apiToken = document.getElementById('apiToken').value.trim();

    if (!apiToken) {
      showStatus('Veuillez entrer votre token', 'error');
      return;
    }

    chrome.storage.local.set({
      apiToken: apiToken
    }, () => {
      showStatus('✓ Token enregistré!', 'success');
    });
  });
});

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'status ' + type;
  
  setTimeout(() => {
    status.className = 'status';
  }, 3000);
}
