document.addEventListener('DOMContentLoaded', () => {
  // === RESPONSIBILITIES DATA ===
  const responsibilitiesData = {
    "1AC": {
      "Core Responsibilities": "Present the Affirmative case and define the plan.",
      "Style & Strategy Tips": "Be confident, clear, and speak slowly to ensure understanding.",
      "Reminders & Common Mistakes": "Don’t forget to define all terms and explain solvency."
    },
    "CX1": {
      "Core Responsibilities": "Ask strategic questions about the 1AC case.",
      "Style & Strategy Tips": "Keep control and follow a clear line of questioning.",
      "Reminders & Common Mistakes": "Avoid yes/no traps; don’t waste time on irrelevant points."
    },
    "1NC": {
      "Core Responsibilities": "Present off-case arguments and refute the 1AC.",
      "Style & Strategy Tips": "Signpost clearly and weigh impacts.",
      "Reminders & Common Mistakes": "Don’t just list cards—explain why they matter."
    },
    // Add the remaining speeches similarly...
  };

  function updateResponsibilitiesPanel(speech) {
    const panel = document.getElementById('responsibilities-list');
    panel.innerHTML = ''; // Clear previous

    if (!responsibilitiesData[speech]) {
      panel.innerHTML = '<li>No responsibilities found for this speech.</li>';
      return;
    }

    const categories = responsibilitiesData[speech];
    for (let [category, text] of Object.entries(categories)) {
      const categoryTitle = document.createElement('li');
      categoryTitle.innerHTML = `<strong>${category}:</strong> ${text}`;
      panel.appendChild(categoryTitle);
    }
  }

  // === RESPONSIBILITIES TOGGLE ===
  const respToggle = document.getElementById('responsibilities-toggle');
  const respPanel = document.getElementById('responsibilities-panel');
  const closeBtn = document.getElementById('close-responsibilities');

  closeBtn.addEventListener('click', () => {
    respPanel.classList.add('translate-x-full');
    respToggle.setAttribute('aria-expanded', 'false');
  });

  respToggle.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = respPanel.classList.toggle('translate-x-full');
    respToggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  });

  const closeResponsibilitiesPanel = (e) => {
    const isOpen = !respPanel.classList.contains('translate-x-full');
    const tappedInsidePanel = respPanel.contains(e.target);
    const tappedToggleButton = respToggle.contains(e.target);
    if (isOpen && (!tappedToggleButton || tappedInsidePanel)) {
      respPanel.classList.add('translate-x-full');
      respToggle.setAttribute('aria-expanded', 'false');
    }
  };

  document.addEventListener('click', closeResponsibilitiesPanel);
  document.addEventListener('touchstart', closeResponsibilitiesPanel);

  let swipeStartX = 0;
  let swipeEndX = 0;

  document.addEventListener('touchstart', (e) => {
    swipeStartX = e.changedTouches[0].screenX;
  });

  document.addEventListener('touchend', (e) => {
    swipeEndX = e.changedTouches[0].screenX;
    const threshold = 50;
    const isPanelOpen = !respPanel.classList.contains('translate-x-full');

    if (swipeEndX < swipeStartX - threshold && isPanelOpen) {
      respPanel.classList.add('translate-x-full');
      respToggle.setAttribute('aria-expanded', 'false');
    }

    if (swipeEndX > swipeStartX + threshold && !isPanelOpen) {
      respPanel.classList.remove('translate-x-full');
      respToggle.setAttribute('aria-expanded', 'true');
    }
  });

  // === BUTTON HIGHLIGHT FUNCTION ===
  const speechButtons = Array.from(document.querySelectorAll('.speech-btn'));
  function highlightCurrentSpeechButton(label) {
    speechButtons.forEach(btn => {
      if (btn.dataset.label === label) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // === SPEECH LOGIC (Only relevant parts shown here, reuse your existing logic) ===
  const speechOrder = ['1AC', 'CX1', '1NC', 'CX2', '2AC', 'CX3', '2NC', 'CX4', '1NR', '1AR', '2NR', '2AR'];
  const startBtn = document.getElementById('start-btn');
startBtn.addEventListener('click', () => {
  if (!speechStarted) {
    const initialSpeech = '1AC';
    speechTimeLeft = speechTimes[initialSpeech];
    currentSpeechIndex = 0;
    updateSpeechDisplay();
    highlightCurrentSpeechButton(initialSpeech);
    updateResponsibilitiesPanel(initialSpeech);
    speechStarted = true;
  }

  if (isSpeechRunning) {
    pauseSpeechTimer();
  } else {
    startSpeechTimer();
  }
});

  const mainTimer = document.getElementById('main-timer');
  let currentSpeechIndex = -1;
  let speechStarted = false;
  let speechTimes = {}; // Will be filled in setup-confirm
  let speechTimeLeft = 300;
  let speechTimer, isSpeechRunning = false;

  function updateSpeechDisplay() {
    const mins = Math.floor(speechTimeLeft / 60);
    const secs = speechTimeLeft % 60;
    mainTimer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function pauseSpeechTimer() {
    isSpeechRunning = false;
    clearInterval(speechTimer);
    startBtn.textContent = currentSpeechIndex === -1 ? 'Start 1AC' : 'Start';
  }

  function startSpeechTimer() {
    if (isSpeechRunning) return;
    isSpeechRunning = true;
    startBtn.textContent = 'Pause';
    speechTimer = setInterval(() => {
      if (--speechTimeLeft <= 0) {
        clearInterval(speechTimer);
        isSpeechRunning = false;
        speechTimeLeft = 0;
        updateSpeechDisplay();
        return;
      }
      updateSpeechDisplay();
    }, 1000);
  }

  speechButtons.forEach(button => {
    button.addEventListener('click', () => {
      const label = button.dataset.label;
      if (!speechTimes[label]) return;
      pauseSpeechTimer();
      speechTimeLeft = speechTimes[label];
      currentSpeechIndex = speechOrder.indexOf(label);
      updateSpeechDisplay();
      highlightCurrentSpeechButton(label);
      updateResponsibilitiesPanel(label);
      startSpeechTimer();
      startBtn.disabled = false;
      startBtn.textContent = 'Pause';
      speechStarted = true;
    });
  });

  document.getElementById('setup-confirm').addEventListener('click', () => {
    const level = document.getElementById('level-select').value;
    const role = document.getElementById('role-select').value;
    const timePresets = {
      high: { '1AC': 480, 'CX1': 180, '1NC': 480, 'CX2': 180, '2AC': 480, 'CX3': 180, '2NC': 480, 'CX4': 180, '1NR': 300, '1AR': 300, '2NR': 300, '2AR': 300 },
      middle: { '1AC': 300, 'CX1': 180, '1NC': 300, 'CX2': 180, '2AC': 300, 'CX3': 180, '2NC': 300, 'CX4': 180, '1NR': 180, '1AR': 180, '2NR': 180, '2AR': 180 }
    };
    speechTimes = timePresets[level];
    document.getElementById('setup-modal').style.display = 'none';
    document.getElementById('modal-backdrop').style.display = 'none';
    updateSpeechDisplay();
  });

  updateSpeechDisplay(); // Initialize timer display
});
