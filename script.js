document.addEventListener('DOMContentLoaded', () => {
  // === HELPER TO HIGHLIGHT ACTIVE SPEECH BUTTON ===
  function highlightCurrentSpeechButton(label) {
    speechButtons.forEach(btn => {
      if (btn.dataset.label === label) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // === EXISTING CODE ===
  const respToggle = document.getElementById('responsibilities-toggle');
  const respPanel = document.getElementById('responsibilities-panel');
  const closeBtn = document.getElementById('close-responsibilities');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      respPanel.classList.add('translate-x-full');
      respToggle.setAttribute('aria-expanded', 'false');
    });
  }

  if (respToggle && respPanel) {
    respToggle.setAttribute('aria-expanded', 'false');
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
  }

  const speechOrder = ['1AC', 'CX1', '1NC', 'CX2', '2AC', 'CX3', '2NC', 'CX4', '1NR', '1AR', '2NR', '2AR'];
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

  let userRole = '', userLevel = '', speechTimes = {}, currentSpeechIndex = -1, speechStarted = false;
  let speechTimer, prepTimer;
  let speechTimeLeft = 300, prepTimeLeft = 300;
  let isSpeechRunning = false, isPrepRunning = false;

  const mainTimer = document.getElementById('main-timer');
  const startBtn = document.getElementById('start-btn');
  const resetBtn = document.getElementById('reset-btn');
  const prepTimerDisplay = document.getElementById('prep-timer');
  const startPrepBtn = document.getElementById('start-prep-btn');
  const resetPrepBtn = document.getElementById('reset-prep-btn');
  const alarmAudio = document.getElementById('alarm-audio');
  const speechButtons = Array.from(document.querySelectorAll('.speech-btn'));

  speechButtons.forEach(btn => {
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.style.touchAction = 'manipulation';
  });

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function parseTimeInput(input) {
    const match = input.trim().match(/^(\d{1,2}):([0-5]?[0-9])$/);
    if (match) return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    if (/^\d+$/.test(input)) return parseInt(input, 10) * 60;
    return null;
  }

  function playAlarmAndFlash() {
    alarmAudio.currentTime = 0;
    alarmAudio.play();
    let flashes = 0;
    const flashInterval = setInterval(() => {
      mainTimer.classList.toggle('text-red-600');
      if (++flashes >= 10) {
        clearInterval(flashInterval);
        mainTimer.classList.remove('text-red-600');
      }
    }, 200);
  }

  function grayOutSpeechButton(label) {
    const btn = speechButtons.find(b => b.dataset.label === label);
    if (btn) {
      btn.classList.add('bg-gray-400', 'text-gray-700', 'cursor-not-allowed');
      btn.classList.remove('bg-blue-500', 'bg-sky-600', 'bg-purple-500', 'text-white', 'active');
      btn.disabled = true;
    }
  }

  function grayOutPreviousSpeechButtons(index) {
    for (let i = 0; i <= index; i++) grayOutSpeechButton(speechOrder[i]);
  }

  function resetSpeechButtons() {
    speechButtons.forEach(btn => {
      btn.classList.remove('bg-gray-400', 'text-gray-700', 'cursor-not-allowed', 'active');
      btn.classList.add('text-white');
      btn.disabled = false;
    });
  }

  function updateSpeechDisplay() {
    mainTimer.textContent = formatTime(speechTimeLeft);
  }

  function updatePrepDisplay() {
    prepTimerDisplay.textContent = formatTime(prepTimeLeft);
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
        if (currentSpeechIndex >= 0) grayOutSpeechButton(speechOrder[currentSpeechIndex]);
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

  mainTimer.addEventListener('focus', pauseSpeechTimer);
  mainTimer.addEventListener('blur', () => {
    const newTime = parseTimeInput(mainTimer.textContent);
    if (newTime !== null) {
      speechTimeLeft = newTime;
      updateSpeechDisplay();
      startSpeechTimer();
    } else {
      alert('Invalid format. Use MM:SS or a number like 3 (for 3:00).');
      updateSpeechDisplay();
    }
  });

  prepTimerDisplay.addEventListener('focus', pausePrepTimer);
  prepTimerDisplay.addEventListener('blur', () => {
    const newTime = parseTimeInput(prepTimerDisplay.textContent);
    if (newTime !== null) {
      prepTimeLeft = newTime;
      updatePrepDisplay();
      startPrepTimer();
    } else {
      alert('Invalid format. Use MM:SS or a number like 3 (for 3:00).');
      updatePrepDisplay();
    }
  });

  speechButtons.forEach(button => {
    button.addEventListener('click', () => {
      const label = button.dataset.label;
      const time = speechTimes[label];
      if (!time) return alert("Please click 'Start Debate' first.");
      if (isPrepRunning && !confirm("Prep is running. Pause and start speech?")) return;
      if (isPrepRunning) pausePrepTimer();
      if (isSpeechRunning && !confirm("Speech is running. Switch speeches?")) return;
      pauseSpeechTimer();
      speechTimeLeft = time;
      updateSpeechDisplay();
      currentSpeechIndex = speechOrder.indexOf(label);
      grayOutPreviousSpeechButtons(currentSpeechIndex);
      highlightCurrentSpeechButton(label); // ✅ ADDED
      startSpeechTimer();
      startBtn.disabled = false;
      startBtn.textContent = 'Pause';
      speechStarted = true;
    });
  });

  startBtn.addEventListener('click', () => {
    if (!speechStarted) {
      const label = '1AC';
      const time = speechTimes[label];
      if (!time) return alert("Please click 'Start Debate' first.");
      pauseSpeechTimer();
      speechTimeLeft = time;
      updateSpeechDisplay();
      currentSpeechIndex = 0;
      grayOutPreviousSpeechButtons(currentSpeechIndex);
      highlightCurrentSpeechButton(label); // ✅ ADDED
      startSpeechTimer();
      startBtn.textContent = 'Pause';
      speechStarted = true;
    } else {
      isSpeechRunning ? pauseSpeechTimer() : startSpeechTimer();
    }
  });

  resetBtn.addEventListener('click', () => {
    pauseSpeechTimer();
    const label = currentSpeechIndex === -1 ? '1AC' : speechOrder[currentSpeechIndex];
    speechTimeLeft = speechTimes[label] || 300;
    updateSpeechDisplay();
    startBtn.disabled = false;
    startBtn.textContent = currentSpeechIndex === -1 ? 'Start 1AC' : 'Start';
  });

  startPrepBtn?.addEventListener('click', () => {
    if (!isPrepRunning && isSpeechRunning && !confirm("Speech is running. Use prep instead?")) return;
    if (isSpeechRunning) pauseSpeechTimer();
    isPrepRunning ? pausePrepTimer() : startPrepTimer();
  });

  resetPrepBtn?.addEventListener('click', () => {
    pausePrepTimer();
    prepTimeLeft = timePresets[userLevel]?.prepTime || 300;
    updatePrepDisplay();
  });

  document.getElementById('setup-confirm').addEventListener('click', () => {
    const level = document.getElementById('level-select').value;
    const role = document.getElementById('role-select').value;
    if (!level || !role) return alert("Please select both role and division.");
    userLevel = level;
    userRole = role;
    speechTimes = timePresets[level].speechTimes;
    prepTimeLeft = timePresets[level].prepTime;
    document.getElementById('setup-modal').style.display = 'none';
    document.getElementById('modal-backdrop').style.display = 'none';
    resetSpeechButtons();
    currentSpeechIndex = -1;
    speechStarted = false;
    startBtn.textContent = 'Start 1AC';
    startBtn.disabled = false;
    updateSpeechDisplay();
    updatePrepDisplay();
  });

  updateSpeechDisplay();
  updatePrepDisplay();
});
