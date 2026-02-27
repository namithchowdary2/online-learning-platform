/* =============================================================
   OCMS Frontend — main.js
   Fully connected to Django REST Backend
   ============================================================= */

const API = '';  // same-origin — Django serves both frontend & API

/* ════════════════════════════════════════════════════════════
   SOUND EFFECTS
   ════════════════════════════════════════════════════════════ */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;
function initAudio() { if (!audioCtx) { try { audioCtx = new AudioCtx(); } catch(e){} } }
function beep(freq=440, dur=0.1, type='sine', vol=0.05) {
  if (!audioCtx) return;
  try {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch(e) {}
}
function playClick()   { initAudio(); beep(800, 0.06, 'square', 0.04); }
function playSuccess() { initAudio(); beep(600,0.08); setTimeout(()=>beep(900,0.12),80); }
function playError()   { initAudio(); beep(200, 0.25, 'sawtooth', 0.05); }
function playHover()   { initAudio(); beep(1200, 0.04, 'sine', 0.02); }
document.addEventListener('click', ()=>initAudio(), {once:true});

/* ════════════════════════════════════════════════════════════
   CUSTOM CURSOR
   ════════════════════════════════════════════════════════════ */
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursor-trail');
let mx=0, my=0, tx=0, ty=0;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
(function animCursor() {
  tx += (mx-tx)*0.15; ty += (my-ty)*0.15;
  if (cursor) { cursor.style.left=mx+'px'; cursor.style.top=my+'px'; }
  if (cursorTrail) { cursorTrail.style.left=tx+'px'; cursorTrail.style.top=ty+'px'; }
  requestAnimationFrame(animCursor);
})();

/* ════════════════════════════════════════════════════════════
   PARTICLES
   ════════════════════════════════════════════════════════════ */
(function() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const c = canvas.getContext('2d');
  let W, H, pts=[];
  const resize = () => { W=canvas.width=innerWidth; H=canvas.height=innerHeight; };
  resize(); window.addEventListener('resize', resize);
  class P {
    constructor() { this.reset(); }
    reset() {
      this.x=Math.random()*W; this.y=Math.random()*H;
      this.s=Math.random()*2+0.3; this.sp=Math.random()*0.4+0.1;
      this.a=Math.random()*Math.PI*2; this.op=Math.random()*0.5+0.1;
      this.color=Math.random()>0.5?'#00f5d4':'#7b2fff';
    }
    update() {
      this.y-=this.sp; this.x+=Math.sin(this.a+Date.now()*0.001)*0.3;
      this.op-=0.001; if(this.y<-10||this.op<=0) this.reset();
    }
    draw() {
      c.beginPath(); c.arc(this.x,this.y,this.s,0,Math.PI*2);
      c.fillStyle=this.color; c.globalAlpha=this.op; c.fill(); c.globalAlpha=1;
    }
  }
  for(let i=0;i<120;i++) pts.push(new P());
  (function loop() { c.clearRect(0,0,W,H); pts.forEach(p=>{p.update();p.draw();}); requestAnimationFrame(loop); })();
})();

/* ════════════════════════════════════════════════════════════
   LOADING SCREEN
   ════════════════════════════════════════════════════════════ */
window.addEventListener('load', () => {
  setTimeout(() => {
    const ls = document.getElementById('loading-screen');
    if (ls) ls.classList.add('hidden');
    startCounters();
    attachHoverSounds();
  }, 2000);
});

/* ════════════════════════════════════════════════════════════
   ANIMATED COUNTERS
   ════════════════════════════════════════════════════════════ */
function startCounters() {
  document.querySelectorAll('[data-counter]').forEach(el => {
    const target = parseInt(el.getAttribute('data-counter'));
    let cur = 0;
    const step = Math.ceil(target/60);
    const t = setInterval(() => {
      cur = Math.min(cur+step, target);
      el.textContent = cur.toLocaleString() + (el.dataset.suffix||'');
      if (cur>=target) clearInterval(t);
    }, 25);
  });
}

/* ════════════════════════════════════════════════════════════
   HOVER SOUNDS
   ════════════════════════════════════════════════════════════ */
function attachHoverSounds() {
  document.querySelectorAll('button, a, .course-card, .filter-btn').forEach(el => {
    if (!el._hs) { el.addEventListener('mouseenter', playHover); el._hs=true; }
  });
}

/* ════════════════════════════════════════════════════════════
   PAGE NAVIGATION
   ════════════════════════════════════════════════════════════ */
function showPage(id) {
  const alreadyActive = document.getElementById(id)?.classList.contains('active');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page===id));
  const pg = document.getElementById(id);
  if (pg) { pg.classList.add('active'); window.scrollTo({top:0,behavior:'smooth'}); }
  playClick();
  // Load data only when first navigating to page (not if already active)
  if (id === 'dashboard-page' && !alreadyActive) { dashLoading = false; loadDashboard(); }
  if (id === 'analytics-page' && !alreadyActive) loadAnalytics();
}

/* ════════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
   ════════════════════════════════════════════════════════════ */
function toast(msg, type='info') {
  const icons = {success:'✅', error:'❌', info:'ℹ️', warn:'⚠️'};
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span>
    <span class="toast-msg">${msg}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>`;
  c.appendChild(t);
  setTimeout(()=>t.classList.add('show'), 10);
  if (type==='success') playSuccess(); else if (type==='error') playError();
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),500); }, 4000);
}

/* ════════════════════════════════════════════════════════════
   APP STATE
   ════════════════════════════════════════════════════════════ */
let allCourses = [];
let allCategories = [];
let currentCourse = null;
let currentUser = null;

// Load saved user session
try {
  const saved = localStorage.getItem('ocms_user');
  if (saved) { currentUser = JSON.parse(saved); updateNavAfterLogin(); }
} catch(e) {}

/* ════════════════════════════════════════════════════════════
   API FETCH HELPER
   ════════════════════════════════════════════════════════════ */
/* Get CSRF token from cookie (needed if CsrfViewMiddleware is active) */
function getCsrfToken() {
  const name = 'csrftoken';
  for (const c of document.cookie.split(';')) {
    const [k, v] = c.trim().split('=');
    if (k === name) return decodeURIComponent(v);
  }
  return '';
}

async function apiFetch(url, opts={}) {
  try {
    const isPost = opts.method && opts.method !== 'GET';
    const headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
    // Always include CSRF token on mutating requests — harmless if not needed
    if (isPost) {
      const csrf = getCsrfToken();
      if (csrf) headers['X-CSRFToken'] = csrf;
    }
    const resp = await fetch(API + url, {
      headers,
      ...opts   // caller can override headers if needed
    });
    const json = await resp.json().catch(() => null);
    if (!resp.ok) {
      return { __error: true, status: resp.status, error: (json && json.error) || `HTTP ${resp.status}` };
    }
    return json;
  } catch(e) {
    console.warn('[API Error]', url, e.message);
    return { __error: true, status: 0, error: 'Cannot reach server. Make sure Django is running.' };
  }
}

async function apiPost(url, data) {
  return await apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

function isErr(r) { return !r || r.__error === true; }

/* Fetch ALL pages of a paginated API */
async function fetchAll(endpoint) {
  let results = [], url = endpoint;
  while (url) {
    const data = await apiFetch(url);
    if (!data || data.__error) break;          // stop on error / network fail
    const items = data.results || (Array.isArray(data) ? data : []);
    results = [...results, ...items];
    if (data.next) {
      try { url = new URL(data.next).pathname + new URL(data.next).search; }
      catch(e) { url = data.next; }
    } else { url = null; }
  }
  return results;
}

/* ════════════════════════════════════════════════════════════
   COURSE VISUAL ASSETS (matched by title keyword)
   ════════════════════════════════════════════════════════════ */
const COURSE_ASSETS = {
  // ── Your 4 main courses ──────────────────────────────────
  // Python Basics — full freeCodeCamp Python tutorial
  python: {
    thumb: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&q=80',
    video: 'https://www.youtube.com/embed/_uQrJ0TkZlc',
    icon: '🐍', color: '#3572A5', tags: ['Programming', 'Backend'],
    desc: 'Learn Python from scratch — variables, loops, functions, OOP and projects.'
  },
  // Data Analytics — full freeCodeCamp Data Analysis tutorial
  'data analytics': {
    thumb: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    video: 'https://www.youtube.com/embed/r-uOLxNrNk8',
    icon: '📊', color: '#E97627', tags: ['Analytics', 'Data Science'],
    desc: 'Master data analysis with Python, Pandas, NumPy, Matplotlib and real datasets.'
  },
  // Web Development — full freeCodeCamp HTML CSS JS tutorial
  'web dev': {
    thumb: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80',
    video: 'https://www.youtube.com/embed/mU6anWqZJcc',
    icon: '🌐', color: '#F7DF1E', tags: ['Frontend', 'Full Stack'],
    desc: 'Build modern websites with HTML5, CSS3, JavaScript, React and Node.js.'
  },
  webdev: {
    thumb: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80',
    video: 'https://www.youtube.com/embed/mU6anWqZJcc',
    icon: '🌐', color: '#F7DF1E', tags: ['Frontend', 'Full Stack'],
    desc: 'Build modern websites with HTML5, CSS3, JavaScript, React and Node.js.'
  },
  // AI/ML — freeCodeCamp Machine Learning full course
  'ai/ml': {
    thumb: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
    video: 'https://www.youtube.com/embed/i_LwzRVP7bg',
    icon: '🤖', color: '#7b2fff', tags: ['AI', 'Machine Learning'],
    desc: 'Deep dive into ML algorithms, neural networks, TensorFlow and real AI projects.'
  },
  ai: {
    thumb: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
    video: 'https://www.youtube.com/embed/i_LwzRVP7bg',
    icon: '🤖', color: '#7b2fff', tags: ['AI', 'Machine Learning'],
    desc: 'Deep dive into ML algorithms, neural networks, TensorFlow and real AI projects.'
  },
  ml: {
    thumb: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
    video: 'https://www.youtube.com/embed/i_LwzRVP7bg',
    icon: '🤖', color: '#7b2fff', tags: ['AI', 'Machine Learning'],
    desc: 'Deep dive into ML algorithms, neural networks, TensorFlow and real AI projects.'
  },
  // ── Extra courses (auto-matched if you add more in DB) ───
  javascript: {
    thumb: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&q=80',
    video: 'https://www.youtube.com/embed/jS4aFq5-91M',
    icon: '⚡', color: '#F7DF1E', tags: ['JavaScript', 'Frontend'],
    desc: 'JavaScript from beginner to advanced — ES6+, DOM, async, fetch and projects.'
  },
  java: {
    thumb: 'https://images.unsplash.com/photo-1588239034647-25783cbfcfc1?w=600&q=80',
    video: 'https://www.youtube.com/embed/eIrMbAQSU34',
    icon: '☕', color: '#B07219', tags: ['Java', 'Backend'],
    desc: 'Java programming from basics to OOP, data structures and Spring Boot.'
  },
  react: {
    thumb: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
    video: 'https://www.youtube.com/embed/bMknfKXIFA8',
    icon: '⚛️', color: '#61DAFB', tags: ['React', 'Frontend'],
    desc: 'React from scratch — hooks, state, routing, Redux and full-stack apps.'
  },
  sql: {
    thumb: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&q=80',
    video: 'https://www.youtube.com/embed/HXV3zeQKqGY',
    icon: '🗄️', color: '#336791', tags: ['Database', 'SQL'],
    desc: 'SQL and database design — queries, joins, indexing and PostgreSQL.'
  },
  django: {
    thumb: 'https://images.unsplash.com/photo-1580894742597-87bc8789db3d?w=600&q=80',
    video: 'https://www.youtube.com/embed/F5mRW0jo-U4',
    icon: '🎸', color: '#0C4B33', tags: ['Django', 'Backend'],
    desc: 'Build web apps with Django — models, views, REST APIs and deployment.'
  },
  'machine learning': {
    thumb: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
    video: 'https://www.youtube.com/embed/i_LwzRVP7bg',
    icon: '🤖', color: '#7b2fff', tags: ['ML', 'AI'],
    desc: 'Machine learning algorithms, scikit-learn, model training and evaluation.'
  },
};

function getCourseAsset(title='') {
  const tl = title.toLowerCase();
  for (const [key, val] of Object.entries(COURSE_ASSETS)) {
    if (tl.includes(key)) return val;
  }
  return { thumb:'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&q=80', video:'https://www.youtube.com/embed/dQw4w9WgXcQ', icon:'📚', color:'#00f5d4', tags:['Education'] };
}

/* ════════════════════════════════════════════════════════════
   LOAD CATEGORIES from /categories/
   ════════════════════════════════════════════════════════════ */
async function loadCategories() {
  allCategories = await fetchAll('/api/categories/');
  renderCategoryFilters();
}

function renderCategoryFilters() {
  const wrap = document.getElementById('category-filters');
  if (!wrap) return;
  let html = `<button class="filter-btn active" onclick="filterCourses('all',this)">All Courses</button>`;
  allCategories.forEach(cat => {
    html += `<button class="filter-btn" onclick="filterCourses(${cat.id},this)">${cat.name}</button>`;
  });
  wrap.innerHTML = html;
  attachHoverSounds();
}

function filterCourses(catId, btn) {
  document.querySelectorAll('#category-filters .filter-btn').forEach(b=>b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const filtered = catId==='all' ? allCourses
    : allCourses.filter(c => c.category_id===catId || c.category_id===String(catId));
  renderCourseCards(filtered, 'courses-grid');
  playClick();
}

/* ════════════════════════════════════════════════════════════
   LOAD COURSES from /courses/
   ════════════════════════════════════════════════════════════ */
async function loadCourses() {
  const grid = document.getElementById('courses-grid');
  if (grid) grid.innerHTML = `<div class="loading-spinner"></div>`;

  allCourses = await fetchAll('/api/courses/');

  renderCourseCards(allCourses, 'courses-grid');
  renderCourseCards(allCourses.slice(0,4), 'home-courses-grid');

  // Update hero course counter
  const cc = document.getElementById('course-count');
  if (cc) cc.textContent = allCourses.length + '+';

  attachHoverSounds();
  setTimeout(observeElements, 200);
}

/* ════════════════════════════════════════════════════════════
   RENDER COURSE CARDS
   ════════════════════════════════════════════════════════════ */
function renderCourseCards(courses, gridId='courses-grid') {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  if (!courses || !courses.length) {
    grid.innerHTML = `<div class="no-results" style="grid-column:1/-1">
      <div class="no-results-icon">🔭</div>
      <p>No courses found yet. Add courses via Django Admin!</p>
    </div>`;
    return;
  }

  grid.innerHTML = courses.map(course => {
    const asset = getCourseAsset(course.title);
    const level = (course.level||'Beginner');
    const levelClass = level.toLowerCase().includes('adv') ? 'advanced'
                     : level.toLowerCase().includes('int') ? 'intermediate' : 'beginner';
    const price = course.price > 0 ? `₹${course.price}<span>/course</span>` : `<span style="color:var(--accent)">FREE</span>`;
    const rating = (4 + Math.random()).toFixed(1);
    const lessons = Math.floor(Math.random()*30+8);
    const hours = Math.floor(Math.random()*20+4);

    return `
    <div class="course-card" onclick="openCourseModal(${course.id})">
      <div class="course-thumb">
        <img src="${asset.thumb}" alt="${course.title}" loading="lazy"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="course-thumb-placeholder" style="display:none;background:linear-gradient(135deg,${asset.color}22,#0d1117aa)">
          <div class="course-thumb-icon">${asset.icon}</div>
          <div class="course-thumb-name">${course.title}</div>
        </div>
        <span class="course-level-badge level-${levelClass}">${level}</span>
        <button class="course-play-btn" onclick="event.stopPropagation();openVideoPlayer('${asset.video}','${course.title}')">▶</button>
      </div>
      <div class="course-body">
        <div class="course-category">${asset.tags[0]}</div>
        <div class="course-title">${course.title}</div>
        <div class="course-desc">${course.description || 'A comprehensive course designed to build real-world skills.'}</div>
        <div class="course-meta">
          <span>📖 ${lessons} lessons</span>
          <span>⏱ ${hours}h</span>
          <span>⭐ ${rating}</span>
        </div>
        <div class="course-footer">
          <div class="course-price">${price}</div>
          <button class="btn-enroll" onclick="event.stopPropagation();openEnrollModal(${course.id})">
            ${currentUser ? 'Enroll Now' : 'Enroll Now'}
          </button>
        </div>
      </div>
    </div>`;
  }).join('');

  attachHoverSounds();
  setTimeout(observeElements, 100);
}

/* ════════════════════════════════════════════════════════════
   COURSE SEARCH
   ════════════════════════════════════════════════════════════ */
function searchCourses(q) {
  // Always navigate to courses page so results are visible
  if (!document.getElementById('courses-page').classList.contains('active')) {
    showPage('courses-page');
  }
  const query = (q || '').toLowerCase().trim();
  if (!query) {
    renderCourseCards(allCourses, 'courses-grid');
    return;
  }
  const filtered = allCourses.filter(c =>
    c.title.toLowerCase().includes(query) ||
    (c.description || '').toLowerCase().includes(query) ||
    (c.level || '').toLowerCase().includes(query)
  );
  renderCourseCards(filtered, 'courses-grid');
  // Highlight count
  const grid = document.getElementById('courses-grid');
  if (grid && filtered.length === 0) {
    grid.innerHTML = `<div class="no-results" style="grid-column:1/-1">
      <div class="no-results-icon">🔭</div>
      <p>No courses found for "<strong style="color:var(--accent)">${q}</strong>"</p>
      <button class="btn-secondary" style="margin-top:1rem" onclick="searchCourses('')">Show all courses</button>
    </div>`;
  }
}

function sortCourses(val) {
  let sorted = [...allCourses];
  if (val==='price-asc')  sorted.sort((a,b)=>a.price-b.price);
  if (val==='price-desc') sorted.sort((a,b)=>b.price-a.price);
  if (val==='title')      sorted.sort((a,b)=>a.title.localeCompare(b.title));
  renderCourseCards(sorted, 'courses-grid');
}

/* ════════════════════════════════════════════════════════════
   COURSE DETAIL MODAL — loads modules + lectures from backend
   ════════════════════════════════════════════════════════════ */
async function openCourseModal(courseId) {
  const course = allCourses.find(c=>c.id===courseId);
  if (!course) return;
  currentCourse = course;
  const asset = getCourseAsset(course.title);
  playClick();

  const overlay = document.getElementById('course-modal');
  const level = course.level||'Beginner';
  const levelClass = level.toLowerCase().includes('adv') ? 'advanced'
                   : level.toLowerCase().includes('int') ? 'intermediate' : 'beginner';

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-header">
      <img class="modal-header-img" src="${asset.thumb}" alt="${course.title}"
           onerror="this.style.display='none'">
      <div class="modal-header-overlay"></div>
      <button class="modal-close" onclick="closeCourseModal()">✕</button>
    </div>
    <div class="modal-body">
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.75rem">
        ${asset.tags.map(t=>`<span class="badge badge-active">${t}</span>`).join('')}
        <span class="course-level-badge level-${levelClass}" style="position:static">${level}</span>
      </div>
      <div class="modal-title">${course.title}</div>
      <div class="modal-meta">
        <span>💰 ${course.price>0?'₹'+course.price:'FREE'}</span>
        <span>📅 ${new Date(course.created_at||Date.now()).toLocaleDateString()}</span>
        <span>⭐ ${(4+Math.random()).toFixed(1)} rating</span>
      </div>
      <div class="modal-desc">${course.description||'A comprehensive course to build real-world skills.'}</div>
      <div style="display:flex;gap:1rem;margin-bottom:2rem;flex-wrap:wrap">
        <button class="btn-primary" onclick="openEnrollModal(${course.id})" style="flex:1;min-width:160px">
          🚀 Enroll — ${course.price>0?'₹'+course.price:'FREE'}
        </button>
        <button class="btn-secondary" onclick="openVideoPlayer('${asset.video}','${course.title}')" style="padding:16px 24px">
          ▶ Preview
        </button>
      </div>
      <div class="modal-tabs">
        <div class="modal-tab active" onclick="switchModalTab(this,'tab-modules')">Modules</div>
        <div class="modal-tab" onclick="switchModalTab(this,'tab-reviews')">Reviews</div>
        <div class="modal-tab" onclick="switchModalTab(this,'tab-about')">About</div>
      </div>
      <div id="tab-modules" class="tab-content active">
        <div style="text-align:center;padding:2rem"><div class="loading-spinner"></div></div>
      </div>
      <div id="tab-reviews" class="tab-content">
        <div style="text-align:center;padding:2rem"><div class="loading-spinner"></div></div>
      </div>
      <div id="tab-about" class="tab-content">
        <div class="feature-card">
          <p style="color:var(--text-dim);line-height:1.8">${course.description||'Comprehensive course content.'}</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1.5rem">
            <div><div class="section-tag">Level</div><div style="font-weight:600">${level}</div></div>
            <div><div class="section-tag">Price</div><div style="font-weight:600;color:var(--accent)">${course.price>0?'₹'+course.price:'FREE'}</div></div>
          </div>
        </div>
      </div>
    </div>`;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Load real modules + lectures from backend
  loadModulesForCourse(course.id, asset);
  loadReviewsForModal(course.id, asset);
}

async function loadModulesForCourse(courseId, asset) {
  const container = document.getElementById('tab-modules');
  if (!container) return;

  // Fetch all modules and filter for this course
  const modules = await fetchAll('/api/modules/');
  const courseModules = modules.filter(m =>
    m.course_id === courseId || m.course_id === String(courseId)
  );

  // Fetch all lectures
  const lectures = await fetchAll('/api/lectures/');

  if (!courseModules.length) {
    // Show demo modules if backend has none for this course
    container.innerHTML = getDemoModulesHTML(asset);
    return;
  }

  container.innerHTML = courseModules.map((mod, i) => {
    const modLectures = lectures.filter(l =>
      l.module_id === mod.id || l.module_id === String(mod.id)
    );
    return `
    <div class="module-item" id="mod-${i}">
      <div class="module-header" onclick="toggleModule(${i})">
        <span class="module-name">📁 ${mod.title}</span>
        <span style="display:flex;gap:1rem;align-items:center">
          <span class="module-count">${modLectures.length} lectures</span>
          <span class="module-arrow">▼</span>
        </span>
      </div>
      <div class="module-lectures">
        ${modLectures.length ? modLectures.map(l => `
        <div class="lecture-item">
          <span class="lecture-icon">▶</span>
          <span class="lecture-name">${l.title}</span>
          <span class="lecture-duration">${l.duration||0}m</span>
          <button class="lecture-play" onclick="openVideoPlayer('${l.video_url||asset.video}','${l.title}')">Watch</button>
        </div>`).join('') : `<div style="padding:1rem 1.5rem;color:var(--text-muted);font-size:0.85rem">No lectures added yet.</div>`}
      </div>
    </div>`;
  }).join('');
  attachHoverSounds();
}

function getDemoModulesHTML(asset) {
  const sets = {
    '🐍': [['Introduction to Python', ['Setup & Installation','Variables & Data Types','Operators']],['Control Flow',['If/Else','Loops','Functions']],['OOP',['Classes','Inheritance','Special Methods']]],
    '📊': [['Data Fundamentals',['What is Analytics?','Data Types']],['Pandas & NumPy',['DataFrames','Data Cleaning','Aggregations']],['Visualization',['Matplotlib','Seaborn','Plotly']]],
    '🌐': [['HTML5',['Structure','Semantic Tags','Forms']],['CSS3',['Flexbox','Grid','Animations']],['JavaScript',['DOM','Events','Async JS']]],
    '🤖': [['ML Basics',['What is ML?','Types of Learning']],['Algorithms',['Linear Regression','Decision Trees','SVM']],['Neural Networks',['Perceptrons','Backpropagation','CNNs']]],
  };
  const mods = sets[asset.icon] || [['Getting Started',['Introduction','Setup']],['Core Concepts',['Fundamentals','Practice']],['Advanced',['Deep Dive','Project']]];
  return mods.map((m,i) => `
  <div class="module-item" id="mod-${i}">
    <div class="module-header" onclick="toggleModule(${i})">
      <span class="module-name">📁 ${m[0]}</span>
      <span style="display:flex;gap:1rem;align-items:center">
        <span class="module-count">${m[1].length} lectures</span>
        <span class="module-arrow">▼</span>
      </span>
    </div>
    <div class="module-lectures">
      ${m[1].map(l=>`
      <div class="lecture-item">
        <span class="lecture-icon">▶</span>
        <span class="lecture-name">${l}</span>
        <span class="lecture-duration">~10m</span>
        <button class="lecture-play" onclick="openVideoPlayer('${asset.video}','${l}')">Watch</button>
      </div>`).join('')}
    </div>
  </div>`).join('');
}

function toggleModule(i) {
  const m = document.getElementById('mod-'+i);
  if (m) { m.classList.toggle('open'); playClick(); }
}

function switchModalTab(btn, tabId) {
  document.querySelectorAll('.modal-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById(tabId);
  if (el) el.classList.add('active');
  playClick();
}

function closeCourseModal() {
  document.getElementById('course-modal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ════════════════════════════════════════════════════════════
   REVIEWS — load from /reviews/ and filter by course
   ════════════════════════════════════════════════════════════ */
async function loadReviewsForModal(courseId, asset) {
  const container = document.getElementById('tab-reviews');
  if (!container) return;

  const reviews = await fetchAll('/api/reviews/');
  const courseReviews = reviews.filter(r =>
    r.course_id===courseId || r.course_id===String(courseId)
  );

  const demoReviews = [
    {name:'Rahul S.', rating:5, comment:'Completely transformed my skills. Highly recommend!'},
    {name:'Priya M.', rating:5, comment:'Best course I have taken. Crystal clear explanations.'},
    {name:'Arjun K.', rating:4, comment:'Excellent projects and very supportive content.'},
  ];
  const toShow = courseReviews.length ? courseReviews : demoReviews;

  container.innerHTML = `
    <div class="review-form-card">
      <div class="review-form-title">✍️ Write a Review</div>
      <div class="star-picker" id="star-picker">
        ${[1,2,3,4,5].map(n=>`<span class="star-pick" data-val="${n}" onclick="pickStar(${n})">☆</span>`).join('')}
      </div>
      <textarea class="review-textarea" id="review-text" placeholder="Share your experience..."></textarea>
      <div style="margin-top:1rem">
        <button class="btn-primary" onclick="submitReview(${courseId})" style="padding:10px 24px">
          Submit Review
        </button>
      </div>
    </div>
    <div class="reviews-grid">
      ${toShow.map(r=>`
      <div class="review-card">
        <div class="review-quote">"</div>
        <div class="review-text">${r.comment||r.text||'Great course!'}</div>
        <div class="review-stars">${'★'.repeat(r.rating||5)}${'☆'.repeat(5-(r.rating||5))}</div>
        <div class="review-user">
          <div class="review-avatar">${(r.name||'S')[0].toUpperCase()}</div>
          <div><div class="review-name">${r.name||'Student'}</div><div class="review-course">Verified Student</div></div>
        </div>
      </div>`).join('')}
    </div>`;
}

let selectedStar = 0;
function pickStar(n) {
  selectedStar = n;
  document.querySelectorAll('.star-pick').forEach((s,i)=>{
    s.textContent = i<n ? '★' : '☆';
    s.classList.toggle('active', i<n);
  });
  playClick();
}

async function submitReview(courseId) {
  if (!currentUser) { toast('Please login to submit a review', 'warn'); openAuth('login'); return; }
  const text = document.getElementById('review-text').value.trim();
  if (!text || selectedStar===0) { toast('Please add a star rating and write a review', 'warn'); return; }

  const result = await apiPost('/api/reviews/', {
    student_id: currentUser.id,
    course_id: courseId,
    rating: selectedStar,
    comment: text
  });

  if (result && result.id) {
    toast('Review submitted successfully! 🌟', 'success');
    loadReviewsForModal(courseId, getCourseAsset(currentCourse.title));
  } else {
    toast('Could not submit review. Make sure you are enrolled.', 'error');
  }
  document.getElementById('review-text').value = '';
  selectedStar = 0;
  document.querySelectorAll('.star-pick').forEach(s=>s.textContent='☆');
}

/* ════════════════════════════════════════════════════════════
   VIDEO PLAYER MODAL
   ════════════════════════════════════════════════════════════ */
/* Current video state */
let currentVideoUrl = '';

function openVideoPlayer(videoUrl, title) {
  let embed = videoUrl || '';

  // Convert any youtube.com/watch?v= to embed URL
  if (embed.includes('youtube.com/watch')) {
    try { embed = 'https://www.youtube.com/embed/' + new URLSearchParams(new URL(embed).search).get('v'); }
    catch(e) {}
  }
  // If it's already an embed URL, keep as-is
  // Add params: autoplay, no related videos, modestbranding, in-app controls
  const sep = embed.includes('?') ? '&' : '?';
  const finalUrl = embed + sep + 'autoplay=1&rel=0&modestbranding=1&showinfo=0&fs=1&color=white';

  // YouTube error 153 fix: remove autoplay, add origin
  // autoplay=1 is blocked on localhost embeds — use the play button inside the player instead
  const sep2 = embed.includes('?') ? '&' : '?';
  const safeUrl = embed + sep2 + 'rel=0&modestbranding=1&showinfo=0&fs=1&enablejsapi=1';

  currentVideoUrl = safeUrl;
  document.getElementById('video-title').textContent = title || 'Course Preview';
  document.getElementById('video-iframe').src = safeUrl;
  document.getElementById('video-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  playClick();
}

function closeVideoPlayer() {
  document.getElementById('video-modal').classList.remove('open');
  document.getElementById('video-iframe').src = '';  // stop playback
  currentVideoUrl = '';
  document.body.style.overflow = '';
}

function reloadVideo() {
  if (currentVideoUrl) {
    document.getElementById('video-iframe').src = '';
    setTimeout(() => { document.getElementById('video-iframe').src = currentVideoUrl; }, 100);
  }
}

async function togglePiP() {
  const iframe = document.getElementById('video-iframe');
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (iframe.contentWindow) {
      toast('Picture-in-Picture works best in Chrome. The video continues playing here.', 'info');
    }
  } catch(e) {
    toast('Use the YouTube fullscreen button inside the player for best experience.', 'info');
  }
}

/* ════════════════════════════════════════════════════════════
   ENROLL MODAL — POSTs to /enrollments/
   Requires student_id (user) and course_id
   ════════════════════════════════════════════════════════════ */
function openEnrollModal(courseId) {
  const course = allCourses.find(c=>c.id===courseId);
  if (!course) return;
  currentCourse = course;

  // Pre-fill if user is logged in
  if (currentUser) {
    const nameEl = document.getElementById('enroll-name');
    const emailEl = document.getElementById('enroll-email');
    if (nameEl) nameEl.value = currentUser.full_name||'';
    if (emailEl) emailEl.value = currentUser.email||'';
  }

  document.getElementById('enroll-course-name').textContent = `Enrolling in: ${course.title}`;
  document.getElementById('enroll-price').textContent = course.price>0 ? `₹${course.price}` : 'FREE';
  document.getElementById('enroll-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  playClick();
}

function closeEnrollModal() {
  document.getElementById('enroll-modal').classList.remove('open');
  document.body.style.overflow = '';
}

async function submitEnrollment() {
  const name  = document.getElementById('enroll-name').value.trim();
  const email = document.getElementById('enroll-email').value.trim();
  if (!name||!email) { toast('Please fill all fields', 'warn'); return; }
  if (!email.includes('@')) { toast('Invalid email address', 'error'); return; }

  const btn = document.querySelector('#enroll-modal .btn-enroll-submit');
  const orig = btn.textContent;
  btn.textContent = '⏳ Processing...';
  btn.disabled = true;

  let userId = currentUser ? currentUser.id : null;

  // If not logged in, find or create user in backend
  if (!userId) {
    // Try to find user by email
    const users = await fetchAll('/api/accounts/users/');
    const existing = users.find(u=>u.email===email);
    if (existing) {
      userId = existing.id;
    } else {
      // Create new user
      const newUser = await apiPost('/api/accounts/users/', {
        email, full_name: name, password: 'ocms_auto_'+Date.now(), role:'student', is_active:true
      });
      if (newUser && newUser.id) userId = newUser.id;
    }
  }

  if (!userId) {
    toast('Could not create user account. Please register first.', 'error');
    btn.textContent = orig; btn.disabled = false;
    return;
  }

  // POST to /enrollments/
  const result = await apiPost('/api/enrollments/', {
    student_id: userId,
    course_id: currentCourse.id,
    status: 'active'
  });

  btn.textContent = orig; btn.disabled = false;

  if (result && result.id) {
    toast(`🎉 Successfully enrolled in "${currentCourse.title}"!`, 'success');
    closeEnrollModal();
    closeCourseModal();
    // Refresh dashboard if open
    if (document.getElementById('dashboard-page').classList.contains('active')) loadDashboard();
  } else {
    // Already enrolled or other error
    toast(`You may already be enrolled in "${currentCourse.title}". Check Dashboard.`, 'info');
    closeEnrollModal();
  }
}

/* ════════════════════════════════════════════════════════════
   AUTH — Login via /login/, Register via /register/
   ════════════════════════════════════════════════════════════ */
function openAuth(tab='login') {
  document.getElementById('auth-page').classList.add('open');
  switchAuthTab(tab);
  document.body.style.overflow = 'hidden';
  playClick();
}

function closeAuth() {
  document.getElementById('auth-page').classList.remove('open');
  document.body.style.overflow = '';
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===tab));
  document.querySelectorAll('.auth-form').forEach(f=>f.classList.toggle('active', f.id==='form-'+tab));
}

async function submitLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email||!password) { toast('Enter your email and password', 'warn'); return; }

  const btn = document.getElementById('login-btn');
  btn.textContent = '⏳ Signing in...'; btn.disabled = true;

  const result = await apiPost('/api/accounts/login/', { email, password });

  btn.textContent = 'Sign In'; btn.disabled = false;

  if (result && !result.__error && result.success && result.user) {
    currentUser = result.user;
    localStorage.setItem('ocms_user', JSON.stringify(currentUser));
    toast('👋 Welcome back, ' + (currentUser.full_name || currentUser.email) + '!', 'success');
    closeAuth();
    updateNavAfterLogin();
  } else {
    // Show exact error from backend
    toast(result && result.error ? result.error : 'Cannot connect to server. Is Django running?', 'error');
  }
}

async function submitRegister() {
  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const role     = document.getElementById('reg-role').value;
  if (!name||!email||!password) { toast('Please fill all fields', 'warn'); return; }
  if (password.length < 4)      { toast('Password must be at least 4 characters', 'warn'); return; }

  const btn = document.getElementById('reg-btn');
  btn.textContent = '⏳ Creating...'; btn.disabled = true;

  const result = await apiPost('/api/accounts/register/', {
    full_name: name, email, password, role, is_active: true
  });

  btn.textContent = 'Create Account'; btn.disabled = false;

  if (result && !result.__error && result.success && result.user) {
    currentUser = result.user;
    localStorage.setItem('ocms_user', JSON.stringify(currentUser));
    toast('🎉 Account created! Welcome, ' + name + '!', 'success');
    closeAuth();
    updateNavAfterLogin();
  } else {
    // Show exact backend error message
    const errMsg = (result && result.error) ? result.error : 'Registration failed. Please try again.';
    toast(errMsg, 'error');
  }
}

function updateNavAfterLogin() {
  const btnLogin    = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');
  const userMenu    = document.getElementById('user-menu');
  if (btnLogin)    btnLogin.style.display    = 'none';
  if (btnRegister) btnRegister.style.display = 'none';
  if (userMenu) {
    userMenu.style.display = 'flex';
    userMenu.innerHTML = `
      <span style="font-size:0.85rem;color:var(--text-dim);padding:0 8px">
        👤 ${currentUser.full_name||currentUser.email}
      </span>
      <button class="btn-nav btn-nav-outline" onclick="logout()">Logout</button>`;
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('ocms_user');
  const btnLogin    = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');
  const userMenu    = document.getElementById('user-menu');
  if (btnLogin)    btnLogin.style.display    = '';
  if (btnRegister) btnRegister.style.display = '';
  if (userMenu)  { userMenu.style.display = 'none'; userMenu.innerHTML=''; }
  toast('Logged out successfully', 'info');
  showPage('home-page');
}

/* ════════════════════════════════════════════════════════════
   DASHBOARD — insane charts edition
   ════════════════════════════════════════════════════════════ */

// Store chart instances so we can destroy/recreate
let dashCharts = {};
let dashLoading = false;  // prevent double-load blinking

function destroyChart(id) {
  if (dashCharts[id]) { dashCharts[id].destroy(); delete dashCharts[id]; }
}

// Chart.js default overrides for dark theme
function chartDefaults() {
  if (!window.Chart) return;
  Chart.defaults.color = '#64748b';
  Chart.defaults.borderColor = 'rgba(0,245,212,0.08)';
  Chart.defaults.font.family = "'Rajdhani', sans-serif";
  Chart.defaults.animation = { duration: 800, easing: 'easeInOutQuart' };
  Chart.defaults.transitions = { active: { animation: { duration: 200 } } };
}

async function loadDashboard() {
  if (dashLoading) return;  // prevent double render / blinking
  dashLoading = true;
  chartDefaults();

  // Parallel fetch everything
  const [enrollments, reviews, users] = await Promise.all([
    fetchAll('/api/enrollments/'),
    fetchAll('/api/reviews/'),
    fetchAll('/api/accounts/users/'),
  ]);

  // ── KPI Stat Cards ─────────────────────────────────────────
  const statsEl = document.getElementById('dashboard-stats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="kpi-card kpi-teal">
        <div class="kpi-bg-icon">📚</div>
        <div class="kpi-icon">📚</div>
        <div class="kpi-value" style="color:var(--accent)">${allCourses.length}</div>
        <div class="kpi-label">Total Courses</div>
        <div class="kpi-trend">▲ Active catalog</div>
      </div>
      <div class="kpi-card kpi-purple">
        <div class="kpi-bg-icon">👥</div>
        <div class="kpi-icon">👥</div>
        <div class="kpi-value" style="color:var(--accent2)">${users.length}</div>
        <div class="kpi-label">Registered Users</div>
        <div class="kpi-trend">▲ Growing community</div>
      </div>
      <div class="kpi-card kpi-gold">
        <div class="kpi-bg-icon">📝</div>
        <div class="kpi-icon">📝</div>
        <div class="kpi-value" style="color:var(--gold)">${enrollments.length}</div>
        <div class="kpi-label">Total Enrollments</div>
        <div class="kpi-trend">▲ Active learners</div>
      </div>
      <div class="kpi-card kpi-orange">
        <div class="kpi-bg-icon">⭐</div>
        <div class="kpi-icon">⭐</div>
        <div class="kpi-value" style="color:var(--accent3)">${reviews.length}</div>
        <div class="kpi-label">Reviews Submitted</div>
        <div class="kpi-trend">▲ Student feedback</div>
      </div>`;
  }

  // ── Chart 1: Enrollments per course — Line/Bar ─────────────
  destroyChart('enrollments');
  const ctxEnroll = document.getElementById('chart-enrollments');
  if (ctxEnroll && window.Chart) {
    const courseLabels = allCourses.map(c => c.title.length > 14 ? c.title.slice(0,14)+'…' : c.title);
    const enrollCounts = allCourses.map(c =>
      enrollments.filter(e => String(e.course_id) === String(c.id)).length
    );
    // If no real data, generate demo counts
    const finalCounts = enrollCounts.every(v=>v===0)
      ? allCourses.map((_,i) => [42,78,31,65,19,88][i] || Math.floor(Math.random()*80+10))
      : enrollCounts;

    dashCharts['enrollments'] = new Chart(ctxEnroll, {
      type: 'bar',
      data: {
        labels: courseLabels,
        datasets: [{
          label: 'Enrollments',
          data: finalCounts,
          backgroundColor: [
            'rgba(0,245,212,0.7)',
            'rgba(123,47,255,0.7)',
            'rgba(255,107,53,0.7)',
            'rgba(255,215,0,0.7)',
            'rgba(0,245,212,0.5)',
            'rgba(123,47,255,0.5)',
          ],
          borderColor: [
            'rgba(0,245,212,1)',
            'rgba(123,47,255,1)',
            'rgba(255,107,53,1)',
            'rgba(255,215,0,1)',
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f1623',
            borderColor: 'rgba(0,245,212,0.3)',
            borderWidth: 1,
            titleColor: '#00f5d4',
            bodyColor: '#94a3b8',
            callbacks: {
              label: ctx => ` ${ctx.raw} students enrolled`
            }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(0,245,212,0.05)' }, ticks: { color: '#64748b' } },
          y: { grid: { color: 'rgba(0,245,212,0.05)' }, ticks: { color: '#64748b', stepSize: 1 }, beginAtZero: true }
        }
      }
    });
  }

  // ── Chart 2: Course distribution — Doughnut ────────────────
  destroyChart('courses');
  const ctxCourses = document.getElementById('chart-courses');
  if (ctxCourses && window.Chart && allCourses.length) {
    const colors = ['#00f5d4','#7b2fff','#ff6b35','#ffd700','#00bcd4','#e91e63'];
    dashCharts['courses'] = new Chart(ctxCourses, {
      type: 'doughnut',
      data: {
        labels: allCourses.map(c => c.title),
        datasets: [{
          data: allCourses.map(c =>
            enrollments.filter(e=>String(e.course_id)===String(c.id)).length || Math.floor(Math.random()*50+10)
          ),
          backgroundColor: colors.map(c => c + 'cc'),
          borderColor: colors,
          borderWidth: 2,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f1623',
            borderColor: 'rgba(0,245,212,0.3)',
            borderWidth: 1,
            titleColor: '#00f5d4',
            bodyColor: '#94a3b8',
          }
        }
      }
    });
    // Custom legend
    const legend = document.getElementById('chart-courses-legend');
    if (legend) {
      legend.innerHTML = allCourses.slice(0,6).map((c,i) => `
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:10px;height:10px;border-radius:50%;background:${colors[i]};flex-shrink:0"></div>
          <span style="color:var(--text-dim);font-size:0.78rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.title}</span>
        </div>`).join('');
    }
  }

  // ── Chart 3: Revenue by course — Horizontal Bar ───────────
  destroyChart('revenue');
  const ctxRev = document.getElementById('chart-revenue');
  if (ctxRev && window.Chart) {
    const prices = allCourses.map(c => parseFloat(c.price)||0);
    const enrollByC = allCourses.map(c =>
      enrollments.filter(e=>String(e.course_id)===String(c.id)).length || Math.floor(Math.random()*40+5)
    );
    const revenue = prices.map((p,i) => p * enrollByC[i] || (enrollByC[i] * 999));
    dashCharts['revenue'] = new Chart(ctxRev, {
      type: 'bar',
      data: {
        labels: allCourses.map(c => c.title.slice(0,12)+'…'),
        datasets: [{
          label: '₹ Revenue',
          data: revenue,
          backgroundColor: 'rgba(255,215,0,0.7)',
          borderColor: '#ffd700',
          borderWidth: 2,
          borderRadius: 6,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f1623',
            borderColor: 'rgba(255,215,0,0.3)',
            borderWidth: 1,
            titleColor: '#ffd700',
            bodyColor: '#94a3b8',
            callbacks: { label: ctx => ` ₹${ctx.raw.toLocaleString()}` }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255,215,0,0.05)' }, ticks: { color: '#64748b', callback: v => '₹'+v } },
          y: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } }
        }
      }
    });
  }

  // ── Chart 4: Rating distribution — Bar ────────────────────
  destroyChart('ratings');
  const ctxRatings = document.getElementById('chart-ratings');
  if (ctxRatings && window.Chart) {
    const ratingCounts = [5,4,3,2,1].map(star =>
      reviews.filter(r => r.rating === star || r.rating === String(star)).length ||
      [18,9,4,2,1][5-star]
    );
    dashCharts['ratings'] = new Chart(ctxRatings, {
      type: 'bar',
      data: {
        labels: ['5★','4★','3★','2★','1★'],
        datasets: [{
          data: ratingCounts,
          backgroundColor: ['#00f5d4cc','#7b2fffcc','#ff6b35cc','#ffd700cc','#ef4444cc'],
          borderColor:     ['#00f5d4','#7b2fff','#ff6b35','#ffd700','#ef4444'],
          borderWidth: 2,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false },
          tooltip: { backgroundColor:'#0f1623', borderColor:'rgba(0,245,212,0.3)', borderWidth:1, titleColor:'#00f5d4', bodyColor:'#94a3b8' }
        },
        scales: {
          x: { grid: { color: 'rgba(0,245,212,0.05)' }, ticks: { color: '#64748b' }, beginAtZero: true },
          y: { grid: { display: false }, ticks: { color: '#ffd700', font: { size: 13, weight: 'bold' } } }
        }
      }
    });
  }

  // ── Chart 5: Radar — Platform Health ──────────────────────
  destroyChart('radar');
  const ctxRadar = document.getElementById('chart-radar');
  if (ctxRadar && window.Chart) {
    const total = Math.max(users.length, 1);
    const radarData = [
      Math.min(100, Math.round((allCourses.length / 10) * 100)),
      Math.min(100, Math.round((users.length / 20) * 100)),
      Math.min(100, Math.round((enrollments.length / 50) * 100)),
      Math.min(100, Math.round((reviews.length / 30) * 100)),
      reviews.length ? Math.round((reviews.filter(r=>r.rating>=4).length/reviews.length)*100) : 75,
      Math.min(100, Math.round((enrollments.length / Math.max(users.length,1)) * 100)),
    ];
    dashCharts['radar'] = new Chart(ctxRadar, {
      type: 'radar',
      data: {
        labels: ['Courses','Users','Enrollments','Reviews','Satisfaction','Engagement'],
        datasets: [{
          label: 'Platform Score',
          data: radarData,
          backgroundColor: 'rgba(0,245,212,0.12)',
          borderColor: '#00f5d4',
          borderWidth: 2,
          pointBackgroundColor: '#00f5d4',
          pointBorderColor: '#030712',
          pointBorderWidth: 2,
          pointRadius: 5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false },
          tooltip: { backgroundColor:'#0f1623', borderColor:'rgba(0,245,212,0.3)', borderWidth:1, titleColor:'#00f5d4', bodyColor:'#94a3b8',
            callbacks: { label: ctx => ` Score: ${ctx.raw}/100` }
          }
        },
        scales: {
          r: {
            min: 0, max: 100,
            grid:      { color: 'rgba(0,245,212,0.1)' },
            angleLines:{ color: 'rgba(0,245,212,0.15)' },
            pointLabels:{ color: '#94a3b8', font: { size: 11 } },
            ticks:     { display: false, stepSize: 25 }
          }
        }
      }
    });
  }

  // ── My Course Progress ─────────────────────────────────────
  let myEnrolls = enrollments;
  if (currentUser) {
    myEnrolls = enrollments.filter(e =>
      String(e.student_id) === String(currentUser.id)
    );
  }
  const progressEl = document.getElementById('course-progress');
  if (progressEl) {
    const myCoursesIds = myEnrolls.map(e => String(e.course_id));
    const myCourses = allCourses.filter(c => myCoursesIds.includes(String(c.id)));
    const displayCourses = myCourses.length ? myCourses : allCourses.slice(0,5);

    progressEl.innerHTML = displayCourses.slice(0,6).map(c => {
      const enroll = myEnrolls.find(e => String(e.course_id)===String(c.id));
      const pct = enroll
        ? (enroll.status==='completed' ? 100 : Math.floor(Math.random()*75+15))
        : Math.floor(Math.random()*40+5);
      const asset = getCourseAsset(c.title);
      const barColor = pct>75 ? '#00f5d4' : pct>40 ? '#7b2fff' : '#ff6b35';
      return `
      <div style="display:flex;align-items:center;gap:1rem;padding:0.875rem 0;border-bottom:1px solid rgba(0,245,212,0.06)">
        <div style="font-size:1.75rem;flex-shrink:0;width:40px;text-align:center">${asset.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:0.88rem;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.title}</div>
          <div style="background:rgba(255,255,255,0.05);border-radius:999px;height:6px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${barColor};border-radius:999px;box-shadow:0 0 8px ${barColor};transition:width 1s ease"></div>
          </div>
        </div>
        <div style="font-family:var(--font-mono);font-size:0.85rem;color:${barColor};font-weight:700;flex-shrink:0;width:40px;text-align:right">${pct}%</div>
      </div>`;
    }).join('') ||
    `<div style="padding:2rem;text-align:center;color:var(--text-muted)">
      No enrollments yet. <a onclick="showPage('courses-page')" style="color:var(--accent);cursor:none">Browse courses →</a>
    </div>`;
  }

  // ── Recent Enrollments Table ───────────────────────────────
  const tableEl = document.getElementById('enrollment-table');
  dashLoading = false;  // allow next refresh

  if (tableEl) {
    const rows = enrollments.slice(0,12);
    tableEl.innerHTML = rows.length ? `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:0.83rem">
          <thead>
            <tr style="border-bottom:1px solid rgba(0,245,212,0.1)">
              <th style="text-align:left;padding:8px 6px;color:var(--text-muted);font-weight:600;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.06em">#</th>
              <th style="text-align:left;padding:8px 6px;color:var(--text-muted);font-weight:600;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.06em">Course</th>
              <th style="text-align:left;padding:8px 6px;color:var(--text-muted);font-weight:600;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.06em">Status</th>
              <th style="text-align:left;padding:8px 6px;color:var(--text-muted);font-weight:600;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.06em">Date</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((e,i) => {
              const course = allCourses.find(c=>String(c.id)===String(e.course_id));
              const status = e.status || 'active';
              const statusColor = status==='completed' ? '#00f5d4' : status==='pending' ? '#ffd700' : '#7b2fff';
              return `<tr style="border-bottom:1px solid rgba(255,255,255,0.03)">
                <td style="padding:8px 6px;color:var(--text-muted)">${i+1}</td>
                <td style="padding:8px 6px;font-weight:600;color:var(--text-primary)">${course ? course.title : 'Course #'+e.course_id}</td>
                <td style="padding:8px 6px">
                  <span style="background:${statusColor}22;color:${statusColor};border:1px solid ${statusColor}44;padding:2px 10px;border-radius:20px;font-size:0.75rem;font-family:var(--font-mono)">${status}</span>
                </td>
                <td style="padding:8px 6px;color:var(--text-muted);font-family:var(--font-mono);font-size:0.75rem">${new Date(e.created_at||Date.now()).toLocaleDateString()}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>` :
      `<div style="padding:2rem;text-align:center;color:var(--text-muted)">No enrollments yet.</div>`;
  }
}
/* ════════════════════════════════════════════════════════════
   ANALYTICS — live from /analytics/
   ════════════════════════════════════════════════════════════ */
async function loadAnalytics() {
  const data = await apiFetch('/api/analytics/');
  const el = document.getElementById('analytics-data');
  if (!el) return;

  if (data) {
    // Update stat cards
    if (document.getElementById('an-courses')) document.getElementById('an-courses').textContent = data.total_courses||0;
    if (document.getElementById('an-users'))   document.getElementById('an-users').textContent   = data.total_users||0;
    if (document.getElementById('an-enroll'))  document.getElementById('an-enroll').textContent  = data.total_enrollments||0;
    if (document.getElementById('an-reviews')) document.getElementById('an-reviews').textContent = data.total_reviews||0;

    el.innerHTML = `<pre style="font-family:var(--font-mono);font-size:0.85rem;color:var(--accent);background:var(--bg-secondary);padding:1.5rem;border-radius:var(--radius);overflow:auto;white-space:pre-wrap;border:1px solid var(--border)">${JSON.stringify(data, null, 2)}</pre>`;
  } else {
    el.innerHTML = `<div class="no-results">
      <div class="no-results-icon">📊</div>
      <p>Analytics unavailable. Make sure Django server is running at localhost:8000</p>
    </div>`;
  }
}

/* ════════════════════════════════════════════════════════════
   HOME REVIEWS — from /reviews/
   ════════════════════════════════════════════════════════════ */
async function loadHomeReviews() {
  const el = document.getElementById('home-reviews-grid');
  if (!el) return;

  const reviews = await fetchAll('/api/reviews/');
  const demo = [
    {name:'Sneha R.',  course:'Python Basics',    rating:5, comment:'Best Python course! Got a job offer in 3 months.'},
    {name:'Karan P.',  course:'AI/ML',            rating:5, comment:'Mind-blowing neural network content. Very practical.'},
    {name:'Divya M.',  course:'Web Dev',          rating:5, comment:'Built my first full-stack app in 2 weeks!'},
    {name:'Aditya K.', course:'Data Analytics',   rating:4, comment:'Pandas and visualization modules are top-notch.'},
    {name:'Meera V.',  course:'Python Basics',    rating:5, comment:'Step-by-step and crystal clear. Perfect for beginners.'},
    {name:'Rohan T.',  course:'AI/ML',            rating:5, comment:'The deep learning section alone is worth it!'},
  ];
  const toShow = reviews.length >= 3 ? reviews.slice(0,6) : demo;

  el.innerHTML = toShow.map(r=>`
    <div class="review-card">
      <div class="review-quote">"</div>
      <div class="review-text">${r.comment||r.text||'Great course!'}</div>
      <div class="review-stars">${'★'.repeat(r.rating||5)}${'☆'.repeat(5-(r.rating||5))}</div>
      <div class="review-user">
        <div class="review-avatar">${(r.name||'S')[0].toUpperCase()}</div>
        <div><div class="review-name">${r.name||'Student'}</div>
        <div class="review-course">${r.course||'Verified Student'}</div></div>
      </div>
    </div>`).join('');
}

/* ════════════════════════════════════════════════════════════
   MODAL CLOSE ON OVERLAY CLICK & KEYBOARD
   ════════════════════════════════════════════════════════════ */
document.addEventListener('click', e => {
  if (e.target.id==='course-modal') closeCourseModal();
  if (e.target.id==='video-modal')  closeVideoPlayer();
  if (e.target.id==='enroll-modal') closeEnrollModal();
  if (e.target.id==='auth-page')    closeAuth();
});
document.addEventListener('keydown', e => {
  if (e.key==='Escape') { closeCourseModal(); closeVideoPlayer(); closeEnrollModal(); closeAuth(); }
});

/* ════════════════════════════════════════════════════════════
   SEARCH INPUT EVENTS
   ════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const si = document.getElementById('course-search');
  if (si) si.addEventListener('input', e=>searchCourses(e.target.value));

  const ns = document.getElementById('nav-search-input');
  if (ns) {
    ns.addEventListener('keydown', e=>{
      if (e.key==='Enter') {
        showPage('courses-page');
        const cs = document.getElementById('course-search');
        if (cs) cs.value = e.target.value;
        searchCourses(e.target.value);
      }
    });
  }
});

/* ════════════════════════════════════════════════════════════
   SCROLL ANIMATIONS
   ════════════════════════════════════════════════════════════ */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity='1';
      e.target.style.transform='translateY(0)';
    }
  });
}, { threshold: 0.1 });

function observeElements() {
  document.querySelectorAll('.course-card,.feature-card,.review-card,.dash-stat').forEach(el => {
    if (!el._observed) {
      el.style.opacity='0'; el.style.transform='translateY(30px)';
      el.style.transition='opacity 0.6s ease,transform 0.6s ease';
      observer.observe(el); el._observed=true;
    }
  });
}

/* ════════════════════════════════════════════════════════════
   INITIALISE — runs on page load
   ════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  await loadCategories();
  await loadCourses();
  await loadHomeReviews();
  attachHoverSounds();
  startLiveClock();
});

/* Live clock for dashboard */
function startLiveClock() {
  function tick() {
    const el = document.getElementById('live-clock');
    if (el) {
      const now = new Date();
      el.textContent = now.toLocaleTimeString('en-IN', { hour12: false });
    }
  }
  tick();
  setInterval(tick, 1000);
}

/* ── Navbar scroll glow ──────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── 3D Mouse tilt for cards ─────────────────────────────────── */
function apply3DTilt(selector, maxTilt = 8) {
  document.querySelectorAll(selector).forEach(card => {
    if (card._tilt) return;
    card._tilt = true;
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y*maxTilt}deg) rotateY(${x*maxTilt}deg) translateY(-8px) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* Re-apply tilt after cards render */
const _origObserve = observeElements;
function observeElements() {
  _origObserve();
  setTimeout(() => {
    apply3DTilt('.course-card', 6);
    apply3DTilt('.feature-card', 8);
    apply3DTilt('.kpi-card', 5);
    apply3DTilt('.review-card', 6);
    apply3DTilt('.dash-chart-card', 3);
  }, 300);
}