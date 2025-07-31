import { AUTH_STORAGE_KEY, FILTERS_STORAGE_KEY, API_BASE_URL } from "../utils/index.js";

// --- Authentication ---
const authenticateUser = async (username, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) throw new Error(`Failed to fetch users: ${response.statusText}`);
        const users = await response.json();

        const userFound = users.find(user => user.username === username && user.password === password);

        if (userFound) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(true)); // Set true
            return true;
        }
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(false)); // Set false if login fails
        return false;
    } catch (error) {
        console.error('Error during authentication:', error);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(false)); // Set false on error
        return false;
    }
};

const logoutUser = () => {
    // Only interact with localStorage
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(FILTERS_STORAGE_KEY); // Clear filters on logout
};

const getAuthStatus = () => {
    // ALWAYS read directly from localStorage for the current status
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) || false;
};

export {
    authenticateUser, logoutUser, getAuthStatus
}

