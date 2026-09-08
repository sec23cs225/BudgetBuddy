import api from "./api";

export const getBudgets = () => {
  return api.get("/budgets/");
};

export const createBudget = (budgetData) => {
  return api.post("/budgets/", budgetData);
};

export const updateBudget = (id, budgetData) => {
  return api.put(`/budgets/${id}/`, budgetData);
};

export const deleteBudget = (id) => {
  return api.delete(`/budgets/${id}/`);
};