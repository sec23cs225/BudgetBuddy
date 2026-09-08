import {
    Box,
    Typography,
    LinearProgress,
    Chip,
} from "@mui/material";

export default function SavingsOverview({
    savingsGoals = [],
}) {

    if (savingsGoals.length === 0) {
        return (
            <Typography>
                No Savings Goals Found.
            </Typography>
        );
    }

    return (

        <Box>

            {savingsGoals.map((goal) => (

                <Box
                    key={goal.id}
                    sx={{
                        mb: 3,
                        p: 2,
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 3,
                        background:
                            "rgba(255,255,255,0.03)",
                    }}
                >

                    <Typography
                        variant="h6"
                        fontWeight={700}
                        mb={1}
                    >
                        {goal.goal_name}
                    </Typography>

                    <Typography>
                        Target :
                        ₹{goal.target_amount}
                    </Typography>

                    <Typography>
                        Saved :
                        ₹{goal.saved_amount}
                    </Typography>

                    <Typography mb={2}>
                        Remaining :
                        ₹{goal.remaining_amount}
                    </Typography>

                    <LinearProgress
                        variant="determinate"
                        value={goal.progress_percentage}
                        sx={{
                            height: 12,
                            borderRadius: 10,
                            mb: 1,
                        }}
                    />

                    <Typography
                        variant="body2"
                        mb={2}
                    >
                        {goal.progress_percentage}%
                    </Typography>

                    <Chip
                        label={goal.goal_status}
                        color={
                            goal.goal_status === "Completed"
                                ? "success"
                                : "warning"
                        }
                    />

                </Box>

            ))}

        </Box>

    );

}