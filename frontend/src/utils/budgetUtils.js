export const calculateSpent = (expenses, category) => {
    return expenses
        .filter(expense => expense.category === category)
        .reduce((sum, expense) => sum + Number(expense.amount), 0);
};

export const calculateRemaining = (
    expenses,
    budgetAmount,
    category
) => {
    return Number(budgetAmount) -
        calculateSpent(expenses, category);
};

export const calculateProgress = (
    expenses,
    budgetAmount,
    category
) => {

    const spent = calculateSpent(
        expenses,
        category
    );

    return Math.min(
        (spent / Number(budgetAmount)) * 100,
        100
    );
};