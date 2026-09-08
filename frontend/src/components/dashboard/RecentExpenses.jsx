export default function RecentExpenses({ expenses = [],}) {
  return (
    <div>
      <h2>Recent Expenses</h2>

      {expenses.length === 0 ? (
        <p>No expenses found.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Title</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {expenses.slice(0, 5).map((expense) => (
              <tr key={expense.id}>
                <td>{expense.title}</td>
                <td>₹{expense.amount}</td>
                <td>{expense.category}</td>
                <td>{expense.expense_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}