/**
 * Form Handler Module
 * Handles the meal logging form
 */

import API from './api.js';

window.onload = loaded;

let editMode = false;
let editingMealId = null;

/**
 * Main function that runs when the page loads
 */
function loaded() {
    console.log('Form page loaded successfully!');
    initializeForm();
}

/**
 * Initialize the form
 */
async function initializeForm() {
    // Set up event listeners
    setupEventListeners();
    
    // Set default timestamp to now
    setDefaultTimestamp();
    
    // Check if we're editing an existing meal
    const urlParams = new URLSearchParams(window.location.search);
    const mealId = urlParams.get('id');
    
    if (mealId) {
        await loadMealForEditing(mealId);
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Form submission
    const form = document.getElementById('mealForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', handleCancel);
    }
    
    // Symptom selector - show/hide severity
    const symptomSelect = document.getElementById('symptom');
    if (symptomSelect) {
        symptomSelect.addEventListener('change', handleSymptomChange);
    }
    
    // Severity slider
    const severitySlider = document.getElementById('severity');
    if (severitySlider) {
        severitySlider.addEventListener('input', handleSeverityChange);
    }
}

/**
 * Set default timestamp to current date/time
 */
function setDefaultTimestamp() {
    const timestampInput = document.getElementById('timestamp');
    if (timestampInput) {
        const now = new Date();
        // Format for datetime-local input
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        timestampInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
}

/**
 * Load meal data for editing
 */
async function loadMealForEditing(mealId) {
    try {
        showLoading(true);
        
        const meal = await API.getMealById(mealId);
        console.log('Loaded meal for editing:', meal);
        
        editMode = true;
        editingMealId = mealId;
        
        // Update page title
        const formTitle = document.querySelector('.form-title');
        if (formTitle) {
            formTitle.textContent = 'Edit Meal';
        }
        
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.innerHTML = '<span class="btn-icon">✓</span> Update Entry';
        }
        
        // Populate form with meal data
        populateForm(meal);
        
        showLoading(false);
    } catch (error) {
        console.error('Error loading meal:', error);
        showNotification('Error loading meal data', 'error');
        showLoading(false);
    }
}

/**
 * Populate form with meal data
 */
function populateForm(meal) {
    // Food name
    const foodNameInput = document.getElementById('foodName');
    if (foodNameInput) {
        foodNameInput.value = meal.foodName || '';
    }
    
    // Categories
    if (meal.categories) {
        const categories = Array.isArray(meal.categories) 
            ? meal.categories 
            : meal.categories.split(',').map(c => c.trim());
        
        const checkboxes = document.querySelectorAll('input[name="categories"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = categories.includes(checkbox.value);
        });
    }
    
    // Timestamp
    const timestampInput = document.getElementById('timestamp');
    if (timestampInput && meal.timestamp) {
        const date = new Date(meal.timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        timestampInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    // Symptom
    const symptomSelect = document.getElementById('symptom');
    if (symptomSelect) {
        symptomSelect.value = meal.symptom || '';
        handleSymptomChange({ target: symptomSelect });
    }
    
    // Severity
    const severitySlider = document.getElementById('severity');
    if (severitySlider && meal.severity) {
        severitySlider.value = meal.severity;
        handleSeverityChange({ target: severitySlider });
    }
    
    // Notes
    const notesTextarea = document.getElementById('notes');
    if (notesTextarea) {
        notesTextarea.value = meal.notes || '';
    }
}

/**
 * Handle symptom selection change
 */
function handleSymptomChange(event) {
    const symptomValue = event.target.value;
    const severityGroup = document.getElementById('severityGroup');
    
    if (severityGroup) {
        if (symptomValue && symptomValue !== '') {
            severityGroup.style.display = 'block';
        } else {
            severityGroup.style.display = 'none';
        }
    }
}

/**
 * Handle severity slider change
 */
function handleSeverityChange(event) {
    const value = event.target.value;
    const valueDisplay = document.getElementById('severityValue');
    
    if (valueDisplay) {
        valueDisplay.textContent = value;
    }
}

/**
 * Handle form submission
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        showLoading(true);
        
        // Get form data
        const formData = getFormData();
        
        // Validate form data
        if (!validateFormData(formData)) {
            showLoading(false);
            return;
        }
        
        console.log('Submitting meal data:', formData);
        
        // Submit to API
        let result;
        if (editMode && editingMealId) {
            result = await API.updateMeal(editingMealId, formData);
            showNotification('Meal updated successfully!', 'success');
        } else {
            result = await API.createMeal(formData);
            showNotification('Meal logged successfully!', 'success');
        }
        
        console.log('API response:', result);
        
        showLoading(false);
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showNotification('Error saving meal. Please try again.', 'error');
        showLoading(false);
    }
}

/**
 * Get form data
 */
function getFormData() {
    const formData = {};
    
    // Food name
    formData.foodName = document.getElementById('foodName').value.trim();
    
    // Categories - convert array to comma-separated string for API
    const categoryCheckboxes = document.querySelectorAll('input[name="categories"]:checked');
    const categoriesArray = Array.from(categoryCheckboxes).map(cb => cb.value);
    formData.categories = categoriesArray.join(',');
    
    // Timestamp - convert to ISO 8601 format with timezone
    const timestampValue = document.getElementById('timestamp').value;
    if (timestampValue) {
        // Create a Date object from the local datetime-local input
        const date = new Date(timestampValue);
        // Convert to ISO string (includes timezone)
        formData.timestamp = date.toISOString();
    }
    
    // Symptom - only include if not empty
    const symptom = document.getElementById('symptom').value;
    if (symptom && symptom !== '') {
        formData.symptom = symptom;
        
        // Severity (only if symptom is selected)
        formData.severity = parseInt(document.getElementById('severity').value);
    }
    
    // Notes - only include if not empty
    const notes = document.getElementById('notes').value.trim();
    if (notes) {
        formData.notes = notes;
    }
    
    return formData;
}

/**
 * Validate form data
 */
function validateFormData(formData) {
    if (!formData.foodName) {
        showNotification('Please enter a food name', 'error');
        return false;
    }
    
    if (!formData.categories || formData.categories.length === 0) {
        showNotification('Please select at least one category', 'error');
        return false;
    }
    
    if (!formData.timestamp) {
        showNotification('Please select when you ate this meal', 'error');
        return false;
    }
    
    return true;
}

/**
 * Handle cancel button
 */
function handleCancel() {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        window.location.href = 'index.html';
    }
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const form = document.getElementById('mealForm');
    
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'flex' : 'none';
    }
    
    if (form) {
        form.style.opacity = show ? '0.5' : '1';
        form.style.pointerEvents = show ? 'none' : 'auto';
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
