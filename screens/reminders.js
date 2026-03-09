/* ============================================================
   screens/reminders.js – Reminders & SMS Alerts
   ============================================================ */

if (!AppState.reminders) {
    AppState.reminders = [
        { id: 1, type: 'medication', label: 'Morning Meds 💊', time: '08:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], channel: 'App + SMS', active: true },
        { id: 2, type: 'mood', label: 'Mood Check-in 📊', time: '20:00', days: ['Mon', 'Wed', 'Fri'], channel: 'App', active: true },
        { id: 3, type: 'appointment', label: 'Therapy session 🧑‍⚕️', time: '14:00', days: ['Tue'], channel: 'SMS', active: false },
    ];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const REMINDER_TYPES = [
    { value: 'medication', label: '💊 Medication', color: '#4ECDC4' },
    { value: 'mood', label: '📊 Mood Check-in', color: '#A29BFE' },
    { value: 'appointment', label: '🧑‍⚕️ Appointment', color: '#74B9A0' },
    { value: 'crisis', label: '🆘 Crisis Check', color: '#FF7675' },
];

let showAddReminder = false;
let newReminderDays = [...DAYS];
let newReminderType = 'medication';

function renderReminders() {
    const activeCount = AppState.reminders.filter(r => r.active).length;
    const reminderCards = AppState.reminders.map(r => {
        const typeInfo = REMINDER_TYPES.find(t => t.value === r.type) || REMINDER_TYPES[0];
        return `
    <div class="reminder-card ${r.active ? 'active' : 'inactive'}">
      <div class="reminder-dot" style="background:${typeInfo.color}"></div>
      <div class="reminder-info">
        <div class="reminder-label">${r.label}</div>
        <div class="reminder-meta">⏰ ${r.time} · 📅 ${r.days.join(', ')} · 📲 ${r.channel}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end;">
        <label class="toggle-switch" aria-label="Toggle reminder ${r.label}">
          <input type="checkbox" class="toggle-input" data-rid="${r.id}" ${r.active ? 'checked' : ''} />
          <span class="toggle-slider"></span>
        </label>
        <button class="btn-delete-med" data-rid="${r.id}" title="Delete reminder">🗑️</button>
      </div>
    </div>`;
    }).join('');

    return `
  <div class="screen">
    <div class="hero-gradient mb-4" style="background:linear-gradient(135deg,#6c5ce7 0%,var(--lavender) 100%);">
      <h1>⏰ Reminders & Alerts</h1>
      <p>Stay on track with smart SMS & in-app notifications</p>
    </div>

    <!-- Stats -->
    <div class="today-summary mb-4">
      <div class="stat-chip"><div class="stat-val" style="color:var(--teal)">${activeCount}</div><div class="stat-label">Active Reminders</div></div>
      <div class="stat-chip"><div class="stat-val" style="color:var(--lavender)">${AppState.reminders.filter(r => r.channel.includes('SMS')).length}</div><div class="stat-label">SMS Alerts</div></div>
      <div class="stat-chip"><div class="stat-val" style="color:var(--amber)">🔔</div><div class="stat-label">Notifications On</div></div>
    </div>

    <!-- SMS Info Banner -->
    <div class="card mb-4" style="background:linear-gradient(135deg,rgba(108,92,231,0.1),rgba(162,155,254,0.1));border-color:var(--lavender);">
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <span style="font-size:28px;">📱</span>
        <div>
          <div style="font-weight:700;font-size:15px;color:var(--text-primary);">SMS via Twilio Edge Function</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;line-height:1.5;">
            In production, Supabase Edge Functions connect to Twilio to send SMS to the patient or guardian when a scheduled reminder triggers. High-risk alerts are sent immediately when PHQ-9 ≥ 15.
          </div>
          <span class="severity-badge severity-minimal" style="margin-top:8px;display:inline-flex;font-size:11px;">✅ Edge Function Ready</span>
        </div>
      </div>
    </div>

    <!-- Reminder List -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <h2 class="section-title" style="margin:0;">Your Reminders</h2>
      <button class="btn btn-primary btn-sm" id="addReminderBtn">+ New</button>
    </div>
    <div id="reminderList">${reminderCards}</div>

    <!-- Add Reminder Form -->
    <div class="card mt-4 ${showAddReminder ? '' : 'hidden'}" id="addReminderForm">
      <h2 class="section-title">🔔 New Reminder</h2>
      <div class="form-group"><label class="form-label">Type</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;" id="typePicker">
          ${REMINDER_TYPES.map(t => `<button class="timing-chip ${t.value === newReminderType ? 'active' : ''}" data-rtype="${t.value}" style="${t.value === newReminderType ? 'border-color:' + t.color + ';color:' + t.color : ''}">${t.label}</button>`).join('')}
        </div></div>
      <div class="form-group mt-4"><label class="form-label">Label</label>
        <input class="form-input" id="newRLabel" placeholder="e.g. Evening medication" /></div>
      <div class="row mt-4">
        <div class="form-group" style="flex:1"><label class="form-label">Time</label>
          <input class="form-input" id="newRTime" type="time" value="09:00" /></div>
        <div class="form-group" style="flex:1"><label class="form-label">Channel</label>
          <select class="form-input" id="newRChannel">
            <option>App</option><option>SMS</option><option>App + SMS</option>
          </select></div>
      </div>
      <div class="form-group mt-4"><label class="form-label">Days</label>
        <div style="display:flex;gap:6px;flex-wrap:wrap;" id="dayPicker">
          ${DAYS.map(d => `<button class="day-chip active" data-day="${d}">${d}</button>`).join('')}
        </div></div>
      <div class="row mt-4">
        <button class="btn btn-secondary" id="cancelReminderBtn" style="flex:1">Cancel</button>
        <button class="btn btn-primary" id="saveReminderBtn" style="flex:2">⏰ Set Reminder</button>
      </div>
    </div>

    <!-- Upcoming section -->
    <div class="card mt-4">
      <h2 class="section-title">🗓️ Upcoming Today</h2>
      ${getUpcomingToday()}
    </div>
  </div>`;
}

function getUpcomingToday() {
    const now = new Date();
    const dayName = now.toLocaleDateString('en', { weekday: 'short' });
    const upcoming = AppState.reminders.filter(r => r.active && r.days.includes(dayName));
    if (!upcoming.length) return '<p style="color:var(--text-muted);font-size:13px;">No reminders set for today.</p>';
    return upcoming.map(r => {
        const [h, m] = r.time.split(':').map(Number);
        const t = new Date(); t.setHours(h, m, 0);
        const isPast = t < now;
        return `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">
      <div style="font-size:22px;">${isPast ? '✅' : '⏰'}</div>
      <div style="flex:1"><div style="font-weight:600;font-size:14px;">${r.label}</div>
        <div style="font-size:12px;color:var(--text-secondary);">${r.time} · ${r.channel}</div>
      </div>
      <span style="font-size:11px;font-weight:700;color:${isPast ? 'var(--sage)' : 'var(--lavender)'};">${isPast ? 'Done' : 'Upcoming'}</span>
    </div>`;
    }).join('');
}

function initReminders() {
    const addBtn = document.getElementById('addReminderBtn');
    const cancelBtn = document.getElementById('cancelReminderBtn');
    const saveBtn = document.getElementById('saveReminderBtn');
    const form = document.getElementById('addReminderForm');

    if (addBtn) addBtn.addEventListener('click', () => {
        showAddReminder = true; form?.classList.remove('hidden'); addBtn.style.display = 'none';
    });
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
        showAddReminder = false; form?.classList.add('hidden'); if (addBtn) addBtn.style.display = '';
    });

    // Type picker
    document.querySelectorAll('[data-rtype]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-rtype]').forEach(b => { b.classList.remove('active'); b.style.borderColor = ''; b.style.color = ''; });
            btn.classList.add('active');
            newReminderType = btn.dataset.rtype;
            const t = REMINDER_TYPES.find(r => r.value === newReminderType);
            if (t) { btn.style.borderColor = t.color; btn.style.color = t.color; }
        });
    });

    // Day toggle
    document.querySelectorAll('.day-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const d = btn.dataset.day;
            newReminderDays = btn.classList.contains('active')
                ? [...newReminderDays, d] : newReminderDays.filter(x => x !== d);
        });
    });

    if (saveBtn) saveBtn.addEventListener('click', () => {
        const label = document.getElementById('newRLabel')?.value.trim();
        const time = document.getElementById('newRTime')?.value;
        const channel = document.getElementById('newRChannel')?.value;
        if (!label) { showToast('⚠️ Please name your reminder'); return; }
        const typeInfo = REMINDER_TYPES.find(t => t.value === newReminderType);
        AppState.reminders.push({ id: Date.now(), type: newReminderType, label: `${typeInfo?.label.split(' ')[0]} ${label}`, time, days: [...newReminderDays], channel, active: true });
        showAddReminder = false;
        showToast(`⏰ Reminder set for ${time}!`);
        const app = document.getElementById('app');
        app.innerHTML = renderReminders(); initReminders();
    });

    // Toggle switches
    document.querySelectorAll('.toggle-input').forEach(inp => {
        inp.addEventListener('change', () => {
            const rid = parseInt(inp.dataset.rid);
            const r = AppState.reminders.find(x => x.id === rid);
            if (r) { r.active = inp.checked; showToast(r.active ? `🔔 "${r.label}" enabled` : `🔕 "${r.label}" paused`); }
        });
    });

    // Delete reminders
    document.querySelectorAll('[data-rid]').forEach(btn => {
        if (btn.tagName === 'BUTTON') btn.addEventListener('click', () => {
            const rid = parseInt(btn.dataset.rid);
            AppState.reminders = AppState.reminders.filter(r => r.id !== rid);
            showToast('🗑️ Reminder removed');
            const app = document.getElementById('app');
            app.innerHTML = renderReminders(); initReminders();
        });
    });
}
