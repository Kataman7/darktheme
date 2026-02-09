// config.js - Configuration centralisée

// IMPORTANTES: Configuration pour les développeurs
const CONFIG = {
  // Provider: 'openai' ou 'anthropic'
  PROVIDER: 'openai',

  // Configuration OpenAI
  OPENAI: {
    API_URL: 'https://api.openai.com/v1/chat/completions',
    DEFAULT_MODEL: 'gpt-5-mini',
    TEMPERATURE: 0,
    MAX_TOKENS: 10
  },

  // Configuration Anthropic
  ANTHROPIC: {
    API_URL: 'https://api.anthropic.com/v1/messages',
    DEFAULT_MODEL: 'claude-3-sonnet-20240229',
    MAX_TOKENS: 10
  },

  // Sélecteurs CSS
  SELECTORS: {
    QUIZ_CONTENT: '.content',      // Classe du div contenant le quiz
    ANSWER_CONTAINER: '.count-container'  // Classe du div où insérer la réponse
  },

  // Prompt personnalisé
  PROMPT_TEMPLATE: (quizText) => `Tu es un agent qui répond à des quiz. 
Analyse le texte du quiz suivant et réponds UNIQUEMENT par une SEULE lettre (A, B, C, D, etc.) qui est la bonne réponse.
Si tu ne peux pas déterminer la réponse, réponds par "X".

Quiz:
${quizText}

Réponse (une seule lettre):`,

  // Auto-exécution au chargement de la page
  AUTO_RUN: true,

  // Afficher le bouton manuel
  SHOW_MANUAL_BUTTON: true
};

// Exporter pour utilisation dans les autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
