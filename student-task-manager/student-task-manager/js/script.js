import {
  loadTasks, saveTasks, loadCategories, saveCategories,
  loadTheme, saveTheme, DEFAULT_CATEGORIES
} from "./storage.js";
import {
  createTask, updateTask, deleteTask, toggleTask,
  filterAndSortTasks, localDateString
} from "./tasks.js";
import { renderDashboard, renderProgress, taskHTML, emptyHTML } from "./dashboard.js";
import { renderCalendar, moveCalendarMonth, goToCalendarToday, selectCalendarDate } from "./calendar.js";
import { exportTasksCSV } from "./export.js";

let tasks = loadTasks();
let categories = loadCategories();
let activeStatus = "all";
let searchQuery = "";
let editingId = null;

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  $("#toast-region").appendChild(toast);
  window.setTimeout(() => toast.remove(), 2800);
}

function refreshAll() {
  renderDashboard(tasks, categories);
  renderProgress(tasks, categories);
  renderTaskList();
  renderCalendar(tasks, categories);
  renderCategories();
  populateCategoryControls();
}

function switchPage(page) {
  const validPages = ["dashboard", "tasks", "calendar", "categories", "progress", "settings"];
  if (!validPages.includes(page)) return;
  $$(".page").forEach(section => section.classList.toggle("active", section.dataset.pagePanel === page));
  $$("[data-page]").forEach(button => button.classList.toggle("active", button.dataset.page === page));
  const titles = { dashboard: "Dashboard", tasks: "My tasks", calendar: "Calendar", categories: "Categories", progress: "My progress", settings: "Settings" };
  $("#page-title").textContent = titles[page];
  document.body.classList.remove("menu-open");
  $("#mobile-menu-btn").setAttribute("aria-expanded", "false");
  if (page === "calendar") renderCalendar(tasks, categories);
  if (page === "progress") renderProgress(tasks, categories);
  if (page === "tasks") renderTaskList();
}

function renderTaskList() {
  const filtered = filterAndSortTasks(tasks, {
    status: activeStatus,
    category: $("#category-filter").value,
    priority: $("#priority-filter").value,
    search: searchQuery,
    sort: $("#sort-tasks").value
  });
  $("#task-result-count").textContent = `${filtered.length} ${filtered.length === 1 ? "task" : "tasks"}`;
  $("#all-task-list").innerHTML = filtered.length
    ? filtered.map(task => taskHTML(task, categories)).join("")
    : emptyHTML("No tasks found", searchQuery || activeStatus !== "all" ? "Try changing your search or filters." : "Add your first task to get organised.");
}

function populateCategoryControls() {
  const categorySelect = $("#task-category");
  const filter = $("#category-filter");
  const selectedCategory = categorySelect.value;
  const selectedFilter = filter.value;
  categorySelect.innerHTML = categories.map(category => `<option value="${escapeHTML(category.name)}">${escapeHTML(category.name)}</option>`).join("");
  filter.innerHTML = `<option value="all">All categories</option>` + categories.map(category => `<option value="${escapeHTML(category.name)}">${escapeHTML(category.name)}</option>`).join("");
  if (categories.some(category => category.name === selectedCategory)) categorySelect.value = selectedCategory;
  if (categories.some(category => category.name === selectedFilter)) filter.value = selectedFilter;
}

function renderCategories() {
  const container = $("#categories-list");
  container.innerHTML = categories.map(category => {
    const count = tasks.filter(task => task.category === category.name).length;
    return `<article class="category-card ${category.isDefault ? "default-category" : ""}">
      <div class="category-card-top"><div class="category-card-name"><i style="--category-color:${escapeHTML(category.color)}"></i>${escapeHTML(category.name)}</div>
      <button class="category-delete" data-delete-category="${escapeHTML(category.id)}" aria-label="Delete ${escapeHTML(category.name)} category" title="Delete category">×</button></div>
      <div class="category-count">${count}</div><p>${count === 1 ? "task" : "tasks"} in this category</p>
    </article>`;
  }).join("");
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function openTaskModal(task = null) {
  editingId = task?.id ?? null;
  $("#task-form").reset();
  populateCategoryControls();
  $("#editing-task-id").value = task?.id ?? "";
  $("#modal-title").textContent = task ? "Edit task" : "Add a task";
  $("#save-task-btn").textContent = task ? "Save changes" : "Save task";
  if (task) {
    $("#task-title").value = task.title;
    $("#task-description").value = task.description || "";
    $("#task-category").value = task.category;
    $("#task-priority").value = task.priority;
    $("#task-date").value = task.dueDate || "";
    $("#task-time").value = task.dueTime || "";
  }
  $("#task-modal").classList.add("open");
  $("#task-modal").setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  window.setTimeout(() => $("#task-title").focus(), 50);
}

function closeTaskModal() {
  $("#task-modal").classList.remove("open");
  $("#task-modal").setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  editingId = null;
}

function handleTaskSubmit(event) {
  event.preventDefault();
  const data = {
    title: $("#task-title").value,
    description: $("#task-description").value,
    category: $("#task-category").value,
    priority: $("#task-priority").value,
    dueDate: $("#task-date").value,
    dueTime: $("#task-time").value
  };
  if (!data.title.trim()) {
    showToast("Please enter a task title.", "error");
    $("#task-title").focus();
    return;
  }
  if (editingId) {
    tasks = updateTask(editingId, data, tasks);
    showToast("Task updated successfully.");
  } else {
    tasks = createTask(data, tasks);
    showToast("Task added successfully.");
  }
  closeTaskModal();
  refreshAll();
}

function handleTaskAction(event) {
  const row = event.target.closest("[data-task-id]");
  if (!row) return;
  const id = row.dataset.taskId;
  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) return;
  const action = actionElement.dataset.action;
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  if (action === "toggle") {
    tasks = toggleTask(id, tasks);
    refreshAll();
    showToast(task.completed ? "Task marked as pending." : "Task completed. Well done!");
  } else if (action === "edit") {
    openTaskModal(task);
  } else if (action === "delete") {
    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      tasks = deleteTask(id, tasks);
      refreshAll();
      showToast("Task deleted.");
    }
  }
}

function handleCategorySubmit(event) {
  event.preventDefault();
  const name = $("#new-category-name").value.trim();
  const color = $("#new-category-color").value;
  if (!name) return;
  if (categories.some(category => category.name.toLowerCase() === name.toLowerCase())) {
    showToast("A category with that name already exists.", "error");
    return;
  }
  const category = { id: `custom-${Date.now()}`, name, color, isDefault: false };
  categories = [...categories, category];
  saveCategories(categories);
  $("#category-form").reset();
  $("#new-category-color").value = "#3977bd";
  refreshAll();
  showToast("Category created.");
}

function deleteCategory(id) {
  const category = categories.find(item => item.id === id);
  if (!category || category.isDefault) return;
  const hasTasks = tasks.some(task => task.category === category.name);
  if (hasTasks) {
    showToast("Move or delete this category's tasks before removing it.", "error");
    return;
  }
  if (!window.confirm(`Delete the "${category.name}" category?`)) return;
  categories = categories.filter(item => item.id !== id);
  saveCategories(categories);
  refreshAll();
  showToast("Category deleted.");
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-mode");
  const theme = isDark ? "dark" : "light";
  saveTheme(theme);
  updateThemeButtons(theme);
}

function updateThemeButtons(theme) {
  const dark = theme === "dark";
  $("#theme-toggle").textContent = dark ? "☀" : "☾";
  $("#theme-toggle").setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  $("#theme-toggle").title = dark ? "Switch to light mode" : "Switch to dark mode";
  $("#settings-theme-toggle").textContent = dark ? "Switch to light mode" : "Switch to dark mode";
}

function initialiseTheme() {
  const theme = loadTheme();
  document.body.classList.toggle("dark-mode", theme === "dark");
  updateThemeButtons(theme);
}

function clearAllTasks() {
  if (!tasks.length) {
    showToast("There are no tasks to clear.", "error");
    return;
  }
  if (!window.confirm("Delete all tasks? This action cannot be undone.")) return;
  tasks = [];
  saveTasks(tasks);
  refreshAll();
  showToast("All tasks have been cleared.");
}

function bindEvents() {
  document.addEventListener("click", event => {
    const pageButton = event.target.closest("[data-page]");
    if (pageButton) switchPage(pageButton.dataset.page);
    const goButton = event.target.closest("[data-go-page]");
    if (goButton) switchPage(goButton.dataset.goPage);
    if (event.target.closest("[data-open-task]")) openTaskModal();
  });

  $("#task-form").addEventListener("submit", handleTaskSubmit);
  $("#close-modal").addEventListener("click", closeTaskModal);
  $("#cancel-task").addEventListener("click", closeTaskModal);
  $("#task-modal").addEventListener("click", event => {
    if (event.target === $("#task-modal")) closeTaskModal();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeTaskModal();
      document.body.classList.remove("menu-open");
    }
    if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      event.preventDefault();
      $("#global-search").focus();
    }
  });

  $("#all-task-list").addEventListener("click", handleTaskAction);
  $("#all-task-list").addEventListener("change", event => {
    if (event.target.matches('[data-action="toggle"]')) handleTaskAction(event);
  });
  $("#upcoming-list").addEventListener("click", handleTaskAction);
  $("#upcoming-list").addEventListener("change", event => {
    if (event.target.matches('[data-action="toggle"]')) handleTaskAction(event);
  });
  $("#selected-date-tasks").addEventListener("click", handleTaskAction);
  $("#selected-date-tasks").addEventListener("change", event => {
    if (event.target.matches('[data-action="toggle"]')) handleTaskAction(event);
  });

  $$(".filter-tab").forEach(button => button.addEventListener("click", () => {
    activeStatus = button.dataset.statusFilter;
    $$(".filter-tab").forEach(tab => tab.classList.toggle("active", tab === button));
    renderTaskList();
  }));
  ["category-filter", "priority-filter", "sort-tasks"].forEach(id => $(`#${id}`).addEventListener("change", renderTaskList));
  $("#global-search").addEventListener("input", event => {
    searchQuery = event.target.value;
    renderTaskList();
    if (searchQuery.trim()) switchPage("tasks");
  });
  $("#clear-filters").addEventListener("click", () => {
    activeStatus = "all";
    searchQuery = "";
    $("#global-search").value = "";
    $("#category-filter").value = "all";
    $("#priority-filter").value = "all";
    $("#sort-tasks").value = "date-asc";
    $$(".filter-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.statusFilter === "all"));
    renderTaskList();
  });

  $("#calendar-prev").addEventListener("click", () => moveCalendarMonth(-1, tasks, categories));
  $("#calendar-next").addEventListener("click", () => moveCalendarMonth(1, tasks, categories));
  $("#calendar-today").addEventListener("click", () => goToCalendarToday(tasks, categories));
  $("#calendar-grid").addEventListener("click", event => {
    const day = event.target.closest("[data-calendar-date]");
    if (day) selectCalendarDate(day.dataset.calendarDate, tasks, categories);
  });

  $("#category-form").addEventListener("submit", handleCategorySubmit);
  $("#categories-list").addEventListener("click", event => {
    const button = event.target.closest("[data-delete-category]");
    if (button) deleteCategory(button.dataset.deleteCategory);
  });

  $("#theme-toggle").addEventListener("click", toggleTheme);
  $("#settings-theme-toggle").addEventListener("click", toggleTheme);
  $("#export-tasks-btn").addEventListener("click", () => {
    if (!tasks.length) return showToast("Add some tasks before exporting.", "error");
    exportTasksCSV(tasks);
    showToast("Your CSV export is ready.");
  });
  $("#clear-tasks-btn").addEventListener("click", clearAllTasks);

  $("#mobile-menu-btn").addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    $("#mobile-menu-btn").setAttribute("aria-expanded", String(open));
  });
  $("#mobile-backdrop").addEventListener("click", () => document.body.classList.remove("menu-open"));
}

function init() {
  initialiseTheme();
  populateCategoryControls();
  bindEvents();
  refreshAll();
  switchPage("dashboard");
}

init();
