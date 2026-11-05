import { localDateString } from "./tasks.js";
import { taskHTML, emptyHTML } from "./dashboard.js";

let visibleMonth = new Date();
let selectedDate = localDateString();

export function renderCalendar(tasks, categories) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const today = localDateString();

  document.getElementById("calendar-month-label").textContent = visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let html = weekdays.map(day => `<div class="calendar-weekday">${day}</div>`).join("");

  for (let cell = 0; cell < 42; cell++) {
    let date, outside = false;
    if (cell < startOffset) {
      date = new Date(year, month - 1, previousMonthDays - startOffset + cell + 1);
      outside = true;
    } else if (cell >= startOffset + daysInMonth) {
      date = new Date(year, month + 1, cell - startOffset - daysInMonth + 1);
      outside = true;
    } else {
      date = new Date(year, month, cell - startOffset + 1);
    }
    const key = localDateString(date);
    const dayTasks = tasks.filter(task => task.dueDate === key);
    const hasCompleted = dayTasks.some(task => task.completed);
    const hasPending = dayTasks.some(task => !task.completed);
    const classes = ["calendar-day", outside ? "outside" : "", key === today ? "today" : "", key === selectedDate ? "selected" : ""].filter(Boolean).join(" ");
    html += `<button class="${classes}" data-calendar-date="${key}" aria-label="${date.toDateString()}, ${dayTasks.length} tasks">
      <span>${date.getDate()}</span><span class="day-dots">${hasPending ? "<i></i>" : ""}${hasCompleted ? '<i style="background:#16865d"></i>' : ""}</span>
    </button>`;
  }
  document.getElementById("calendar-grid").innerHTML = html;
  renderSelectedDate(tasks, categories);
}

export function moveCalendarMonth(amount, tasks, categories) {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + amount, 1);
  renderCalendar(tasks, categories);
}

export function goToCalendarToday(tasks, categories) {
  visibleMonth = new Date();
  selectedDate = localDateString();
  renderCalendar(tasks, categories);
}

export function selectCalendarDate(date, tasks, categories) {
  selectedDate = date;
  renderCalendar(tasks, categories);
}

function renderSelectedDate(tasks, categories) {
  const date = new Date(`${selectedDate}T00:00:00`);
  document.getElementById("selected-date-label").textContent = date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  const dayTasks = tasks.filter(task => task.dueDate === selectedDate);
  document.getElementById("selected-date-tasks").innerHTML = dayTasks.length
    ? dayTasks.map(task => taskHTML(task, categories, true)).join("")
    : emptyHTML("Nothing scheduled", "There are no tasks due on this date.");
}
