/* ============================================================
   login.js – Auth Screen (Supabase Email + Password)
   Includes: Sign In, Forgot Password, Password Reset
   ============================================================ */

// ---- MAIN LOGIN SCREEN ----------------------------------------

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

      <!-- Sign-In Panel -->
      <div id="panelSignIn">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input id="loginEmail" type="email" class="form-input"
            placeholder="you@example.com" autocomplete="email" />
        </div>
        <div class="form-group" style="margin-top:14px">
          <label class="form-label">Password</label>
          <div class="password-wrap">
            <input id="loginPassword" type="password" class="form-input"
              placeholder="••••••••" autocomplete="current-password" />
            <button class="pwd-toggle" onclick="loginTogglePwd()">👁</button>
          </div>
        </div>

        <!-- Error -->
        <div id="loginError" class="login-error" style="display:none"></div>

        <!-- Sign In Button -->
        <button class="btn-primary btn-full login-btn" id="loginBtn"
          onclick="loginSubmit()" style="margin-top:24px">
          <span id="loginBtnText">🔐 Sign In</span>
        </button>

        <!-- Forgot Password link -->
        <div style="text-align:center;margin-top:14px;">
          <a href="#" class="forgot-link" id="forgotPasswordLink"
            onclick="showForgotPanel();return false;">
            Forgot Password?
          </a>
        </div>

        <p class="login-hint">
          Admin accounts → Clinician Dashboard 🏥<br>
          Patient accounts → Personal Home 🌿
        </p>
      </div>

      <!-- Forgot Password Panel (hidden initially) -->
      <div id="panelForgot" style="display:none">
        <div style="text-align:center;margin-bottom:20px;">
          <span style="font-size:40px;">📧</span>
          <h3 style="margin:8px 0 4px;font-family:'Nunito',sans-serif;font-weight:800;">
            Reset Password
          </h3>
          <p style="font-size:13px;color:var(--text-secondary);">
            Enter your email and we'll send a secure reset link.
          </p>
        </div>
        <div class="form-group">
          <label class="form-label">Registered Email</label>
          <input id="forgotEmail" type="email" class="form-input"
            placeholder="you@example.com" />
        </div>
        <div id="forgotMsg" class="login-error" style="display:none"></div>
        <button class="btn-primary btn-full login-btn" id="forgotBtn"
          onclick="sendResetEmail()" style="margin-top:20px">
          <span id="forgotBtnText">📤 Send Reset Link</span>
        </button>
        <div style="text-align:center;margin-top:14px;">
          <a href="#" class="forgot-link" onclick="showSignInPanel();return false;">
            ← Back to Sign In
          </a>
        </div>
      </div>

      <!-- Demo hint -->
      <div class="login-demo-box" style="margin-top:20px">
        <p>🔧 <strong>No account?</strong>
          <a href="#" onclick="loginDemo();return false;">Continue in Demo Mode →</a>
        </p>
      </div>

    </div>
  </div>`;
}

// ---- PASSWORD RESET SCREEN (after clicking email link) --------

function renderResetPassword() {
  return `
  <div class="login-bg">
    <div class="login-card card">
      <div class="login-brand">
        <span class="login-brand-icon">🔑</span>
        <h1 class="login-brand-name">New Password</h1>
        <p class="login-tagline">Choose a strong new password</p>
      </div>
      <div class="form-group">
        <label class="form-label">New Password</label>
        <div class="password-wrap">
          <input id="newPassword" type="password" class="form-input"
            placeholder="Min. 8 characters" />
          <button class="pwd-toggle" onclick="resetTogglePwd()">👁</button>
        </div>
      </div>
      <div class="form-group" style="margin-top:14px">
        <label class="form-label">Confirm Password</label>
        <input id="confirmPassword" type="password" class="form-input"
          placeholder="Repeat your new password" />
      </div>
      <div id="resetError" class="login-error" style="display:none"></div>
      <button class="btn-primary btn-full login-btn" id="resetBtn"
        onclick="submitNewPassword()" style="margin-top:24px">
        <span id="resetBtnText">✅ Update Password</span>
      </button>
    </div>
  </div>`;
}

// ---- INIT ---------------------------------------------------

function initLogin() {
  document.getElementById('loginPassword')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') loginSubmit();
  });
  document.getElementById('forgotEmail')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendResetEmail();
  });
}

function initResetPassword() {
  document.getElementById('newPassword')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') submitNewPassword();
  });
}

// ---- PANEL TOGGLES ------------------------------------------

function showForgotPanel() {
  document.getElementById('panelSignIn').style.display = 'none';
  document.getElementById('panelForgot').style.display = 'block';
  document.getElementById('forgotEmail').value =
    document.getElementById('loginEmail')?.value || '';
}

function showSignInPanel() {
  document.getElementById('panelForgot').style.display = 'none';
  document.getElementById('panelSignIn').style.display = 'block';
}

// ---- SIGN IN ------------------------------------------------

function loginTogglePwd() {
  const pwd = document.getElementById('loginPassword');
  if (pwd) pwd.type = pwd.type === 'password' ? 'text' : 'password';
}

async function loginSubmit() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn      = document.getElementById('loginBtn');
  const errEl    = document.getElementById('loginError');

  if (!email || !password) { showLoginError('Please enter your email and password.'); return; }

  btn.disabled = true;
  document.getElementById('loginBtnText').textContent = '⏳ Signing in…';
  errEl.style.display = 'none';

  try {
    const { role, profile } = await sbLogin(email, password);

    AppState.currentUser = { email };
    AppState.isAdmin     = role === 'admin';

    if (profile) {
      AppState.user.name     = profile.name     || email.split('@')[0];
      AppState.user.initials = profile.initials || email.slice(0, 2).toUpperCase();
    }

    const av = document.getElementById('userAvatar');
    if (av) av.textContent = AppState.user.initials;

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

// ---- FORGOT PASSWORD ----------------------------------------

async function sendResetEmail() {
  const email  = document.getElementById('forgotEmail').value.trim();
  const btn    = document.getElementById('forgotBtn');
  const msgEl  = document.getElementById('forgotMsg');

  if (!email) {
    msgEl.textContent = '⚠️ Please enter your email address.';
    msgEl.style.background = '#fff0f0'; msgEl.style.color = '#c0392b';
    msgEl.style.display = 'block';
    return;
  }

  btn.disabled = true;
  document.getElementById('forgotBtnText').textContent = '⏳ Sending…';

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://rajarajan213.github.io/mindbuddy-telehealth-demo/#reset-password',
    });

    if (error) throw error;

    // Log the audit event
    try {
      await logAuditEvent({
        actionType: 'Password Reset Initiated',
        targetEmail: email,
        details: 'Reset link sent via Supabase Auth',
        status: 'Success'
      });
    } catch (e) { /* admin might not be logged in */ }

    // Success
    msgEl.textContent = '✅ Reset link sent! Check your inbox (and spam folder).';
    msgEl.style.background = '#f0fff4'; msgEl.style.color = '#27ae60';
    msgEl.style.border = '1px solid #a3e6b4';
    msgEl.style.display = 'block';
    document.getElementById('forgotBtnText').textContent = '📤 Send Reset Link';
    btn.disabled = false;
  } catch (err) {
    msgEl.textContent = '⚠️ ' + (err.message || 'Failed to send reset email.');
    msgEl.style.background = '#fff0f0'; msgEl.style.color = '#c0392b';
    msgEl.style.display = 'block';
    btn.disabled = false;
    document.getElementById('forgotBtnText').textContent = '📤 Send Reset Link';
  }
}

// ---- RESET PASSWORD (after clicking email link) --------------

function resetTogglePwd() {
  const pwd = document.getElementById('newPassword');
  if (pwd) pwd.type = pwd.type === 'password' ? 'text' : 'password';
}

async function submitNewPassword() {
  const pwd  = document.getElementById('newPassword').value;
  const conf = document.getElementById('confirmPassword').value;
  const btn  = document.getElementById('resetBtn');
  const errEl = document.getElementById('resetError');

  if (!pwd || pwd.length < 8) {
    errEl.textContent = '⚠️ Password must be at least 8 characters.';
    errEl.style.display = 'block'; return;
  }
  if (pwd !== conf) {
    errEl.textContent = '⚠️ Passwords do not match.';
    errEl.style.display = 'block'; return;
  }

  btn.disabled = true;
  document.getElementById('resetBtnText').textContent = '⏳ Updating…';
  errEl.style.display = 'none';

  try {
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) throw error;
    showToast('✅ Password updated! Please sign in with your new password.');
    navigateTo('login');
  } catch (err) {
    errEl.textContent = '⚠️ ' + (err.message || 'Failed to update password.');
    errEl.style.display = 'block';
    btn.disabled = false;
    document.getElementById('resetBtnText').textContent = '✅ Update Password';
  }
}

// ---- DEMO MODE ----------------------------------------------

function loginDemo() {
  AppState.currentUser = { email: 'demo@mindbuddy.app' };
  AppState.isAdmin     = false;
  showToast('🎮 Demo mode — data is not saved to database');
  navigateTo('home');
}
