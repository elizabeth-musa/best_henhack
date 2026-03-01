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

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2, none: 3 };
const PRIORITY_DOT   = { high: '🔴', medium: '🟡', low: '🟢', none: '' };
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
      tasks[origIndex].completed = !tasks[origIndex].completed;
      saveTasks();
      renderTasks();
      updateProgress();
    });
    taskListElem.appendChild(li);
  });
}

function addTask(text) {
  if (!text) return;
  tasks.push({ text, completed: false, priority: selectedPriority, date: new Date().toISOString() });
  saveTasks();
  renderTasks();
  updateProgress();
}

function updateProgress() {
  if (tasks.length === 0) {
    if (progressBar) progressBar.style.width = '0%';
    if (progressText) progressText.textContent = '0% complete';
    if (window.bojiPetRefresh) window.bojiPetRefresh();
    return;
  }
  const done = tasks.filter(t => t.completed).length;
  const percent = Math.round((done / tasks.length) * 100);
  if (progressBar) progressBar.style.width = percent + '%';
  if (progressText) progressText.textContent = `${percent}% complete`;
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
