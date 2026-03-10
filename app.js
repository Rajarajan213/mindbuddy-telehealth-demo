/* ============================================================
   app.js – SPA Router + Shared State
   ============================================================ */

// Shared state is now handled by state.js

// ---- Screen Registry ----
const SCREENS = {
  home: { render: renderHome, init: null },
  chat: { render: renderChat, init: initChat },
  mood: { render: renderMood, init: initMood },
  phq9: { render: renderPHQ9, init: initPHQ9 },
  dashboard: { render: renderDashboard, init: initDashboard },
  profile:      { render: renderProfile,    init: initProfile    },
  medications:  { render: renderMedications, init: initMedications },
  reminders:    { render: renderReminders,   init: initReminders  },
  games:        { render: renderGames,       init: initGames      },
  journal:      { render: renderJournal,     init: initJournal    },
  sleep:        { render: renderSleep,       init: initSleep      },
  breathing:    { render: renderBreathing,   init: initBreathing  },
  crisis:       { render: renderCrisis,      init: initCrisis     },
};

let currentScreen = 'home';
let chartInstances = {};

function destroyCharts() {
  Object.values(chartInstances).forEach(c => { try { c.destroy(); } catch (e) { } });
  chartInstances = {};
}

function navigateTo(screen) {
  if (!SCREENS[screen]) return;
  destroyCharts();
  currentScreen = screen;

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === screen);
  });

  // Render screen
  const app = document.getElementById('app');
  app.innerHTML = SCREENS[screen].render();

  // Run init after DOM insertion
  if (SCREENS[screen].init) {
    requestAnimationFrame(() => SCREENS[screen].init());
  }

  history.pushState(null, '', '#' + screen);
}

// ---- Toast ----
window.showToast = function (msg, duration = 2500) {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
};

// ---- Confetti ----
window.launchConfetti = function () {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    r: Math.random() * 8 + 4,
    d: Math.random() + 1,
    color: ['#4ECDC4', '#A29BFE', '#FDCB6E', '#FF7675', '#74B9A0'][Math.floor(Math.random() * 5)],
    tilt: Math.random() * 20 - 10,
    tiltAngle: 0,
    tiltSpeed: Math.random() * 0.1 + 0.05,
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.tiltAngle += p.tiltSpeed;
      p.y += p.d * 2.5;
      p.x += Math.sin(frame / 20) * 1.5;
      p.tilt = Math.sin(p.tiltAngle) * 15;
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt, p.y);
      ctx.lineTo(p.x + p.tilt + p.r, p.y + p.r);
      ctx.stroke();
    });
    frame++;
    if (particles.some(p => p.y < canvas.height + 20)) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  draw();
};

// ---- Chart.js Defaults ----
Chart.defaults.font.family = "'Inter','Nunito',sans-serif";
Chart.defaults.color = '#616E99';

// ---- Boot ----
document.addEventListener('DOMContentLoaded', () => {
  // Nav click handlers
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.screen));
  });

  // Theme toggle
  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    AppState.highContrast = !AppState.highContrast;
    document.body.classList.toggle('high-contrast', AppState.highContrast);
    showToast(AppState.highContrast ? '♿ High-contrast mode ON' : '☀️ Standard mode ON');
  });

  // Hash routing
  const hash = location.hash.replace('#', '');
  navigateTo(SCREENS[hash] ? hash : 'home');

  window.addEventListener('popstate', () => {
    const h = location.hash.replace('#', '');
    navigateTo(SCREENS[h] ? h : 'home');
  });
});
