document.addEventListener('DOMContentLoaded', () => {
  // === FULL RESPONSIBILITIES DATA ===
  const responsibilitiesData = {
    "1AC": {
      "Core Responsibilities": "Present the affirmative case: resolution, harms, solvency.",
      "Style & Strategy Tips": "Use persuasive tone, emphasize clarity, and signpost major points.",
      "Reminders & Common Mistakes": "Avoid reading too quickly; practice a strong opening."
    },
    "CX1": {
      "Core Responsibilities": "Ask pointed questions to clarify or weaken the 1AC.",
      "Style & Strategy Tips": "Be direct, polite, and strategic with follow-up questions.",
      "Reminders & Common Mistakes": "Don’t waste time; avoid hostile tone."
    },
    "1NC": {
      "Core Responsibilities": "Present off-case arguments and refute the 1AC.",
      "Style & Strategy Tips": "Signpost clearly and weigh impacts.",
      "Reminders & Common Mistakes": "Don’t just list cards—explain why they matter."
    },
    "CX2": {
      "Core Responsibilities": "Ask questions that challenge the 1NC arguments.",
      "Style & Strategy Tips": "Stay focused and prep extensions or responses.",
      "Reminders & Common Mistakes": "Avoid messy or incomplete flows."
    },
    "2AC": {
      "Core Responsibilities": "Extend the 1AC and respond to the 1NC’s arguments.",
      "Style & Strategy Tips": "Be efficient—group arguments and collapse to key issues.",
      "Reminders & Common Mistakes": "Don’t drop key arguments; always extend impacts."
    },
    "CX3": {
      "Core Responsibilities": "Question the 2AC and set up the 2NC strategy.",
      "Style & Strategy Tips": "Use questions to corner contradictions or gaps.",
      "Reminders & Common Mistakes": "Avoid disorganized questioning."
    },
    "2NC": {
      "Core Responsibilities": "Extend the 1NC and solidify the negative strategy.",
      "Style & Strategy Tips": "Choose your best arguments—depth over breadth.",
      "Reminders & Common Mistakes": "Avoid over-tagging; stay on time."
    },
    "CX4": {
      "Core Responsibilities": "Clarify and press inconsistencies in 2NC.",
      "Style & Strategy Tips": "Think about how to frame the upcoming 1NR.",
      "Reminders & Common Mistakes": "Don’t argue—ask sharp, purposeful questions."
    },
    "1NR": {
      "Core Responsibilities": "Defend the 2NC and refute the 2AC.",
      "Style & Strategy Tips": "Be selective—go all in on your best arguments.",
      "Reminders & Common Mistakes": "Don’t spread too thin; reinforce key positions."
    },
    "1AR": {
      "Core Responsibilities": "Respond to 2NC and 1NR—collapse to your best path.",
      "Style & Strategy Tips": "Organize clearly; control the narrative.",
      "Reminders & Common Mistakes": "Avoid trying to respond to everything—prioritize."
    },
    "2NR": {
      "Core Responsibilities": "Extend the winning negative argument and weigh impacts.",
      "Style & Strategy Tips": "Frame the debate and why you win.",
      "Reminders & Common Mistakes": "Don’t bring up new arguments."
    },
    "2AR": {
      "Core Responsibilities": "Respond to 2NR and crystallize the round for the judge.",
      "Style & Strategy Tips": "Summarize, weigh, and clearly state why you win.",
      "Reminders & Common Mistakes": "Avoid new arguments; don’t forget impact calculus."
    }
  };

  function updateResponsibilitiesPanel(speech) {
    const panel = document.getElementById('responsibilities-list');
    panel.innerHTML = '';
    const data = responsibilitiesData[speech];
    if (!data) {
      panel.innerHTML = '<li>No responsibilities found for this speech.</li>';
      return;
    }
    for (const [category, content] of Object.entries(data)) {
      const item = document.createElement('li');
      item.innerHTML = `<strong>${category}:</strong> ${content}`;
      panel.appendChild(item);
    }
  }

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

  const speechOrder = ['1AC', 'CX1', '1NC', 'CX2', '2AC', 'CX3', '2NC', 'CX4', '1NR', '1AR', '2NR', '2AR'];
  const startBtn = document.getElementById('start-btn');
  const mainTimer = document.getElementById('main-timer');
  let currentSpeechIndex = -1;
  let speechStarted = false;
  let speechTimes = {};
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
    isSpeechRunning ? pauseSpeechTimer() : startSpeechTimer();
  });

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

  updateSpeechDisplay(); // Init display
});
