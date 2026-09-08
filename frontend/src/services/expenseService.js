import api from "./api";

export const getExpenses = () => {
  return api.get("/expenses/");
};

export const createExpense = (expenseData) => {
  return api.post("/expenses/", expenseData);
};

export const updateExpense = (id, expenseData) => {
  return api.put(`/expenses/${id}/`, expenseData);
};

export const deleteExpense = (id) => {
  return api.delete(`/expenses/${id}/`);
};