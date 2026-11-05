function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportTasksCSV(tasks) {
  const headers = ["Title", "Description", "Category", "Priority", "Due date", "Due time", "Status", "Created at"];
  const rows = tasks.map(task => [
    task.title, task.description, task.category, task.priority,
    task.dueDate, task.dueTime, task.completed ? "Completed" : "Pending",
    task.createdAt ? new Date(task.createdAt).toLocaleString() : ""
  ]);
  const csv = [headers, ...rows].map(row => row.map(csvEscape).join(",")).join("\r\n");
  // UTF-8 BOM helps spreadsheet applications recognise the file encoding.
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `student-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
