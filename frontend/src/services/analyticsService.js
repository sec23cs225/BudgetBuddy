import api from "./api";

export const getDashboardSummary = () =>
    api.get("/analytics/dashboard/");

export const getCategoryBreakdown = () =>
    api.get("/analytics/category-breakdown/");

export const getMonthlyTrend = () =>
    api.get("/analytics/monthly-trend/");

export const getIncomeVsExpense = () =>
    api.get("/analytics/income-vs-expense/");

export const getBudgetPerformance = () =>
    api.get("/analytics/budget-performance/");

