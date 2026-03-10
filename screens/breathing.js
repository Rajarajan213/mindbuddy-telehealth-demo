/* ============================================================
   breathing.js – Guided Breathing Exercises
   ============================================================ */

function renderBreathing() {
  return `
  <div class="screen-container fade-in">
    <div class="screen-header">
      <h1 class="screen-title">🌬️ Breathe</h1>
      <p class="screen-subtitle">Calm your mind, one breath at a time</p>
    </div>

    <!-- Exercise selector -->
    <div class="tab-bar breathing-tabs">
      <button class="tab-btn active" id="bTab-box" onclick="bSelectExercise('box')">📦 Box Breathing</button>
      <button class="tab-btn" id="bTab-478" onclick="bSelectExercise('478')">4-7-8 Technique</button>
    </div>

    <!-- Exercise info -->
    <div class="card breathing-info-card" id="bInfoCard">
      <p class="breathing-desc" id="bDesc">Inhale for 4s · Hold 4s · Exhale 4s · Hold 4s — repeat to reach calm.</p>
    </div>

    <!-- Animated circle -->
    <div class="breathing-circle-wrap">
      <div class="breathing-circle" id="breathCircle">
        <div class="breath-inner">
          <span class="breath-phase" id="bPhase">Tap Start</span>
          <span class="breath-timer" id="bTimer">—</span>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="breathing-controls">
      <button class="btn-secondary" onclick="bReset()" id="bResetBtn">↺ Reset</button>
      <button class="btn-primary breathing-start-btn" onclick="bToggle()" id="bStartBtn">▶ Start</button>
    </div>

    <!-- Cycle counter -->
    <div class="breathing-cycles">
      Completed cycles: <strong id="bCycles">0</strong>
    </div>

    <!-- Tip cards -->
    <div class="breathing-tips">
      <div class="tip-card"><span class="tip-icon">💡</span><p>Find a quiet spot and keep your back straight.</p></div>
      <div class="tip-card"><span class="tip-icon">👃</span><p>Breathe through your nose for best results.</p></div>
      <div class="tip-card"><span class="tip-icon">🔁</span><p>Aim for 4–6 cycles per session.</p></div>
    </div>
  </div>`;
}

// --- State ---
let bExercise = 'box';
let bRunning  = false;
let bTimerId  = null;
let bCycleCount = 0;
let bPhaseIdx   = 0;
let bSecondsLeft = 0;

const B_EXERCISES = {
  box: {
    phases: ['Inhale', 'Hold', 'Exhale', 'Hold'],
    durations: [4, 4, 4, 4],
    desc: 'Inhale for 4s · Hold 4s · Exhale 4s · Hold 4s — repeat to reach calm.'
  },
  '478': {
    phases: ['Inhale', 'Hold', 'Exhale'],
    durations: [4, 7, 8],
    desc: 'Inhale for 4s · Hold for 7s · Exhale for 8s — a powerful anxiety reducer.'
  }
};

const B_COLORS = {
  'Inhale': { from: '#A29BFE', to: '#74B9A0' },
  'Hold':   { from: '#FDCB6E', to: '#FDCB6E' },
  'Exhale': { from: '#4ECDC4', to: '#A29BFE' },
};

function initBreathing() {
  bExercise = 'box';
  bRunning  = false;
  bTimerId  = null;
  bCycleCount = 0;
  bPhaseIdx   = 0;
  bSecondsLeft = B_EXERCISES.box.durations[0];
}

function bSelectExercise(ex) {
  bReset();
  bExercise = ex;
  ['box','478'].forEach(t => {
    document.getElementById(`bTab-${t}`)?.classList.toggle('active', t === ex);
  });
  document.getElementById('bDesc').textContent = B_EXERCISES[ex].desc;
}

function bToggle() {
  if (bRunning) { bPause(); } else { bStart(); }
}

function bStart() {
  bRunning = true;
  document.getElementById('bStartBtn').textContent = '⏸ Pause';
  if (bSecondsLeft === 0 || bSecondsLeft === B_EXERCISES[bExercise].durations[0]) {
    bPhaseIdx = 0;
    bSecondsLeft = B_EXERCISES[bExercise].durations[0];
  }
  bTick();
  bTimerId = setInterval(bTick, 1000);
}

function bPause() {
  bRunning = false;
  clearInterval(bTimerId);
  document.getElementById('bStartBtn').textContent = '▶ Resume';
}

function bReset() {
  bRunning = false;
  clearInterval(bTimerId);
  bPhaseIdx = 0;
  bCycleCount = 0;
  bSecondsLeft = B_EXERCISES[bExercise].durations[0];
  const phaseEl = document.getElementById('bPhase');
  const timerEl = document.getElementById('bTimer');
  const circleEl = document.getElementById('breathCircle');
  const startBtn = document.getElementById('bStartBtn');
  const cycleEl  = document.getElementById('bCycles');
  if (phaseEl)  phaseEl.textContent  = 'Tap Start';
  if (timerEl)  timerEl.textContent  = '—';
  if (circleEl) { circleEl.style.transform = 'scale(1)'; circleEl.style.background = ''; }
  if (startBtn) startBtn.textContent = '▶ Start';
  if (cycleEl)  cycleEl.textContent  = '0';
}

function bTick() {
  const ex = B_EXERCISES[bExercise];
  const phase = ex.phases[bPhaseIdx];
  const total = ex.durations[bPhaseIdx];

  // Update UI
  const phaseEl  = document.getElementById('bPhase');
  const timerEl  = document.getElementById('bTimer');
  const circleEl = document.getElementById('breathCircle');
  if (!phaseEl) { clearInterval(bTimerId); return; }

  phaseEl.textContent = phase;
  timerEl.textContent = bSecondsLeft + 's';

  // Animate circle
  const progress = 1 - (bSecondsLeft - 1) / total;
  if (phase === 'Inhale') {
    const s = 1 + progress * 0.35;
    circleEl.style.transform = `scale(${s})`;
  } else if (phase === 'Exhale') {
    const s = 1.35 - progress * 0.35;
    circleEl.style.transform = `scale(${s})`;
  } else {
    // Hold
    circleEl.style.transform = phase === 'Hold' && bPhaseIdx === 1 ? 'scale(1.35)' : 'scale(1)';
  }

  const colors = B_COLORS[phase];
  circleEl.style.background = `radial-gradient(circle at 40% 40%, ${colors.from}, ${colors.to})`;

  bSecondsLeft--;
  if (bSecondsLeft < 0) {
    bPhaseIdx++;
    if (bPhaseIdx >= ex.phases.length) {
      bPhaseIdx = 0;
      bCycleCount++;
      const cycleEl = document.getElementById('bCycles');
      if (cycleEl) cycleEl.textContent = bCycleCount;
    }
    bSecondsLeft = ex.durations[bPhaseIdx];
  }
}
