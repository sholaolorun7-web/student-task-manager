## Run the application

1. Download and extract the ZIP file.
2. Open the extracted `student-task-manager` folder in Visual Studio Code.
3. If necessary, install the **Live Server** extension.
4. Right-click `index.html`.
5. Select **Open with Live Server**.

You can also run another local static server from the project folder, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

> Do not open `index.html` directly with a `file://` URL. JavaScript ES modules are best tested through a local web server.

## How to use

### Add a task
Select **Add a task**, enter a title, choose a category and priority, and optionally set a due date and time. Select **Save task**.

### Edit, complete or delete a task
Open **My tasks**. Use the checkbox to change completion status, the pencil control to edit, or the × control to delete. Deletion asks for confirmation.

### Categories
Open **Categories** to view the built-in categories and create custom ones. A custom category can only be deleted when no tasks are assigned to it. Built-in categories are protected.

### Calendar
Open **Calendar** to navigate between months. Select a date to see tasks due on that date. Tasks without a due date do not appear on the calendar.

### Search and filters
Use the search field in the top bar to search task titles, descriptions and category names. The My tasks page provides status, category, priority and sorting controls.

### Theme
Use the moon/sun control in the top bar or the Appearance setting to switch themes. Your preference is saved in this browser.

### Export
Open **Settings → Export CSV** to download a spreadsheet-compatible CSV file of all tasks.

## Data and privacy

- Tasks, custom categories and theme preference are stored in the browser's Local Storage.
- Data stays in the current browser profile on the current device.
- There is no account, cloud database or automatic cross-device synchronisation.
- Clearing browser site data may remove saved tasks.
- Export important task data periodically using the CSV export option.

## Technical notes

- The app uses JavaScript ES modules (`type="module"`).
- Task data is stored as JSON in Local Storage.
- Task IDs use `crypto.randomUUID()` where available, with a fallback.
- Dates are compared using local calendar date strings to avoid UTC date-shift issues.
- User-provided text is escaped before being inserted into generated task and category markup.
- The app uses CSS media queries and safe-area spacing for mobile layouts.
- Google Fonts are loaded online when an internet connection is available. System sans-serif fallbacks are provided.

## Suggested testing checklist

- [ ] Add a task with all fields.
- [ ] Add a task without a due date.
- [ ] Edit a task and confirm its details update.
- [ ] Mark a task complete and then pending.
- [ ] Delete a task after confirming.
- [ ] Create a custom category and assign a task to it.
- [ ] Confirm a category with assigned tasks cannot be deleted.
- [ ] Search by title, description and category.
- [ ] Test each status and priority filter.
- [ ] Navigate calendar months and select dates.
- [ ] Refresh the page and confirm tasks remain.
- [ ] Switch themes and refresh the page.
- [ ] Export tasks and open the CSV file.
- [ ] Test at narrow mobile widths (320px, 360px and 390px).
- [ ] Test tablet and desktop layouts.

## Future improvements

Possible future extensions include recurring tasks, reminders, authentication, cloud synchronisation, multiple calendar views and a backend database. These are intentionally outside the current frontend-only version.

---

**Project:** Student Task Manager  
**Technologies:** HTML5, CSS3, Vanilla JavaScript  
**Version:** 1.0
