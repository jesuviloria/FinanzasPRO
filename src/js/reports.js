import {
  getAuthStatus,
  generateReports,
  logoutUser,
} from "../services/index.service.js";

import {
  updateReportSummary,
  renderCategoryTotalsTable,
  renderMonthTotalsTable,
} from "./dom.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Check authentication status
  if (!getAuthStatus()) {
    window.location.href = "../../index.html";
    return;
  }

  // --- DOM Elements ---
  const logoutBtn = document.getElementById("logout-btn");

  // Summary Cards
  const highestIncomeCatEl = document.getElementById("highest-income-category");
  const highestExpenseCatEl = document.getElementById(
    "highest-expense-category"
  );
  const highestBalanceCatEl = document.getElementById(
    "highest-balance-category"
  );
  const highestIncomeMonthEl = document.getElementById("highest-income-month");
  const highestExpenseMonthEl = document.getElementById(
    "highest-expense-month"
  );

  // Report Tables
  const categoryTotalsTableBody = document.querySelector(
    "#category-totals-table tbody"
  );
  const monthTotalsTableBody = document.querySelector(
    "#month-totals-table tbody"
  );

  // --- Event Listeners ---
  logoutBtn.addEventListener("click", () => {
    logoutUser();
    window.location.href = "../../index.html";
  });

  // --- Functions ---
  async function loadReports() {
    const reports = await generateReports();
    updateReportSummary(reports, {
      highestIncomeCatEl,
      highestExpenseCatEl,
      highestBalanceCatEl,
      highestIncomeMonthEl,
      highestExpenseMonthEl,
    });
    renderCategoryTotalsTable(reports.categoryTotals, categoryTotalsTableBody);
    renderMonthTotalsTable(reports.monthTotals, monthTotalsTableBody);
  }

  // --- Initial Load ---
  loadReports();
});
