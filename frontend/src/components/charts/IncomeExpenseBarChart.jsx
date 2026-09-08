import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function IncomeExpenseBarChart({
  totalIncome,
  totalExpense,
}) {
  const data = [
    {
        name: "Income",
        amount: totalIncome,
    },
    {
        name: "Expenses",
        amount: totalExpense,
    },
  ];

  return (
    <div style={{ width: "100%", height: 400 }}>
      <h2>Income vs Expenses</h2>

      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="name" />

          <YAxis />

          <Tooltip />

          <Legend />

          <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}