// ====================================
// STUDYFLOW - MAIN JAVASCRIPT FILE
// ====================================

// Data Storage Object
let appData = {
    tasks: [],
    schedule: [],
    goals: [],
    lastUpdate: new Date().toDateString()
};

// ====================================
// INITIALIZATION
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initTheme();
    setupEventListeners();
    setTodayDate();
    updateDashboard();
    renderAllSections();
});

// ====================================
// DATA MANAGEMENT
// ====================================

function loadData() {
    const saved = localStorage.getItem('studyflowData');
    if (saved) {
        try {
            appData = JSON.parse(saved);
        } catch (e) {
            console.log('Error loading data, using defaults');
        }
    }
}

function saveData() {
    localStorage.setItem('studyflowData', JSON.stringify(appData));
}

// ====================================
// THEME MANAGEMENT
// ====================================

function initTheme() {
    // Check if dark mode preference is saved
    const savedTheme = localStorage.getItem('studyflowTheme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    if (savedTheme) {
        if (savedTheme === 'dark') {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
    } else if (prefersDark) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }

    // Setup theme toggle button
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    if (document.body.classList.contains('dark-mode')) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
}

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.innerHTML = '<span class="theme-icon">☀️</span>';
        themeBtn.title = 'Toggle light mode';
    }
    localStorage.setItem('studyflowTheme', 'dark');
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.innerHTML = '<span class="theme-icon">🌙</span>';
        themeBtn.title = 'Toggle dark mode';
    }
    localStorage.setItem('studyflowTheme', 'light');
}

// ====================================
// DATA MANAGEMENT
// ====================================

// ====================================
// EVENT LISTENERS SETUP
// ====================================

function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.tab;
            showTab(tabName);
        });
    });

    // Forms
    document.getElementById('quickAddForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addQuickTask();
    });

    document.getElementById('taskForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addTask();
    });

    document.getElementById('scheduleForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addScheduleItem();
    });

    document.getElementById('goalForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addGoal();
    });
}

// ====================================
// NAVIGATION
// ====================================

function showTab(tabName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active state from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show the selected section
    const section = document.getElementById(tabName);
    if (section) {
        section.classList.add('active');
    }

    // Activate the corresponding tab
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Refresh the section's content
    if (tabName === 'tasks') {
        renderTasks();
    } else if (tabName === 'schedule') {
        renderSchedule();
    } else if (tabName === 'goals') {
        renderGoals();
    } else if (tabName === 'analytics') {
        updateAnalytics();
    }
}

// ====================================
// DATE & TIME UTILITIES
// ====================================

function setTodayDate() {
    const today = new Date();
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    document.getElementById('todayDate').textContent = today.toLocaleDateString('en-US', options);
}

function formatDate(dateString) {
    if (!dateString) return 'No date';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

function getDaysUntil(dateString) {
    if (!dateString) return null;
    const targetDate = new Date(dateString + 'T23:59:59');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// ====================================
// TASK MANAGEMENT
// ====================================

function addQuickTask() {
    const title = document.getElementById('quickTaskInput').value.trim();
    const priority = document.getElementById('quickPriority').value;

    if (!title) {
        alert('Please enter a task title');
        return;
    }

    const task = {
        id: Date.now(),
        title,
        description: '',
        subject: '',
        priority,
        dueDate: getTodayString(),
        estimatedTime: 0,
        completed: false,
        createdAt: new Date().toISOString()
    };

    appData.tasks.push(task);
    document.getElementById('quickTaskInput').value = '';
    document.getElementById('quickPriority').value = 'medium';

    saveData();
    updateDashboard();
    renderTasks();
    renderAllSections();
}

function addTask() {
    const title = document.getElementById('taskTitle').value.trim();

    if (!title) {
        alert('Please enter a task title');
        return;
    }

    const task = {
        id: Date.now(),
        title,
        description: document.getElementById('taskDescription').value.trim(),
        subject: document.getElementById('taskSubject').value.trim(),
        priority: document.getElementById('taskPriority').value,
        dueDate: document.getElementById('taskDueDate').value || getTodayString(),
        estimatedTime: parseInt(document.getElementById('taskTime').value) || 0,
        completed: false,
        createdAt: new Date().toISOString()
    };

    appData.tasks.push(task);

    // Reset form
    document.getElementById('taskForm').reset();

    saveData();
    updateDashboard();
    renderTasks();
    renderAllSections();

    // Show success feedback
    showNotification('Task created successfully! 🎉');
}

function toggleTask(taskId) {
    const task = appData.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveData();
        updateDashboard();
        renderTasks();
        renderAllSections();

        if (task.completed) {
            showNotification('Great job! Task completed! ✨');
        }
    }
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        appData.tasks = appData.tasks.filter(t => t.id !== taskId);
        saveData();
        updateDashboard();
        renderTasks();
        renderAllSections();
        showNotification('Task deleted');
    }
}

// ====================================
// TASK RENDERING
// ====================================

function renderTasks() {
    const list = document.getElementById('tasksList');
    const recentList = document.getElementById('recentTasksList');

    if (appData.tasks.length === 0) {
        list.innerHTML = createEmptyState('📝', 'No tasks yet', 'Create your first task to get started!');
        recentList.innerHTML = createEmptyState('📝', 'No recent tasks');
        document.getElementById('taskCount').textContent = '0';
        return;
    }

    const filteredTasks = getFilteredTasks();
    const sortedTasks = filteredTasks.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const recentTasks = appData.tasks.slice(-3).reverse();

    list.innerHTML = sortedTasks.map(task => createTaskHTML(task)).join('');
    recentList.innerHTML = recentTasks.length > 0 ? recentTasks.map(task => createTaskHTML(task)).join('') : createEmptyState('📝', 'No recent tasks');

    document.getElementById('taskCount').textContent = filteredTasks.length;
}

function createTaskHTML(task) {
    const daysUntil = getDaysUntil(task.dueDate);
    let dueLabel = 'No due date';

    if (daysUntil !== null) {
        if (daysUntil === 0) dueLabel = 'Due today';
        else if (daysUntil === 1) dueLabel = 'Due tomorrow';
        else if (daysUntil > 1) dueLabel = `Due in ${daysUntil} days`;
        else dueLabel = 'Overdue';
    }

    return `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleTask(${task.id})">
            <div class="task-info">
                <div class="task-text">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                    <span>📅 ${dueLabel}</span>
                    ${task.subject ? `<span>📚 ${escapeHtml(task.subject)}</span>` : ''}
                    ${task.estimatedTime ? `<span>⏱️ ${task.estimatedTime}min</span>` : ''}
                </div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">Delete</button>
        </div>
    `;
}

function getFilteredTasks() {
    let filtered = [...appData.tasks];

    const priority = document.getElementById('filterPriority')?.value || '';
    const status = document.getElementById('filterStatus')?.value || '';
    const subject = document.getElementById('filterSubject')?.value || '';

    if (priority) {
        filtered = filtered.filter(t => t.priority === priority);
    }

    if (status === 'completed') {
        filtered = filtered.filter(t => t.completed);
    } else if (status === 'pending') {
        filtered = filtered.filter(t => !t.completed);
    }

    if (subject) {
        filtered = filtered.filter(t => t.subject.toLowerCase().includes(subject.toLowerCase()));
    }

    return filtered;
}

function filterTasks() {
    renderTasks();
}

function clearFilters() {
    document.getElementById('filterPriority').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterSubject').value = '';
    renderTasks();
}

// ====================================
// SCHEDULE MANAGEMENT
// ====================================

function addScheduleItem() {
    const title = document.getElementById('scheduleTitle').value.trim();

    if (!title) {
        alert('Please enter an event title');
        return;
    }

    const item = {
        id: Date.now(),
        title,
        subject: document.getElementById('scheduleSubject').value.trim(),
        date: document.getElementById('scheduleDate').value,
        time: document.getElementById('scheduleTime').value,
        duration: parseInt(document.getElementById('scheduleDuration').value) || 60,
        location: document.getElementById('scheduleLocation').value.trim(),
        createdAt: new Date().toISOString()
    };

    if (!item.date || !item.time) {
        alert('Please select date and time');
        return;
    }

    appData.schedule.push(item);
    document.getElementById('scheduleForm').reset();

    saveData();
    renderSchedule();
    renderAllSections();
    showNotification('Event added successfully! 📅');
}

function deleteScheduleItem(itemId) {
    if (confirm('Are you sure you want to delete this event?')) {
        appData.schedule = appData.schedule.filter(i => i.id !== itemId);
        saveData();
        renderSchedule();
        renderAllSections();
        showNotification('Event deleted');
    }
}

// ====================================
// SCHEDULE RENDERING
// ====================================

function renderSchedule() {
    const list = document.getElementById('scheduleList');
    const upcomingList = document.getElementById('upcomingScheduleList');

    if (appData.schedule.length === 0) {
        list.innerHTML = createEmptyState('📅', 'No scheduled events', 'Add classes and events to your schedule');
        upcomingList.innerHTML = createEmptyState('📅', 'No upcoming events');
        document.getElementById('eventCount').textContent = '0';
        return;
    }

    const filteredSchedule = getFilteredSchedule();
    const sortedSchedule = [...filteredSchedule].sort((a, b) => {
        return new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time);
    });

    const upcomingSchedule = sortedSchedule.filter(item => {
        const itemDate = new Date(item.date + 'T' + item.time);
        return itemDate >= new Date();
    }).slice(0, 3);

    list.innerHTML = sortedSchedule.map(item => createScheduleHTML(item)).join('');
    upcomingList.innerHTML = upcomingSchedule.length > 0 ? upcomingSchedule.map(item => createScheduleHTML(item)).join('') : createEmptyState('📅', 'No upcoming events');

    document.getElementById('eventCount').textContent = filteredSchedule.length;
}

function createScheduleHTML(item) {
    const dateObj = new Date(item.date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

    return `
        <div class="schedule-item">
            <div class="schedule-time">${item.time}</div>
            <div class="schedule-details">
                <div>
                    <div class="schedule-title">${escapeHtml(item.title)}</div>
                    <div class="schedule-subject">
                        ${item.subject ? escapeHtml(item.subject) + ' • ' : ''}${dayName} • ${item.location || 'TBA'}
                    </div>
                </div>
                <button class="btn btn-danger btn-sm" onclick="deleteScheduleItem(${item.id})">Delete</button>
            </div>
        </div>
    `;
}

function getFilteredSchedule() {
    const filterDate = document.getElementById('scheduleFilterDate')?.value || '';
    let filtered = appData.schedule;

    if (filterDate) {
        filtered = filtered.filter(item => item.date === filterDate);
    }

    return filtered.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
}

function filterSchedule() {
    renderSchedule();
}

// ====================================
// GOAL MANAGEMENT
// ====================================

function addGoal() {
    const title = document.getElementById('goalTitle').value.trim();

    if (!title) {
        alert('Please enter a goal title');
        return;
    }

    const goal = {
        id: Date.now(),
        title,
        description: document.getElementById('goalDescription').value.trim(),
        category: document.getElementById('goalCategory').value,
        dueDate: document.getElementById('goalDueDate').value,
        completed: false,
        progress: 0,
        createdAt: new Date().toISOString()
    };

    appData.goals.push(goal);
    document.getElementById('goalForm').reset();

    saveData();
    renderGoals();
    updateDashboard();
    renderAllSections();
    showNotification('Goal created! Let\'s achieve it! 🎯');
}

function toggleGoal(goalId) {
    const goal = appData.goals.find(g => g.id === goalId);
    if (goal) {
        goal.completed = !goal.completed;
        goal.progress = goal.completed ? 100 : goal.progress;
        saveData();
        renderGoals();
        updateDashboard();
        renderAllSections();

        if (goal.completed) {
            showNotification('Congratulations! Goal achieved! 🏆');
        }
    }
}

function deleteGoal(goalId) {
    if (confirm('Are you sure you want to delete this goal?')) {
        appData.goals = appData.goals.filter(g => g.id !== goalId);
        saveData();
        renderGoals();
        updateDashboard();
        renderAllSections();
        showNotification('Goal deleted');
    }
}

// ====================================
// GOAL RENDERING
// ====================================

function renderGoals() {
    const list = document.getElementById('goalsList');

    if (appData.goals.length === 0) {
        list.innerHTML = createEmptyState('🎯', 'No goals yet', 'Set ambitious goals to achieve great things!');
        document.getElementById('goalCount').textContent = '0';
        return;
    }

    const goalCategories = {
        academic: '🎓',
        personal: '👤',
        health: '💪',
        skill: '⚡'
    };

    list.innerHTML = appData.goals.map(goal => `
        <div class="goal-card ${goal.completed ? 'completed' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
                <div style="flex: 1;">
                    <div style="font-size: 16px; font-weight: 700; color: var(--text-primary);">
                        ${goalCategories[goal.category] || '🎯'} ${escapeHtml(goal.title)}
                    </div>
                    <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                        ${escapeHtml(goal.description)}
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap;">
                        <span class="badge">${goal.category}</span>
                        <span style="font-size: 12px; color: var(--text-secondary);">📅 ${formatDate(goal.dueDate)}</span>
                    </div>
                </div>
                <button class="btn btn-danger btn-sm" onclick="deleteGoal(${goal.id})">Delete</button>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${goal.progress}%"></div>
            </div>
            <div style="display: flex; gap: 12px; margin-top: 12px;">
                <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="toggleGoal(${goal.id})">
                    ${goal.completed ? '✓ Completed' : 'Mark Complete'}
                </button>
            </div>
        </div>
    `).join('');

    document.getElementById('goalCount').textContent = appData.goals.length;
}

// ====================================
// DASHBOARD & ANALYTICS
// ====================================

function updateDashboard() {
    // Header stats
    const totalTasks = appData.tasks.length;
    const completedTasks = appData.tasks.filter(t => t.completed).length;

    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;

    // Today's stats
    const today = getTodayString();
    const todayTasks = appData.tasks.filter(t => t.dueDate === today);
    const todayCompleted = todayTasks.filter(t => t.completed).length;
    const todayProgress = todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0;

    document.getElementById('todayTasks').textContent = todayTasks.length;
    document.getElementById('todayCompleted').textContent = todayCompleted;
    document.getElementById('todayProgress').textContent = todayProgress + '%';

    // Goal stats
    const totalGoals = appData.goals.length;
    const completedGoals = appData.goals.filter(g => g.completed).length;
    const inProgressGoals = appData.goals.filter(g => !g.completed).length;

    document.getElementById('totalGoals').textContent = totalGoals;
    document.getElementById('completedGoals').textContent = completedGoals;
    document.getElementById('inProgressGoals').textContent = inProgressGoals;

    // Streak calculation
    const streak = completedGoals > 0 ? completedGoals : 0;
    document.getElementById('currentStreak').textContent = streak;

    // Focus time
    const totalFocusMinutes = appData.tasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
    document.getElementById('todayFocus').textContent = (totalFocusMinutes / 60).toFixed(1) + 'h';

    updateAnalytics();
    renderDashboardSections();
}

function updateAnalytics() {
    const weekTasks = appData.tasks.filter(t => t.completed).length;
    const totalFocus = appData.tasks.reduce((sum, t) => sum + parseInt(t.estimatedTime || 0), 0);
    const totalTasks = appData.tasks.length;

    const highPriority = appData.tasks.filter(t => t.priority === 'high').length;
    const mediumPriority = appData.tasks.filter(t => t.priority === 'medium').length;
    const lowPriority = appData.tasks.filter(t => t.priority === 'low').length;
    const totalPriority = highPriority + mediumPriority + lowPriority;

    // Weekly stats
    document.getElementById('weekTasksCompleted').textContent = weekTasks;
    document.getElementById('weekTotalFocus').textContent = (totalFocus / 60).toFixed(1) + 'h';
    document.getElementById('weekProductivity').textContent = (totalTasks > 0 ? Math.round((weekTasks / totalTasks) * 100) : 0) + '%';
    document.getElementById('weekAvgPerDay').textContent = (weekTasks / 7).toFixed(1);

    // Priority distribution
    document.getElementById('highPriorityCount').textContent = highPriority;
    document.getElementById('mediumPriorityCount').textContent = mediumPriority;
    document.getElementById('lowPriorityCount').textContent = lowPriority;

    // Update priority bars
    if (totalPriority > 0) {
        document.getElementById('highPriorityBar').style.width = (highPriority / totalPriority * 100) + '%';
        document.getElementById('mediumPriorityBar').style.width = (mediumPriority / totalPriority * 100) + '%';
        document.getElementById('lowPriorityBar').style.width = (lowPriority / totalPriority * 100) + '%';
    }

    // Subject stats
    const subjects = {};
    appData.tasks.forEach(task => {
        if (task.subject) {
            subjects[task.subject] = (subjects[task.subject] || 0) + 1;
        }
    });

    const subjectStats = document.getElementById('subjectStats');
    if (Object.keys(subjects).length > 0) {
        subjectStats.innerHTML = Object.entries(subjects).map(([subject, count]) => {
            const percentage = (count / totalTasks) * 100;
            return `
                <div class="subject-stat-item">
                    <div>
                        <div class="subject-name">${escapeHtml(subject)}</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                    <div class="subject-count">${count}</div>
                </div>
            `;
        }).join('');
    } else {
        subjectStats.innerHTML = '<p style="color: var(--text-secondary);">No subject data yet</p>';
    }

    // Achievements
    updateAchievements();
}

function updateAchievements() {
    const achievements = [];
    const completedTasks = appData.tasks.filter(t => t.completed).length;
    const completedGoals = appData.goals.filter(g => g.completed).length;
    const highPriorityCompleted = appData.tasks.filter(t => t.priority === 'high' && t.completed).length;

    if (completedTasks >= 1) achievements.push({ icon: '🎖️', name: 'Task Master' });
    if (completedTasks >= 10) achievements.push({ icon: '⭐', name: 'Productive' });
    if (completedGoals >= 1) achievements.push({ icon: '🏆', name: 'Goal Achiever' });
    if (highPriorityCompleted >= 5) achievements.push({ icon: '⚡', name: 'High Priority Hero' });
    if (appData.tasks.length >= 20) achievements.push({ icon: '🚀', name: 'Ambitious Planner' });

    const achievementsDiv = document.getElementById('achievements');
    achievementsDiv.innerHTML = achievements.length > 0 
        ? achievements.map(a => `
            <div class="achievement">
                <div class="achievement-icon">${a.icon}</div>
                <div class="achievement-name">${a.name}</div>
            </div>
        `).join('')
        : '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Keep working to unlock achievements!</p>';
}

function renderDashboardSections() {
    // Render recent tasks in dashboard
    const recentTasksList = document.getElementById('recentTasksList');
    const recentTasks = appData.tasks.slice(-3).reverse();
    
    if (recentTasks.length > 0) {
        recentTasksList.innerHTML = recentTasks.map(task => createTaskHTML(task)).join('');
    } else {
        recentTasksList.innerHTML = createEmptyState('📝', 'No recent tasks');
    }

    // Render upcoming schedule in dashboard
    const upcomingScheduleList = document.getElementById('upcomingScheduleList');
    const upcomingSchedule = appData.schedule
        .filter(item => new Date(item.date + 'T' + item.time) >= new Date())
        .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
        .slice(0, 3);

    if (upcomingSchedule.length > 0) {
        upcomingScheduleList.innerHTML = upcomingSchedule.map(item => createScheduleHTML(item)).join('');
    } else {
        upcomingScheduleList.innerHTML = createEmptyState('📅', 'No upcoming events');
    }
}

// ====================================
// RENDERING ALL SECTIONS
// ====================================

function renderAllSections() {
    renderTasks();
    renderSchedule();
    renderGoals();
}

// ====================================
// UTILITY FUNCTIONS
// ====================================

function createEmptyState(icon, title, subtitle = '') {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <div class="empty-state-title">${title}</div>
            ${subtitle ? `<p>${subtitle}</p>` : ''}
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        z-index: 1000;
        animation: slideUp 0.3s ease-out;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ====================================
// KEYBOARD SHORTCUTS (optional enhancement)
// ====================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('filterSubject');
        if (searchInput) searchInput.focus();
    }
});