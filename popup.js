// popup.js - Dark Theme Engine Settings

document.addEventListener('DOMContentLoaded', async () => {
  const providerSelect = document.getElementById('providerSelect');
  const modelSelect = document.getElementById('modelSelect');
  const customModelInput = document.getElementById('customModelInput');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const apiKeyLabel = document.getElementById('apiKeyLabel');
  const enableCheckbox = document.getElementById('enableExtension');
  const keyLink = document.getElementById('keyLink');
  const saveBtn = document.getElementById('saveBtn');

  let savedTokens = {
    openai: '',
    anthropic: '',
    gemini: '',
    deepseek: ''
  };

  const data = await chrome.storage.local.get([
    'provider',
    'model',
    'apiToken',
    'apiTokens',
    'extensionEnabled'
  ]);

  if (data.apiTokens) {
    savedTokens = { ...savedTokens, ...data.apiTokens };
  }
  if (data.apiToken && !savedTokens.openai) {
    savedTokens.openai = data.apiToken;
  }

  const currentProvider = data.provider || 'openai';
  providerSelect.value = currentProvider;
  enableCheckbox.checked = data.extensionEnabled !== false;

  function updateModelsAndKey(provider, preferredModel = null) {
    const providerConfig = CONFIG.PROVIDERS[provider];
    if (!providerConfig) return;

    modelSelect.innerHTML = '';
    providerConfig.models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      modelSelect.appendChild(opt);
    });

    const customOpt = document.createElement('option');
    customOpt.value = '__custom__';
    customOpt.textContent = '✏️ Custom Profile...';
    modelSelect.appendChild(customOpt);

    if (preferredModel) {
      if (providerConfig.models.includes(preferredModel)) {
        modelSelect.value = preferredModel;
        customModelInput.style.display = 'none';
      } else {
        modelSelect.value = '__custom__';
        customModelInput.value = preferredModel;
        customModelInput.style.display = 'block';
      }
    } else {
      modelSelect.value = providerConfig.defaultModel;
      customModelInput.style.display = 'none';
    }

    apiKeyInput.value = savedTokens[provider] || '';
    apiKeyLabel.textContent = `${providerConfig.name} Token :`;

    keyLink.href = providerConfig.apiKeyUrl;
    keyLink.textContent = providerConfig.apiKeyUrl.replace(/^https?:\/\//, '');
  }

  updateModelsAndKey(currentProvider, data.model);

  modelSelect.addEventListener('change', () => {
    if (modelSelect.value === '__custom__') {
      customModelInput.style.display = 'block';
      customModelInput.focus();
    } else {
      customModelInput.style.display = 'none';
    }
  });

  providerSelect.addEventListener('change', () => {
    updateModelsAndKey(providerSelect.value);
  });

  apiKeyInput.addEventListener('input', () => {
    savedTokens[providerSelect.value] = apiKeyInput.value.trim();
  });

  saveBtn.addEventListener('click', () => {
    const selectedProvider = providerSelect.value;
    let selectedModel = modelSelect.value;
    if (selectedModel === '__custom__') {
      selectedModel = customModelInput.value.trim();
      if (!selectedModel) {
        showStatus('Please specify a custom model name', 'error');
        return;
      }
    }

    const currentKey = apiKeyInput.value.trim();
    const isEnabled = enableCheckbox.checked;

    savedTokens[selectedProvider] = currentKey;

    if (!currentKey) {
      showStatus('Please enter your token for ' + selectedProvider.toUpperCase(), 'error');
      return;
    }

    chrome.storage.local.set({
      provider: selectedProvider,
      model: selectedModel,
      apiToken: currentKey,
      apiTokens: savedTokens,
      extensionEnabled: isEnabled
    }, () => {
      showStatus(`✓ Settings saved successfully (${selectedModel})`, 'success');
    });
  });
});

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'status ' + type;
  setTimeout(() => {
    status.className = 'status';
  }, 3500);
}
