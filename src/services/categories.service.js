import { API_BASE_URL } from "../utils/index.js";

import { getOperations } from '../services/index.service.js'

// --- Categories Management ---
const getCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok)
            throw new Error(`Failed to fetch categories: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
};

const addCategory = async (name) => {
    const newCategory = { name };
    try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCategory),
        });
        if (!response.ok)
            throw new Error(`Failed to add category: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Error adding category:", error);
        return null;
    }
};

const editCategory = async (id, newName) => {
    const updatedCategory = { name: newName };
    try {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCategory),
        });
        if (!response.ok)
            throw new Error(`Failed to edit category: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Error editing category:", error);
        return null;
    }
};

const deleteCategory = async (id) => {
    try {
        // First, check if there are associated operations
        const associatedOperations = (
            await getOperations({ type: "all", category: id, sortBy: "recent" })
        ).filter((op) => op.category == id); // Use == for ID comparison
        if (associatedOperations.length > 0) {
            throw new Error(
                "Cannot delete category with associated operations. Please reassign or delete operations first."
            );
        }

        // Then, delete the category itself
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: "DELETE",
        });
        if (!response.ok)
            throw new Error(`Failed to delete category: ${response.statusText}`);
        return true;
    } catch (error) {
        console.error("Error deleting category:", error);
        alert(error.message); // Show a user-friendly alert for the error
        return false;
    }
};

export {
    getCategories,
    addCategory,
    editCategory,
    deleteCategory,
}