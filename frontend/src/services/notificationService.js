import api from "./api";


/* =========================================================
   GET ALL NOTIFICATIONS
========================================================= */

export const getNotifications = () => {
    return api.get("/notifications/");
};


/* =========================================================
   GET UNREAD NOTIFICATIONS
========================================================= */

export const getUnreadNotifications = () => {
    return api.get("/notifications/unread/");
};


/* =========================================================
   MARK SINGLE NOTIFICATION AS READ
========================================================= */

export const markAsRead = (id) => {
    return api.patch(
        `/notifications/${id}/read/`
    );
};


/* =========================================================
   MARK ALL NOTIFICATIONS AS READ
========================================================= */

export const markAllAsRead = () => {
    return api.patch(
        "/notifications/read-all/"
    );
};


/* =========================================================
   DELETE SINGLE NOTIFICATION
========================================================= */

export const deleteNotification = (id) => {
    return api.delete(
        `/notifications/${id}/`
    );
};


/* =========================================================
   DELETE / CLEAR ALL NOTIFICATIONS
========================================================= */

export const clearNotifications = () => {
    return api.delete(
        "/notifications/clear/"
    );
};