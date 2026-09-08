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
    "#8884D8",
    "#82CA9D",
    "#A4DE6C",
    "#D0ED57",
];

export default function CategoryPieChart({ data }) {

    return (
        <ResponsiveContainer
            width="100%"
            height={300}
        >
            <PieChart>
                <Pie
                    data={data}
                    dataKey="total_amount"
                    nameKey="category"
                    outerRadius={100}
                    label
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={index}
                            fill={
                                COLORS[
                                    index % COLORS.length
                                ]
                            }
                        />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}