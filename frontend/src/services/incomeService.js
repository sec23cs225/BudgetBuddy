import api from "./api";

export const getIncomes = () => {
    return api.get("/income/");
};

export const createIncome = (incomeData) => {
    return api.post("/income/", incomeData);
};

export const updateIncome = (id, incomeData) => {
    return api.put(`/income/${id}/`, incomeData);
};

export const deleteIncome = (id) => {
    return api.delete(`/income/${id}/`);
};