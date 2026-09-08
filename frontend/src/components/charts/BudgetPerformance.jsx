import {
    Box,
    Typography,
    LinearProgress,
} from "@mui/material";

export default function BudgetPerformance({ data = [],}) {

    return (
        <Box>

            {data.map((budget, index) => (

                <Box
                    key={index}
                    sx={{ mb: 3 }}
                >

                    <Typography
                        fontWeight="bold"
                    >
                        {budget.category}
                    </Typography>

                    <LinearProgress
                        variant="determinate"
                        value={Math.min(
                            budget.utilization_percentage,
                            100
                        )}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            my: 1,
                        }}
                    />

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        ₹{budget.spent} / ₹{budget.budget}
                    </Typography>

                    <Typography
                        variant="body2"
                    >
                        Remaining: ₹{budget.remaining}
                    </Typography>

                    <Typography
                        variant="body2"
                    >
                        {budget.utilization_percentage}% Used
                    </Typography>

                </Box>

            ))}

        </Box>
    );
}