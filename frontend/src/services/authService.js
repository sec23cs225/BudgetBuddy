import api from "./api";


/* =========================================================
   REGISTER
========================================================= */

export const registerUser = (userData) => {
    return api.post(
        "/register/",
        userData,
        {
            skipAuth: true,
        }
    );
};


/* =========================================================
   NORMAL LOGIN
========================================================= */

export const loginUser = (userData) => {
    return api.post(
        "/login/",
        userData,
        {
            skipAuth: true,
        }
    );
};


/* =========================================================
   GOOGLE LOGIN
========================================================= */

export const loginWithGoogle = (credential) => {
    return api.post(
        "/google-login/",
        {
            credential,
        },
        {
            skipAuth: true,
        }
    );
};


/* =========================================================
   REFRESH ACCESS TOKEN
========================================================= */

export const refreshAccessToken = () => {
    return api.post(
        "/refresh/",
        {},
        {
            skipAuth: true,
        }
    );
};


/* =========================================================
   LOGOUT
========================================================= */

export const logoutUser = () => {
    return api.post(
        "/logout/",
        {},
        {
            skipAuth: true,
        }
    );
};