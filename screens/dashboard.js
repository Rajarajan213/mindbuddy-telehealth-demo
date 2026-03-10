/* ============================================================
   screens/dashboard.js – Clinician Dashboard
   Tabs: Patients | Security Logs
   ============================================================ */

const MOCK_PATIENTS = [
    { id: 'P001', name: 'Priya Sharma',   age: 28, condition: 'GAD',             risk: 'high',   score: 19, mood: '😔', initials: 'PS', color: '#FF7675' },
    { id: 'P002', name: 'Kiran Mehta',    age: 34, condition: 'MDD',             risk: 'high',   score: 17, mood: '😟', initials: 'KM', color: '#A29BFE' },
    { id: 'P003', name: 'Ananya Patel',   age: 22, condition: 'Adjustment Dis.', risk: 'medium', score: 11, mood: '😐', initials: 'AP', color: '#FDCB6E' },
    { id: 'P004', name: 'Rohan Iyer',     age: 45, condition: 'Bipolar II',      risk: 'medium', score: 9,  mood: '🙂', initials: 'RI', color: '#74B9A0' },
    { id: 'P005', name: 'Meera Nair',     age: 31, condition: 'PTSD',            risk: 'high',   score: 21, mood: '😔', initials: 'MN', color: '#E17055' },
    { id: 'P006', name: 'Arjun Reddy',    age: 19, condition: 'Social Anxiety',  risk: 'low',    score: 5,  mood: '🙂', initials: 'AR', color: '#55A3FF' },
    { id: 'P007', name: 'Lakshmi Varma', age: 52, condition: 'MDD',             risk: 'medium', score: 12, mood: '😟', initials: 'LV', color: '#A29BFE' },
    { id: 'P008', name: 'Vikram Singh',   age: 38, condition: 'GAD',             risk: 'low',    score: 3,  mood: '😊', initials: 'VS', color: '#4ECDC4' },
];

const RISK_LABELS = { low: 'Low Risk', medium: 'Moderate Risk', high: 'High Risk' };
function getRiskClass(r) { return { low: 'risk-low', medium: 'risk-medium', high: 'risk-high' }[r]; }

/* ---- Relative Time Helper ---------------------------------------- */
function timeAgo(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)    return 'just now';
    if (mins < 60)   return `${mins} min${mins > 1 ? 's' : ''} ago`;
    if (hours < 24)  return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

/* ---- Audit Log Row Colour ---------------------------------------- */
function auditBadge(actionType) {
    const t = actionType?.toLowerCase() || '';
    if (t.includes('deactivat') || t.includes('delete') || t.includes('removed'))
        return { cls: 'audit-red',    icon: '🔴' };
    if (t.includes('password') || t.includes('reset') || t.includes('update'))
        return { cls: 'audit-yellow', icon: '🟡' };
    return { cls: 'audit-blue', icon: '🔵' };
}

/* ---- Render ------------------------------------------------------ */
function renderDashboard() {
    const highRisk   = MOCK_PATIENTS.filter(p => p.risk === 'high').length;
    const avgScore   = Math.round(MOCK_PATIENTS.reduce((s, p) => s + p.score, 0) / MOCK_PATIENTS.length);
    const totalActive = MOCK_PATIENTS.length;

    const patientHTML = MOCK_PATIENTS.map(p => `
    <div class="patient-card ${p.risk === 'high' ? 'high-risk' : ''}">
      <div class="patient-avatar" style="background:${p.color}">${p.initials}</div>
      <div class="patient-info">
        <div class="patient-name">${p.name}</div>
        <div class="patient-meta">${p.condition} · Age ${p.age} · PHQ-9: ${p.score} · ${p.mood}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;">
        <span class="risk-pill ${getRiskClass(p.risk)}">${RISK_LABELS[p.risk]}</span>
        ${p.risk === 'high' ? `<button class="nudge-btn" data-pid="${p.id}">Nudge 💬</button>` : ''}
      </div>
    </div>`).join('');

    return `
  <div class="screen">
    <!-- Header -->
    <div class="hero-gradient mb-4" style="background:linear-gradient(135deg,#6c5ce7 0%,var(--teal) 100%);">
      <h1>🏥 Clinician Dashboard</h1>
      <p>Population-level mental health analytics</p>
    </div>

    <!-- Metric Cards -->
    <div class="dashboard-grid mb-4">
      <div class="metric-card">
        <div class="metric-val" style="color:var(--teal)">${totalActive}</div>
        <div class="metric-label">Active Patients</div>
        <div class="metric-trend trend-up">↑ 3 new this week</div>
      </div>
      <div class="metric-card">
        <div class="metric-val" style="color:var(--rose)">${highRisk}</div>
        <div class="metric-label">High-Risk Alerts</div>
        <div class="metric-trend trend-up">↑ 2 since yesterday</div>
      </div>
      <div class="metric-card">
        <div class="metric-val" style="color:var(--lavender)">${avgScore}</div>
        <div class="metric-label">Avg PHQ-9 Score</div>
        <div class="metric-trend trend-down">↓ 1.2 this month</div>
      </div>
      <div class="metric-card">
        <div class="metric-val" style="color:var(--sage)">68%</div>
        <div class="metric-label">Retention Rate</div>
        <div class="metric-trend trend-up">↑ 12% vs baseline</div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row mb-4" style="align-items:stretch;">
      <div class="card" style="flex:3;">
        <h2 class="section-title" style="font-size:15px;">Mood Distribution</h2>
        <div style="position:relative;height:160px;">
          <canvas id="moodDistChart"></canvas>
        </div>
      </div>
      <div class="card" style="flex:2;">
        <h2 class="section-title" style="font-size:15px;">Risk Levels</h2>
        <div style="position:relative;height:160px;">
          <canvas id="riskChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Security Alerts Widget -->
    <div class="card security-alert-card mb-4" id="securityAlertWidget">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="pulse-dot"></span>
          <h3 style="margin:0;font-size:15px;color:var(--rose);">🛡️ Security Alerts</h3>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="loadSecurityAlerts()">🔄 Refresh</button>
      </div>
      <div id="securityAlertList"><div class="audit-loading" style="padding:12px;">⏳ Loading…</div></div>
    </div>

    <!-- Dashboard Tabs -->
    <div class="dash-tabs mb-2">
      <button class="dash-tab active" id="dTab-patients" onclick="dashSwitchTab('patients')">
        👥 Patients
      </button>
      <button class="dash-tab" id="dTab-logs" onclick="dashSwitchTab('logs')">
        🔒 Security Logs
      </button>
    </div>

    <!-- Tab: Patients -->
    <div id="dPanel-patients">
      <p class="section-sub">Sorted by risk level — high-risk patients flagged in red</p>
      <div class="patient-list" id="patientList">${patientHTML}</div>
    </div>

    <!-- Tab: Security Logs -->
    <div id="dPanel-logs" style="display:none">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <p class="section-sub" style="margin:0">All admin actions logged in real-time</p>
        <button class="btn btn-secondary btn-sm" onclick="dashLoadAuditLogs()">🔄 Refresh</button>
      </div>

      <!-- Legend -->
      <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
        <span class="audit-legend audit-blue">🔵 Information</span>
        <span class="audit-legend audit-yellow">🟡 Password / Update</span>
        <span class="audit-legend audit-red">🔴 Deactivation / Delete</span>
      </div>

      <!-- Log Table -->
      <div class="card" style="padding:0;overflow:hidden;">
        <div id="auditLogTable" style="min-height:120px;">
          <div class="audit-loading">⏳ Loading security logs…</div>
        </div>
      </div>
    </div>

  </div>`;
}

/* ---- Tab Switch -------------------------------------------------- */
function dashSwitchTab(tab) {
    ['patients','logs'].forEach(t => {
        document.getElementById(`dPanel-${t}`).style.display = t === tab ? 'block' : 'none';
        document.getElementById(`dTab-${t}`).classList.toggle('active', t === tab);
    });
    if (tab === 'logs') dashLoadAuditLogs();
}

/* ---- Security Alerts Widget ------------------------------------- */
async function loadSecurityAlerts() {
    const box = document.getElementById('securityAlertList');
    if (!box) return;
    box.innerHTML = '<div class="audit-loading" style="padding:12px;">⏳ Loading alerts…</div>';

    try {
        const { data: alerts } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('action_type', 'FAILED_LOGIN_ATTEMPT')
            .order('created_at', { ascending: false })
            .limit(10);

        if (!alerts || !alerts.length) {
            box.innerHTML = '<div style="padding:10px 4px;font-size:13px;color:var(--text-secondary);">✅ No failed login attempts detected.</div>';
            return;
        }

        // Detect repeat offenders: same email 3+ times in last 5 minutes
        const fiveMinAgo = Date.now() - 5 * 60 * 1000;
        const recentByEmail = {};
        alerts.forEach(a => {
            if (new Date(a.created_at).getTime() > fiveMinAgo) {
                recentByEmail[a.target_user_email] = (recentByEmail[a.target_user_email] || 0) + 1;
            }
        });

        box.innerHTML = alerts.slice(0, 5).map(alert => {
            const email = alert.target_user_email || 'Unknown';
            const count = recentByEmail[email] || 0;
            const isThreat = count >= 3;
            return `<div class="security-alert-row ${isThreat ? 'threat-row' : ''}">
              <span class="pulse-dot ${isThreat ? 'pulse-red' : 'pulse-yellow'}"></span>
              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:13px;">Failed Login: <span style="color:var(--rose)">${email}</span>
                  ${isThreat ? '<span class="threat-badge">⚠️ Brute Force Alert!</span>' : ''}
                </div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${timeAgo(alert.created_at)}
                  ${isThreat ? ` · <strong style="color:#e74c3c">${count} attempts in 5 min</strong>` : ''}
                </div>
              </div>
            </div>`;
        }).join('');

    } catch (e) {
        box.innerHTML = '<div style="padding:10px;font-size:12px;color:var(--text-muted);">⚠️ Add the <code>audit_logs</code> table in Supabase to enable alerts.</div>';
    }
}

/* ---- Fetch + Render Audit Logs ---------------------------------- */
async function dashLoadAuditLogs() {
    const container = document.getElementById('auditLogTable');
    if (!container) return;
    container.innerHTML = '<div class="audit-loading">⏳ Fetching logs…</div>';

    try {
        const logs = await sbFetchAuditLogs(50);

        if (!logs.length) {
            container.innerHTML = `<div class="audit-loading">
              <div style="font-size:32px;margin-bottom:8px;">📋</div>
              <p>No audit events recorded yet.</p>
              <p style="font-size:12px;margin-top:4px;">Events are logged automatically when actions occur.</p>
            </div>`;
            return;
        }

        container.innerHTML = `
        <table class="audit-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Action</th>
              <th>Target</th>
              <th>Status</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(log => {
                const badge = auditBadge(log.action_type);
                const statusCls = log.status === 'Success' ? 'audit-status-ok' : 'audit-status-err';
                return `<tr class="audit-row ${badge.cls}">
                  <td><span class="audit-type-icon">${badge.icon}</span></td>
                  <td class="audit-action">${log.action_type || '—'}</td>
                  <td class="audit-target">${log.target_user_email || '—'}</td>
                  <td><span class="audit-status ${statusCls}">${log.status || '—'}</span></td>
                  <td class="audit-time">${timeAgo(log.created_at)}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>`;
    } catch (e) {
        container.innerHTML = `<div class="audit-loading" style="color:var(--rose)">
          ⚠️ Could not load logs. Check your Supabase <code>audit_logs</code> table.
        </div>`;
    }
}

/* ---- Init -------------------------------------------------------- */
function initDashboard() {
    // Bar chart – mood distribution
    const moodCanvas = document.getElementById('moodDistChart');
    if (moodCanvas) {
        chartInstances['moodDist'] = new Chart(moodCanvas, {
            type: 'bar',
            data: {
                labels: ['😔 Awful', '😟 Poor', '😐 Okay', '🙂 Good', '😊 Great'],
                datasets: [{ data: [3, 5, 8, 12, 6],
                    backgroundColor: ['#FF7675', '#FDCB6E', '#B2BEC3', '#74B9A0', '#4ECDC4'],
                    borderRadius: 8, borderSkipped: false }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 2 }, grid: { color: 'rgba(100,120,200,0.06)' } },
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                }
            }
        });
    }

    // Doughnut chart – risk levels
    const riskCanvas = document.getElementById('riskChart');
    if (riskCanvas) {
        const low = MOCK_PATIENTS.filter(p => p.risk === 'low').length;
        const med = MOCK_PATIENTS.filter(p => p.risk === 'medium').length;
        const high = MOCK_PATIENTS.filter(p => p.risk === 'high').length;
        chartInstances['risk'] = new Chart(riskCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Low', 'Moderate', 'High'],
                datasets: [{ data: [low, med, high],
                    backgroundColor: ['#74B9A0', '#FDCB6E', '#FF7675'],
                    borderWidth: 0, hoverOffset: 6 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '65%',
                plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } } }
            }
        });
    }

    // Nudge buttons
    document.querySelectorAll('.nudge-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const patient = MOCK_PATIENTS.find(p => p.id === btn.dataset.pid);
            if (patient) {
                btn.textContent = '✅ Sent!';
                btn.style.background = 'var(--sage)';
                btn.disabled = true;
                showToast(`💬 Motivational nudge sent to ${patient.name.split(' ')[0]}!`);
                try { logAuditEvent({ actionType: 'Nudge Sent', targetEmail: patient.name, details: 'Motivational SMS nudge', status: 'Success' }); } catch(e) {}
            }
        });
    });

    // Auto-load security alerts on dashboard open
    loadSecurityAlerts();
    // Auto-refresh alerts every 30s
    window._alertRefreshInterval = setInterval(loadSecurityAlerts, 30000);
}
