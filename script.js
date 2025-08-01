document.addEventListener('DOMContentLoaded', () => {
  const speechOrder = ['1AC', 'CX1', '1NC', 'CX2', '2AC', 'CX3', '2NC', 'CX4', '1NR', '1AR', '2NR', '2AR'];
  let currentSpeechIndex = -1;
  let speechTimes = {};
  let speechTimeLeft = 300;
  let speechTimer, isSpeechRunning = false, speechStarted = false;
  let selectedRole = '1A';

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
  const divisionDisplay = document.createElement('button');

  const prepTimerEl = document.getElementById('prep-timer');
  const startPrepBtn = document.getElementById('start-prep-btn');
  const resetPrepBtn = document.getElementById('reset-prep-btn');
  let prepTimeLeft = 300;
  let prepTimer = null;
  let isPrepRunning = false;

  // auto-select defaults
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
    const mins = Math.floor(prepTimeLeft / 60);
    const secs = prepTimeLeft % 60;
    prepTimerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function pauseSpeechTimer() {
    isSpeechRunning = false;
    clearInterval(speechTimer);
    startBtn.textContent = currentSpeechIndex === -1 ? 'Start 1AC' : `Start ${speechOrder[currentSpeechIndex]}`;
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
      button.classList.add('opacity-50', 'cursor-not-allowed', 'line-through');
    }
    alarmAudio.play();
    const nextIndex = currentSpeechIndex + 1;
    if (nextIndex < speechOrder.length) {
      const nextLabel = speechOrder[nextIndex];
      startBtn.textContent = `Start ${nextLabel}`;
      startBtn.onclick = () => {
        handleSpeechButton(document.querySelector(`[data-label="${nextLabel}"]`));
        startBtn.onclick = null;
      };
    }
  }

  function disablePreviousSpeeches(index) {
    for (let i = 0; i < index; i++) {
      const btn = speechButtons.find(b => b.dataset.label === speechOrder[i]);
      if (btn) {
        btn.classList.add('opacity-50', 'cursor-not-allowed', 'line-through');
      }
    }
  }

  function enableLaterSpeeches(index) {
    for (let i = index + 1; i < speechOrder.length; i++) {
      const btn = speechButtons.find(b => b.dataset.label === speechOrder[i]);
      if (btn) {
        btn.classList.remove('opacity-50', 'cursor-not-allowed', 'line-through');
      }
    }
  }

  function updateResponsibilitiesPanel(speech) {
  const panel = document.getElementById('responsibilities-list');
  panel.innerHTML = '';
  const data = responsibilitiesData[selectedRole]?.[speech];
  if (!data) {
    panel.innerHTML = '<li>No responsibilities found for this speech.</li>';
    return;
  }

  for (const [category, content] of Object.entries(data)) {
    if (category === "Stock Issues") {
      const item = document.createElement('div');
      item.innerHTML = `
        <h2 class="text-xl font-serif text-cyan-400 mb-2 flex items-center justify-between">
          <button id="stock-toggle" aria-expanded="false" aria-controls="stock-issues-content"
            class="flex items-center space-x-1 focus:ring-2 focus:ring-cyan-400 rounded">
            <span>Stock Issues</span>
            <svg id="stock-icon" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform transition-transform"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </h2>
        <div id="stock-issues-content" class="hidden transition-all duration-300 ease-in-out">
          <ul class="list-disc pl-5">
            ${content}
          </ul>
        </div>
      `;
      panel.appendChild(item);
    } else {
      const container = document.createElement('div');
      container.classList.add('mb-6');
      container.innerHTML = `
        <h2 class="text-xl font-serif text-cyan-400 mb-2">${category}</h2>
        ${content}
      `;
      panel.appendChild(container);
    }
  }
}

  function handleSpeechButton(button) {
    const label = button.dataset.label;
    const newIndex = speechOrder.indexOf(label);
    if (!speechTimes[label]) return;

    if (isPrepRunning) {
      const confirmSwitch = confirm("Are you sure you want to start a speech? Your prep time will pause.");
      if (!confirmSwitch) return;
      pausePrepTimer();
    }

    const isGrayedOut = button.classList.contains('opacity-50');
    if (isGrayedOut) {
      const confirmed = confirm("Are you sure you want to restart this speech?");
      if (!confirmed) return;

      pauseSpeechTimer();
      speechTimeLeft = speechTimes[label];
      currentSpeechIndex = newIndex;
      updateSpeechDisplay();
      updateResponsibilitiesPanel(label);

      disablePreviousSpeeches(newIndex);
      enableLaterSpeeches(newIndex);

      button.classList.remove('opacity-50', 'cursor-not-allowed', 'line-through');
      button.classList.add('active');

      speechButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      startSpeechTimer();
      startBtn.disabled = false;
      startBtn.textContent = 'Pause';
      speechStarted = true;
      return;
    }

    const isDifferentSpeech = label !== speechOrder[currentSpeechIndex];
    if (isSpeechRunning && isDifferentSpeech) {
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
    isPrepRunning ? pausePrepTimer() : startPrepTimer();
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
    selectedRole = roleSelect.value;
    const timePresets = {
      high: { '1AC': 480, 'CX1': 180, '1NC': 480, 'CX2': 180, '2AC': 480, 'CX3': 180, '2NC': 480, 'CX4': 180, '1NR': 300, '1AR': 300, '2NR': 300, '2AR': 300 },
      middle: { '1AC': 300, 'CX1': 90, '1NC': 300, 'CX2': 90, '2AC': 300, 'CX3': 90, '2NC': 300, 'CX4': 90, '1NR': 180, '1AR': 180, '2NR': 180, '2AR': 180 }
    };
    speechTimes = timePresets[level];
    setupModal.style.display = 'none';
    modalBackdrop.style.display = 'none';

    divisionDisplay.textContent = `${level === 'middle' ? 'Middle School' : 'High School'} | ${selectedRole}`;
    divisionDisplay.className = 'fixed top-14 left-2 text-sm text-white bg-gray-700 px-2 py-1 rounded cursor-pointer z-50';
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
    // 🆕 NEW — Show default responsibilities for selected role
   const defaultTips = responsibilitiesData[selectedRole]?.default;
   if (defaultTips) {
    const panel = document.getElementById('responsibilities-list');
    panel.innerHTML = '';
   for (const [category, content] of Object.entries(defaultTips)) {
  const container = document.createElement('div');
  container.classList.add('mb-6');
  container.innerHTML = `
    <h2 class="text-xl font-serif text-cyan-400 mb-2">${category}</h2>
    ${content}
  `;
  panel.appendChild(container);
 }
}
  });

  closeBtn.addEventListener('click', () => {
  respPanel.classList.add('translate-x-full');
  respToggle.setAttribute('aria-expanded', 'false');
  divisionDisplay.classList.remove('hidden'); // show again
});

  respToggle.addEventListener('click', e => {
  e.stopPropagation();
  const isOpen = respPanel.classList.toggle('translate-x-full');
  respToggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  divisionDisplay.classList.toggle('hidden', !isOpen); // hide when panel is open
});

  document.addEventListener('click', e => {
  if (!respPanel.contains(e.target) && !respToggle.contains(e.target)) {
    respPanel.classList.add('translate-x-full');
    respToggle.setAttribute('aria-expanded', 'false');
    divisionDisplay.classList.remove('hidden'); // show again
  }
});

  document.addEventListener('click', (e) => {
    const toggleButton = e.target.closest("#stock-toggle");
    if (toggleButton) {
      const content = document.getElementById("stock-issues-content");
      const icon = document.getElementById("stock-icon");
      const isExpanded = toggleButton.getAttribute("aria-expanded") === "true";
      toggleButton.setAttribute("aria-expanded", String(!isExpanded));
      content.classList.toggle("hidden");
      icon.classList.toggle("rotate-180");
    }
  });
 // Swipe gesture to open/close responsibilities panel
let touchStartX = 0;
let touchEndX = 0;

document.body.addEventListener('touchstart', e => {
  console.log('Touch started');
  touchStartX = e.changedTouches[0].screenX;
});

document.body.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipeGesture();
});

function handleSwipeGesture() {
  const swipeDistance = touchEndX - touchStartX;

  // Swipe left to open panel (only if closed)
  if (swipeDistance < -50 && respPanel.classList.contains('translate-x-full')) {
    console.log('Swiped left to open panel');
    respPanel.classList.remove('translate-x-full');
    respToggle.setAttribute('aria-expanded', 'true');
  }

  // Swipe right to close panel (only if open)
  if (swipeDistance > 50 && !respPanel.classList.contains('translate-x-full')) {
    console.log('Swiped right to close panel');
    respPanel.classList.add('translate-x-full');
    respToggle.setAttribute('aria-expanded', 'false');
  }
}
  updateSpeechDisplay();
  updatePrepDisplay();
function parseTimeInput(input) {
  // If only digits (e.g. "333"), treat as MMSS
  if (/^\d+$/.test(input)) {
    const clean = input.trim();
    const len = clean.length;

    // Handle MMSS logic for any digit length
    const mins = parseInt(clean.slice(0, -2) || '0', 10);  // everything before last 2 digits
    const secs = parseInt(clean.slice(-2), 10);            // last 2 digits only
    return mins * 60 + secs;
  }

  // Handle "M:SS" format (e.g. "5:00")
  if (/^\d+:\d{1,2}$/.test(input)) {
    const [m, s] = input.split(':').map(Number);
    return m * 60 + s;
  }

  // Handle "XmYs" or "Xm" format (e.g. "2m15s", "3m")
  const match = input.match(/(?:(\d+)m)?\s*(?:(\d+)s)?/i);
  if (match) {
    const minutes = parseInt(match[1] || '0', 10);
    const seconds = parseInt(match[2] || '0', 10);
    return minutes * 60 + seconds;
  }

  return NaN;
}
  // Allow users to enter flexible time and hit Enter to start timer
mainTimer.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();

    const input = mainTimer.textContent.trim();
    let totalSeconds = parseTimeInput(input);

    if (isNaN(totalSeconds) || totalSeconds <= 0) {
      alert("Please enter a valid time.");
      return;
    }

    pauseSpeechTimer();
    speechTimeLeft = totalSeconds;
    updateSpeechDisplay();

    if (!speechStarted) {
      currentSpeechIndex = currentSpeechIndex === -1 ? 0 : currentSpeechIndex;
      speechStarted = true;
    }

    startSpeechTimer();
    mainTimer.blur(); // removes focus ring
  }
});
    // Confirm before editing main timer
  mainTimer.addEventListener('click', (e) => {
    if (isSpeechRunning) {
      const confirmEdit = confirm("Are you sure you want to pause this timer?");
      if (confirmEdit) {
        pauseSpeechTimer();
        mainTimer.focus();
      } else {
        e.preventDefault();
        document.getSelection()?.removeAllRanges();
        mainTimer.blur();
      }
    }
  });
});

