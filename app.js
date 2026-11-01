// Task Manager – Supabase REST API (no backend server)

let API_URL = '';
let HEADERS = {};

const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const descInput = document.getElementById('task-description');
const editIdInput = document.getElementById('task-edit-id');
const submitBtn = document.getElementById('task-submit');
const cancelBtn = document.getElementById('task-cancel');
const list = document.getElementById('task-list');
const statusEl = document.getElementById('status-message');

function showStatus(text, type = 'info') {
  statusEl.textContent = text;
  statusEl.className = `status ${type}`;
  if (type !== 'error') {
    clearTimeout(showStatus.timer);
    showStatus.timer = setTimeout(() => {
      statusEl.textContent = '';
      statusEl.className = 'status';
    }, 2500);
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...HEADERS, ...(options.headers || {}) }
  });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.message) msg += ` – ${body.message}`;
    } catch (_) { /* no JSON body */ }
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

// ---------- API ----------
const api = {
  getAll: () => request('?select=*&order=id.asc'),
  getById: (id) => request(`?id=eq.${id}&select=*`),
  create: (task) => request('', { method: 'POST', body: JSON.stringify(task) }),
  update: (id, fields) => request(`?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(fields) }),
  remove: (id) => request(`?id=eq.${id}`, { method: 'DELETE' })
};

// ---------- Rendering ----------
function renderTasks(tasks) {
  list.innerHTML = '';
  if (!tasks.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No tasks yet. Add your first one above.';
    list.appendChild(empty);
    return;
  }
  tasks.forEach((task) => list.appendChild(createTaskElement(task)));
}

function createTaskElement(task) {
  const item = document.createElement('article');
  item.className = 'task-item' + (task.completed ? ' done' : '');
  item.dataset.id = task.id;

  const body = document.createElement('div');
  body.className = 'task-body';

  const title = document.createElement('h3');
  title.className = 'task-title';
  title.textContent = task.title;

  const desc = document.createElement('p');
  desc.className = 'task-description';
  desc.textContent = task.description || '';

  const status = document.createElement('span');
  status.className = 'task-status';
  status.textContent = task.completed ? 'Completed' : 'Not completed';

  body.append(title, desc, status);

  const actions = document.createElement('div');
  actions.className = 'task-actions';
  actions.append(
    makeButton('toggle-task', task.completed ? 'Mark incomplete' : 'Mark complete'),
    makeButton('edit-task', 'Edit'),
    makeButton('delete-task', 'Delete')
  );

  item.append(body, actions);
  return item;
}

function makeButton(cls, text) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = cls;
  btn.textContent = text;
  return btn;
}

// ---------- Actions ----------
async function loadTasks() {
  try {
    renderTasks(await api.getAll());
  } catch (err) {
    showStatus(`Could not load tasks: ${err.message}`, 'error');
  }
}

function resetForm() {
  form.reset();
  editIdInput.value = '';
  submitBtn.textContent = 'Add Task';
  cancelBtn.hidden = true;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  if (!title) {
    showStatus('Title is required.', 'error');
    return;
  }

  submitBtn.disabled = true;
  try {
    const id = editIdInput.value;
    if (id) {
      await api.update(id, { title, description });
      showStatus('Task updated.', 'success');
    } else {
      await api.create({ title, description, completed: false });
      showStatus('Task added.', 'success');
    }
    resetForm();
    await loadTasks();
  } catch (err) {
    showStatus(`Save failed: ${err.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
  }
});

cancelBtn.addEventListener('click', resetForm);

list.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const item = btn.closest('.task-item');
  const id = item.dataset.id;

  try {
    if (btn.classList.contains('toggle-task')) {
      const completed = !item.classList.contains('done');
      await api.update(id, { completed });
      showStatus(completed ? 'Task completed.' : 'Task marked incomplete.', 'success');
      await loadTasks();
    } else if (btn.classList.contains('edit-task')) {
      const [task] = await api.getById(id);
      if (!task) throw new Error('Task not found');
      editIdInput.value = task.id;
      titleInput.value = task.title;
      descInput.value = task.description || '';
      submitBtn.textContent = 'Save Changes';
      cancelBtn.hidden = false;
      titleInput.focus();
    } else if (btn.classList.contains('delete-task')) {
      if (!confirm('Delete this task?')) return;
      await api.remove(id);
      if (editIdInput.value === id) resetForm();
      showStatus('Task deleted.', 'success');
      await loadTasks();
    }
  } catch (err) {
    showStatus(`Operation failed: ${err.message}`, 'error');
  }
});

// ---------- Init ----------
async function init() {
  try {
    const res = await fetch('config.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('config.json not found');
    const config = await res.json();
    const table = config.tableName || 'tasks';
    API_URL = `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}`;
    HEADERS = {
      apikey: config.supabasePublishableKey,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    };
    await loadTasks();
  } catch (err) {
    showStatus(`Configuration error: ${err.message}`, 'error');
  }
}

init();
