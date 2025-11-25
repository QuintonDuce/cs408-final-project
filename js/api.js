/**
 * API Service Module
 * Handles all communication with the AWS API Gateway
 */

// Direct API URL - requires CORS to be enabled in AWS API Gateway
const API_BASE_URL = 'https://pz6u22o701.execute-api.us-east-2.amazonaws.com';

/**
 * API Service Object
 */
const API = {
    /**
     * Get all meals
     * @returns {Promise<Array>} Array of meal objects
     */
    async getAllMeals() {
        try {
            const response = await fetch(`${API_BASE_URL}/meals`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching all meals:', error);
            throw error;
        }
    },

    /**
     * Get a single meal by ID
     * @param {string} id - The meal ID
     * @returns {Promise<Object>} Meal object
     */
    async getMealById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/meals/${id}`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching meal ${id}:`, error);
            throw error;
        }
    },

    /**
     * Create a new meal entry (POST)
     * @param {Object} mealData - The meal data to create
     * @returns {Promise<Object>} Created meal object
     */
    async createMeal(mealData) {
        try {
            console.log('Sending meal data to API:', JSON.stringify(mealData, null, 2));
            
            const response = await fetch(`${API_BASE_URL}/meals`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mealData)
            });
            
            console.log('API Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('API Success response:', data);
            return data;
        } catch (error) {
            console.error('Error creating meal:', error);
            throw error;
        }
    },

    /**
     * Update an existing meal entry (PUT)
     * @param {string} id - The meal ID
     * @param {Object} mealData - The updated meal data
     * @returns {Promise<Object>} Updated meal object
     */
    async updateMeal(id, mealData) {
        try {
            const response = await fetch(`${API_BASE_URL}/meals/${id}`, {
                method: 'PUT',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mealData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error updating meal ${id}:`, error);
            throw error;
        }
    },

    /**
     * Delete a meal entry
     * @param {string} id - The meal ID
     * @returns {Promise<Object>} Deletion confirmation
     */
    async deleteMeal(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/meals/${id}`, {
                method: 'DELETE',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error deleting meal ${id}:`, error);
            throw error;
        }
    }
};

export default API;
