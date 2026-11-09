// config.js - Configuration centralisée multi-modèles (Dernières générations)

const CONFIG = {
  DEFAULT_PROVIDER: 'openai',

  PROVIDERS: {
    openai: {
      name: 'OpenAI (ChatGPT)',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      defaultModel: 'gpt-4o-mini',
      models: [
        'gpt-4o-mini',      // Rapide, économique et supporte la vision (tableaux/images)
        'gpt-4o',           // Polyvalent, haute précision
        'o3-mini',          // Raisonnement logique et calculs avancés
        'gpt-6.1-sol',      // Dernière génération haute performance
        'gpt-6-luna'        // Dernière génération ultra-rapide
      ],
      supportsVision: true,
      apiKeyUrl: 'https://platform.openai.com/api-keys'
    },
    anthropic: {
      name: 'Anthropic (Claude)',
      endpoint: 'https://api.anthropic.com/v1/messages',
      defaultModel: 'claude-3-5-sonnet-latest',
      models: [
        'claude-3-5-sonnet-latest', // Référence absolue pour la lecture de tableaux et calculs
        'claude-3-5-haiku-latest',  // Ultra-rapide et économique
        'claude-sonnet-5-5',        // Génération 5.x haute intelligence
        'claude-haiku-5-5'          // Génération 5.x ultra-rapide
      ],
      supportsVision: true,
      apiKeyUrl: 'https://console.anthropic.com/settings/keys'
    },
    gemini: {
      name: 'Google Gemini',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
      defaultModel: 'gemini-2.0-flash',
      models: [
        'gemini-2.0-flash',   // Traitement ultra-rapide en temps réel + Vision
        'gemini-1.5-flash',   // Très stable et économique
        'gemini-1.5-pro',     // Raisonnement complexe et lecture de documents
        'gemini-3.8-flash'    // Nouvelle génération haute vitesse
      ],
      supportsVision: true,
      apiKeyUrl: 'https://aistudio.google.com/app/apikey'
    },
    deepseek: {
      name: 'DeepSeek',
      endpoint: 'https://api.deepseek.com/chat/completions',
      defaultModel: 'deepseek-chat',
      models: [
        'deepseek-chat',      // V3 : excellent en français, coût minimal
        'deepseek-reasoner',  // R1 : raisonnement approfondi pour maths/comptabilité
        'deepseek-v4-flash',  // V4 : nouvelle génération rapide
        'deepseek-v4-pro'     // V4 : puissance maximale
      ],
      supportsVision: false,
      apiKeyUrl: 'https://platform.deepseek.com/api_keys'
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
