import { useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import {
    ArrowLeft,
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    ShieldCheck,
    Sparkles,
    UserRound,
} from "lucide-react";

import {
    loginUser,
    loginWithGoogle,
} from "../services/authService";


export default function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [googleLoading, setGoogleLoading] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");


    /* =========================================================
       INPUT HANDLER
    ========================================================= */

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (errorMessage) {
            setErrorMessage("");
        }
    };


    /* =========================================================
       NORMAL LOGIN
    ========================================================= */

    const handleSubmit = async (event) => {

        event.preventDefault();

        setErrorMessage("");

        /*
         * Prevent duplicate authentication attempts.
         */

        if (loading || googleLoading) {
            return;
        }

        const username =
            formData.username.trim();

        const password =
            formData.password;

        /*
         * Basic validation.
         */

        if (!username || !password) {

            setErrorMessage(
                "Please enter your username and password."
            );

            return;
        }

        setLoading(true);

        try {

            /*
             * Django authenticates the user and places
             * the access and refresh JWTs into HttpOnly
             * cookies.
             *
             * The JWTs are intentionally NOT returned
             * to JavaScript and are NOT stored in
             * localStorage.
             */

            const response =
                await loginUser({
                    username,
                    password,
                });


            /*
             * Django returns 200 and sets the HttpOnly JWT cookies.
             * The tokens are intentionally not returned to JavaScript.
             *
             * Verify the newly-created cookie session through /me/
             * before navigating to the protected dashboard.
             */
            if (response?.status !== 200) {
                throw new Error(
                    "Login was not completed successfully."
                );
            }

            const sessionResponse = await api.get(
                "/me/",
                {
                    withCredentials: true,
                }
            );

            if (
                sessionResponse?.status !== 200 ||
                !sessionResponse?.data?.authenticated
            ) {
                throw new Error(
                    "Login succeeded, but the authentication session could not be verified."
                );
            }


            /*
             * =================================================
             * USER INFORMATION
             * =================================================
             *
             * User profile information is not an
             * authentication secret.
             *
             * We may continue using localStorage for
             * lightweight UI information such as the
             * username.
             *
             * JWT access/refresh tokens are NEVER stored.
             */

            const returnedUsername =
                response?.data?.user?.username ||
                username;

            const returnedEmail =
                response?.data?.user?.email ||
                "";


            if (returnedUsername) {

                localStorage.setItem(
                    "username",
                    returnedUsername
                );

            } else {

                localStorage.removeItem(
                    "username"
                );
            }


            /*
             * Normal username/password login may return
             * the user's email from Django.
             *
             * If it is unavailable, remove any stale
             * email from an earlier Google session.
             */

            if (returnedEmail) {

                localStorage.setItem(
                    "email",
                    returnedEmail
                );

            } else {

                localStorage.removeItem(
                    "email"
                );
            }


            /*
             * Notify other BudgetBuddy components that
             * account information has changed.
             */

            window.dispatchEvent(
                new Event(
                    "budgetbuddy-settings-updated"
                )
            );


            /*
             * =================================================
             * DASHBOARD
             * =================================================
             */

            navigate(
                "/dashboard",
                {
                    replace: true,
                }
            );

        } catch (error) {

            console.error(
                "Login failed:",
                error.response?.data ||
                error.message
            );

            const backendError =
                error.response?.data;

            let message =
                "Unable to sign in. Please check your credentials.";


            /*
             * Handle DRF detail messages.
             */

            if (backendError?.detail) {

                message =
                    backendError.detail;

            }

            /*
             * Handle general backend errors.
             */

            else if (backendError?.error) {

                message =
                    backendError.error;

            }

            /*
             * Handle non-field errors.
             */

            else if (
                backendError?.non_field_errors
            ) {

                message =
                    Array.isArray(
                        backendError.non_field_errors
                    )
                        ? backendError.non_field_errors[0]
                        : backendError.non_field_errors;
            }

            /*
             * Handle username errors.
             */

            else if (
                backendError?.username
            ) {

                message =
                    Array.isArray(
                        backendError.username
                    )
                        ? backendError.username[0]
                        : backendError.username;
            }

            /*
             * Handle password errors.
             */

            else if (
                backendError?.password
            ) {

                message =
                    Array.isArray(
                        backendError.password
                    )
                        ? backendError.password[0]
                        : backendError.password;
            }


            setErrorMessage(
                message
            );

        } finally {

            setLoading(false);
        }
    };


    /* =========================================================
       GOOGLE LOGIN SUCCESS
    ========================================================= */

    const handleGoogleSuccess = async (
        credentialResponse
    ) => {

        setErrorMessage("");

        /*
         * Google Identity Services returns the ID token
         * through credentialResponse.credential.
         */

        const credential =
            credentialResponse?.credential;

        if (!credential) {

            setErrorMessage(
                "Google sign-in did not return a credential. Please try again."
            );

            return;
        }


        /*
         * Prevent a Google authentication request from
         * starting while normal login is already active.
         */

        if (loading || googleLoading) {
            return;
        }

        setGoogleLoading(true);

        try {

            /*
             * Send Google's ID token to Django.
             *
             * Django:
             *
             * 1. Verifies the Google ID token.
             * 2. Validates the audience.
             * 3. Identifies the Google account.
             * 4. Finds/creates the BudgetBuddy user.
             * 5. Creates BudgetBuddy JWTs.
             * 6. Places those JWTs into HttpOnly cookies.
             *
             * The JWTs are NOT exposed to JavaScript.
             */

            const response =
                await loginWithGoogle(
                    credential
                );


            /*
             * Django sets the BudgetBuddy JWTs in HttpOnly cookies.
             * Verify that the browser can use the new session before
             * entering the protected dashboard.
             */
            if (response?.status !== 200) {
                throw new Error(
                    "Google login was not completed successfully."
                );
            }

            const sessionResponse = await api.get(
                "/me/",
                {
                    withCredentials: true,
                }
            );

            if (
                sessionResponse?.status !== 200 ||
                !sessionResponse?.data?.authenticated
            ) {
                throw new Error(
                    "Google login succeeded, but the authentication session could not be verified."
                );
            }


            /*
             * =================================================
             * USER INFORMATION
             * =================================================
             */

            const returnedUsername =
                response?.data?.user?.username ||
                response?.data?.username ||
                "";

            const returnedEmail =
                response?.data?.user?.email ||
                response?.data?.email ||
                "";


            /*
             * Store username for UI usage.
             */

            if (returnedUsername) {

                localStorage.setItem(
                    "username",
                    returnedUsername
                );

            } else {

                localStorage.removeItem(
                    "username"
                );
            }


            /*
             * Store verified Google email for UI usage.
             */

            if (returnedEmail) {

                localStorage.setItem(
                    "email",
                    returnedEmail
                );

            } else {

                localStorage.removeItem(
                    "email"
                );
            }


            /*
             * Notify the rest of BudgetBuddy that
             * account information has changed.
             */

            window.dispatchEvent(
                new Event(
                    "budgetbuddy-settings-updated"
                )
            );


            /*
             * =================================================
             * DASHBOARD
             * =================================================
             */

            navigate(
                "/dashboard",
                {
                    replace: true,
                }
            );

        } catch (error) {

            console.error(
                "Google login failed:",
                error.response?.data ||
                error.message
            );

            const backendError =
                error.response?.data;

            const message =
                backendError?.error ||
                backendError?.detail ||
                "Google sign-in failed. Please try again.";

            setErrorMessage(
                message
            );

        } finally {

            setGoogleLoading(false);
        }
    };


    /* =========================================================
       GOOGLE LOGIN ERROR
    ========================================================= */

    const handleGoogleError = () => {

        setGoogleLoading(false);

        setErrorMessage(
            "Google sign-in was cancelled or could not be completed."
        );
    };


    /* =========================================================
       GLOBAL AUTHENTICATION STATE
    ========================================================= */

    const isLoading =
        loading || googleLoading;


    return (

        <div className="bb-login-page">

            {/* =================================================
                BACKGROUND
            ================================================= */}

            <div
                className="bb-login-glow bb-login-glow-one"
                aria-hidden="true"
            />

            <div
                className="bb-login-glow bb-login-glow-two"
                aria-hidden="true"
            />

            <div
                className="bb-login-grid"
                aria-hidden="true"
            />


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="bb-login-header">

                <Link
                    to="/"
                    className="bb-login-brand"
                >

                    <div className="bb-login-brand-mark">
                        B
                    </div>

                    <div className="bb-login-brand-copy">

                        <div className="bb-login-brand-name">
                            Budget<span>Buddy</span>
                        </div>

                        <div className="bb-login-brand-sub">
                            PERSONAL FINANCE
                        </div>

                    </div>

                </Link>


                <Link
                    to="/"
                    className="bb-back-home"
                >

                    <ArrowLeft size={15} />

                    <span>
                        Back to home
                    </span>

                </Link>

            </header>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="bb-login-main">

                {/* =================================================
                    STORY
                ================================================= */}

                <section className="bb-login-story">

                    <div className="bb-story-badge">

                        <Sparkles size={14} />

                        <span>
                            YOUR FINANCIAL WORKSPACE
                        </span>

                    </div>


                    <h1>
                        Welcome back.

                        <br />

                        <span>
                            Your money is
                            <br />
                            waiting.
                        </span>
                    </h1>


                    <p className="bb-login-description">
                        Pick up exactly where you left
                        off. Review your finances, track
                        your progress, and stay in control
                        of every financial decision.
                    </p>


                    <div className="bb-login-highlights">

                        <LoginHighlight
                            icon={
                                <ShieldCheck size={18} />
                            }
                            title="Protected access"
                            text="Your financial information stays private."
                        />

                        <LoginHighlight
                            icon={
                                <LockKeyhole size={18} />
                            }
                            title="Secure session"
                            text="Your workspace is protected by authentication."
                        />

                        <LoginHighlight
                            icon={
                                <ArrowRight size={18} />
                            }
                            title="Instant dashboard"
                            text="Your complete financial picture, in one place."
                        />

                    </div>

                </section>


                {/* =================================================
                    LOGIN CARD
                ================================================= */}

                <section
                    className="bb-login-card"
                    aria-labelledby="login-heading"
                >

                    <div className="bb-login-card-glow" />


                    <div className="bb-login-card-header">

                        <div className="bb-login-icon">

                            <LockKeyhole
                                size={21}
                                strokeWidth={1.8}
                            />

                        </div>

                        <div className="bb-login-card-heading">

                            <h2 id="login-heading">
                                Sign in
                            </h2>

                            <p>
                                Access your BudgetBuddy workspace
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {errorMessage && (

                        <div
                            className="bb-login-error"
                            role="alert"
                            aria-live="polite"
                        >

                            <span className="bb-error-dot" />

                            <span>
                                {errorMessage}
                            </span>

                        </div>

                    )}


                    {/* =================================================
                        NORMAL LOGIN FORM
                    ================================================= */}

                    <form
                        onSubmit={handleSubmit}
                        noValidate
                    >

                        {/* USERNAME */}

                        <div className="bb-field">

                            <label htmlFor="username">
                                Username
                            </label>

                            <div className="bb-input-wrapper">

                                <UserRound
                                    size={18}
                                    className="bb-input-icon"
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />

                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    placeholder="Enter your username"
                                    value={
                                        formData.username
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    autoComplete="username"
                                    autoFocus
                                    disabled={isLoading}
                                />

                            </div>

                        </div>


                        {/* PASSWORD */}

                        <div className="bb-field">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="bb-input-wrapper">

                                <LockKeyhole
                                    size={18}
                                    className="bb-input-icon"
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    placeholder="Enter your password"
                                    value={
                                        formData.password
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                />

                                <button
                                    type="button"
                                    className="bb-password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    disabled={isLoading}
                                >

                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}

                                </button>

                            </div>

                        </div>


                        {/* SUBMIT */}

                        <button
                            type="submit"
                            className="bb-login-submit"
                            disabled={isLoading}
                        >

                            {loading ? (

                                <>
                                    <span className="bb-spinner" />

                                    <span>
                                        Signing in...
                                    </span>
                                </>

                            ) : (

                                <>
                                    <span>
                                        Sign in to BudgetBuddy
                                    </span>

                                    <ArrowRight size={18} />
                                </>

                            )}

                        </button>

                    </form>


                    {/* =================================================
                        GOOGLE DIVIDER
                    ================================================= */}

                    <div className="bb-login-divider">

                        <span>
                            OR CONTINUE WITH
                        </span>

                    </div>


                    {/* =================================================
                        GOOGLE SIGN-IN
                    ================================================= */}

                    <div
                        className="bb-google-login"
                        aria-label="Continue with Google"
                    >

                        {googleLoading ? (

                            <div className="bb-google-loading">

                                <span className="bb-spinner" />

                                <span>
                                    Signing in with Google...
                                </span>

                            </div>

                        ) : !loading ? (

                            <GoogleLogin
                                onSuccess={
                                    handleGoogleSuccess
                                }
                                onError={
                                    handleGoogleError
                                }
                                useOneTap={false}
                                theme="filled_black"
                                shape="rectangular"
                                size="large"
                                width="100%"
                                text="signin_with"
                            />

                        ) : null}

                    </div>


                    {/* =================================================
                        REGISTER DIVIDER
                    ================================================= */}

                    <div className="bb-login-divider bb-register-divider">

                        <span>
                            New to BudgetBuddy?
                        </span>

                    </div>


                    {/* =================================================
                        REGISTER
                    ================================================= */}

                    <Link
                        to="/register"
                        className="bb-register-button"
                        aria-disabled={isLoading}
                    >

                        <span>
                            Create your account
                        </span>

                        <ArrowRight size={17} />

                    </Link>


                    {/* =================================================
                        SECURITY
                    ================================================= */}

                    <div className="bb-login-security">

                        <ShieldCheck
                            size={15}
                            strokeWidth={1.8}
                        />

                        <span>
                            Secure account access
                        </span>

                    </div>

                </section>

            </main>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="bb-login-footer">

                <span>
                    © {new Date().getFullYear()}
                    {" "}BudgetBuddy
                </span>

                <span>
                    Your money. Your clarity.
                </span>

            </footer>


            {/* =================================================
                LOGIN PAGE STYLES
            ================================================= */}

            <style>{`

                /* =================================================
                   RESET / ISOLATION
                ================================================= */

                .bb-login-page,
                .bb-login-page *,
                .bb-login-page *::before,
                .bb-login-page *::after {

                    box-sizing:
                        border-box;

                }


                .bb-login-page {

                    --bg:
                        #050B13;

                    --surface:
                        #0C1420;

                    --surface-2:
                        #101B29;

                    --border:
                        rgba(148,163,184,.14);

                    --text:
                        #F5F7FA;

                    --text-soft:
                        #CBD5E1;

                    --muted:
                        #8190A5;

                    --faint:
                        #536176;

                    --green:
                        #08D69B;

                    --cyan:
                        #22D3EE;

                    min-height:
                        100vh;

                    display:
                        flex;

                    flex-direction:
                        column;

                    position:
                        relative;

                    overflow:
                        hidden;

                    background:
                        radial-gradient(
                            circle at 78% 25%,
                            rgba(8,214,155,.075),
                            transparent 29%
                        ),
                        radial-gradient(
                            circle at 8% 82%,
                            rgba(34,211,238,.045),
                            transparent 27%
                        ),
                        var(--bg);

                    color:
                        var(--text);

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

                    -moz-osx-font-smoothing:
                        grayscale;

                    text-rendering:
                        optimizeLegibility;

                }


                /* =================================================
                   BACKGROUND
                ================================================= */

                .bb-login-grid {

                    position:
                        absolute;

                    inset:
                        0;

                    z-index:
                        0;

                    pointer-events:
                        none;

                    opacity:
                        .18;

                    background-image:
                        linear-gradient(
                            rgba(148,163,184,.025) 1px,
                            transparent 1px
                        ),
                        linear-gradient(
                            90deg,
                            rgba(148,163,184,.025) 1px,
                            transparent 1px
                        );

                    background-size:
                        55px 55px;

                    mask-image:
                        linear-gradient(
                            to bottom,
                            black,
                            transparent 78%
                        );

                }


                .bb-login-glow {

                    position:
                        absolute;

                    border-radius:
                        50%;

                    filter:
                        blur(90px);

                    pointer-events:
                        none;

                    z-index:
                        0;

                }


                .bb-login-glow-one {

                    width:
                        360px;

                    height:
                        360px;

                    right:
                        -130px;

                    top:
                        80px;

                    background:
                        rgba(8,214,155,.065);

                }


                .bb-login-glow-two {

                    width:
                        300px;

                    height:
                        300px;

                    left:
                        -150px;

                    bottom:
                        20px;

                    background:
                        rgba(34,211,238,.045);

                }


                /* =================================================
                   HEADER
                ================================================= */

                .bb-login-header {

                    height:
                        76px;

                    flex-shrink:
                        0;

                    padding:
                        0 clamp(24px, 5vw, 72px);

                    display:
                        flex;

                    align-items:
                        center;

                    justify-content:
                        space-between;

                    position:
                        relative;

                    z-index:
                        10;

                    border-bottom:
                        1px solid
                        rgba(148,163,184,.08);

                    background:
                        rgba(5,11,19,.82);

                    backdrop-filter:
                        blur(22px);

                    -webkit-backdrop-filter:
                        blur(22px);

                }


                .bb-login-brand {

                    display:
                        flex;

                    align-items:
                        center;

                    gap:
                        11px;

                    color:
                        inherit;

                    text-decoration:
                        none;

                }


                .bb-login-brand-mark {

                    width:
                        39px;

                    height:
                        39px;

                    display:
                        grid;

                    place-items:
                        center;

                    border-radius:
                        10px;

                    background:
                        linear-gradient(
                            135deg,
                            #08D69B,
                            #22D3EE
                        );

                    color:
                        #03130D;

                    font-size:
                        17px;

                    font-weight:
                        900;

                    box-shadow:
                        0 8px 28px
                        rgba(8,214,155,.14);

                }


                .bb-login-brand-copy {

                    display:
                        flex;

                    flex-direction:
                        column;

                    gap:
                        2px;

                }


                .bb-login-brand-name {

                    color:
                        #F4F7F9;

                    font-size:
                        17px;

                    line-height:
                        1.2;

                    font-weight:
                        850;

                    letter-spacing:
                        -.35px;

                }


                .bb-login-brand-name span {

                    color:
                        var(--green);

                }


                .bb-login-brand-sub {

                    color:
                        #526176;

                    font-size:
                        7px;

                    line-height:
                        1.2;

                    font-weight:
                        750;

                    letter-spacing:
                        1.6px;

                }


                .bb-back-home {

                    min-height:
                        36px;

                    display:
                        inline-flex;

                    align-items:
                        center;

                    gap:
                        7px;

                    padding:
                        0 10px;

                    border-radius:
                        8px;

                    color:
                        #78879B;

                    text-decoration:
                        none;

                    font-size:
                        11px;

                    font-weight:
                        600;

                    transition:
                        color .2s ease,
                        background .2s ease;

                }


                .bb-back-home:hover {

                    color:
                        #F4F7F9;

                    background:
                        rgba(255,255,255,.035);

                }


                /* =================================================
                   MAIN
                ================================================= */

                .bb-login-main {

                    flex:
                        1;

                    width:
                        100%;

                    max-width:
                        1240px;

                    margin:
                        0 auto;

                    padding:
                        70px 34px;

                    display:
                        grid;

                    grid-template-columns:
                        minmax(0, 1fr)
                        455px;

                    align-items:
                        center;

                    gap:
                        clamp(55px, 8vw, 105px);

                    position:
                        relative;

                    z-index:
                        2;

                }


                /* =================================================
                   STORY
                ================================================= */

                .bb-login-story {

                    max-width:
                        610px;

                }


                .bb-story-badge {

                    width:
                        fit-content;

                    display:
                        inline-flex;

                    align-items:
                        center;

                    gap:
                        8px;

                    padding:
                        8px 13px;

                    border:
                        1px solid
                        rgba(8,214,155,.18);

                    border-radius:
                        999px;

                    background:
                        rgba(8,214,155,.055);

                    color:
                        var(--green);

                    font-size:
                        9px;

                    line-height:
                        1.2;

                    font-weight:
                        800;

                    letter-spacing:
                        1.2px;

                }


                .bb-login-story h1 {

                    margin:
                        27px 0 0;

                    color:
                        #F7F8FA;

                    font-size:
                        clamp(48px, 5.3vw, 72px);

                    line-height:
                        .98;

                    letter-spacing:
                        -3.5px;

                    font-weight:
                        850;

                }


                .bb-login-story h1 span {

                    color:
                        transparent;

                    background:
                        linear-gradient(
                            95deg,
                            #08D69B 5%,
                            #18CFA7 48%,
                            #22D3EE 100%
                        );

                    -webkit-background-clip:
                        text;

                    background-clip:
                        text;

                    -webkit-text-fill-color:
                        transparent;

                }


                .bb-login-description {

                    max-width:
                        540px;

                    margin:
                        27px 0 0;

                    color:
                        #8290A5;

                    font-size:
                        13px;

                    line-height:
                        1.85;

                    font-weight:
                        500;

                }


                /* =================================================
                   HIGHLIGHTS
                ================================================= */

                .bb-login-highlights {

                    margin-top:
                        34px;

                    display:
                        flex;

                    flex-direction:
                        column;

                    gap:
                        12px;

                }


                .bb-login-highlight {

                    display:
                        flex;

                    align-items:
                        center;

                    gap:
                        12px;

                }


                .bb-highlight-icon {

                    width:
                        38px;

                    height:
                        38px;

                    min-width:
                        38px;

                    display:
                        grid;

                    place-items:
                        center;

                    border:
                        1px solid
                        rgba(8,214,155,.11);

                    border-radius:
                        10px;

                    background:
                        rgba(8,214,155,.065);

                    color:
                        var(--green);

                }


                .bb-highlight-title {

                    color:
                        #D7DEE7;

                    font-size:
                        11px;

                    line-height:
                        1.35;

                    font-weight:
                        750;

                }


                .bb-highlight-text {

                    margin-top:
                        3px;

                    color:
                        #65748A;

                    font-size:
                        9px;

                    line-height:
                        1.4;

                }


                /* =================================================
                   LOGIN CARD
                ================================================= */

                .bb-login-card {

                    position:
                        relative;

                    overflow:
                        hidden;

                    padding:
                        34px;

                    border:
                        1px solid
                        rgba(148,163,184,.16);

                    border-radius:
                        20px;

                    background:
                        linear-gradient(
                            145deg,
                            rgba(15,28,46,.98),
                            rgba(8,17,30,.98)
                        );

                    box-shadow:
                        0 35px 90px
                        rgba(0,0,0,.42);

                }


                .bb-login-card::before {

                    content:
                        "";

                    position:
                        absolute;

                    top:
                        0;

                    left:
                        15%;

                    right:
                        15%;

                    height:
                        1px;

                    background:
                        linear-gradient(
                            90deg,
                            transparent,
                            rgba(8,214,155,.48),
                            rgba(34,211,238,.34),
                            transparent
                        );

                }


                .bb-login-card-glow {

                    position:
                        absolute;

                    width:
                        180px;

                    height:
                        180px;

                    right:
                        -100px;

                    top:
                        -100px;

                    border-radius:
                        50%;

                    background:
                        rgba(8,214,155,.055);

                    filter:
                        blur(50px);

                    pointer-events:
                        none;

                }


                .bb-login-card-header {

                    position:
                        relative;

                    z-index:
                        1;

                    display:
                        flex;

                    align-items:
                        center;

                    gap:
                        14px;

                    margin-bottom:
                        28px;

                }


                .bb-login-icon {

                    width:
                        48px;

                    height:
                        48px;

                    min-width:
                        48px;

                    display:
                        grid;

                    place-items:
                        center;

                    border:
                        1px solid
                        rgba(8,214,155,.17);

                    border-radius:
                        12px;

                    background:
                        rgba(8,214,155,.075);

                    color:
                        var(--green);

                }


                .bb-login-card-heading h2 {

                    margin:
                        0;

                    color:
                        #F4F7F9;

                    font-size:
                        24px;

                    line-height:
                        1.2;

                    letter-spacing:
                        -.55px;

                    font-weight:
                        800;

                }


                .bb-login-card-header p {

                    margin:
                        5px 0 0;

                    color:
                        #728197;

                    font-size:
                        11px;

                    line-height:
                        1.4;

                }


                /* =================================================
                   ERROR
                ================================================= */

                .bb-login-error {

                    position:
                        relative;

                    z-index:
                        1;

                    display:
                        flex;

                    align-items:
                        flex-start;

                    gap:
                        9px;

                    padding:
                        12px 13px;

                    margin:
                        0 0 19px;

                    border:
                        1px solid
                        rgba(248,113,113,.20);

                    border-radius:
                        9px;

                    background:
                        rgba(127,29,29,.17);

                    color:
                        #FDA4AF;

                    font-size:
                        10px;

                    line-height:
                        1.5;

                }


                .bb-error-dot {

                    width:
                        7px;

                    height:
                        7px;

                    min-width:
                        7px;

                    margin-top:
                        4px;

                    border-radius:
                        50%;

                    background:
                        #FB7185;

                }


                /* =================================================
                   FORM FIELDS
                ================================================= */

                .bb-field {

                    margin-bottom:
                        20px;

                }


                .bb-field label {

                    display:
                        block;

                    margin-bottom:
                        8px;

                    color:
                        #B2BECC;

                    font-size:
                        11px;

                    line-height:
                        1.35;

                    font-weight:
                        700;

                }


                .bb-login-page .bb-input-wrapper {

                    width:
                        100%;

                    height:
                        50px;

                    min-height:
                        50px;

                    display:
                        flex;

                    align-items:
                        center;

                    gap:
                        10px;

                    padding:
                        0 13px;

                    border:
                        1px solid
                        rgba(148,163,184,.15);

                    outline:
                        none;

                    border-radius:
                        10px;

                    background:
                        rgba(3,10,21,.72);

                    box-shadow:
                        none;

                    transition:
                        border-color .2s ease,
                        background .2s ease,
                        box-shadow .2s ease;

                }


                .bb-login-page .bb-input-wrapper:hover {

                    border-color:
                        rgba(148,163,184,.25);

                }


                .bb-login-page
                .bb-input-wrapper:focus-within {

                    border-color:
                        rgba(8,214,155,.55);

                    background:
                        rgba(3,12,22,.88);

                    box-shadow:
                        0 0 0 3px
                        rgba(8,214,155,.07),
                        0 0 24px
                        rgba(8,214,155,.045);

                }


                .bb-login-page .bb-input-icon {

                    flex-shrink:
                        0;

                    color:
                        #62728A;

                }


                .bb-login-page
                .bb-input-wrapper:focus-within
                .bb-input-icon {

                    color:
                        var(--green);

                }


                .bb-login-page
                .bb-input-wrapper
                input,
                .bb-login-page
                .bb-input-wrapper
                input:hover,
                .bb-login-page
                .bb-input-wrapper
                input:focus,
                .bb-login-page
                .bb-input-wrapper
                input:active,
                .bb-login-page
                .bb-input-wrapper
                input:focus-visible {

                    flex:
                        1;

                    min-width:
                        0;

                    width:
                        100%;

                    height:
                        100%;

                    min-height:
                        0;

                    margin:
                        0;

                    padding:
                        0;

                    border:
                        0 !important;

                    outline:
                        0 !important;

                    box-shadow:
                        none !important;

                    background:
                        transparent !important;

                    appearance:
                        none;

                    -webkit-appearance:
                        none;

                    color:
                        #F1F5F9;

                    font-family:
                        inherit;

                    font-size:
                        13px;

                    line-height:
                        1.4;

                    font-weight:
                        550;

                    text-decoration:
                        none;

                }


                .bb-login-page
                .bb-input-wrapper
                input::placeholder {

                    color:
                        #526176;

                    opacity:
                        1;

                }


                .bb-login-page
                .bb-input-wrapper
                input:disabled {

                    opacity:
                        .55;

                    cursor:
                        not-allowed;

                }


                /* =================================================
                   PASSWORD TOGGLE
                ================================================= */

                .bb-login-page .bb-password-toggle {

                    width:
                        30px;

                    height:
                        30px;

                    min-width:
                        30px;

                    max-width:
                        30px;

                    display:
                        grid;

                    place-items:
                        center;

                    flex-shrink:
                        0;

                    margin:
                        0;

                    padding:
                        0;

                    border:
                        0 !important;

                    outline:
                        0;

                    border-radius:
                        7px;

                    background:
                        transparent !important;

                    box-shadow:
                        none !important;

                    color:
                        #617087;

                    cursor:
                        pointer;

                }


                .bb-login-page
                .bb-password-toggle:hover {

                    color:
                        #D5DEE8;

                    background:
                        rgba(255,255,255,.04) !important;

                }


                /* =================================================
                   SUBMIT
                ================================================= */

                .bb-login-submit {

                    width:
                        100%;

                    height:
                        51px;

                    margin-top:
                        3px;

                    display:
                        flex;

                    align-items:
                        center;

                    justify-content:
                        center;

                    gap:
                        9px;

                    border:
                        0;

                    border-radius:
                        10px;

                    background:
                        linear-gradient(
                            100deg,
                            #08D69B,
                            #10D6A7 48%,
                            #22D3EE
                        );

                    color:
                        #03131A;

                    font-family:
                        inherit;

                    font-size:
                        12px;

                    font-weight:
                        850;

                    cursor:
                        pointer;

                    box-shadow:
                        0 12px 30px
                        rgba(8,214,155,.13);

                    transition:
                        transform .2s ease,
                        box-shadow .2s ease,
                        filter .2s ease;

                }


                .bb-login-submit:hover:not(:disabled) {

                    transform:
                        translateY(-2px);

                    filter:
                        brightness(1.035);

                    box-shadow:
                        0 18px 38px
                        rgba(8,214,155,.20);

                }


                .bb-login-submit:active:not(:disabled) {

                    transform:
                        translateY(0);

                }


                .bb-login-submit:disabled {

                    cursor:
                        wait;

                    opacity:
                        .72;

                }


                .bb-spinner {

                    width:
                        15px;

                    height:
                        15px;

                    border:
                        2px solid
                        rgba(3,19,26,.24);

                    border-top-color:
                        #03131A;

                    border-radius:
                        50%;

                    animation:
                        bb-login-spin .7s
                        linear infinite;

                }


                @keyframes bb-login-spin {

                    to {

                        transform:
                            rotate(360deg);

                    }

                }


                /* =================================================
                   DIVIDER
                ================================================= */

                .bb-login-divider {

                    display:
                        flex;

                    align-items:
                        center;

                    gap:
                        11px;

                    margin:
                        25px 0 16px;

                    color:
                        #536176;

                    font-size:
                        9px;

                    line-height:
                        1.3;

                    letter-spacing:
                        .7px;

                }


                .bb-login-divider::before,
                .bb-login-divider::after {

                    content:
                        "";

                    flex:
                        1;

                    height:
                        1px;

                    background:
                        rgba(148,163,184,.09);

                }


                .bb-login-divider span {

                    white-space:
                        nowrap;

                }


                /* =================================================
                   GOOGLE LOGIN
                ================================================= */

                .bb-google-login {

                    position:
                        relative;

                    width:
                        100%;

                    min-height:
                        44px;

                    display:
                        flex;

                    align-items:
                        center;

                    justify-content:
                        center;

                    overflow:
                        hidden;

                }


                .bb-google-login > div {

                    width:
                        100% !important;

                    max-width:
                        100% !important;

                }


                .bb-google-login iframe {

                    max-width:
                        100% !important;

                }


                .bb-google-loading {

                    width:
                        100%;

                    height:
                        44px;

                    display:
                        flex;

                    align-items:
                        center;

                    justify-content:
                        center;

                    gap:
                        9px;

                    border:
                        1px solid
                        rgba(148,163,184,.14);

                    border-radius:
                        9px;

                    background:
                        rgba(255,255,255,.025);

                    color:
                        #B7C3D1;

                    font-size:
                        11px;

                    font-weight:
                        650;

                }


                /* =================================================
                   REGISTER
                ================================================= */

                .bb-register-divider {

                    margin-top:
                        25px;

                }


                .bb-register-button {

                    width:
                        100%;

                    height:
                        47px;

                    display:
                        flex;

                    align-items:
                        center;

                    justify-content:
                        center;

                    gap:
                        8px;

                    border:
                        1px solid
                        rgba(148,163,184,.14);

                    border-radius:
                        9px;

                    background:
                        rgba(255,255,255,.018);

                    color:
                        #B7C3D1;

                    text-decoration:
                        none;

                    font-size:
                        11px;

                    font-weight:
                        700;

                    transition:
                        color .2s ease,
                        border-color .2s ease,
                        background .2s ease,
                        transform .2s ease;

                }


                .bb-register-button:hover {

                    color:
                        #F4F7F9;

                    border-color:
                        rgba(8,214,155,.22);

                    background:
                        rgba(8,214,155,.045);

                    transform:
                        translateY(-1px);

                }


                /* =================================================
                   SECURITY
                ================================================= */

                .bb-login-security {

                    display:
                        flex;

                    align-items:
                        center;

                    justify-content:
                        center;

                    gap:
                        6px;

                    margin-top:
                        21px;

                    color:
                        #526176;

                    font-size:
                        9px;

                    line-height:
                        1.35;

                }


                .bb-login-security svg {

                    color:
                        var(--green);

                }


                /* =================================================
                   FOOTER
                ================================================= */

                .bb-login-footer {

                    min-height:
                        58px;

                    flex-shrink:
                        0;

                    padding:
                        0 clamp(24px, 5vw, 72px);

                    display:
                        flex;

                    align-items:
                        center;

                    justify-content:
                        space-between;

                    position:
                        relative;

                    z-index:
                        5;

                    border-top:
                        1px solid
                        rgba(148,163,184,.07);

                    color:
                        #4E5D73;

                    font-size:
                        9px;

                    line-height:
                        1.3;

                }


                /* =================================================
                   ACCESSIBILITY
                ================================================= */

                .bb-login-page
                button:focus-visible,
                .bb-login-page
                a:focus-visible {

                    outline:
                        2px solid
                        rgba(8,214,155,.65);

                    outline-offset:
                        3px;

                }


                .bb-login-page
                input:focus-visible {

                    outline:
                        none !important;

                }


                /* =================================================
                   TABLET
                ================================================= */

                @media (max-width: 1000px) {

                    .bb-login-main {

                        grid-template-columns:
                            minmax(0, 1fr)
                            400px;

                        gap:
                            45px;

                        padding:
                            55px 28px;

                    }


                    .bb-login-story h1 {

                        font-size:
                            clamp(44px, 5vw, 60px);

                    }

                }


                /* =================================================
                   MOBILE
                ================================================= */

                @media (max-width: 820px) {

                    .bb-login-main {

                        grid-template-columns:
                            1fr;

                        max-width:
                            600px;

                        gap:
                            42px;

                        padding:
                            50px 24px;

                    }


                    .bb-login-story {

                        max-width:
                            100%;

                        text-align:
                            center;

                    }


                    .bb-story-badge {

                        margin:
                            0 auto;

                    }


                    .bb-login-story h1 {

                        font-size:
                            clamp(45px, 10vw, 60px);

                        letter-spacing:
                            -2.5px;

                    }


                    .bb-login-description {

                        margin-left:
                            auto;

                        margin-right:
                            auto;

                    }


                    .bb-login-highlights {

                        width:
                            fit-content;

                        margin-left:
                            auto;

                        margin-right:
                            auto;

                        text-align:
                            left;

                    }

                }


                /* =================================================
                   SMALL MOBILE
                ================================================= */

                @media (max-width: 520px) {

                    .bb-login-header {

                        height:
                            68px;

                        padding:
                            0 18px;

                    }


                    .bb-login-brand-name {

                        font-size:
                            15px;

                    }


                    .bb-login-brand-mark {

                        width:
                            35px;

                        height:
                            35px;

                    }


                    .bb-back-home span {

                        display:
                            none;

                    }


                    .bb-login-main {

                        padding:
                            40px 17px;

                        gap:
                            34px;

                    }


                    .bb-login-story h1 {

                        font-size:
                            43px;

                        letter-spacing:
                            -2.2px;

                    }


                    .bb-login-description {

                        font-size:
                            12px;

                        line-height:
                            1.75;

                    }


                    .bb-login-card {

                        padding:
                            26px 21px;

                        border-radius:
                            17px;

                    }


                    .bb-login-card-heading h2 {

                        font-size:
                            22px;

                    }


                    .bb-login-card-header p {

                        font-size:
                            10px;

                    }


                    .bb-login-footer {

                        min-height:
                            64px;

                        padding:
                            15px 18px;

                        gap:
                            8px;

                        flex-wrap:
                            wrap;

                    }

                }


                /* =================================================
                   VERY SMALL SCREENS
                ================================================= */

                @media (max-width: 360px) {

                    .bb-login-main {

                        padding:
                            32px 14px;

                    }


                    .bb-login-story h1 {

                        font-size:
                            37px;

                    }


                    .bb-login-card {

                        padding:
                            23px 18px;

                    }

                }


                /* =================================================
                   REDUCED MOTION
                ================================================= */

                @media (
                    prefers-reduced-motion: reduce
                ) {

                    .bb-login-page *,
                    .bb-login-page *::before,
                    .bb-login-page *::after {

                        animation:
                            none !important;

                        transition:
                            none !important;

                    }

                }

            `}</style>

        </div>
    );
}


/* =========================================================
   LOGIN HIGHLIGHT
========================================================= */

function LoginHighlight({
    icon,
    title,
    text,
}) {

    return (

        <div className="bb-login-highlight">

            <div className="bb-highlight-icon">
                {icon}
            </div>

            <div>

                <div className="bb-highlight-title">
                    {title}
                </div>

                <div className="bb-highlight-text">
                    {text}
                </div>

            </div>

        </div>
    );
}