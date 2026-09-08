import { Box, Typography, Chip } from "@mui/material";
import { CalendarDays, TrendingUp } from "lucide-react";

export default function DashboardHero() {

    const hour = new Date().getHours();

    let greeting = "Good Morning";

    if (hour >= 12 && hour < 17) greeting = "Good Afternoon";

    if (hour >= 17) greeting = "Good Evening";

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (

        <Box

            sx={{

                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",

                mb: 5,

                p: 4,

                borderRadius: 5,

                background:
                    "linear-gradient(135deg,#1E293B,#0F172A)",

                border: "1px solid rgba(255,255,255,.08)",

            }}

        >

            <Box>

                <Typography

                    sx={{

                        fontSize: "2.2rem",

                        fontWeight: 700,

                        color: "#fff",

                    }}

                >

                    {greeting}, Sakthi 👋

                </Typography>

                <Typography

                    sx={{

                        mt: 1,

                        color: "#94A3B8",

                        fontSize: "1rem",

                    }}

                >

                    Track your finances with confidence.

                </Typography>

            </Box>

            <Box textAlign="right">

                <Chip

                    icon={<CalendarDays size={18} />}

                    label={today}

                    sx={{

                        bgcolor: "#334155",

                        color: "#fff",

                        mb: 2,

                    }}

                />

                <br />

                <Chip

                    icon={<TrendingUp size={18} />}

                    label="Financial Health : Stable"

                    color="success"

                />

            </Box>

        </Box>

    );

}