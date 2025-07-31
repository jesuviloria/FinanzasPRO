import {
  getAuthStatus,
  logoutUser,
  getCategories,
  addCategory,
  editCategory,
  deleteCategory,
} from "../services/index.service.js";

import {
  showElement,
  hideElement,
  renderCategoriesTable,
  displayMessage,
  clearMessage,
} from "./dom.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Check authentication status
  if (!getAuthStatus()) {
    window.location.href = "../../index.html";
    return;
  }

  // --- DOM Elements ---
  const logoutBtn = document.getElementById("logout-btn");
  const categoryForm = document.getElementById("category-form");
  const categoryNameInput = document.getElementById("category-name");
  const categoriesTableBody = document.querySelector("#categories-list tbody");
  const noCategoriesMessage = document.getElementById("no-categories-message");
  const submitCategoryBtn = categoryForm.querySelector('button[type="submit"]');
  const cancelCategoryEditBtn = document.getElementById(
    "cancel-category-edit-btn"
  );

  let currentCategoryId = null;

  // --- Event Listeners ---
  logoutBtn.addEventListener("click", () => {
    logoutUser();
    window.location.href = "../../index.html";
  });

  categoryForm.addEventListener("submit", handleCategoryFormSubmit);

  // Add event listener for cancel button
  cancelCategoryEditBtn.addEventListener("click", () => {
    resetCategoryForm();
  });

  categoriesTableBody.addEventListener("click", (event) => {
    const target = event.target;
    const button = target.closest("button");

    if (button) {
      const categoryId = button.dataset.id;
      if (button.classList.contains("edit-cat-btn")) {
        handleEditCategory(categoryId);
      } else if (button.classList.contains("delete-cat-btn")) {
        if (
          confirm(
            "Are you sure you want to delete this category? (Operations associated with it might prevent deletion or require reassignment)"
          )
        ) {
          handleDeleteCategory(categoryId);
        }
      }
    }
  });

  // --- Functions ---
  async function refreshCategoriesTable() {
    const categories = await getCategories();
    renderCategoriesTable(categories, categoriesTableBody, noCategoriesMessage);
  }

  // Function to reset the form and revert to "Add" mode
  function resetCategoryForm() {
    categoryForm.reset();
    currentCategoryId = null;
    submitCategoryBtn.textContent = "Add Category";
    hideElement(cancelCategoryEditBtn);
    clearMessage(document.getElementById("category-error") || null);
  }

  async function handleCategoryFormSubmit(event) {
    event.preventDefault();
    const name = categoryNameInput.value.trim();

    if (!name) {
      alert("Category name cannot be empty.");
      return;
    }

    let success = false;
    if (currentCategoryId) {
      success = await editCategory(currentCategoryId, name);
    } else {
      success = await addCategory(name);
    }

    if (success) {
      resetCategoryForm();
      await refreshCategoriesTable();
    } else {
      alert("Failed to save category. Please try again.");
    }
  }

  async function handleEditCategory(id) {
    const categories = await getCategories();
    const category = categories.find((cat) => cat.id == id);
    if (category) {
      categoryNameInput.value = category.name;
      currentCategoryId = category.id;
      submitCategoryBtn.textContent = "Update Category";
      showElement(cancelCategoryEditBtn);
      categoryNameInput.focus();
    }
  }

  async function handleDeleteCategory(id) {
    const success = await deleteCategory(id);
    if (success) {
      await refreshCategoriesTable();
      resetCategoryForm();
    }
  }

  // --- Initial Load ---
  refreshCategoriesTable();
});
