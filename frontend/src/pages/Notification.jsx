import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    Divider,
    Button,
    IconButton,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    CircularProgress,
    Tooltip,
    Badge,
    Slide,
} from "@mui/material";

import {
    Bell,
    BellRing,
    Check,
    CheckCheck,
    Trash2,
    ShieldAlert,
    Wallet,
    PiggyBank,
    X,
    Sparkles,
    RefreshCw,
    Inbox,
} from "lucide-react";

import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
} from "../services/notificationService";

import EmailPreferences from "../components/common/EmailPreferences";



/* =========================================================
   CONFIGURATION
========================================================= */

const POLLING_INTERVAL = 15000;

const NOTIFICATION_COUNT_KEY =
    "budgetbuddy_unread_notification_count";

const NOTIFICATION_SNAPSHOT_KEY =
    "budgetbuddy_notification_snapshot";


/* =========================================================
   PREMIUM PALETTE
========================================================= */

const COLORS = {
    background: "#080D13",
    surface: "#0D131B",
    surfaceElevated: "#111923",
    surfaceSoft: "#151D27",

    text: "#F4F0E7",
    textSecondary: "#A5ADBA",
    textMuted: "#687386",
    textFaint: "#596477",

    gold: "#D8B46A",
    goldSoft: "rgba(216,180,106,.08)",
    goldBorder: "rgba(216,180,106,.14)",

    emerald: "#42D3A5",
    emeraldSoft: "rgba(66,211,165,.07)",
    emeraldBorder: "rgba(66,211,165,.14)",

    cyan: "#5DD6E8",
    cyanSoft: "rgba(93,214,232,.07)",

    red: "#E56B6F",
    redSoft: "rgba(229,107,111,.07)",
    redBorder: "rgba(229,107,111,.14)",

    purple: "#B99BEF",
    divider: "rgba(255,255,255,.055)",
};


/* =========================================================
   NOTIFICATION ICON
========================================================= */

const getNotificationIcon = (notification) => {

    const text = (
        `${notification.title || ""} ${
            notification.message || ""
        }`
    ).toLowerCase();

    if (
        text.includes("budget") ||
        text.includes("expense")
    ) {
        return {
            icon: <Wallet size={17} />,
            color: COLORS.gold,
            background: COLORS.goldSoft,
        };
    }

    if (
        text.includes("saving") ||
        text.includes("savings")
    ) {
        return {
            icon: <PiggyBank size={17} />,
            color: COLORS.emerald,
            background: COLORS.emeraldSoft,
        };
    }

    if (
        text.includes("alert") ||
        text.includes("warning")
    ) {
        return {
            icon: <ShieldAlert size={17} />,
            color: COLORS.red,
            background: COLORS.redSoft,
        };
    }

    return {
        icon: <BellRing size={17} />,
        color: COLORS.cyan,
        background: COLORS.cyanSoft,
    };
};


/* =========================================================
   DATE FORMAT
========================================================= */

const formatDate = (date) => {

    if (!date) {
        return "Recently";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Recently";
    }

    return parsedDate.toLocaleString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};


/* =========================================================
   POPUP TRANSITION
========================================================= */

function NotificationTransition(props) {
    return (
        <Slide
            {...props}
            direction="left"
        />
    );
}


/* =========================================================
   COMPONENT
========================================================= */

export default function Notification() {

    const [notifications, setNotifications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [actionLoading, setActionLoading] =
        useState(null);

    const [dialog, setDialog] = useState({
        open: false,
        type: null,
        notificationId: null,
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const [popup, setPopup] =
        useState(null);

    const previousIdsRef = useRef(
        new Set()
    );

    const initialLoadRef =
        useRef(true);

    const pollingRef =
        useRef(null);


    /* =====================================================
       COUNTS
    ===================================================== */

    const unreadCount = useMemo(
        () =>
            notifications.filter(
                (notification) =>
                    !notification.is_read
            ).length,
        [notifications]
    );

    const readCount =
        notifications.length -
        unreadCount;


    /* =====================================================
       BROADCAST STATE
    ===================================================== */

    const broadcastNotificationState =
        useCallback((items) => {

            const unread =
                items.filter(
                    (notification) =>
                        !notification.is_read
                ).length;

            localStorage.setItem(
                NOTIFICATION_COUNT_KEY,
                String(unread)
            );

            window.dispatchEvent(
                new CustomEvent(
                    "budgetbuddy:notifications-updated",
                    {
                        detail: {
                            notifications:
                                items,
                            unreadCount:
                                unread,
                        },
                    }
                )
            );

        }, []);


    /* =====================================================
       SHOW NEW NOTIFICATION
    ===================================================== */

    const showNewNotification =
        useCallback(
            (notification) => {

                setPopup(notification);

                window.dispatchEvent(
                    new CustomEvent(
                        "budgetbuddy:new-notification",
                        {
                            detail:
                                notification,
                        }
                    )
                );

            },
            []
        );


    /* =====================================================
       SNACKBAR
    ===================================================== */

    const showSnackbar = (
        message,
        severity = "success"
    ) => {

        setSnackbar({
            open: true,
            message,
            severity,
        });

    };


    const closeSnackbar = () => {

        setSnackbar(
            (previous) => ({
                ...previous,
                open: false,
            })
        );

    };


    /* =====================================================
       FETCH NOTIFICATIONS
    ===================================================== */

    const fetchNotifications =
        useCallback(
            async (
                isBackgroundRefresh = false
            ) => {

                try {

                    if (
                        isBackgroundRefresh
                    ) {
                        setRefreshing(true);
                    } else {
                        setLoading(true);
                    }

                    const response =
                        await getNotifications();

                    const incoming =
                        Array.isArray(
                            response.data
                        )
                            ? response.data
                            : [];

                    const incomingIds =
                        new Set(
                            incoming.map(
                                (
                                    notification
                                ) =>
                                    notification.id
                            )
                        );


                    /*
                     * Existing notifications on first
                     * page load do not trigger a popup.
                     */

                    if (
                        !initialLoadRef.current
                    ) {

                        const newNotifications =
                            incoming.filter(
                                (
                                    notification
                                ) =>
                                    !previousIdsRef.current.has(
                                        notification.id
                                    )
                            );


                        if (
                            newNotifications.length >
                            0
                        ) {

                            const newest =
                                [
                                    ...newNotifications,
                                ].sort(
                                    (
                                        a,
                                        b
                                    ) =>
                                        new Date(
                                            b.created_at
                                        ) -
                                        new Date(
                                            a.created_at
                                        )
                                )[0];

                            showNewNotification(
                                newest
                            );
                        }
                    }


                    previousIdsRef.current =
                        incomingIds;

                    setNotifications(
                        incoming
                    );

                    broadcastNotificationState(
                        incoming
                    );

                    localStorage.setItem(
                        NOTIFICATION_SNAPSHOT_KEY,
                        JSON.stringify(
                            incoming
                        )
                    );

                    initialLoadRef.current =
                        false;

                } catch (error) {

                    console.error(
                        "Notification fetch error:",
                        error.response
                            ?.data ||
                            error.message
                    );

                    if (
                        !isBackgroundRefresh
                    ) {
                        showSnackbar(
                            "Unable to load notifications.",
                            "error"
                        );
                    }

                } finally {

                    setLoading(false);
                    setRefreshing(false);

                }

            },
            [
                broadcastNotificationState,
                showNewNotification,
            ]
        );


    /* =====================================================
       INITIAL LOAD + LIVE POLLING
    ===================================================== */

    useEffect(() => {

        fetchNotifications(false);

        pollingRef.current =
            window.setInterval(
                () => {
                    fetchNotifications(
                        true
                    );
                },
                POLLING_INTERVAL
            );


        const handleVisibility =
            () => {

                if (
                    document.visibilityState ===
                    "visible"
                ) {
                    fetchNotifications(
                        true
                    );
                }

            };


        document.addEventListener(
            "visibilitychange",
            handleVisibility
        );


        return () => {

            if (
                pollingRef.current
            ) {
                window.clearInterval(
                    pollingRef.current
                );
            }

            document.removeEventListener(
                "visibilitychange",
                handleVisibility
            );

        };

    }, [fetchNotifications]);


    /* =====================================================
       POPUP
    ===================================================== */

    const closePopup = () => {
        setPopup(null);
    };


    /* =====================================================
       MARK AS READ
    ===================================================== */

    const handleMarkAsRead =
        async (id) => {

            try {

                setActionLoading(
                    `read-${id}`
                );

                await markAsRead(id);

                const updated =
                    notifications.map(
                        (notification) =>
                            notification.id ===
                            id
                                ? {
                                      ...notification,
                                      is_read:
                                          true,
                                  }
                                : notification
                    );

                setNotifications(
                    updated
                );

                broadcastNotificationState(
                    updated
                );

                showSnackbar(
                    "Notification marked as read."
                );

            } catch (error) {

                console.error(
                    error.response
                        ?.data ||
                        error.message
                );

                showSnackbar(
                    "Unable to mark notification as read.",
                    "error"
                );

            } finally {

                setActionLoading(null);

            }

        };


    /* =====================================================
       MARK ALL AS READ
    ===================================================== */

    const handleMarkAllAsRead =
        async () => {

            try {

                setActionLoading(
                    "mark-all"
                );

                await markAllAsRead();

                const updated =
                    notifications.map(
                        (notification) => ({
                            ...notification,
                            is_read: true,
                        })
                    );

                setNotifications(
                    updated
                );

                broadcastNotificationState(
                    updated
                );

                showSnackbar(
                    "All notifications marked as read."
                );

            } catch (error) {

                console.error(
                    error.response
                        ?.data ||
                        error.message
                );

                showSnackbar(
                    "Unable to mark all notifications as read.",
                    "error"
                );

            } finally {

                setActionLoading(null);

            }

        };


    /* =====================================================
       DELETE SINGLE
    ===================================================== */

    const handleDeleteNotification =
        async (id) => {

            try {

                setActionLoading(
                    `delete-${id}`
                );

                await deleteNotification(
                    id
                );

                const updated =
                    notifications.filter(
                        (notification) =>
                            notification.id !==
                            id
                    );

                setNotifications(
                    updated
                );

                broadcastNotificationState(
                    updated
                );

                showSnackbar(
                    "Notification deleted."
                );

                closeDialog();

            } catch (error) {

                console.error(
                    error.response
                        ?.data ||
                        error.message
                );

                showSnackbar(
                    "Unable to delete notification.",
                    "error"
                );

            } finally {

                setActionLoading(null);

            }

        };


    /* =====================================================
       DELETE ALL
    ===================================================== */

    const handleDeleteAll =
        async () => {

            try {

                setActionLoading(
                    "delete-all"
                );

                await clearNotifications();

                setNotifications([]);

                broadcastNotificationState(
                    []
                );

                showSnackbar(
                    "All notifications deleted."
                );

                closeDialog();

            } catch (error) {

                console.error(
                    error.response
                        ?.data ||
                        error.message
                );

                showSnackbar(
                    "Unable to delete notifications.",
                    "error"
                );

            } finally {

                setActionLoading(null);

            }

        };


    /* =====================================================
       DIALOG
    ===================================================== */

    const openDeleteDialog = (id) => {

        setDialog({
            open: true,
            type: "single",
            notificationId: id,
        });

    };


    const openDeleteAllDialog =
        () => {

            setDialog({
                open: true,
                type: "all",
                notificationId: null,
            });

        };


    const closeDialog = () => {

        if (
            actionLoading !== null
        ) {
            return;
        }

        setDialog({
            open: false,
            type: null,
            notificationId: null,
        });

    };


    const confirmDelete = () => {

        if (
            dialog.type ===
            "single"
        ) {

            handleDeleteNotification(
                dialog.notificationId
            );

            return;
        }

        if (
            dialog.type ===
            "all"
        ) {
            handleDeleteAll();
        }

    };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (
            <Box
                sx={{
                    minHeight: "70vh",
                    display: "grid",
                    placeItems:
                        "center",
                    background:
                        COLORS.background,
                }}
            >

                <Stack
                    spacing={1.5}
                    alignItems="center"
                >

                    <CircularProgress
                        size={30}
                        thickness={3}
                        sx={{
                            color:
                                COLORS.gold,
                        }}
                    />

                    <Typography
                        sx={{
                            color:
                                COLORS.textMuted,
                            fontSize:
                                "10px",
                        }}
                    >
                        Loading your notifications...
                    </Typography>

                </Stack>

            </Box>
        );
    }


    /* =====================================================
       MAIN UI
    ===================================================== */

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: "1280px",
                mx: "auto",
                minHeight: "100vh",
                pb: 5,
            }}
        >

            {/* =================================================
                LIVE NOTIFICATION POPUP
            ================================================= */}

            <Snackbar
                open={Boolean(popup)}
                autoHideDuration={6000}
                onClose={
                    closePopup
                }
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                TransitionComponent={
                    NotificationTransition
                }
                sx={{
                    top: {
                        xs: 16,
                        md: 86,
                    },
                    right: {
                        xs: 16,
                        md: 24,
                    },
                }}
            >

                {popup && (
                    <Paper
                        elevation={0}
                        sx={{
                            width: {
                                xs:
                                    "calc(100vw - 32px)",
                                sm: 390,
                            },
                            overflow:
                                "hidden",
                            borderRadius:
                                "15px",
                            background:
                                "linear-gradient(145deg,#111923,#0D131B)",
                            border:
                                `1px solid ${COLORS.goldBorder}`,
                            boxShadow:
                                "0 25px 70px rgba(0,0,0,.45)",
                        }}
                    >

                        <Box
                            sx={{
                                height: 2,
                                background:
                                    "linear-gradient(90deg,#D8B46A,#42D3A5)",
                            }}
                        />

                        <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{
                                p: 2,
                            }}
                        >

                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    minWidth: 40,
                                    borderRadius:
                                        "11px",
                                    display:
                                        "grid",
                                    placeItems:
                                        "center",
                                    color:
                                        COLORS.gold,
                                    background:
                                        COLORS.goldSoft,
                                    border:
                                        `1px solid ${COLORS.goldBorder}`,
                                }}
                            >
                                <BellRing
                                    size={18}
                                />
                            </Box>


                            <Box
                                sx={{
                                    flex: 1,
                                    minWidth: 0,
                                }}
                            >

                                <Typography
                                    sx={{
                                        color:
                                            COLORS.gold,
                                        fontSize:
                                            "8px",
                                        fontWeight:
                                            800,
                                        letterSpacing:
                                            "1.5px",
                                        textTransform:
                                            "uppercase",
                                    }}
                                >
                                    New activity
                                </Typography>

                                <Typography
                                    sx={{
                                        color:
                                            COLORS.text,
                                        fontSize:
                                            "13px",
                                        fontWeight:
                                            700,
                                        mt: .5,
                                    }}
                                >
                                    {
                                        popup.title
                                    }
                                </Typography>

                                <Typography
                                    sx={{
                                        color:
                                            COLORS.textMuted,
                                        fontSize:
                                            "10px",
                                        lineHeight:
                                            1.55,
                                        mt: .4,
                                    }}
                                >
                                    {
                                        popup.message
                                    }
                                </Typography>

                            </Box>


                            <IconButton
                                size="small"
                                onClick={
                                    closePopup
                                }
                                sx={{
                                    alignSelf:
                                        "flex-start",
                                    color:
                                        COLORS.textMuted,
                                }}
                            >
                                <X size={14} />
                            </IconButton>

                        </Stack>

                    </Paper>
                )}

            </Snackbar>


            {/* =================================================
                HERO
            ================================================= */}

            <section
                style={{
                    position:
                        "relative",
                    overflow:
                        "hidden",
                    padding:
                        "30px",
                    marginBottom:
                        "20px",
                    borderRadius:
                        "19px",
                    background:
                        "linear-gradient(135deg,#111923 0%,#0D131B 58%,#121817 100%)",
                    border:
                        "1px solid rgba(216,180,106,.10)",
                    boxShadow:
                        "0 18px 45px rgba(0,0,0,.15)",
                }}
            >

                <div
                    style={{
                        position:
                            "absolute",
                        width:
                            "260px",
                        height:
                            "260px",
                        right:
                            "-100px",
                        top:
                            "-150px",
                        borderRadius:
                            "50%",
                        background:
                            "rgba(216,180,106,.055)",
                        filter:
                            "blur(55px)",
                        pointerEvents:
                            "none",
                    }}
                />

                <div
                    style={{
                        position:
                            "absolute",
                        width:
                            "180px",
                        height:
                            "180px",
                        left:
                            "48%",
                        bottom:
                            "-150px",
                        borderRadius:
                            "50%",
                        background:
                            "rgba(66,211,165,.035)",
                        filter:
                            "blur(45px)",
                        pointerEvents:
                            "none",
                    }}
                />


                <div
                    style={{
                        position:
                            "relative",
                        zIndex: 1,
                        display:
                            "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "space-between",
                        gap:
                            "20px",
                        flexWrap:
                            "wrap",
                    }}
                >

                    <div
                        style={{
                            maxWidth:
                                "680px",
                        }}
                    >

                        <div
                            style={{
                                display:
                                    "inline-flex",
                                alignItems:
                                    "center",
                                gap:
                                    "6px",
                                color:
                                    COLORS.gold,
                                fontSize:
                                    "8px",
                                fontWeight:
                                    800,
                                letterSpacing:
                                    "1.8px",
                                marginBottom:
                                    "10px",
                            }}
                        >
                            <Sparkles
                                size={10}
                            />

                            FINANCIAL SIGNALS
                        </div>


                        <h1
                            style={{
                                margin: 0,
                                color:
                                    COLORS.text,
                                fontSize:
                                    "30px",
                                lineHeight:
                                    1.1,
                                fontWeight:
                                    800,
                                letterSpacing:
                                    "-1px",
                            }}
                        >
                            Stay ahead of
                            <br />

                            <span
                                style={{
                                    color:
                                        COLORS.gold,
                                }}
                            >
                                what matters.
                            </span>
                        </h1>


                        <p
                            style={{
                                maxWidth:
                                    "570px",
                                margin:
                                    "11px 0 0",
                                color:
                                    "#7D8797",
                                fontSize:
                                    "10px",
                                lineHeight:
                                    1.65,
                            }}
                        >
                            BudgetBuddy keeps
                            important financial
                            activity visible so
                            nothing important gets
                            buried.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            fetchNotifications(
                                true
                            )
                        }
                        disabled={
                            refreshing
                        }
                        style={{
                            display:
                                "flex",
                            alignItems:
                                "center",
                            gap:
                                "8px",
                            height:
                                "42px",
                            padding:
                                "0 16px",
                            border:
                                "1px solid rgba(216,180,106,.15)",
                            borderRadius:
                                "10px",
                            background:
                                "#0D131B",
                            color:
                                "#A9B2C0",
                            cursor:
                                refreshing
                                    ? "not-allowed"
                                    : "pointer",
                            fontSize:
                                "9px",
                            fontWeight:
                                750,
                        }}
                    >
                        <RefreshCw
                            size={13}
                            style={{
                                animation:
                                    refreshing
                                        ? "bbNotificationSpin 1s linear infinite"
                                        : "none",
                            }}
                        />

                        Refresh
                    </button>

                </div>

            </section>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div
                className="notification-summary-grid"
                style={{
                    display:
                        "grid",
                    gridTemplateColumns:
                        "repeat(3,minmax(0,1fr))",
                    gap:
                        "12px",
                    marginBottom:
                        "24px",
                }}
            >

                {[
                    {
                        label:
                            "TOTAL ACTIVITY",
                        value:
                            notifications.length,
                        color:
                            COLORS.text,
                        icon:
                            <Inbox
                                size={16}
                            />,
                    },
                    {
                        label:
                            "UNREAD",
                        value:
                            unreadCount,
                        color:
                            COLORS.gold,
                        icon:
                            <BellRing
                                size={16}
                            />,
                    },
                    {
                        label:
                            "READ",
                        value:
                            readCount,
                        color:
                            COLORS.emerald,
                        icon:
                            <CheckCheck
                                size={16}
                            />,
                    },
                ].map(
                    (item) => (

                        <article
                            key={
                                item.label
                            }
                            style={{
                                padding:
                                    "18px",
                                borderRadius:
                                    "14px",
                                background:
                                    "linear-gradient(145deg,#111923,#0D131B)",
                                border:
                                    "1px solid rgba(216,180,106,.07)",
                            }}
                        >

                            <div
                                style={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "space-between",
                                    marginBottom:
                                        "14px",
                                }}
                            >

                                <div
                                    style={{
                                        width:
                                            "34px",
                                        height:
                                            "34px",
                                        display:
                                            "grid",
                                        placeItems:
                                            "center",
                                        borderRadius:
                                            "9px",
                                        color:
                                            item.color,
                                        background:
                                            item.color ===
                                            COLORS.gold
                                                ? COLORS.goldSoft
                                                : item.color ===
                                                  COLORS.emerald
                                                ? COLORS.emeraldSoft
                                                : "rgba(255,255,255,.045)",
                                    }}
                                >
                                    {
                                        item.icon
                                    }
                                </div>

                                {item.label ===
                                    "UNREAD" &&
                                    unreadCount >
                                        0 && (
                                        <span
                                            style={{
                                                width:
                                                    "6px",
                                                height:
                                                    "6px",
                                                borderRadius:
                                                    "50%",
                                                background:
                                                    COLORS.gold,
                                                boxShadow:
                                                    "0 0 12px rgba(216,180,106,.55)",
                                            }}
                                        />
                                    )}

                            </div>


                            <div
                                style={{
                                    color:
                                        COLORS.textMuted,
                                    fontSize:
                                        "8px",
                                    fontWeight:
                                        800,
                                    letterSpacing:
                                        "1.25px",
                                }}
                            >
                                {
                                    item.label
                                }
                            </div>

                            <div
                                style={{
                                    color:
                                        item.color,
                                    fontSize:
                                        "23px",
                                    lineHeight:
                                        1.15,
                                    fontWeight:
                                        800,
                                    marginTop:
                                        "5px",
                                }}
                            >
                                {
                                    item.value
                                }
                            </div>

                        </article>
                    )
                )}

            </div>


            {/* =================================================
                ACTION BAR
            ================================================= */}

            <section
                style={{
                    display:
                        "flex",
                    alignItems:
                        "center",
                    justifyContent:
                        "space-between",
                    gap:
                        "15px",
                    marginBottom:
                        "12px",
                    flexWrap:
                        "wrap",
                }}
            >

                <div>

                    <div
                        style={{
                            color:
                                COLORS.gold,
                            fontSize:
                                "8px",
                            fontWeight:
                                800,
                            letterSpacing:
                                "1.7px",
                            marginBottom:
                                "5px",
                        }}
                    >
                        NOTIFICATION CENTER
                    </div>

                    <h2
                        style={{
                            margin:
                                0,
                            color:
                                COLORS.text,
                            fontSize:
                                "18px",
                            fontWeight:
                                700,
                        }}
                    >
                        Recent activity
                    </h2>

                </div>


                <Stack
                    direction="row"
                    spacing={1}
                >

                    {unreadCount >
                        0 && (
                        <Button
                            variant="outlined"
                            startIcon={
                                actionLoading ===
                                "mark-all" ? (
                                    <CircularProgress
                                        size={
                                            14
                                        }
                                    />
                                ) : (
                                    <CheckCheck
                                        size={
                                            14
                                        }
                                    />
                                )
                            }
                            onClick={
                                handleMarkAllAsRead
                            }
                            disabled={
                                actionLoading !==
                                null
                            }
                            sx={{
                                height:
                                    36,
                                px:
                                    1.5,
                                borderRadius:
                                    "9px",
                                textTransform:
                                    "none",
                                fontSize:
                                    "9px",
                                fontWeight:
                                    700,
                                color:
                                    COLORS.textSecondary,
                                borderColor:
                                    "rgba(255,255,255,.08)",
                                "&:hover":
                                    {
                                        borderColor:
                                            COLORS.goldBorder,
                                        background:
                                            COLORS.goldSoft,
                                    },
                            }}
                        >
                            Mark all read
                        </Button>
                    )}


                    {notifications.length >
                        0 && (
                        <Button
                            variant="outlined"
                            startIcon={
                                <Trash2
                                    size={
                                        14
                                    }
                                />
                            }
                            onClick={
                                openDeleteAllDialog
                            }
                            disabled={
                                actionLoading !==
                                null
                            }
                            sx={{
                                height:
                                    36,
                                px:
                                    1.5,
                                borderRadius:
                                    "9px",
                                textTransform:
                                    "none",
                                fontSize:
                                    "9px",
                                fontWeight:
                                    700,
                                color:
                                    COLORS.red,
                                borderColor:
                                    COLORS.redBorder,
                                "&:hover":
                                    {
                                        borderColor:
                                            "rgba(229,107,111,.28)",
                                        background:
                                            COLORS.redSoft,
                                    },
                            }}
                        >
                            Clear all
                        </Button>
                    )}

                </Stack>

            </section>


            {/* =================================================
                NOTIFICATION LIST
            ================================================= */}

            <Paper
                elevation={0}
                sx={{
                    overflow:
                        "hidden",
                    borderRadius:
                        "15px",
                    background:
                        COLORS.surface,
                    border:
                        "1px solid rgba(216,180,106,.08)",
                    boxShadow:
                        "0 12px 35px rgba(0,0,0,.10)",
                }}
            >

                {notifications.length ===
                0 ? (

                    <Box
                        sx={{
                            py: 10,
                            px: 3,
                            textAlign:
                                "center",
                        }}
                    >

                        <Box
                            sx={{
                                width: 66,
                                height: 66,
                                mx: "auto",
                                mb: 2,
                                borderRadius:
                                    "18px",
                                display:
                                    "grid",
                                placeItems:
                                    "center",
                                color:
                                    COLORS.gold,
                                background:
                                    COLORS.goldSoft,
                                border:
                                    `1px solid ${COLORS.goldBorder}`,
                            }}
                        >
                            <Bell
                                size={27}
                            />
                        </Box>


                        <Typography
                            sx={{
                                color:
                                    COLORS.text,
                                fontSize:
                                    "15px",
                                fontWeight:
                                    700,
                            }}
                        >
                            You're all caught up
                        </Typography>


                        <Typography
                            sx={{
                                color:
                                    COLORS.textMuted,
                                fontSize:
                                    "10px",
                                mt:
                                    .6,
                            }}
                        >
                            New financial activity
                            will appear here automatically.
                        </Typography>

                    </Box>

                ) : (

                    <List
                        disablePadding
                    >

                        {notifications.map(
                            (
                                notification,
                                index
                            ) => {

                                const isUnread =
                                    !notification.is_read;

                                const reading =
                                    actionLoading ===
                                    `read-${notification.id}`;

                                const deleting =
                                    actionLoading ===
                                    `delete-${notification.id}`;

                                const iconData =
                                    getNotificationIcon(
                                        notification
                                    );

                                return (
                                    <Box
                                        key={
                                            notification.id
                                        }
                                    >

                                        <ListItem
                                            sx={{
                                                px: {
                                                    xs:
                                                        1.5,
                                                    md:
                                                        2.5,
                                                },
                                                py:
                                                    1.8,
                                                alignItems:
                                                    "flex-start",
                                                gap:
                                                    1.5,
                                                position:
                                                    "relative",
                                                background:
                                                    isUnread
                                                        ? "linear-gradient(90deg,rgba(216,180,106,.035),transparent)"
                                                        : "transparent",
                                                transition:
                                                    "background .18s ease",
                                                "&:hover":
                                                    {
                                                        background:
                                                            "rgba(255,255,255,.018)",
                                                    },
                                            }}
                                        >

                                            {/* UNREAD INDICATOR */}

                                            {isUnread && (
                                                <Box
                                                    sx={{
                                                        position:
                                                            "absolute",
                                                        left:
                                                            0,
                                                        top:
                                                            12,
                                                        bottom:
                                                            12,
                                                        width:
                                                            2,
                                                        borderRadius:
                                                            "0 3px 3px 0",
                                                        background:
                                                            COLORS.gold,
                                                        boxShadow:
                                                            "0 0 12px rgba(216,180,106,.25)",
                                                    }}
                                                />
                                            )}


                                            {/* ICON */}

                                            <Box
                                                sx={{
                                                    width:
                                                        38,
                                                    height:
                                                        38,
                                                    minWidth:
                                                        38,
                                                    borderRadius:
                                                        "10px",
                                                    display:
                                                        "grid",
                                                    placeItems:
                                                        "center",
                                                    color:
                                                        iconData.color,
                                                    background:
                                                        iconData.background,
                                                    border:
                                                        `1px solid ${iconData.color}18`,
                                                }}
                                            >
                                                {
                                                    iconData.icon
                                                }
                                            </Box>


                                            {/* CONTENT */}

                                            <Box
                                                sx={{
                                                    flex:
                                                        1,
                                                    minWidth:
                                                        0,
                                                }}
                                            >

                                                <Stack
                                                    direction="row"
                                                    spacing={
                                                        .8
                                                    }
                                                    alignItems="center"
                                                >

                                                    <Typography
                                                        sx={{
                                                            color:
                                                                isUnread
                                                                    ? COLORS.text
                                                                    : "#C0C7D2",
                                                            fontSize:
                                                                "11px",
                                                            fontWeight:
                                                                isUnread
                                                                    ? 750
                                                                    : 600,
                                                            lineHeight:
                                                                1.4,
                                                        }}
                                                    >
                                                        {
                                                            notification.title
                                                        }
                                                    </Typography>


                                                    {isUnread && (
                                                        <Box
                                                            sx={{
                                                                width:
                                                                    5,
                                                                height:
                                                                    5,
                                                                minWidth:
                                                                    5,
                                                                borderRadius:
                                                                    "50%",
                                                                background:
                                                                    COLORS.gold,
                                                                boxShadow:
                                                                    "0 0 9px rgba(216,180,106,.65)",
                                                            }}
                                                        />
                                                    )}

                                                </Stack>


                                                <Typography
                                                    sx={{
                                                        color:
                                                            COLORS.textMuted,
                                                        fontSize:
                                                            "10px",
                                                        lineHeight:
                                                            1.6,
                                                        mt:
                                                            .45,
                                                    }}
                                                >
                                                    {
                                                        notification.message
                                                    }
                                                </Typography>


                                                <Typography
                                                    sx={{
                                                        color:
                                                            COLORS.textFaint,
                                                        fontSize:
                                                            "8px",
                                                        mt:
                                                            .8,
                                                    }}
                                                >
                                                    {formatDate(
                                                        notification.created_at
                                                    )}
                                                </Typography>

                                            </Box>


                                            {/* ACTIONS */}

                                            <Stack
                                                direction="row"
                                                spacing={
                                                    .25
                                                }
                                                sx={{
                                                    flexShrink:
                                                        0,
                                                }}
                                            >

                                                {isUnread && (
                                                    <Tooltip
                                                        title="Mark as read"
                                                        arrow
                                                    >
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() =>
                                                                    handleMarkAsRead(
                                                                        notification.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading !==
                                                                    null
                                                                }
                                                                sx={{
                                                                    width:
                                                                        30,
                                                                    height:
                                                                        30,
                                                                    color:
                                                                        COLORS.emerald,
                                                                    borderRadius:
                                                                        "8px",
                                                                    "&:hover":
                                                                        {
                                                                            background:
                                                                                COLORS.emeraldSoft,
                                                                        },
                                                                }}
                                                            >
                                                                {reading ? (
                                                                    <CircularProgress
                                                                        size={
                                                                            13
                                                                        }
                                                                        sx={{
                                                                            color:
                                                                                COLORS.emerald,
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Check
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                )}
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                )}


                                                <Tooltip
                                                    title="Delete notification"
                                                    arrow
                                                >
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                openDeleteDialog(
                                                                    notification.id
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading !==
                                                                null
                                                            }
                                                            sx={{
                                                                width:
                                                                    30,
                                                                height:
                                                                    30,
                                                                color:
                                                                    COLORS.textMuted,
                                                                borderRadius:
                                                                    "8px",
                                                                "&:hover":
                                                                    {
                                                                        color:
                                                                            COLORS.red,
                                                                        background:
                                                                            COLORS.redSoft,
                                                                    },
                                                            }}
                                                        >
                                                            {deleting ? (
                                                                <CircularProgress
                                                                    size={
                                                                        13
                                                                    }
                                                                    sx={{
                                                                        color:
                                                                            COLORS.red,
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Trash2
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            )}
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>

                                            </Stack>

                                        </ListItem>


                                        {index !==
                                            notifications.length -
                                                1 && (
                                            <Divider
                                                sx={{
                                                    borderColor:
                                                        COLORS.divider,
                                                }}
                                            />
                                        )}

                                    </Box>
                                );
                            }
                        )}

                    </List>
                )}

            </Paper>


            {/* =================================================
                DELETE CONFIRMATION
            ================================================= */}

            <Dialog
                open={
                    dialog.open
                }
                onClose={
                    closeDialog
                }
                PaperProps={{
                    sx: {
                        width:
                            "100%",
                        maxWidth:
                            420,
                        borderRadius:
                            "16px",
                        background:
                            "#111923",
                        border:
                            "1px solid rgba(216,180,106,.10)",
                        boxShadow:
                            "0 30px 80px rgba(0,0,0,.45)",
                    },
                }}
            >

                <DialogTitle
                    sx={{
                        color:
                            COLORS.text,
                        fontSize:
                            "15px",
                        fontWeight:
                            750,
                        pb:
                            1,
                    }}
                >
                    {dialog.type ===
                    "all"
                        ? "Clear all notifications?"
                        : "Delete notification?"}
                </DialogTitle>


                <DialogContent>

                    <Typography
                        sx={{
                            color:
                                COLORS.textMuted,
                            fontSize:
                                "10px",
                            lineHeight:
                                1.7,
                        }}
                    >
                        {dialog.type ===
                        "all"
                            ? "This will permanently remove every notification from your account. This action cannot be undone."
                            : "This notification will be permanently removed from your account. This action cannot be undone."}
                    </Typography>

                </DialogContent>


                <DialogActions
                    sx={{
                        px:
                            2.5,
                        pb:
                            2.5,
                        pt:
                            1,
                    }}
                >

                    <Button
                        onClick={
                            closeDialog
                        }
                        disabled={
                            actionLoading !==
                            null
                        }
                        sx={{
                            color:
                                COLORS.textMuted,
                            textTransform:
                                "none",
                            fontSize:
                                "10px",
                            fontWeight:
                                700,
                        }}
                    >
                        Cancel
                    </Button>


                    <Button
                        variant="contained"
                        onClick={
                            confirmDelete
                        }
                        disabled={
                            actionLoading !==
                            null
                        }
                        startIcon={
                            <Trash2
                                size={
                                    14
                                }
                            />
                        }
                        sx={{
                            background:
                                COLORS.red,
                            color:
                                "#160A0B",
                            textTransform:
                                "none",
                            borderRadius:
                                "8px",
                            fontSize:
                                "9px",
                            fontWeight:
                                800,
                            "&:hover":
                                {
                                    background:
                                        "#D65E63",
                                },
                        }}
                    >
                        {dialog.type ===
                        "all"
                            ? "Clear all"
                            : "Delete"}
                    </Button>

                </DialogActions>

            </Dialog>


            {/* =================================================
                EMAIL NOTIFICATION INTELLIGENCE & PREFERENCES
            ================================================= */}

            <Box
                sx={{
                    mt: 4,
                }}
            >
                <EmailPreferences />
            </Box>


            {/* =================================================
                FEEDBACK
            ================================================= */}


            <Snackbar
                open={
                    snackbar.open
                }
                autoHideDuration={
                    3500
                }
                onClose={
                    closeSnackbar
                }
                anchorOrigin={{
                    vertical:
                        "bottom",
                    horizontal:
                        "right",
                }}
            >

                <Alert
                    onClose={
                        closeSnackbar
                    }
                    severity={
                        snackbar.severity
                    }
                    variant="filled"
                    sx={{
                        borderRadius:
                            "9px",
                        fontSize:
                            "10px",
                        fontWeight:
                            600,
                    }}
                >
                    {
                        snackbar.message
                    }
                </Alert>

            </Snackbar>


            {/* =================================================
                RESPONSIVE + ANIMATION
            ================================================= */}

            <style>
                {`
                    @keyframes bbNotificationSpin {
                        from {
                            transform: rotate(0deg);
                        }

                        to {
                            transform: rotate(360deg);
                        }
                    }

                    @media (max-width: 750px) {

                        .notification-summary-grid {
                            grid-template-columns:
                                1fr !important;
                        }
                    }
                `}
            </style>

        </Box>
    );
}