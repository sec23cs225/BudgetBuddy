import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY =
    "budgetbuddy-theme";

const VALID_THEMES = [
    "dark",
    "light",
    "system",
];


/* =========================================================
   HELPERS
========================================================= */

function getSystemTheme() {

    if (
        typeof window === "undefined" ||
        !window.matchMedia
    ) {
        return "dark";
    }

    return window.matchMedia(
        "(prefers-color-scheme: light)"
    ).matches
        ? "light"
        : "dark";
}


function getStoredTheme() {

    const stored =
        localStorage.getItem(
            THEME_STORAGE_KEY
        );

    if (
        VALID_THEMES.includes(stored)
    ) {
        return stored;
    }

    return "dark";
}


function resolveTheme(theme) {

    if (theme === "system") {
        return getSystemTheme();
    }

    return theme === "light"
        ? "light"
        : "dark";
}


/* =========================================================
   APPLY THEME TO APPLICATION ROOT
========================================================= */

function applyTheme(theme) {

    const resolvedTheme =
        resolveTheme(theme);

    const root =
        document.documentElement;

    root.dataset.theme =
        resolvedTheme;

    root.dataset.themePreference =
        theme;

    root.style.colorScheme =
        resolvedTheme;

    document.body?.setAttribute(
        "data-theme",
        resolvedTheme
    );

    window.dispatchEvent(
        new CustomEvent(
            "budgetbuddy-theme-changed",
            {
                detail: {
                    theme,
                    resolvedTheme,
                },
            }
        )
    );

    return resolvedTheme;
}


/* =========================================================
   PROVIDER
========================================================= */

export function ThemeProvider({
    children,
}) {

    const [
        theme,
        setThemeState,
    ] = useState(
        getStoredTheme
    );


    const [
        resolvedTheme,
        setResolvedTheme,
    ] = useState(
        () =>
            resolveTheme(
                getStoredTheme()
            )
    );


    /* =====================================================
       APPLY CURRENT THEME
    ===================================================== */

    useEffect(() => {

        localStorage.setItem(
            THEME_STORAGE_KEY,
            theme
        );

        const resolved =
            applyTheme(theme);

        setResolvedTheme(
            resolved
        );

    }, [theme]);


    /* =====================================================
       SYSTEM THEME SUPPORT
    ===================================================== */

    useEffect(() => {

        if (
            theme !== "system"
        ) {
            return undefined;
        }

        if (
            !window.matchMedia
        ) {
            return undefined;
        }


        const mediaQuery =
            window.matchMedia(
                "(prefers-color-scheme: light)"
            );


        const handleSystemChange =
            () => {

                const resolved =
                    mediaQuery.matches
                        ? "light"
                        : "dark";

                setResolvedTheme(
                    resolved
                );

                applyTheme(
                    "system"
                );
            };


        mediaQuery.addEventListener(
            "change",
            handleSystemChange
        );


        return () => {

            mediaQuery.removeEventListener(
                "change",
                handleSystemChange
            );

        };

    }, [theme]);


    /* =====================================================
       CHANGE THEME
    ===================================================== */

    const setTheme =
        useCallback(
            (nextTheme) => {

                if (
                    !VALID_THEMES.includes(
                        nextTheme
                    )
                ) {
                    return;
                }

                setThemeState(
                    nextTheme
                );

            },
            []
        );


    /* =====================================================
       QUICK TOGGLE
    ===================================================== */

    const toggleTheme =
        useCallback(() => {

            setTheme(
                resolvedTheme === "dark"
                    ? "light"
                    : "dark"
            );

        }, [
            resolvedTheme,
            setTheme,
        ]);


    /* =====================================================
       CONTEXT VALUE
    ===================================================== */

    const value =
        useMemo(
            () => ({
                theme,
                resolvedTheme,
                setTheme,
                toggleTheme,
                isDark:
                    resolvedTheme ===
                    "dark",
                isLight:
                    resolvedTheme ===
                    "light",
            }),
            [
                theme,
                resolvedTheme,
                setTheme,
                toggleTheme,
            ]
        );


    return (
        <ThemeContext.Provider
            value={value}
        >
            {children}
        </ThemeContext.Provider>
    );
}


/* =========================================================
   HOOK
========================================================= */

export function useTheme() {

    const context =
        useContext(
            ThemeContext
        );

    if (!context) {

        throw new Error(
            "useTheme must be used inside ThemeProvider"
        );
    }

    return context;
}