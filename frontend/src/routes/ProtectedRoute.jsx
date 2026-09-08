import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "../services/api";


export default function ProtectedRoute({ children }) {

    const location = useLocation();

    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);


    useEffect(() => {

        let mounted = true;


        const checkAuthentication = async () => {

            try {

                /*
                 * ------------------------------------------------
                 * CHECK CURRENT SESSION
                 * ------------------------------------------------
                 *
                 * The browser automatically sends the
                 * HttpOnly authentication cookie.
                 *
                 * JavaScript never reads the JWT.
                 */

                await api.get("/me/");


                if (mounted) {
                    setIsAuthenticated(true);
                }

            } catch (error) {

                if (mounted) {
                    setIsAuthenticated(false);
                }

            } finally {

                if (mounted) {
                    setCheckingAuth(false);
                }

            }
        };


        checkAuthentication();


        return () => {
            mounted = false;
        };

    }, []);


    /*
     * --------------------------------------------------------
     * AUTHENTICATION CHECK IN PROGRESS
     * --------------------------------------------------------
     *
     * Prevents the application from immediately redirecting
     * to /login before the backend has confirmed the session.
     */

    if (checkingAuth) {
        return null;
    }


    /*
     * --------------------------------------------------------
     * USER NOT AUTHENTICATED
     * --------------------------------------------------------
     */

    if (!isAuthenticated) {

        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname,
                }}
            />
        );

    }


    /*
     * --------------------------------------------------------
     * USER AUTHENTICATED
     * --------------------------------------------------------
     */

    return children;
}