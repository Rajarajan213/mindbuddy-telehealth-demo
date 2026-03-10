/* ============================================================
   screens/mood.js – Mood Tracker + Streak Dashboard
   ============================================================ */

const MOOD_OPTIONS = [
    { emoji: '😔', label: 'Awful', score: 0, color: '#FF7675' },
    { emoji: '😟', label: 'Poor', score: 1, color: '#FDCB6E' },
    { emoji: '😐', label: 'Okay', score: 2, color: '#B2BEC3' },
    { emoji: '🙂', label: 'Good', score: 3, color: '#74B9A0' },
    { emoji: '😊', label: 'Great', score: 4, color: '#4ECDC4' },
];

let selectedMood = null;

function renderMood() {
    const today = new Date().toISOString().split('T')[0];
    const todayLogged = AppState.moodLogs.some(m => m.date === today);
    const last7 = getLast7Days();

    const dotHTML = last7.map(day => {
        const log = AppState.moodLogs.find(m => m.date === day.date);
        return `<div class="day-dot ${log ? 'logged' : ''}" title="${day.label}">${log ? log.emoji : ''}</div>`;
    }).join('');

    const emojiHTML = MOOD_OPTIONS.map(m =>
        `<button class="emoji-btn" data-score="${m.score}" aria-label="${m.label}">
      <span class="emoji">${m.emoji}</span>
      <span class="emoji-label">${m.label}</span>
    </button>`
    ).join('');

    return `
  <div class="screen">
    <h1 class="section-title">Mood Tracker 📊</h1>

    <!-- Streak Card -->
    <div class="card mb-4">
      <h2 class="section-title" style="margin-bottom:12px;">Your Streak 🔥</h2>
      <div class="streak-row">
        <div class="streak-flame">🔥</div>
        <div>
          <div class="streak-count" id="streakCount">${AppState.streak}</div>
          <div class="streak-desc">days in a row!</div>
        </div>
      </div>
      <div class="day-dots mt-4" id="dayDots">${dotHTML}</div>
    </div>

    <!-- Mood Selector -->
    <div class="card mb-4">
      <h2 class="section-title">How are you feeling today?</h2>
      <div class="emoji-grid" id="emojiGrid">${emojiHTML}</div>
      <button class="btn btn-primary btn-full mt-4" id="logMoodBtn" ${todayLogged ? 'disabled style="opacity:0.6"' : ''}>
        ${todayLogged ? '✅ Already logged today' : '💾 Log Today\'s Mood'}
      </button>
    </div>

    <!-- Chart -->
    <div class="card">
      <h2 class="section-title">14-Day Mood Trend</h2>
      <div class="chart-container">
        <canvas id="moodChart"></canvas>
      </div>
    </div>
  </div>`;
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        days.push({
            date: d.toISOString().split('T')[0],
            label: d.toLocaleDateString('en', { weekday: 'short' }),
        });
    }
    return days;
}

function initMood() {
    // Emoji selection
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedMood = MOOD_OPTIONS[parseInt(btn.dataset.score)];
        });
    });

    // Log mood button
    const logBtn = document.getElementById('logMoodBtn');
    if (logBtn && !logBtn.disabled) {
            logBtn.addEventListener('click', async () => {
            if (!selectedMood) { showToast('Please select a mood first! 😊'); return; }
            const today = new Date().toISOString().split('T')[0];
            const entry = { date: today, emoji: selectedMood.emoji, score: selectedMood.score };
            AppState.moodLogs.push(entry);
            AppState.streak++;
            document.getElementById('streakCount').textContent = AppState.streak;
            logBtn.textContent = '✅ Mood logged!'; logBtn.disabled = true; logBtn.style.opacity = '0.6';
            showToast(`${selectedMood.emoji} Mood logged! Keep it up!`);
            if (AppState.streak % 3 === 0) launchConfetti();
            updateDots();
            buildMoodChart();
            // Persist to Supabase
            try {
              const session = await sbGetSession();
              if (session) await sbSaveMoodLog(session.user.id, entry);
            } catch (e) { /* offline / demo mode */ }
        });
    }

    buildMoodChart();
}

function updateDots() {
    const container = document.getElementById('dayDots');
    if (!container) return;
    const last7 = getLast7Days();
    container.innerHTML = last7.map(day => {
        const log = AppState.moodLogs.find(m => m.date === day.date);
        return `<div class="day-dot ${log ? 'logged' : ''}" title="${day.label}">${log ? log.emoji : ''}</div>`;
    }).join('');
}

function buildMoodChart() {
    const canvas = document.getElementById('moodChart');
    if (!canvas) return;
    // Last 14 days
    const dates = []; const scores = []; const colors = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const log = AppState.moodLogs.find(m => m.date === dateStr);
        dates.push(d.toLocaleDateString('en', { month: 'short', day: 'numeric' }));
        scores.push(log ? log.score : null);
        colors.push(log ? MOOD_OPTIONS[log.score].color : 'transparent');
    }

    const gradient = canvas.getContext('2d').createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(78,205,196,0.4)');
    gradient.addColorStop(1, 'rgba(78,205,196,0)');

    const chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                data: scores,
                borderColor: '#4ECDC4',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: colors,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                tension: 0.4,
                fill: true,
                spanGaps: true,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false }, tooltip: {
                    callbacks: {
                        label: ctx => ctx.raw !== null ? MOOD_OPTIONS[ctx.raw]?.label || '' : 'No entry',
                    }
                }
            },
            scales: {
                y: {
                    min: 0, max: 4, ticks: {
                        stepSize: 1,
                        callback: v => ['😔', '😟', '😐', '🙂', '😊'][v] || '',
                        font: { size: 16 },
                    }, grid: { color: 'rgba(100,120,200,0.06)' }
                },
                x: { ticks: { font: { size: 10 }, maxRotation: 30 }, grid: { display: false } },
            }
        }
    });
    chartInstances['mood'] = chart;
}
