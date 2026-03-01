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

let tasks = [];

function loadTasks() {
  const stored = localStorage.getItem('tasks');
  tasks = stored ? JSON.parse(stored) : [];
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskListElem.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    const del = document.createElement('button');
    del.textContent = 'x';
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
      updateProgress();
    });
    const span = document.createElement('span');
    span.textContent = task.text;
    if (task.completed) span.classList.add('completed');

    li.appendChild(del);
    li.appendChild(span);
    li.addEventListener('click', () => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
      updateProgress();
    });
    taskListElem.appendChild(li);
  });
}

function addTask(text) {
  if (!text) return;
  tasks.push({ text, completed: false, date: new Date().toISOString() });
  saveTasks();
  renderTasks();
  updateProgress();
}

function updateProgress() {
  if (tasks.length === 0) {
    if (progressBar) progressBar.style.width = '0%';
    if (progressText) progressText.textContent = '0% complete';
    return;
  }
  const done = tasks.filter(t => t.completed).length;
  const percent = Math.round((done / tasks.length) * 100);
  if (progressBar) progressBar.style.width = percent + '%';
  if (progressText) progressText.textContent = `${percent}% complete`;
}

// inline input submit
function submitInlineTask() {
  if (!taskInput) return;
  const val = taskInput.value.trim();
  if (val) {
    addTask(val);
    taskInput.value = '';
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
