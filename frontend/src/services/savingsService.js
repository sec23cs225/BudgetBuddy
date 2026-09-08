import api from "./api";

export const getSavingsGoals = () => {
    return api.get("/savings/");
};

export const createSavingsGoal = (goalData) => {
    return api.post("/savings/", goalData);
};

export const updateSavingsGoal = (id, goalData) => {
    return api.put(`/savings/${id}/`, goalData);
};

export const deleteSavingsGoal = (id) => {
    return api.delete(`/savings/${id}/`);
};

export const getSavingsProgress = () => {
    return api.get("/savings/progress/");
};