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
const newTaskInput = document.getElementById('new-task');
const addTaskButton = document.getElementById('add-task');
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
    li.textContent = task.text;
    if (task.completed) li.classList.add('completed');
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
  tasks.push({ text, completed: false });
  saveTasks();
  renderTasks();
  updateProgress();
}

function updateProgress() {
  if (tasks.length === 0) {
    progressBar.style.width = '0%';
    progressText.textContent = '0% complete';
    return;
  }
  const done = tasks.filter(t => t.completed).length;
  const percent = Math.round((done / tasks.length) * 100);
  progressBar.style.width = percent + '%';
  progressText.textContent = `${percent}% complete`;
}

addTaskButton.addEventListener('click', () => {
  addTask(newTaskInput.value.trim());
  newTaskInput.value = '';
});

newTaskInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') addTaskButton.click();
});

// initialize
loadTasks();
renderTasks();
updateProgress();
