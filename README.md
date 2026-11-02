# Task Manager – Vistula Team Project

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?logo=githubpages&logoColor=white)

A simple online Task Manager built with plain HTML, CSS and JavaScript. Tasks are stored in a Supabase PostgreSQL database and accessed through the auto-generated Supabase REST API. No backend server needed.

**Student ID:** 72591

## Links

| Resource | URL |
|---|---|
| Live app | https://vistula-team-project-72591.github.io/vistula-task-manager/ |
| Repository | https://github.com/vistula-team-project-72591/vistula-task-manager |
| Contributor page | https://vistula-team-project-72591.github.io/vistula-task-manager/contribution.html |
| Contributor JSON | https://vistula-team-project-72591.github.io/vistula-task-manager/contribution.json |

## Pull Requests

| Direction | Link |
|---|---|
| My PR merged into partner's repo | https://github.com/vistula-team-project-73179/vistula-task-manager/pull/1 |
| Partner's PR merged into my repo | https://github.com/vistula-team-project-72591/vistula-task-manager/pull/2 |

## Features

- View all tasks
- Add, edit and delete tasks
- Mark tasks as completed / incomplete
- Persistent storage in Supabase
- Error messages for failed operations

## Database

Table `tasks`:

| Column | Type | Notes |
|---|---|---|
| id | BIGINT | Primary key, identity |
| title | TEXT | Required |
| description | TEXT | Optional |
| completed | BOOLEAN | Default `false` |

Setup script with RLS policies: [`supabase-setup.sql`](supabase-setup.sql)

## REST API usage

Base URL: `https://wrbrgcpzvrplujnuqqtx.supabase.co/rest/v1`

```js
const headers = { apikey: KEY, 'Content-Type': 'application/json' };

// Get all tasks
fetch(`${BASE}/tasks?select=*`, { headers });

// Create
fetch(`${BASE}/tasks`, {
  method: 'POST', headers,
  body: JSON.stringify({ title: 'Learn Git', description: 'Practice', completed: false })
});

// Update
fetch(`${BASE}/tasks?id=eq.1`, {
  method: 'PATCH', headers,
  body: JSON.stringify({ completed: true })
});

// Delete
fetch(`${BASE}/tasks?id=eq.1`, { method: 'DELETE', headers });
```

## Project structure

```
vistula-task-manager/
├── index.html          # Main page
├── app.js              # CRUD logic (fetch + Supabase REST)
├── style.css           # Styles
├── config.json         # Public Supabase config
├── supabase-setup.sql  # Table + RLS policies
├── contribution.html   # Added by partner via PR
├── contribution.json   # Added by partner via PR
└── README.md
```

## Run locally

```bash
git clone https://github.com/vistula-team-project-72591/vistula-task-manager.git
cd vistula-task-manager
python -m http.server 8000
# open http://localhost:8000
```

> Only the public publishable key is stored in `config.json`. The database contains test data only.
