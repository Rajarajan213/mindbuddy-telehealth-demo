/* ============================================================
   login.js – Auth Screen (Supabase Email + Password)
   ============================================================ */

function renderLogin() {
  return `
  <div class="login-bg">
    <div class="login-card card">
      <!-- Brand -->
      <div class="login-brand">
        <span class="login-brand-icon">🧠</span>
        <h1 class="login-brand-name">MindBuddy</h1>
        <p class="login-tagline">Your mental wellness companion</p>
      </div>

      <!-- Form -->
      <div class="login-form" id="loginForm">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input id="loginEmail" type="email" class="form-input" placeholder="you@example.com" autocomplete="email" />
        </div>
        <div class="form-group" style="margin-top:14px">
          <label class="form-label">Password</label>
          <div class="password-wrap">
            <input id="loginPassword" type="password" class="form-input" placeholder="••••••••" autocomplete="current-password" />
            <button class="pwd-toggle" onclick="loginTogglePwd()">👁</button>
          </div>
        </div>

        <!-- Error -->
        <div id="loginError" class="login-error" style="display:none"></div>

        <!-- Submit -->
        <button class="btn-primary btn-full login-btn" id="loginBtn" onclick="loginSubmit()" style="margin-top:24px">
          <span id="loginBtnText">🔐 Sign In</span>
        </button>

        <p class="login-hint">
          Admin accounts see the Clinician Dashboard.<br>
          Patient accounts see the Home screen.
        </p>
      </div>

      <!-- Demo hint -->
      <div class="login-demo-box">
        <p>🔧 <strong>No Supabase yet?</strong> <a href="#" onclick="loginDemo();return false;">Continue in Demo Mode →</a></p>
      </div>
    </div>
  </div>`;
}

function initLogin() {
  // Allow Enter key to submit
  document.getElementById('loginPassword')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') loginSubmit();
  });
}

function loginTogglePwd() {
  const pwd = document.getElementById('loginPassword');
  if (pwd) pwd.type = pwd.type === 'password' ? 'text' : 'password';
}

async function loginSubmit() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn      = document.getElementById('loginBtn');
  const errEl    = document.getElementById('loginError');

  if (!email || !password) {
    showLoginError('Please enter your email and password.');
    return;
  }

  // Loading state
  btn.disabled = true;
  document.getElementById('loginBtnText').textContent = '⏳ Signing in…';
  errEl.style.display = 'none';

  try {
    const { role, profile } = await sbLogin(email, password);

    // Store user info in AppState
    AppState.currentUser = { email };
    AppState.isAdmin     = role === 'admin';

    if (profile) {
      AppState.user.name     = profile.name || email.split('@')[0];
      AppState.user.initials = profile.initials || email.slice(0, 2).toUpperCase();
    }

    // Update avatar
    const av = document.getElementById('userAvatar');
    if (av) av.textContent = AppState.user.initials;

    // Sync data then navigate
    const session = await sbGetSession();
    if (session) await syncFromSupabase(session.user.id);

    showToast(`👋 Welcome back, ${AppState.user.name}!`);
    navigateTo(AppState.isAdmin ? 'dashboard' : 'home');

  } catch (err) {
    showLoginError(err.message || 'Sign in failed. Check your credentials.');
    btn.disabled = false;
    document.getElementById('loginBtnText').textContent = '🔐 Sign In';
  }
}

function showLoginError(msg) {
  const el = document.getElementById('loginError');
  if (el) { el.textContent = '⚠️ ' + msg; el.style.display = 'block'; }
}

// Demo mode: skip Supabase, use mock data
function loginDemo() {
  AppState.currentUser = { email: 'demo@mindbuddy.app' };
  AppState.isAdmin     = false;
  showToast('🎮 Demo mode — no database connected');
  navigateTo('home');
}
