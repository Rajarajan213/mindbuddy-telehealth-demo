/* ============================================================
   screens/phq9.js – PHQ-9 Depression Screening
   ============================================================ */

const PHQ9_QUESTIONS = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
    "Thoughts that you would be better off dead, or of hurting yourself in some way",
];

const PHQ9_OPTIONS = [
    { label: 'Not at all', score: 0 },
    { label: 'Several days', score: 1 },
    { label: 'More than half the days', score: 2 },
    { label: 'Nearly every day', score: 3 },
];

function getSeverity(score) {
    if (score <= 4) return { label: 'Minimal depression', cls: 'severity-minimal', msg: "Your score suggests minimal symptoms. Keep monitoring and maintaining healthy routines. 🌿" };
    if (score <= 9) return { label: 'Mild depression', cls: 'severity-mild', msg: "Mild symptoms detected. Consider talking to a counselor and practicing daily self-care. 🌼" };
    if (score <= 14) return { label: 'Moderate depression', cls: 'severity-moderate', msg: "Moderate symptoms detected. We recommend consulting a mental health professional soon. 💙" };
    if (score <= 19) return { label: 'Moderately severe depression', cls: 'severity-severe', msg: "⚠️ Your symptoms are significant. Please reach out to a licensed clinician or call a helpline today." };
    return { label: 'Severe depression', cls: 'severity-severe', msg: "🚨 Your score indicates severe symptoms. Please contact a mental health professional or emergency services immediately. You are not alone." };
}

let phq9State = { current: 0, answers: Array(9).fill(null), submitted: false };

function renderPHQ9() {
    phq9State = { current: 0, answers: Array(9).fill(null), submitted: false };
    return `
  <div class="screen" id="phq9Screen">
    <div class="hero-gradient mb-4" style="background:linear-gradient(135deg,var(--sage) 0%, var(--teal) 100%);">
      <h1>PHQ-9 Assessment 🩺</h1>
      <p>Over the last 2 weeks, how often have you been bothered by…</p>
    </div>
    <div id="phq9Content">
      ${renderPHQ9Question()}
    </div>
  </div>`;
}

function renderPHQ9Question() {
    const i = phq9State.current;
    const pct = Math.round((i / 9) * 100);
    const optHTML = PHQ9_OPTIONS.map(opt =>
        `<button class="phq-option ${phq9State.answers[i] === opt.score ? 'selected' : ''}" data-score="${opt.score}">
      <div class="opt-score">${opt.score}</div>
      <span>${opt.label}</span>
    </button>`
    ).join('');

    return `
    <div class="phq-progress-bar">
      <div class="phq-progress-fill" style="width:${pct}%"></div>
    </div>
    <p style="font-size:12px;color:var(--text-muted);margin-bottom:14px;font-weight:600;">Question ${i + 1} of ${PHQ9_QUESTIONS.length}</p>
    <div class="card">
      <p class="phq-question">${PHQ9_QUESTIONS[i]}</p>
      <div class="phq-options" id="phqOptions">${optHTML}</div>
      <div class="phq-nav">
        <button class="btn btn-secondary btn-sm" id="phqBack" ${i === 0 ? 'disabled style="opacity:0.4"' : ''}>← Back</button>
        <button class="btn btn-primary btn-sm" id="phqNext">${i === 8 ? 'Submit ✅' : 'Next →'}</button>
      </div>
    </div>`;
}

function renderPHQ9Result(score) {
    const sev = getSeverity(score);
    const isHighRisk = score >= 15;
    if (isHighRisk) {
        AppState.phqResults.push({ date: new Date().toISOString().split('T')[0], score, severity: sev.label });
    } else {
        AppState.phqResults.push({ date: new Date().toISOString().split('T')[0], score, severity: sev.label });
    }
    return `
    <div class="card result-card">
      <div class="result-score">${score}</div>
      <div class="result-label"><span class="severity-badge ${sev.cls}">${sev.label}</span></div>
      <p class="result-msg">${sev.msg}</p>
      ${isHighRisk ? `
        <div style="background:rgba(255,118,117,0.12);border:1.5px solid var(--rose);border-radius:var(--radius-md);padding:14px;margin-top:16px;color:var(--rose);font-size:13px;font-weight:600;">
          🚨 High-risk alert sent to your care team. A clinician will follow up within 24 hours.
        </div>` : ''}
      <button class="btn btn-secondary btn-full mt-4" id="phqRetake">Retake Assessment 🔄</button>
      <button class="btn btn-primary btn-full mt-4" id="phqGoChat">Talk to Buddy 💬</button>
    </div>`;
}

function initPHQ9() {
    rebindPHQ9();
}

function rebindPHQ9() {
    const content = document.getElementById('phq9Content');
    if (!content) return;

    // Option selection
    content.addEventListener('click', function handler(e) {
        const optBtn = e.target.closest('.phq-option');
        if (optBtn) {
            document.querySelectorAll('.phq-option').forEach(b => b.classList.remove('selected'));
            optBtn.classList.add('selected');
            phq9State.answers[phq9State.current] = parseInt(optBtn.dataset.score);
        }
    });

    // Back button
    const backBtn = document.getElementById('phqBack');
    if (backBtn) backBtn.addEventListener('click', () => {
        if (phq9State.current > 0) { phq9State.current--; refreshQuestion(); }
    });

    // Next / Submit
    const nextBtn = document.getElementById('phqNext');
    if (nextBtn) nextBtn.addEventListener('click', () => {
        if (phq9State.answers[phq9State.current] === null) {
            showToast('Please select an option to continue 👆'); return;
        }
        if (phq9State.current < 8) {
            phq9State.current++;
            refreshQuestion();
        } else {
            const total = phq9State.answers.reduce((s, a) => s + (a || 0), 0);
            const content = document.getElementById('phq9Content');
            if (content) { content.innerHTML = renderPHQ9Result(total); bindResultBtns(); }
        }
    });

    // Retake / Go Chat
    bindResultBtns();
}

function bindResultBtns() {
    const retake = document.getElementById('phqRetake');
    const goChat = document.getElementById('phqGoChat');
    if (retake) retake.addEventListener('click', () => {
        phq9State = { current: 0, answers: Array(9).fill(null), submitted: false };
        const content = document.getElementById('phq9Content');
        if (content) { content.innerHTML = renderPHQ9Question(); rebindPHQ9(); }
    });
    if (goChat) goChat.addEventListener('click', () => navigateTo('chat'));
}

function refreshQuestion() {
    const content = document.getElementById('phq9Content');
    if (content) { content.innerHTML = renderPHQ9Question(); rebindPHQ9(); }
}
