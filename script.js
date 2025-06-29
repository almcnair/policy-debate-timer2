// === script.js ===
document.addEventListener('DOMContentLoaded', () => {
  const speechOrder = ['1AC', 'CX1', '1NC', 'CX2', '2AC', 'CX3', '2NC', 'CX4', '1NR', '1AR', '2NR', '2AR'];
  let currentSpeechIndex = -1;
  let speechTimes = {};
  let speechTimeLeft = 300;
  let speechTimer, isSpeechRunning = false, speechStarted = false;

  const respToggle = document.getElementById('responsibilities-toggle');
  const respPanel = document.getElementById('responsibilities-panel');
  const closeBtn = document.getElementById('close-responsibilities');
  const speechButtons = Array.from(document.querySelectorAll('.speech-btn'));
  const startBtn = document.getElementById('start-btn');
  const mainTimer = document.getElementById('main-timer');
  const resetBtn = document.getElementById('reset-btn');
  const alarmAudio = document.getElementById('alarm-audio');
  const levelSelect = document.getElementById('level-select');
  const roleSelect = document.getElementById('role-select');
  const setupConfirm = document.getElementById('setup-confirm');
  const setupModal = document.getElementById('setup-modal');
  const setupClose = document.getElementById('setup-close');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const divisionDisplay = document.createElement('div');

  const prepTimerEl = document.getElementById('prep-timer');
  const startPrepBtn = document.getElementById('start-prep-btn');
  const resetPrepBtn = document.getElementById('reset-prep-btn');
  let prepTimeLeft = 300;
  let prepTimer = null;
  let isPrepRunning = false;

  // Auto-select default on load
  levelSelect.value = 'middle';
  roleSelect.value = '1A';
function autoSetupIfDismissed() {
  levelSelect.value = 'middle';
  roleSelect.value = '1A';
  setupConfirm.click();
}

setupClose.addEventListener('click', () => {
  setupModal.style.display = 'none';
  modalBackdrop.style.display = 'none';
  autoSetupIfDismissed();
});

modalBackdrop.addEventListener('click', () => {
  setupModal.style.display = 'none';
  modalBackdrop.style.display = 'none';
  autoSetupIfDismissed();
});

  function updateSpeechDisplay() {
    const mins = Math.floor(speechTimeLeft / 60);
    const secs = speechTimeLeft % 60;
    mainTimer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  function updatePrepDisplay() {
    const m = Math.floor(prepTimeLeft / 60);
    const s = prepTimeLeft % 60;
    prepTimerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  }

  function pauseSpeechTimer() {
    isSpeechRunning = false;
    clearInterval(speechTimer);
    startBtn.textContent = currentSpeechIndex === -1 ? 'Start 1AC' : 'Start';
  }
  function pausePrepTimer() {
    isPrepRunning = false;
    clearInterval(prepTimer);
    startPrepBtn.textContent = 'Start Prep';
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
        handleSpeechEnd(speechOrder[currentSpeechIndex]);
        return;
      }
      updateSpeechDisplay();
    }, 1000);
  }
  function startPrepTimer() {
    if (isPrepRunning) return;
    isPrepRunning = true;
    startPrepBtn.textContent = 'Pause';
    prepTimer = setInterval(() => {
      if (--prepTimeLeft <= 0) {
        clearInterval(prepTimer);
        isPrepRunning = false;
        prepTimeLeft = 0;
        updatePrepDisplay();
        alarmAudio.play();
      } else {
        updatePrepDisplay();
      }
    }, 1000);
  }

  function handleSpeechEnd(label) {
    const button = speechButtons.find(btn => btn.dataset.label === label);
    if (button) {
  button.classList.add('opacity-50', 'cursor-not-allowed');
  // button.disabled = true;   <-- REMOVE or comment out this line
}
    alarmAudio.play();
  }

function disablePreviousSpeeches(index) {
  for (let i = 0; i < index; i++) {
    const btn = speechButtons.find(b => b.dataset.label === speechOrder[i]);
    if (btn) {
      btn.classList.add('opacity-50', 'cursor-not-allowed');
      // btn.disabled = true;   <--- comment this out
    }
  }
}
function enableLaterSpeeches(index) {
  for (let i = index + 1; i < speechOrder.length; i++) {
    const btn = speechButtons.find(b => b.dataset.label === speechOrder[i]);
    if (btn) {
      btn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }
}

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

  function handleSpeechButton(button) {
    const label = button.dataset.label;
    const newIndex = speechOrder.indexOf(label);
    if (!speechTimes[label]) return;

    // new logic:
    if (isPrepRunning) {
      const confirmSwitch = confirm("Are you sure you want to start a speech? Your prep time will pause.");
      if (!confirmSwitch) return;
      pausePrepTimer();
    }

    const isGrayedOut = button.classList.contains('opacity-50');
    const isDifferentSpeech = label !== speechOrder[currentSpeechIndex];
    if (isGrayedOut) {
  const confirmed = confirm('Are you sure you want to restart this speech?');
  if (!confirmed) return;
} else if (isSpeechRunning && isDifferentSpeech) {
  const confirmed = confirm('Are you sure you want to start a new speech? Your timer will reset.');
  if (!confirmed) return;
}
    pauseSpeechTimer();
    speechTimeLeft = speechTimes[label];
    currentSpeechIndex = newIndex;
    updateSpeechDisplay();
    updateResponsibilitiesPanel(label);
    disablePreviousSpeeches(newIndex);
    enableLaterSpeeches(newIndex);
    speechButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    startSpeechTimer();
    startBtn.disabled = false;
    startBtn.textContent = 'Pause';
    speechStarted = true;
  }

  speechButtons.forEach(btn => btn.addEventListener('click', () => handleSpeechButton(btn)));

  startBtn.addEventListener('click', () => {
    if (isPrepRunning) {
      const confirmSwitch = confirm("Are you sure you want to start a speech? Your prep time will pause.");
      if (!confirmSwitch) return;
      pausePrepTimer();
    }
    if (!speechStarted) {
      const initialSpeech = '1AC';
      speechTimeLeft = speechTimes[initialSpeech];
      currentSpeechIndex = 0;
      updateSpeechDisplay();
      updateResponsibilitiesPanel(initialSpeech);
      disablePreviousSpeeches(0);
      document.querySelector(`[data-label="1AC"]`).classList.add('active');
    }
    isSpeechRunning ? pauseSpeechTimer() : startSpeechTimer();
  });

  resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the timer?')) {
      if (currentSpeechIndex !== -1) {
        pauseSpeechTimer();
        const label = speechOrder[currentSpeechIndex];
        speechTimeLeft = speechTimes[label];
        updateSpeechDisplay();
      }
    }
  });

  startPrepBtn.addEventListener('click', () => {
    if (isSpeechRunning) {
      const confirmSwitch = confirm("Are you sure you want to start Prep Time? The speech timer will pause.");
      if (!confirmSwitch) return;
      pauseSpeechTimer();
    }
    if (isPrepRunning) {
      pausePrepTimer();
    } else {
      startPrepTimer();
    }
  });

  resetPrepBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the prep timer?')) {
      pausePrepTimer();
      prepTimeLeft = 300;
      updatePrepDisplay();
    }
  });

  setupConfirm.addEventListener('click', () => {
    const level = levelSelect.value;
    const role = roleSelect.value;
    const timePresets = {
      high: { '1AC': 480, 'CX1': 180, '1NC': 480, 'CX2': 180, '2AC': 480, 'CX3': 180, '2NC': 480, 'CX4': 180, '1NR': 300, '1AR': 300, '2NR': 300, '2AR': 300 },
      middle: { '1AC': 300, 'CX1': 180, '1NC': 300, 'CX2': 180, '2AC': 300, 'CX3': 180, '2NC': 300, 'CX4': 180, '1NR': 180, '1AR': 180, '2NR': 180, '2AR': 180 }
    };
    speechTimes = timePresets[level];
    setupModal.style.display = 'none';
    modalBackdrop.style.display = 'none';

    divisionDisplay.textContent = `${level === 'middle' ? 'Middle School' : 'High School'} | ${role}`;
    divisionDisplay.className = 'fixed top-2 left-2 text-sm text-white bg-gray-700 px-2 py-1 rounded cursor-pointer z-50';
    divisionDisplay.onclick = () => {
      if (isSpeechRunning) {
        if (!confirm('Do you want to stop your current speech timer?')) return;
        pauseSpeechTimer();
      }
      setupModal.style.display = 'block';
      modalBackdrop.style.display = 'block';
    };
    document.body.appendChild(divisionDisplay);
    updateSpeechDisplay();
  });

  setupClose.addEventListener('click', () => {
    setupModal.style.display = 'none';
    modalBackdrop.style.display = 'none';
  });
  modalBackdrop.addEventListener('click', () => {
    setupModal.style.display = 'none';
    modalBackdrop.style.display = 'none';
  });

  closeBtn.addEventListener('click', () => {
    respPanel.classList.add('translate-x-full');
    respToggle.setAttribute('aria-expanded', 'false');
  });
  respToggle.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = respPanel.classList.toggle('translate-x-full');
    respToggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  });
  document.addEventListener('click', e => {
    if (!respPanel.contains(e.target) && !respToggle.contains(e.target)) {
      respPanel.classList.add('translate-x-full');
      respToggle.setAttribute('aria-expanded', 'false');
    }
  });

  updateSpeechDisplay();
  updatePrepDisplay();
});
