import { getTaskStats, isOverdue, localDateString, formatDueDate } from "./tasks.js";

const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

export function renderDashboard(tasks, categories) {
  const stats = getTaskStats(tasks);
  setText("stat-total", stats.total);
  setText("stat-completed", stats.completed);
  setText("stat-pending", stats.pending);
  setText("stat-overdue", stats.overdue);
  setText("completion-number", `${stats.percentage}%`);
  setText("completion-label", `${stats.percentage}% complete`);
  setText("progress-text", `${stats.percentage}% of your tasks completed`);
  setText("nav-task-count", stats.pending);
  const ring = document.getElementById("progress-ring");
  if (ring) ring.style.setProperty("--progress", `${stats.percentage}%`);

  setText("progress-summary", stats.total === 0 ? "You're just getting started." :
    stats.percentage === 100 ? "Excellent work — everything is complete!" :
    stats.percentage >= 50 ? "You're making good progress." : "Every completed task is a step forward.");
  setText("progress-description", stats.total === 0
    ? "Add a task to begin organising your study time."
    : `${stats.completed} completed out of ${stats.total} total tasks.`);

  const today = localDateString();
  const upcoming = tasks
    .filter(task => !task.completed && task.dueDate && task.dueDate >= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || (a.dueTime || "").localeCompare(b.dueTime || ""))
    .slice(0, 4);
  const upcomingContainer = document.getElementById("upcoming-list");
  upcomingContainer.innerHTML = upcoming.length
    ? upcoming.map(task => compactTaskHTML(task, categories)).join("")
    : emptyHTML("You're all caught up", "Tasks with future deadlines will appear here.");

  const categoryContainer = document.getElementById("category-overview");
  const categoryData = categories.map(category => ({
    ...category,
    count: tasks.filter(task => task.category === category.name).length
  })).filter(category => category.count > 0).slice(0, 5);
  categoryContainer.innerHTML = categoryData.length ? categoryData.map(category => {
    const percent = stats.total ? Math.round(category.count / stats.total * 100) : 0;
    return `<div class="category-overview-row">
      <span class="category-overview-name">${escapeHTML(category.name)}</span>
      <div class="mini-progress"><span style="width:${percent}%;--category-color:${escapeHTML(category.color)}"></span></div>
      <span class="category-overview-count">${category.count}</span>
    </div>`;
  }).join("") : `<p class="muted-text">Your category summary will appear when you add tasks.</p>`;

  const dateEl = document.getElementById("dashboard-date");
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function renderProgress(tasks, categories) {
  const stats = getTaskStats(tasks);
  setText("progress-rate-stat", `${stats.percentage}%`);
  setText("progress-done-stat", stats.completed);
  setText("progress-pending-stat", stats.pending);

  const categoryContainer = document.getElementById("progress-categories");
  categoryContainer.innerHTML = categories.map(category => {
    const categoryTasks = tasks.filter(task => task.category === category.name);
    if (!categoryTasks.length) return "";
    const done = categoryTasks.filter(task => task.completed).length;
    const percent = Math.round(done / categoryTasks.length * 100);
    return `<div class="progress-category-item">
      <div class="progress-category-top"><strong>${escapeHTML(category.name)}</strong><span>${done}/${categoryTasks.length} completed · ${percent}%</span></div>
      <div class="progress-category-track"><span style="width:${percent}%;--category-color:${escapeHTML(category.color)}"></span></div>
    </div>`;
  }).join("") || `<p class="muted-text">Category progress will appear after you add tasks.</p>`;

  const priorityContainer = document.getElementById("priority-overview");
  priorityContainer.innerHTML = ["High", "Medium", "Low"].map(priority => {
    const count = tasks.filter(task => task.priority === priority && !task.completed).length;
    return `<div class="priority-row"><span><i class="priority-badge priority-${priority.toLowerCase()}">${priority}</i> priority pending</span><strong>${count}</strong></div>`;
  }).join("");
}

export function taskHTML(task, categories, compact = false) {
  const category = categories.find(item => item.name === task.category);
  const color = category?.color || "#3977bd";
  const overdue = isOverdue(task);
  return `<article class="task-row ${task.completed ? "is-complete" : ""}" data-task-id="${escapeHTML(task.id)}">
    <input class="task-check" type="checkbox" data-action="toggle" aria-label="Mark ${escapeHTML(task.title)} as ${task.completed ? "pending" : "completed"}" ${task.completed ? "checked" : ""}>
    <div class="task-main">
      <div class="task-title-line"><span class="task-title">${escapeHTML(task.title)}</span>
        <span class="priority-badge priority-${escapeHTML(task.priority.toLowerCase())}">${escapeHTML(task.priority)}</span>
        ${overdue ? '<span class="status-badge status-overdue">Overdue</span>' : ""}
      </div>
      ${!compact && task.description ? `<p class="task-description">${escapeHTML(task.description)}</p>` : ""}
      <div class="task-meta">
        <span class="task-category"><i class="category-dot" style="--category-color:${escapeHTML(color)}"></i>${escapeHTML(task.category)}</span>
        <span>◷ ${escapeHTML(formatDueDate(task))}</span>
      </div>
    </div>
    <div class="task-actions">
      <button class="task-action-btn" data-action="edit" aria-label="Edit task" title="Edit">✎</button>
      <button class="task-action-btn delete" data-action="delete" aria-label="Delete task" title="Delete">×</button>
    </div>
  </article>`;
}

export function emptyHTML(title, message) {
  return `<div class="empty-state"><span class="empty-icon">✓</span><strong>${escapeHTML(title)}</strong><p>${escapeHTML(message)}</p></div>`;
}

function compactTaskHTML(task, categories) { return taskHTML(task, categories, true); }
function setText(id, value) { const element = document.getElementById(id); if (element) element.textContent = value; }
