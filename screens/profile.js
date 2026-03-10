/* ============================================================
   screens/profile.js – Patient Profile + Photo Upload
   ============================================================ */

let profileState = {
    step: 1,
    photo: null,
    photoURL: null,
    data: {
        name: (window.AppState && AppState.user.name) ? AppState.user.name : '', age: '', gender: '', mobile: '',
        guardian: '', guardianPhone: '', condition: '', since: '',
        emergency: '',
    }
};

function renderProfile() {
    return `
  <div class="screen">
    <div class="hero-gradient mb-4" style="background:linear-gradient(135deg,var(--lavender) 0%,#e17055 100%);">
      <h1>👤 Patient Profile</h1>
      <p>Your secure health record — private and encrypted</p>
    </div>
    <div id="profileContent">${renderProfileStep()}</div>
  </div>`;
}

function renderProfileStep() {
    const steps = [
        { icon: '📸', label: 'Photo' },
        { icon: '🧑', label: 'Personal' },
        { icon: '🏥', label: 'Medical' },
        { icon: '🆘', label: 'Emergency' },
    ];
    const stepNav = steps.map((s, i) =>
        `<div class="step-dot ${profileState.step === i + 1 ? 'active' : profileState.step > i + 1 ? 'done' : ''}" title="${s.label}">
      ${profileState.step > i + 1 ? '✓' : s.icon}
    </div>`
    ).join('<div class="step-line"></div>');

    let content = '';
    if (profileState.step === 1) content = renderPhotoStep();
    else if (profileState.step === 2) content = renderPersonalStep();
    else if (profileState.step === 3) content = renderMedicalStep();
    else if (profileState.step === 4) content = renderEmergencyStep();
    else content = renderProfileSummary();

    return `
    <div class="step-nav-row">${stepNav}</div>
    <div class="card mt-4">${content}</div>
    ${profileState.step <= 4 ? `
    <div class="phq-nav mt-4">
      <button class="btn btn-secondary btn-sm" id="profBack" ${profileState.step === 1 ? 'disabled style="opacity:0.4"' : ''}>← Back</button>
      <button class="btn btn-primary" id="profNext">${profileState.step === 4 ? 'Save Profile ✅' : 'Next →'}</button>
    </div>` : ''}`;
}

function renderPhotoStep() {
    const imgSrc = profileState.photoURL || null;
    return `
    <h2 class="section-title">📸 Profile Photo</h2>
    <div style="display:flex;flex-direction:column;align-items:center;gap:18px;padding:12px 0;">
      <div id="photoPreview" style="width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--lavender));display:flex;align-items:center;justify-content:center;font-size:48px;box-shadow:var(--shadow-md);overflow:hidden;border:3px solid var(--teal);">
        ${imgSrc ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;" alt="Profile photo" />` : '🧑'}
      </div>
      <label class="btn btn-primary" for="photoInput" style="cursor:pointer;">📷 Choose Photo</label>
      <input type="file" id="photoInput" accept="image/*" style="display:none;" aria-label="Upload profile photo" />
      <p style="font-size:12px;color:var(--text-muted);text-align:center;">🔒 Photo stored locally (simulates Supabase Storage upload)<br/>Supported: JPG, PNG, WEBP</p>
      <div id="uploadStatus" style="font-size:13px;color:var(--sage);font-weight:600;min-height:20px;"></div>
    </div>`;
}

function renderPersonalStep() {
    const d = profileState.data;
    return `
    <h2 class="section-title">🧑 Personal Information</h2>
    <div class="form-group"><label class="form-label">Full Name</label>
      <input class="form-input" id="pName" type="text" value="${d.name}" placeholder="Full name" /></div>
    <div class="row mt-4"><div class="form-group" style="flex:1"><label class="form-label">Age</label>
      <input class="form-input" id="pAge" type="number" value="${d.age}" placeholder="e.g. 28" min="1" max="120"/></div>
    <div class="form-group" style="flex:2"><label class="form-label">Gender</label>
      <select class="form-input" id="pGender">
        <option ${d.gender === 'Male' ? 'selected' : ''}>Male</option>
        <option ${d.gender === 'Female' ? 'selected' : ''}>Female</option>
        <option ${d.gender === 'Non-binary' ? 'selected' : ''}>Non-binary</option>
        <option ${d.gender === 'Prefer not to say' ? 'selected' : ''}>Prefer not to say</option>
      </select></div></div>
    <div class="form-group mt-4"><label class="form-label">📱 Mobile Number</label>
      <input class="form-input" id="pMobile" type="tel" value="${d.mobile}" placeholder="+91 9876543210" /></div>
    <div class="form-group mt-4"><label class="form-label">👨‍👩‍👧 Guardian / Carer Name</label>
      <input class="form-input" id="pGuardian" type="text" value="${d.guardian}" placeholder="Guardian full name" /></div>
    <div class="form-group mt-4"><label class="form-label">📞 Guardian Phone</label>
      <input class="form-input" id="pGuardianPhone" type="tel" value="${d.guardianPhone}" placeholder="+91 9876543211" /></div>`;
}

function renderMedicalStep() {
    const d = profileState.data;
    return `
    <h2 class="section-title">🏥 Medical Background</h2>
    <div class="form-group"><label class="form-label">Primary Diagnosis / Condition</label>
      <select class="form-input" id="pCondition">
        ${['Select...', 'GAD – Generalized Anxiety', 'MDD – Major Depressive Disorder', 'PTSD', 'Bipolar I', 'Bipolar II', 'Social Anxiety', 'OCD', 'Adjustment Disorder', 'Other'].map(c =>
        `<option ${d.condition === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select></div>
    <div class="form-group mt-4"><label class="form-label">📅 In care since</label>
      <input class="form-input" id="pSince" type="month" value="${d.since}" /></div>
    <div class="form-group mt-4"><label class="form-label">📝 Additional Notes</label>
      <textarea class="form-input" id="pNotes" rows="3" placeholder="Allergies, previous conditions, treatment notes…" style="resize:vertical;">${d.notes || ''}</textarea></div>`;
}

function renderEmergencyStep() {
    const d = profileState.data;
    return `
    <h2 class="section-title">🆘 Emergency Contact & Crisis Info</h2>
    <div class="form-group"><label class="form-label">Emergency Contact Name</label>
      <input class="form-input" id="pEmergency" type="text" value="${d.emergency}" placeholder="Name of emergency contact" /></div>
    <div class="form-group mt-4"><label class="form-label">Emergency Phone</label>
      <input class="form-input" id="pEmergencyPhone" type="tel" value="${d.emergencyPhone || ''}" placeholder="+91 112 or personal number" /></div>
    <div style="background:rgba(255,118,117,0.1);border:1.5px solid var(--rose);border-radius:var(--radius-md);padding:14px;margin-top:18px;">
      <div style="font-weight:700;color:var(--rose);margin-bottom:6px;">🆘 Crisis Helplines (India)</div>
      <div style="font-size:13px;color:var(--text-secondary);line-height:1.7;">
        iCall: <strong>9152987821</strong><br/>
        Vandrevala Foundation: <strong>1860-2662-345</strong><br/>
        NIMHANS: <strong>080-46110007</strong>
      </div>
    </div>`;
}

function renderProfileSummary() {
    const d = profileState.data;
    return `
    <div style="text-align:center;padding:12px 0;">
      <div style="width:90px;height:90px;border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--lavender));display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto 16px;box-shadow:var(--shadow-md);overflow:hidden;">
        ${profileState.photoURL ? `<img src="${profileState.photoURL}" style="width:100%;height:100%;object-fit:cover;"/>` : '🧑'}
      </div>
      <h2 style="font-family:'Nunito',sans-serif;font-weight:900;font-size:22px;">${d.name}</h2>
      <span class="severity-badge severity-minimal" style="margin-top:6px;display:inline-flex;">${d.condition || 'Profile Complete'}</span>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px;text-align:left;">
        ${[['Age', d.age || '—'], ['Gender', d.gender || '—'], ['Mobile', d.mobile || '—'], ['Guardian', d.guardian || '—'], ['In Care Since', d.since || '—'], ['Emergency', d.emergency || '—']].map(([lbl, val]) =>
        `<div class="stat-chip"><div class="stat-label">${lbl}</div><div style="font-weight:700;font-size:13px;margin-top:4px;color:var(--text-primary);">${val}</div></div>`).join('')}
      </div>
      <button class="btn btn-secondary btn-full mt-4" id="editProfileBtn">✏️ Edit Profile</button>
      <p style="font-size:11px;color:var(--text-muted);margin-top:12px;">🔒 Syncs to Supabase profiles table in production</p>
    </div>`;
}

function saveStepData() {
    const g = id => { const el = document.getElementById(id); return el ? el.value : ''; };
    if (profileState.step === 2) {
        Object.assign(profileState.data, { name: g('pName'), age: g('pAge'), gender: g('pGender'), mobile: g('pMobile'), guardian: g('pGuardian'), guardianPhone: g('pGuardianPhone') });
    } else if (profileState.step === 3) {
        Object.assign(profileState.data, { condition: g('pCondition'), since: g('pSince'), notes: g('pNotes') });
    } else if (profileState.step === 4) {
        Object.assign(profileState.data, { emergency: g('pEmergency'), emergencyPhone: g('pEmergencyPhone') });
    }
}

function refreshProfile() {
    const c = document.getElementById('profileContent');
    if (c) { c.innerHTML = renderProfileStep(); initProfileBindings(); }
}

function initProfileBindings() {
    const next = document.getElementById('profNext');
    const back = document.getElementById('profBack');
    if (next) next.addEventListener('click', () => {
        saveStepData();
        if (profileState.step <= 4) { profileState.step++; refreshProfile(); }
        if (profileState.step > 4) { showToast('✅ Profile saved!'); }
    });
    if (back) back.addEventListener('click', () => {
        if (profileState.step > 1) { profileState.step--; refreshProfile(); }
    });
    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn) editBtn.addEventListener('click', () => { profileState.step = 1; refreshProfile(); });

    // Photo upload
    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
        photoInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const status = document.getElementById('uploadStatus');
            if (status) status.textContent = '⏳ Uploading to storage bucket…';
            const reader = new FileReader();
            reader.onload = ev => {
                profileState.photoURL = ev.target.result;
                const preview = document.getElementById('photoPreview');
                if (preview) preview.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;" alt="Profile photo" />`;
                setTimeout(() => { if (status) status.textContent = '✅ Uploaded to patient-photos bucket!'; }, 800);
            };
            reader.readAsDataURL(file);
        });
    }
}

function initProfile() { initProfileBindings(); }
