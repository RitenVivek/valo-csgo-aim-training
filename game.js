// ===================================================================
// SIGHTLINE — Aim Trainer Engine
// ===================================================================

// ---------- Custom crosshair cursor ----------
const crosshair = document.getElementById('crosshair');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  crosshair.style.left = mouseX + 'px';
  crosshair.style.top = mouseY + 'px';
});
window.addEventListener('mousedown', () => document.body.classList.add('aiming'));
window.addEventListener('mouseup', () => document.body.classList.remove('aiming'));

// ---------- Crosshair style picker ----------
const CROSSHAIR_STYLES = ['cross', 'dot', 'asterisk', 'reticle'];
const CROSSHAIR_KEY = 'sightline_crosshair_v1';
const CROSSHAIR_SCALE_KEY = 'sightline_crosshair_scale_v1';
const CROSSHAIR_MIN = 50;
const CROSSHAIR_MAX = 150;

function loadCrosshairStyle() {
  const saved = localStorage.getItem(CROSSHAIR_KEY);
  return CROSSHAIR_STYLES.includes(saved) ? saved : 'cross';
}
function loadCrosshairScale() {
  try {
    const raw = localStorage.getItem(CROSSHAIR_SCALE_KEY);
    const value = Number(raw);
    if (!Number.isNaN(value) && value >= CROSSHAIR_MIN && value <= CROSSHAIR_MAX) return value;
  } catch (e) {}
  return 100;
}
function applyCrosshairStyle(style) {
  CROSSHAIR_STYLES.forEach(s => crosshair.classList.remove('style-' + s));
  crosshair.classList.add('style-' + style);
  try { localStorage.setItem(CROSSHAIR_KEY, style); } catch (e) {}
  document.querySelectorAll('.ch-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.style === style);
  });
}
function applyCrosshairScale(scale) {
  const normalized = Math.min(Math.max(scale, CROSSHAIR_MIN), CROSSHAIR_MAX);
  document.documentElement.style.setProperty('--crosshair-scale', normalized / 100);
  try { localStorage.setItem(CROSSHAIR_SCALE_KEY, normalized); } catch (e) {}
  const crosshairValEl = document.getElementById('crosshair-val');
  if (crosshairValEl) crosshairValEl.textContent = normalized + '%';
  const crosshairSliderEl = document.getElementById('crosshair-slider');
  if (crosshairSliderEl) crosshairSliderEl.value = normalized;
}
applyCrosshairStyle(loadCrosshairStyle());
applyCrosshairScale(loadCrosshairScale());

const chPicker = document.getElementById('crosshair-picker');
function toggleChPicker(triggerBtn) {
  const willOpen = !chPicker.classList.contains('open');
  if (willOpen && triggerBtn) {
    const rect = triggerBtn.getBoundingClientRect();
    const pickerWidth = 260;
    let left = rect.right - pickerWidth;
    left = clamp(left, 12, window.innerWidth - pickerWidth - 12);
    chPicker.style.top = (rect.bottom + 8) + 'px';
    chPicker.style.left = left + 'px';
  }
  chPicker.classList.toggle('open');
}
function closeChPicker() { chPicker.classList.remove('open'); }

document.getElementById('nav-crosshair-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  toggleChPicker(e.currentTarget);
});
document.getElementById('trainer-crosshair-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  toggleChPicker(e.currentTarget);
});
document.querySelectorAll('.ch-option').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    applyCrosshairStyle(btn.dataset.style);
    closeChPicker();
  });
});
document.addEventListener('click', (e) => {
  if (chPicker.classList.contains('open') && !chPicker.contains(e.target)) closeChPicker();
});

// ---------- Persistence (localStorage) ----------
const STORAGE_KEY = 'sightline_stats_v1';
function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    sessions: 0,
    totalShots: 0,
    totalHits: 0,
    bestScores: { gridshot: 0, tracking: 0, peek: 0, switch: 0 },
    bestAvgReaction: null
  };
}
function saveStats() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch (e) {}
}
let stats = loadStats();

function refreshHeaderStats() {
  document.getElementById('nav-sessions').textContent = stats.sessions;
  const bestFlick = stats.bestScores.gridshot;
  document.getElementById('nav-best').textContent = bestFlick ? bestFlick : '—';

  document.getElementById('best-gridshot').textContent = stats.bestScores.gridshot || '—';
  document.getElementById('best-tracking').textContent = stats.bestScores.tracking || '—';
  document.getElementById('best-peek').textContent = stats.bestScores.peek || '—';
  document.getElementById('best-switch').textContent = stats.bestScores.switch || '—';

  document.getElementById('strip-sessions').textContent = stats.sessions;
  document.getElementById('strip-shots').textContent = stats.totalShots;
  const acc = stats.totalShots > 0 ? Math.round((stats.totalHits / stats.totalShots) * 100) + '%' : '—';
  document.getElementById('strip-acc').textContent = acc;
  document.getElementById('strip-best').textContent = stats.bestAvgReaction ? Math.round(stats.bestAvgReaction) + 'ms' : '—';
}
refreshHeaderStats();

// ---------- Hero live demo (decorative, not a real drill) ----------
(function heroDemo() {
  const box = document.querySelector('.hero-demo');
  const target = document.getElementById('demoTarget');
  if (!box || !target) return;
  function reposition() {
    const w = box.clientWidth, h = box.clientHeight;
    const size = 30;
    const x = Math.random() * (w - size * 2) + size;
    const y = Math.random() * (h - size * 2) + size;
    target.style.left = x + 'px';
    target.style.top = y + 'px';
  }
  reposition();
  target.addEventListener('click', (e) => {
    e.stopPropagation();
    target.style.opacity = '0';
    setTimeout(() => { reposition(); target.style.opacity = '1'; }, 120);
  });
  setInterval(() => {
    if (Math.random() > 0.4) reposition();
  }, 1400);
})();

// ---------- Mode card -> launch trainer ----------
document.querySelectorAll('.mode-card').forEach(card => {
  card.addEventListener('click', () => launchTrainer(card.dataset.mode));
});

// ---------- Trainer shell elements ----------
const trainerEl = document.getElementById('trainer');
const gameArea = document.getElementById('game-area');
const countdownEl = document.getElementById('countdown');
const countdownNum = document.getElementById('countdown-num');
const resultsEl = document.getElementById('results');
const hudTime = document.getElementById('hud-time');
const hudHits = document.getElementById('hud-hits');
const hudAcc = document.getElementById('hud-acc');
const hudScore = document.getElementById('hud-score');
const hudModeName = document.getElementById('hud-mode-name');
const exitBtn = document.getElementById('exit-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const sizeSlider = document.getElementById('size-slider');
const crosshairSlider = document.getElementById('crosshair-slider');
const speedSlider = document.getElementById('speed-slider');
const lenSlider = document.getElementById('len-slider');
const sizeVal = document.getElementById('size-val');
const crosshairVal = document.getElementById('crosshair-val');
const speedVal = document.getElementById('speed-val');
const lenVal = document.getElementById('len-val');

let settings = { size: 100, crosshairSize: loadCrosshairScale(), speed: 100, length: 30 };

sizeSlider.addEventListener('input', () => { settings.size = +sizeSlider.value; sizeVal.textContent = settings.size + '%'; });
crosshairSlider.addEventListener('input', () => {
  settings.crosshairSize = +crosshairSlider.value;
  crosshairVal.textContent = settings.crosshairSize + '%';
  applyCrosshairScale(settings.crosshairSize);
});
speedSlider.addEventListener('input', () => { settings.speed = +speedSlider.value; speedVal.textContent = settings.speed + '%'; });
lenSlider.addEventListener('input', () => { settings.length = +lenSlider.value; lenVal.textContent = settings.length + 's'; });

settingsBtn.addEventListener('click', () => settingsPanel.classList.toggle('open'));

const MODE_LABELS = {
  gridshot: 'FLICKSHOT', tracking: 'TRACKING', peek: 'PEEK REACTION', switch: 'TARGET SWITCH'
};

// ---------- Shared session state ----------
let session = null; // current running session object
let rafId = null;

function launchTrainer(mode) {
  trainerEl.classList.add('active');
  hudModeName.textContent = '/ ' + MODE_LABELS[mode];
  settingsPanel.classList.remove('open');
  resultsEl.classList.remove('active');
  gameArea.querySelectorAll('.target, .hit-mark, .miss-ring, .wall').forEach(n => n.remove());
  startCountdown(mode);
}

function startCountdown(mode) {
  countdownEl.style.display = 'flex';
  let n = 3;
  countdownNum.textContent = n;
  const iv = setInterval(() => {
    n--;
    if (n > 0) {
      countdownNum.textContent = n;
    } else {
      clearInterval(iv);
      countdownEl.style.display = 'none';
      beginSession(mode);
    }
  }, 700);
}

function beginSession(mode) {
  session = {
    mode,
    startTime: performance.now(),
    duration: settings.length * 1000,
    shots: 0,
    hits: 0,
    reactionTimes: [],
    score: 0,
    targets: [], // active target descriptors
    lastSpawn: 0,
    ended: false
  };
  hudHits.textContent = '0';
  hudAcc.textContent = '100%';
  hudScore.textContent = '0';

  if (mode === 'gridshot') initGridshot();
  else if (mode === 'tracking') initTracking();
  else if (mode === 'peek') initPeek();
  else if (mode === 'switch') initSwitch();

  rafId = requestAnimationFrame(gameLoop);
}

function gameLoop(now) {
  if (!session || session.ended) return;
  const elapsed = now - session.startTime;
  const remaining = Math.max(0, session.duration - elapsed);
  hudTime.textContent = (remaining / 1000).toFixed(1);

  if (session.mode === 'gridshot') tickGridshot(now);
  else if (session.mode === 'tracking') tickTracking(now);
  else if (session.mode === 'peek') tickPeek(now);
  else if (session.mode === 'switch') tickSwitch(now);

  if (remaining <= 0) {
    endSession();
    return;
  }
  rafId = requestAnimationFrame(gameLoop);
}

function endSession() {
  session.ended = true;
  cancelAnimationFrame(rafId);
  gameArea.querySelectorAll('.target, .wall').forEach(n => n.remove());

  const isTracking = session.mode === 'tracking';
  const acc = isTracking
    ? (session.trackingAccuracyPct || 0)
    : (session.shots > 0 ? Math.round((session.hits / session.shots) * 100) : 0);
  const avgReaction = session.reactionTimes.length
    ? session.reactionTimes.reduce((a, b) => a + b, 0) / session.reactionTimes.length
    : null;

  // persist stats — tracking mode doesn't have discrete shots, so it only contributes to sessions/score, not shots/hits accuracy
  stats.sessions++;
  if (!isTracking) {
    stats.totalShots += session.shots;
    stats.totalHits += session.hits;
  }
  let isNewBest = false;
  if (session.score > (stats.bestScores[session.mode] || 0)) {
    stats.bestScores[session.mode] = session.score;
    isNewBest = true;
  }
  if (avgReaction !== null && (stats.bestAvgReaction === null || avgReaction < stats.bestAvgReaction)) {
    stats.bestAvgReaction = avgReaction;
  }
  saveStats();
  refreshHeaderStats();

  document.getElementById('results-title').textContent = MODE_LABELS[session.mode];
  document.getElementById('res-score').textContent = session.score;
  document.getElementById('res-acc').textContent = acc + '%';
  document.getElementById('res-hits').textContent = isTracking ? 'N/A — continuous' : (session.hits + ' / ' + session.shots);
  document.getElementById('res-avg').textContent = avgReaction ? Math.round(avgReaction) + 'ms' : '—';
  document.getElementById('new-best-msg').style.display = isNewBest ? 'inline-block' : 'none';

  resultsEl.classList.add('active');
}

exitBtn.addEventListener('click', () => exitTrainer());
document.getElementById('back-to-menu').addEventListener('click', () => exitTrainer());
document.getElementById('retry-btn').addEventListener('click', () => {
  const mode = session.mode;
  resultsEl.classList.remove('active');
  gameArea.querySelectorAll('.target, .hit-mark, .miss-ring, .wall').forEach(n => n.remove());
  startCountdown(mode);
});

function exitTrainer() {
  if (session) session.ended = true;
  cancelAnimationFrame(rafId);
  gameArea.querySelectorAll('.target, .hit-mark, .miss-ring, .wall').forEach(n => n.remove());
  trainerEl.classList.remove('active');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeChPicker();
    if (trainerEl.classList.contains('active')) exitTrainer();
  }
});

// ---------- Helpers ----------
function rand(min, max) { return Math.random() * (max - min) + min; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function baseTargetSize() {
  return 50 * (settings.size / 100); // px diameter baseline
}

function spawnHitMark(x, y, text, color) {
  const el = document.createElement('div');
  el.className = 'hit-mark';
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  if (color) el.style.color = color;
  gameArea.appendChild(el);
  setTimeout(() => el.remove(), 600);
}

function getTargetHitValue(e, size) {
  const rect = e.target.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;
  const dist = Math.hypot(offsetX - rect.width / 2, offsetY - rect.height / 2);
  return dist <= size * 0.35 ? 10 : 5;
}

function spawnMissRing(x, y) {
  const el = document.createElement('div');
  el.className = 'miss-ring';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  gameArea.appendChild(el);
  setTimeout(() => el.remove(), 400);
}

function registerShot(hit, reactionMs, points = 10) {
  session.shots++;
  if (hit) {
    session.hits++;
    session.score += points;
    if (reactionMs !== undefined && reactionMs !== null) session.reactionTimes.push(reactionMs);
  }
  const acc = session.shots > 0 ? Math.round((session.hits / session.shots) * 100) : 100;
  hudHits.textContent = session.hits;
  hudAcc.textContent = acc + '%';
  hudScore.textContent = session.score;
}

// ===================================================================
// DRILL 01 — FLICKSHOT (gridshot)
// ===================================================================
function initGridshot() {
  spawnGridshotTarget();
}
function spawnGridshotTarget() {
  const size = baseTargetSize() * rand(0.85, 1.15);
  const rect = gameArea.getBoundingClientRect();
  const margin = size;
  const x = rand(margin, rect.width - margin);
  const y = rand(margin + 20, rect.height - margin);

  const el = document.createElement('div');
  el.className = 'target';
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  const spawnedAt = performance.now();
  el.dataset.spawnedAt = spawnedAt;

  el.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    if (session.ended) return;
    const reaction = performance.now() - parseFloat(el.dataset.spawnedAt);
    const points = getTargetHitValue(e, size);
    registerShot(true, reaction, points);
    spawnHitMark(x, y, '+' + points, 'var(--cyan)');
    el.classList.add('dying');
    setTimeout(() => el.remove(), 130);
    spawnGridshotTarget();
  });

  gameArea.appendChild(el);
}
function tickGridshot(now) { /* gridshot is click-driven, no per-frame spawn logic needed */ }

// global click-miss detector for gridshot/peek/switch (click on empty area = miss)
gameArea.addEventListener('mousedown', (e) => {
  if (!session || session.ended) return;
  if (e.target === gameArea || e.target.id === 'game-area') {
    if (session.mode === 'gridshot' || session.mode === 'switch' || session.mode === 'peek') {
      registerShot(false);
      spawnMissRing(e.clientX - gameArea.getBoundingClientRect().left, e.clientY - gameArea.getBoundingClientRect().top);
    }
  }
});

// ===================================================================
// DRILL 02 — TRACKING
// ===================================================================
function initTracking() {
  const rect = gameArea.getBoundingClientRect();
  const size = baseTargetSize() * 1.3;
  const el = document.createElement('div');
  el.className = 'target tracking';
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  gameArea.appendChild(el);

  session.trackEl = el;
  session.trackPos = { x: rect.width / 2, y: rect.height / 2 };
  session.trackVel = { x: rand(-1, 1), y: rand(-1, 1) };
  session.trackTimer = 0;
  session.lastTickTime = performance.now();
  session.underCrosshairMs = 0;
  session.totalTrackMs = 0;
  session.lastDirChange = 0;

  positionTrackingTarget();
}

function positionTrackingTarget() {
  const rect = gameArea.getBoundingClientRect();
  session.trackEl.style.left = session.trackPos.x + 'px';
  session.trackEl.style.top = session.trackPos.y + 'px';
}

function tickTracking(now) {
  const rect = gameArea.getBoundingClientRect();
  const dt = Math.min(32, now - session.lastTickTime);
  session.lastTickTime = now;

  // change direction periodically (strafe-like behavior)
  session.lastDirChange += dt;
  const changeInterval = 900 / (settings.speed / 100);
  if (session.lastDirChange > changeInterval) {
    session.lastDirChange = 0;
    session.trackVel = { x: rand(-1, 1), y: rand(-1, 1) };
  }

  const speedPxMs = 0.32 * (settings.speed / 100);
  const size = baseTargetSize() * 1.3;
  let nx = session.trackPos.x + session.trackVel.x * speedPxMs * dt;
  let ny = session.trackPos.y + session.trackVel.y * speedPxMs * dt;

  const margin = size;
  if (nx < margin || nx > rect.width - margin) { session.trackVel.x *= -1; nx = clamp(nx, margin, rect.width - margin); }
  if (ny < margin + 20 || ny > rect.height - margin) { session.trackVel.y *= -1; ny = clamp(ny, margin + 20, rect.height - margin); }

  session.trackPos = { x: nx, y: ny };
  positionTrackingTarget();

  // check if crosshair (mouse) is over the target
  const localX = mouseX - rect.left;
  const localY = mouseY - rect.top;
  const dist = Math.hypot(localX - nx, localY - ny);
  const radius = size / 2;
  session.totalTrackMs += dt;
  if (dist <= radius) {
    session.underCrosshairMs += dt;
    session.trackEl.style.boxShadow = '0 0 0 1px rgba(94,234,212,0.8) inset, 0 0 26px rgba(94,234,212,0.6)';
  } else {
    session.trackEl.style.boxShadow = '';
  }

  const liveAcc = session.totalTrackMs > 0 ? Math.round((session.underCrosshairMs / session.totalTrackMs) * 100) : 0;
  hudAcc.textContent = liveAcc + '%';
  session.score = liveAcc * 10;
  hudScore.textContent = session.score;
  session.trackingAccuracyPct = liveAcc; // displayed/stored separately from shots/hits model
  hudHits.textContent = liveAcc + '%';
}

// ===================================================================
// DRILL 03 — PEEK REACTION
// ===================================================================
function initPeek() {
  const rect = gameArea.getBoundingClientRect();
  // build two cover walls, left and right, with a lane between
  const leftWall = document.createElement('div');
  leftWall.className = 'wall';
  leftWall.style.left = '0px';
  const rightWall = document.createElement('div');
  rightWall.className = 'wall';
  rightWall.style.right = '0px';
  gameArea.appendChild(leftWall);
  gameArea.appendChild(rightWall);

  session.peekNextSpawn = performance.now() + rand(500, 1200);
  session.peekActive = null;
}

function spawnPeekTarget() {
  const rect = gameArea.getBoundingClientRect();
  const size = baseTargetSize();
  const fromLeft = Math.random() > 0.5;
  const isDecoy = Math.random() < 0.22; // some decoys to punish flinch-clicking
  const x = fromLeft ? rand(140, 280) : rand(rect.width - 280, rect.width - 140);
  const y = rand(100, rect.height - 100);

  const el = document.createElement('div');
  el.className = 'target' + (isDecoy ? ' decoy' : '');
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  const spawnedAt = performance.now();
  el.dataset.spawnedAt = spawnedAt;
  el.dataset.decoy = isDecoy ? '1' : '0';

  const lifeMs = rand(650, 1000) / (settings.speed / 100);

  const killTimer = setTimeout(() => {
    if (el.parentNode) {
      el.classList.add('dying');
      setTimeout(() => el.remove(), 130);
    }
    if (session && !session.ended) {
      session.peekActive = null;
      session.peekNextSpawn = performance.now() + rand(400, 1000);
    }
  }, lifeMs);

  el.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    if (session.ended) return;
    clearTimeout(killTimer);
    if (isDecoy) {
      // hitting a decoy counts as a shot+miss (penalize trigger discipline)
      registerShot(false);
      spawnHitMark(x, y, 'DECOY', '#FF3B3B');
    } else {
      const reaction = performance.now() - parseFloat(el.dataset.spawnedAt);
      const points = getTargetHitValue(e, size);
      registerShot(true, reaction, points);
      spawnHitMark(x, y, '+' + points, 'var(--cyan)');
    }
    el.classList.add('dying');
    setTimeout(() => el.remove(), 130);
    session.peekActive = null;
    session.peekNextSpawn = performance.now() + rand(400, 1000);
  });

  gameArea.appendChild(el);
  session.peekActive = el;
}

function tickPeek(now) {
  if (!session.peekActive && now >= session.peekNextSpawn) {
    spawnPeekTarget();
  }
}

// ===================================================================
// DRILL 04 — TARGET SWITCH (multiple targets at once)
// ===================================================================
function initSwitch() {
  session.switchTargets = [];
  session.switchNextSpawn = 0;
  session.switchMax = 3;
  for (let i = 0; i < 2; i++) spawnSwitchTarget();
}

function spawnSwitchTarget() {
  if (!session || session.ended) return;
  if (session.switchTargets.length >= session.switchMax) return;
  const rect = gameArea.getBoundingClientRect();
  const size = baseTargetSize() * rand(0.8, 1.1);
  const margin = size;
  let x, y, tries = 0;
  do {
    x = rand(margin, rect.width - margin);
    y = rand(margin + 20, rect.height - margin);
    tries++;
  } while (tries < 12 && session.switchTargets.some(t => Math.hypot(t.x - x, t.y - y) < size * 2.2));

  const el = document.createElement('div');
  el.className = 'target';
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  const spawnedAt = performance.now();
  el.dataset.spawnedAt = spawnedAt;

  const descriptor = { el, x, y };

  el.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    if (session.ended) return;
    const reaction = performance.now() - parseFloat(el.dataset.spawnedAt);
    const points = getTargetHitValue(e, size);
    registerShot(true, reaction, points);
    spawnHitMark(x, y, '+' + points, 'var(--cyan)');
    el.classList.add('dying');
    setTimeout(() => el.remove(), 130);
    session.switchTargets = session.switchTargets.filter(t => t !== descriptor);
    session.switchNextSpawn = performance.now() + rand(150, 350) / (settings.speed / 100);
  });

  gameArea.appendChild(el);
  session.switchTargets.push(descriptor);
}

function tickSwitch(now) {
  if (session.switchTargets.length < session.switchMax && now >= (session.switchNextSpawn || 0)) {
    spawnSwitchTarget();
  }
}
