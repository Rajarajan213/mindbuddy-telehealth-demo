/* ============================================================
   screens/games.js – Fun Games (Bubble Pop + Zen Garden)
   ============================================================ */

if (!AppState.gameLogs) AppState.gameLogs = [];
if (!AppState.gameScores) AppState.gameScores = { bubble: 0, zen: 0 };

let activeGame = null;
let bubbleInterval = null;
let bubbleTimer = null;
let bubbleScore = 0;
let bubbleTimeLeft = 30;
let zenInterval = null;
let zenParticles = [];

function renderGames() {
    const totalSessions = AppState.gameLogs.length;
    const topBubble = AppState.gameLogs.filter(l => l.game === 'bubble').reduce((m, l) => Math.max(m, l.score), 0);
    const avgZen = AppState.gameLogs.filter(l => l.game === 'zen').reduce((s, l, _, a) => s + l.score / a.length, 0);

    return `
  <div class="screen">
    <div class="hero-gradient mb-4" style="background:linear-gradient(135deg,var(--amber) 0%,var(--rose) 100%);">
      <h1>🎮 Mindful Games</h1>
      <p>Play, breathe, and boost your mood — tracked for your care team</p>
    </div>

    <!-- Stats -->
    <div class="today-summary mb-4">
      <div class="stat-chip"><div class="stat-val" style="color:var(--amber)">${totalSessions}</div><div class="stat-label">Sessions</div></div>
      <div class="stat-chip"><div class="stat-val" style="color:var(--teal)">🫧 ${topBubble}</div><div class="stat-label">Best Bubble</div></div>
      <div class="stat-chip"><div class="stat-val" style="color:var(--sage)">🧘 ${Math.round(avgZen)}s</div><div class="stat-label">Avg Zen</div></div>
    </div>

    <!-- Game Cards -->
    <h2 class="section-title">Choose a Game</h2>
    <div class="game-cards mb-4">
      <div class="game-card" id="openBubble">
        <div class="game-art" style="background:linear-gradient(135deg,rgba(78,205,196,0.2),rgba(162,155,254,0.2));">
          <div class="game-emoji">🫧</div>
        </div>
        <div class="game-card-body">
          <div class="game-title">Bubble Pop</div>
          <div class="game-desc">Pop as many bubbles as you can in 30 seconds. Boosts focus and reduces anxiety.</div>
          <div class="game-meta">🏆 Best: ${topBubble} · ⏱️ 30s</div>
          <button class="btn btn-primary btn-full btn-sm mt-4" id="startBubbleBtn">▶ Play Now</button>
        </div>
      </div>
      <div class="game-card" id="openZen">
        <div class="game-art" style="background:linear-gradient(135deg,rgba(116,185,160,0.2),rgba(253,203,110,0.2));">
          <div class="game-emoji">🧘</div>
        </div>
        <div class="game-card-body">
          <div class="game-title">Zen Garden</div>
          <div class="game-desc">Click to sprinkle calming particles. A breathing exercise disguised as play.</div>
          <div class="game-meta">✨ Avg calm: ${Math.round(avgZen)}s · 🌿 Open-ended</div>
          <button class="btn btn-primary btn-full btn-sm mt-4" id="startZenBtn" style="background:linear-gradient(135deg,var(--sage),var(--amber));">▶ Play Now</button>
        </div>
      </div>
    </div>

    <!-- Game Arena -->
    <div class="card hidden" id="gameArena" style="position:relative;overflow:hidden;min-height:420px;">
      <div id="gameInner"></div>
    </div>

    <!-- Recent Logs -->
    ${AppState.gameLogs.length > 0 ? `
    <div class="card mt-4">
      <h2 class="section-title">📈 Recent Sessions</h2>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${AppState.gameLogs.slice(-5).reverse().map(l => `
        <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border);">
          <span style="font-size:20px;">${l.game === 'bubble' ? '🫧' : '🧘'}</span>
          <div style="flex:1"><div style="font-weight:600;font-size:14px;">${l.game === 'bubble' ? 'Bubble Pop' : 'Zen Garden'}</div>
            <div style="font-size:12px;color:var(--text-secondary);">${l.date}</div>
          </div>
          <span style="font-weight:700;color:var(--teal);">${l.score} ${l.game === 'bubble' ? 'pts' : 's'}</span>
        </div>`).join('')}
      </div>
    </div>` : ''}
  </div>`;
}

function startBubbleGame() {
    bubbleScore = 0; bubbleTimeLeft = 30; activeGame = 'bubble';
    const arena = document.getElementById('gameArena');
    if (!arena) return;
    arena.classList.remove('hidden');
    arena.scrollIntoView({ behavior: 'smooth', block: 'start' });

    document.getElementById('gameInner').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:var(--surface2);border-bottom:1px solid var(--border);">
      <div style="font-family:'Nunito',sans-serif;font-weight:900;font-size:20px;">🫧 Bubble Pop</div>
      <div style="display:flex;gap:16px;align-items:center;">
        <div>Score: <strong id="bScore">0</strong></div>
        <div>Time: <strong id="bTime">30</strong>s</div>
      </div>
    </div>
    <div id="bubbleField" style="position:relative;height:340px;background:linear-gradient(180deg,#e8f9f8,#f0f4ff);overflow:hidden;cursor:crosshair;user-select:none;"></div>
    <div class="hidden" id="gameOverPanel" style="position:absolute;inset:0;background:rgba(255,255,255,0.92);backdrop-filter:blur(8px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;">
      <div style="font-size:60px;">🎉</div>
      <div style="font-family:'Nunito';font-weight:900;font-size:32px;color:var(--teal);" id="finalScore"></div>
      <div style="font-size:16px;color:var(--text-secondary);">bubbles popped!</div>
      <button class="btn btn-primary" id="playAgainBtn">🔄 Play Again</button>
      <button class="btn btn-secondary btn-sm" id="exitGameBtn">← Back to Games</button>
    </div>`;

    spawnBubbles();
    bubbleTimer = setInterval(() => {
        bubbleTimeLeft--;
        const el = document.getElementById('bTime');
        if (el) el.textContent = bubbleTimeLeft;
        if (bubbleTimeLeft <= 0) endBubbleGame();
    }, 1000);
}

function spawnBubbles() {
    if (activeGame !== 'bubble') return;
    const field = document.getElementById('bubbleField');
    if (!field) return;
    const bubble = document.createElement('div');
    const size = 34 + Math.random() * 40;
    const colors = ['rgba(78,205,196,0.75)', 'rgba(162,155,254,0.75)', 'rgba(253,203,110,0.75)', 'rgba(116,185,160,0.75)', 'rgba(255,118,117,0.75)'];
    const clr = colors[Math.floor(Math.random() * colors.length)];
    Object.assign(bubble.style, {
        position: 'absolute',
        width: size + 'px', height: size + 'px',
        borderRadius: '50%',
        background: clr,
        left: Math.random() * (field.offsetWidth - size) + 'px',
        top: Math.random() * (field.offsetHeight - size) + 'px',
        cursor: 'pointer',
        transition: 'transform 0.1s',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.round(size * 0.45) + 'px',
        userSelect: 'none',
        animation: `floatBubble ${3 + Math.random() * 4}s ease-in-out infinite alternate`,
    });
    bubble.textContent = '🫧';
    bubble.addEventListener('click', () => {
        if (activeGame !== 'bubble') return;
        bubbleScore++;
        const scoreEl = document.getElementById('bScore');
        if (scoreEl) scoreEl.textContent = bubbleScore;
        bubble.style.transform = 'scale(1.4)';
        bubble.style.opacity = '0';
        setTimeout(() => { try { field.removeChild(bubble); } catch (e) { } spawnBubbles(); }, 200);
    });
    field.appendChild(bubble);
    setTimeout(() => {
        if (field.contains(bubble) && activeGame === 'bubble') {
            try { field.removeChild(bubble); } catch (e) { }
            spawnBubbles();
        }
    }, 3000 + Math.random() * 2000);
}

function endBubbleGame() {
    clearInterval(bubbleTimer); activeGame = null;
    const panel = document.getElementById('gameOverPanel');
    const finalScoreEl = document.getElementById('finalScore');
    if (panel) { panel.classList.remove('hidden'); panel.style.display = 'flex'; }
    if (finalScoreEl) finalScoreEl.textContent = bubbleScore;
    AppState.gameLogs.push({ game: 'bubble', score: bubbleScore, date: new Date().toLocaleDateString() });
    if (bubbleScore > AppState.gameScores.bubble) AppState.gameScores.bubble = bubbleScore;
    showToast(`🎉 Game over! You popped ${bubbleScore} bubbles!`);
    if (bubbleScore >= 20) launchConfetti();

    document.getElementById('playAgainBtn')?.addEventListener('click', startBubbleGame);
    document.getElementById('exitGameBtn')?.addEventListener('click', () => {
        const app = document.getElementById('app');
        app.innerHTML = renderGames(); initGames();
    });
}

function startZenGame() {
    activeGame = 'zen'; let zenTime = 0;
    const arena = document.getElementById('gameArena');
    if (!arena) return;
    arena.classList.remove('hidden');
    arena.scrollIntoView({ behavior: 'smooth', block: 'start' });

    document.getElementById('gameInner').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:var(--surface2);border-bottom:1px solid var(--border);">
      <div style="font-family:'Nunito',sans-serif;font-weight:900;font-size:20px;">🧘 Zen Garden</div>
      <div>Time: <strong id="zenTime">0</strong>s &nbsp;|&nbsp; <button class="btn btn-secondary btn-sm" id="endZenBtn">Stop & Save</button></div>
    </div>
    <canvas id="zenCanvas" style="width:100%;height:340px;display:block;cursor:crosshair;background:linear-gradient(180deg,#1a1a2e,#16213e);"></canvas>
    <p style="text-align:center;font-size:12px;color:var(--text-muted);padding:10px;">Click / tap anywhere to sprinkle zen particles ✨ Breathe deeply.</p>`;

    const canvas = document.getElementById('zenCanvas');
    canvas.width = canvas.offsetWidth; canvas.height = 340;
    const ctx = canvas.getContext('2d');
    zenParticles = [];

    canvas.addEventListener('click', e => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left; const y = e.clientY - rect.top;
        for (let i = 0; i < 18; i++) {
            const angle = (Math.PI * 2 / 18) * i;
            const speed = 1 + Math.random() * 2;
            zenParticles.push({
                x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                radius: 3 + Math.random() * 5, alpha: 1,
                color: `hsl(${160 + Math.random() * 80},70%,70%)`,
                decay: 0.008 + Math.random() * 0.006,
            });
        }
    });

    function drawZen() {
        if (activeGame !== 'zen') return;
        ctx.fillStyle = 'rgba(26,26,46,0.18)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        zenParticles = zenParticles.filter(p => p.alpha > 0.05);
        zenParticles.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.vy *= 0.97; p.alpha -= p.decay;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color.replace(')', `,${p.alpha})`).replace('hsl', 'hsla');
            ctx.fill();
        });
        requestAnimationFrame(drawZen);
    }
    drawZen();

    zenInterval = setInterval(() => {
        zenTime++;
        const el = document.getElementById('zenTime');
        if (el) el.textContent = zenTime;
    }, 1000);

    document.getElementById('endZenBtn')?.addEventListener('click', () => {
        clearInterval(zenInterval); activeGame = null;
        AppState.gameLogs.push({ game: 'zen', score: zenTime, date: new Date().toLocaleDateString() });
        showToast(`🧘 ${zenTime} seconds of calm logged!`);
        const app = document.getElementById('app');
        app.innerHTML = renderGames(); initGames();
    });
}

function initGames() {
    const style = document.createElement('style');
    style.textContent = `@keyframes floatBubble { from{transform:translateY(0)} to{transform:translateY(-14px)} }`;
    document.head.appendChild(style);

    document.getElementById('startBubbleBtn')?.addEventListener('click', startBubbleGame);
    document.getElementById('startZenBtn')?.addEventListener('click', startZenGame);
}
