import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

export default function IncomeExpenseChart({ data }) {

    const chartData = [
        {
            name: "Income",
            amount: Number(data.total_income || 0),
        },
        {
            name: "Expense",
            amount: Number(data.total_expenses || 0),
        },
    ];

    return (
        <ResponsiveContainer
            width="100%"
            height={300}
        >
            <BarChart data={chartData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                    dataKey="amount"
                    fill="#4CAF50"
                />

            </BarChart>
        </ResponsiveContainer>
    );
}