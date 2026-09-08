import axios from "axios";


const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000/api";


const emailAPI =
    axios.create({
        baseURL:
            `${API_BASE_URL}/notifications/email`,
        headers: {
            "Content-Type":
                "application/json",
        },
    });


emailAPI.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem(
                "access_token"
            ) ||
            localStorage.getItem(
                "access"
            );

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        return config;
    }
);


export function getEmailPreferences() {

    return emailAPI.get(
        "/preferences/"
    );
}


export function updateEmailPreferences(
    preferences
) {

    return emailAPI.patch(
        "/preferences/",
        preferences
    );
}


export function sendTestEmail() {

    return emailAPI.post(
        "/test/"
    );
}