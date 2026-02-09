// content.js - Script exécuté sur chaque page web

function letterToNumber(letter) {
  if (typeof letter === 'number') {
    return letter;
  }
  return letter.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0) + 1;
}

async function answerQuiz() {
  
  // Récupérer le contenu du div avec class "content" qui contient la question
  // On cherche le div .content qui contient un .formulation (question Moodle)
  let contentDiv = document.querySelector('.content .formulation');
  
  // Si on trouve .formulation, on prend son parent .content
  if (contentDiv) {
    contentDiv = contentDiv.closest('.content');
  }
  
  // Fallback: chercher directement .qtext (texte de la question Moodle)
  if (!contentDiv) {
    contentDiv = document.querySelector('.qtext');
    if (contentDiv) {
      // Prendre tout le bloc de question
      contentDiv = contentDiv.closest('.formulation') || contentDiv.closest('.content') || contentDiv;
    }
  }
  
  if (!contentDiv) {
    return;
  }

  const quizContent = contentDiv.textContent;

  // Envoyer le contenu au background script pour obtenir la réponse
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'solveQuiz',
      quizText: quizContent
    });

    if (response.success) {
      // Remplacer le texte dans le div avec class "count-container"
      const countContainer = document.querySelector('.count-container');
      if (countContainer) {
        countContainer.textContent = letterToNumber(response.answer);
      } else {
      }
    } else {
    }
  } catch (error) {
  }
}

// Enregistrer le double-clic
document.addEventListener('dblclick', (e) => {
  answerQuiz();
}, true);

// Au chargement du DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
  });
} else {
}
