// popup.js - Gestion du popup

document.addEventListener('DOMContentLoaded', () => {
  // Charger le token et l'état activé sauvegardés
  chrome.storage.local.get(['apiToken', 'extensionEnabled'], (result) => {
    if (result.apiToken) {
      document.getElementById('apiToken').value = result.apiToken;
    }
    document.getElementById('enableExtension').checked = result.extensionEnabled !== false; // par défaut true
  });

  // Sauvegarder le token et l'état
  document.getElementById('saveBtn').addEventListener('click', () => {
    const apiToken = document.getElementById('apiToken').value.trim();
    const extensionEnabled = document.getElementById('enableExtension').checked;

    if (!apiToken) {
      showStatus('Please enter your token', 'error');
      return;
    }

    chrome.storage.local.set({
      apiToken: apiToken,
      extensionEnabled: extensionEnabled
    }, () => {
      showStatus('✓ Settings saved!', 'success');
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
