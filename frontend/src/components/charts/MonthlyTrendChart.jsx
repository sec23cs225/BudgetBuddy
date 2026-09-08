import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

export default function MonthlyTrendChart({ data }) {

    return (
        <ResponsiveContainer
            width="100%"
            height={300}
        >
            <LineChart data={data}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Line
                    type="monotone"
                    dataKey="total_amount"
                    stroke="#1976d2"
                    strokeWidth={3}
                />

            </LineChart>
        </ResponsiveContainer>
    );
}