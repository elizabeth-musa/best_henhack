// Renderer process code
console.log('Renderer process started');
const dateElement = document.getElementById("date");

const today = new Date();

const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
};

dateElement.textContent = today.toLocaleDateString(undefined, options);

// --- Task list functionality ------------------------------------------------

const taskListElem = document.getElementById('task-list');
const addTaskButton = document.getElementById('add-task');
const taskInput = document.getElementById('task-input');
const taskSubmit = document.getElementById('task-submit');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const ringFill = document.getElementById('ring-fill');
const CIRCUMFERENCE = 2 * Math.PI * 65; // ~408.4
if (ringFill) {
  ringFill.style.strokeDasharray = CIRCUMFERENCE;
  ringFill.style.strokeDashoffset = CIRCUMFERENCE;
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2, none: 3 };
const PRIORITY_DOT   = { high: '●', medium: '●', low: '●', none: '' };
const PRIORITY_CLASS = { high: 'p-high', medium: 'p-medium', low: 'p-low', none: '' };

let tasks = [];
let selectedPriority = 'none';
let sortMode = 'default';

// --- priority picker ---
const priorityBtns = document.querySelectorAll('.priority-btn');
priorityBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const p = btn.dataset.priority;
    selectedPriority = (selectedPriority === p) ? 'none' : p;
    priorityBtns.forEach(b => b.classList.toggle('selected', b.dataset.priority === selectedPriority));
  });
});

// --- sort buttons ---
const sortBtns = document.querySelectorAll('.sort-btn');
sortBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sortMode = btn.dataset.sort;
    sortBtns.forEach(b => b.classList.toggle('active', b.dataset.sort === sortMode));
    renderTasks();
  });
});

function loadTasks() {
  const stored = localStorage.getItem('tasks');
  tasks = stored ? JSON.parse(stored) : [];
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getSortedTasks() {
  if (sortMode === 'priority') {
    return tasks
      .map((t, i) => ({ ...t, _orig: i }))
      .sort((a, b) => (PRIORITY_ORDER[a.priority||'none'] - PRIORITY_ORDER[b.priority||'none']));
  }
  return tasks.map((t, i) => ({ ...t, _orig: i }));
}

function renderTasks() {
  taskListElem.innerHTML = '';
  getSortedTasks().forEach((task) => {
    const origIndex = task._orig;
    const li = document.createElement('li');
    const p = task.priority || 'none';
    if (PRIORITY_CLASS[p]) li.classList.add(PRIORITY_CLASS[p]);

    const dot = document.createElement('span');
    dot.className = 'priority-dot';
    dot.textContent = PRIORITY_DOT[p];

    const del = document.createElement('button');
    del.textContent = 'x';
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      tasks.splice(origIndex, 1);
      saveTasks();
      renderTasks();
      updateProgress();
    });

    const span = document.createElement('span');
    span.textContent = task.text;
    if (task.completed) span.classList.add('completed');

    li.appendChild(dot);
    li.appendChild(del);
    li.appendChild(span);
    li.addEventListener('click', () => {
      const wasCompleted = tasks[origIndex].completed;
      tasks[origIndex].completed = !wasCompleted;
      saveTasks();
      renderTasks();
      updateProgress();
      if (!wasCompleted) {
        launchConfetti();
        playJingle();
      }
    });
    taskListElem.appendChild(li);
  });
}

// --- Confetti burst -----------------------------------------------------------
function launchConfetti() {
  // enlarge pet
  const petSprite = document.getElementById('pet-sprite');
  if (petSprite) {
    petSprite.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)';
    petSprite.style.transform  = 'scale(1.7)';
  }

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const colors = ['#e8848a','#d4a96a','#f2b8b8','#b05a5a','#fae880','#88d4a4','#6080d8','#f5c8d8'];
  const pieces = Array.from({ length: 72 }, () => ({
    x:    canvas.width  * 0.5 + (Math.random() - 0.5) * 60,
    y:    canvas.height * 0.45,
    vx:   (Math.random() - 0.5) * 14,
    vy:   -(Math.random() * 10 + 6),
    r:    Math.random() * 6 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot:  Math.random() * Math.PI * 2,
    rv:   (Math.random() - 0.5) * 0.25,
    shape: Math.random() < 0.5 ? 'rect' : 'circle',
    w:    Math.random() * 8 + 4,
    h:    Math.random() * 4 + 3,
    alpha: 1,
  }));

  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach(p => {
      p.vy  += 0.32;
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.rv;
      p.alpha = Math.max(0, p.alpha - 0.012);
      if (p.y < canvas.height + 20) alive = true;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    if (alive) {
      frame = requestAnimationFrame(draw);
    } else {
      canvas.remove();
    }
  }
  draw();
  setTimeout(() => {
    cancelAnimationFrame(frame);
    canvas.remove();
    // return pet to normal size
    const petSprite = document.getElementById('pet-sprite');
    if (petSprite) {
      petSprite.style.transition = 'transform 0.5s ease';
      petSprite.style.transform  = 'scale(1)';
    }
  }, 4000);
}

// --- Completion jingle -------------------------------------------------------
function playJingle() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    // C5 E5 G5 C6  — cheerful little arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const durations = [0.12, 0.12, 0.12, 0.28];
    let t = ac.currentTime + 0.02;
    notes.forEach((freq, i) => {
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + durations[i]);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + durations[i] + 0.05);
      t += durations[i] * 0.82;
    });
    // tiny shimmer chord at the end
    [1046.50, 1318.51].forEach(freq => {
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch(e) {}
}

function addTask(text) {
  if (!text) return;
  tasks.push({ text, completed: false, priority: selectedPriority, date: new Date().toISOString() });
  saveTasks();
  renderTasks();
  updateProgress();
}

function updateProgress() {
  const done  = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  if (progressText) progressText.textContent = percent + '%';
  const sublabel = document.getElementById('progress-sublabel');
  if (sublabel) sublabel.textContent = total === 0 ? 'no tasks' : done + ' / ' + total + ' done';
  if (ringFill) {
    ringFill.style.strokeDashoffset = CIRCUMFERENCE * (1 - percent / 100);
  }
  if (window.bojiPetRefresh) window.bojiPetRefresh();
}

// inline input submit
function submitInlineTask() {
  if (!taskInput) return;
  const val = taskInput.value.trim();
  if (val) {
    addTask(val);
    taskInput.value = '';
    // reset priority after adding
    selectedPriority = 'none';
    priorityBtns.forEach(b => b.classList.remove('selected'));
  }
}

if (taskSubmit) {
  taskSubmit.addEventListener('click', submitInlineTask);
}
if (taskInput) {
  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitInlineTask();
  });
}

if (addTaskButton) {
  addTaskButton.addEventListener('click', () => {
    if (taskInput) taskInput.focus();
  });
}

// initialize
loadTasks();
renderTasks();
updateProgress();

// update if tasks changed in another tab/page
window.addEventListener('storage', (e) => {
  if (e.key === 'tasks') {
    loadTasks();
    renderTasks();
    updateProgress();
  }
});
