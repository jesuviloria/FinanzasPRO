import { FILTERS_STORAGE_KEY } from "../utils/index.js";

// --- Filters Persistence ---
const saveFilters = (filters) => {
  localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
};

const getSavedFilters = () => {
  return (
    JSON.parse(localStorage.getItem(FILTERS_STORAGE_KEY)) || {
      type: "all",
      category: "all",
      sortBy: "recent",
    }
  );
};

export {saveFilters, getSavedFilters}