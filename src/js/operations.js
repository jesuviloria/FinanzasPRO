import {
  getAuthStatus,
  logoutUser,
  saveFilters,
  getSavedFilters,
  getOperations,
  addOperation,
  editOperation,
  deleteOperation,
  calculateBalance,
  getCategories,
} from "../services/index.service.js";

import {
  showElement,
  hideElement,
  clearMessage,
  renderOperationsTable,
  updateBalanceDisplay,
  populateCategorySelect,
} from "./dom.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Check authentication status first
  if (!getAuthStatus()) {
    window.location.href = "../../index.html"; // Redirect to login if not authenticated
    return;
  }

  // --- DOM Elements ---
  const logoutBtn = document.getElementById("logout-btn");

  // Balance Summary
  const totalIncomeEl = document.getElementById("total-income");
  const totalExpensesEl = document.getElementById("total-expenses");
  const totalBalanceEl = document.getElementById("total-balance");

  // Filters
  const filterTypeSelect = document.getElementById("filter-type");
  const filterCategorySelect = document.getElementById("filter-category");
  const sortBySelect = document.getElementById("sort-by");
  const clearFiltersBtn = document.getElementById("clear-filters-btn");

  // Operations Table
  const addOperationBtn = document.getElementById("add-operation-btn");
  const operationsTableBody = document.querySelector("#operations-list tbody");
  const noOperationsMessage = document.getElementById("no-operations-message");

  // Operation Modal Form
  const operationModal = document.getElementById("operation-modal");
  const closeModalBtn = document.querySelector(".close-modal");
  const operationForm = document.getElementById("operation-form");
  const operationFormTitle = document.getElementById("operation-form-title");
  const operationDescriptionInput = document.getElementById(
    "operation-description"
  );
  const operationAmountInput = document.getElementById("operation-amount");
  const operationTypeSelect = document.getElementById("operation-type");
  const operationCategorySelect = document.getElementById("operation-category");
  const operationDateInput = document.getElementById("operation-date");

  let currentOperationId = null; // To store ID for editing

  // --- Event Listeners ---
  logoutBtn.addEventListener("click", () => {
    logoutUser();
    window.location.href = "../../index.html";
  });

  filterTypeSelect.addEventListener("change", refreshOperationsAndBalance);
  filterCategorySelect.addEventListener("change", refreshOperationsAndBalance);
  sortBySelect.addEventListener("change", refreshOperationsAndBalance);
  clearFiltersBtn.addEventListener("click", () => {
    filterTypeSelect.value = "all";
    filterCategorySelect.value = "all";
    sortBySelect.value = "recent";
    refreshOperationsAndBalance();
  });

  addOperationBtn.addEventListener("click", () => {
    openOperationModal("add");
  });

  closeModalBtn.addEventListener("click", () => {
    hideElement(operationModal);
  });

  operationModal.addEventListener("click", (e) => {
    if (e.target === operationModal) {
      // Close when clicking outside the modal content
      hideElement(operationModal);
    }
  });

  operationForm.addEventListener("submit", handleOperationFormSubmit);

  operationsTableBody.addEventListener("click", (event) => {
    const target = event.target;
    const button = target.closest("button");

    if (button) {
      const operationId = button.dataset.id;
      if (button.classList.contains("edit-btn")) {
        openOperationModal("edit", operationId);
      } else if (button.classList.contains("delete-btn")) {
        if (confirm("Are you sure you want to delete this operation?")) {
          handleDeleteOperation(operationId);
        }
      }
    }
  });

  // --- Functions ---
  async function loadAllData() {
    const categories = await getCategories();
    populateCategorySelect(filterCategorySelect, categories, true); // For filter select
    populateCategorySelect(operationCategorySelect, categories, false); // For operation form select

    // Apply saved filters
    const savedFilters = getSavedFilters();
    filterTypeSelect.value = savedFilters.type;
    filterCategorySelect.value = savedFilters.category;
    sortBySelect.value = savedFilters.sortBy;

    await refreshOperationsAndBalance();
  }

  async function refreshOperationsAndBalance() {
    const currentFilters = {
      type: filterTypeSelect.value,
      category: filterCategorySelect.value,
      sortBy: sortBySelect.value,
    };
    saveFilters(currentFilters); // Save filters to localStorage

    const categories = await getCategories(); // Re-fetch categories to ensure they're up-to-date
    const operations = await getOperations(currentFilters);
    const balanceData = await calculateBalance(); // Calculates based on all operations

    renderOperationsTable(
      operations,
      categories,
      operationsTableBody,
      noOperationsMessage
    );
    updateBalanceDisplay(
      balanceData,
      totalIncomeEl,
      totalExpensesEl,
      totalBalanceEl
    );
  }

  function openOperationModal(mode, operationId = null) {
    clearMessage(document.getElementById("operation-error") || null); // Clear potential form error
    operationForm.reset();
    currentOperationId = operationId;

    if (mode === "add") {
      operationFormTitle.textContent = "New Operation";
      // Set current date as default for new operation
      operationDateInput.value = new Date().toISOString().split("T")[0];
    } else if (mode === "edit") {
      operationFormTitle.textContent = "Edit Operation";
      // Find operation and pre-fill form
      (async () => {
        const operations = await getOperations(getSavedFilters()); // Get all operations (or specific one)
        const operation = operations.find((op) => op.id == operationId); // Use == for ID comparison
        if (operation) {
          operationDescriptionInput.value = operation.description;
          operationAmountInput.value = operation.amount;
          operationTypeSelect.value = operation.type;
          operationCategorySelect.value = operation.category;
          operationDateInput.value = operation.date;
        }
      })();
    }
    showElement(operationModal);
  }

  async function handleOperationFormSubmit(event) {
    event.preventDefault();

    const description = operationDescriptionInput.value.trim();
    const amount = parseFloat(operationAmountInput.value);
    const type = operationTypeSelect.value;
    const category = operationCategorySelect.value;
    const date = operationDateInput.value;

    if (
      !description ||
      isNaN(amount) ||
      amount <= 0 ||
      !type ||
      !category ||
      !date
    ) {
      alert("Please fill in all fields correctly."); // Basic client-side validation
      return;
    }

    let success = false;
    if (currentOperationId) {
      success = await editOperation(
        currentOperationId,
        description,
        amount,
        type,
        category,
        date
      );
    } else {
      success = await addOperation(description, amount, type, category, date);
    }

    if (success) {
      hideElement(operationModal);
      await refreshOperationsAndBalance(); // Refresh data and UI
    } else {
      alert("Failed to save operation. Please try again."); // More robust error handling needed
    }
  }

  async function handleDeleteOperation(id) {
    const success = await deleteOperation(id);
    if (success) {
      await refreshOperationsAndBalance();
    } else {
      alert("Failed to delete operation. Please try again.");
    }
  }

  // --- Initial Load ---
  loadAllData();
});
