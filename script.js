// ====== TIMER VARIABLES ======
let speechTimer;
let speechTimeLeft = 300;
let isSpeechRunning = false;

let prepTimer;
let prepTimeLeft = 300;
let isPrepRunning = false;

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

// ====== FORMAT TIME FUNCTION ======
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ====== SPEECH TIMER FUNCTIONS ======
function updateSpeechDisplay() {
  mainTimer.textContent = formatTime(speechTimeLeft);
  speechProgress.value = speechTimeLeft;
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
      document.getElementById('speechTimerContainer').classList.add('bg-red-600');
      new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play();
      return;
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
      const used = 300 - prepTimeLeft;
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

// ====== TOAST FUNCTION ======
function showPrepUsedToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// ====== RESPONSIBILITIES CONTENT ======
const speechResponsibilities = {
  '1AC': ['Read pre-written case', 'Speak clearly and confidently', 'Frame the round for the judge'],
  'CX1': ['Ask questions to clarify the 1AC case', 'Expose contradictions', 'Work with partner'],
  '1NC': ['Respond to 1AC with off-case', 'Introduce disadvantages', 'Start kritik if needed'],
  'CX2': ['Cross-ex 1NC', 'Clarify arguments'],
  '2AC': ['Respond to 1NC', 'Rebuild 1AC', 'Extend key arguments'],
  'CX3': ['Clarify 2AC', 'Highlight 1NC weaknesses'],
  '2NC': ['Extend off-case', 'Collapse arguments', 'Pre-empt 1AR'],
  'CX4': ['Cross-ex 2NC', 'Set up 1AR'],
  '1NR': ['Defend 2NC', 'Refute 2AC'],
  '1AR': ['Respond to 2NC/1NR', 'Collapse to winning arguments'],
  '2NR': ['Extend 1 or 2 key arguments', 'Respond to 1AR'],
  '2AR': ['Final rebuttal', 'Weigh impacts', 'Tell a clear story']
};

function updateResponsibilities(speechLabel) {
  const listEl = document.getElementById('responsibilities-list');
  listEl.innerHTML = '';
  const responsibilities = speechResponsibilities[speechLabel];

  if (responsibilities && responsibilities.length > 0) {
    responsibilities.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      listEl.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'No responsibilities found for this speech.';
    listEl.appendChild(li);
  }
}

// ====== SPEECH BUTTONS LOGIC ======
const speechTimes = {
  '1AC': 300, 'CX1': 180, '1NC': 300, 'CX2': 180,
  '2AC': 300, 'CX3': 180, '2NC': 300, 'CX4': 180,
  '1NR': 180, '1AR': 180, '2NR': 180, '2AR': 180
};

document.querySelectorAll('.grid button').forEach(button => {
  button.addEventListener('click', () => {
    const label = button.textContent.split(' ')[0];
    const time = speechTimes[label];

    if (isPrepRunning) {
      const confirmSwitch = window.confirm("Prep time is currently running. Are you sure you want to pause Prep Time and start a speech?");
      if (!confirmSwitch) return;
      pausePrepTimer();
    }

    if (isSpeechRunning) {
      const confirmReset = window.confirm("A speech is already being timed. Are you sure you want to switch to a new speech? This will reset the timer.");
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

// ====== EVENT LISTENERS ======
startBtn.addEventListener('click', () => {
  isSpeechRunning ? pauseSpeechTimer() : startSpeechTimer();
});

resetBtn.addEventListener('click', () => {
  pauseSpeechTimer();
  speechTimeLeft = 300;
  document.getElementById('speechTimerContainer').classList.remove('bg-red-600');
  updateSpeechDisplay();
});

speechProgress.addEventListener('input', (e) => {
  speechTimeLeft = parseInt(e.target.value);
  updateSpeechDisplay();
});

startPrepBtn.addEventListener('click', () => {
  if (!isPrepRunning && isSpeechRunning) {
    const confirmStartPrep = window.confirm("A speech is currently being timed. Are you sure you want to use prep time now?");
    if (!confirmStartPrep) return;
    pauseSpeechTimer(); // ✅ Pause speech if prep is confirmed
  }

  isPrepRunning ? pausePrepTimer() : startPrepTimer();
});

resetPrepBtn.addEventListener('click', () => {
  pausePrepTimer();
  prepTimeLeft = 300;
  updatePrepDisplay();
});

prepProgress.addEventListener('input', (e) => {
  prepTimeLeft = parseInt(e.target.value);
  updatePrepDisplay();
});

// ====== RESPONSIBILITIES PANEL TOGGLE ======
const responsibilitiesToggle = document.getElementById('responsibilities-toggle');
const responsibilitiesPanel = document.getElementById('responsibilities-panel');

responsibilitiesToggle.addEventListener('click', (event) => {
  event.stopPropagation();
  responsibilitiesPanel.classList.toggle('translate-x-full');
});

document.addEventListener('click', (event) => {
  const clickedInside = responsibilitiesPanel.contains(event.target);
  const clickedToggle = responsibilitiesToggle.contains(event.target);
  if (!clickedInside && !clickedToggle) {
    responsibilitiesPanel.classList.add('translate-x-full');
  }
});

// ====== INIT ======
updateSpeechDisplay();
updatePrepDisplay();
