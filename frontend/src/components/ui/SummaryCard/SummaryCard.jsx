import {
    Box,
    Typography,
    Chip,
} from "@mui/material";

import {
    radius,
    shadows,
    transitions,
    spacing,
    typography,
} from "../../../theme";

export default function SummaryCard({

    title,

    value,

    subtitle,

    icon,

    trend,

    gradient,

}) {

    return (

        <Box

            sx={{

                position: "relative",

                overflow: "hidden",

                borderRadius: radius.xl,

                background: gradient,

                color: "#fff",

                p: spacing.xl,

                boxShadow: shadows.lg,

                transition: transitions.card,

                cursor: "pointer",

                minHeight: 230,

                "&:hover": {

                    transform: "translateY(-10px)",

                    boxShadow: shadows.xl,

                },

            }}

        >

            {/* Decorative Circle */}

            <Box

                sx={{

                    position: "absolute",

                    width: 180,

                    height: 180,

                    borderRadius: "50%",

                    background: "rgba(255,255,255,.08)",

                    top: -70,

                    right: -60,

                }}

            />

            {/* Top Section */}

            <Box

                sx={{

                    display: "flex",

                    justifyContent: "space-between",

                    alignItems: "center",

                    position: "relative",

                    zIndex: 2,

                }}

            >

                <Box

                    sx={{

                        width: 60,

                        height: 60,

                        borderRadius: "50%",

                        background: "rgba(255,255,255,.15)",

                        backdropFilter: "blur(10px)",

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",

                    }}

                >

                    {icon}

                </Box>

                <Chip

                    label={trend}

                    sx={{

                        background: "rgba(255,255,255,.15)",

                        color: "#fff",

                        fontWeight: 700,

                        backdropFilter: "blur(10px)",

                    }}

                />

            </Box>

            {/* Card Body */}

            <Box

                sx={{

                    mt: 5,

                    position: "relative",

                    zIndex: 2,

                }}

            >

                <Typography

                    sx={{

                        ...typography.subtitle,

                        color: "rgba(255,255,255,.8)",

                    }}

                >

                    {title}

                </Typography>

                <Typography

                    sx={{

                        fontSize: "2.5rem",

                        fontWeight: 700,

                        mt: 1,

                    }}

                >

                    {value}

                </Typography>

                <Typography

                    sx={{

                        mt: 2,

                        color: "rgba(255,255,255,.85)",

                    }}

                >

                    {subtitle}

                </Typography>

            </Box>

        </Box>

    );

}