export default function RecentIncome({ incomes }) {
  return (
    <div>
      <h2>Recent Income</h2>

      {incomes.length === 0 ? (
        <p>No income found.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Title</th>
              <th>Amount</th>
              <th>Source</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {incomes.slice(0, 5).map((income) => (
              <tr key={income.id}>
                <td>{income.title}</td>
                <td>₹{income.amount}</td>
                <td>{income.source}</td>
                <td>{income.income_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}