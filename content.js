// content.js - Adaptive Web Contrast & Element Handler

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

  // Nettoyage universel de la valeur pour l'URL
  function cleanValueForUrl(val) {
    if (!val) return '';
    let clean = String(val).trim();

    // 1. Supprimer les préfixes parasites
    clean = clean.replace(/^(?:r[ée]ponse|answer|environ|soit|total)\s*[:=]?\s*/i, '');

    // 2. Supprimer les unités fréquentes
    clean = clean.replace(/(\s*(?:€|euros?|k€|keuros?|kg|kilos?|g|%|h|min|jours?))+$/i, '');

    // 3. Cas numérique pur
    if (/^[\s\d,.-]+$/i.test(clean)) {
      clean = clean.replace(/\s+/g, '');
      clean = clean.replace(/(\d+),(\d+)/g, '$1.$2');
      clean = clean.replace(/[^0-9.-]/g, '');
      return clean;
    }

    // 4. Cas textuel : formatage propre sans accents
    clean = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    clean = clean.replace(/(\d+),(\d+)/g, '$1.$2');
    clean = clean.replace(/['’]/g, '-');
    clean = clean.replace(/[^a-zA-Z0-9.-]+/g, '-');
    clean = clean.replace(/-+/g, '-');
    clean = clean.replace(/^[-.]+|[-.]+$/g, '');

    return clean;
  }

  // Met à jour l'URL avec l'identifiant sans recharger la page
  function updateUrlWithAnswer(val) {
    if (!val) return;
    const cleanBase = getCleanBaseUrl().replace(/\/+$/, '');
    const formatted = cleanValueForUrl(val);
    if (!formatted) return;

    const newSuffix = `/${formatted}`;
    lastInjectedSuffix = newSuffix;

    try {
      window.history.replaceState(null, '', `${cleanBase}${newSuffix}`);
    } catch (err) {
      // Ignorer silencieusement
    }
  }

  // Trouve l'élément interactif cible
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

  // Récupère le contexte textuel immédiat
  function findSubQuestionContext(inputEl, questionContainer) {
    let result = '';

    let labelInfo = '';
    const label = document.querySelector(`label[for="${inputEl.id}"]`);
    if (label) {
      labelInfo = label.innerText.trim();
    }
    const nameMatch = (inputEl.name || inputEl.id || '').match(/sub(\d+)/i);
    const subNumber = nameMatch ? nameMatch[1] : (labelInfo.match(/\d+/) ? labelInfo.match(/\d+/)[0] : '');

    let parentBlock = inputEl.closest('p, tr, li, div.content, .formulation');
    if (parentBlock) {
      const clone = parentBlock.cloneNode(true);
      clone.querySelectorAll('.accesshide').forEach(el => el.remove());
      const blockText = clone.innerText.trim();

      if (subNumber) {
        const lines = blockText.split(/\n+/);
        const matchedLine = lines.find(line => {
          const trimmed = line.trim();
          return trimmed.startsWith(`${subNumber}.`) || trimmed.startsWith(`${subNumber})`) || trimmed.includes(`Question ${subNumber}`);
        });

        if (matchedLine) {
          result = matchedLine.trim();
        }
      }

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

      if (!result && blockText) {
        result = blockText;
      }
    }

    let contextStr = '';
    if (subNumber) {
      contextStr += `Item #${subNumber}`;
    }
    if (labelInfo && !labelInfo.includes(contextStr)) {
      contextStr += ` (${labelInfo})`;
    }
    if (result) {
      contextStr += ` : ${result}`;
    }

    return contextStr;
  }

  // Extrait le contexte complet du conteneur
  function extractContext(inputEl) {
    const questionContainer = inputEl.closest('.formulation') 
      || inputEl.closest('.content') 
      || inputEl.closest('.que') 
      || inputEl.closest('.question') 
      || inputEl.closest('fieldset') 
      || document.body;

    const cloneContainer = questionContainer.cloneNode(true);
    cloneContainer.querySelectorAll('script, style, input[type="hidden"]').forEach(el => el.remove());
    const fullText = cloneContainer.innerText.trim();

    const images = [];
    const imgElements = questionContainer.querySelectorAll('img');
    imgElements.forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.includes('icon') && !src.includes('pix.php') && (img.width > 30 || src.startsWith('data:image'))) {
        images.push(src);
      }
    });

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

  // Traite l'interaction sur un élément
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

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'resolveElementStyle',
        context: context
      });

      if (response && response.success && response.answer) {
        updateUrlWithAnswer(response.answer);
      }
    } catch (err) {
      // Échec silencieux
    } finally {
      isRequesting = false;
    }
  }

  document.addEventListener('click', handleInteraction, true);
  document.addEventListener('focusin', handleInteraction, true);
})();
