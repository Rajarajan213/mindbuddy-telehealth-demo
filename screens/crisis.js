/* ============================================================
   crisis.js – Crisis Hotline Contacts & Safety Plan
   ============================================================ */

function renderCrisis() {
  const hotlines = [
    { name: 'iCall (Tata Institute)',        number: '9152987821',  desc: 'Mon–Sat, 8am–10pm',          color: '#FF7675', icon: '📞' },
    { name: 'Vandrevala Foundation',         number: '1860-2662-345', desc: '24/7 crisis support',      color: '#A29BFE', icon: '🆘' },
    { name: 'NIMHANS Helpline',              number: '080-46110007', desc: 'Mental health guidance',    color: '#4ECDC4', icon: '🏥' },
    { name: 'iCall WhatsApp Chat',           number: '9152987821',  desc: 'Chat-based support',         color: '#74B9A0', icon: '💬' },
    { name: 'National Emergency (Police)',   number: '112',         desc: 'Immediate physical danger',  color: '#FDCB6E', icon: '🚨' },
    { name: 'Snehi (Emotional support)',     number: '044-24640050',desc: 'Mon–Sat, 8am–10pm',          color: '#81ECEC', icon: '💛' },
  ];

  const safetyItems = [
    { icon: '⚠️', title: 'Warning Signs',        id: 'sp1', hint: 'e.g., I isolate myself, I stop eating…' },
    { icon: '🧘', title: 'Coping Strategies',     id: 'sp2', hint: 'e.g., Deep breathing, going for a walk…' },
    { icon: '👥', title: 'People I Trust',         id: 'sp3', hint: 'e.g., Name & phone of a friend or family…' },
    { icon: '🩺', title: 'My Professional Support',id: 'sp4', hint: 'e.g., Therapist name & contact…' },
    { icon: '🏠', title: 'Making My Space Safe',   id: 'sp5', hint: 'e.g., Remove triggers, ask someone to stay…' },
  ];

  return `
  <div class="screen-container fade-in">

    <!-- Calming banner -->
    <div class="crisis-banner">
      <div class="crisis-banner-icon">💙</div>
      <div>
        <h2 class="crisis-banner-title">You are not alone.</h2>
        <p class="crisis-banner-sub">Reaching out is a sign of strength. Help is available right now.</p>
      </div>
    </div>

    <!-- Hotlines -->
    <div class="section-heading">📞 Helplines (India)</div>
    <div class="crisis-grid">
      ${hotlines.map(h => `
        <a class="crisis-card" href="tel:${h.number.replace(/[^0-9]/g,'')}">
          <div class="crisis-card-icon" style="background:${h.color}22;color:${h.color}">${h.icon}</div>
          <div class="crisis-card-info">
            <div class="crisis-card-name">${h.name}</div>
            <div class="crisis-card-desc">${h.desc}</div>
          </div>
          <div class="crisis-card-number" style="color:${h.color}">${h.number}</div>
        </a>`).join('')}
    </div>

    <!-- Safety plan -->
    <div class="section-heading" style="margin-top:28px">🛡️ My Safety Plan</div>
    <p class="safety-plan-intro">Write your personal plan for when things get hard. Only you can see this.</p>
    ${safetyItems.map(item => `
      <div class="safety-item-card card" onclick="crisisToggleSP('${item.id}')">
        <div class="safety-item-header">
          <span>${item.icon} <strong>${item.title}</strong></span>
          <span class="safety-toggle-icon" id="sp-icon-${item.id}">▼</span>
        </div>
        <div id="sp-body-${item.id}" class="safety-item-body" style="display:none">
          <textarea class="safety-textarea" placeholder="${item.hint}"
            oninput="crisisSaveSP('${item.id}', this.value)">${AppState.safetyPlan?.[item.id] || ''}</textarea>
        </div>
      </div>`).join('')}

    <div style="height:12px"></div>
    <div class="crisis-reminder card">
      <p>🌟 If you are in immediate danger, call <strong>112</strong> right away or go to your nearest emergency room.</p>
    </div>
  </div>`;
}

function initCrisis() {
  if (!AppState.safetyPlan) AppState.safetyPlan = {};
}

function crisisToggleSP(id) {
  const body = document.getElementById(`sp-body-${id}`);
  const icon = document.getElementById(`sp-icon-${id}`);
  if (!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  if (icon) icon.textContent = open ? '▼' : '▲';
}

function crisisSaveSP(id, value) {
  if (!AppState.safetyPlan) AppState.safetyPlan = {};
  AppState.safetyPlan[id] = value;
}
