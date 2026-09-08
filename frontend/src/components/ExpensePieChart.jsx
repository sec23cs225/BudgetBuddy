import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF4560",
  "#775DD0",
  "#26A69A",
];

export default function ExpensePieChart({ expenses }) {

  const categoryTotals = {};

  expenses.forEach((expense) => {
    if (categoryTotals[expense.category]) {
      categoryTotals[expense.category] += Number(expense.amount);
    } else {
      categoryTotals[expense.category] = Number(expense.amount);
    }
  });

  const data = Object.keys(categoryTotals).map((category) => ({
    name: category,
    value: categoryTotals[category],
  }));

  return (
    <div style={{ width: "100%", height: 400 }}>
      <h2>Expenses by Category</h2>

      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={140}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}