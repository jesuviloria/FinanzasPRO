// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Helper to format date
const formatDate = (dateString) => {
  const date = new Date(dateString + "T00:00:00"); // Add T00:00:00 to avoid timezone issues
  return new Intl.DateTimeFormat("en-US").format(date);
};

// --- General UI Elements ---
const showElement = (element) => {
  if (element) element.classList.remove("hidden");
};

const hideElement = (element) => {
  if (element) element.classList.add("hidden");
};

const displayMessage = (element, message, isError = false) => {
  if (element) {
    element.textContent = message;
    if (isError) {
      element.classList.add("error-message");
      element.classList.remove("info-message");
    } else {
      element.classList.add("info-message");
      element.classList.remove("error-message");
    }
    showElement(element);
  }
};

const clearMessage = (element) => {
  if (element) {
    element.textContent = "";
    hideElement(element);
    element.classList.remove("error-message", "info-message");
  }
};

// --- Operations View Rendering ---
const renderOperationsTable = (
  operations,
  categories,
  operationsTableBody,
  noOperationsMessage
) => {
  operationsTableBody.innerHTML = ""; // Clear existing rows

  if (operations.length === 0) {
    showElement(noOperationsMessage);
    return;
  }
  hideElement(noOperationsMessage);

  operations.forEach((op) => {
    const row = operationsTableBody.insertRow();
    row.dataset.id = op.id; // Store ID for editing/deleting

    const categoryName =
      categories.find((cat) => cat.id == op.category)?.name || "Uncategorized"; // Match ID type

    row.innerHTML = `
            <td>${op.description}</td>
            <td class="${
              op.type === "income"
                ? "operation-type-income"
                : "operation-type-expense"
            }">${formatCurrency(op.amount)}</td>
            <td>${op.type.charAt(0).toUpperCase() + op.type.slice(1)}</td>
            <td>${categoryName}</td>
            <td>${formatDate(op.date)}</td>
            <td class="action-buttons">
                <button class="edit-btn" data-id="${
                  op.id
                }"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${
                  op.id
                }"><i class="fas fa-trash"></i></button>
            </td>
        `;
  });
};

const updateBalanceDisplay = (
  balanceData,
  totalIncomeEl,
  totalExpensesEl,
  totalBalanceEl
) => {
  totalIncomeEl.textContent = formatCurrency(balanceData.income);
  totalExpensesEl.textContent = formatCurrency(balanceData.expenses);
  totalBalanceEl.textContent = formatCurrency(balanceData.balance);

  // Apply color based on balance
  if (balanceData.balance >= 0) {
    totalBalanceEl.classList.remove("expense");
    totalBalanceEl.classList.add("income");
  } else {
    totalBalanceEl.classList.remove("income");
    totalBalanceEl.classList.add("expense");
  }
};

const populateCategorySelect = (
  selectElement,
  categories,
  includeAllOption = false
) => {
  selectElement.innerHTML = ""; // Clear existing options

  if (includeAllOption) {
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All";
    selectElement.appendChild(allOption);
  }

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    selectElement.appendChild(option);
  });
};

// --- Categories View Rendering ---
const renderCategoriesTable = (
  categories,
  categoriesTableBody,
  noCategoriesMessage
) => {
  categoriesTableBody.innerHTML = ""; // Clear existing rows

  if (categories.length === 0) {
    showElement(noCategoriesMessage);
    return;
  }
  hideElement(noCategoriesMessage);

  categories.forEach((cat) => {
    const row = categoriesTableBody.insertRow();
    row.dataset.id = cat.id;
    row.innerHTML = `
            <td>${cat.name}</td>
            <td class="action-buttons">
                <button class="edit-cat-btn" data-id="${cat.id}"><i class="fas fa-edit"></i></button>
                <button class="delete-cat-btn" data-id="${cat.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
  });
};

// --- Reports View Rendering ---
const updateReportSummary = (
  reports,
  {
    highestIncomeCatEl,
    highestExpenseCatEl,
    highestBalanceCatEl,
    highestIncomeMonthEl,
    highestExpenseMonthEl,
  }
) => {
  highestIncomeCatEl.textContent = `${
    reports.categoryWithHighestIncome.name
  } (${formatCurrency(reports.categoryWithHighestIncome.amount)})`;
  highestExpenseCatEl.textContent = `${
    reports.categoryWithHighestExpense.name
  } (${formatCurrency(reports.categoryWithHighestExpense.amount)})`;
  highestBalanceCatEl.textContent = `${
    reports.categoryWithHighestBalance.name
  } (${formatCurrency(reports.categoryWithHighestBalance.amount)})`;

  // Adjust color for highest balance
  if (reports.categoryWithHighestBalance.amount < 0) {
    highestBalanceCatEl.classList.add("expense-value");
  } else {
    highestBalanceCatEl.classList.remove("expense-value");
  }

  highestIncomeMonthEl.textContent = `${
    reports.monthWithHighestIncome.name
  } (${formatCurrency(reports.monthWithHighestIncome.amount)})`;
  highestExpenseMonthEl.textContent = `${
    reports.monthWithHighestExpense.name
  } (${formatCurrency(reports.monthWithHighestExpense.amount)})`;
};

const renderCategoryTotalsTable = (categoryTotals, tableBody) => {
  tableBody.innerHTML = "";
  for (const catName in categoryTotals) {
    const data = categoryTotals[catName];
    const row = tableBody.insertRow();
    row.innerHTML = `
            <td>${catName}</td>
            <td class="income">${formatCurrency(data.income)}</td>
            <td class="expense">${formatCurrency(data.expense)}</td>
            <td class="${
              data.balance >= 0 ? "income" : "expense-value"
            }">${formatCurrency(data.balance)}</td>
        `;
  }
};

const renderMonthTotalsTable = (monthTotals, tableBody) => {
  tableBody.innerHTML = "";
  const sortedMonthKeys = Object.keys(monthTotals).sort(); // Sort months chronologically
  sortedMonthKeys.forEach((monthKey) => {
    const data = monthTotals[monthKey];
    const monthName = new Date(monthKey + "-01").toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    const row = tableBody.insertRow();
    row.innerHTML = `
            <td>${monthName}</td>
            <td class="income">${formatCurrency(data.income)}</td>
            <td class="expense">${formatCurrency(data.expense)}</td>
            <td class="${
              data.balance >= 0 ? "income" : "expense-value"
            }">${formatCurrency(data.balance)}</td>
        `;
  });
};

export {
  showElement,
  hideElement,
  displayMessage,
  clearMessage,
  renderOperationsTable,
  updateBalanceDisplay,
  populateCategorySelect,
  renderCategoriesTable,
  updateReportSummary,
  renderCategoryTotalsTable,
  renderMonthTotalsTable,
  formatCurrency, 
  formatDate,
};
