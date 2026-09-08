import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import {
    LayoutDashboard,
    WalletCards,
    ArrowDownToLine,
    PiggyBank,
    Target,
    ChartNoAxesCombined,
    ChartLine,
    Bell,
    Settings,
    Sparkles,
    ChevronRight,
    LogOut,
    ShieldCheck,
} from "lucide-react";

import { Badge } from "@mui/material";

import { useNotifications } from "../../context/NotificationContext";


/* =========================================================
   NAVIGATION
========================================================= */

const navigation = [
    {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Income",
        path: "/income",
        icon: ArrowDownToLine,
    },
    {
        label: "Expenses",
        path: "/expenses",
        icon: WalletCards,
    },
    {
        label: "Budgets",
        path: "/budgets",
        icon: Target,
    },
    {
        label: "Savings Goals",
        path: "/savings",
        icon: PiggyBank,
    },
    {
        label: "Reports",
        path: "/reports",
        icon: ChartNoAxesCombined,
    },
    {
        label: "Analytics",
        path: "/analytics",
        icon: ChartLine,
        featured: true,
        badge: "PRO",
    },
    {
        label: "Insights",
        path: "/insights",
        icon: Sparkles,
        featured: true,
        badge: "NEW",
    },
    {
        label: "Notifications",
        path: "/notifications",
        icon: Bell,
        notification: true,
    },
    {
        label: "Settings",
        path: "/settings",
        icon: Settings,
    },
];


/* =========================================================
   SIDEBAR
========================================================= */

export default function Sidebar() {

    /* =====================================================
       USER
    ===================================================== */

    const [
        username,
        setUsername,
    ] = useState(
        localStorage.getItem(
            "username"
        ) || "User"
    );


    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    const {
        unreadCount = 0,
    } = useNotifications();


    /* =====================================================
       SYNCHRONIZE USER
    ===================================================== */

    useEffect(() => {

        const syncUser = () => {

            const storedUsername =
                localStorage.getItem(
                    "username"
                );

            setUsername(
                storedUsername ||
                "User"
            );
        };


        window.addEventListener(
            "budgetbuddy-settings-updated",
            syncUser
        );

        window.addEventListener(
            "storage",
            syncUser
        );


        return () => {

            window.removeEventListener(
                "budgetbuddy-settings-updated",
                syncUser
            );

            window.removeEventListener(
                "storage",
                syncUser
            );

        };

    }, []);


    /* =====================================================
       USER INITIAL
    ===================================================== */

    const cleanUsername =
        username
            ?.trim() || "User";


    const firstLetter =
        cleanUsername
            .charAt(0)
            .toUpperCase() || "U";


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

        localStorage.removeItem(
            "username"
        );

        window.location.href =
            "/login";
    };


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <aside className="bb-premium-sidebar">

            {/* =================================================
                BRAND
            ================================================= */}

            <div className="bb-sidebar-brand">

                <div className="bb-brand-mark">

                    <span className="bb-brand-letter">
                        B
                    </span>

                    <span className="bb-brand-mark-glow" />

                </div>


                <div className="bb-brand-copy">

                    <div className="bb-brand-name">

                        Budget
                        <span>
                            Buddy
                        </span>

                    </div>

                    <div className="bb-brand-caption">
                        SMART MONEY MANAGEMENT
                    </div>

                </div>

            </div>


            {/* =================================================
                NAVIGATION
            ================================================= */}

            <nav
                className="bb-sidebar-navigation"
                aria-label="Primary navigation"
            >

                <div className="bb-sidebar-section-label">
                    Workspace
                </div>


                <div className="bb-sidebar-menu">

                    {navigation.map(
                        (item) => {

                            const Icon =
                                item.icon;

                            return (

                                <NavLink
                                    key={
                                        item.path
                                    }
                                    to={
                                        item.path
                                    }
                                    className={({
                                        isActive,
                                    }) =>
                                        [
                                            "bb-sidebar-nav-item",

                                            isActive
                                                ? "is-active"
                                                : "",

                                            item.featured
                                                ? "is-featured"
                                                : "",

                                            item.path ===
                                            "/analytics"
                                                ? "is-analytics"
                                                : "",

                                            item.path ===
                                            "/insights"
                                                ? "is-insights"
                                                : "",
                                        ]
                                            .filter(
                                                Boolean
                                            )
                                            .join(" ")
                                    }
                                >

                                    {/* ACTIVE INDICATOR */}

                                    <span className="bb-sidebar-active-line" />


                                    {/* ICON */}

                                    <span className="bb-sidebar-nav-icon">

                                        <Icon
                                            size={18}
                                            strokeWidth={1.9}
                                        />

                                    </span>


                                    {/* LABEL */}

                                    <span className="bb-sidebar-nav-label">
                                        {item.label}
                                    </span>


                                    {/* FEATURE BADGE */}

                                    {item.badge && (

                                        <span className="bb-sidebar-feature-badge">

                                            {item.path ===
                                                "/analytics" && (

                                                <ChartLine
                                                    size={9}
                                                    strokeWidth={2.5}
                                                />

                                            )}

                                            {item.path ===
                                                "/insights" && (

                                                <Sparkles
                                                    size={9}
                                                    strokeWidth={2.5}
                                                />

                                            )}

                                            {item.badge}

                                        </span>

                                    )}


                                    {/* NOTIFICATION COUNT */}

                                    {item.notification &&
                                        unreadCount >
                                            0 && (

                                            <Badge
                                                badgeContent={
                                                    unreadCount >
                                                    99
                                                        ? "99+"
                                                        : unreadCount
                                                }
                                                sx={{
                                                    "& .MuiBadge-badge":
                                                        {
                                                            position:
                                                                "static",

                                                            transform:
                                                                "none",

                                                            background:
                                                                "var(--bb-primary, #08D69B)",

                                                            color:
                                                                "#03120D",

                                                            fontSize:
                                                                "8px",

                                                            lineHeight:
                                                                1,

                                                            fontWeight:
                                                                900,

                                                            minWidth:
                                                                "20px",

                                                            height:
                                                                "20px",

                                                            padding:
                                                                "0 5px",

                                                            borderRadius:
                                                                "999px",

                                                            border:
                                                                "2px solid var(--bb-sidebar-bg, #080D14)",

                                                            boxShadow:
                                                                "0 0 14px rgba(8,214,155,.24)",
                                                        },
                                                }}
                                            />

                                        )}


                                    {/* ARROW */}

                                    <ChevronRight
                                        className="bb-sidebar-nav-arrow"
                                        size={14}
                                        strokeWidth={2}
                                    />

                                </NavLink>

                            );

                        }
                    )}

                </div>

            </nav>


            {/* =================================================
                USER AREA
            ================================================= */}

            <div className="bb-sidebar-bottom">

                <div className="bb-sidebar-profile">

                    {/* PROFILE HEADER */}

                    <div className="bb-sidebar-profile-top">

                        {/* AVATAR */}

                        <div
                            className="bb-sidebar-avatar"
                            aria-label={
                                `Profile for ${cleanUsername}`
                            }
                        >

                            <span>
                                {firstLetter}
                            </span>

                            <i />

                        </div>


                        {/* USER DETAILS */}

                        <div className="bb-sidebar-profile-details">

                            <div className="bb-sidebar-profile-name">
                                {cleanUsername}
                            </div>

                            <div className="bb-sidebar-profile-status">

                                <span className="bb-profile-status-dot" />

                                Personal workspace

                            </div>

                        </div>


                        {/* ONLINE STATUS */}

                        <span className="bb-sidebar-online">
                            <span />
                        </span>

                    </div>


                    {/* PROFILE DIVIDER */}

                    <div className="bb-profile-divider" />


                    {/* LOGOUT */}

                    <button
                        type="button"
                        onClick={
                            handleLogout
                        }
                        className="bb-sidebar-logout"
                    >

                        <span className="bb-logout-icon">

                            <LogOut
                                size={14}
                                strokeWidth={2}
                            />

                        </span>

                        <span className="bb-logout-label">
                            Sign out
                        </span>

                        <ChevronRight
                            className="bb-logout-arrow"
                            size={13}
                            strokeWidth={2}
                        />

                    </button>

                </div>


                {/* SECURITY */}

                <div className="bb-sidebar-security">

                    <span className="bb-sidebar-security-icon">

                        <ShieldCheck
                            size={11}
                            strokeWidth={2.3}
                        />

                    </span>

                    <span>
                        Secure financial workspace
                    </span>

                </div>

            </div>


            {/* =================================================
                PREMIUM STYLES
            ================================================= */}

            <style>
                {`

                /* =====================================================
                   SIDEBAR ROOT
                ===================================================== */

                .bb-premium-sidebar {

                    position: fixed;

                    inset:
                        0 auto 0 0;

                    width: 250px;

                    display: flex;
                    flex-direction: column;

                    box-sizing: border-box;

                    z-index: 1000;

                    overflow: hidden;

                    background:
                        linear-gradient(
                            180deg,
                            #080D14 0%,
                            #070B11 52%,
                            #060A10 100%
                        );

                    color:
                        var(
                            --bb-text,
                            #F4F7FA
                        );

                    border-right:
                        1px solid
                        rgba(
                            148,
                            163,
                            184,
                            .105
                        );

                    box-shadow:
                        16px 0 45px
                        rgba(
                            0,
                            0,
                            0,
                            .16
                        );

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

                    text-rendering:
                        optimizeLegibility;

                }


                /* =====================================================
                   AMBIENT LIGHT
                ===================================================== */

                .bb-premium-sidebar::before {

                    content: "";

                    position: absolute;

                    width: 310px;
                    height: 310px;

                    top: -190px;
                    left: -155px;

                    border-radius: 50%;

                    background:
                        radial-gradient(
                            circle,
                            rgba(
                                8,
                                214,
                                155,
                                .105
                            ) 0%,
                            rgba(
                                8,
                                214,
                                155,
                                .035
                            ) 38%,
                            transparent 72%
                        );

                    pointer-events:
                        none;

                }


                .bb-premium-sidebar::after {

                    content: "";

                    position: absolute;

                    width: 240px;
                    height: 240px;

                    right: -210px;
                    bottom: -150px;

                    border-radius: 50%;

                    background:
                        radial-gradient(
                            circle,
                            rgba(
                                66,
                                185,
                                255,
                                .035
                            ),
                            transparent 70%
                        );

                    pointer-events:
                        none;

                }


                /* =====================================================
                   BRAND AREA
                ===================================================== */

                .bb-sidebar-brand {

                    position: relative;

                    height: 82px;

                    flex-shrink: 0;

                    display: flex;

                    align-items: center;

                    gap: 12px;

                    padding:
                        0 18px;

                    border-bottom:
                        1px solid
                        rgba(
                            148,
                            163,
                            184,
                            .09
                        );

                    background:
                        linear-gradient(
                            180deg,
                            rgba(
                                255,
                                255,
                                255,
                                .018
                            ),
                            transparent
                        );

                }


                /* =====================================================
                   BRAND ICON
                ===================================================== */

                .bb-brand-mark {

                    position: relative;

                    width: 40px;
                    height: 40px;

                    min-width: 40px;

                    display: grid;

                    place-items: center;

                    overflow: hidden;

                    border-radius: 12px;

                    background:
                        linear-gradient(
                            145deg,
                            #11E0A1 0%,
                            #08D69B 48%,
                            #D5B56E 145%
                        );

                    box-shadow:
                        0 9px 26px
                        rgba(
                            8,
                            214,
                            155,
                            .20
                        );

                }


                .bb-brand-mark::before {

                    content: "";

                    position: absolute;

                    inset: 1px;

                    border-radius: 11px;

                    border:
                        1px solid
                        rgba(
                            255,
                            255,
                            255,
                            .26
                        );

                    background:
                        linear-gradient(
                            135deg,
                            rgba(
                                255,
                                255,
                                255,
                                .10
                            ),
                            transparent 52%
                        );

                }


                .bb-brand-letter {

                    position: relative;

                    z-index: 2;

                    color:
                        #03120D;

                    font-size: 18px;

                    line-height: 1;

                    font-weight: 950;

                    letter-spacing:
                        -.8px;

                }


                .bb-brand-mark-glow {

                    position: absolute;

                    width: 26px;
                    height: 26px;

                    right: -10px;
                    bottom: -11px;

                    border-radius: 50%;

                    background:
                        rgba(
                            255,
                            255,
                            255,
                            .22
                        );

                    filter:
                        blur(5px);

                }


                /* =====================================================
                   BRAND TYPOGRAPHY
                ===================================================== */

                .bb-brand-copy {

                    min-width: 0;

                    display: flex;

                    flex-direction: column;

                    justify-content: center;

                }


                .bb-brand-name {

                    color:
                        #F5F8FA;

                    font-size: 17px;

                    line-height: 1;

                    font-weight: 880;

                    letter-spacing:
                        -.65px;

                    white-space:
                        nowrap;

                }


                .bb-brand-name span {

                    color:
                        #08D69B;

                }


                .bb-brand-caption {

                    margin-top: 6px;

                    color:
                        #68788B;

                    font-size: 7px;

                    line-height: 1;

                    font-weight: 900;

                    letter-spacing:
                        1.22px;

                    white-space:
                        nowrap;

                }


                /* =====================================================
                   NAVIGATION
                ===================================================== */

                .bb-sidebar-navigation {

                    flex: 1;

                    min-height: 0;

                    padding:
                        21px 10px 14px;

                    overflow-y: auto;

                    scrollbar-width:
                        thin;

                    scrollbar-color:
                        rgba(
                            148,
                            163,
                            184,
                            .13
                        )
                        transparent;

                }


                .bb-sidebar-navigation::-webkit-scrollbar {

                    width: 4px;

                }


                .bb-sidebar-navigation::-webkit-scrollbar-track {

                    background:
                        transparent;

                }


                .bb-sidebar-navigation::-webkit-scrollbar-thumb {

                    border-radius: 999px;

                    background:
                        rgba(
                            148,
                            163,
                            184,
                            .13
                        );

                }


                .bb-sidebar-section-label {

                    padding:
                        0 12px 10px;

                    color:
                        #65758A;

                    font-size: 8px;

                    line-height: 1;

                    font-weight: 900;

                    letter-spacing:
                        1.45px;

                    text-transform:
                        uppercase;

                }


                .bb-sidebar-menu {

                    display: flex;

                    flex-direction: column;

                    gap: 3px;

                }


                /* =====================================================
                   NAV ITEM
                ===================================================== */

                .bb-sidebar-nav-item {

                    position: relative;

                    display: flex;

                    align-items: center;

                    width: 100%;
                    height: 45px;

                    box-sizing: border-box;

                    gap: 11px;

                    padding:
                        0 10px;

                    border:
                        1px solid transparent;

                    border-radius: 11px;

                    color:
                        #8996A8;

                    text-decoration: none;

                    transition:
                        background .18s ease,
                        border-color .18s ease,
                        color .18s ease,
                        transform .18s ease;

                }


                .bb-sidebar-nav-item:hover {

                    color:
                        #F3F6F8;

                    background:
                        rgba(
                            255,
                            255,
                            255,
                            .034
                        );

                    border-color:
                        rgba(
                            148,
                            163,
                            184,
                            .075
                        );

                    transform:
                        translateX(1px);

                }


                .bb-sidebar-nav-item.is-active {

                    color:
                        #08D69B;

                    background:
                        linear-gradient(
                            90deg,
                            rgba(
                                8,
                                214,
                                155,
                                .115
                            ),
                            rgba(
                                8,
                                214,
                                155,
                                .028
                            )
                        );

                    border-color:
                        rgba(
                            8,
                            214,
                            155,
                            .155
                        );

                    box-shadow:
                        inset 0 0 24px
                        rgba(
                            8,
                            214,
                            155,
                            .025
                        );

                }


                .bb-sidebar-nav-item:focus-visible {

                    outline:
                        2px solid
                        #08D69B;

                    outline-offset:
                        2px;

                }


                /* =====================================================
                   ACTIVE LINE
                ===================================================== */

                .bb-sidebar-active-line {

                    position: absolute;

                    top: 9px;
                    bottom: 9px;
                    left: -1px;

                    width: 3px;

                    border-radius:
                        0 5px 5px 0;

                    background:
                        transparent;

                }


                .bb-sidebar-nav-item.is-active
                .bb-sidebar-active-line {

                    background:
                        #08D69B;

                    box-shadow:
                        0 0 13px
                        rgba(
                            8,
                            214,
                            155,
                            .60
                        );

                }


                /* =====================================================
                   ICON
                ===================================================== */

                .bb-sidebar-nav-icon {

                    width: 21px;
                    height: 21px;

                    min-width: 21px;

                    display: grid;

                    place-items: center;

                    opacity:
                        .82;

                    transition:
                        transform .18s ease,
                        opacity .18s ease;

                }


                .bb-sidebar-nav-item:hover
                .bb-sidebar-nav-icon {

                    opacity:
                        1;

                    transform:
                        scale(1.045);

                }


                .bb-sidebar-nav-item.is-active
                .bb-sidebar-nav-icon {

                    opacity:
                        1;

                }


                /* =====================================================
                   LABEL
                ===================================================== */

                .bb-sidebar-nav-label {

                    flex: 1;

                    min-width: 0;

                    overflow: hidden;

                    color:
                        currentColor;

                    font-size: 12px;

                    line-height:
                        1.2;

                    font-weight:
                        650;

                    letter-spacing:
                        -.05px;

                    white-space:
                        nowrap;

                    text-overflow:
                        ellipsis;

                }


                .bb-sidebar-nav-item.is-active
                .bb-sidebar-nav-label {

                    font-weight:
                        760;

                }


                /* =====================================================
                   ANALYTICS
                ===================================================== */

                .bb-sidebar-nav-item.is-analytics
                .bb-sidebar-nav-icon {

                    color:
                        #42B9FF;

                }


                .bb-sidebar-nav-item.is-analytics.is-active
                .bb-sidebar-nav-icon {

                    color:
                        #08D69B;

                }


                /* =====================================================
                   INSIGHTS
                ===================================================== */

                .bb-sidebar-nav-item.is-insights
                .bb-sidebar-nav-icon {

                    color:
                        #9B7AFF;

                }


                .bb-sidebar-nav-item.is-insights.is-active
                .bb-sidebar-nav-icon {

                    color:
                        #08D69B;

                }


                /* =====================================================
                   BADGES
                ===================================================== */

                .bb-sidebar-feature-badge {

                    display:
                        inline-flex;

                    align-items:
                        center;

                    justify-content:
                        center;

                    gap: 3px;

                    height:
                        17px;

                    padding:
                        0 6px;

                    border-radius:
                        5px;

                    font-size:
                        6px;

                    line-height:
                        1;

                    font-weight:
                        900;

                    letter-spacing:
                        .45px;

                    white-space:
                        nowrap;

                }


                .bb-sidebar-nav-item.is-analytics
                .bb-sidebar-feature-badge {

                    color:
                        #42B9FF;

                    background:
                        rgba(
                            66,
                            185,
                            255,
                            .07
                        );

                    border:
                        1px solid
                        rgba(
                            66,
                            185,
                            255,
                            .18
                        );

                }


                .bb-sidebar-nav-item.is-insights
                .bb-sidebar-feature-badge {

                    color:
                        #9B7AFF;

                    background:
                        rgba(
                            155,
                            122,
                            255,
                            .07
                        );

                    border:
                        1px solid
                        rgba(
                            155,
                            122,
                            255,
                            .18
                        );

                }


                .bb-sidebar-nav-item.is-active
                .bb-sidebar-feature-badge {

                    color:
                        #08D69B;

                    background:
                        rgba(
                            8,
                            214,
                            155,
                            .07
                        );

                    border-color:
                        rgba(
                            8,
                            214,
                            155,
                            .18
                        );

                }


                /* =====================================================
                   ARROW
                ===================================================== */

                .bb-sidebar-nav-arrow {

                    flex-shrink: 0;

                    color:
                        #64748B;

                    opacity:
                        0;

                    transform:
                        translateX(-4px);

                    transition:
                        opacity .18s ease,
                        transform .18s ease;

                }


                .bb-sidebar-nav-item:hover
                .bb-sidebar-nav-arrow {

                    opacity:
                        .75;

                    transform:
                        translateX(0);

                }


                .bb-sidebar-nav-item.is-active
                .bb-sidebar-nav-arrow {

                    opacity:
                        .95;

                    color:
                        #08D69B;

                    transform:
                        translateX(0);

                }


                /* =====================================================
                   BOTTOM AREA
                ===================================================== */

                .bb-sidebar-bottom {

                    position: relative;

                    flex-shrink: 0;

                    padding:
                        0 10px 13px;

                }


                /* =====================================================
                   PROFILE CARD
                ===================================================== */

                .bb-sidebar-profile {

                    position: relative;

                    padding:
                        12px;

                    border:
                        1px solid
                        rgba(
                            148,
                            163,
                            184,
                            .13
                        );

                    border-radius:
                        14px;

                    background:
                        linear-gradient(
                            145deg,
                            rgba(
                                255,
                                255,
                                255,
                                .042
                            ),
                            rgba(
                                255,
                                255,
                                255,
                                .014
                            )
                        );

                    box-shadow:
                        0 14px 34px
                        rgba(
                            0,
                            0,
                            0,
                            .18
                        );

                    backdrop-filter:
                        blur(12px);

                }


                .bb-sidebar-profile::before {

                    content: "";

                    position: absolute;

                    top: 0;
                    left: 14px;
                    right: 14px;

                    height: 1px;

                    background:
                        linear-gradient(
                            90deg,
                            transparent,
                            rgba(
                                8,
                                214,
                                155,
                                .35
                            ),
                            transparent
                        );

                    opacity:
                        .75;

                }


                /* =====================================================
                   PROFILE TOP
                ===================================================== */

                .bb-sidebar-profile-top {

                    display: flex;

                    align-items: center;

                    gap: 10px;

                }


                /* =====================================================
                   AVATAR
                ===================================================== */

                .bb-sidebar-avatar {

                    position: relative;

                    width: 37px;
                    height: 37px;

                    min-width: 37px;

                    display: grid;

                    place-items: center;

                    border-radius: 50%;

                    background:
                        linear-gradient(
                            145deg,
                            #12DEA0 0%,
                            #08D69B 52%,
                            #CDAE68 145%
                        );

                    color:
                        #03130D;

                    font-size:
                        13px;

                    line-height:
                        1;

                    font-weight:
                        950;

                    box-shadow:
                        0 7px 20px
                        rgba(
                            8,
                            214,
                            155,
                            .18
                        );

                }


                .bb-sidebar-avatar::before {

                    content: "";

                    position: absolute;

                    inset: 1px;

                    border-radius: 50%;

                    border:
                        1px solid
                        rgba(
                            255,
                            255,
                            255,
                            .28
                        );

                }


                .bb-sidebar-avatar i {

                    position: absolute;

                    right: -1px;
                    bottom: -1px;

                    width: 9px;
                    height: 9px;

                    border-radius: 50%;

                    background:
                        #08D69B;

                    border:
                        2px solid
                        #0B1118;

                    box-shadow:
                        0 0 9px
                        rgba(
                            8,
                            214,
                            155,
                            .55
                        );

                }


                /* =====================================================
                   PROFILE DETAILS
                ===================================================== */

                .bb-sidebar-profile-details {

                    flex: 1;

                    min-width: 0;

                }


                .bb-sidebar-profile-name {

                    overflow: hidden;

                    color:
                        #F4F7FA;

                    font-size:
                        12px;

                    line-height:
                        1.25;

                    font-weight:
                        780;

                    letter-spacing:
                        -.1px;

                    white-space:
                        nowrap;

                    text-overflow:
                        ellipsis;

                }


                .bb-sidebar-profile-status {

                    display: flex;

                    align-items: center;

                    gap: 5px;

                    margin-top: 4px;

                    color:
                        #738298;

                    font-size:
                        8px;

                    line-height:
                        1.2;

                    font-weight:
                        600;

                    white-space:
                        nowrap;

                }


                .bb-profile-status-dot {

                    width: 5px;
                    height: 5px;

                    min-width: 5px;

                    border-radius: 50%;

                    background:
                        #08D69B;

                    box-shadow:
                        0 0 7px
                        rgba(
                            8,
                            214,
                            155,
                            .48
                        );

                }


                /* =====================================================
                   ONLINE INDICATOR
                ===================================================== */

                .bb-sidebar-online {

                    width: 16px;
                    height: 16px;

                    display: grid;

                    place-items: center;

                    border-radius: 50%;

                    background:
                        rgba(
                            8,
                            214,
                            155,
                            .055
                        );

                }


                .bb-sidebar-online span {

                    width: 4px;
                    height: 4px;

                    border-radius: 50%;

                    background:
                        #08D69B;

                    box-shadow:
                        0 0 8px
                        rgba(
                            8,
                            214,
                            155,
                            .7
                        );

                }


                /* =====================================================
                   PROFILE DIVIDER
                ===================================================== */

                .bb-profile-divider {

                    height: 1px;

                    margin:
                        11px 0 9px;

                    background:
                        rgba(
                            148,
                            163,
                            184,
                            .075
                        );

                }


                /* =====================================================
                   SIGN OUT
                ===================================================== */

                .bb-sidebar-logout {

                    width: 100%;
                    height: 34px;

                    display: flex;

                    align-items: center;

                    gap: 8px;

                    box-sizing: border-box;

                    padding:
                        0 8px;

                    border:
                        1px solid
                        rgba(
                            148,
                            163,
                            184,
                            .09
                        );

                    border-radius:
                        8px;

                    background:
                        rgba(
                            255,
                            255,
                            255,
                            .018
                        );

                    color:
                        #8B98AA;

                    font-family:
                        inherit;

                    font-size:
                        9px;

                    line-height:
                        1;

                    font-weight:
                        720;

                    cursor:
                        pointer;

                    transition:
                        background .18s ease,
                        border-color .18s ease,
                        color .18s ease;

                }


                .bb-sidebar-logout:hover {

                    color:
                        #FF747E;

                    background:
                        rgba(
                            255,
                            102,
                            114,
                            .055
                        );

                    border-color:
                        rgba(
                            255,
                            102,
                            114,
                            .17
                        );

                }


                .bb-sidebar-logout:focus-visible {

                    outline:
                        2px solid
                        #08D69B;

                    outline-offset:
                        2px;

                }


                .bb-logout-icon {

                    width: 23px;
                    height: 23px;

                    display: grid;

                    place-items: center;

                    border-radius: 6px;

                    color:
                        currentColor;

                    background:
                        rgba(
                            255,
                            255,
                            255,
                            .025
                        );

                }


                .bb-logout-label {

                    flex: 1;

                    text-align:
                        left;

                }


                .bb-logout-arrow {

                    opacity:
                        .45;

                }


                /* =====================================================
                   SECURITY
                ===================================================== */

                .bb-sidebar-security {

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    gap: 5px;

                    margin-top:
                        8px;

                    color:
                        #5E6D80;

                    font-size:
                        7px;

                    line-height:
                        1.3;

                    font-weight:
                        600;

                    letter-spacing:
                        .05px;

                    text-align:
                        center;

                }


                .bb-sidebar-security-icon {

                    width: 15px;
                    height: 15px;

                    display: grid;

                    place-items: center;

                    border-radius: 5px;

                    color:
                        #08D69B;

                    background:
                        rgba(
                            8,
                            214,
                            155,
                            .065
                        );

                    border:
                        1px solid
                        rgba(
                            8,
                            214,
                            155,
                            .12
                        );

                }


                /* =====================================================
                   TABLET
                ===================================================== */

                @media (max-width: 900px) {

                    .bb-premium-sidebar {

                        width:
                            232px;

                    }

                }


                /* =====================================================
                   COLLAPSED MOBILE/TABLET SIDEBAR
                ===================================================== */

                @media (max-width: 720px) {

                    .bb-premium-sidebar {

                        width:
                            72px;

                    }


                    .bb-sidebar-brand {

                        justify-content:
                            center;

                        padding:
                            0 9px;

                    }


                    .bb-brand-copy,
                    .bb-sidebar-section-label,
                    .bb-sidebar-nav-label,
                    .bb-sidebar-feature-badge,
                    .bb-sidebar-nav-arrow,
                    .bb-sidebar-profile-details,
                    .bb-sidebar-logout,
                    .bb-sidebar-security,
                    .bb-sidebar-online {

                        display:
                            none;

                    }


                    .bb-sidebar-navigation {

                        padding:
                            18px 8px;

                    }


                    .bb-sidebar-nav-item {

                        justify-content:
                            center;

                        padding:
                            0;

                    }


                    .bb-sidebar-nav-icon {

                        width:
                            22px;

                        height:
                            22px;

                    }


                    .bb-sidebar-active-line {

                        left:
                            -1px;

                    }


                    .bb-sidebar-bottom {

                        padding:
                            0 8px 10px;

                    }


                    .bb-sidebar-profile {

                        padding:
                            8px;

                    }


                    .bb-sidebar-profile-top {

                        justify-content:
                            center;

                    }

                }


                /* =====================================================
                   REDUCED MOTION
                ===================================================== */

                @media (
                    prefers-reduced-motion:
                    reduce
                ) {

                    .bb-premium-sidebar *,
                    .bb-premium-sidebar *::before,
                    .bb-premium-sidebar *::after {

                        transition:
                            none !important;

                    }

                }

                `}
            </style>

        </aside>
    );
}