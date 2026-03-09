/* ============================================================
   screens/home.js – Home / Onboarding Screen
   ============================================================ */

const QUOTES = [
    { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared, or anxious.", author: "Lori Deschene" },
    { text: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.", author: "Noam Shpancer" },
    { text: "Self-care is not self-indulgence, it is self-preservation.", author: "Audre Lorde" },
    { text: "You are not your illness. You have an individual story to tell.", author: "Julian Seifter" },
    { text: "Recovery is not one and done. It is a lifelong journey that takes place one day, one step at a time.", author: "Unknown" },
];

function renderHome() {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    const todayMood = AppState.moodLogs.at(-1);
    const lastPHQ = AppState.phqResults.at(-1);
    const lastScore = lastPHQ ? lastPHQ.score : '—';

    return `
  <div class="screen">
    <!-- Greeting -->
    <div class="hero-gradient mb-4">
      <h1>🌿 ${greeting},<br/><span>${AppState.user.name}!</span></h1>
      <p>How are you feeling today? I'm here for you.</p>
    </div>

    <!-- Stats -->
    <h2 class="section-title">Your Overview</h2>
    <div class="today-summary mb-4">
      <div class="stat-chip">
        <div class="stat-val">🔥 ${AppState.streak}</div>
        <div class="stat-label">Day Streak</div>
      </div>
      <div class="stat-chip">
        <div class="stat-val">${todayMood ? todayMood.emoji : '—'}</div>
        <div class="stat-label">Today's Mood</div>
      </div>
      <div class="stat-chip">
        <div class="stat-val">${lastScore}</div>
        <div class="stat-label">Last PHQ Score</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <h2 class="section-title">Quick Actions</h2>
    <div class="quick-actions mb-4">
      <button class="quick-btn" id="qa-chat">
        <span class="icon">💬</span>
        <span class="label">Talk to Buddy</span>
        <span class="desc">Share how you feel</span>
      </button>
      <button class="quick-btn" id="qa-mood">
        <span class="icon">📊</span>
        <span class="label">Log Mood</span>
        <span class="desc">Track your day</span>
      </button>
      <button class="quick-btn" id="qa-phq">
        <span class="icon">🩺</span>
        <span class="label">PHQ-9 Screen</span>
        <span class="desc">5-minute check-in</span>
      </button>
      <button class="quick-btn" id="qa-dash">
        <span class="icon">🏥</span>
        <span class="label">Clinic View</span>
        <span class="desc">Clinician dashboard</span>
      </button>
    </div>

    <!-- Quote -->
    <div class="card quote-card">
      <p class="quote-text">"${quote.text}"</p>
      <p class="quote-author">— ${quote.author}</p>
    </div>

    <!-- Info footer -->
    <p style="text-align:center;color:var(--text-muted);font-size:12px;margin-top:18px;">
      🔒 Your data stays private. AI support is not a replacement for professional care.
    </p>
  </div>`;
}

// Wire quick-action buttons (called after render via DOMContentLoaded delegation)
document.addEventListener('click', function (e) {
    const map = { 'qa-chat': 'chat', 'qa-mood': 'mood', 'qa-phq': 'phq9', 'qa-dash': 'dashboard' };
    for (const [id, screen] of Object.entries(map)) {
        if (e.target.closest('#' + id)) { navigateTo(screen); return; }
    }
});
