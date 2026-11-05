import { saveTasks } from "./storage.js";

export function createTask(data, tasks) {
  const task = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: data.title.trim(),
    description: data.description.trim(),
    category: data.category,
    priority: data.priority,
    dueDate: data.dueDate || "",
    dueTime: data.dueTime || "",
    completed: false,
    createdAt: new Date().toISOString()
  };
  const updated = [task, ...tasks];
  saveTasks(updated);
  return updated;
}

export function updateTask(id, data, tasks) {
  const updated = tasks.map(task => task.id === id ? {
    ...task,
    title: data.title.trim(),
    description: data.description.trim(),
    category: data.category,
    priority: data.priority,
    dueDate: data.dueDate || "",
    dueTime: data.dueTime || "",
    updatedAt: new Date().toISOString()
  } : task);
  saveTasks(updated);
  return updated;
}

export function deleteTask(id, tasks) {
  const updated = tasks.filter(task => task.id !== id);
  saveTasks(updated);
  return updated;
}

export function toggleTask(id, tasks) {
  const updated = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
  saveTasks(updated);
  return updated;
}

export function isOverdue(task, today = localDateString()) {
  return Boolean(task.dueDate && task.dueDate < today && !task.completed);
}

export function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTaskStats(tasks) {
  const completed = tasks.filter(task => task.completed).length;
  const pending = tasks.length - completed;
  const overdue = tasks.filter(task => isOverdue(task)).length;
  return { total: tasks.length, completed, pending, overdue, percentage: tasks.length ? Math.round(completed / tasks.length * 100) : 0 };
}

export function filterAndSortTasks(tasks, options = {}) {
  const { status = "all", category = "all", priority = "all", search = "", sort = "date-asc" } = options;
  const today = localDateString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = localDateString(tomorrow);
  let result = [...tasks];

  if (status === "today") result = result.filter(task => task.dueDate === today && !task.completed);
  if (status === "upcoming") result = result.filter(task => task.dueDate > today && !task.completed);
  if (status === "pending") result = result.filter(task => !task.completed);
  if (status === "completed") result = result.filter(task => task.completed);
  if (category !== "all") result = result.filter(task => task.category === category);
  if (priority !== "all") result = result.filter(task => task.priority === priority);

  const query = search.trim().toLowerCase();
  if (query) {
    result = result.filter(task =>
      task.title.toLowerCase().includes(query) ||
      (task.description || "").toLowerCase().includes(query) ||
      task.category.toLowerCase().includes(query)
    );
  }

  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  result.sort((a, b) => {
    if (sort === "priority") return priorityOrder[a.priority] - priorityOrder[b.priority];
    if (sort === "created") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === "date-desc") return (b.dueDate || "0000") .localeCompare(a.dueDate || "0000");
    return (a.dueDate || "9999").localeCompare(b.dueDate || "9999") || (a.dueTime || "").localeCompare(b.dueTime || "");
  });
  return result;
}

export function formatDueDate(task) {
  if (!task.dueDate) return "No deadline";
  const date = new Date(`${task.dueDate}T00:00:00`);
  const dateLabel = date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  return task.dueTime ? `${dateLabel} · ${formatTime(task.dueTime)}` : dateLabel;
}

function formatTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
