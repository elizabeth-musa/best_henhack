const calendarWidget = document.getElementById('calendar-widget');
const addEventBtn = document.getElementById('new-event');
const taskList = document.getElementById('task-list');
const modal = document.getElementById('task-modal');
const closeModal = document.getElementById('close-modal');
const taskInput = document.getElementById('task-input');
const addTaskModalBtn = document.getElementById('add-task-modal-btn');

let selectedDate = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function buildCalendar(year = currentYear, month = currentMonth) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let html = `<table><thead><tr>
    <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th>
    <th>Thu</th><th>Fri</th><th>Sat</th>
    </tr></thead><tbody><tr>`;
  let dayCount = 0;
  for (let i = 0; i < firstDay; i++) {
    html += `<td></td>`;
    dayCount++;
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(year, month, day);
    const isoDate = cellDate.toISOString().slice(0,10);
    html += `<td data-date="${isoDate}">${day}</td>`;
    dayCount++;
    if (dayCount % 7 === 0 && day !== daysInMonth) html += `</tr><tr>`;
  }
  html += `</tr></tbody></table>`;
  calendarWidget.innerHTML = html;

  // Add click listeners to each cell
  calendarWidget.querySelectorAll('td[data-date]').forEach(td => {
    td.addEventListener('click', () => {
      calendarWidget.querySelectorAll('td.selected').forEach(n => n.classList.remove('selected'));
      td.classList.add('selected');
      selectedDate = td.getAttribute('data-date');
      renderTasksForDate();
    });
  });
}

// Show modal
function showModal() {
  modal.classList.add('active');
  taskInput.value = '';
  taskInput.focus();
}

// Hide modal
function hideModal() {
  modal.classList.remove('active');
}

// Add task
function addTask(text, date) {
  if (!text) return;
  let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  tasks.push({ text, completed: false, date });
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasksForDate();
}

// Render tasks for selected date
function renderTasksForDate() {
  let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  let date = selectedDate || new Date().toISOString().slice(0,10);
  let filtered = tasks.filter(t => t.date === date);
  taskList.innerHTML = '';
  filtered.forEach((task, idx) => {
    const li = document.createElement('li');
    li.textContent = task.text;
    li.style.textDecoration = task.completed ? 'line-through' : 'none';
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      // Toggle completed
      let allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      let globalIdx = allTasks.findIndex(
        t => t.text === task.text && t.date === task.date
      );
      if (globalIdx !== -1) {
        allTasks[globalIdx].completed = !allTasks[globalIdx].completed;
        localStorage.setItem('tasks', JSON.stringify(allTasks));
        renderTasksForDate();
      }
    });
    taskList.appendChild(li);
  });
}

// Modal event listeners
addEventBtn.addEventListener('click', showModal);
closeModal.addEventListener('click', hideModal);
addTaskModalBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  const date = selectedDate || new Date().toISOString().slice(0,10);
  if (text) {
    addTask(text, date);
    hideModal();
  }
});
modal.addEventListener('click', (e) => {
  if (e.target === modal) hideModal();
});

// Initial render
buildCalendar();
renderTasksForDate();
