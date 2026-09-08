import {
    useEffect,
    useState,
} from "react";

import {
    Activity,
    AlertTriangle,
    BellRing,
    CheckCircle2,
    Mail,
    PiggyBank,
    RefreshCw,
    Send,
    ShieldCheck,
    WalletCards,
} from "lucide-react";

import {
    getEmailPreferences,
    updateEmailPreferences,
    sendTestEmail,
} from "../services/notificationEmailService";


const DEFAULT_PREFERENCES = {
    email: "",
    email_enabled: true,
    budget_alerts: true,
    savings_alerts: true,
    spending_alerts: true,
    security_alerts: true,
    important_alerts: true,
};


const PREFERENCE_ITEMS = [
    {
        key: "budget_alerts",
        icon: WalletCards,
        title: "Budget protection",
        description:
            "Get emailed when a budget is approaching or crossing its limit.",
        accent: "#F5C451",
    },

    {
        key: "savings_alerts",
        icon: PiggyBank,
        title: "Savings progress",
        description:
            "Receive important updates when a savings goal reaches a meaningful milestone.",
        accent: "#9B6CFF",
    },

    {
        key: "spending_alerts",
        icon: Activity,
        title: "Spending signals",
        description:
            "Be alerted about important or unusual spending activity.",
        accent: "#FF8A65",
    },

    {
        key: "security_alerts",
        icon: ShieldCheck,
        title: "Security alerts",
        description:
            "Receive important account and security notifications by email.",
        accent: "#FF5864",
    },

    {
        key: "important_alerts",
        icon: BellRing,
        title: "Important financial alerts",
        description:
            "Allow BudgetBuddy to email other high-priority financial updates.",
        accent: "#00D9A6",
    },
];


export default function EmailPreferences() {

    const [
        preferences,
        setPreferences,
    ] = useState(
        DEFAULT_PREFERENCES
    );


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        saving,
        setSaving,
    ] = useState(false);


    const [
        testing,
        setTesting,
    ] = useState(false);


    const [
        status,
        setStatus,
    ] = useState(null);


    useEffect(() => {

        loadPreferences();

    }, []);


    async function loadPreferences() {

        try {

            setLoading(true);

            const response =
                await getEmailPreferences();

            setPreferences({
                ...DEFAULT_PREFERENCES,
                ...(response.data || {}),
            });

        } catch (error) {

            console.error(
                "Email preferences failed:",
                error.response?.data ||
                error
            );

            setStatus({
                type: "error",
                message:
                    "Unable to load email preferences.",
            });

        } finally {

            setLoading(false);

        }
    }


    async function handleToggle(
        key
    ) {

        const nextValue =
            !preferences[key];


        const updated = {
            ...preferences,
            [key]: nextValue,
        };


        setPreferences(
            updated
        );


        try {

            setSaving(true);
            setStatus(null);

            await updateEmailPreferences({
                [key]: nextValue,
            });


            setStatus({
                type: "success",
                message:
                    "Notification preferences updated.",
            });

        } catch (error) {

            console.error(
                error.response?.data ||
                error
            );


            setPreferences(
                preferences
            );


            setStatus({
                type: "error",
                message:
                    "Your preference could not be updated.",
            });

        } finally {

            setSaving(false);
        }
    }


    async function handleMasterToggle() {

        const nextValue =
            !preferences.email_enabled;


        setPreferences(
            (previous) => ({
                ...previous,
                email_enabled:
                    nextValue,
            })
        );


        try {

            setSaving(true);
            setStatus(null);

            await updateEmailPreferences({
                email_enabled:
                    nextValue,
            });


            setStatus({
                type: "success",
                message:
                    nextValue
                        ? "Email intelligence enabled."
                        : "Email intelligence paused.",
            });

        } catch (error) {

            console.error(
                error.response?.data ||
                error
            );


            setPreferences(
                (previous) => ({
                    ...previous,
                    email_enabled:
                        !nextValue,
                })
            );


            setStatus({
                type: "error",
                message:
                    "Unable to update email delivery.",
            });

        } finally {

            setSaving(false);
        }
    }


    async function handleTestEmail() {

        try {

            setTesting(true);
            setStatus(null);

            await sendTestEmail();


            setStatus({
                type: "success",
                message:
                    "Test email sent. Check your inbox.",
            });

        } catch (error) {

            console.error(
                error.response?.data ||
                error
            );


            setStatus({
                type: "error",
                message:
                    error.response?.data?.detail ||
                    "The test email could not be sent.",
            });

        } finally {

            setTesting(false);
        }
    }


    if (loading) {

        return (
            <section className="bb-email-card">

                <div className="bb-email-loading">

                    <RefreshCw
                        size={19}
                        className="bb-email-spin"
                    />

                    <span>
                        Loading email intelligence...
                    </span>

                </div>

                <EmailPreferencesStyles />

            </section>
        );
    }


    return (
        <section className="bb-email-card">

            <EmailPreferencesStyles />


            {/* HERO */}

            <div className="bb-email-hero">

                <div className="bb-email-hero-icon">

                    <Mail size={21} />

                </div>


                <div className="bb-email-hero-copy">

                    <div className="bb-email-eyebrow">

                        <span />

                        EMAIL INTELLIGENCE

                    </div>

                    <h2>
                        Important updates,
                        delivered when they matter.
                    </h2>

                    <p>
                        BudgetBuddy watches for meaningful
                        financial events and sends only the
                        updates worth taking to your inbox.
                    </p>

                </div>


                <div
                    className={
                        `bb-email-status-pill ${
                            preferences.email_enabled
                                ? "enabled"
                                : "paused"
                        }`
                    }
                >

                    <span />

                    {preferences.email_enabled
                        ? "ACTIVE"
                        : "PAUSED"}

                </div>

            </div>


            {/* ACCOUNT */}

            <div className="bb-email-account">

                <div>

                    <span>
                        DELIVERY ADDRESS
                    </span>

                    <strong>
                        {preferences.email ||
                            "No email address configured"}
                    </strong>

                </div>


                <button
                    type="button"
                    onClick={
                        handleTestEmail
                    }
                    disabled={
                        testing ||
                        !preferences.email
                    }
                >

                    {testing ? (
                        <RefreshCw
                            size={14}
                            className="bb-email-spin"
                        />
                    ) : (
                        <Send size={14} />
                    )}

                    {testing
                        ? "Sending..."
                        : "Send test email"}

                </button>

            </div>


            {/* MASTER */}

            <div className="bb-email-master">

                <div className="bb-email-master-icon">

                    {preferences.email_enabled ? (
                        <CheckCircle2
                            size={19}
                        />
                    ) : (
                        <AlertTriangle
                            size={19}
                        />
                    )}

                </div>


                <div>

                    <strong>
                        Financial email intelligence
                    </strong>

                    <p>
                        {preferences.email_enabled
                            ? "BudgetBuddy can send important financial updates to your inbox."
                            : "Email delivery is paused. Your in-app notifications continue to work normally."}
                    </p>

                </div>


                <button
                    type="button"
                    className={
                        `bb-email-toggle ${
                            preferences.email_enabled
                                ? "active"
                                : ""
                        }`
                    }
                    onClick={
                        handleMasterToggle
                    }
                    disabled={
                        saving
                    }
                    aria-label="Toggle email intelligence"
                >

                    <span />

                </button>

            </div>


            {/* PREFERENCES */}

            <div className="bb-email-section-heading">

                <div>

                    <span>
                        DELIVERY CONTROL
                    </span>

                    <small>
                        Choose which financial events deserve an email.
                    </small>

                </div>

            </div>


            <div className="bb-email-preferences">

                {PREFERENCE_ITEMS.map(
                    (item) => {

                        const Icon =
                            item.icon;

                        const enabled =
                            preferences[
                                item.key
                            ];


                        return (
                            <div
                                className={
                                    `bb-email-preference ${
                                        enabled
                                            ? "enabled"
                                            : ""
                                    }`
                                }
                                key={
                                    item.key
                                }
                            >

                                <div
                                    className="bb-email-preference-icon"
                                    style={{
                                        color:
                                            item.accent,
                                        background:
                                            `${item.accent}12`,
                                    }}
                                >
                                    <Icon
                                        size={17}
                                    />
                                </div>


                                <div className="bb-email-preference-copy">

                                    <strong>
                                        {item.title}
                                    </strong>

                                    <span>
                                        {
                                            item.description
                                        }
                                    </span>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        `bb-email-toggle ${
                                            enabled
                                                ? "active"
                                                : ""
                                        }`
                                    }
                                    onClick={() =>
                                        handleToggle(
                                            item.key
                                        )
                                    }
                                    disabled={
                                        saving ||
                                        !preferences.email_enabled
                                    }
                                    aria-label={
                                        `Toggle ${item.title}`
                                    }
                                >

                                    <span />

                                </button>

                            </div>
                        );
                    }
                )}

            </div>


            {/* STATUS */}

            {status && (

                <div
                    className={
                        `bb-email-feedback ${
                            status.type
                        }`
                    }
                >

                    {status.type ===
                    "success" ? (
                        <CheckCircle2
                            size={15}
                        />
                    ) : (
                        <AlertTriangle
                            size={15}
                        />
                    )}

                    <span>
                        {status.message}
                    </span>

                </div>

            )}


            {/* FOOTER */}

            <div className="bb-email-footer">

                <ShieldCheck
                    size={14}
                />

                <span>
                    Your financial data stays inside
                    BudgetBuddy. Emails contain only
                    the information required to explain
                    the specific alert.
                </span>

            </div>

        </section>
    );
}


function EmailPreferencesStyles() {

    return (
        <style>{`

.bb-email-card {

    position: relative;

    width: 100%;

    overflow: hidden;

    border:
        1px solid #232D39;

    border-radius: 18px;

    background:
        linear-gradient(
            145deg,
            #10161E,
            #0C1117
        );

    color: #E7EDF0;

    box-shadow:
        inset 0 1px 0
        rgba(255,255,255,.025),
        0 18px 45px
        rgba(0,0,0,.12);

    font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
}


.bb-email-hero {

    position: relative;

    display: flex;
    align-items: center;

    gap: 16px;

    padding: 25px 24px;

    background:
        radial-gradient(
            circle at 80% 20%,
            rgba(0,217,166,.10),
            transparent 32%
        );

    border-bottom:
        1px solid
        rgba(255,255,255,.055);
}


.bb-email-hero-icon {

    width: 48px;
    height: 48px;

    display: grid;
    place-items: center;

    flex-shrink: 0;

    border:
        1px solid
        rgba(0,217,166,.20);

    border-radius: 13px;

    color: #00D9A6;

    background:
        rgba(0,217,166,.07);

    box-shadow:
        0 0 30px
        rgba(0,217,166,.08);
}


.bb-email-hero-copy {

    min-width: 0;
    flex: 1;
}


.bb-email-eyebrow {

    display: flex;
    align-items: center;
    gap: 7px;

    color: #718096;

    font-size: 10px;
    font-weight: 800;

    letter-spacing: 1px;
}


.bb-email-eyebrow span {

    width: 6px;
    height: 6px;

    border-radius: 50%;

    background:
        #00D9A6;

    box-shadow:
        0 0 9px
        rgba(0,217,166,.65);
}


.bb-email-hero h2 {

    margin: 6px 0 0;

    color: #F2F5F7;

    font-size: 19px;
    font-weight: 780;

    letter-spacing: -.4px;
}


.bb-email-hero p {

    max-width: 650px;

    margin: 6px 0 0;

    color: #748297;

    font-size: 11px;
    line-height: 1.6;
}


.bb-email-status-pill {

    display: flex;
    align-items: center;
    gap: 6px;

    padding: 6px 9px;

    border-radius: 999px;

    font-size: 9px;
    font-weight: 800;

    letter-spacing: .6px;
}


.bb-email-status-pill span {

    width: 6px;
    height: 6px;

    border-radius: 50%;
}


.bb-email-status-pill.enabled {

    color: #00D9A6;

    background:
        rgba(0,217,166,.08);
}


.bb-email-status-pill.enabled span {

    background:
        #00D9A6;

    box-shadow:
        0 0 8px
        rgba(0,217,166,.65);
}


.bb-email-status-pill.paused {

    color: #F5C451;

    background:
        rgba(245,196,81,.08);
}


.bb-email-status-pill.paused span {

    background:
        #F5C451;
}


/* ACCOUNT */

.bb-email-account {

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 15px;

    margin: 16px 20px;

    padding: 14px 15px;

    border:
        1px solid #26313D;

    border-radius: 12px;

    background:
        rgba(255,255,255,.015);
}


.bb-email-account > div span {

    display: block;

    color: #657387;

    font-size: 9px;
    font-weight: 800;

    letter-spacing: .8px;
}


.bb-email-account > div strong {

    display: block;

    margin-top: 4px;

    color: #DDE4E8;

    font-size: 12px;
    font-weight: 700;
}


.bb-email-account button {

    height: 34px;

    display: inline-flex;
    align-items: center;
    gap: 7px;

    padding: 0 11px;

    border:
        1px solid
        rgba(0,217,166,.18);

    border-radius: 8px;

    background:
        rgba(0,217,166,.06);

    color: #00D9A6;

    font-size: 10px;
    font-weight: 750;

    cursor: pointer;
}


.bb-email-account button:disabled {

    opacity: .45;

    cursor: not-allowed;
}


/* MASTER */

.bb-email-master {

    display: flex;
    align-items: center;

    gap: 12px;

    margin:
        0 20px 20px;

    padding: 15px;

    border:
        1px solid
        rgba(0,217,166,.13);

    border-radius: 13px;

    background:
        rgba(0,217,166,.035);
}


.bb-email-master-icon {

    width: 36px;
    height: 36px;

    display: grid;
    place-items: center;

    flex-shrink: 0;

    border-radius: 10px;

    color:
        #00D9A6;

    background:
        rgba(0,217,166,.08);
}


.bb-email-master > div:nth-child(2) {

    min-width: 0;
    flex: 1;
}


.bb-email-master strong {

    display: block;

    color: #E5EAEE;

    font-size: 12px;
    font-weight: 750;
}


.bb-email-master p {

    margin: 3px 0 0;

    color: #718096;

    font-size: 10px;
    line-height: 1.5;
}


/* TOGGLE */

.bb-email-toggle {

    position: relative;

    width: 39px;
    height: 22px;

    flex-shrink: 0;

    padding: 0;

    border: 0;

    border-radius: 999px;

    background:
        #26313D;

    cursor: pointer;

    transition:
        background .2s ease;
}


.bb-email-toggle span {

    position: absolute;

    top: 3px;
    left: 3px;

    width: 16px;
    height: 16px;

    border-radius: 50%;

    background:
        #8492A5;

    transition:
        transform .2s ease,
        background .2s ease;
}


.bb-email-toggle.active {

    background:
        #00D9A6;
}


.bb-email-toggle.active span {

    transform:
        translateX(17px);

    background:
        #03140F;
}


.bb-email-toggle:disabled {

    opacity: .4;

    cursor: not-allowed;
}


/* HEADING */

.bb-email-section-heading {

    padding:
        0 20px 9px;
}


.bb-email-section-heading span {

    display: block;

    color: #8492A5;

    font-size: 10px;
    font-weight: 800;

    letter-spacing: 1px;
}


.bb-email-section-heading small {

    display: block;

    margin-top: 4px;

    color: #647286;

    font-size: 10px;
}


/* PREFERENCES */

.bb-email-preferences {

    display: flex;
    flex-direction: column;

    margin:
        0 20px;
}


.bb-email-preference {

    display: flex;
    align-items: center;

    gap: 12px;

    padding: 13px 0;

    border-bottom:
        1px solid
        rgba(255,255,255,.045);
}


.bb-email-preference:last-child {

    border-bottom: 0;
}


.bb-email-preference-icon {

    width: 36px;
    height: 36px;

    display: grid;
    place-items: center;

    flex-shrink: 0;

    border-radius: 10px;
}


.bb-email-preference-copy {

    min-width: 0;
    flex: 1;
}


.bb-email-preference-copy strong {

    display: block;

    color: #DDE4E8;

    font-size: 12px;
    font-weight: 700;
}


.bb-email-preference-copy span {

    display: block;

    margin-top: 3px;

    color: #68778B;

    font-size: 10px;

    line-height: 1.5;
}


/* FEEDBACK */

.bb-email-feedback {

    display: flex;
    align-items: center;

    gap: 8px;

    margin:
        14px 20px 0;

    padding: 10px 12px;

    border-radius: 9px;

    font-size: 10px;
    font-weight: 650;
}


.bb-email-feedback.success {

    color: #00D9A6;

    background:
        rgba(0,217,166,.06);

    border:
        1px solid
        rgba(0,217,166,.12);
}


.bb-email-feedback.error {

    color: #FF7881;

    background:
        rgba(255,88,100,.06);

    border:
        1px solid
        rgba(255,88,100,.12);
}


/* FOOTER */

.bb-email-footer {

    display: flex;
    align-items: flex-start;

    gap: 7px;

    margin-top: 18px;

    padding:
        14px 20px;

    border-top:
        1px solid
        rgba(255,255,255,.045);

    color: #536175;

    font-size: 9px;

    line-height: 1.6;
}


.bb-email-footer svg {

    flex-shrink: 0;

    margin-top: 1px;

    color:
        #66768B;
}


/* LOADING */

.bb-email-loading {

    min-height: 180px;

    display: flex;
    align-items: center;
    justify-content: center;

    gap: 9px;

    color: #718096;

    font-size: 11px;
}


.bb-email-spin {

    animation:
        bbEmailSpin .8s
        linear infinite;
}


@keyframes bbEmailSpin {

    to {
        transform:
            rotate(360deg);
    }
}


/* RESPONSIVE */

@media (max-width: 650px) {

    .bb-email-hero {

        align-items:
            flex-start;

        flex-wrap:
            wrap;
    }


    .bb-email-status-pill {

        margin-left:
            64px;
    }


    .bb-email-account {

        align-items:
            flex-start;

        flex-direction:
            column;
    }


    .bb-email-account button {

        width:
            100%;

        justify-content:
            center;
    }
}

        `}</style>
    );
}