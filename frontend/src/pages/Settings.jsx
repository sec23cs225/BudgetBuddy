import { useEffect, useMemo, useState } from "react";
import {
    User,
    Bell,
    ShieldCheck,
    Database,
    Palette,
    Moon,
    Sun,
    Monitor,
    Download,
    Trash2,
    LockKeyhole,
    Check,
    Save,
    LogOut,
    WalletCards,
    Mail,
    CalendarDays,
    Sparkles,
    CheckCircle2,
    ChevronDown,
    Globe2,
    Smartphone,
    Receipt,
    CircleDollarSign,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import EmailPreferences from "../components/common/EmailPreferences";
import api from "../services/api";


/* =========================================================
   STORAGE HELPERS
========================================================= */

const getStoredBoolean = (
    key,
    defaultValue
) => {

    const value =
        localStorage.getItem(key);

    if (value === null) {
        return defaultValue;
    }

    return value === "true";
};


/* =========================================================
   PREMIUM SELECT
========================================================= */

function PremiumSelect({
    value,
    options,
    onChange,
    icon: Icon,
}) {

    const [open, setOpen] =
        useState(false);

    const selected =
        options.find(
            (option) =>
                option.value === value
        ) || options[0];


    useEffect(() => {

        const handleOutsideClick =
            (event) => {

                if (
                    !event.target.closest(
                        ".bb-premium-select"
                    )
                ) {
                    setOpen(false);
                }
            };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };

    }, []);


    return (
        <div
            className="bb-premium-select"
            style={{
                position: "relative",
                width: "100%",
            }}
        >

            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() =>
                    setOpen(
                        (previous) =>
                            !previous
                    )
                }
                style={{
                    width: "100%",
                    minHeight: "43px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                        "space-between",
                    gap: "10px",
                    padding: "0 12px",
                    border:
                        "1px solid var(--bb-border)",
                    borderRadius: "10px",
                    background:
                        "var(--bb-input)",
                    color:
                        "var(--bb-text)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    outline: "none",
                }}
            >

                <span
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                        minWidth: 0,
                    }}
                >

                    {Icon && (
                        <span
                            style={{
                                width: "25px",
                                height: "25px",
                                minWidth: "25px",
                                display: "grid",
                                placeItems: "center",
                                borderRadius: "7px",
                                color:
                                    "var(--bb-gold)",
                                background:
                                    "var(--bb-gold-soft)",
                            }}
                        >
                            <Icon size={13} />
                        </span>
                    )}

                    <span
                        style={{
                            overflow: "hidden",
                            textOverflow:
                                "ellipsis",
                            whiteSpace:
                                "nowrap",
                            color:
                                "var(--bb-text-secondary)",
                            fontSize: "10px",
                            fontWeight: 650,
                        }}
                    >
                        {selected.label}
                    </span>

                </span>


                <ChevronDown
                    size={15}
                    color="var(--bb-text-muted)"
                    style={{
                        flexShrink: 0,
                        transform: open
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        transition:
                            "transform .18s ease",
                    }}
                />

            </button>


            {open && (
                <div
                    role="listbox"
                    style={{
                        position: "absolute",
                        zIndex: 100,
                        left: 0,
                        right: 0,
                        top:
                            "calc(100% + 6px)",
                        padding: "5px",
                        border:
                            "1px solid var(--bb-border)",
                        borderRadius: "11px",
                        background:
                            "var(--bb-surface-2)",
                        boxShadow:
                            "var(--bb-shadow)",
                    }}
                >

                    {options.map(
                        (option) => {

                            const isSelected =
                                option.value ===
                                value;

                            return (
                                <button
                                    key={
                                        option.value
                                    }
                                    type="button"
                                    role="option"
                                    aria-selected={
                                        isSelected
                                    }
                                    onClick={() => {
                                        onChange(
                                            option.value
                                        );
                                        setOpen(
                                            false
                                        );
                                    }}
                                    style={{
                                        width: "100%",
                                        minHeight:
                                            "38px",
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "space-between",
                                        padding:
                                            "0 9px",
                                        border: 0,
                                        borderRadius:
                                            "7px",
                                        background:
                                            isSelected
                                                ? "var(--bb-primary-soft)"
                                                : "transparent",
                                        color:
                                            isSelected
                                                ? "var(--bb-primary)"
                                                : "var(--bb-text-secondary)",
                                        cursor:
                                            "pointer",
                                        fontFamily:
                                            "inherit",
                                        textAlign:
                                            "left",
                                    }}
                                >

                                    <span
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap: "8px",
                                            fontSize:
                                                "10px",
                                            fontWeight:
                                                isSelected
                                                    ? 750
                                                    : 550,
                                        }}
                                    >

                                        <span
                                            style={{
                                                width:
                                                    "6px",
                                                height:
                                                    "6px",
                                                borderRadius:
                                                    "50%",
                                                background:
                                                    isSelected
                                                        ? "var(--bb-primary)"
                                                        : "var(--bb-border)",
                                            }}
                                        />

                                        {
                                            option.label
                                        }

                                    </span>


                                    {isSelected && (
                                        <Check
                                            size={13}
                                            color={
                                                "var(--bb-primary)"
                                            }
                                        />
                                    )}

                                </button>
                            );
                        }
                    )}

                </div>
            )}

        </div>
    );
}


/* =========================================================
   TOGGLE
========================================================= */

function Toggle({
    checked,
    onChange,
    label,
}) {

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() =>
                onChange(!checked)
            }
            className={
                checked
                    ? "bb-toggle bb-toggle-on"
                    : "bb-toggle"
            }
        >
            <span
                className="bb-toggle-knob"
            />
        </button>
    );
}


/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
    icon: Icon,
    title,
    subtitle,
    accent = "var(--bb-gold)",
}) {

    return (
        <div
            className="bb-section-header"
            style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
                paddingBottom: "15px",
                borderBottom:
                    "1px solid var(--bb-border)",
            }}
        >

            <div
                style={{
                    width: "36px",
                    height: "36px",
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "10px",
                    color: accent,
                    background:
                        accent ===
                        "var(--bb-danger)"
                            ? "var(--bb-danger-soft)"
                            : accent ===
                              "var(--bb-primary)"
                            ? "var(--bb-primary-soft)"
                            : "var(--bb-gold-soft)",
                }}
            >
                <Icon
                    size={16}
                    strokeWidth={1.8}
                />
            </div>


            <div>

                <h2
                    style={{
                        margin: 0,
                        color:
                            "var(--bb-text)",
                        fontSize: "13px",
                        lineHeight: 1.3,
                        fontWeight: 760,
                    }}
                >
                    {title}
                </h2>


                <p
                    style={{
                        margin:
                            "3px 0 0",
                        color:
                            "var(--bb-text-muted)",
                        fontSize: "9px",
                        lineHeight: 1.45,
                        fontWeight: 500,
                    }}
                >
                    {subtitle}
                </p>

            </div>

        </div>
    );
}


/* =========================================================
   SETTING ROW
========================================================= */

function SettingRow({
    icon: Icon,
    title,
    description,
    children,
    last = false,
}) {

    return (
        <div
            className="bb-setting-row"
            style={{
                minHeight: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent:
                    "space-between",
                gap: "16px",
                borderBottom: last
                    ? "none"
                    : "1px solid var(--bb-border-soft)",
            }}
        >

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    minWidth: 0,
                }}
            >

                <div
                    className="bb-row-icon"
                    style={{
                        width: "30px",
                        height: "30px",
                        minWidth: "30px",
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "8px",
                        background:
                            "var(--bb-surface-3)",
                        color:
                            "var(--bb-text-muted)",
                    }}
                >
                    <Icon
                        size={14}
                        strokeWidth={1.8}
                    />
                </div>


                <div
                    style={{
                        minWidth: 0,
                    }}
                >

                    <div
                        style={{
                            color:
                                "var(--bb-text)",
                            fontSize: "10px",
                            lineHeight: 1.3,
                            fontWeight: 700,
                        }}
                    >
                        {title}
                    </div>


                    <div
                        style={{
                            marginTop: "3px",
                            color:
                                "var(--bb-text-muted)",
                            fontSize: "8px",
                            lineHeight: 1.45,
                        }}
                    >
                        {description}
                    </div>

                </div>

            </div>


            <div
                style={{
                    flexShrink: 0,
                }}
            >
                {children}
            </div>

        </div>
    );
}


/* =========================================================
   SETTINGS CARD
========================================================= */

function SettingsCard({
    children,
}) {

    return (
        <section
            className="bb-settings-card"
        >
            {children}
        </section>
    );
}


/* =========================================================
   SETTINGS PAGE
========================================================= */

export default function Settings() {

    const navigate =
        useNavigate();


    /* =====================================================
       GLOBAL THEME
    ===================================================== */

    const {
        theme,
        resolvedTheme,
        setTheme,
    } = useTheme();


    /* =====================================================
       USER
    ===================================================== */

    const storedUsername =
        localStorage.getItem(
            "username"
        ) || "User";


    const [
        displayName,
        setDisplayName,
    ] = useState(
        storedUsername
    );


    const [
        email,
        setEmail,
    ] = useState(
        localStorage.getItem(
            "email"
        ) || ""
    );


    useEffect(() => {
        api.get("/me/")
            .then((response) => {
                const serverUser = response?.data?.user;
                if (serverUser) {
                    if (serverUser.username) {
                        setDisplayName(serverUser.username);
                        localStorage.setItem("username", serverUser.username);
                    }
                    if (serverUser.email) {
                        setEmail(serverUser.email);
                        localStorage.setItem("email", serverUser.email);
                    }
                }
            })
            .catch(() => {});
    }, []);


    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    const [
        pushNotifications,
        setPushNotifications,
    ] = useState(
        getStoredBoolean(
            "pushNotifications",
            true
        )
    );


    const [
        budgetAlerts,
        setBudgetAlerts,
    ] = useState(
        getStoredBoolean(
            "budgetAlerts",
            true
        )
    );


    const [
        expenseAlerts,
        setExpenseAlerts,
    ] = useState(
        getStoredBoolean(
            "expenseAlerts",
            true
        )
    );


    const [
        monthlyReports,
        setMonthlyReports,
    ] = useState(
        getStoredBoolean(
            "monthlyReports",
            true
        )
    );


    /* =====================================================
       COMPACT MODE
    ===================================================== */

    const [
        compactMode,
        setCompactMode,
    ] = useState(
        getStoredBoolean(
            "compactMode",
            false
        )
    );


    /* =====================================================
       FINANCIAL PREFERENCES
    ===================================================== */

    const [
        currency,
        setCurrency,
    ] = useState(
        localStorage.getItem(
            "currency"
        ) || "INR"
    );


    const [
        monthStart,
        setMonthStart,
    ] = useState(
        localStorage.getItem(
            "monthStart"
        ) || "1"
    );


    /* =====================================================
       SAVE STATE
    ===================================================== */

    const [saved, setSaved] =
        useState(false);


    /* =====================================================
       USER DISPLAY
    ===================================================== */

    const effectiveName =
        displayName.trim() ||
        storedUsername ||
        "User";


    const initials =
        useMemo(() => {

            const parts =
                effectiveName
                    .split(/\s+/)
                    .filter(Boolean);

            if (
                parts.length >= 2
            ) {
                return (
                    parts[0].charAt(0) +
                    parts[1].charAt(0)
                ).toUpperCase();
            }

            return (
                effectiveName
                    .charAt(0)
                    .toUpperCase() ||
                "U"
            );

        }, [
            effectiveName,
        ]);


    /* =====================================================
       OPTIONS
    ===================================================== */

    const currencyOptions = [
        {
            value: "INR",
            label:
                "₹ Indian Rupee (INR)",
        },
        {
            value: "USD",
            label:
                "$ US Dollar (USD)",
        },
        {
            value: "EUR",
            label:
                "€ Euro (EUR)",
        },
        {
            value: "GBP",
            label:
                "£ British Pound (GBP)",
        },
    ];


    const monthStartOptions = [
        {
            value: "1",
            label:
                "1st of every month",
        },
        {
            value: "15",
            label:
                "15th of every month",
        },
    ];


    /* =====================================================
       SAVE SETTINGS
    ===================================================== */

    const handleSave = () => {

        const finalName =
            displayName.trim() ||
            storedUsername ||
            "User";

        const finalEmail =
            email.trim();


        localStorage.setItem(
            "username",
            finalName
        );

        localStorage.setItem(
            "email",
            finalEmail
        );

        api.patch("/me/", {
            username: finalName,
            email: finalEmail,
        }).catch((err) => {
            console.error("Profile sync error:", err?.response?.data || err);
        });

        localStorage.setItem(
            "pushNotifications",
            String(pushNotifications)
        );

        localStorage.setItem(
            "budgetAlerts",
            String(budgetAlerts)
        );

        localStorage.setItem(
            "expenseAlerts",
            String(expenseAlerts)
        );

        localStorage.setItem(
            "monthlyReports",
            String(monthlyReports)
        );

        localStorage.setItem(
            "compactMode",
            String(compactMode)
        );

        localStorage.setItem(
            "currency",
            currency
        );

        localStorage.setItem(
            "monthStart",
            monthStart
        );


        /*
         * Theme is already persisted by
         * ThemeContext. No duplicate theme
         * implementation is required here.
         */


        window.dispatchEvent(
            new Event(
                "budgetbuddy-settings-updated"
            )
        );


        setSaved(true);


        window.setTimeout(() => {
            setSaved(false);
        }, 2500);
    };


    /* =====================================================
       EXPORT SETTINGS
    ===================================================== */

    const handleExportSettings =
        () => {

            const settings = {
                username:
                    localStorage.getItem(
                        "username"
                    ) || "User",

                email:
                    localStorage.getItem(
                        "email"
                    ) || "",

                theme,

                resolvedTheme,

                currency:
                    localStorage.getItem(
                        "currency"
                    ) || "INR",

                monthStart:
                    localStorage.getItem(
                        "monthStart"
                    ) || "1",

                pushNotifications:
                    getStoredBoolean(
                        "pushNotifications",
                        true
                    ),

                budgetAlerts:
                    getStoredBoolean(
                        "budgetAlerts",
                        true
                    ),

                expenseAlerts:
                    getStoredBoolean(
                        "expenseAlerts",
                        true
                    ),

                monthlyReports:
                    getStoredBoolean(
                        "monthlyReports",
                        true
                    ),

                compactMode:
                    getStoredBoolean(
                        "compactMode",
                        false
                    ),
            };


            const blob =
                new Blob(
                    [
                        JSON.stringify(
                            settings,
                            null,
                            2
                        ),
                    ],
                    {
                        type:
                            "application/json",
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );

            link.href = url;

            link.download =
                "BudgetBuddy_Settings.json";


            document.body.appendChild(
                link
            );

            link.click();

            document.body.removeChild(
                link
            );

            URL.revokeObjectURL(
                url
            );
        };


    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = () => {

        localStorage.removeItem(
            "access"
        );

        localStorage.removeItem(
            "refresh"
        );

        navigate(
            "/login",
            {
                replace: true,
            }
        );
    };


    /* =====================================================
       CLEAR LOCAL SESSION
    ===================================================== */

    const handleClearSession =
        () => {

            const confirmed =
                window.confirm(
                    "This will sign you out and remove BudgetBuddy preferences stored in this browser. Your server-side account and financial records will not be deleted."
                );


            if (!confirmed) {
                return;
            }


            [
                "username",
                "email",
                "currency",
                "monthStart",
                "pushNotifications",
                "budgetAlerts",
                "expenseAlerts",
                "monthlyReports",
                "compactMode",
                "budgetbuddy-theme",
                "access",
                "refresh",
            ].forEach(
                (key) =>
                    localStorage.removeItem(
                        key
                    )
            );


            navigate(
                "/login",
                {
                    replace: true,
                }
            );
        };


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <main
            className="budgetbuddy-settings"
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <header
                className="bb-settings-header"
            >

                <div>

                    <div
                        className="bb-eyebrow"
                    >
                        <Sparkles size={11} />

                        PERSONAL CONTROL CENTER
                    </div>


                    <h1>
                        Settings
                    </h1>


                    <p>
                        Configure your identity,
                        financial preferences,
                        notifications and
                        workspace experience.
                    </p>

                </div>

            </header>


            {/* =================================================
                ACCOUNT HERO
            ================================================= */}

            <section
                className="bb-account-hero"
            >

                <div
                    className="bb-account-glow"
                />


                <div
                    className="bb-account-content"
                >

                    <div
                        className="bb-profile-block"
                    >

                        <div
                            className="bb-avatar"
                        >
                            {initials}
                        </div>


                        <div>

                            <h2>
                                {effectiveName}
                            </h2>


                            <div
                                className="bb-account-meta"
                            >

                                <ShieldCheck
                                    size={11}
                                />

                                Personal finance
                                workspace

                            </div>

                        </div>

                    </div>


                    <div
                        className="bb-active-badge"
                    >

                        <CheckCircle2
                            size={12}
                        />

                        ACCOUNT ACTIVE

                    </div>

                </div>

            </section>


            {/* =================================================
                MAIN GRID
            ================================================= */}

            <div
                className="settings-grid"
            >

                {/* =================================================
                    LEFT COLUMN
                ================================================= */}

                <div
                    className="settings-column"
                >

                    {/* PROFILE */}

                    <SettingsCard>

                        <SectionHeader
                            icon={User}
                            title="Profile"
                            subtitle="The identity displayed throughout BudgetBuddy."
                        />


                        <div
                            className="bb-form"
                        >

                            <div
                                className="bb-field"
                            >

                                <label>
                                    Display name
                                </label>


                                <input
                                    value={
                                        displayName
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setDisplayName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Your name"
                                />

                            </div>


                            <div
                                className="bb-field"
                            >

                                <label>
                                    Email address
                                </label>


                                <div
                                    className="bb-input-with-icon"
                                >

                                    <Mail
                                        size={14}
                                    />

                                    <input
                                        type="email"
                                        value={
                                            email
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        placeholder="you@example.com"
                                    />

                                </div>

                            </div>

                        </div>

                    </SettingsCard>


                    {/* NOTIFICATIONS */}

                    <SettingsCard>

                        <SectionHeader
                            icon={Bell}
                            title="Notifications"
                            subtitle="Choose which financial signals deserve your attention."
                            accent={
                                "var(--bb-primary)"
                            }
                        />


                        <SettingRow
                            icon={Bell}
                            title="Push notifications"
                            description="Receive important BudgetBuddy activity alerts."
                        >
                            <Toggle
                                checked={
                                    pushNotifications
                                }
                                onChange={
                                    setPushNotifications
                                }
                                label="Toggle push notifications"
                            />
                        </SettingRow>


                        <SettingRow
                            icon={
                                WalletCards
                            }
                            title="Budget alerts"
                            description="Know when spending approaches a budget limit."
                        >
                            <Toggle
                                checked={
                                    budgetAlerts
                                }
                                onChange={
                                    setBudgetAlerts
                                }
                                label="Toggle budget alerts"
                            />
                        </SettingRow>


                        <SettingRow
                            icon={Receipt}
                            title="Expense alerts"
                            description="Stay aware of significant expense activity."
                        >
                            <Toggle
                                checked={
                                    expenseAlerts
                                }
                                onChange={
                                    setExpenseAlerts
                                }
                                label="Toggle expense alerts"
                            />
                        </SettingRow>


                        <SettingRow
                            icon={
                                CalendarDays
                            }
                            title="Monthly reports"
                            description="Receive your monthly financial summary."
                            last
                        >
                            <Toggle
                                checked={
                                    monthlyReports
                                }
                                onChange={
                                    setMonthlyReports
                                }
                                label="Toggle monthly reports"
                            />
                        </SettingRow>

                    </SettingsCard>


                    {/* =================================================
                        EMAIL NOTIFICATION INTELLIGENCE
                    ================================================= */}

                    <EmailPreferences />


                    {/* =================================================
                        APPEARANCE
                    ================================================= */}


                    <SettingsCard>

                        <SectionHeader
                            icon={Palette}
                            title="Appearance"
                            subtitle="Control the visual experience across your entire BudgetBuddy workspace."
                        />


                        <div
                            className="bb-theme-selector"
                        >

                            {/* DARK */}

                            <button
                                type="button"
                                className={
                                    theme === "dark"
                                        ? "bb-theme-option active"
                                        : "bb-theme-option"
                                }
                                onClick={() =>
                                    setTheme(
                                        "dark"
                                    )
                                }
                                aria-pressed={
                                    theme === "dark"
                                }
                            >

                                <div
                                    className="bb-theme-icon"
                                >
                                    <Moon
                                        size={17}
                                    />
                                </div>


                                <div
                                    className="bb-theme-copy"
                                >

                                    <strong>
                                        Dark mode
                                    </strong>

                                    <span>
                                        Premium dark
                                        workspace with
                                        reduced glare.
                                    </span>

                                </div>


                                <div
                                    className="bb-theme-check"
                                >

                                    {theme ===
                                        "dark" && (
                                        <Check
                                            size={13}
                                        />
                                    )}

                                </div>

                            </button>


                            {/* LIGHT */}

                            <button
                                type="button"
                                className={
                                    theme === "light"
                                        ? "bb-theme-option active"
                                        : "bb-theme-option"
                                }
                                onClick={() =>
                                    setTheme(
                                        "light"
                                    )
                                }
                                aria-pressed={
                                    theme === "light"
                                }
                            >

                                <div
                                    className="bb-theme-icon"
                                >
                                    <Sun
                                        size={17}
                                    />
                                </div>


                                <div
                                    className="bb-theme-copy"
                                >

                                    <strong>
                                        Light mode
                                    </strong>

                                    <span>
                                        Clean,
                                        bright and
                                        high-contrast
                                        workspace.
                                    </span>

                                </div>


                                <div
                                    className="bb-theme-check"
                                >

                                    {theme ===
                                        "light" && (
                                        <Check
                                            size={13}
                                        />
                                    )}

                                </div>

                            </button>


                            {/* SYSTEM */}

                            <button
                                type="button"
                                className={
                                    theme === "system"
                                        ? "bb-theme-option active"
                                        : "bb-theme-option"
                                }
                                onClick={() =>
                                    setTheme(
                                        "system"
                                    )
                                }
                                aria-pressed={
                                    theme === "system"
                                }
                            >

                                <div
                                    className="bb-theme-icon"
                                >
                                    <Monitor
                                        size={17}
                                    />
                                </div>


                                <div
                                    className="bb-theme-copy"
                                >

                                    <strong>
                                        System
                                    </strong>

                                    <span>
                                        Automatically
                                        follow your
                                        device theme.
                                    </span>

                                </div>


                                <div
                                    className="bb-theme-check"
                                >

                                    {theme ===
                                        "system" && (
                                        <Check
                                            size={13}
                                        />
                                    )}

                                </div>

                            </button>

                        </div>


                        {/* CURRENT THEME */}

                        <div
                            className="bb-current-theme"
                        >

                            <div
                                className="bb-current-theme-icon"
                            >

                                {resolvedTheme ===
                                "light" ? (
                                    <Sun
                                        size={14}
                                    />
                                ) : (
                                    <Moon
                                        size={14}
                                    />
                                )}

                            </div>


                            <div>

                                <strong>
                                    {resolvedTheme ===
                                    "light"
                                        ? "Light workspace active"
                                        : "Dark workspace active"}
                                </strong>


                                <span>
                                    {theme ===
                                    "system"
                                        ? "BudgetBuddy is following your device appearance."
                                        : "Applied instantly across the entire BudgetBuddy workspace."}
                                </span>

                            </div>

                        </div>


                        {/* COMPACT */}

                        <SettingRow
                            icon={Monitor}
                            title="Compact mode"
                            description="Reduce spacing to display more information."
                            last
                        >
                            <Toggle
                                checked={
                                    compactMode
                                }
                                onChange={
                                    setCompactMode
                                }
                                label="Toggle compact mode"
                            />
                        </SettingRow>

                    </SettingsCard>

                </div>


                {/* =================================================
                    RIGHT COLUMN
                ================================================= */}

                <div
                    className="settings-column"
                >

                    {/* FINANCIAL PREFERENCES */}

                    <SettingsCard>

                        <SectionHeader
                            icon={
                                CircleDollarSign
                            }
                            title="Financial preferences"
                            subtitle="Define the defaults used throughout your financial workspace."
                        />


                        <div
                            className="bb-form"
                        >

                            <div
                                className="bb-field"
                            >

                                <label>
                                    Default currency
                                </label>


                                <PremiumSelect
                                    value={
                                        currency
                                    }
                                    options={
                                        currencyOptions
                                    }
                                    onChange={
                                        setCurrency
                                    }
                                    icon={
                                        Globe2
                                    }
                                />

                            </div>


                            <div
                                className="bb-field"
                            >

                                <label>
                                    Financial month starts
                                </label>


                                <PremiumSelect
                                    value={
                                        monthStart
                                    }
                                    options={
                                        monthStartOptions
                                    }
                                    onChange={
                                        setMonthStart
                                    }
                                    icon={
                                        CalendarDays
                                    }
                                />

                            </div>

                        </div>

                    </SettingsCard>


                    {/* SECURITY */}

                    <SettingsCard>

                        <SectionHeader
                            icon={
                                ShieldCheck
                            }
                            title="Security"
                            subtitle="Protect access to your financial workspace."
                            accent={
                                "var(--bb-primary)"
                            }
                        />


                        <SettingRow
                            icon={
                                LockKeyhole
                            }
                            title="Password & authentication"
                            description="Manage your authenticated BudgetBuddy session."
                        >

                            <span
                                className="bb-status-chip"
                            >
                                JWT
                            </span>

                        </SettingRow>


                        <SettingRow
                            icon={
                                ShieldCheck
                            }
                            title="Session protection"
                            description="Your current session uses secure authentication."
                            last
                        >

                            <span
                                className="bb-active-status"
                            >

                                <Check
                                    size={12}
                                />

                                Active

                            </span>

                        </SettingRow>

                    </SettingsCard>


                    {/* DATA & PRIVACY */}

                    <SettingsCard>

                        <SectionHeader
                            icon={
                                Database
                            }
                            title="Data & privacy"
                            subtitle="Control and manage your BudgetBuddy workspace data."
                        />


                        <SettingRow
                            icon={
                                Download
                            }
                            title="Export settings"
                            description="Download your current BudgetBuddy preferences."
                        >

                            <button
                                type="button"
                                onClick={
                                    handleExportSettings
                                }
                                className="bb-outline-button"
                            >

                                <Download
                                    size={12}
                                />

                                Export

                            </button>

                        </SettingRow>


                        <SettingRow
                            icon={
                                Database
                            }
                            title="Financial data"
                            description="Your expense, income, budget and savings records."
                            last
                        >

                            <span
                                className="bb-active-status"
                            >

                                <ShieldCheck
                                    size={12}
                                />

                                Protected

                            </span>

                        </SettingRow>

                    </SettingsCard>


                    {/* DANGER ZONE */}

                    <section
                        className="bb-danger-card"
                    >

                        <SectionHeader
                            icon={Trash2}
                            title="Danger zone"
                            subtitle="Actions affecting this browser session."
                            accent={
                                "var(--bb-danger)"
                            }
                        />


                        <div
                            className="bb-danger-content"
                        >

                            <div>

                                <h3>
                                    Clear local session
                                </h3>


                                <p>
                                    Sign out and
                                    remove BudgetBuddy
                                    preferences stored
                                    in this browser.
                                    Your server-side
                                    financial records
                                    are not deleted.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleClearSession
                                }
                                className="bb-danger-button"
                            >

                                <Trash2
                                    size={12}
                                />

                                Clear session

                            </button>

                        </div>

                    </section>

                </div>

            </div>


            {/* =================================================
                SAVE BAR
            ================================================= */}

            <div
                className="bb-save-bar"
            >

                <div
                    className={
                        saved
                            ? "bb-save-status bb-save-success"
                            : "bb-save-status"
                    }
                >

                    {saved ? (
                        <CheckCircle2
                            size={14}
                        />
                    ) : (
                        <Save
                            size={14}
                        />
                    )}


                    <span>
                        {saved
                            ? "Preferences saved successfully."
                            : "Changes are ready to be saved."}
                    </span>

                </div>


                <button
                    type="button"
                    onClick={
                        handleSave
                    }
                    className={
                        saved
                            ? "bb-save-button bb-saved"
                            : "bb-save-button"
                    }
                >

                    {saved ? (
                        <Check
                            size={13}
                        />
                    ) : (
                        <Save
                            size={13}
                        />
                    )}


                    {saved
                        ? "Saved"
                        : "Save changes"}

                </button>

            </div>


            {/* =================================================
                SIGN OUT
            ================================================= */}

            <div
                className="bb-signout"
            >

                <button
                    type="button"
                    onClick={
                        handleLogout
                    }
                >

                    <LogOut
                        size={12}
                    />

                    Sign out of BudgetBuddy

                </button>

            </div>


            {/* =================================================
                SETTINGS-SPECIFIC CSS
            ================================================= */}

            <style>
                {`

                .budgetbuddy-settings {
                    width: 100%;
                    max-width: 1120px;
                    margin: 0 auto;
                    padding: 28px 32px 100px;
                    box-sizing: border-box;
                    color: var(--bb-text);
                    font-family:
                        Inter,
                        ui-sans-serif,
                        system-ui,
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        sans-serif;
                }


                .bb-settings-header {
                    margin-bottom: 20px;
                }


                .bb-eyebrow {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 7px;
                    color: var(--bb-gold);
                    font-size: 8px;
                    font-weight: 850;
                    letter-spacing: 1.65px;
                }


                .bb-settings-header h1 {
                    margin: 0;
                    color: var(--bb-text);
                    font-size: 30px;
                    line-height: 1.1;
                    font-weight: 850;
                    letter-spacing: -.9px;
                }


                .bb-settings-header p {
                    max-width: 650px;
                    margin: 7px 0 0;
                    color: var(--bb-text-muted);
                    font-size: 11px;
                    line-height: 1.55;
                    font-weight: 500;
                }


                .bb-account-hero {
                    position: relative;
                    overflow: hidden;
                    margin-bottom: 18px;
                    padding: 19px 20px;
                    border:
                        1px solid var(--bb-border);
                    border-radius: 16px;
                    background:
                        var(--bb-surface);
                    box-shadow:
                        var(--bb-shadow);
                }


                .bb-account-glow {
                    position: absolute;
                    width: 260px;
                    height: 260px;
                    right: -130px;
                    top: -170px;
                    border-radius: 50%;
                    background:
                        var(--bb-gold-soft);
                    filter: blur(48px);
                    pointer-events: none;
                }


                .bb-account-content {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 18px;
                    flex-wrap: wrap;
                }


                .bb-profile-block {
                    display: flex;
                    align-items: center;
                    gap: 13px;
                }


                .bb-avatar {
                    width: 52px;
                    height: 52px;
                    display: grid;
                    place-items: center;
                    border-radius: 14px;
                    background:
                        linear-gradient(
                            135deg,
                            var(--bb-gold),
                            var(--bb-primary)
                        );
                    color: #09120f;
                    font-size: 17px;
                    font-weight: 900;
                }


                .bb-profile-block h2 {
                    margin: 0;
                    color: var(--bb-text);
                    font-size: 15px;
                    line-height: 1.25;
                    font-weight: 800;
                }


                .bb-account-meta {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    margin-top: 4px;
                    color: var(--bb-text-muted);
                    font-size: 9px;
                }


                .bb-account-meta svg {
                    color: var(--bb-primary);
                }


                .bb-active-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 7px 10px;
                    border:
                        1px solid var(--bb-primary-soft);
                    border-radius: 999px;
                    background:
                        var(--bb-primary-soft);
                    color: var(--bb-primary);
                    font-size: 8px;
                    font-weight: 850;
                    letter-spacing: .65px;
                }


                .settings-grid {
                    display: grid;
                    grid-template-columns:
                        minmax(0, 1fr)
                        minmax(0, 1fr);
                    align-items: start;
                    gap: 17px;
                }


                .settings-column {
                    display: flex;
                    flex-direction: column;
                    gap: 17px;
                }


                .bb-settings-card {
                    min-width: 0;
                    padding: 18px;
                    border:
                        1px solid var(--bb-border);
                    border-radius: 15px;
                    background:
                        var(--bb-surface);
                    box-shadow:
                        var(--bb-shadow);
                }


                .bb-form {
                    display: grid;
                    gap: 14px;
                    padding-top: 15px;
                }


                .bb-field label {
                    display: block;
                    margin-bottom: 6px;
                    color: var(--bb-text-muted);
                    font-size: 8px;
                    font-weight: 650;
                }


                .bb-field input {
                    width: 100%;
                    height: 42px;
                    box-sizing: border-box;
                    padding: 0 12px;
                    border:
                        1px solid var(--bb-border);
                    border-radius: 10px;
                    outline: none;
                    background:
                        var(--bb-input);
                    color:
                        var(--bb-text);
                    font-family: inherit;
                    font-size: 10px;
                    font-weight: 550;
                }


                .bb-field input::placeholder {
                    color:
                        var(--bb-text-faint);
                }


                .bb-field input:focus {
                    border-color:
                        var(--bb-primary);
                    box-shadow:
                        0 0 0 3px
                        var(--bb-primary-soft);
                }


                .bb-input-with-icon {
                    position: relative;
                }


                .bb-input-with-icon > svg {
                    position: absolute;
                    left: 12px;
                    top: 14px;
                    color:
                        var(--bb-text-faint);
                }


                .bb-input-with-icon input {
                    padding-left: 34px;
                }


                /* THEME SELECTOR */

                .bb-theme-selector {
                    display: grid;
                    gap: 8px;
                    padding-top: 15px;
                }


                .bb-theme-option {
                    width: 100%;
                    min-height: 61px;
                    display: flex;
                    align-items: center;
                    gap: 11px;
                    padding: 9px 10px;
                    border:
                        1px solid var(--bb-border);
                    border-radius: 11px;
                    background:
                        var(--bb-surface-2);
                    color:
                        var(--bb-text);
                    text-align: left;
                    cursor: pointer;
                    font-family: inherit;
                    transition:
                        border-color .18s ease,
                        background .18s ease,
                        transform .18s ease;
                }


                .bb-theme-option:hover {
                    transform:
                        translateY(-1px);
                    border-color:
                        var(--bb-primary);
                }


                .bb-theme-option.active {
                    border-color:
                        var(--bb-primary);
                    background:
                        var(--bb-primary-soft);
                }


                .bb-theme-icon {
                    width: 35px;
                    height: 35px;
                    min-width: 35px;
                    display: grid;
                    place-items: center;
                    border-radius: 9px;
                    background:
                        var(--bb-surface-3);
                    color:
                        var(--bb-text-secondary);
                }


                .bb-theme-option.active
                .bb-theme-icon {
                    color:
                        var(--bb-primary);
                    background:
                        var(--bb-primary-soft);
                }


                .bb-theme-copy {
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }


                .bb-theme-copy strong {
                    color:
                        var(--bb-text);
                    font-size: 10px;
                    font-weight: 750;
                }


                .bb-theme-copy span {
                    color:
                        var(--bb-text-muted);
                    font-size: 8px;
                    line-height: 1.4;
                }


                .bb-theme-check {
                    width: 22px;
                    height: 22px;
                    min-width: 22px;
                    margin-left: auto;
                    display: grid;
                    place-items: center;
                    border-radius: 50%;
                    color:
                        var(--bb-primary);
                }


                .bb-theme-option.active
                .bb-theme-check {
                    background:
                        var(--bb-primary-soft);
                }


                .bb-current-theme {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    margin: 11px 0 0;
                    padding: 10px;
                    border:
                        1px solid var(--bb-border-soft);
                    border-radius: 9px;
                    background:
                        var(--bb-surface-2);
                }


                .bb-current-theme-icon {
                    width: 28px;
                    height: 28px;
                    min-width: 28px;
                    display: grid;
                    place-items: center;
                    border-radius: 8px;
                    background:
                        var(--bb-gold-soft);
                    color:
                        var(--bb-gold);
                }


                .bb-current-theme strong {
                    display: block;
                    color:
                        var(--bb-text);
                    font-size: 9px;
                    font-weight: 700;
                }


                .bb-current-theme span {
                    display: block;
                    margin-top: 2px;
                    color:
                        var(--bb-text-muted);
                    font-size: 8px;
                    line-height: 1.4;
                }


                /* TOGGLE */

                .bb-toggle {
                    width: 42px;
                    height: 24px;
                    padding: 3px;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    border:
                        1px solid var(--bb-border);
                    border-radius: 999px;
                    background:
                        var(--bb-surface-3);
                    cursor: pointer;
                }


                .bb-toggle-on {
                    justify-content: flex-end;
                    border-color:
                        var(--bb-primary);
                    background:
                        var(--bb-primary);
                    box-shadow:
                        0 0 16px
                        var(--bb-primary-soft);
                }


                .bb-toggle-knob {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #fff;
                    box-shadow:
                        0 2px 7px
                        rgba(0,0,0,.25);
                }


                /* STATUS */

                .bb-status-chip {
                    padding: 5px 8px;
                    border:
                        1px solid var(--bb-border);
                    border-radius: 6px;
                    background:
                        var(--bb-surface-3);
                    color:
                        var(--bb-text-secondary);
                    font-size: 8px;
                    font-weight: 750;
                }


                .bb-active-status {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color:
                        var(--bb-primary);
                    font-size: 8px;
                    font-weight: 750;
                }


                /* BUTTONS */

                .bb-outline-button {
                    height: 30px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 0 10px;
                    border:
                        1px solid var(--bb-border);
                    border-radius: 7px;
                    background:
                        var(--bb-surface-3);
                    color:
                        var(--bb-text-secondary);
                    font-family: inherit;
                    font-size: 8px;
                    font-weight: 750;
                    cursor: pointer;
                }


                .bb-outline-button:hover {
                    color:
                        var(--bb-text);
                    border-color:
                        var(--bb-primary);
                }


                /* DANGER */

                .bb-danger-card {
                    padding: 18px;
                    border:
                        1px solid var(--bb-danger-soft);
                    border-radius: 15px;
                    background:
                        var(--bb-surface);
                }


                .bb-danger-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    padding-top: 15px;
                }


                .bb-danger-content h3 {
                    margin: 0;
                    color:
                        var(--bb-danger);
                    font-size: 10px;
                    font-weight: 750;
                }


                .bb-danger-content p {
                    max-width: 350px;
                    margin: 3px 0 0;
                    color:
                        var(--bb-text-muted);
                    font-size: 8px;
                    line-height: 1.5;
                }


                .bb-danger-button {
                    height: 31px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 0 10px;
                    border:
                        1px solid var(--bb-danger);
                    border-radius: 7px;
                    background:
                        var(--bb-danger-soft);
                    color:
                        var(--bb-danger);
                    font-family: inherit;
                    font-size: 8px;
                    font-weight: 750;
                    cursor: pointer;
                }


                /* SAVE BAR */

                .bb-save-bar {
                    position: sticky;
                    bottom: 14px;
                    z-index: 50;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    margin-top: 17px;
                    padding: 9px 10px 9px 12px;
                    border:
                        1px solid var(--bb-border);
                    border-radius: 12px;
                    background:
                        color-mix(
                            in srgb,
                            var(--bb-surface) 94%,
                            transparent
                        );
                    backdrop-filter:
                        blur(18px);
                    box-shadow:
                        var(--bb-shadow);
                }


                .bb-save-status {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    color:
                        var(--bb-text-muted);
                    font-size: 8px;
                    font-weight: 600;
                }


                .bb-save-success {
                    color:
                        var(--bb-primary);
                }


                .bb-save-button {
                    height: 34px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 0 15px;
                    border: 0;
                    border-radius: 8px;
                    background:
                        var(--bb-primary);
                    color:
                        #06120e;
                    font-family: inherit;
                    font-size: 9px;
                    font-weight: 850;
                    cursor: pointer;
                }


                .bb-save-button:hover {
                    background:
                        var(--bb-primary-hover);
                }


                .bb-save-button.bb-saved {
                    background:
                        var(--bb-primary);
                }


                /* SIGN OUT */

                .bb-signout {
                    display: flex;
                    justify-content: center;
                    margin-top: 10px;
                }


                .bb-signout button {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 5px 8px;
                    border: 0;
                    background: transparent;
                    color:
                        var(--bb-text-faint);
                    font-family: inherit;
                    font-size: 8px;
                    font-weight: 650;
                    cursor: pointer;
                }


                .bb-signout button:hover {
                    color:
                        var(--bb-text-secondary);
                }


                /* RESPONSIVE */

                @media (max-width: 980px) {

                    .settings-grid {
                        grid-template-columns: 1fr;
                    }

                }


                @media (max-width: 650px) {

                    .budgetbuddy-settings {
                        padding:
                            22px 17px 90px;
                    }


                    .bb-settings-header h1 {
                        font-size: 25px;
                    }


                    .bb-profile-block {
                        width: 100%;
                    }


                    .bb-active-badge {
                        margin-left: 65px;
                    }

                }


                @media (max-width: 480px) {

                    .budgetbuddy-settings {
                        padding:
                            18px 12px 85px;
                    }


                    .bb-danger-content {
                        align-items:
                            flex-start;
                        flex-direction:
                            column;
                    }


                    .bb-danger-button {
                        width: 100%;
                        justify-content:
                            center;
                    }


                    .bb-save-status span {
                        display: none;
                    }

                }

                `}
            </style>

        </main>
    );
}