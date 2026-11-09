// background.js - Service Worker Multi-Providers avec gestion numéros pour choix fermés

const PROVIDER_CONFIG = {
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o-mini',
    supportsVision: true
  },
  anthropic: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-3-5-sonnet-latest',
    supportsVision: true
  },
  gemini: {
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel: 'gemini-2.0-flash',
    supportsVision: true
  },
  deepseek: {
    endpoint: 'https://api.deepseek.com/chat/completions',
    defaultModel: 'deepseek-chat',
    supportsVision: false
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'solveQuizQuestion') {
    solveQuestion(request.context)
      .then(answer => {
        sendResponse({ success: true, answer: answer });
      })
      .catch(error => {
        console.error('[Quiz-Background] Erreur:', error);
        sendResponse({ success: false, error: error.message || 'Erreur inconnue' });
      });
    return true; // Asynchrone
  }
});

async function solveQuestion(context) {
  const settings = await chrome.storage.local.get([
    'provider',
    'model',
    'apiToken',
    'apiTokens'
  ]);

  const provider = settings.provider || 'openai';
  const cfg = PROVIDER_CONFIG[provider] || PROVIDER_CONFIG.openai;
  const model = settings.model || cfg.defaultModel;

  let apiKey = '';
  if (settings.apiTokens && settings.apiTokens[provider]) {
    apiKey = settings.apiTokens[provider];
  } else if (settings.apiToken) {
    apiKey = settings.apiToken;
  }

  if (!apiKey) {
    throw new Error(`Clé API non configurée pour ${provider.toUpperCase()}. Ouvrez le popup de l'extension.`);
  }

  const prompt = buildPrompt(context);
  const images = (cfg.supportsVision && Array.isArray(context.images)) ? context.images : [];

  let rawAnswer = '';
  if (provider === 'openai') {
    rawAnswer = await callOpenAI(apiKey, model, prompt, images);
  } else if (provider === 'anthropic') {
    rawAnswer = await callAnthropic(apiKey, model, prompt, images);
  } else if (provider === 'gemini') {
    rawAnswer = await callGemini(apiKey, model, prompt, images);
  } else if (provider === 'deepseek') {
    rawAnswer = await callDeepSeek(apiKey, model, prompt);
  } else {
    throw new Error(`Provider non supporté : ${provider}`);
  }

  return formatFinalAnswer(rawAnswer, context);
}

function buildPrompt(context) {
  const { questionText, subQuestionText, inputType, options } = context;
  const isClosedQuestion = options && options.length > 0 && inputType !== 'text';

  let prompt = `Tu es un assistant d'examen précis et direct.
Tu dois répondre UNIQUEMENT par la réponse attendue.
AUCUNE phrase complète, AUCUN mot d'introduction, AUCUNE explication.

Énoncé / Contexte général :
${questionText || 'Aucun contexte fourni.'}
`;

  if (subQuestionText) {
    prompt += `\nQuestion spécifique ciblée :\n${subQuestionText}\n`;
  }

  if (isClosedQuestion) {
    prompt += `\nOptions disponibles :\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n`;
    prompt += `\nConsigne : Question à choix fermé. Réponds UNIQUEMENT par le NUMÉRO (1, 2, 3...) correspondant à la bonne option. Ne renvoie rien d'autre que ce numéro.\n`;
  } else {
    prompt += `\nConsigne : Question ouverte (champ texte numérique ou court).
- Renvoie UNIQUEMENT la valeur brute sans unité (PAS de symbole €, PAS de 'euros', PAS de 'kg', PAS de '%').
- Pour les décimales, utilise un point '.' (ex: 24.15 et non pas 24,15).
- AUCUN espace, AUCUN mot superflu.\n`;
  }

  prompt += `\nRéponse :`;
  return prompt;
}

function formatFinalAnswer(rawAnswer, context) {
  const { options, inputType } = context;
  const isClosedQuestion = options && options.length > 0 && inputType !== 'text';

  const cleaned = cleanAnswer(rawAnswer);

  if (!isClosedQuestion) {
    // Question ouverte : nettoyer les unités éventuelles et formater les décimales
    let val = cleaned;
    val = val.replace(/(\s*(?:€|euros?|k€|keuros?|kg|kilos?|g|%|h|min|jours?))+$/i, '');
    val = val.replace(/(\d+),(\d+)/g, '$1.$2');
    val = val.replace(/\s+/g, '');
    return val || cleaned;
  }

  // Question fermée : on extrait et valide le numéro (1, 2, 3...)
  // 1. Si la réponse commence directement par un chiffre (ex: "1", "2")
  const numMatch = cleaned.match(/^\d+/);
  if (numMatch) {
    const num = parseInt(numMatch[0], 10);
    if (num >= 1 && num <= options.length) {
      return String(num);
    }
  }

  // 2. Si la réponse est une lettre (ex: "A", "B", "C")
  if (/^[A-Za-z]$/.test(cleaned)) {
    const num = cleaned.toUpperCase().charCodeAt(0) - 64; // A -> 1, B -> 2
    if (num >= 1 && num <= options.length) {
      return String(num);
    }
  }

  // 3. Si la réponse contient le texte de l'une des options
  const lowerCleaned = cleaned.toLowerCase();
  const foundIndex = options.findIndex(opt => {
    const lowerOpt = opt.toLowerCase();
    return lowerOpt === lowerCleaned || lowerOpt.includes(lowerCleaned) || lowerCleaned.includes(lowerOpt);
  });

  if (foundIndex !== -1) {
    return String(foundIndex + 1);
  }

  return cleaned;
}

// 1. OpenAI
async function callOpenAI(apiKey, model, prompt, images) {
  let content;
  if (images.length > 0) {
    content = [{ type: 'text', text: prompt }];
    for (const img of images) {
      content.push({
        type: 'image_url',
        image_url: { url: img }
      });
    }
  } else {
    content = prompt;
  }

  const response = await fetch(PROVIDER_CONFIG.openai.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: content }],
      temperature: 0,
      max_tokens: 150
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`OpenAI: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// 2. DeepSeek
async function callDeepSeek(apiKey, model, prompt) {
  const response = await fetch(PROVIDER_CONFIG.deepseek.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      max_tokens: 150
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`DeepSeek: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// 3. Anthropic (Claude)
async function callAnthropic(apiKey, model, prompt, images) {
  const content = [];
  for (const img of images) {
    const match = img.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: match[1],
          data: match[2]
        }
      });
    }
  }
  content.push({ type: 'text', text: prompt });

  const response = await fetch(PROVIDER_CONFIG.anthropic.endpoint, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 150,
      messages: [{ role: 'user', content: content }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Claude: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

// 4. Google Gemini
async function callGemini(apiKey, model, prompt, images) {
  const url = `${PROVIDER_CONFIG.gemini.endpoint}/${model}:generateContent?key=${apiKey}`;
  const parts = [];

  for (const img of images) {
    const match = img.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2]
        }
      });
    }
  }
  parts.push({ text: prompt });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: parts }],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 150
      }
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Gemini: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function cleanAnswer(raw) {
  if (!raw) return '';
  let cleaned = raw.trim();

  cleaned = cleaned.replace(/^(réponse|reponse|answer)\s*:\s*/i, '');
  cleaned = cleaned.replace(/^["'`*]+|["'`*]+$/g, '');
  cleaned = cleaned.trim();

  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    cleaned = lines[0];
  }

  return cleaned;
}
