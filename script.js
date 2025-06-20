document.addEventListener('DOMContentLoaded', () => {
  // ====== RESPONSIBILITIES PANEL TOGGLE ======
  document.getElementById('responsibilities-toggle').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('responsibilities-panel').classList.toggle('translate-x-full');
  });

  document.addEventListener('click', e => {
    const panel = document.getElementById('responsibilities-panel');
    const toggle = document.getElementById('responsibilities-toggle');
    if (!panel.contains(e.target) && !toggle.contains(e.target)) {
      panel.classList.add('translate-x-full');
    }
  });

  // ====== RESPONSIBILITIES DATA ======
  const detailedResponsibilities = {
    "1st Affirmative": {
      "1AC": {
        "core": "Present the affirmative case: resolution, harms, inherency, solvency, and plan.",
        "style": "Use persuasive tone, emphasize clarity, and signpost structure (e.g., 'First, the Harms...').",
        "mistakes": "Avoid reading too quickly; practice a strong opening."
      }
    },
    "2nd Affirmative": {
      "2AC": {
        "core": "Answer 1NC arguments; extend 1AC case; rebuild aff offense.",
        "style": "Sound confident; don't rush; collapse to strong aff positions.",
        "mistakes": "Don’t drop key 1NC arguments; clarify what you're winning."
      }
    },
    "1st Negative": {
      "1NC": {
        "core": "Introduce off-case (disads, CPs, topicality); refute 1AC on-case points.",
        "style": "Label and group arguments clearly. Prioritize important issues.",
        "mistakes": "Don’t forget to answer all 1AC points; avoid jargon overload."
      }
    },
    "2nd Negative": {
      "2NC": {
        "core": "Split the block; extend off-case arguments; deepen strategic attacks.",
        "style": "Organize by argument; prep with 1NR; stay composed.",
        "mistakes": "Avoid overlap with 1NR; be sure to extend impacts."
      }
    },
    "Judge": {
      "1AC": {
        "core": "Judge watches and flows the round.",
        "style": "Remain objective. Listen for clash, logic, and clarity.",
        "mistakes": "Avoid distractions or bias."
      }
    }
  };

  // ====== TIMER VARIABLES ======
  let speechTimer;
  let speechTimeLeft = 300;
  let isSpeechRunning = false;

  let prepTimer;
  let prepTimeLeft = 300;
  let isPrepRunning = false;

  let userRole = '';
  let userLevel = '';
  let speechTimes = {};

  // ====== TIME PRESETS ======
  const timePresets = {
    middle: {
      speechTimes: {
        '1AC': 300, '1NC': 300, '2AC': 300, '2NC': 300,
        '1NR': 180, '1AR': 180, '2NR': 180, '2AR': 180,
        'CX1': 180, 'CX2': 180, 'CX3': 180, 'CX4': 180
      },
      prepTime: 300
    },
    high: {
      speechTimes: {
        '1AC': 480, '1NC': 480, '2AC': 480, '2NC': 480,
        '1NR': 300, '1AR': 300, '2NR': 300, '2AR': 300,
        'CX1': 180, 'CX2': 180, 'CX3': 180, 'CX4': 180
      },
      prepTime: 480
    }
  };

  // ====== DOM ELEMENTS ======
  const mainTimer = document.getElementById('main-timer');
  const speechProgress = document.getElementById('speech-progress');
  const startBtn = document.getElementById('start-btn');
  const resetBtn = document.getElementById('reset-btn');
  const prepTimerDisplay = document.getElementById('prep-timer');
  const prepProgress = document.getElementById('prep-progress');
  const prepRemaining = document.getElementById('prep-remaining');
  const startPrepBtn = document.getElementById('start-prep-btn');
  const resetPrepBtn = document.getElementById('reset-prep-btn');

  // ====== UTILITIES ======
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // ====== SPEECH TIMER FUNCTIONS ======
  function updateSpeechDisplay() {
    mainTimer.textContent = formatTime(speechTimeLeft);
    speechProgress.value = speechTimeLeft;
    speechProgress.max = speechTimeLeft;
  }

  function startSpeechTimer() {
    if (isSpeechRunning) return;
    isSpeechRunning = true;
    startBtn.textContent = 'Pause';

    speechTimer = setInterval(() => {
      if (speechTimeLeft <= 0) {
        clearInterval(speechTimer);
        isSpeechRunning = false;
        mainTimer.textContent = '0:00';
      }
      speechTimeLeft--;
      updateSpeechDisplay();
    }, 1000);
  }

  function pauseSpeechTimer() {
    isSpeechRunning = false;
    startBtn.textContent = 'Start';
    clearInterval(speechTimer);
  }

  // ====== PREP TIMER FUNCTIONS ======
  function updatePrepDisplay() {
    prepTimerDisplay.textContent = formatTime(prepTimeLeft);
    prepRemaining.textContent = formatTime(prepTimeLeft);
    prepProgress.value = prepTimeLeft;
    prepProgress.max = prepTimeLeft;
  }

  function startPrepTimer() {
    if (isPrepRunning) return;
    isPrepRunning = true;
    startPrepBtn.textContent = 'Pause Prep';

    prepTimer = setInterval(() => {
      if (prepTimeLeft <= 0) {
        clearInterval(prepTimer);
        isPrepRunning = false;
        return;
      }

      prepTimeLeft--;

      if (prepTimeLeft % 60 === 59) {
        const used = timePresets[userLevel].prepTime - prepTimeLeft;
        showPrepUsedToast(`${Math.floor(used / 60)} minute${used >= 120 ? 's' : ''} of prep used`);
      }

      updatePrepDisplay();
    }, 1000);
  }

  function pausePrepTimer() {
    isPrepRunning = false;
    startPrepBtn.textContent = 'Start Prep';
    clearInterval(prepTimer);
  }

  function showPrepUsedToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  // ====== RESPONSIBILITIES FUNCTION ======
  function updateResponsibilities(currentSpeechLabel) {
    const roleNameMap = {
      "1A": "1st Affirmative",
      "2A": "2nd Affirmative",
      "1N": "1st Negative",
      "2N": "2nd Negative",
      "Judge": "Judge"
    };

    const userFriendlyRole = roleNameMap[userRole];
    const roleData = detailedResponsibilities[userFriendlyRole];
    const speechData = roleData?.[currentSpeechLabel];
    const listEl = document.getElementById('responsibilities-list');
    listEl.innerHTML = '';

    const addCategory = (title, content) => {
      const heading = document.createElement('h4');
      heading.className = 'font-bold mt-4';
      heading.textContent = title;
      listEl.appendChild(heading);

      const item = document.createElement('li');
      item.textContent = content;
      listEl.appendChild(item);
    };

    if (speechData) {
      addCategory('Core Responsibilities', speechData.core);
      addCategory('Style & Strategy Tips', speechData.style);
      addCategory('Reminders & Common Mistakes', speechData.mistakes);
    } else {
      const tip = (userRole === 'Judge')
        ? "Listen carefully; take notes on clarity, clash, and credibility."
        : `Be sure to flow and prepare responses to ${currentSpeechLabel}.`;
      listEl.innerHTML = `<li>${tip}</li>`;
    }
  }

  // ====== EVENT LISTENERS ======
  document.querySelectorAll('.grid button').forEach(button => {
    button.addEventListener('click', () => {
      const match = button.textContent.match(/^[A-Z0-9]+/);
      const label = match ? match[0] : button.textContent.trim();
      const time = speechTimes[label];

      if (!time) {
        alert("Please click 'Start Debate Timer' first.");
        return;
      }

      if (isPrepRunning) {
        const confirmSwitch = window.confirm("Prep time is running. Pause and start speech?");
        if (!confirmSwitch) return;
        pausePrepTimer();
      }

      if (isSpeechRunning) {
        const confirmReset = window.confirm("Speech is running. Switch speeches?");
        if (!confirmReset) return;
      }

      pauseSpeechTimer();
      speechTimeLeft = time;
      updateSpeechDisplay();
      document.getElementById('speechTimerContainer').classList.remove('bg-red-600');
      startSpeechTimer();
      updateResponsibilities(label);
    });
  });

  startBtn.addEventListener('click', () => {
    isSpeechRunning ? pauseSpeechTimer() : startSpeechTimer();
  });

  resetBtn.addEventListener('click', () => {
    pauseSpeechTimer();
    speechTimeLeft = 300;
    updateSpeechDisplay();
    document.getElementById('speechTimerContainer').classList.remove('bg-red-600');
  });

  speechProgress.addEventListener('input', e => {
    speechTimeLeft = parseInt(e.target.value);
    updateSpeechDisplay();
  });

  startPrepBtn.addEventListener('click', () => {
    if (!isPrepRunning && isSpeechRunning) {
      const confirmStartPrep = window.confirm("A speech is running. Use prep instead?");
      if (!confirmStartPrep) return;
      pauseSpeechTimer();
    }

    isPrepRunning ? pausePrepTimer() : startPrepTimer();
  });

  resetPrepBtn.addEventListener('click', () => {
    pausePrepTimer();
    prepTimeLeft = timePresets[userLevel].prepTime;
    updatePrepDisplay();
  });

  prepProgress.addEventListener('input', e => {
    prepTimeLeft = parseInt(e.target.value);
    updatePrepDisplay();
  });

  // ====== MODAL SETUP CONFIRMATION ======
  document.getElementById('setup-confirm').addEventListener('click', () => {
    document.activeElement?.blur();
    document.querySelectorAll('#setup-modal select, #setup-modal input').forEach(el => el.blur());

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const roleSelect = document.getElementById('role-select');
    const levelSelect = document.getElementById('level-select');
    userRole = roleSelect.value;
    userLevel = levelSelect.value;

    if (!userRole || !userLevel) {
      alert("Please select both role and division.");
      return;
    }

    speechTimes = timePresets[userLevel].speechTimes;
    prepTimeLeft = timePresets[userLevel].prepTime;

    const modal = document.getElementById('setup-modal');
    modal.style.display = 'none';
    modal.style.pointerEvents = 'none';

    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) backdrop.style.display = 'none';

    updateSpeechDisplay();
    updatePrepDisplay();
  });

  // ====== INIT ======
  updateSpeechDisplay();
  updatePrepDisplay();
});
