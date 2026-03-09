/* ============================================================
   screens/medications.js – Medication Tracker
   ============================================================ */

if (!AppState.medications) AppState.medications = [];
if (!AppState.medLogs) AppState.medLogs = [];

const MED_TIMES = ['Morning 🌅', 'Afternoon ☀️', 'Evening 🌆', 'Night 🌙'];
const MED_COLORS = ['#4ECDC4', '#A29BFE', '#FDCB6E', '#FF7675', '#74B9A0', '#E17055', '#55A3FF'];

// Seed sample medications
if (AppState.medications.length === 0) {
    AppState.medications = [
        { id: 1, name: 'Sertraline', dose: '50mg', timing: 'Morning 🌅', notes: 'Take with food', color: '#4ECDC4' },
        { id: 2, name: 'Clonazepam', dose: '0.5mg', timing: 'Night 🌙', notes: 'As needed for anxiety', color: '#A29BFE' },
    ];
    // Seed today's logs
    const today = new Date().toISOString().split('T')[0];
    AppState.medLogs.push({ medId: 1, date: today, taken: true, time: '08:14 AM' });
}

let showAddMed = false;

function renderMedications() {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = AppState.medLogs.filter(l => l.date === today);
    const adherence = AppState.medications.length
        ? Math.round((todayLogs.filter(l => l.taken).length / AppState.medications.length) * 100) : 0;

    const medCards = AppState.medications.map(med => {
        const log = todayLogs.find(l => l.medId === med.id);
        return `
    <div class="med-card ${log?.taken ? 'taken' : ''}">
      <div class="med-dot" style="background:${med.color}"></div>
      <div class="med-info">
        <div class="med-name">${med.name} <span class="med-dose">${med.dose}</span></div>
        <div class="med-timing">${med.timing} ${med.notes ? '· ' + med.notes : ''}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
        ${log?.taken
                ? `<div class="taken-badge">✅ Taken ${log.time}</div><button class="btn-undo" data-medid="${med.id}">Undo</button>`
                : `<button class="btn btn-primary btn-sm take-btn" data-medid="${med.id}">Take Now</button>`}
        <button class="btn-delete-med" data-medid="${med.id}" title="Remove medication">🗑️</button>
      </div>
    </div>`;
    }).join('');

    return `
  <div class="screen">
    <div class="hero-gradient mb-4" style="background:linear-gradient(135deg,#00b894 0%,var(--teal) 100%);">
      <h1>💊 Medication Tracker</h1>
      <p>Stay consistent — every dose matters for your recovery</p>
    </div>

    <!-- Adherence Ring -->
    <div class="card mb-4" style="display:flex;align-items:center;gap:20px;">
      <div class="adherence-ring" style="--pct:${adherence}">
        <svg viewBox="0 0 36 36" class="ring-svg">
          <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
          <path class="ring-fill" stroke-dasharray="${adherence}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
        </svg>
        <div class="ring-label">${adherence}%</div>
      </div>
      <div>
        <div style="font-family:'Nunito',sans-serif;font-weight:800;font-size:17px;">Today's Adherence</div>
        <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">${todayLogs.filter(l => l.taken).length} of ${AppState.medications.length} medications taken</div>
        <div style="font-size:12px;color:var(--sage);margin-top:6px;font-weight:600;">
          ${adherence === 100 ? '🌟 Perfect day! All doses taken!' : adherence >= 50 ? '👍 Keep going!' : '⏰ Don\'t forget your meds!'}
        </div>
      </div>
    </div>

    <!-- Med List -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <h2 class="section-title" style="margin:0;">Today's Medications</h2>
      <button class="btn btn-primary btn-sm" id="addMedBtn">+ Add New</button>
    </div>

    <div id="medList">${medCards || '<p style="color:var(--text-muted);text-align:center;padding:24px;">No medications added yet. Tap + Add New!</p>'}</div>

    <!-- Add Medication Form (hidden by default) -->
    <div class="card mt-4 ${showAddMed ? '' : 'hidden'}" id="addMedForm">
      <h2 class="section-title">➕ Add Medication</h2>
      <div class="form-group"><label class="form-label">Medication Name</label>
        <input class="form-input" id="newMedName" placeholder="e.g. Fluoxetine" /></div>
      <div class="row mt-4">
        <div class="form-group" style="flex:1"><label class="form-label">Dosage</label>
          <input class="form-input" id="newMedDose" placeholder="e.g. 20mg" /></div>
        <div class="form-group" style="flex:1"><label class="form-label">Color Tag</label>
          <div id="colorPicker" style="display:flex;gap:6px;flex-wrap:wrap;padding:8px 0;">
            ${MED_COLORS.map(c => `<div class="color-dot ${c === MED_COLORS[0] ? 'selected' : ''}" data-color="${c}" style="background:${c}"></div>`).join('')}
          </div></div>
      </div>
      <div class="form-group mt-4"><label class="form-label">Timing</label>
        <div id="timingPicker" style="display:flex;gap:8px;flex-wrap:wrap;">
          ${MED_TIMES.map(t => `<button class="timing-chip ${t === MED_TIMES[0] ? 'active' : ''}" data-time="${t}">${t}</button>`).join('')}
        </div></div>
      <div class="form-group mt-4"><label class="form-label">Notes (optional)</label>
        <input class="form-input" id="newMedNotes" placeholder="e.g. Take with food" /></div>
      <div class="row mt-4">
        <button class="btn btn-secondary" id="cancelMedBtn" style="flex:1">Cancel</button>
        <button class="btn btn-primary" id="saveMedBtn" style="flex:2">💾 Save Medication</button>
      </div>
    </div>

    <!-- Weekly adherence chart -->
    <div class="card mt-4">
      <h2 class="section-title">📊 Weekly Adherence</h2>
      <div style="position:relative;height:160px;"><canvas id="adherenceChart"></canvas></div>
    </div>
  </div>`;
}

function initMedications() {
    refreshMedBindings();
    buildAdherenceChart();
}

function refreshMedBindings() {
    const addBtn = document.getElementById('addMedBtn');
    const cancelBtn = document.getElementById('cancelMedBtn');
    const saveBtn = document.getElementById('saveMedBtn');
    const form = document.getElementById('addMedForm');

    if (addBtn) addBtn.addEventListener('click', () => {
        showAddMed = true;
        if (form) form.classList.remove('hidden');
        addBtn.style.display = 'none';
    });
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
        showAddMed = false;
        if (form) form.classList.add('hidden');
        if (addBtn) addBtn.style.display = '';
    });

    // Color dots
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
            dot.classList.add('selected');
        });
    });
    // Timing chips
    document.querySelectorAll('.timing-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.timing-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        });
    });

    if (saveBtn) saveBtn.addEventListener('click', () => {
        const name = document.getElementById('newMedName')?.value.trim();
        const dose = document.getElementById('newMedDose')?.value.trim();
        const notes = document.getElementById('newMedNotes')?.value.trim();
        const color = document.querySelector('.color-dot.selected')?.dataset.color || MED_COLORS[0];
        const timing = document.querySelector('.timing-chip.active')?.dataset.time || MED_TIMES[0];
        if (!name) { showToast('⚠️ Please enter medication name'); return; }
        const newMed = { id: Date.now(), name, dose: dose || '—', timing, notes, color };
        AppState.medications.push(newMed);
        showAddMed = false;
        showToast(`💊 ${name} added to your medications!`);
        const app = document.getElementById('app');
        app.innerHTML = renderMedications();
        initMedications();
    });

    // Take / Undo buttons
    document.querySelectorAll('.take-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const medId = parseInt(btn.dataset.medid);
            const today = new Date().toISOString().split('T')[0];
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            AppState.medLogs.push({ medId, date: today, taken: true, time });
            showToast('✅ Dose logged!');
            const app = document.getElementById('app');
            app.innerHTML = renderMedications();
            initMedications();
        });
    });
    document.querySelectorAll('.btn-undo').forEach(btn => {
        btn.addEventListener('click', () => {
            const medId = parseInt(btn.dataset.medid);
            const today = new Date().toISOString().split('T')[0];
            const idx = AppState.medLogs.findIndex(l => l.medId === medId && l.date === today);
            if (idx > -1) AppState.medLogs.splice(idx, 1);
            showToast('↩️ Dose log removed');
            const app = document.getElementById('app');
            app.innerHTML = renderMedications();
            initMedications();
        });
    });
    document.querySelectorAll('.btn-delete-med').forEach(btn => {
        btn.addEventListener('click', () => {
            const medId = parseInt(btn.dataset.medid);
            AppState.medications = AppState.medications.filter(m => m.id !== medId);
            showToast('🗑️ Medication removed');
            const app = document.getElementById('app');
            app.innerHTML = renderMedications();
            initMedications();
        });
    });
}

function buildAdherenceChart() {
    const canvas = document.getElementById('adherenceChart');
    if (!canvas || typeof Chart === 'undefined') return;
    const labels = [], data = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('en', { weekday: 'short' }));
        const dayStr = d.toISOString().split('T')[0];
        const taken = AppState.medLogs.filter(l => l.date === dayStr && l.taken).length;
        const total = AppState.medications.length || 1;
        data.push(Math.round((taken / total) * 100));
    }
    chartInstances['adherence'] = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{ data, backgroundColor: data.map(v => v >= 80 ? '#4ECDC4' : v >= 50 ? '#FDCB6E' : '#FF7675'), borderRadius: 8, borderSkipped: false }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { min: 0, max: 100, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(100,120,200,0.06)' } },
                x: { grid: { display: false } }
            }
        }
    });
}
