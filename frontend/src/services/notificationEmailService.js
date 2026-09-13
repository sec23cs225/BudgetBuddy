import api from "./api";


/* =========================================================
   GET EMAIL NOTIFICATION PREFERENCES
========================================================= */

export function getEmailPreferences() {
    return api.get("/notifications/email/preferences/");
}


/* =========================================================
   UPDATE EMAIL NOTIFICATION PREFERENCES
========================================================= */

export function updateEmailPreferences(preferences) {
    return api.patch(
        "/notifications/email/preferences/",
        preferences
    );
}


/* =========================================================
   SEND TEST EMAIL NOTIFICATION
========================================================= */

export function sendTestEmail() {
    return api.post("/notifications/email/test/");
}