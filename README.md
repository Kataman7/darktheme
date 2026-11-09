# Quiz URL Responder 🎯 (Auto Dark Theme)

Extension de navigateur qui détecte automatiquement les questions de quiz et affiche la réponse exacte directement à la fin de l'URL (via `window.history.replaceState`), au simple clic sur un élément de formulaire.

Supporte nativement **OpenAI (ChatGPT)**, **Anthropic (Claude)**, **Google Gemini** et **DeepSeek**, y compris les toutes dernières générations et la saisie de modèles personnalisés.

---

## 🚀 Fonctionnalités

- **Affichage dans l'URL :** Dès qu'un champ est cliqué, la réponse est injectée à la fin de l'URL sans recharger la page :
  - **Questions fermées (QCM, Radio, Dropdown) :** injecte le **numéro de l'option** (ex: `/1`, `/2`, `/3`...).
  - **Questions ouvertes (Champs texte) :** injecte la **réponse exacte** attendue (ex: `/1250`, `/4.5`, `/mot`).
- **Remplacement intelligent :** Chaque nouveau clic remplace la réponse précédente dans l'URL pour ne pas empiler les segments.
- **Détection adaptative au clic sur :**
  - 🔽 **Menus déroulants (`<select>`) :** renvoie l'option correcte.
  - 🔘 **Choix uniques et multiples (`radio`, `checkbox`) :** identifie l'option correcte parmi les choix.
  - ✍️ **Champs texte (`input[type="text"]`, `number`) :** renvoie la valeur exacte (chiffre, montant, résultat de calcul, mot-clé).
- **Support des images & tableaux (Vision) :** Détecte les images (ex: tableaux de répartition sous format base64 ou URL) et les transmet aux modèles multimodaux.
- **Multi-modèles / Multi-fournisseurs :** Choix facile dans le popup entre OpenAI, Claude, Gemini et DeepSeek, avec option de renseigner n'importe quel modèle personnalisé.

---

## 🤖 Guide des Meilleurs Modèles par Cas d'Usage

| Cas d'usage | Modèle recommandé | Pourquoi ? |
| :--- | :--- | :--- |
| **Questions avec Tableaux / Images (Vision)** | `claude-3-5-sonnet-latest` ou `gpt-4o-mini` | Meilleure précision de lecture des tableaux de données et diagrammes. |
| **Rapidité maximale pour QCM instantané** | `gemini-2.0-flash` ou `claude-3-5-haiku-latest` | Réponses quasi instantanées (< 1s) et coût négligeable. |
| **Calculs de gestion, maths & logique** | `deepseek-reasoner` ou `o3-mini` | Modèles de raisonnement pas-à-pas (Chain-of-Thought) évitant les erreurs de calcul. |
| **Économique / Faible coût** | `gpt-4o-mini` ou `deepseek-chat` | Tarifs dérisoires tout en restant très performants en français. |

---

## 📋 Liste Complète des Modèles Supportés

### 1. OpenAI (ChatGPT)
- `gpt-4o-mini` *(Recommandé par défaut : rapide, économique, vision)*
- `gpt-4o` *(Modèle phare multimodal haute précision)*
- `o3-mini` *(Raisonnement logique et mathématique)*
- `gpt-6.1-sol` *(Génération 6.x haute performance)*
- `gpt-6-luna` *(Génération 6.x ultra-rapide)*
- *Modèle personnalisé :* Saisissez directement n'importe quel identifiant (ex: `o1`, etc.).
- Clé API : [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 2. Anthropic (Claude)
- `claude-3-5-sonnet-latest` *(Recommandé par défaut : référence absolue pour les tableaux de gestion)*
- `claude-3-5-haiku-latest` *(Ultra-rapide et multimodal)*
- `claude-sonnet-5-5` *(Génération 5.x haute intelligence)*
- `claude-haiku-5-5` *(Génération 5.x haute vitesse)*
- *Modèle personnalisé :* Saisissez directement n'importe quel identifiant.
- Clé API : [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

### 3. Google Gemini
- `gemini-2.0-flash` *(Recommandé par défaut : ultra-rapide, multimodal pour le temps réel)*
- `gemini-1.5-flash` *(Très stable et économique)*
- `gemini-1.5-pro` *(Raisonnement complexe et analyse de documents)*
- `gemini-3.8-flash` *(Nouvelle génération Flash haute vitesse)*
- *Modèle personnalisé :* Saisissez directement n'importe quel identifiant.
- Clé API : [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### 4. DeepSeek
- `deepseek-chat` *(V3 : excellent rapport performance/prix en français)*
- `deepseek-reasoner` *(R1 : raisonnement approfondi pour comptabilité & calculs complexes)*
- `deepseek-v4-flash` *(V4 : nouvelle génération ultra-rapide)*
- `deepseek-v4-pro` *(V4 : puissance maximale)*
- *Modèle personnalisé :* Saisissez directement n'importe quel identifiant.
- Clé API : [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys)

---

## 🔧 Installation

### Chrome / Brave / Edge
1. Ouvrez `chrome://extensions/` dans votre navigateur.
2. Activez le **Mode développeur** (en haut à droite).
3. Cliquez sur **Charger l'extension non empaquetée**.
4. Sélectionnez le dossier du projet `darktheme`.

### Firefox
1. Ouvrez `about:debugging#/runtime/this-firefox`.
2. Cliquez sur **Charger un module temporaire**.
3. Sélectionnez le fichier `manifest.json` du dossier.

---

## ⚙️ Configuration

1. Cliquez sur l'icône de l'extension dans la barre d'outils.
2. Choisissez votre **fournisseur** (OpenAI, Claude, Gemini ou DeepSeek).
3. Choisissez le **modèle** souhaité (ou sélectionnez *Modèle personnalisé...* pour en entrer un autre).
4. Collez votre **clé API**.
5. Cliquez sur **Enregistrer la configuration**.

---

## 🧪 Tester en local

Ouvrez le fichier [test.html](test.html) directement dans votre navigateur pour tester la réaction au clic et la mise à jour de l'URL sur vos extraits de questions réels.
