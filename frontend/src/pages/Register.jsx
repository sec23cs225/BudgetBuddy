import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    ArrowLeft,
    ArrowRight,
    Check,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    PiggyBank,
    ShieldCheck,
    Sparkles,
    Target,
    UserRound,
} from "lucide-react";

import { registerUser } from "../services/authService";


export default function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    const [successMessage, setSuccessMessage] =
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

        if (successMessage) {
            setSuccessMessage("");
        }
    };


    /* =========================================================
       PASSWORD STRENGTH
    ========================================================= */

    const password =
        formData.password;

    const passwordChecks = {
        length:
            password.length >= 8,

        letter:
            /[A-Za-z]/.test(password),

        number:
            /\d/.test(password),
    };

    const passwordScore =
        Object.values(passwordChecks)
            .filter(Boolean)
            .length;


    const passwordStrength =
        passwordScore === 0
            ? ""
            : passwordScore === 1
            ? "Weak"
            : passwordScore === 2
            ? "Good"
            : "Strong";


    /* =========================================================
       SUBMIT
    ========================================================= */

    const handleSubmit = async (event) => {

        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");


        /* =====================================================
           USERNAME VALIDATION
        ===================================================== */

        const username =
            formData.username.trim();

        if (!username) {

            setErrorMessage(
                "Please enter a username."
            );

            return;
        }


        /* =====================================================
           EMAIL VALIDATION
        ===================================================== */

        const email =
            formData.email.trim().toLowerCase();

        if (!email) {

            setErrorMessage(
                "Please enter your email address."
            );

            return;
        }


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            setErrorMessage(
                "Please enter a valid email address."
            );

            return;
        }


        /* =====================================================
           PASSWORD VALIDATION
        ===================================================== */

        if (!formData.password) {

            setErrorMessage(
                "Please enter a password."
            );

            return;
        }


        if (formData.password.length < 8) {

            setErrorMessage(
                "Password must contain at least 8 characters."
            );

            return;
        }


        /* =====================================================
           CONFIRM PASSWORD
        ===================================================== */

        if (!formData.confirmPassword) {

            setErrorMessage(
                "Please confirm your password."
            );

            return;
        }


        if (
            formData.password !==
            formData.confirmPassword
        ) {

            setErrorMessage(
                "Passwords do not match."
            );

            return;
        }


        setLoading(true);


        try {

            /* =================================================
               REGISTRATION DATA
            =================================================

               confirmPassword is intentionally NOT sent
               to the backend.

               Email is now included because it is required
               by the Django RegisterSerializer.
            ================================================= */

            const registrationData = {

                username:
                    username,

                email:
                    email,

                password:
                    formData.password,
            };


            await registerUser(
                registrationData
            );


            /* =================================================
               SUCCESS
            ================================================= */

            setSuccessMessage(
                "Account created successfully. Redirecting to login..."
            );


            setFormData({
                username: "",
                email: "",
                password: "",
                confirmPassword: "",
            });


            window.setTimeout(() => {

                navigate(
                    "/login",
                    {
                        replace: true,
                    }
                );

            }, 900);


        } catch (error) {

            console.error(
                "Registration failed:",
                error.response?.data ||
                error.message
            );


            const backendError =
                error.response?.data;


            let message =
                "Unable to create your account. Please try again.";


            /* =================================================
               BACKEND ERROR HANDLING
            ================================================= */

            if (
                typeof backendError ===
                "string"
            ) {

                message =
                    backendError;

            } else if (
                backendError?.detail
            ) {

                message =
                    backendError.detail;

            } else if (
                backendError?.username
            ) {

                message =
                    Array.isArray(
                        backendError.username
                    )
                        ? backendError.username[0]
                        : backendError.username;

            } else if (
                backendError?.email
            ) {

                message =
                    Array.isArray(
                        backendError.email
                    )
                        ? backendError.email[0]
                        : backendError.email;

            } else if (
                backendError?.password
            ) {

                message =
                    Array.isArray(
                        backendError.password
                    )
                        ? backendError.password[0]
                        : backendError.password;

            } else if (
                backendError?.non_field_errors
            ) {

                message =
                    Array.isArray(
                        backendError.non_field_errors
                    )
                        ? backendError.non_field_errors[0]
                        : backendError.non_field_errors;
            }


            setErrorMessage(
                message
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="bb-register-page">

            {/* =================================================
                AMBIENT BACKGROUND
            ================================================= */}

            <div
                className="
                    bb-register-glow
                    bb-register-glow-one
                "
            />

            <div
                className="
                    bb-register-glow
                    bb-register-glow-two
                "
            />


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="bb-register-header">

                <Link
                    to="/"
                    className="bb-register-brand"
                >

                    <div className="bb-register-brand-mark">
                        B
                    </div>

                    <div>

                        <div className="bb-register-brand-name">
                            BudgetBuddy
                        </div>

                        <div className="bb-register-brand-sub">
                            PERSONAL FINANCE
                        </div>

                    </div>

                </Link>


                <Link
                    to="/"
                    className="bb-register-home-link"
                >

                    <ArrowLeft
                        size={14}
                    />

                    Back to home

                </Link>

            </header>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="bb-register-main">


                {/* =================================================
                    BRAND STORY
                ================================================= */}

                <section className="bb-register-story">

                    <div className="bb-register-badge">

                        <Sparkles
                            size={13}
                        />

                        BUILD YOUR FINANCIAL FUTURE

                    </div>


                    <h1>

                        Start your
                        <br />

                        <span>
                            smarter money journey.
                        </span>

                    </h1>


                    <p>

                        Create your BudgetBuddy account
                        and bring your income, expenses,
                        budgets and savings goals into one
                        beautifully organized financial
                        workspace.

                    </p>


                    {/* BENEFITS */}

                    <div className="bb-register-benefits">

                        <RegisterBenefit
                            icon={
                                <WalletIcon />
                            }
                            title="Know where your money goes"
                            text="Track income and expenses in one place."
                        />

                        <RegisterBenefit
                            icon={
                                <Target
                                    size={17}
                                />
                            }
                            title="Build better financial habits"
                            text="Create budgets and stay within your limits."
                        />

                        <RegisterBenefit
                            icon={
                                <PiggyBank
                                    size={17}
                                />
                            }
                            title="Turn goals into progress"
                            text="Plan savings and watch them grow."
                        />

                    </div>


                    {/* QUOTE */}

                    <div className="bb-register-quote">

                        <div className="bb-quote-line" />

                        <div>

                            <p>
                                "Financial clarity starts
                                with knowing where you stand."
                            </p>

                            <span>
                                — BudgetBuddy
                            </span>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    REGISTRATION CARD
                ================================================= */}

                <section className="bb-register-card">

                    <div className="bb-register-card-header">

                        <div className="bb-register-card-icon">

                            <UserRound
                                size={20}
                            />

                        </div>

                        <div>

                            <h2>
                                Create account
                            </h2>

                            <p>
                                Your financial workspace
                                starts here.
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {errorMessage && (

                        <div
                            className="bb-register-error"
                            role="alert"
                        >

                            <span className="bb-error-dot" />

                            <span>
                                {errorMessage}
                            </span>

                        </div>

                    )}


                    {/* =================================================
                        SUCCESS
                    ================================================= */}

                    {successMessage && (

                        <div
                            className="bb-register-success"
                            role="status"
                        >

                            <Check
                                size={15}
                            />

                            <span>
                                {successMessage}
                            </span>

                        </div>

                    )}


                    {/* =================================================
                        FORM
                    ================================================= */}

                    <form
                        onSubmit={handleSubmit}
                        noValidate
                    >


                        {/* =================================================
                            USERNAME
                        ================================================= */}

                        <div className="bb-register-field">

                            <label htmlFor="username">
                                Username
                            </label>

                            <div className="bb-register-input">

                                <UserRound
                                    size={16}
                                    className="
                                        bb-register-input-icon
                                    "
                                />

                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    placeholder="Choose your username"
                                    value={
                                        formData.username
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    autoComplete="username"
                                    disabled={loading}
                                    autoFocus
                                />

                            </div>

                        </div>


                        {/* =================================================
                            EMAIL
                        ================================================= */}

                        <div className="bb-register-field">

                            <label htmlFor="email">
                                Email address
                            </label>

                            <div className="bb-register-input">

                                <Mail
                                    size={16}
                                    className="
                                        bb-register-input-icon
                                    "
                                />

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email address"
                                    value={
                                        formData.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    autoComplete="email"
                                    inputMode="email"
                                    spellCheck="false"
                                    disabled={loading}
                                />

                            </div>

                        </div>


                        {/* =================================================
                            PASSWORD
                        ================================================= */}

                        <div className="bb-register-field">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="bb-register-input">

                                <LockKeyhole
                                    size={16}
                                    className="
                                        bb-register-input-icon
                                    "
                                />

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    placeholder="Create a secure password"
                                    value={
                                        formData.password
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    autoComplete="new-password"
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="
                                        bb-register-password-toggle
                                    "
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
                                    disabled={loading}
                                >

                                    {showPassword ? (

                                        <EyeOff
                                            size={16}
                                        />

                                    ) : (

                                        <Eye
                                            size={16}
                                        />

                                    )}

                                </button>

                            </div>


                            {/* PASSWORD STRENGTH */}

                            {password.length > 0 && (

                                <div className="bb-password-strength">

                                    <div className="bb-strength-bars">

                                        <span
                                            className={
                                                passwordScore >= 1
                                                    ? "active"
                                                    : ""
                                            }
                                        />

                                        <span
                                            className={
                                                passwordScore >= 2
                                                    ? "active"
                                                    : ""
                                            }
                                        />

                                        <span
                                            className={
                                                passwordScore >= 3
                                                    ? "active"
                                                    : ""
                                            }
                                        />

                                    </div>

                                    <span>
                                        {passwordStrength}
                                    </span>

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            CONFIRM PASSWORD
                        ================================================= */}

                        <div className="bb-register-field">

                            <label htmlFor="confirmPassword">
                                Confirm password
                            </label>

                            <div
                                className={`
                                    bb-register-input
                                    ${
                                        formData.confirmPassword &&
                                        formData.password ===
                                            formData.confirmPassword
                                            ? "bb-input-valid"
                                            : ""
                                    }
                                `}
                            >

                                <LockKeyhole
                                    size={16}
                                    className="
                                        bb-register-input-icon
                                    "
                                />

                                <input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="confirmPassword"
                                    placeholder="Re-enter your password"
                                    value={
                                        formData.confirmPassword
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    autoComplete="new-password"
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="
                                        bb-register-password-toggle
                                    "
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    disabled={loading}
                                >

                                    {showConfirmPassword ? (

                                        <EyeOff
                                            size={16}
                                        />

                                    ) : (

                                        <Eye
                                            size={16}
                                        />

                                    )}

                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            SECURITY
                        ================================================= */}

                        <div className="bb-register-security-note">

                            <ShieldCheck
                                size={14}
                            />

                            <span>
                                Your account is protected
                                with secure authentication.
                            </span>

                        </div>


                        {/* =================================================
                            SUBMIT
                        ================================================= */}

                        <button
                            type="submit"
                            className="bb-register-submit"
                            disabled={
                                loading ||
                                Boolean(successMessage)
                            }
                        >

                            {loading ? (

                                <>
                                    <span className="bb-register-spinner" />

                                    Creating your account...
                                </>

                            ) : (

                                <>
                                    Create my account

                                    <ArrowRight
                                        size={16}
                                    />
                                </>

                            )}

                        </button>

                    </form>


                    {/* =================================================
                        LOGIN
                    ================================================= */}

                    <div className="bb-register-login">

                        <span>
                            Already have an account?
                        </span>

                        <Link to="/login">

                            Sign in

                            <ArrowRight
                                size={13}
                            />

                        </Link>

                    </div>


                    {/* =================================================
                        TERMS
                    ================================================= */}

                    <div className="bb-register-terms">

                        By creating an account, you begin
                        your personal BudgetBuddy workspace.

                    </div>

                </section>

            </main>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="bb-register-footer">

                <span>
                    © {new Date().getFullYear()}
                    {" "}BudgetBuddy
                </span>

                <span>
                    Plan smarter. Spend wiser. Save better.
                </span>

            </footer>


            {/* =================================================
                STYLES
            ================================================= */}

            <style>{`

                /* =================================================
                   GLOBAL ISOLATION
                ================================================= */

                .bb-register-page,
                .bb-register-page *,
                .bb-register-page *::before,
                .bb-register-page *::after {

                    box-sizing:
                        border-box;

                }


                /* =================================================
                   PAGE
                ================================================= */

                .bb-register-page {

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
                            circle at 78% 8%,
                            rgba(25,199,154,.09),
                            transparent 30%
                        ),
                        radial-gradient(
                            circle at 5% 88%,
                            rgba(34,211,238,.05),
                            transparent 28%
                        ),
                        #050b18;

                    color:
                        #f8fafc;

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
                   BACKGROUND GLOW
                ================================================= */

                .bb-register-glow {

                    position:
                        fixed;

                    border-radius:
                        50%;

                    filter:
                        blur(90px);

                    pointer-events:
                        none;

                    z-index:
                        0;

                }


                .bb-register-glow-one {

                    width:
                        330px;

                    height:
                        330px;

                    right:
                        -130px;

                    top:
                        80px;

                    background:
                        rgba(25,199,154,.07);

                }


                .bb-register-glow-two {

                    width:
                        260px;

                    height:
                        260px;

                    left:
                        -130px;

                    bottom:
                        40px;

                    background:
                        rgba(34,211,238,.05);

                }


                /* =================================================
                   HEADER
                ================================================= */

                .bb-register-header {

                    height:
                        76px;

                    flex-shrink:
                        0;

                    padding:
                        0 6%;

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

                    border-bottom:
                        1px solid
                        rgba(148,163,184,.07);

                    background:
                        rgba(5,11,24,.72);

                    backdrop-filter:
                        blur(20px);

                    -webkit-backdrop-filter:
                        blur(20px);

                }


                .bb-register-brand {

                    display:
                        flex;

                    align-items:
                        center;

                    gap:
                        10px;

                    color:
                        inherit;

                    text-decoration:
                        none;

                }


                .bb-register-brand-mark {

                    width:
                        37px;

                    height:
                        37px;

                    display:
                        grid;

                    place-items:
                        center;

                    border-radius:
                        10px;

                    background:
                        linear-gradient(
                            135deg,
                            #19c79a,
                            #22d3ee
                        );

                    color:
                        #03121a;

                    font-size:
                        16px;

                    font-weight:
                        900;

                    box-shadow:
                        0 8px 25px
                        rgba(25,199,154,.13);

                }


                .bb-register-brand-name {

                    font-size:
                        16px;

                    font-weight:
                        800;

                    letter-spacing:
                        -.2px;

                }


                .bb-register-brand-sub {

                    margin-top:
                        2px;

                    color:
                        #52627c;

                    font-size:
                        7px;

                    font-weight:
                        700;

                    letter-spacing:
                        1.5px;

                }


                .bb-register-home-link {

                    display:
                        flex;

                    align-items:
                        center;

                    gap:
                        7px;

                    color:
                        #68768d;

                    text-decoration:
                        none;

                    font-size:
                        10px;

                    font-weight:
                        600;

                    transition:
                        color .2s ease;

                }


                .bb-register-home-link:hover {

                    color:
                        #f8fafc;

                }


                /* =================================================
                   MAIN
                ================================================= */

                .bb-register-main {

                    flex:
                        1;

                    width:
                        100%;

                    max-width:
                        1180px;

                    margin:
                        0 auto;

                    padding:
                        55px 35px 65px;

                    display:
                        grid;

                    grid-template-columns:
                        minmax(0, 1fr)
                        430px;

                    align-items:
                        center;

                    gap:
                        90px;

                    position:
                        relative;

                    z-index:
                        2;

                }


                /* =================================================
                   STORY
                ================================================= */

                .bb-register-story {

                    max-width:
                        590px;

                }


                .bb-register-badge {

                    width:
                        fit-content;

                    display:
                        inline-flex;

                    align-items:
                        center;

                    gap:
                        7px;

                    padding:
                        7px 11px;

                    border-radius:
                        30px;

                    background:
                        rgba(25,199,154,.055);

                    border:
                        1px solid
                        rgba(25,199,154,.15);

                    color:
                        #19c79a;

                    font-size:
                        8px;

                    line-height:
                        1.2;

                    font-weight:
                        800;

                    letter-spacing:
                        1.3px;

                }


                .bb-register-story h1 {

                    margin:
                        25px 0 0;

                    font-size:
                        clamp(
                            42px,
                            5vw,
                            67px
                        );

                    line-height:
                        1;

                    letter-spacing:
                        -3px;

                    font-weight:
                        850;

                }


                .bb-register-story h1 span {

                    color:
                        transparent;

                    background:
                        linear-gradient(
                            90deg,
                            #19c79a,
                            #22d3ee
                        );

                    -webkit-background-clip:
                        text;

                    background-clip:
                        text;

                    -webkit-text-fill-color:
                        transparent;

                }


                .bb-register-story > p {

                    max-width:
                        510px;

                    margin:
                        24px 0 0;

                    color:
                        #728098;

                    font-size:
                        12px;

                    line-height:
                        1.9;

                }


                /* =================================================
                   BENEFITS
                ================================================= */

                .bb-register-benefits {

                    display:
                        flex;

                    flex-direction:
                        column;

                    gap:
                        10px;

                    margin-top:
                        28px;

                }


                .bb-register-benefit {

                    display:
                        flex;

                    align-items:
                        center;

                    gap:
                        11px;

                }


                .bb-register-benefit-icon {

                    width:
                        35px;

                    height:
                        35px;

                    display:
                        grid;

                    place-items:
                        center;

                    flex-shrink:
                        0;

                    border-radius:
                        9px;

                    color:
                        #19c79a;

                    background:
                        rgba(25,199,154,.07);

                    border:
                        1px solid
                        rgba(25,199,154,.08);

                }


                .bb-register-benefit-title {

                    color:
                        #cbd5e1;

                    font-size:
                        10px;

                    line-height:
                        1.35;

                    font-weight:
                        700;

                }


                .bb-register-benefit-text {

                    margin-top:
                        2px;

                    color:
                        #536178;

                    font-size:
                        8px;

                    line-height:
                        1.4;

                }


                /* =================================================
                   QUOTE
                ================================================= */

                .bb-register-quote {

                    display:
                        flex;

                    align-items:
                        center;

                    gap:
                        12px;

                    margin-top:
                        30px;

                }


                .bb-quote-line {

                    width:
                        2px;

                    height:
                        34px;

                    border-radius:
                        3px;

                    background:
                        linear-gradient(
                            #19c79a,
                            #22d3ee
                        );

                }


                .bb-register-quote p {

                    margin:
                        0;

                    color:
                        #7d8ba1;

                    font-size:
                        9px;

                    line-height:
                        1.5;

                    font-style:
                        italic;

                }


                .bb-register-quote span {

                    display:
                        block;

                    margin-top:
                        4px;

                    color:
                        #435168;

                    font-size:
                        7px;

                }


                /* =================================================
                   REGISTER CARD
                ================================================= */

                .bb-register-card {

                    position:
                        relative;

                    padding:
                        31px;

                    border-radius:
                        18px;

                    background:
                        linear-gradient(
                            145deg,
                            rgba(13,27,47,.95),
                            rgba(7,16,31,.97)
                        );

                    border:
                        1px solid
                        rgba(148,163,184,.11);

                    box-shadow:
                        0 30px 80px
                        rgba(0,0,0,.4);

                    overflow:
                        hidden;

                }


                .bb-register-card::before {

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
                            rgba(25,199,154,.45),
                            rgba(34,211,238,.35),
                            transparent
                        );

                    pointer-events:
                        none;

                }


                .bb-register-card-header {

                    display:
                        flex;

                    align-items:
                        center;

                    gap:
                        12px;

                    margin-bottom:
                        25px;

                }


                .bb-register-card-icon {

                    width:
                        43px;

                    height:
                        43px;

                    display:
                        grid;

                    place-items:
                        center;

                    flex-shrink:
                        0;

                    border-radius:
                        11px;

                    color:
                        #19c79a;

                    background:
                        rgba(25,199,154,.08);

                    border:
                        1px solid
                        rgba(25,199,154,.12);

                }


                .bb-register-card-header h2 {

                    margin:
                        0;

                    color:
                        #f4f7f9;

                    font-size:
                        21px;

                    line-height:
                        1.2;

                    letter-spacing:
                        -.5px;

                    font-weight:
                        800;

                }


                .bb-register-card-header p {

                    margin:
                        4px 0 0;

                    color:
                        #5e6c83;

                    font-size:
                        9px;

                    line-height:
                        1.4;

                }


                /* =================================================
                   FEEDBACK
                ================================================= */

                .bb-register-error,
                .bb-register-success {

                    display:
                        flex;

                    align-items:
                        flex-start;

                    gap:
                        8px;

                    padding:
                        10px 12px;

                    margin-bottom:
                        17px;

                    border-radius:
                        8px;

                    font-size:
                        9px;

                    line-height:
                        1.5;

                }


                .bb-register-error {

                    color:
                        #fca5a5;

                    background:
                        rgba(127,29,29,.18);

                    border:
                        1px solid
                        rgba(248,113,113,.16);

                }


                .bb-register-success {

                    color:
                        #6ee7b7;

                    background:
                        rgba(6,78,59,.18);

                    border:
                        1px solid
                        rgba(52,211,153,.16);

                }


                .bb-error-dot {

                    width:
                        6px;

                    height:
                        6px;

                    margin-top:
                        4px;

                    flex-shrink:
                        0;

                    border-radius:
                        50%;

                    background:
                        #f87171;

                }


                /* =================================================
                   FORM
                ================================================= */

                .bb-register-field {

                    margin-bottom:
                        17px;

                }


                .bb-register-field label {

                    display:
                        block;

                    margin-bottom:
                        7px;

                    color:
                        #94a3b8;

                    font-size:
                        9px;

                    line-height:
                        1.35;

                    font-weight:
                        700;

                }


                .bb-register-input {

                    width:
                        100%;

                    height:
                        46px;

                    min-height:
                        46px;

                    display:
                        flex;

                    align-items:
                        center;

                    gap:
                        9px;

                    padding:
                        0 12px;

                    border-radius:
                        9px;

                    background:
                        rgba(4,12,26,.72);

                    border:
                        1px solid
                        rgba(148,163,184,.11);

                    transition:
                        border-color .2s ease,
                        box-shadow .2s ease,
                        background .2s ease;

                }


                .bb-register-input:hover {

                    border-color:
                        rgba(148,163,184,.20);

                }


                .bb-register-input:focus-within {

                    border-color:
                        rgba(25,199,154,.45);

                    background:
                        rgba(4,13,27,.82);

                    box-shadow:
                        0 0 0 3px
                        rgba(25,199,154,.06);

                }


                .bb-register-input.bb-input-valid {

                    border-color:
                        rgba(25,199,154,.28);

                }


                .bb-register-input-icon {

                    color:
                        #52627a;

                    flex-shrink:
                        0;

                    transition:
                        color .2s ease;

                }


                .bb-register-input:focus-within
                .bb-register-input-icon {

                    color:
                        #19c79a;

                }


                .bb-register-input input {

                    flex:
                        1;

                    min-width:
                        0;

                    width:
                        100%;

                    height:
                        100%;

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

                    color:
                        #f1f5f9;

                    font-family:
                        inherit;

                    font-size:
                        11px;

                    line-height:
                        1.4;

                    font-weight:
                        550;

                    appearance:
                        none;

                    -webkit-appearance:
                        none;

                }


                .bb-register-input input::placeholder {

                    color:
                        #3f4d63;

                    opacity:
                        1;

                }


                .bb-register-input input:disabled {

                    opacity:
                        .6;

                    cursor:
                        not-allowed;

                }


                /* =================================================
                   PASSWORD TOGGLE
                ================================================= */

                .bb-register-password-toggle {

                    width:
                        28px;

                    height:
                        28px;

                    min-width:
                        28px;

                    display:
                        grid;

                    place-items:
                        center;

                    flex-shrink:
                        0;

                    padding:
                        0;

                    margin:
                        0;

                    border:
                        0 !important;

                    outline:
                        0;

                    border-radius:
                        6px;

                    background:
                        transparent !important;

                    color:
                        #52627a;

                    cursor:
                        pointer;

                }


                .bb-register-password-toggle:hover {

                    color:
                        #a7b4c7;

                    background:
                        rgba(255,255,255,.035) !important;

                }


                /* =================================================
                   PASSWORD STRENGTH
                ================================================= */

                .bb-password-strength {

                    display:
                        flex;

                    align-items:
                        center;

                    gap:
                        8px;

                    margin-top:
                        7px;

                    color:
                        #5d6c82;

                    font-size:
                        7px;

                    line-height:
                        1.3;

                }


                .bb-strength-bars {

                    display:
                        flex;

                    gap:
                        3px;

                    flex:
                        1;

                }


                .bb-strength-bars span {

                    height:
                        3px;

                    flex:
                        1;

                    border-radius:
                        5px;

                    background:
                        #1c2a3e;

                }


                .bb-strength-bars span.active {

                    background:
                        linear-gradient(
                            90deg,
                            #19c79a,
                            #22d3ee
                        );

                }


                /* =================================================
                   SECURITY
                ================================================= */

                .bb-register-security-note {

                    display:
                        flex;

                    align-items:
                        center;

                    gap:
                        6px;

                    margin:
                        4px 0 17px;

                    color:
                        #536178;

                    font-size:
                        8px;

                    line-height:
                        1.4;

                }


                .bb-register-security-note svg {

                    color:
                        #19c79a;

                    flex-shrink:
                        0;

                }


                /* =================================================
                   SUBMIT
                ================================================= */

                .bb-register-submit {

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
                        0;

                    border-radius:
                        9px;

                    cursor:
                        pointer;

                    color:
                        #03121a;

                    background:
                        linear-gradient(
                            135deg,
                            #19c79a,
                            #22d3ee
                        );

                    font-family:
                        inherit;

                    font-size:
                        10px;

                    line-height:
                        1.2;

                    font-weight:
                        850;

                    box-shadow:
                        0 12px 28px
                        rgba(25,199,154,.10);

                    transition:
                        transform .2s ease,
                        box-shadow .2s ease,
                        filter .2s ease;

                }


                .bb-register-submit:hover:not(:disabled) {

                    transform:
                        translateY(-2px);

                    filter:
                        brightness(1.03);

                    box-shadow:
                        0 17px 35px
                        rgba(25,199,154,.17);

                }


                .bb-register-submit:active:not(:disabled) {

                    transform:
                        translateY(0);

                }


                .bb-register-submit:disabled {

                    cursor:
                        wait;

                    opacity:
                        .72;

                }


                .bb-register-spinner {

                    width:
                        13px;

                    height:
                        13px;

                    border-radius:
                        50%;

                    border:
                        2px solid
                        rgba(3,18,26,.25);

                    border-top-color:
                        #03121a;

                    animation:
                        bb-register-spin
                        .7s linear infinite;

                }


                @keyframes bb-register-spin {

                    to {

                        transform:
                            rotate(360deg);

                    }

                }


                /* =================================================
                   LOGIN
                ================================================= */

                .bb-register-login {

                    display:
                        flex;

                    align-items:
                        center;

                    justify-content:
                        center;

                    gap:
                        6px;

                    margin-top:
                        20px;

                    color:
                        #526078;

                    font-size:
                        8px;

                    line-height:
                        1.4;

                }


                .bb-register-login a {

                    display:
                        flex;

                    align-items:
                        center;

                    gap:
                        4px;

                    color:
                        #19c79a;

                    text-decoration:
                        none;

                    font-weight:
                        750;

                    transition:
                        color .2s ease;

                }


                .bb-register-login a:hover {

                    color:
                        #22d3ee;

                }


                /* =================================================
                   TERMS
                ================================================= */

                .bb-register-terms {

                    margin-top:
                        17px;

                    text-align:
                        center;

                    color:
                        #3f4d63;

                    font-size:
                        7px;

                    line-height:
                        1.6;

                }


                /* =================================================
                   FOOTER
                ================================================= */

                .bb-register-footer {

                    min-height:
                        60px;

                    flex-shrink:
                        0;

                    padding:
                        0 6%;

                    display:
                        flex;

                    align-items:
                        center;

                    justify-content:
                        space-between;

                    color:
                        #3e4c62;

                    font-size:
                        8px;

                    line-height:
                        1.3;

                    border-top:
                        1px solid
                        rgba(148,163,184,.06);

                    position:
                        relative;

                    z-index:
                        2;

                }


                /* =================================================
                   ACCESSIBILITY
                ================================================= */

                .bb-register-page
                button:focus-visible,
                .bb-register-page
                a:focus-visible {

                    outline:
                        2px solid
                        rgba(25,199,154,.65);

                    outline-offset:
                        3px;

                }


                /* =================================================
                   RESPONSIVE
                ================================================= */

                @media (max-width: 900px) {

                    .bb-register-main {

                        grid-template-columns:
                            1fr;

                        max-width:
                            620px;

                        gap:
                            45px;

                        padding:
                            50px 30px 60px;

                    }


                    .bb-register-story {

                        max-width:
                            100%;

                        text-align:
                            center;

                    }


                    .bb-register-badge {

                        margin:
                            0 auto;

                    }


                    .bb-register-story > p {

                        margin-left:
                            auto;

                        margin-right:
                            auto;

                    }


                    .bb-register-benefits {

                        align-items:
                            flex-start;

                        width:
                            fit-content;

                        margin-left:
                            auto;

                        margin-right:
                            auto;

                        text-align:
                            left;

                    }


                    .bb-register-quote {

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


                @media (max-width: 600px) {

                    .bb-register-header {

                        padding:
                            0 20px;

                    }


                    .bb-register-main {

                        padding:
                            42px 20px 50px;

                    }


                    .bb-register-story h1 {

                        font-size:
                            43px;

                        letter-spacing:
                            -2px;

                    }


                    .bb-register-story > p {

                        font-size:
                            11px;

                    }


                    .bb-register-card {

                        padding:
                            24px;

                    }


                    .bb-register-footer {

                        padding:
                            18px 20px;

                        gap:
                            8px;

                        flex-wrap:
                            wrap;

                    }

                }


                @media (max-width: 420px) {

                    .bb-register-home-link {

                        font-size:
                            0;

                    }


                    .bb-register-home-link svg {

                        width:
                            16px;

                        height:
                            16px;

                    }


                    .bb-register-story h1 {

                        font-size:
                            38px;

                    }


                    .bb-register-card {

                        padding:
                            21px;

                    }

                }


                /* =================================================
                   REDUCED MOTION
                ================================================= */

                @media (
                    prefers-reduced-motion: reduce
                ) {

                    .bb-register-page *,
                    .bb-register-page *::before,
                    .bb-register-page *::after {

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


/* =============================================================
   BENEFIT COMPONENT
============================================================= */

function RegisterBenefit({
    icon,
    title,
    text,
}) {

    return (

        <div className="bb-register-benefit">

            <div className="bb-register-benefit-icon">
                {icon}
            </div>

            <div>

                <div className="bb-register-benefit-title">
                    {title}
                </div>

                <div className="bb-register-benefit-text">
                    {text}
                </div>

            </div>

        </div>
    );
}


/* =============================================================
   WALLET ICON
============================================================= */

function WalletIcon() {

    return (

        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >

            <path
                d="
                    M20 7V6
                    a2 2 0 0 0-2-2
                    H5
                    a3 3 0 0 0 0 6
                    h15
                    v10
                    a2 2 0 0 1-2 2
                    H5
                    a3 3 0 0 1-3-3
                    V7
                "
            />

            <path d="M16 14h.01" />

        </svg>
    );
}