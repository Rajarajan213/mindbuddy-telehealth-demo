/* ============================================================
   journal.js – Journal / Diary Screen
   ============================================================ */

function renderJournal() {
  return `
  <div class="screen-container fade-in">
    <div class="screen-header">
      <h1 class="screen-title">📓 My Journal</h1>
      <p class="screen-subtitle">Reflect, express, and grow</p>
    </div>

    <!-- Tab bar -->
    <div class="tab-bar journal-tabs">
      <button class="tab-btn active" id="jTab-write" onclick="jSwitchTab('write')">✏️ Write</button>
      <button class="tab-btn" id="jTab-history" onclick="jSwitchTab('history')">📚 History</button>
    </div>

    <!-- Write tab -->
    <div id="jPanel-write" class="journal-panel">
      <div class="card journal-card">
        <input id="jTitle" class="journal-title-input" type="text" placeholder="Give your entry a title…" maxlength="80" />
        <div class="journal-mood-row">
          <span class="journal-mood-label">How are you feeling?</span>
          <div class="journal-mood-picker" id="jMoodPicker">
            ${['😔','😟','😐','🙂','😊'].map((e,i) => `<button class="mood-pill" data-score="${i}" data-emoji="${e}" onclick="jPickMood(this)">${e}</button>`).join('')}
          </div>
        </div>
        <textarea id="jBody" class="journal-textarea" placeholder="Write freely… this is your safe space 💙" rows="8"></textarea>
        <div class="journal-word-count" id="jWordCount">0 words</div>
        <button class="btn-primary btn-full" onclick="jSaveEntry()">
          <span>💾 Save Entry</span>
        </button>
      </div>
    </div>

    <!-- History tab -->
    <div id="jPanel-history" class="journal-panel" style="display:none">
      <div id="jHistoryList"></div>
    </div>
  </div>`;
}

function initJournal() {
  const ta = document.getElementById('jBody');
  if (ta) {
    ta.addEventListener('input', () => {
      const words = ta.value.trim().split(/\s+/).filter(w => w).length;
      document.getElementById('jWordCount').textContent = `${words} word${words !== 1 ? 's' : ''}`;
    });
  }
  jRenderHistory();
}

let jSelectedMood = null;

function jPickMood(btn) {
  document.querySelectorAll('.mood-pill').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  jSelectedMood = { score: parseInt(btn.dataset.score), emoji: btn.dataset.emoji };
}

function jSaveEntry() {
  const title = document.getElementById('jTitle').value.trim();
  const body  = document.getElementById('jBody').value.trim();
  if (!body) { showToast('✏️ Please write something first!'); return; }

  const entry = {
    id: Date.now(),
    date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    title: title || 'Untitled',
    text: body,
    moodTag: jSelectedMood || { score: 2, emoji: '😐' }
  };
  AppState.journalEntries.unshift(entry);

  document.getElementById('jTitle').value = '';
  document.getElementById('jBody').value = '';
  document.getElementById('jWordCount').textContent = '0 words';
  document.querySelectorAll('.mood-pill').forEach(b => b.classList.remove('selected'));
  jSelectedMood = null;

  showToast('📓 Entry saved!');
  launchConfetti();
  jSwitchTab('history');
}

function jRenderHistory() {
  const list = document.getElementById('jHistoryList');
  if (!list) return;
  if (!AppState.journalEntries.length) {
    list.innerHTML = `<div class="empty-state">
      <div class="empty-icon">📓</div>
      <p>No entries yet. Start writing!</p>
    </div>`;
    return;
  }
  list.innerHTML = AppState.journalEntries.map(e => `
    <div class="journal-entry-card card" onclick="jToggleEntry(${e.id})">
      <div class="journal-entry-header">
        <div>
          <span class="entry-mood-badge">${e.moodTag.emoji}</span>
          <strong class="entry-title">${e.title}</strong>
        </div>
        <span class="entry-date">${e.date}</span>
      </div>
      <p class="entry-preview" id="jPreview-${e.id}">${e.text.slice(0,120)}${e.text.length > 120 ? '…' : ''}</p>
      <div class="entry-full" id="jFull-${e.id}" style="display:none">
        <p class="entry-body-text">${e.text}</p>
        <button class="btn-danger-sm" onclick="event.stopPropagation();jDeleteEntry(${e.id})">🗑 Delete</button>
      </div>
    </div>`).join('');
}

function jToggleEntry(id) {
  const prev = document.getElementById(`jPreview-${id}`);
  const full  = document.getElementById(`jFull-${id}`);
  if (full.style.display === 'none') { prev.style.display = 'none'; full.style.display = 'block'; }
  else { prev.style.display = 'block'; full.style.display = 'none'; }
}

function jDeleteEntry(id) {
  AppState.journalEntries = AppState.journalEntries.filter(e => e.id !== id);
  jRenderHistory();
  showToast('🗑 Entry deleted');
}

function jSwitchTab(tab) {
  ['write','history'].forEach(t => {
    document.getElementById(`jPanel-${t}`).style.display = t === tab ? 'block' : 'none';
    document.getElementById(`jTab-${t}`).classList.toggle('active', t === tab);
  });
  if (tab === 'history') jRenderHistory();
}
