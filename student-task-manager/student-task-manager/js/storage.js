const TASKS_KEY = "studentTaskManager.tasks.v1";
const CATEGORIES_KEY = "studentTaskManager.categories.v1";
const THEME_KEY = "studentTaskManager.theme.v1";

export const DEFAULT_CATEGORIES = [
  { id: "assignment", name: "Assignment", color: "#3977bd", isDefault: true },
  { id: "reading", name: "Reading", color: "#8b70c9", isDefault: true },
  { id: "examination", name: "Examination", color: "#d58a32", isDefault: true },
  { id: "project", name: "Project", color: "#16865d", isDefault: true },
  { id: "personal", name: "Personal", color: "#cf6b83", isDefault: true }
];

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Could not read ${key} from Local Storage:`, error);
    return fallback;
  }
}

export function loadTasks() {
  const value = readJSON(TASKS_KEY, []);
  return Array.isArray(value) ? value : [];
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error("Could not save tasks:", error);
    return false;
  }
}

export function loadCategories() {
  const saved = readJSON(CATEGORIES_KEY, null);
  if (!Array.isArray(saved)) {
    saveCategories(DEFAULT_CATEGORIES);
    return [...DEFAULT_CATEGORIES];
  }
  // Keep the built-in categories available even if a stored list is incomplete.
  const merged = [...DEFAULT_CATEGORIES];
  saved.forEach(category => {
    if (!merged.some(item => item.id === category.id) && category?.id && category?.name) {
      merged.push(category);
    }
  });
  return merged;
}

export function saveCategories(categories) {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    return true;
  } catch (error) {
    console.error("Could not save categories:", error);
    return false;
  }
}

export function loadTheme() {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error("Could not save theme preference:", error);
  }
}
