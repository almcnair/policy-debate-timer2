document.addEventListener('DOMContentLoaded', () => {
  // ====== RESPONSIBILITIES PANEL TOGGLE ======
  const respToggle = document.getElementById('responsibilities-toggle');
  const respPanel = document.getElementById('responsibilities-panel');
  if (respToggle && respPanel) {
    respToggle.addEventListener('click', e => {
      e.stopPropagation();
      respPanel.classList.toggle('translate-x-full');
    });
    document.addEventListener('click', e => {
      if (!respPanel.contains(e.target) && !respToggle.contains(e.target)) {
        respPanel.classList.add('translate-x-full');
      }
    });
  }

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

  // ====== TIME PRESETS ======
  const timePresets = {
    middle: {
      speechTimes: {
        '1AC': 300, 'CX1': 180, '1NC': 300, 'CX2': 180,
        '2AC': 300, 'CX3': 180, '2NC': 300, 'CX4': 180,
        '1NR': 180, '1AR': 180, '2NR': 180, '2AR': 180
      },
      prepTime: 300
    },
    high: {
      speechTimes: {
        '1AC': 480, 'CX1': 180, '1NC': 480, 'CX2': 180,
        '2AC': 480, 'CX3': 180, '2NC': 480, 'CX4': 180,
        '1NR': 300, '1AR': 300, '2NR': 300, '2AR': 300
      },
      prepTime: 300
    }
  };

  // ====== SPEECH ORDER ======
  const speechOrder = [
    '1AC', 'CX1', '1NC', 'CX2', '2AC', 'CX3', '2NC', 'CX4',
    '1NR', '1AR', '2NR', '2AR'
  ];

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
  let currentSpeechIndex = -1;
  let speechStarted = false;

  // ====== DOM ELEMENTS ======
  const mainTimer = document.getElementById('main-timer');
  const startBtn = document.getElementById('start-btn');
  const resetBtn = document.getElementById('reset-btn');
  const prepTimerDisplay = document.getElementById('prep-timer');
  const startPrepBtn = document.getElementById('start-prep-btn');
  const resetPrepBtn = document.getElementById('reset-prep-btn');
  const alarmAudio = document.getElementById('alarm-audio');
  const speechButtons = Array.from(document.querySelectorAll('.speech-btn'));

  // ====== UTILITIES ======
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function parseTimeInput(input) {
    const trimmed = input.trim();
    if (/^\d+$/.test(trimmed)) {
      return parseInt(trimmed, 10) * 60;
    }
    const match = trimmed.match(/^(\d{1,2}):([0-5]?[0-9])$/);
    if (!match) return null;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  }

  function playAlarmAndFlash() {
    if (alarmAudio) {
      alarmAudio.currentTime = 0;
      alarmAudio.play();
    }
    let flashes = 0;
    const flashInterval = setInterval(() => {
      mainTimer.classList.toggle('text-red-600');
      flashes++;
      if (flashes >= 10) {
        clearInterval(flashInterval);
        mainTimer.classList.remove('text-red-600');
      }
    }, 200);
  }

  function grayOutSpeechButton(label) {
    const btn = speechButtons.find(b => b.dataset.label === label);
    if (btn) {
      btn.classList.add('bg-gray-400', 'text-gray-700', 'cursor-not-allowed');
      btn.classList.remove('bg-blue-500', 'text-white', 'hover:bg-blue-600');
      btn.disabled = true;
    }
  }

  function grayOutPreviousSpeechButtons(index) {
    for (let i = 0; i <= index; i++) {
      grayOutSpeechButton(speechOrder[i]);
    }
  }

  function resetSpeechButtons() {
    speechButtons.forEach(btn => {
      btn.classList.remove('bg-gray-400', 'text-gray-700', 'cursor-not-allowed');
      btn.classList.add('bg-blue-500', 'text-white');
      btn.disabled = false;
    });
  }

  // ====== SPEECH TIMER ======
  function updateSpeechDisplay() {
    mainTimer.textContent = formatTime(speechTimeLeft);
  }

  function startSpeechTimer() {
    if (isSpeechRunning) return;
    isSpeechRunning = true;
    startBtn.textContent = 'Pause';
    speechTimer = setInterval(() => {
      if (speechTimeLeft <= 0) {
        clearInterval(speechTimer);
        isSpeechRunning = false;
        speechTimeLeft = 0;
        updateSpeechDisplay();
        playAlarmAndFlash();
        if (currentSpeechIndex >= 0) {
          grayOutSpeechButton(speechOrder[currentSpeechIndex]);
        }
        startBtn.disabled = true;
        return;
      }
      speechTimeLeft--;
      updateSpeechDisplay();
    }, 1000);
  }

  function pauseSpeechTimer() {
    isSpeechRunning = false;
    startBtn.textContent = currentSpeechIndex === -1 ? 'Start 1AC' : 'Start';
    clearInterval(speechTimer);
  }

  // ====== PREP TIMER ======
  function updatePrepDisplay() {
    prepTimerDisplay.textContent = formatTime(prepTimeLeft);
  }

  function startPrepTimer() {
    if (isPrepRunning) return;
    isPrepRunning = true;
    startPrepBtn.textContent = 'Pause Prep';
    prepTimer = setInterval(() => {
      if (prepTimeLeft <= 0) {
        clearInterval(prepTimer);
        isPrepRunning = false;
        prepTimeLeft = 0;
        updatePrepDisplay();
        return;
      }
      prepTimeLeft--;
      updatePrepDisplay();
    }, 1000);
  }

  function pausePrepTimer() {
    isPrepRunning = false;
    startPrepBtn.textContent = 'Start Prep';
    clearInterval(prepTimer);
  }

  // ====== RESPONSIBILITIES ======
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
    if (!listEl) return;
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

  // ====== EDITABLE TIMER HANDLERS ======
  mainTimer.addEventListener('focus', () => {
    pauseSpeechTimer();
  });
  mainTimer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      mainTimer.blur();
    }
  });
  mainTimer.addEventListener('blur', () => {
    const newTime = parseTimeInput(mainTimer.textContent);
    if (newTime !== null) {
      speechTimeLeft = newTime;
      updateSpeechDisplay();
      startSpeechTimer();
    } else {
      updateSpeechDisplay();
      alert('Invalid format. Use MM:SS or a number like 3 (for 3:00).');
    }
  });

  prepTimerDisplay.addEventListener('focus', () => {
    pausePrepTimer();
  });
  prepTimerDisplay.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      prepTimerDisplay.blur();
    }
  });
  prepTimerDisplay.addEventListener('blur', () => {
    const newTime = parseTimeInput(prepTimerDisplay.textContent);
    if (newTime !== null) {
      prepTimeLeft = newTime;
      updatePrepDisplay();
      startPrepTimer();
    } else {
      updatePrepDisplay();
      alert('Invalid format. Use MM:SS or a number like 5 (for 5:00).');
    }
  });

  // ====== EVENT LISTENERS ======
  speechButtons.forEach((button, idx) => {
    button.addEventListener('click', () => {
      const label = button.dataset.label;
      const time = speechTimes[label];
      if (!time) {
        alert("Please click 'Start Debate' first.");
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
      currentSpeechIndex = speechOrder.indexOf(label);
      grayOutPreviousSpeechButtons(currentSpeechIndex);
      startSpeechTimer();
      updateResponsibilities(label);
      startBtn.disabled = false;
      startBtn.textContent = 'Pause';
      speechStarted = true;
    });
  });

  startBtn.addEventListener('click', () => {
    if (!speechStarted) {
      const label = '1AC';
      const time = speechTimes[label];
      if (!time) {
        alert("Please click 'Start Debate' first.");
        return;
      }
      pauseSpeechTimer();
      speechTimeLeft = time;
      updateSpeechDisplay();
      currentSpeechIndex = 0;
      grayOutPreviousSpeechButtons(currentSpeechIndex);
      startSpeechTimer();
      updateResponsibilities(label);
      startBtn.textContent = 'Pause';
      speechStarted = true;
    } else {
      isSpeechRunning ? pauseSpeechTimer() : startSpeechTimer();
    }
  });

  resetBtn.addEventListener('click', () => {
    pauseSpeechTimer();
    let resetLabel = currentSpeechIndex === -1 ? '1AC' : speechOrder[currentSpeechIndex];
    speechTimeLeft = speechTimes[resetLabel] || 300;
    updateSpeechDisplay();
    document.getElementById('speechTimerContainer').classList.remove('bg-red-600');
    startBtn.disabled = false;
    startBtn.textContent = currentSpeechIndex === -1 ? 'Start 1AC' : 'Start';
  });

  if (startPrepBtn) {
    startPrepBtn.addEventListener('click', () => {
      if (!isPrepRunning && isSpeechRunning) {
        const confirmStartPrep = window.confirm("A speech is running. Use prep instead?");
        if (!confirmStartPrep) return;
        pauseSpeechTimer();
      }
      isPrepRunning ? pausePrepTimer() : startPrepTimer();
    });
  }

  if (resetPrepBtn) {
    resetPrepBtn.addEventListener('click', () => {
      pausePrepTimer();
      prepTimeLeft = timePresets[userLevel]?.prepTime || 300;
      updatePrepDisplay();
    });
  }

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
    resetSpeechButtons();
    currentSpeechIndex = -1;
    startBtn.textContent = 'Start 1AC';
    startBtn.disabled = false;
    speechStarted = false;
    // ADDITION (bottom of the DOMContentLoaded block)
function parseTimeInput(input) {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10) * 60;
  }
  const match = trimmed.match(/^(\d{1,2}):([0-5]?[0-9])$/);
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

// === Editable Speech Timer Handling ===
mainTimer.addEventListener('focus', () => {
  pauseSpeechTimer();
});
mainTimer.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    mainTimer.blur();
  }
});
mainTimer.addEventListener('blur', () => {
  const newTime = parseTimeInput(mainTimer.textContent);
  if (newTime !== null) {
    speechTimeLeft = newTime;
    updateSpeechDisplay();
    startSpeechTimer();
  } else {
    updateSpeechDisplay();
    alert('Invalid format. Use MM:SS or a number like 3 for 3:00');
  }
});

// === Editable Prep Timer Handling ===
prepTimerDisplay.addEventListener('focus', () => {
  pausePrepTimer();
});
prepTimerDisplay.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    prepTimerDisplay.blur();
  }
});
prepTimerDisplay.addEventListener('blur', () => {
  const newTime = parseTimeInput(prepTimerDisplay.textContent);
  if (newTime !== null) {
    prepTimeLeft = newTime;
    updatePrepDisplay();
    startPrepTimer();
  } else {
    updatePrepDisplay();
    alert('Invalid format. Use MM:SS or a number like 5 for 5:00');
  }
});

    updateSpeechDisplay();
    updatePrepDisplay();
  });

  // ====== INIT ======
  updateSpeechDisplay();
  updatePrepDisplay();
});
