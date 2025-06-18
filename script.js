// ====== TIMER VARIABLES ======
let speechTimer;
let speechTimeLeft = 300;
let isSpeechRunning = false;

let prepTimer;
let prepTimeLeft = 300;
let isPrepRunning = false;

// ====== USER SETUP ======
let userRole = '';
let userLevel = '';

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

let speechTimes = {};

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

  const speakerMap = {
    '1A': ['1AC', 'CX1', '2AC', 'CX3', '1AR', '2AR'],
    '2A': ['CX1', '2AC', 'CX3', '1AR', '2AR'],
    '1N': ['1NC', 'CX2', '2NC', 'CX4', '1NR', '2NR'],
    '2N': ['CX2', '2NC', 'CX4', '1NR', '2NR'],
    'Judge': ['1AC','1NC','2AC','2NC','1NR','1AR','2NR','2AR','CX1','CX2','CX3','CX4']
  };

  const isMySpeech = speakerMap[userRole]?.includes(currentSpeechLabel);

  if (isMySpeech && speechData) {
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

// ====== SPEECH BUTTON HANDLING ======
document.querySele
