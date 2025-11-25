import API from './api.js';

// State management
let allLogs = [];
let filteredLogs = [];

window.onload = loaded;

/**
 * Main function that runs when the page loads
 */
function loaded() {
    console.log('Logs page loaded successfully!');
    initializeLogsPage();
}

/**
 * Initialize the logs page
 */
async function initializeLogsPage() {
    setupEventListeners();
    
    // Automatically fetch logs on page load
    await fetchAllLogs();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Fetch logs button
    const fetchLogsBtn = document.getElementById('fetchLogsBtn');
    if (fetchLogsBtn) {
        fetchLogsBtn.addEventListener('click', fetchAllLogs);
    }

    // Apply filters button
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }

    // Reset filters button
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }

    // Sort order change
    const sortOrder = document.getElementById('sortOrder');
    if (sortOrder) {
        sortOrder.addEventListener('change', handleSortChange);
    }

    // Date inputs - apply filters on change
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    if (startDate) {
        startDate.addEventListener('change', applyFilters);
    }
    if (endDate) {
        endDate.addEventListener('change', applyFilters);
    }

    // Category and symptom filters - apply on change
    const categoryFilter = document.getElementById('categoryFilter');
    const symptomFilter = document.getElementById('symptomFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    if (symptomFilter) {
        symptomFilter.addEventListener('change', applyFilters);
    }
}

/**
 * Fetch all logs from the API
 */
async function fetchAllLogs() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const logsList = document.getElementById('logsList');
    
    try {
        // Show loading indicator
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        }
        if (logsList) {
            logsList.style.opacity = '0.5';
        }

        // Fetch all meals
        console.log('Fetching all logs...');
        const meals = await API.getAllMeals();
        console.log('Fetched logs:', meals);

        // Store all logs
        allLogs = Array.isArray(meals) ? meals : [];
        filteredLogs = [...allLogs];

        // Apply current filters
        applyFilters();

        showNotification(`Successfully loaded ${allLogs.length} log(s)`, 'success');

    } catch (error) {
        console.error('Error fetching logs:', error);
        showNotification('Error loading logs. Please try again.', 'error');
        
        // Show error message in the list
        if (logsList) {
            logsList.innerHTML = '<p class="no-entries error-message">Failed to load logs. Please try again.</p>';
        }
    } finally {
        // Hide loading indicator
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        if (logsList) {
            logsList.style.opacity = '1';
        }
    }
}

/**
 * Apply filters to the logs
 */
function applyFilters() {
    if (allLogs.length === 0) {
        return;
    }

    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;
    const category = document.getElementById('categoryFilter')?.value;
    const symptomStatus = document.getElementById('symptomFilter')?.value;

    // Start with all logs
    filteredLogs = [...allLogs];

    // Apply date range filter
    if (startDate) {
        const startDateTime = new Date(startDate).setHours(0, 0, 0, 0);
        filteredLogs = filteredLogs.filter(log => {
            const logDate = new Date(log.timestamp).setHours(0, 0, 0, 0);
            return logDate >= startDateTime;
        });
    }

    if (endDate) {
        const endDateTime = new Date(endDate).setHours(23, 59, 59, 999);
        filteredLogs = filteredLogs.filter(log => {
            const logDate = new Date(log.timestamp).getTime();
            return logDate <= endDateTime;
        });
    }

    // Apply category filter
    if (category) {
        filteredLogs = filteredLogs.filter(log => {
            if (!log.categories) return false;
            
            // Parse categories - handle comma-separated strings, arrays, or single strings
            let categories = [];
            if (Array.isArray(log.categories)) {
                categories = log.categories;
            } else if (typeof log.categories === 'string') {
                // Split by comma and trim whitespace
                categories = log.categories.split(',').map(cat => cat.trim());
            }
            
            // Check for case-insensitive match
            return categories.some(cat => 
                cat.toLowerCase() === category.toLowerCase()
            );
        });
    }

    // Apply symptom filter
    if (symptomStatus === 'with-symptoms') {
        filteredLogs = filteredLogs.filter(log => log.symptom && log.symptom !== '');
    } else if (symptomStatus === 'no-symptoms') {
        filteredLogs = filteredLogs.filter(log => !log.symptom || log.symptom === '');
    }

    // Apply current sort order
    handleSortChange();

    // Update display
    updateStatsDisplay();
    displayLogs();
}

/**
 * Reset all filters
 */
function resetFilters() {
    // Clear filter inputs
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const categoryFilter = document.getElementById('categoryFilter');
    const symptomFilter = document.getElementById('symptomFilter');
    const sortOrder = document.getElementById('sortOrder');

    if (startDate) startDate.value = '';
    if (endDate) endDate.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (symptomFilter) symptomFilter.value = '';
    if (sortOrder) sortOrder.value = 'newest';

    // Reset to all logs
    filteredLogs = [...allLogs];
    
    // Apply sort and display
    handleSortChange();
    updateStatsDisplay();
    displayLogs();

    showNotification('Filters reset', 'info');
}

/**
 * Handle sort order change
 */
function handleSortChange() {
    const sortOrder = document.getElementById('sortOrder')?.value || 'newest';

    filteredLogs.sort((a, b) => {
        switch (sortOrder) {
            case 'newest':
                return new Date(b.timestamp) - new Date(a.timestamp);
            case 'oldest':
                return new Date(a.timestamp) - new Date(b.timestamp);
            case 'name-asc':
                return (a.foodName || '').localeCompare(b.foodName || '');
            case 'name-desc':
                return (b.foodName || '').localeCompare(a.foodName || '');
            default:
                return 0;
        }
    });

    displayLogs();
}

/**
 * Display filtered logs
 */
function displayLogs() {
    const logsList = document.getElementById('logsList');
    if (!logsList) return;

    if (filteredLogs.length === 0) {
        logsList.innerHTML = '<p class="no-entries">No logs match your filter criteria</p>';
        return;
    }

    // Clear existing logs
    logsList.innerHTML = '';

    // Create entry cards for each log
    filteredLogs.forEach(log => {
        const entryCard = createEntryCard(log);
        logsList.appendChild(entryCard);
    });

    // Update count display
    const logsCount = document.getElementById('logsCount');
    if (logsCount) {
        logsCount.textContent = `(${filteredLogs.length} log${filteredLogs.length !== 1 ? 's' : ''})`;
    }
}

/**
 * Create an entry card element
 */
function createEntryCard(meal) {
    const card = document.createElement('div');
    card.className = 'entry-card';
    
    // Add warning class if there's a symptom
    if (meal.symptom && meal.symptom !== '') {
        card.classList.add('entry-warning');
    }
    
    // Format timestamp
    const date = new Date(meal.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Format categories - handle comma-separated strings, arrays, or single strings
    let categories = 'Not specified';
    if (meal.categories) {
        if (Array.isArray(meal.categories)) {
            categories = meal.categories.map(cat => capitalizeFirst(cat)).join(', ');
        } else if (typeof meal.categories === 'string') {
            // Split by comma, trim, and capitalize each category
            categories = meal.categories.split(',').map(cat => capitalizeFirst(cat.trim())).join(', ');
        } else {
            categories = capitalizeFirst(String(meal.categories));
        }
    }
    
    // Format symptom
    const symptomText = meal.symptom && meal.symptom !== ''
        ? `${capitalizeFirst(meal.symptom)}${meal.severity ? ` - Severity ${meal.severity}` : ''}`
        : 'No symptoms';
    
    // Notes
    const notes = meal.notes && meal.notes !== '' 
        ? `<div class="entry-notes"><strong>Notes:</strong> ${meal.notes}</div>`
        : '';
    
    card.innerHTML = `
        <div class="entry-header">
            <span class="entry-title">${meal.foodName || 'Unnamed meal'}</span>
            <span class="entry-time">${formattedDate}</span>
        </div>
        <div class="entry-details">
            <span class="entry-category">${categories}</span>
            <span class="entry-symptom ${meal.symptom ? 'has-symptom' : ''}">${symptomText}</span>
        </div>
        ${notes}
        <div class="entry-actions">
            <button class="btn-icon-small" onclick="editMeal('${meal.id}')" title="Edit">✏️</button>
            <button class="btn-icon-small" onclick="deleteMealEntry('${meal.id}')" title="Delete">🗑️</button>
        </div>
    `;
    
    return card;
}

/**
 * Update statistics display
 */
function updateStatsDisplay() {
    const totalLogs = document.getElementById('totalLogs');
    const logsWithSymptoms = document.getElementById('logsWithSymptoms');
    const logsNoSymptoms = document.getElementById('logsNoSymptoms');
    const dateRangeDisplay = document.getElementById('dateRangeDisplay');

    // Calculate stats
    const total = filteredLogs.length;
    const withSymptoms = filteredLogs.filter(log => log.symptom && log.symptom !== '').length;
    const noSymptoms = total - withSymptoms;

    // Update displays
    if (totalLogs) totalLogs.textContent = total;
    if (logsWithSymptoms) logsWithSymptoms.textContent = withSymptoms;
    if (logsNoSymptoms) logsNoSymptoms.textContent = noSymptoms;

    // Update date range display
    if (dateRangeDisplay) {
        const startDate = document.getElementById('startDate')?.value;
        const endDate = document.getElementById('endDate')?.value;

        if (startDate && endDate) {
            const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dateRangeDisplay.textContent = `${start} - ${end}`;
        } else if (startDate) {
            const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dateRangeDisplay.textContent = `From ${start}`;
        } else if (endDate) {
            const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dateRangeDisplay.textContent = `Until ${end}`;
        } else {
            dateRangeDisplay.textContent = 'All Time';
        }
    }
}

/**
 * Capitalize first letter of string
 */
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Edit meal - navigate to form with meal ID
 */
window.editMeal = function(id) {
    window.location.href = `add-meal.html?id=${id}`;
};

/**
 * Delete meal entry
 */
window.deleteMealEntry = async function(id) {
    if (!confirm('Are you sure you want to delete this entry?')) {
        return;
    }
    
    try {
        await API.deleteMeal(id);
        showNotification('Entry deleted successfully', 'success');
        
        // Remove from local arrays
        allLogs = allLogs.filter(log => log.id !== id);
        filteredLogs = filteredLogs.filter(log => log.id !== id);
        
        // Update display
        updateStatsDisplay();
        displayLogs();
    } catch (error) {
        console.error('Error deleting meal:', error);
        showNotification('Error deleting entry', 'error');
    }
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification based on type
    const bgColor = {
        'info': '#3b82f6',
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b'
    }[type] || '#3b82f6';
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '0.5rem',
        backgroundColor: bgColor,
        color: 'white',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: '1000',
        animation: 'slideIn 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

export { fetchAllLogs, applyFilters, resetFilters };
