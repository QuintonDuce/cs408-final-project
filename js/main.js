import API from './api.js';

window.onload = loaded;

/**
 * Main function that runs when the page loads
 */
function loaded() {
    console.log('Diet Tracker loaded successfully!');
    initializeApp();
}

/**
 * Initialize the application
 */
async function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Load real data from API
    await loadDashboardData();
    
    // Add animation on scroll
    addScrollAnimations();
}

/**
 * Set up event listeners for interactive elements
 */
function setupEventListeners() {
    // Log New Meal button
    const logMealBtn = document.getElementById('logMealBtn');
    if (logMealBtn) {
        logMealBtn.addEventListener('click', handleLogMealClick);
    }
    
    // Stat cards - add click interaction
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('click', handleStatCardClick);
    });
}

/**
 * Handle Log Meal button click
 */
function handleLogMealClick() {
    console.log('Log Meal button clicked');
    // Navigate to meal logging page
    window.location.href = 'add-meal.html';
}

/**
 * Handle stat card click
 */
function handleStatCardClick(event) {
    const card = event.currentTarget;
    const label = card.querySelector('.stat-label').textContent;
    console.log(`Clicked on ${label} card`);
    
    // Add a pulse effect
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
        card.style.transform = '';
    }, 100);
}

/**
 * Load dashboard data from API
 */
async function loadDashboardData() {
    try {
        // Fetch all meals from API
        const meals = await API.getAllMeals();
        console.log('Fetched meals:', meals);
        
        // Calculate statistics from the meals
        const stats = calculateStats(meals);
        
        // Update the dashboard
        updateDashboardStats(stats);
        
        // Display recent entries
        displayRecentEntries(meals);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading data. Using sample data.', 'error');
        
        // Fall back to sample data
        const sampleData = {
            mealsCount: 0,
            issuesCount: 0,
            dairyCount: 0,
            redMeatCount: 0
        };
        updateDashboardStats(sampleData);
    }
}

/**
 * Calculate statistics from meals data
 */
function calculateStats(meals) {
    if (!meals || !Array.isArray(meals)) {
        return {
            mealsCount: 0,
            issuesCount: 0,
            dairyCount: 0,
            redMeatCount: 0
        };
    }
    
    const stats = {
        mealsCount: meals.length,
        issuesCount: 0,
        dairyCount: 0,
        redMeatCount: 0
    };
    
    meals.forEach(meal => {
        // Count meals with symptoms
        if (meal.symptom && meal.symptom !== '') {
            stats.issuesCount++;
        }
        
        // Parse categories - handle comma-separated strings, arrays, or single strings
        let categories = [];
        if (Array.isArray(meal.categories)) {
            categories = meal.categories.map(cat => cat.toLowerCase());
        } else if (typeof meal.categories === 'string') {
            categories = meal.categories.split(',').map(cat => cat.trim().toLowerCase());
        }
        
        // Count dairy items
        if (categories.includes('dairy')) {
            stats.dairyCount++;
        }
        
        // Count red meat items
        if (categories.includes('red-meat')) {
            stats.redMeatCount++;
        }
    });
    
    return stats;
}

/**
 * Display recent meal entries
 */
function displayRecentEntries(meals) {
    const entriesList = document.getElementById('entriesList');
    if (!entriesList) return;
    
    if (!meals || meals.length === 0) {
        entriesList.innerHTML = '<p class="no-entries">No entries yet. Start by logging your first meal!</p>';
        return;
    }
    
    // Sort meals by timestamp (most recent first)
    const sortedMeals = [...meals].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Take only the 5 most recent
    const recentMeals = sortedMeals.slice(0, 5);
    
    // Clear existing entries
    entriesList.innerHTML = '';
    
    // Create entry cards
    recentMeals.forEach(meal => {
        const entryCard = createEntryCard(meal);
        entriesList.appendChild(entryCard);
    });
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
    const timeAgo = getTimeAgo(meal.timestamp);
    
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
    
    card.innerHTML = `
        <div class="entry-header">
            <span class="entry-title">${meal.foodName || 'Unnamed meal'}</span>
            <span class="entry-time">${timeAgo}</span>
        </div>
        <div class="entry-details">
            <span class="entry-category">${capitalizeFirst(categories)}</span>
            <span class="entry-symptom ${meal.symptom ? 'has-symptom' : ''}">${symptomText}</span>
        </div>
        <div class="entry-actions">
            <button class="btn-icon-small" onclick="editMeal('${meal.id}')" title="Edit">✏️</button>
            <button class="btn-icon-small" onclick="deleteMealEntry('${meal.id}')" title="Delete">🗑️</button>
        </div>
    `;
    
    return card;
}

/**
 * Get relative time string
 */
function getTimeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
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
        
        // Reload dashboard data
        await loadDashboardData();
    } catch (error) {
        console.error('Error deleting meal:', error);
        showNotification('Error deleting entry', 'error');
    }
}

/**
 * Update dashboard statistics
 */
function updateDashboardStats(data) {
    const elements = {
        mealsCount: document.getElementById('mealsCount'),
        issuesCount: document.getElementById('issuesCount'),
        dairyCount: document.getElementById('dairyCount'),
        redMeatCount: document.getElementById('redMeatCount')
    };
    
    // Animate the numbers
    Object.keys(data).forEach(key => {
        if (elements[key]) {
            animateValue(elements[key], 0, data[key], 1000);
        }
    });
}

/**
 * Animate a number value
 */
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            element.textContent = end;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

/**
 * Add scroll animations
 */
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for animation
    const sections = document.querySelectorAll('.stats, .recent-entries, .info-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
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

/**
 * Export functions for testing
 */
export { initializeApp, loadDashboardData, animateValue, showNotification };
