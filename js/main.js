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
function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Load sample data (this will be replaced with actual data later)
    loadDashboardData();
    
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
    // For now, show an alert. Later this will navigate to a form page
    showNotification('This will open the meal logging form', 'info');
    
    // TODO: Navigate to meal logging page
    // window.location.href = 'add-meal.html';
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
 * Load dashboard data
 */
function loadDashboardData() {
    // This is sample data - will be replaced with API calls later
    const data = {
        mealsCount: 12,
        issuesCount: 3,
        dairyCount: 9,
        redMeatCount: 12
    };
    
    updateDashboardStats(data);
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
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '0.5rem',
        backgroundColor: type === 'info' ? '#3b82f6' : '#10b981',
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
