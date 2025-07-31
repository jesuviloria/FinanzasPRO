import { getOperations, getCategories } from "./index.service.js";


// generateReports will also need to fetch all operations and categories first
const generateReports = async () => {
    const operations = await getOperations({
        type: "all",
        category: "all",
        sortBy: "recent",
    });
    const categories = await getCategories();

    const reports = {
        categoryWithHighestIncome: { name: "N/A", amount: 0 },
        categoryWithHighestExpense: { name: "N/A", amount: 0 },
        categoryWithHighestBalance: { name: "N/A", amount: -Infinity },
        monthWithHighestIncome: { name: "N/A", amount: 0 },
        monthWithHighestExpense: { name: "N/A", amount: 0 },
        categoryTotals: {},
        monthTotals: {},
    };

    const categoryAggregates = {};
    const monthAggregates = {};

    operations.forEach((op) => {
        // Find category name, or use 'Uncategorized' if not found
        const categoryName =
            categories.find((cat) => cat.id == op.category)?.name || "Uncategorized";
        const monthKey = op.date.substring(0, 7); // YYYY-MM

        if (!categoryAggregates[categoryName]) {
            categoryAggregates[categoryName] = { income: 0, expense: 0, balance: 0 };
        }
        if (op.type === "income") {
            categoryAggregates[categoryName].income += op.amount;
        } else {
            categoryAggregates[categoryName].expense += op.amount;
        }
        categoryAggregates[categoryName].balance =
            categoryAggregates[categoryName].income -
            categoryAggregates[categoryName].expense;

        if (!monthAggregates[monthKey]) {
            monthAggregates[monthKey] = { income: 0, expense: 0, balance: 0 };
        }
        if (op.type === "income") {
            monthAggregates[monthKey].income += op.amount;
        } else {
            monthAggregates[monthKey].expense += op.amount;
        }
        monthAggregates[monthKey].balance =
            monthAggregates[monthKey].income - monthAggregates[monthKey].expense;
    });

    // Determine highest values
    for (const catName in categoryAggregates) {
        const data = categoryAggregates[catName];
        if (data.income > reports.categoryWithHighestIncome.amount) {
            reports.categoryWithHighestIncome = {
                name: catName,
                amount: data.income,
            };
        }
        if (data.expense > reports.categoryWithHighestExpense.amount) {
            reports.categoryWithHighestExpense = {
                name: catName,
                amount: data.expense,
            };
        }
        if (data.balance > reports.categoryWithHighestBalance.amount) {
            reports.categoryWithHighestBalance = {
                name: catName,
                amount: data.balance,
            };
        }
    }

    for (const monthKey in monthAggregates) {
        const data = monthAggregates[monthKey];
        const monthName = new Date(monthKey + "-01").toLocaleString("en-US", {
            month: "long",
            year: "numeric",
        }); // English month names
        if (data.income > reports.monthWithHighestIncome.amount) {
            reports.monthWithHighestIncome = { name: monthName, amount: data.income };
        }
        if (data.expense > reports.monthWithHighestExpense.amount) {
            reports.monthWithHighestExpense = {
                name: monthName,
                amount: data.expense,
            };
        }
    }

    reports.categoryTotals = categoryAggregates;
    reports.monthTotals = monthAggregates;

    return reports;
};

export { generateReports }