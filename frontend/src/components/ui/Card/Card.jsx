import Paper from "@mui/material/Paper";

import {
    radius,
    shadows,
    transitions,
    colors,
    spacing,
} from "../../../theme";

export default function Card({

    children,

    hover = true,

    glass = false,

    padding = "lg",

    sx = {},

}) {

    return (

        <Paper

            elevation={0}

            sx={{

                p: spacing[padding] || spacing.lg,

                borderRadius: radius.lg,

                background: glass
                    ? "rgba(255,255,255,0.70)"
                    : colors.surface,

                backdropFilter: glass
                    ? "blur(18px)"
                    : "none",

                border: `1px solid ${colors.border}`,

                boxShadow: shadows.md,

                transition: transitions.card,

                overflow: "hidden",

                ...(hover && {

                    "&:hover": {

                        transform: "translateY(-6px)",

                        boxShadow: shadows.xl,

                    },

                }),

                ...sx,

            }}

        >

            {children}

        </Paper>

    );

}