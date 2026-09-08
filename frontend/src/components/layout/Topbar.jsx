import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Search,
    Command,
    Sun,
    Moon,
    Bell,
    ChevronDown,
    ChevronRight,
    LayoutDashboard,
    WalletCards,
    ArrowDownToLine,
    Target,
    PiggyBank,
    ChartLine,
    Sparkles,
    FileText,
    Settings,
    X,
    LogOut,
    CalendarDays,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
    useNotifications,
} from "../../context/NotificationContext";


/* =========================================================
   CONSTANTS
========================================================= */

const THEME_KEY = "budgetbuddy-theme";

const QUICK_ACTIONS = [
    {
        label: "Dashboard",
        description: "View your financial overview",
        path: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Expenses",
        description: "Review and manage expenses",
        path: "/expenses",
        icon: WalletCards,
    },
    {
        label: "Income",
        description: "Manage your income",
        path: "/income",
        icon: ArrowDownToLine,
    },
    {
        label: "Budgets",
        description: "Review your spending limits",
        path: "/budgets",
        icon: Target,
    },
    {
        label: "Savings goals",
        description: "Track your financial goals",
        path: "/savings",
        icon: PiggyBank,
    },
    {
        label: "Analytics",
        description: "Explore your financial data",
        path: "/analytics",
        icon: ChartLine,
    },
    {
        label: "Insights",
        description: "View personalized insights",
        path: "/insights",
        icon: Sparkles,
    },
    {
        label: "Reports",
        description: "Generate financial reports",
        path: "/reports",
        icon: FileText,
    },
    {
        label: "Settings",
        description: "Manage your preferences",
        path: "/settings",
        icon: Settings,
    },
];


/* =========================================================
   THEME HELPERS
========================================================= */

function getStoredTheme() {
    const saved = localStorage.getItem(THEME_KEY);

    if (
        saved === "light" ||
        saved === "dark"
    ) {
        return saved;
    }

    return "dark";
}


function applyTheme(theme) {
    document.documentElement.setAttribute(
        "data-theme",
        theme
    );

    document.documentElement.classList.toggle(
        "light-mode",
        theme === "light"
    );

    localStorage.setItem(
        THEME_KEY,
        theme
    );

    window.dispatchEvent(
        new CustomEvent(
            "budgetbuddy-theme-changed",
            {
                detail: { theme },
            }
        )
    );
}


/* =========================================================
   TOPBAR
========================================================= */

export default function Topbar() {

    const navigate = useNavigate();

    /* =====================================================
       USER
    ===================================================== */

    const [
        username,
        setUsername,
    ] = useState(
        localStorage.getItem("username") ||
        "User"
    );


    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    const {
        unreadCount = 0,
    } = useNotifications();


    /* =====================================================
       STATE
    ===================================================== */

    const [
        searchValue,
        setSearchValue,
    ] = useState("");

    const [
        searchOpen,
        setSearchOpen,
    ] = useState(false);

    const [
        selectedIndex,
        setSelectedIndex,
    ] = useState(0);

    const [
        theme,
        setTheme,
    ] = useState(getStoredTheme);

    const [
        profileOpen,
        setProfileOpen,
    ] = useState(false);


    const searchRef = useRef(null);
    const profileRef = useRef(null);


    /* =====================================================
       USER SYNCHRONIZATION
    ===================================================== */

    useEffect(() => {

        const syncUser = () => {
            setUsername(
                localStorage.getItem("username") ||
                "User"
            );
        };

        window.addEventListener(
            "storage",
            syncUser
        );

        window.addEventListener(
            "budgetbuddy-settings-updated",
            syncUser
        );

        return () => {
            window.removeEventListener(
                "storage",
                syncUser
            );

            window.removeEventListener(
                "budgetbuddy-settings-updated",
                syncUser
            );
        };

    }, []);


    /* =====================================================
       INITIAL THEME
    ===================================================== */

    useEffect(() => {
        applyTheme(theme);
    }, []);


    /* =====================================================
       GREETING
    ===================================================== */

    const greeting = useMemo(() => {

        const hour =
            new Date().getHours();

        if (hour < 12) {
            return "Good morning";
        }

        if (hour < 17) {
            return "Good afternoon";
        }

        if (hour < 21) {
            return "Good evening";
        }

        return "Good night";

    }, []);


    /* =====================================================
       CURRENT DATE
    ===================================================== */

    const currentDate = useMemo(() => {

        return new Intl.DateTimeFormat(
            "en-IN",
            {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        ).format(new Date());

    }, []);


    /* =====================================================
       SEARCH RESULTS
    ===================================================== */

    const filteredActions = useMemo(() => {

        const query =
            searchValue
                .trim()
                .toLowerCase();

        if (!query) {
            return QUICK_ACTIONS;
        }

        return QUICK_ACTIONS.filter(
            (item) =>
                item.label
                    .toLowerCase()
                    .includes(query) ||
                item.description
                    .toLowerCase()
                    .includes(query)
        );

    }, [searchValue]);


    /* =====================================================
       SEARCH OPEN
    ===================================================== */

    const openSearch = () => {

        setSearchOpen(true);

        window.setTimeout(() => {
            searchRef.current?.focus();
        }, 40);

    };


    /* =====================================================
       SEARCH CLOSE
    ===================================================== */

    const closeSearch = () => {

        setSearchOpen(false);
        setSearchValue("");
        setSelectedIndex(0);

    };


    /* =====================================================
       EXECUTE SEARCH ACTION
    ===================================================== */

    const executeAction = (action) => {

        if (action.path) {
            navigate(action.path);
            closeSearch();
        }

    };


    /* =====================================================
       SEARCH KEYBOARD NAVIGATION
    ===================================================== */

    const handleSearchKeyDown = (event) => {

        if (event.key === "ArrowDown") {

            event.preventDefault();

            setSelectedIndex(
                (previous) =>
                    Math.min(
                        previous + 1,
                        Math.max(
                            filteredActions.length - 1,
                            0
                        )
                    )
            );

            return;
        }


        if (event.key === "ArrowUp") {

            event.preventDefault();

            setSelectedIndex(
                (previous) =>
                    Math.max(
                        previous - 1,
                        0
                    )
            );

            return;
        }


        if (event.key === "Enter") {

            event.preventDefault();

            const selected =
                filteredActions[selectedIndex];

            if (selected) {
                executeAction(selected);
            }

            return;
        }


        if (event.key === "Escape") {
            closeSearch();
        }

    };


    /* =====================================================
       GLOBAL SEARCH SHORTCUT
    ===================================================== */

    useEffect(() => {

        const handleShortcut = (event) => {

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                openSearch();

            }

        };

        window.addEventListener(
            "keydown",
            handleShortcut
        );

        return () => {

            window.removeEventListener(
                "keydown",
                handleShortcut
            );

        };

    }, []);


    /* =====================================================
       OUTSIDE PROFILE CLICK
    ===================================================== */

    useEffect(() => {

        const handleOutsideClick = (event) => {

            if (
                profileRef.current &&
                !profileRef.current.contains(
                    event.target
                )
            ) {
                setProfileOpen(false);
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


    /* =====================================================
       THEME TOGGLE
    ===================================================== */

    const toggleTheme = () => {

        const nextTheme =
            theme === "dark"
                ? "light"
                : "dark";

        setTheme(nextTheme);
        applyTheme(nextTheme);

    };


    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = () => {

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("username");

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
        <>
            <header className="bb-premium-topbar">

                {/* =================================================
                    GREETING
                ================================================= */}

                <section
                    className="bb-topbar-greeting"
                    aria-label="Financial greeting"
                >

                    <div className="bb-greeting-title">

                        <span>
                            {greeting},
                        </span>

                        <strong>
                            {username}
                        </strong>

                        <span
                            className="bb-greeting-wave"
                            aria-hidden="true"
                        >
                            👋
                        </span>

                    </div>


                    <div className="bb-greeting-subtitle">

                        <Sparkles
                            size={12}
                            strokeWidth={2}
                        />

                        <span>
                            Here's your financial snapshot
                        </span>

                    </div>

                </section>


                {/* =================================================
                    SEARCH
                ================================================= */}

                <section
                    className={
                        `bb-topbar-search-wrapper ${
                            searchOpen
                                ? "is-open"
                                : ""
                        }`
                    }
                >

                    <div className="bb-topbar-search">

                        <Search
                            className="bb-search-icon"
                            size={18}
                            strokeWidth={1.8}
                        />


                        <input
                            ref={searchRef}
                            type="text"
                            value={searchValue}
                            placeholder="Search BudgetBuddy..."
                            aria-label="Search BudgetBuddy"
                            onFocus={() =>
                                setSearchOpen(true)
                            }
                            onChange={(event) => {

                                setSearchValue(
                                    event.target.value
                                );

                                setSearchOpen(true);
                                setSelectedIndex(0);

                            }}
                            onKeyDown={
                                handleSearchKeyDown
                            }
                        />


                        <button
                            type="button"
                            className="bb-search-command-button"
                            onClick={() => {

                                setSearchOpen(
                                    !searchOpen
                                );

                                window.setTimeout(
                                    () => {
                                        searchRef.current?.focus();
                                    },
                                    30
                                );

                            }}
                            aria-label="Open quick menu"
                        >

                            <Command
                                size={14}
                                strokeWidth={1.8}
                            />

                            <span>
                                K
                            </span>

                        </button>

                    </div>


                    {/* =================================================
                        COMMAND MENU
                    ================================================= */}

                    {searchOpen && (

                        <div className="bb-command-menu">

                            <div className="bb-command-header">

                                <div>

                                    <span className="bb-command-eyebrow">
                                        QUICK ACCESS
                                    </span>

                                    <strong>
                                        What would you like to do?
                                    </strong>

                                </div>


                                <button
                                    type="button"
                                    onClick={closeSearch}
                                    aria-label="Close search"
                                >

                                    <X size={16} />

                                </button>

                            </div>


                            <div className="bb-command-list">

                                {filteredActions.length > 0 ? (

                                    filteredActions.map(
                                        (
                                            action,
                                            index
                                        ) => {

                                            const Icon =
                                                action.icon;

                                            return (
                                                <button
                                                    key={
                                                        action.label
                                                    }
                                                    type="button"
                                                    className={
                                                        `bb-command-item ${
                                                            selectedIndex ===
                                                            index
                                                                ? "is-selected"
                                                                : ""
                                                        }`
                                                    }
                                                    onMouseEnter={() =>
                                                        setSelectedIndex(
                                                            index
                                                        )
                                                    }
                                                    onClick={() =>
                                                        executeAction(
                                                            action
                                                        )
                                                    }
                                                >

                                                    <span className="bb-command-icon">

                                                        <Icon
                                                            size={17}
                                                            strokeWidth={1.9}
                                                        />

                                                    </span>


                                                    <span className="bb-command-copy">

                                                        <strong>
                                                            {
                                                                action.label
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                action.description
                                                            }
                                                        </small>

                                                    </span>


                                                    <ChevronRight
                                                        size={15}
                                                        className="bb-command-arrow"
                                                    />

                                                </button>
                                            );

                                        }
                                    )

                                ) : (

                                    <div className="bb-command-empty">

                                        <Search size={20} />

                                        <span>
                                            No matching actions found.
                                        </span>

                                    </div>

                                )}

                            </div>


                            <div className="bb-command-footer">

                                <span>
                                    ↑↓ Navigate
                                </span>

                                <span>
                                    Enter Select
                                </span>

                                <span>
                                    Esc Close
                                </span>

                            </div>

                        </div>

                    )}

                </section>


                {/* =================================================
                    RIGHT ACTIONS
                ================================================= */}

                <section className="bb-topbar-actions">

                    {/* DATE */}

                    <div className="bb-topbar-date">

                        <CalendarDays
                            size={15}
                            strokeWidth={1.8}
                        />

                        <span>
                            {currentDate}
                        </span>

                    </div>


                    {/* THEME */}

                    <button
                        type="button"
                        className="bb-topbar-icon-button"
                        onClick={toggleTheme}
                        aria-label={
                            theme === "dark"
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                        title={
                            theme === "dark"
                                ? "Light mode"
                                : "Dark mode"
                        }
                    >

                        {theme === "dark" ? (
                            <Sun
                                size={18}
                                strokeWidth={1.8}
                            />
                        ) : (
                            <Moon
                                size={18}
                                strokeWidth={1.8}
                            />
                        )}

                    </button>


                    {/* NOTIFICATIONS */}

                    <button
                        type="button"
                        className={
                            `bb-topbar-icon-button ${
                                unreadCount > 0
                                    ? "has-notifications"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            navigate(
                                "/notifications"
                            )
                        }
                        aria-label={
                            unreadCount > 0
                                ? `${unreadCount} unread notifications`
                                : "Notifications"
                        }
                        title="Notifications"
                    >

                        <Bell
                            size={18}
                            strokeWidth={1.8}
                        />


                        {unreadCount > 0 && (

                            <span className="bb-notification-badge">

                                {unreadCount > 99
                                    ? "99+"
                                    : unreadCount}

                            </span>

                        )}

                    </button>


                    {/* PROFILE */}

                    <div
                        ref={profileRef}
                        className="bb-topbar-profile-wrapper"
                    >

                        <button
                            type="button"
                            className={
                                `bb-topbar-profile ${
                                    profileOpen
                                        ? "is-open"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                setProfileOpen(
                                    !profileOpen
                                )
                            }
                            aria-label="Open profile menu"
                        >

                            <span className="bb-topbar-avatar">

                                {
                                    username
                                        ?.trim()
                                        .charAt(0)
                                        .toUpperCase() ||
                                    "U"
                                }

                                <i />

                            </span>


                            <span className="bb-topbar-profile-copy">

                                <strong>
                                    {username}
                                </strong>

                                <small>
                                    Personal
                                </small>

                            </span>


                            <ChevronDown
                                size={15}
                                className="bb-profile-chevron"
                            />

                        </button>


                        {/* PROFILE MENU */}

                        {profileOpen && (

                            <div className="bb-profile-menu">

                                <div className="bb-profile-menu-header">

                                    <span className="bb-profile-menu-avatar">

                                        {
                                            username
                                                ?.trim()
                                                .charAt(0)
                                                .toUpperCase() ||
                                            "U"
                                        }

                                    </span>


                                    <div>

                                        <strong>
                                            {username}
                                        </strong>

                                        <small>
                                            Personal workspace
                                        </small>

                                    </div>

                                </div>


                                <div className="bb-profile-menu-divider" />


                                <button
                                    type="button"
                                    onClick={() => {

                                        setProfileOpen(false);

                                        navigate(
                                            "/settings"
                                        );

                                    }}
                                >

                                    <Settings size={16} />

                                    <span>
                                        Settings
                                    </span>

                                </button>


                                <button
                                    type="button"
                                    className="is-danger"
                                    onClick={handleLogout}
                                >

                                    <LogOut size={16} />

                                    <span>
                                        Sign out
                                    </span>

                                </button>

                            </div>

                        )}

                    </div>

                </section>

            </header>


            {/* =====================================================
                PREMIUM TOPBAR STYLES
            ===================================================== */}

            <style>
                {`

                /* =====================================================
                   FOUNDATION
                ===================================================== */

                .bb-premium-topbar,
                .bb-premium-topbar *,
                .bb-premium-topbar *::before,
                .bb-premium-topbar *::after {

                    box-sizing: border-box;

                }


                .bb-premium-topbar {

                    --topbar-primary: #F5F7FA;
                    --topbar-secondary: #AAB5C2;
                    --topbar-muted: #78879A;
                    --topbar-border:
                        rgba(148,163,184,.14);

                    --topbar-green: #08D69B;

                    position: fixed;

                    top: 0;
                    right: 0;
                    left: 250px;

                    height: 68px;

                    z-index: 900;

                    display: flex;

                    align-items: center;

                    justify-content: space-between;

                    gap: 24px;

                    padding: 0 22px 0 32px;

                    background:
                        rgba(7,11,17,.92);

                    border-bottom:
                        1px solid var(--topbar-border);

                    backdrop-filter:
                        blur(20px);

                    -webkit-backdrop-filter:
                        blur(20px);

                    color:
                        var(--topbar-primary);

                    font-family:
                        Inter,
                        ui-sans-serif,
                        system-ui,
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        sans-serif;

                    -webkit-font-smoothing:
                        antialiased;

                    -moz-osx-font-smoothing:
                        grayscale;

                    text-rendering:
                        optimizeLegibility;

                }


                .bb-premium-topbar::after {

                    content: "";

                    position: absolute;

                    left: 0;
                    right: 0;
                    bottom: -1px;

                    height: 1px;

                    background:
                        linear-gradient(
                            90deg,
                            transparent,
                            rgba(8,214,155,.16),
                            transparent
                        );

                    pointer-events: none;

                }


                /* =====================================================
                   GREETING
                ===================================================== */

                .bb-topbar-greeting {

                    flex: 0 0 auto;

                    min-width: 215px;

                    display: flex;

                    flex-direction: column;

                    justify-content: center;

                }


                .bb-greeting-title {

                    display: flex;

                    align-items: baseline;

                    gap: 5px;

                    color: #E9EEF2;

                    font-size: 14px;

                    line-height: 1.3;

                    font-weight: 600;

                    letter-spacing: -.12px;

                    white-space: nowrap;

                }


                .bb-greeting-title strong {

                    color: #FFFFFF;

                    font-size: 14px;

                    font-weight: 800;

                    letter-spacing: -.18px;

                }


                .bb-greeting-wave {

                    margin-left: 3px;

                    font-size: 14px;

                    line-height: 1;

                }


                .bb-greeting-subtitle {

                    display: flex;

                    align-items: center;

                    gap: 6px;

                    margin-top: 5px;

                    color: var(--topbar-muted);

                    font-size: 10px;

                    line-height: 1.4;

                    font-weight: 500;

                }


                .bb-greeting-subtitle svg {

                    flex-shrink: 0;

                    color: var(--topbar-green);

                }


                /* =====================================================
                   SEARCH
                ===================================================== */

                .bb-topbar-search-wrapper {

                    position: relative;

                    width:
                        min(420px, 36vw);

                    margin-left: auto;
                    margin-right: auto;

                }


                .bb-topbar-search {

                    height: 42px;

                    display: flex;

                    align-items: center;

                    padding: 0 8px 0 13px;

                    border:
                        1px solid
                        rgba(148,163,184,.16);

                    border-radius: 11px;

                    background:
                        rgba(15,22,31,.82);

                    transition:
                        border-color .18s ease,
                        background .18s ease,
                        box-shadow .18s ease;

                }


                .bb-topbar-search-wrapper.is-open
                .bb-topbar-search {

                    border-color:
                        rgba(8,214,155,.36);

                    background:
                        rgba(13,20,28,.97);

                    box-shadow:
                        0 0 0 3px
                        rgba(8,214,155,.055);

                }


                .bb-search-icon {

                    flex-shrink: 0;

                    color: #8190A3;

                }


                .bb-topbar-search input {

                    flex: 1;

                    min-width: 0;

                    height: 100%;

                    padding: 0 11px;

                    border: 0;

                    outline: 0;

                    background: transparent;

                    color: #F4F7F9;

                    font-family: inherit;

                    font-size: 11px;

                    line-height: 1.4;

                    font-weight: 550;

                }


                .bb-topbar-search input::placeholder {

                    color: #718095;

                    opacity: 1;

                }


                /* =====================================================
                   SEARCH COMMAND BUTTON
                ===================================================== */

                .bb-search-command-button {

                    height: 27px;

                    min-width: 46px;

                    display: inline-flex;

                    align-items: center;

                    justify-content: center;

                    gap: 4px;

                    padding: 0 6px;

                    border:
                        1px solid
                        rgba(148,163,184,.15);

                    border-radius: 7px;

                    background:
                        rgba(255,255,255,.028);

                    color: #7C8A9D;

                    cursor: pointer;

                    font-family: inherit;

                }


                .bb-search-command-button span {

                    font-size: 9px;

                    line-height: 1;

                    font-weight: 750;

                }


                .bb-search-command-button:hover {

                    color: #E7EDF1;

                    border-color:
                        rgba(148,163,184,.24);

                    background:
                        rgba(255,255,255,.05);

                }


                /* =====================================================
                   COMMAND MENU
                ===================================================== */

                .bb-command-menu {

                    position: absolute;

                    top: calc(100% + 10px);

                    left: 0;

                    width: 100%;

                    min-width: 390px;

                    overflow: hidden;

                    border:
                        1px solid
                        rgba(148,163,184,.16);

                    border-radius: 15px;

                    background:
                        rgba(9,14,21,.985);

                    box-shadow:
                        0 28px 70px
                        rgba(0,0,0,.44);

                    backdrop-filter:
                        blur(24px);

                }


                .bb-command-header {

                    display: flex;

                    align-items: center;

                    justify-content: space-between;

                    padding: 17px 17px 14px;

                    border-bottom:
                        1px solid
                        rgba(148,163,184,.085);

                }


                .bb-command-header > div {

                    display: flex;

                    flex-direction: column;

                    gap: 5px;

                }


                .bb-command-eyebrow {

                    color: var(--topbar-green);

                    font-size: 8px;

                    line-height: 1.2;

                    font-weight: 850;

                    letter-spacing: 1.1px;

                }


                .bb-command-header strong {

                    color: #F1F5F7;

                    font-size: 13px;

                    line-height: 1.3;

                    font-weight: 750;

                }


                .bb-command-header button {

                    width: 30px;
                    height: 30px;

                    display: grid;

                    place-items: center;

                    border:
                        1px solid
                        rgba(148,163,184,.13);

                    border-radius: 8px;

                    background:
                        rgba(255,255,255,.025);

                    color: #8491A2;

                    cursor: pointer;

                }


                .bb-command-list {

                    max-height: 410px;

                    overflow-y: auto;

                    padding: 8px;

                    scrollbar-width: thin;

                }


                .bb-command-item {

                    width: 100%;

                    min-height: 57px;

                    display: flex;

                    align-items: center;

                    gap: 12px;

                    padding: 8px 10px;

                    border:
                        1px solid
                        transparent;

                    border-radius: 10px;

                    background: transparent;

                    color: #9EABB9;

                    text-align: left;

                    cursor: pointer;

                    font-family: inherit;

                }


                .bb-command-item:hover,
                .bb-command-item.is-selected {

                    color: #F4F7F9;

                    background:
                        rgba(8,214,155,.065);

                    border-color:
                        rgba(8,214,155,.11);

                }


                .bb-command-icon {

                    width: 35px;
                    height: 35px;

                    min-width: 35px;

                    display: grid;

                    place-items: center;

                    border-radius: 9px;

                    color: var(--topbar-green);

                    background:
                        rgba(8,214,155,.075);

                }


                .bb-command-copy {

                    flex: 1;

                    min-width: 0;

                    display: flex;

                    flex-direction: column;

                    gap: 4px;

                }


                .bb-command-copy strong {

                    color: currentColor;

                    font-size: 11px;

                    line-height: 1.3;

                    font-weight: 700;

                }


                .bb-command-copy small {

                    overflow: hidden;

                    color: #738297;

                    font-size: 9px;

                    line-height: 1.35;

                    font-weight: 500;

                    white-space: nowrap;

                    text-overflow: ellipsis;

                }


                .bb-command-arrow {

                    flex-shrink: 0;

                    color: #59687A;

                }


                .bb-command-empty {

                    min-height: 120px;

                    display: flex;

                    flex-direction: column;

                    align-items: center;

                    justify-content: center;

                    gap: 9px;

                    color: #758397;

                    font-size: 10px;

                    line-height: 1.4;

                    font-weight: 550;

                }


                .bb-command-footer {

                    display: flex;

                    align-items: center;

                    gap: 15px;

                    padding: 10px 15px;

                    border-top:
                        1px solid
                        rgba(148,163,184,.075);

                    color: #667487;

                    font-size: 8px;

                    line-height: 1.3;

                    font-weight: 600;

                }


                /* =====================================================
                   RIGHT ACTIONS
                ===================================================== */

                .bb-topbar-actions {

                    display: flex;

                    align-items: center;

                    gap: 9px;

                    flex-shrink: 0;

                }


                .bb-topbar-date {

                    display: flex;

                    align-items: center;

                    gap: 7px;

                    padding: 0 7px;

                    color: #8491A2;

                    font-size: 9px;

                    line-height: 1.3;

                    font-weight: 550;

                    white-space: nowrap;

                }


                .bb-topbar-date svg {

                    color: #718096;

                }


                /* =====================================================
                   ICON BUTTONS
                ===================================================== */

                .bb-topbar-icon-button {

                    position: relative;

                    width: 39px;
                    height: 39px;

                    display: grid;

                    place-items: center;

                    border:
                        1px solid
                        rgba(148,163,184,.13);

                    border-radius: 10px;

                    background:
                        rgba(255,255,255,.025);

                    color: #96A2B1;

                    cursor: pointer;

                    transition:
                        background .18s ease,
                        border-color .18s ease,
                        color .18s ease,
                        transform .18s ease;

                }


                .bb-topbar-icon-button:hover {

                    color: #F4F7F9;

                    background:
                        rgba(255,255,255,.055);

                    border-color:
                        rgba(148,163,184,.23);

                    transform:
                        translateY(-1px);

                }


                /* =====================================================
                   NOTIFICATION BADGE
                ===================================================== */

                .bb-notification-badge {

                    position: absolute;

                    top: -5px;
                    right: -5px;

                    min-width: 18px;
                    height: 18px;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    padding: 0 4px;

                    border:
                        2px solid
                        #080D14;

                    border-radius: 999px;

                    background:
                        var(--topbar-green);

                    color: #03130D;

                    font-size: 8px;

                    line-height: 1;

                    font-weight: 900;

                    box-shadow:
                        0 0 12px
                        rgba(8,214,155,.34);

                }


                /* =====================================================
                   PROFILE
                ===================================================== */

                .bb-topbar-profile-wrapper {

                    position: relative;

                }


                .bb-topbar-profile {

                    min-height: 42px;

                    display: flex;

                    align-items: center;

                    gap: 8px;

                    padding: 3px 8px 3px 4px;

                    border:
                        1px solid
                        transparent;

                    border-radius: 10px;

                    background: transparent;

                    color: #F3F6F8;

                    cursor: pointer;

                    font-family: inherit;

                }


                .bb-topbar-profile:hover,
                .bb-topbar-profile.is-open {

                    background:
                        rgba(255,255,255,.035);

                    border-color:
                        rgba(148,163,184,.11);

                }


                .bb-topbar-avatar {

                    position: relative;

                    width: 32px;
                    height: 32px;

                    min-width: 32px;

                    display: grid;

                    place-items: center;

                    border-radius: 9px;

                    background:
                        linear-gradient(
                            145deg,
                            #11DFA2,
                            #08D69B,
                            #CBAF6C
                        );

                    color: #03130D;

                    font-size: 12px;

                    line-height: 1;

                    font-weight: 900;

                }


                .bb-topbar-avatar i {

                    position: absolute;

                    right: -2px;
                    bottom: -2px;

                    width: 8px;
                    height: 8px;

                    border-radius: 50%;

                    background: #08D69B;

                    border:
                        2px solid
                        #080D14;

                }


                .bb-topbar-profile-copy {

                    display: flex;

                    flex-direction: column;

                    align-items: flex-start;

                    gap: 3px;

                }


                .bb-topbar-profile-copy strong {

                    max-width: 100px;

                    overflow: hidden;

                    color: #F4F7F9;

                    font-size: 10px;

                    line-height: 1.25;

                    font-weight: 750;

                    white-space: nowrap;

                    text-overflow: ellipsis;

                }


                .bb-topbar-profile-copy small {

                    color: #718095;

                    font-size: 8px;

                    line-height: 1.25;

                    font-weight: 550;

                }


                .bb-profile-chevron {

                    color: #748196;

                }


                /* =====================================================
                   PROFILE MENU
                ===================================================== */

                .bb-profile-menu {

                    position: absolute;

                    top: calc(100% + 9px);

                    right: 0;

                    width: 220px;

                    padding: 8px;

                    border:
                        1px solid
                        rgba(148,163,184,.15);

                    border-radius: 13px;

                    background:
                        rgba(9,14,21,.985);

                    box-shadow:
                        0 24px 60px
                        rgba(0,0,0,.40);

                    backdrop-filter:
                        blur(20px);

                }


                .bb-profile-menu-header {

                    display: flex;

                    align-items: center;

                    gap: 10px;

                    padding: 9px;

                }


                .bb-profile-menu-avatar {

                    width: 34px;
                    height: 34px;

                    display: grid;

                    place-items: center;

                    border-radius: 9px;

                    background:
                        linear-gradient(
                            145deg,
                            #11DFA2,
                            #08D69B,
                            #CBAF6C
                        );

                    color: #03130D;

                    font-size: 11px;

                    line-height: 1;

                    font-weight: 900;

                }


                .bb-profile-menu-header div {

                    min-width: 0;

                    display: flex;

                    flex-direction: column;

                    gap: 4px;

                }


                .bb-profile-menu-header strong {

                    overflow: hidden;

                    color: #F3F6F8;

                    font-size: 10px;

                    line-height: 1.3;

                    font-weight: 750;

                    white-space: nowrap;

                    text-overflow: ellipsis;

                }


                .bb-profile-menu-header small {

                    color: #718095;

                    font-size: 8px;

                    line-height: 1.3;

                    font-weight: 550;

                }


                .bb-profile-menu-divider {

                    height: 1px;

                    margin: 4px 0 5px;

                    background:
                        rgba(148,163,184,.08);

                }


                .bb-profile-menu > button {

                    width: 100%;

                    min-height: 38px;

                    display: flex;

                    align-items: center;

                    gap: 10px;

                    padding: 0 10px;

                    border: 0;

                    border-radius: 8px;

                    background: transparent;

                    color: #9AA7B6;

                    font-family: inherit;

                    font-size: 10px;

                    line-height: 1.3;

                    font-weight: 600;

                    text-align: left;

                    cursor: pointer;

                }


                .bb-profile-menu > button:hover {

                    color: #F4F7F9;

                    background:
                        rgba(255,255,255,.045);

                }


                .bb-profile-menu > button.is-danger:hover {

                    color: #FF737D;

                    background:
                        rgba(255,102,114,.055);

                }


                /* =====================================================
                   RESPONSIVE
                ===================================================== */

                @media (max-width: 1180px) {

                    .bb-topbar-date {
                        display: none;
                    }

                    .bb-topbar-search-wrapper {
                        width:
                            min(360px, 35vw);
                    }

                }


                @media (max-width: 900px) {

                    .bb-premium-topbar {

                        left: 232px;

                        padding:
                            0 16px 0 22px;

                    }


                    .bb-topbar-greeting {

                        min-width: 185px;

                    }


                    .bb-greeting-subtitle {

                        display: none;

                    }


                    .bb-topbar-search-wrapper {

                        width: 300px;

                    }


                    .bb-topbar-profile-copy,
                    .bb-profile-chevron {

                        display: none;

                    }

                }


                @media (max-width: 720px) {

                    .bb-premium-topbar {

                        left: 72px;

                        height: 62px;

                        gap: 8px;

                        padding: 0 10px;

                    }


                    .bb-topbar-greeting {

                        display: none;

                    }


                    .bb-topbar-search-wrapper {

                        width: auto;

                        flex: 1;

                    }


                    .bb-topbar-actions {

                        gap: 5px;

                    }


                    .bb-topbar-profile-copy,
                    .bb-profile-chevron {

                        display: none;

                    }


                    .bb-topbar-profile {

                        padding: 3px;

                    }


                    .bb-command-menu {

                        position: fixed;

                        top: 71px;

                        left: 80px;

                        right: 8px;

                        width: auto;

                        min-width: 0;

                    }

                }


                /* =====================================================
                   ACCESSIBILITY
                ===================================================== */

                .bb-premium-topbar button:focus-visible,
                .bb-premium-topbar input:focus-visible {

                    outline:
                        2px solid
                        rgba(8,214,155,.65);

                    outline-offset: 2px;

                }


                @media (
                    prefers-reduced-motion: reduce
                ) {

                    .bb-premium-topbar *,
                    .bb-premium-topbar *::before,
                    .bb-premium-topbar *::after {

                        transition: none !important;

                        animation: none !important;

                    }

                }

                `}
            </style>
        </>
    );
}