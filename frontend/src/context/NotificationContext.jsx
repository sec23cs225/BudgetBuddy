import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import { getNotifications } from "../services/notificationService";


const NotificationContext =
    createContext(null);


const POLLING_INTERVAL = 15000;

const COUNT_KEY =
    "budgetbuddy_unread_notification_count";


export function NotificationProvider({
    children,
}) {

    const [
        notifications,
        setNotifications,
    ] = useState([]);


    const [
        unreadCount,
        setUnreadCount,
    ] = useState(() => {

        const saved =
            localStorage.getItem(
                COUNT_KEY
            );

        if (!saved) {
            return 0;
        }

        const parsed =
            Number(saved);

        return Number.isFinite(parsed)
            ? parsed
            : 0;
    });


    const [
        newNotification,
        setNewNotification,
    ] = useState(null);


    /*
     * Stores notification IDs from
     * the previous successful fetch.
     *
     * This prevents notifications that
     * already existed during initial load
     * from triggering a popup.
     */
    const previousIdsRef =
        useRef(new Set());


    const initialLoadRef =
        useRef(true);


    const intervalRef =
        useRef(null);


    /* =========================================================
       FETCH / SYNCHRONIZE NOTIFICATIONS
    ========================================================= */

    const fetchNotifications =
        useCallback(async () => {

            try {

                const response =
                    await getNotifications();


                const incoming =
                    Array.isArray(
                        response?.data
                    )
                        ? response.data
                        : [];


                /*
                 * Detect notifications that did
                 * not exist during the previous
                 * successful synchronization.
                 */
                if (
                    !initialLoadRef.current
                ) {

                    const newlyCreated =
                        incoming.filter(
                            (notification) =>
                                notification?.id != null &&
                                !previousIdsRef.current.has(
                                    notification.id
                                )
                        );


                    if (
                        newlyCreated.length > 0
                    ) {

                        const newest =
                            [...newlyCreated]
                                .sort(
                                    (a, b) =>
                                        new Date(
                                            b.created_at
                                        ).getTime() -
                                        new Date(
                                            a.created_at
                                        ).getTime()
                                )[0];


                        setNewNotification(
                            newest
                        );


                        /*
                         * Notify other components
                         * that a new notification arrived.
                         */
                        window.dispatchEvent(
                            new CustomEvent(
                                "budgetbuddy:new-notification",
                                {
                                    detail:
                                        newest,
                                }
                            )
                        );
                    }
                }


                /*
                 * Update the known notification IDs
                 * after the successful request.
                 */
                previousIdsRef.current =
                    new Set(
                        incoming
                            .map(
                                (notification) =>
                                    notification?.id
                            )
                            .filter(
                                (id) =>
                                    id != null
                            )
                    );


                /*
                 * Calculate unread notifications
                 * from the server response.
                 */
                const unread =
                    incoming.filter(
                        (notification) =>
                            !notification?.is_read
                    ).length;


                /*
                 * Update React state.
                 */
                setNotifications(
                    incoming
                );

                setUnreadCount(
                    unread
                );


                /*
                 * Persist unread count so the
                 * application can restore the
                 * latest known value immediately.
                 */
                localStorage.setItem(
                    COUNT_KEY,
                    String(unread)
                );


                /*
                 * Notify Topbar, Sidebar and
                 * other interested components.
                 */
                window.dispatchEvent(
                    new CustomEvent(
                        "budgetbuddy:notifications-updated",
                        {
                            detail: {
                                notifications:
                                    incoming,

                                unreadCount:
                                    unread,
                            },
                        }
                    )
                );


                /*
                 * Initial load is considered
                 * complete only after a successful
                 * server response.
                 */
                initialLoadRef.current =
                    false;

            } catch (error) {

                console.error(
                    "Notification sync error:",
                    error?.response?.data ||
                    error?.message ||
                    error
                );

            }

        }, []);


    /* =========================================================
       INITIAL LOAD + GLOBAL POLLING
    ========================================================= */

    useEffect(() => {

        /*
         * Fetch immediately when the provider
         * is mounted.
         */
        fetchNotifications();


        /*
         * Keep the notification state synchronized
         * with the backend.
         */
        intervalRef.current =
            window.setInterval(
                fetchNotifications,
                POLLING_INTERVAL
            );


        /*
         * Synchronize immediately when the
         * user returns to the application.
         */
        const handleVisibilityChange =
            () => {

                if (
                    document.visibilityState ===
                    "visible"
                ) {

                    fetchNotifications();

                }

            };


        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );


        return () => {

            if (
                intervalRef.current !== null
            ) {

                window.clearInterval(
                    intervalRef.current
                );

                intervalRef.current =
                    null;
            }


            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );

        };

    }, [
        fetchNotifications,
    ]);


    /* =========================================================
       LISTEN FOR GLOBAL NOTIFICATION UPDATES
    ========================================================= */

    useEffect(() => {

        const handleNotificationUpdate =
            (event) => {

                const detail =
                    event?.detail;


                if (!detail) {
                    return;
                }


                if (
                    Array.isArray(
                        detail.notifications
                    )
                ) {

                    setNotifications(
                        detail.notifications
                    );


                    /*
                     * Keep the local ID cache
                     * synchronized with actions such
                     * as delete / clear / mark-read.
                     */
                    previousIdsRef.current =
                        new Set(
                            detail.notifications
                                .map(
                                    (notification) =>
                                        notification?.id
                                )
                                .filter(
                                    (id) =>
                                        id != null
                                )
                        );
                }


                if (
                    typeof detail.unreadCount ===
                    "number"
                ) {

                    const safeCount =
                        Math.max(
                            0,
                            detail.unreadCount
                        );


                    setUnreadCount(
                        safeCount
                    );


                    localStorage.setItem(
                        COUNT_KEY,
                        String(safeCount)
                    );

                }

            };


        const handleNewNotification =
            (event) => {

                if (
                    event?.detail
                ) {

                    setNewNotification(
                        event.detail
                    );

                }

            };


        window.addEventListener(
            "budgetbuddy:notifications-updated",
            handleNotificationUpdate
        );


        window.addEventListener(
            "budgetbuddy:new-notification",
            handleNewNotification
        );


        return () => {

            window.removeEventListener(
                "budgetbuddy:notifications-updated",
                handleNotificationUpdate
            );


            window.removeEventListener(
                "budgetbuddy:new-notification",
                handleNewNotification
            );

        };

    }, []);


    /* =========================================================
       CLEAR NEW-NOTIFICATION POPUP
    ========================================================= */

    const clearNewNotification =
        useCallback(() => {

            setNewNotification(
                null
            );

        }, []);


    /* =========================================================
       CONTEXT VALUE
    ========================================================= */

    const value = {
        notifications,

        unreadCount,

        newNotification,

        refreshNotifications:
            fetchNotifications,

        clearNewNotification,
    };


    return (
        <NotificationContext.Provider
            value={value}
        >
            {children}
        </NotificationContext.Provider>
    );
}


/* =============================================================
   CUSTOM HOOK
============================================================= */

export function useNotifications() {

    const context =
        useContext(
            NotificationContext
        );


    if (!context) {

        throw new Error(
            "useNotifications must be used inside NotificationProvider"
        );

    }


    return context;
}