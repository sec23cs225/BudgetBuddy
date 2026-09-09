import axios from "axios";


/*
============================================================
BUDGETBUDDY API CLIENT
============================================================
*/

const api = axios.create({
    baseURL:import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});


/*
============================================================
REFRESH STATE
============================================================

Prevents multiple simultaneous API requests from creating
multiple refresh requests.

Example:

Request A → 401
Request B → 401
Request C → 401

Instead of:

A → refresh
B → refresh
C → refresh

We perform:

A ─┐
B ─┼──→ ONE refresh request
C ─┘

Then all failed requests are retried.
============================================================
*/

let refreshPromise = null;


/*
============================================================
REQUEST INTERCEPTOR
============================================================

JWT authentication is handled entirely by HttpOnly cookies.

Therefore:

❌ No localStorage access token
❌ No localStorage refresh token
❌ No Authorization header

The browser automatically sends:

budgetbuddy_access
budgetbuddy_refresh

with requests to the backend.
============================================================
*/

api.interceptors.request.use(
    (config) => {

        /*
        ----------------------------------------------------
        AUTHENTICATION IS COOKIE-BASED
        ----------------------------------------------------

        Do NOT read:

        localStorage.getItem("access")

        Do NOT create:

        Authorization: Bearer <token>
        */

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);


/*
============================================================
RESPONSE INTERCEPTOR
============================================================

Normal request:

Request
   ↓
Backend
   ↓
200
   ↓
Return response


Expired access token:

Request
   ↓
401
   ↓
Refresh request
   ↓
New access cookie
   ↓
Retry original request
   ↓
Return response
============================================================
*/

api.interceptors.response.use(

    /*
    --------------------------------------------------------
    SUCCESS
    --------------------------------------------------------
    */

    (response) => {
        return response;
    },


    /*
    --------------------------------------------------------
    ERROR
    --------------------------------------------------------
    */

    async (error) => {

        const originalRequest = error.config;


        /*
        ----------------------------------------------------
        SAFETY CHECK
        ----------------------------------------------------
        */

        if (!originalRequest) {
            return Promise.reject(error);
        }


        /*
        ----------------------------------------------------
        CHECK FOR 401
        ----------------------------------------------------
        */

        const isUnauthorized =
            error.response?.status === 401;


        /*
        ----------------------------------------------------
        REQUEST URL
        ----------------------------------------------------
        */

        const requestURL =
            originalRequest.url || "";


        /*
        ----------------------------------------------------
        AUTHENTICATION ENDPOINTS
        ----------------------------------------------------

        Never attempt a refresh when these endpoints
        themselves return 401.

        Otherwise we could create an infinite loop.
        */

        const isAuthRequest =
            requestURL.includes("/login/") ||
            requestURL.includes("/register/") ||
            requestURL.includes("/google-login/") ||
            requestURL.includes("/refresh/") ||
            requestURL.includes("/logout/");


        /*
        ----------------------------------------------------
        ALREADY RETRIED
        ----------------------------------------------------

        Prevent:

        request
          ↓
        401
          ↓
        refresh
          ↓
        retry
          ↓
        401
          ↓
        refresh
          ↓
        infinite loop
        ----------------------------------------------------
        */

        if (
            !isUnauthorized ||
            isAuthRequest ||
            originalRequest._retry === true
        ) {
            return Promise.reject(error);
        }


        /*
        ----------------------------------------------------
        MARK REQUEST AS RETRIED
        ----------------------------------------------------
        */

        originalRequest._retry = true;


        /*
        ----------------------------------------------------
        CREATE SHARED REFRESH REQUEST
        ----------------------------------------------------

        If another request is already refreshing the token,
        all other failed requests wait for that same promise.
        */

        if (!refreshPromise) {

            refreshPromise = api.post(
                "/refresh/",
                {},
                {
                    /*
                    Explicitly send authentication cookies.
                    */

                    withCredentials: true,

                    /*
                    This request does not require an existing
                    access token.
                    */

                    skipAuth: true,
                }
            )
            .finally(() => {

                /*
                ------------------------------------------------
                RESET REFRESH STATE
                ------------------------------------------------

                Allows a future expired access token to
                initiate another refresh.
                */

                refreshPromise = null;
            });
        }


        /*
        ----------------------------------------------------
        WAIT FOR REFRESH
        ----------------------------------------------------
        */

        try {

            await refreshPromise;


            /*
            ------------------------------------------------
            RETRY ORIGINAL REQUEST
            ------------------------------------------------

            Django has already replaced the expired
            access-token cookie.

            The browser automatically sends the new
            cookie with this retry.
            */

            return api(originalRequest);

        } catch (refreshError) {

            /*
            ------------------------------------------------
            REFRESH FAILED
            ------------------------------------------------

            Usually means the refresh token is:

            - expired
            - invalid
            - deleted
            - revoked

            Do not retry again.
            */

            return Promise.reject(
                refreshError
            );
        }
    }
);


/*
============================================================
EXPORT
============================================================
*/

export default api;