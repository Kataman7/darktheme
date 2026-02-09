// background.js - Service Worker

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'solveQuiz') {
    console.log('[SERVICE-WORKER] 📨 Requête reçue du content script');
    solveQuiz(request.quizText)
      .then(answer => {
        console.log('[SERVICE-WORKER] 🎉 Réponse finale:', answer);
        sendResponse({
          success: true,
          answer: answer
        });
      })
      .catch(error => {
        console.error('[SERVICE-WORKER] 🚨 Erreur:', error.message);
        sendResponse({
          success: false,
          error: error.message || 'Erreur inconnue'
        });
      });
    
    return true;
  }
});

async function solveQuiz(quizText) {
  console.log('[SERVICE-WORKER] 🔍 Récupération du token...');
  // Récupérer le token depuis le stockage local
  const { apiToken } = await chrome.storage.local.get(['apiToken']);
  
  if (!apiToken) {
    console.error('[SERVICE-WORKER] ❌ Pas de token trouvé!');
    throw new Error('Token API non configuré. Veuillez l\'ajouter dans le popup de l\'extension.');
  }
  console.log('[SERVICE-WORKER] ✅ Token trouvé');

  const prompt = `Tu es un agent qui répond à des quiz. 
Analyse le texte du quiz suivant et réponds UNIQUEMENT par une SEULE lettre (A, B, C, D, etc.) qui est la bonne réponse.
Si tu ne peux pas déterminer la réponse, réponds par "ERREUR".

Quiz:
${quizText}

Réponse (une seule lettre):`;

  try {
    console.log('[SERVICE-WORKER] 📤 Appel de l\'API OpenAI...');
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0,
        max_tokens: 10
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[SERVICE-WORKER] 🔴 Erreur API OpenAI:', error.error?.message);
      throw new Error(`Erreur OpenAI: ${error.error?.message || response.statusText}`);
    }

    console.log('[SERVICE-WORKER] 📥 Réponse reçue de OpenAI');
    const data = await response.json();
    const answer = data.choices[0]?.message?.content?.trim();
    console.log('[SERVICE-WORKER] 📄 Réponse brute:', answer);

    if (!answer) {
      throw new Error('Réponse vide de l\'API');
    }

    if (answer === 'ERREUR') {
      throw new Error('L\'agent n\'a pas pu déterminer la réponse');
    }

    // Extraire uniquement la première lettre
    const letterAnswer = answer.match(/[A-Za-z]/)?.[0]?.toUpperCase();
    console.log('[SERVICE-WORKER] 📍 Lettre extraite:', letterAnswer);
    
    if (!letterAnswer) {
      console.error('[SERVICE-WORKER] ❌ Impossible d\'extraire une lettre');
      throw new Error('Format de réponse invalide');
    }

    return letterAnswer;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}
