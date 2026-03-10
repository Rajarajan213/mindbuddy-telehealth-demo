/* ============================================================
   sleep.js – Sleep Tracker Screen
   ============================================================ */

function renderSleep() {
  return `
  <div class="screen-container fade-in">
    <div class="screen-header">
      <h1 class="screen-title">🌙 Sleep Tracker</h1>
      <p class="screen-subtitle">Track your rest and recharge</p>
    </div>

    <!-- Log new sleep -->
    <div class="card sleep-log-card">
      <h3 class="card-subheading">Log Last Night's Sleep</h3>
      <div class="sleep-time-row">
        <div class="sleep-time-field">
          <label class="sleep-label">🌜 Bedtime</label>
          <input type="time" id="sleepBedtime" class="time-input" value="22:30" oninput="sleepCalcDuration()" />
        </div>
        <div class="sleep-time-field">
          <label class="sleep-label">☀️ Wake up</label>
          <input type="time" id="sleepWakeTime" class="time-input" value="06:30" oninput="sleepCalcDuration()" />
        </div>
      </div>

      <!-- Duration display -->
      <div class="sleep-duration-badge" id="sleepDuration">8h 00m</div>

      <!-- Quality stars -->
      <div class="sleep-quality-row">
        <span class="sleep-label">Sleep quality</span>
        <div class="star-rating" id="starRating">
          ${[1,2,3,4,5].map(n => `<button class="star-btn${n<=4?' filled':''}" data-val="${n}" onclick="sleepPickStar(${n})">★</button>`).join('')}
        </div>
        <span class="sleep-quality-label" id="sleepQualityLabel">Good</span>
      </div>

      <button class="btn-primary btn-full" onclick="sleepLogNight()">💾 Log Sleep</button>
    </div>

    <!-- Stats row -->
    <div class="stats-row">
      <div class="stat-chip"><div class="stat-val" id="sleepAvg">—</div><div class="stat-label">Avg (7d)</div></div>
      <div class="stat-chip"><div class="stat-val" id="sleepBest">—</div><div class="stat-label">Best night</div></div>
      <div class="stat-chip"><div class="stat-val" id="sleepQualAvg">—</div><div class="stat-label">Avg quality</div></div>
    </div>

    <!-- Chart -->
    <div class="card chart-card">
      <h3 class="card-subheading">Last 7 Nights 📊</h3>
      <canvas id="sleepChart" height="180"></canvas>
    </div>

    <!-- History list -->
    <div class="card">
      <h3 class="card-subheading">Sleep Log</h3>
      <div id="sleepHistoryList"></div>
    </div>
  </div>`;
}

let sleepSelectedQuality = 4;

function initSleep() {
  sleepSeedData();
  sleepCalcDuration();
  sleepRenderStats();
  sleepRenderChart();
  sleepRenderHistory();
}

function sleepSeedData() {
  if (AppState.sleepLogs.length > 0) return;
  const durations = [7.5, 6, 8, 5.5, 7, 8.5, 6.5, 7, 5, 8];
  const qualities  = [4,   3, 5, 2,   4, 5,   3,   4, 2, 4];
  const today = new Date();
  durations.forEach((d, i) => {
    const dt = new Date(today);
    dt.setDate(today.getDate() - (i + 1));
    const bed = new Date(dt);
    bed.setHours(22, 30 - Math.floor(Math.random() * 60), 0);
    const wake = new Date(bed);
    wake.setTime(bed.getTime() + d * 3600000);
    AppState.sleepLogs.unshift({
      date:     dt.toLocaleDateString('en-IN'),
      bedtime:  bed.toTimeString().slice(0,5),
      wakeTime: wake.toTimeString().slice(0,5),
      quality:  qualities[i],
      duration: d
    });
  });
}

function sleepCalcDuration() {
  const bed  = document.getElementById('sleepBedtime')?.value;
  const wake = document.getElementById('sleepWakeTime')?.value;
  if (!bed || !wake) return;
  const [bh, bm] = bed.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins < 0) mins += 1440;
  const h = Math.floor(mins / 60), m = mins % 60;
  const badge = document.getElementById('sleepDuration');
  if (badge) {
    badge.textContent = `${h}h ${m.toString().padStart(2,'0')}m`;
    badge.className = 'sleep-duration-badge ' + (h < 5 ? 'dur-red' : h < 7 ? 'dur-yellow' : 'dur-green');
  }
  return mins / 60;
}

function sleepPickStar(n) {
  sleepSelectedQuality = n;
  document.querySelectorAll('.star-btn').forEach((b, i) => {
    b.classList.toggle('filled', i < n);
  });
  const labels = ['', 'Poor', 'Fair', 'Okay', 'Good', 'Great'];
  const lbl = document.getElementById('sleepQualityLabel');
  if (lbl) lbl.textContent = labels[n];
}

async function sleepLogNight() {
  const bed  = document.getElementById('sleepBedtime').value;
  const wake = document.getElementById('sleepWakeTime').value;
  const dur  = sleepCalcDuration();
  const today = new Date().toLocaleDateString('en-IN');
  if (AppState.sleepLogs.find(l => l.date === today)) {
    showToast("You've already logged today's sleep!");
    return;
  }
  const log = { date: today, bedtime: bed, wakeTime: wake, quality: sleepSelectedQuality, duration: Math.round(dur * 10) / 10 };
  AppState.sleepLogs.push(log);
  AppState.sleepLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
  showToast('🌙 Sleep logged!');
  // Persist to Supabase
  try {
    const session = await sbGetSession();
    if (session) await sbSaveSleepLog(session.user.id, log);
  } catch (e) { /* offline / demo mode */ }
  sleepRenderStats();
  sleepRenderChart();
  sleepRenderHistory();
}

function sleepRenderStats() {
  const logs7 = AppState.sleepLogs.slice(0, 7);
  if (!logs7.length) return;
  const avg = logs7.reduce((s, l) => s + l.duration, 0) / logs7.length;
  const best = Math.max(...logs7.map(l => l.duration));
  const qa   = logs7.reduce((s, l) => s + l.quality,  0) / logs7.length;
  const el = id => document.getElementById(id);
  if (el('sleepAvg'))     el('sleepAvg').textContent     = avg.toFixed(1) + 'h';
  if (el('sleepBest'))    el('sleepBest').textContent    = best + 'h';
  if (el('sleepQualAvg')) el('sleepQualAvg').textContent = '⭐'.repeat(Math.round(qa));
}

function sleepRenderChart() {
  const logs7 = [...AppState.sleepLogs].slice(0, 7).reverse();
  const ctx = document.getElementById('sleepChart');
  if (!ctx) return;
  if (chartInstances.sleep) { chartInstances.sleep.destroy(); }
  chartInstances.sleep = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: logs7.map(l => l.date.slice(0,5)),
      datasets: [{
        label: 'Hours slept',
        data: logs7.map(l => l.duration),
        backgroundColor: logs7.map(l => l.duration < 5 ? '#FF7675' : l.duration < 7 ? '#FDCB6E' : '#74B9A0'),
        borderRadius: 8
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 12, ticks: { callback: v => v + 'h' }, grid: { color: 'rgba(0,0,0,0.06)' } },
        x: { grid: { display: false } }
      }
    }
  });
}

function sleepRenderHistory() {
  const list = document.getElementById('sleepHistoryList');
  if (!list) return;
  if (!AppState.sleepLogs.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🌙</div><p>No sleep logged yet.</p></div>`;
    return;
  }
  list.innerHTML = AppState.sleepLogs.slice(0, 7).map(l => {
    const cls = l.duration < 5 ? 'badge-red' : l.duration < 7 ? 'badge-yellow' : 'badge-green';
    return `<div class="sleep-history-row">
      <div class="sleep-row-left">
        <span class="sleep-row-date">${l.date}</span>
        <span class="sleep-row-times">${l.bedtime} → ${l.wakeTime}</span>
      </div>
      <div class="sleep-row-right">
        <span class="sleep-dur-badge ${cls}">${l.duration}h</span>
        <span class="sleep-row-stars">${'★'.repeat(l.quality)}${'☆'.repeat(5-l.quality)}</span>
      </div>
    </div>`;
  }).join('');
}
