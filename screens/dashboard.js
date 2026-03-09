/* ============================================================
   screens/dashboard.js – Clinician Dashboard
   ============================================================ */

const MOCK_PATIENTS = [
    { id: 'P001', name: 'Priya Sharma', age: 28, condition: 'GAD', risk: 'high', score: 19, mood: '😔', initials: 'PS', color: '#FF7675' },
    { id: 'P002', name: 'Kiran Mehta', age: 34, condition: 'MDD', risk: 'high', score: 17, mood: '😟', initials: 'KM', color: '#A29BFE' },
    { id: 'P003', name: 'Ananya Patel', age: 22, condition: 'Adjustment Dis.', risk: 'medium', score: 11, mood: '😐', initials: 'AP', color: '#FDCB6E' },
    { id: 'P004', name: 'Rohan Iyer', age: 45, condition: 'Bipolar II', risk: 'medium', score: 9, mood: '🙂', initials: 'RI', color: '#74B9A0' },
    { id: 'P005', name: 'Meera Nair', age: 31, condition: 'PTSD', risk: 'high', score: 21, mood: '😔', initials: 'MN', color: '#E17055' },
    { id: 'P006', name: 'Arjun Reddy', age: 19, condition: 'Social Anxiety', risk: 'low', score: 5, mood: '🙂', initials: 'AR', color: '#55A3FF' },
    { id: 'P007', name: 'Lakshmi Varma', age: 52, condition: 'MDD', risk: 'medium', score: 12, mood: '😟', initials: 'LV', color: '#A29BFE' },
    { id: 'P008', name: 'Vikram Singh', age: 38, condition: 'GAD', risk: 'low', score: 3, mood: '😊', initials: 'VS', color: '#4ECDC4' },
];

const RISK_LABELS = { low: 'Low Risk', medium: 'Moderate Risk', high: 'High Risk' };

function getRiskClass(risk) {
    return { low: 'risk-low', medium: 'risk-medium', high: 'risk-high' }[risk];
}

function renderDashboard() {
    const highRisk = MOCK_PATIENTS.filter(p => p.risk === 'high').length;
    const avgScore = Math.round(MOCK_PATIENTS.reduce((s, p) => s + p.score, 0) / MOCK_PATIENTS.length);
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
    </div>`
    ).join('');

    return `
  <div class="screen">
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

    <!-- Patient List -->
    <h2 class="section-title">Patient Overview</h2>
    <p class="section-sub">Sorted by risk level — high-risk patients flagged in red</p>
    <div class="patient-list" id="patientList">${patientHTML}</div>
  </div>`;
}

function initDashboard() {
    // Bar chart – mood distribution
    const moodCanvas = document.getElementById('moodDistChart');
    if (moodCanvas) {
        chartInstances['moodDist'] = new Chart(moodCanvas, {
            type: 'bar',
            data: {
                labels: ['😔 Awful', '😟 Poor', '😐 Okay', '🙂 Good', '😊 Great'],
                datasets: [{
                    data: [3, 5, 8, 12, 6],
                    backgroundColor: ['#FF7675', '#FDCB6E', '#B2BEC3', '#74B9A0', '#4ECDC4'],
                    borderRadius: 8,
                    borderSkipped: false,
                }]
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
                datasets: [{
                    data: [low, med, high],
                    backgroundColor: ['#74B9A0', '#FDCB6E', '#FF7675'],
                    borderWidth: 0,
                    hoverOffset: 6,
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } }
                }
            }
        });
    }

    // Nudge buttons
    document.querySelectorAll('.nudge-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pid = btn.dataset.pid;
            const patient = MOCK_PATIENTS.find(p => p.id === pid);
            if (patient) {
                btn.textContent = '✅ Sent!';
                btn.style.background = 'var(--sage)';
                btn.disabled = true;
                showToast(`💬 Motivational nudge sent to ${patient.name.split(' ')[0]}!`);
            }
        });
    });
}
