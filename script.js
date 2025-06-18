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

// ====== RESPONSIBILITIES (simplified for demo) ======
const detailedResponsibilities = {
  "1st Affirmative": {
    "1AC": {
      "core": "Present the affirmative case: resolution, harms, inherency, solvency, and plan.",
      "style": "Use persuasive tone, emphasize clarity, and signpost structure (e.g., 'First, the Harms...').",
      "mistakes": "Avoid reading too quickly; practice a strong opening."
    },
    "CX (1AC)": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "1NC": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "CX (1NC)": {
      "core": "Ask pointed questions to weaken opposing arguments.",
      "style": "Clarify gaps in logic; remain calm and controlled.",
      "mistakes": "Don\u2019t waste time; avoid hostile tone."
    },
    "2AC": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "CX (2AC)": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "2NC": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "1NR": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "1AR": {
      "core": "Refute 1NR and 2NC; crystallize aff case; collapse to core issues.",
      "style": "Be efficient; emphasize weighing and impact calculus.",
      "mistakes": "Avoid re-explaining the 1AC; don\u2019t get lost in low-impact arguments."
    },
    "2NR": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "2AR": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    }
  },
  "2nd Affirmative": {
    "1AC": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "CX (1AC)": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "1NC": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "CX (1NC)": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "2AC": {
      "core": "Answer 1NC arguments; extend 1AC case; rebuild aff offense.",
      "style": "Sound confident; don't rush; collapse to strong aff positions.",
      "mistakes": "Don\u2019t drop key 1NC arguments; clarify what you're winning."
    },
    "CX (2AC)": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "2NC": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "1NR": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "1AR": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "2NR": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "2AR": {
      "core": "Deliver final aff speech; extend key issues; win the round.",
      "style": "Collapse to core themes; compare impacts clearly.",
      "mistakes": "Don\u2019t make new arguments; stay focused on win conditions."
    }
  },
  "1st Negative": {
    "1AC": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "CX (1AC)": {
      "core": "Ask pointed questions to weaken opposing arguments.",
      "style": "Clarify gaps in logic; remain calm and controlled.",
      "mistakes": "Don\u2019t waste time; avoid hostile tone."
    },
    "1NC": {
      "core": "Introduce off-case (disads, CPs, topicality); refute 1AC on-case points.",
      "style": "Label and group arguments clearly. Prioritize important issues.",
      "mistakes": "Don\u2019t forget to answer all 1AC points; avoid jargon overload."
    },
    "CX (1NC)": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "2AC": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "CX (2AC)": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "2NC": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "1NR": {
      "core": "Finish the negative block; cover arguments 2NC didn't.",
      "style": "Go fast but flow clearly; prep during 2AC and 2NC.",
      "mistakes": "Don\u2019t drop new 2AC responses; coordinate with 2NC."
    },
    "1AR": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "2NR": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "2AR": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    }
  },
  "2nd Negative": {
    "1AC": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "CX (1AC)": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "1NC": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "CX (1NC)": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "2AC": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "CX (2AC)": {
      "core": "Ask pointed questions to weaken opposing arguments.",
      "style": "Clarify gaps in logic; remain calm and controlled.",
      "mistakes": "Don\u2019t waste time; avoid hostile tone."
    },
    "2NC": {
      "core": "Split the block; extend off-case arguments; deepen strategic attacks.",
      "style": "Organize by argument; prep with 1NR; stay composed.",
      "mistakes": "Avoid overlap with 1NR; be sure to extend impacts."
    },
    "1NR": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "1AR": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    },
    "2NR": {
      "core": "Deliver final negative strategy; collapse to 1\u20132 winning arguments.",
      "style": "Frame the round clearly; use judge-friendly language.",
      "mistakes": "Don\u2019t introduce new arguments; weigh impacts convincingly."
    },
    "2AR": {
      "core": "Flow carefully; track Uniqueness, Links, Internal Links, and Impacts.",
      "style": "Stay focused; prep extensions or responses.",
      "mistakes": "Don\u2019t zone out; avoid messy or incomplete flows."
    }
  },
  "Judge": {
    "1AC": {
      "core": "Placeholder for judge info ",
      "style": "Placeholder for judge info ",
      "mistakes": "Placeholder for judge info "
    },
    "CX (1AC)": {
      "core": "Placeholder for judge info ",
      "style": "Placeholder for judge info ",
      "mistakes": "Placeholder for judge info "
    },
    "1NC": {
      "core": "Placeholder for judge info ",
      "style": "Placeholder for judge info ",
      "mistakes": "Placeholder for judge info "
    },
    "CX (1NC)": {
      "core": "Placeholder for judge info ",
      "style": "Placeholder for judge info ",
      "mistakes": "Placeholder for judge info "
    },
    "2AC": {
      "core": "Placeholder for judge info ",
      "style": "Placeholder for judge info ",
      "mistakes": "Placeholder for judge info "
    },
    "CX (2AC)": {
      "core": "Placeholder for judge info ",
      "style": "Placeholder for judge info ",
      "mistakes": "Placeholder for judge info "
    },
    "2NC": {
      "core": "Placeholder for judge info ",
      "style": "Placeholder for judge info ",
      "mistakes": "Placeholder for judge info "
    },
    "1NR": {
      "core": "Placeholder for judge info ",
      "style": "Placeholder for judge info ",
      "mistakes": "Placeholder for judge info "
    },
    "1AR": {
      "core": "Placeholder for judge info ",
      "style": "Placeholder for judge info ",
      "mistakes": "Placeholder for judge info "
    },
    "2NR": {
      "core": "Placeholder for judge info ",
      "style": "Placeholder for judge info ",
      "mistakes": "Placeholder for judge info "
    },
    "2AR": {
      "core": "Placeholder for judge info ",
      "style": "Placeholder for judge info ",
      "mistakes": "Placeholder for judge info "
    }
  }
};


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

  if (!speechData) {
    listEl.innerHTML = `<li>No responsibilities found for this speech.</li>`;
    return;
  }

  const addCategory = (title, content) => {
    const heading = document.createElement('h4');
    heading.className = 'font-bold mt-4';
    heading.textContent = title;
    listEl.appendChild(heading);

    const item = document.createElement('li');
    item.textContent = content;
    listEl.appendChild(item);
  };

  addCategory('Core Responsibilities', speechData.core);
  addCategory('Style & Strategy Tips', speechData.style);
  addCategory('Reminders & Common Mistakes', speechData.mistakes);
}


  const speakerMap = {
    '1A': ['1AC', 'CX1', '2AC', 'CX3', '1AR', '2AR'],
    '2A': ['CX1', '2AC', 'CX3', '1AR', '2AR'],
    '1N': ['1NC', 'CX2', '2NC', 'CX4', '1NR', '2NR'],
    '2N': ['CX2', '2NC', 'CX4', '1NR', '2NR']
  };

  const isMySpeech = speakerMap[userRole]?.includes(speechLabel);
  const roleKey = isMySpeech ? speechLabel : `${userRole}_${speechLabel}`;

  const responsibilities = speechResponsibilities[roleKey] || [`Be sure to flow and prepare responses to ${speechLabel}.`];

  responsibilities.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    listEl.appendChild(li);
  });
}

// ====== SPEECH BUTTON HANDLING ======
document.querySelectorAll('.grid button').forEach(button => {
  button.addEventListener('click', () => {
    const label = button.textContent.split(' ')[0];
    const time = speechTimes[label];

    if (isPrepRunning) {
      const confirmSwitch = window.confirm("Prep time is currently running. Pause and start speech?");
      if (!confirmSwitch) return;
      pausePrepTimer();
    }

    if (isSpeechRunning) {
      const confirmReset = window.confirm("A speech is already being timed. Switch speeches?");
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
  updateSpeechDisplay();
  document.getElementById('speechTimerContainer').classList.remove('bg-red-600');
});

speechProgress.addEventListener('input', (e) => {
  speechTimeLeft = parseInt(e.target.value);
  updateSpeechDisplay();
});

startPrepBtn.addEventListener('click', () => {
  if (!isPrepRunning && isSpeechRunning) {
    const confirmStartPrep = window.confirm("A speech is running. Use prep time instead?");
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

// ====== MODAL ROLE/LEVEL CONFIRMATION ======
document.getElementById('setup-confirm').addEventListener('click', () => {
  userRole = document.getElementById('role-select').value;
  userLevel = document.getElementById('level-select').value;

  speechTimes = timePresets[userLevel].speechTimes;
  prepTimeLeft = timePresets[userLevel].prepTime;

  document.getElementById('setup-modal').style.display = 'none';

  updateSpeechDisplay();
  updatePrepDisplay();
});

// ====== INIT ======
updateSpeechDisplay();
updatePrepDisplay();
