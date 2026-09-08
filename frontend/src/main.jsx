import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";

import "./styles/variables.css";
import "./styles/global.css";
import "./styles/layout.css";


const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID;


if (!googleClientId) {
    console.error(
        "Google Client ID is missing. " +
        "Please check the VITE_GOOGLE_CLIENT_ID value in frontend/.env"
    );
}


ReactDOM.createRoot(
    document.getElementById("root")
).render(

    <React.StrictMode>

        <GoogleOAuthProvider
            clientId={googleClientId}
        >

            <BrowserRouter>

                <App />

            </BrowserRouter>

        </GoogleOAuthProvider>

    </React.StrictMode>
);