import { API_BASE_URL } from "../utils/index.js";

// --- Operations Management ---
const getOperations = async (filters) => {
    let url = `${API_BASE_URL}/operations`;
    const params = new URLSearchParams();

    if (filters.type && filters.type !== "all") {
        params.append("type", filters.type);
    }
    if (filters.category && filters.category !== "all") {
        params.append("category", filters.category);
    }
    // json-server handles sorting with _sort and _order
    switch (filters.sortBy) {
        case "recent":
            params.append("_sort", "date");
            params.append("_order", "desc");
            break;
        case "less-recent":
            params.append("_sort", "date");
            params.append("_order", "asc");
            break;
        case "higher-amount":
            params.append("_sort", "amount");
            params.append("_order", "desc");
            break;
        case "lower-amount":
            params.append("_sort", "amount");
            params.append("_order", "asc");
            break;
        case "a-z":
            params.append("_sort", "description");
            params.append("_order", "asc");
            break;
        case "z-a":
            params.append("_sort", "description");
            params.append("_order", "desc");
            break;
    }

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`Failed to fetch operations: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching operations:", error);
        return [];
    }
};

const addOperation = async (description, amount, type, category, date) => {
    const newOperation = {
        description,
        amount: parseFloat(amount),
        type,
        category,
        date,
    };
    try {
        const response = await fetch(`${API_BASE_URL}/operations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newOperation),
        });
        if (!response.ok)
            throw new Error(`Failed to add operation: ${response.statusText}`);
        return await response.json(); // Returns the added operation with its new ID
    } catch (error) {
        console.error("Error adding operation:", error);
        return null;
    }
};

const editOperation = async (
    id,
    newDescription,
    newAmount,
    newType,
    newCategory,
    newDate
) => {
    const updatedOperation = {
        description: newDescription,
        amount: parseFloat(newAmount),
        type: newType,
        category: newCategory,
        date: newDate,
    };
    try {
        const response = await fetch(`${API_BASE_URL}/operations/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedOperation),
        });
        if (!response.ok)
            throw new Error(`Failed to edit operation: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Error editing operation:", error);
        return null;
    }
};

const deleteOperation = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/operations/${id}`, {
            method: "DELETE",
        });
        if (!response.ok)
            throw new Error(`Failed to delete operation: ${response.statusText}`);
        return true;
    } catch (error) {
        console.error("Error deleting operation:", error);
        return false;
    }
};

// calculateBalance will now need to fetch all operations first
const calculateBalance = async () => {
  const operations = await getOperations({
    type: "all",
    category: "all",
    sortBy: "recent",
  }); // Fetch all operations for calculation
  let totalIncome = 0;
  let totalExpenses = 0;
  operations.forEach((op) => {
    if (op.type === "income") {
      totalIncome += op.amount;
    } else if (op.type === "expense") {
      totalExpenses += op.amount;
    }
  });
  return {
    income: totalIncome,
    expenses: totalExpenses,
    balance: totalIncome - totalExpenses,
  };
};

export {
    getOperations,
    addOperation,
    editOperation,
    deleteOperation,
    calculateBalance
}