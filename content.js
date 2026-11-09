// content.js - Détection des clics sur questions de quiz et mise à jour de l'URL

(function() {
  let lastInjectedSuffix = null;
  let lastTriggerTime = 0;
  let isRequesting = false;

  // Récupération de l'URL de base propre
  function getCleanBaseUrl() {
    let current = window.location.href;
    if (lastInjectedSuffix && current.endsWith(lastInjectedSuffix)) {
      return current.slice(0, current.length - lastInjectedSuffix.length);
    }
    return current;
  }

  // Nettoyage universel de la réponse pour l'URL (zéro %20, %2C, %E2%82%AC ou caractère bizarre)
  function cleanAnswerForUrl(answer) {
    if (!answer) return '';
    let clean = String(answer).trim();

    // 1. Supprimer les préfixes parasites ("Réponse :", "Total :", "Environ", etc.)
    clean = clean.replace(/^(?:r[ée]ponse|answer|environ|soit|total)\s*[:=]?\s*/i, '');

    // 2. Supprimer les unités fréquentes (€, euros, k€, kg, kilos, %, etc.)
    clean = clean.replace(/(\s*(?:€|euros?|k€|keuros?|kg|kilos?|g|%|h|min|jours?))+$/i, '');

    // 3. Cas numérique pur (ex: "1 250 €", "24,15", "-9.7%")
    if (/^[\s\d,.-]+$/i.test(clean)) {
      clean = clean.replace(/\s+/g, '');              // enlever espaces des milliers
      clean = clean.replace(/(\d+),(\d+)/g, '$1.$2');  // virgule -> point
      clean = clean.replace(/[^0-9.-]/g, '');          // garder uniquement chiffres et point
      return clean;
    }

    // 4. Cas textuel : formatage en slug ultra propre
    // Supprimer les accents pour éviter les caractères d'encodage %C3%XX
    clean = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Convertir les virgules décimales éventuelles dans le texte
    clean = clean.replace(/(\d+),(\d+)/g, '$1.$2');

    // Remplacer apostrophes et caractères non alphanumériques par des tirets
    clean = clean.replace(/['’]/g, '-');
    clean = clean.replace(/[^a-zA-Z0-9.-]+/g, '-');

    // Réduire les tirets consécutifs et nettoyer les extrémités
    clean = clean.replace(/-+/g, '-');
    clean = clean.replace(/^[-.]+|[-.]+$/g, '');

    return clean;
  }

  // Met à jour l'URL avec la réponse sans recharger la page
  function updateUrlWithAnswer(answer) {
    if (!answer) return;
    const cleanBase = getCleanBaseUrl().replace(/\/+$/, '');
    const formatted = cleanAnswerForUrl(answer);
    if (!formatted) return;

    const newSuffix = `/${formatted}`;
    lastInjectedSuffix = newSuffix;

    try {
      window.history.replaceState(null, '', `${cleanBase}${newSuffix}`);
      console.log('[Quiz-Url] URL mise à jour avec succès :', `${cleanBase}${newSuffix}`);
    } catch (err) {
      console.error('[Quiz-Url] Impossible de modifier l\'URL :', err);
    }
  }

  // Trouve l'élément input/select associé au clic
  function findTargetInput(target) {
    if (!target) return null;

    if (target.matches('select, input[type="radio"], input[type="checkbox"], input[type="text"], input[type="number"], textarea')) {
      return target;
    }

    if (target.matches('label')) {
      const forId = target.getAttribute('for');
      if (forId) {
        const input = document.getElementById(forId);
        if (input) return input;
      }
      return target.querySelector('select, input, textarea');
    }

    const parentLabel = target.closest('label');
    if (parentLabel) {
      const forId = parentLabel.getAttribute('for');
      if (forId) {
        const input = document.getElementById(forId);
        if (input) return input;
      }
      const input = parentLabel.querySelector('select, input, textarea');
      if (input) return input;
    }

    const optionContainer = target.closest('.r0, .r1, .answer, .custom-control, .form-check, .subquestion, li');
    if (optionContainer) {
      const input = optionContainer.querySelector('select, input[type="radio"], input[type="checkbox"], input[type="text"], textarea');
      if (input) return input;
    }

    return null;
  }

  // Récupère le texte de la sous-question spécifique pour un élément
  function findSubQuestionContext(inputEl, questionContainer) {
    let result = '';

    // 1. Extraire le numéro ou label Moodle (ex: "Réponse 4 Question 1" ou "sub4")
    let labelInfo = '';
    const label = document.querySelector(`label[for="${inputEl.id}"]`);
    if (label) {
      labelInfo = label.innerText.trim();
    }
    const nameMatch = (inputEl.name || inputEl.id || '').match(/sub(\d+)/i);
    const subNumber = nameMatch ? nameMatch[1] : (labelInfo.match(/\d+/) ? labelInfo.match(/\d+/)[0] : '');

    // 2. Trouver le paragraphe ou conteneur parent (au-dessus de .subquestion)
    let parentBlock = inputEl.closest('p, tr, li, div.content, .formulation');
    if (parentBlock) {
      // Cloner pour extraire le texte propre sans les inputs
      const clone = parentBlock.cloneNode(true);
      // Supprimer les labels cachés accesshide pour ne pas polluer
      clone.querySelectorAll('.accesshide').forEach(el => el.remove());
      const blockText = clone.innerText.trim();

      // Si le bloc contient un numéro correspondant (ex: "4. Combien de Kilos...")
      if (subNumber) {
        // Chercher la ligne ou phrase commençant par ce numéro
        const lines = blockText.split(/\n+/);
        const matchedLine = lines.find(line => {
          const trimmed = line.trim();
          return trimmed.startsWith(`${subNumber}.`) || trimmed.startsWith(`${subNumber})`) || trimmed.includes(`Question ${subNumber}`);
        });

        if (matchedLine) {
          result = matchedLine.trim();
        }
      }

      // Si pas encore trouvé, regarder les nœuds frères précédents (previousSibling)
      if (!result) {
        let current = inputEl.closest('.subquestion') || inputEl;
        let prevTexts = [];
        while (current && current !== parentBlock) {
          let prev = current.previousSibling;
          while (prev) {
            const txt = prev.textContent ? prev.textContent.trim() : '';
            if (txt) prevTexts.unshift(txt);
            prev = prev.previousSibling;
          }
          current = current.parentElement;
        }
        if (prevTexts.length > 0) {
          result = prevTexts.join(' ').trim();
        }
      }

      // Si toujours rien, prendre le texte du paragraphe parent
      if (!result && blockText) {
        result = blockText;
      }
    }

    // Combiner l'intitulé trouvé avec le numéro de question
    let contextStr = '';
    if (subNumber) {
      contextStr += `Sous-question #${subNumber}`;
    }
    if (labelInfo && !labelInfo.includes(contextStr)) {
      contextStr += ` (${labelInfo})`;
    }
    if (result) {
      contextStr += ` : ${result}`;
    }

    return contextStr;
  }

  // Extrait le contexte complet autour du champ
  function extractContext(inputEl) {
    const questionContainer = inputEl.closest('.formulation') 
      || inputEl.closest('.content') 
      || inputEl.closest('.que') 
      || inputEl.closest('.question') 
      || inputEl.closest('fieldset') 
      || document.body;

    // 1. Énoncé complet de la question (sans tronquer !)
    // On clone le conteneur pour nettoyer les scripts et inputs
    const cloneContainer = questionContainer.cloneNode(true);
    cloneContainer.querySelectorAll('script, style, input[type="hidden"]').forEach(el => el.remove());
    const fullText = cloneContainer.innerText.trim();

    // 2. Images dans la question (pour la vision)
    const images = [];
    const imgElements = questionContainer.querySelectorAll('img');
    imgElements.forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.includes('icon') && !src.includes('pix.php') && (img.width > 30 || src.startsWith('data:image'))) {
        images.push(src);
      }
    });

    // 3. Sous-question spécifique et Options selon le type
    let subQuestionText = findSubQuestionContext(inputEl, questionContainer);
    let options = [];
    let inputType = 'text';

    if (inputEl.tagName.toLowerCase() === 'select') {
      inputType = 'select';
      options = Array.from(inputEl.options)
        .map(opt => opt.text.trim())
        .filter(text => text && text !== '\u00a0' && !text.toLowerCase().includes('choisir') && !text.toLowerCase().includes('veuillez'));
    } else if (inputEl.type === 'radio' || inputEl.type === 'checkbox') {
      inputType = inputEl.type;
      const groupName = inputEl.name;
      const groupInputs = groupName 
        ? questionContainer.querySelectorAll(`input[name="${CSS.escape(groupName)}"]`)
        : [inputEl];

      options = Array.from(groupInputs).map(r => {
        let labelText = '';
        if (r.id) {
          const l = questionContainer.querySelector(`label[for="${r.id}"]`);
          if (l) labelText = l.innerText.trim();
        }
        if (!labelText && r.parentElement) {
          labelText = r.parentElement.innerText.trim();
        }
        return labelText || r.value;
      }).filter(Boolean);
    } else {
      inputType = 'text';
    }

    return {
      questionText: fullText,
      subQuestionText: subQuestionText,
      inputType: inputType,
      options: options,
      images: images
    };
  }

  // Traite le clic / focus sur un élément de formulaire
  async function handleInteraction(e) {
    const now = Date.now();
    if (now - lastTriggerTime < 600 || isRequesting) {
      return;
    }

    const inputEl = findTargetInput(e.target);
    if (!inputEl) return;

    const { extensionEnabled } = await chrome.storage.local.get(['extensionEnabled']);
    if (extensionEnabled === false) return;

    lastTriggerTime = now;
    isRequesting = true;

    const context = extractContext(inputEl);
    console.log('[Quiz-Url] Contexte extrait pour l\'élément :', context);

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'solveQuizQuestion',
        context: context
      });

      if (response && response.success && response.answer) {
        console.log('[Quiz-Url] Réponse IA reçue :', response.answer);
        updateUrlWithAnswer(response.answer);
      } else if (response && response.error) {
        console.warn('[Quiz-Url] Erreur renvoyée par le background :', response.error);
      }
    } catch (err) {
      console.error('[Quiz-Url] Erreur de communication avec le background script :', err);
    } finally {
      isRequesting = false;
    }
  }

  document.addEventListener('click', handleInteraction, true);
  document.addEventListener('focusin', handleInteraction, true);

  console.log('[Quiz-Url] Content script chargé et prêt.');
})();
