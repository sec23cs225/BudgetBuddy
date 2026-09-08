export default function BudgetOverview({ budgets, expenses }) {

    const calculateSpent = (category) => {
        return expenses
            .filter(expense => expense.category === category)
            .reduce((sum, expense) => sum + Number(expense.amount), 0);
    };

    const calculateProgress = (budgetAmount, category) => {

        const spent = calculateSpent(category);

        return Math.min(
            (spent / Number(budgetAmount)) * 100,
            100
        );
    };

    const calculateRemaining = (budgetAmount, category) => {

        return Number(budgetAmount) - calculateSpent(category);

    };

    return (

        <div>
            <h2>Budget Overview</h2>
            {budgets.length === 0 ? (
                <p>No Budgets Available</p>
            ) : (
                budgets.map((budget) => (
                    <div
                        key={budget.id}
                        style={{
                            border: "1px solid gray",
                            padding: "15px",
                            marginBottom: "15px",
                            borderRadius: "8px",
                        }}
                    >
                        <h3>{budget.category}</h3>
                        <p>
                            Budget :
                            ₹{budget.budget_amount}
                        </p>
                        <p>
                            Spent :
                            ₹{calculateSpent(budget.category)}
                        </p>
                        <p>
                            Remaining :
                            ₹{calculateRemaining(
                                budget.budget_amount,
                                budget.category
                            )}
                        </p>
                        <progress
                            value={calculateProgress(
                                budget.budget_amount,
                                budget.category
                            )}
                            max="100"
                            style={{
                                width: "250px",
                                height: "20px",
                            }}
                        />
                        <p>

                            {calculateProgress(
                                budget.budget_amount,
                                budget.category
                            ).toFixed(1)}%
                        </p>
                        <p
                            style={{
                                color:
                                    calculateRemaining(
                                        budget.budget_amount,
                                        budget.category
                                    ) >= 0
                                        ? "green"
                                        : "red",
                                fontWeight: "bold",
                            }}
                        >
                            {calculateRemaining(
                                budget.budget_amount,
                                budget.category
                            ) >= 0 ? "Within Budget"  : "Budget Exceeded"}
                        </p>
                    </div>

                ))

            )}

        </div>

    );
}