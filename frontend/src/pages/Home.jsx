import { Link } from "react-router-dom";
import {
    ArrowRight,
    BarChart3,
    Bell,
    Check,
    ChevronRight,
    CircleDollarSign,
    CreditCard,
    LockKeyhole,
    PiggyBank,
    ShieldCheck,
    Sparkles,
    Target,
    TrendingUp,
    WalletCards,
} from "lucide-react";

export default function Home() {
    return (
        <div className="bb-home">

            {/* =====================================================
                NAVBAR
            ===================================================== */}

            <header className="bb-navbar">

                <Link to="/" className="bb-brand">

                    <div className="bb-brand-mark">
                        B
                    </div>

                    <div>
                        <div className="bb-brand-name">
                            BudgetBuddy
                        </div>

                        <div className="bb-brand-subtitle">
                            PERSONAL FINANCE
                        </div>
                    </div>

                </Link>

                <nav className="bb-nav-links">

                    <a href="#features">
                        Features
                    </a>

                    <a href="#security">
                        Security
                    </a>

                    <a href="#experience">
                        Experience
                    </a>

                </nav>

                <div className="bb-nav-actions">

                    <Link
                        to="/login"
                        className="bb-login-link"
                    >
                        Sign in
                    </Link>

                    <Link
                        to="/register"
                        className="bb-nav-button"
                    >
                        Get Started
                        <ArrowRight size={15} />
                    </Link>

                </div>

            </header>


            {/* =====================================================
                HERO
            ===================================================== */}

            <main>

                <section className="bb-hero">

                    <div className="bb-glow bb-glow-one" />
                    <div className="bb-glow bb-glow-two" />

                    <div className="bb-hero-content">

                        <div className="bb-eyebrow">

                            <span className="bb-eyebrow-dot" />

                            SMARTER FINANCIAL CONTROL

                            <Sparkles size={13} />

                        </div>

                        <h1>
                            Your money.
                            <br />

                            <span>
                                Your command center.
                            </span>
                        </h1>

                        <p className="bb-hero-description">
                            BudgetBuddy gives you one intelligent
                            workspace to track spending, manage
                            income, build budgets and turn financial
                            goals into measurable progress.
                        </p>

                        <div className="bb-hero-actions">

                            <Link
                                to="/register"
                                className="bb-primary-button"
                            >
                                Start for free
                                <ArrowRight size={17} />
                            </Link>

                            <Link
                                to="/login"
                                className="bb-secondary-button"
                            >
                                Explore your finances
                                <ChevronRight size={16} />
                            </Link>

                        </div>

                        <div className="bb-trust-row">

                            <div className="bb-trust-item">
                                <ShieldCheck size={15} />
                                Secure by design
                            </div>

                            <div className="bb-trust-divider" />

                            <div className="bb-trust-item">
                                <LockKeyhole size={14} />
                                Private financial space
                            </div>

                            <div className="bb-trust-divider" />

                            <div className="bb-trust-item">
                                <Check size={15} />
                                Built for clarity
                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        PRODUCT PREVIEW
                    ================================================= */}

                    <div className="bb-product-wrapper">

                        <div className="bb-product-glow" />

                        <div className="bb-product-window">

                            <div className="bb-window-top">

                                <div className="bb-window-dots">
                                    <span />
                                    <span />
                                    <span />
                                </div>

                                <div className="bb-window-title">
                                    BudgetBuddy
                                </div>

                                <div className="bb-window-status">
                                    <span />
                                    Live
                                </div>

                            </div>

                            <div className="bb-window-body">

                                <div className="bb-mini-sidebar">

                                    <div className="bb-mini-logo">
                                        B
                                    </div>

                                    <div className="bb-mini-nav active">
                                        <BarChart3 size={15} />
                                    </div>

                                    <div className="bb-mini-nav">
                                        <WalletCards size={15} />
                                    </div>

                                    <div className="bb-mini-nav">
                                        <CircleDollarSign size={15} />
                                    </div>

                                    <div className="bb-mini-nav">
                                        <Target size={15} />
                                    </div>

                                    <div className="bb-mini-nav">
                                        <PiggyBank size={15} />
                                    </div>

                                </div>


                                <div className="bb-mini-dashboard">

                                    <div className="bb-mini-heading">

                                        <div>

                                            <div className="bb-mini-label">
                                                FINANCIAL OVERVIEW
                                            </div>

                                            <div className="bb-mini-title">
                                                Your financial command center
                                            </div>

                                        </div>

                                        <div className="bb-mini-avatar">
                                            B
                                        </div>

                                    </div>


                                    <div className="bb-stat-grid">

                                        <MiniStat
                                            label="Income"
                                            value="₹53,500"
                                            icon={
                                                <CircleDollarSign size={14} />
                                            }
                                        />

                                        <MiniStat
                                            label="Expenses"
                                            value="₹9,048"
                                            icon={
                                                <CreditCard size={14} />
                                            }
                                        />

                                        <MiniStat
                                            label="Savings"
                                            value="₹24,300"
                                            icon={
                                                <PiggyBank size={14} />
                                            }
                                        />

                                    </div>


                                    <div className="bb-chart-row">

                                        <div className="bb-chart-card">

                                            <div className="bb-card-heading">
                                                Spending overview
                                            </div>

                                            <div className="bb-bars">

                                                <span style={{ height: "42%" }} />
                                                <span style={{ height: "65%" }} />
                                                <span style={{ height: "48%" }} />
                                                <span style={{ height: "78%" }} />
                                                <span style={{ height: "58%" }} />
                                                <span style={{ height: "86%" }} />
                                                <span style={{ height: "68%" }} />

                                            </div>

                                            <div className="bb-chart-line" />

                                        </div>


                                        <div className="bb-goal-card">

                                            <div className="bb-goal-icon">
                                                <Target size={15} />
                                            </div>

                                            <div className="bb-card-heading">
                                                Savings goal
                                            </div>

                                            <div className="bb-goal-name">
                                                New Laptop
                                            </div>

                                            <div className="bb-goal-value">
                                                ₹38,000
                                            </div>

                                            <div className="bb-progress">
                                                <span />
                                            </div>

                                            <div className="bb-goal-meta">
                                                <span>
                                                    76% complete
                                                </span>

                                                <span>
                                                    ₹12K left
                                                </span>
                                            </div>

                                        </div>

                                    </div>


                                    <div className="bb-recent-card">

                                        <div className="bb-card-heading">
                                            Recent activity
                                        </div>

                                        <RecentRow
                                            icon={<CreditCard size={13} />}
                                            title="Shopping"
                                            amount="- ₹2,400"
                                        />

                                        <RecentRow
                                            icon={
                                                <CircleDollarSign size={13} />
                                            }
                                            title="Salary"
                                            amount="+ ₹42,000"
                                            positive
                                        />

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* FLOATING INSIGHT */}

                        <div className="bb-floating-notification">

                            <div className="bb-floating-icon">
                                <Bell size={15} />
                            </div>

                            <div>

                                <div className="bb-floating-title">
                                    Budget insight
                                </div>

                                <div className="bb-floating-text">
                                    You're 18% below your limit
                                </div>

                            </div>

                            <Check
                                size={15}
                                className="bb-floating-check"
                            />

                        </div>


                        {/* FLOATING SAVINGS */}

                        <div className="bb-floating-savings">

                            <TrendingUp size={15} />

                            <div>

                                <span>
                                    Monthly savings
                                </span>

                                <strong>
                                    +₹6,240
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    EXPERIENCE
                ===================================================== */}

                <section
                    id="experience"
                    className="bb-experience"
                >

                    <div>

                        <span className="bb-section-kicker">
                            ONE PLACE
                        </span>

                        <h2>
                            Everything your money
                            needs.
                        </h2>

                    </div>

                    <p>
                        No scattered spreadsheets.
                        No guessing. Just a clear picture
                        of where your money is today and
                        where it can take you tomorrow.
                    </p>

                </section>


                {/* =====================================================
                    FEATURES
                ===================================================== */}

                <section
                    id="features"
                    className="bb-features-section"
                >

                    <div className="bb-section-header">

                        <div>

                            <span className="bb-section-kicker">
                                BUILT AROUND YOU
                            </span>

                            <h2>
                                Financial clarity,
                                <br />
                                without the complexity.
                            </h2>

                        </div>

                        <p>
                            Powerful enough to understand
                            your finances. Simple enough to
                            use every day.
                        </p>

                    </div>


                    <div className="bb-feature-grid">

                        <FeatureCard
                            icon={<WalletCards />}
                            number="01"
                            title="Track every rupee"
                            text="Record income and expenses with meaningful categories, payment methods and notes."
                        />

                        <FeatureCard
                            icon={<Target />}
                            number="02"
                            title="Budget with confidence"
                            text="Create category-based budgets and instantly see spending, remaining limits and progress."
                        />

                        <FeatureCard
                            icon={<PiggyBank />}
                            number="03"
                            title="Turn goals into progress"
                            text="Set savings targets, track contributions and see exactly how close you are."
                        />

                        <FeatureCard
                            icon={<BarChart3 />}
                            number="04"
                            title="Understand the story"
                            text="Transform financial records into reports and insights that actually make sense."
                        />

                    </div>

                </section>


                {/* =====================================================
                    SECURITY
                ===================================================== */}

                <section
                    id="security"
                    className="bb-security"
                >

                    <div className="bb-security-icon">
                        <ShieldCheck size={27} />
                    </div>

                    <div>

                        <span className="bb-section-kicker">
                            DESIGNED FOR TRUST
                        </span>

                        <h2>
                            Your financial world
                            stays yours.
                        </h2>

                        <p>
                            BudgetBuddy is designed around
                            secure access, controlled data and
                            a private financial workspace.
                            Your money deserves more than a
                            spreadsheet.
                        </p>

                    </div>

                    <div className="bb-security-points">

                        <SecurityPoint
                            text="Protected account access"
                        />

                        <SecurityPoint
                            text="Private financial dashboard"
                        />

                        <SecurityPoint
                            text="Controlled notification system"
                        />

                    </div>

                </section>


                {/* =====================================================
                    FINAL CTA
                ===================================================== */}

                <section className="bb-final-cta">

                    <div className="bb-cta-glow" />

                    <span className="bb-section-kicker">
                        YOUR NEXT FINANCIAL MOVE
                    </span>

                    <h2>
                        Give your money
                        <br />
                        a better system.
                    </h2>

                    <p>
                        Start building a clearer relationship
                        with your finances today.
                    </p>

                    <Link
                        to="/register"
                        className="bb-primary-button bb-cta-button"
                    >
                        Create your BudgetBuddy
                        <ArrowRight size={17} />
                    </Link>

                </section>

            </main>


            {/* =====================================================
                FOOTER
            ===================================================== */}

            <footer className="bb-footer">

                <div className="bb-footer-brand">

                    <div className="bb-brand-mark small">
                        B
                    </div>

                    <span>
                        BudgetBuddy
                    </span>

                </div>

                <div>
                    © {new Date().getFullYear()} BudgetBuddy
                </div>

                <div>
                    Your money. Your clarity. Your future.
                </div>

            </footer>


            {/* =====================================================
                STYLES
            ===================================================== */}

            <style>{`

                * {
                    box-sizing: border-box;
                }

                html {
                    scroll-behavior: smooth;
                }

                .bb-home {
                    min-height: 100vh;
                    overflow: hidden;

                    background:
                        radial-gradient(
                            circle at 78% 4%,
                            rgba(25,199,154,.10),
                            transparent 27%
                        ),
                        radial-gradient(
                            circle at 12% 30%,
                            rgba(34,211,238,.05),
                            transparent 25%
                        ),
                        #050b18;

                    color: #f8fafc;

                    font-family:
                        Inter,
                        ui-sans-serif,
                        system-ui,
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        sans-serif;
                }


                /* =================================================
                   NAVBAR
                ================================================= */

                .bb-navbar {
                    height: 76px;
                    padding: 0 6%;

                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    position: sticky;
                    top: 0;
                    z-index: 100;

                    border-bottom:
                        1px solid
                        rgba(148,163,184,.08);

                    background:
                        rgba(5,11,24,.78);

                    backdrop-filter:
                        blur(22px);
                }

                .bb-brand {
                    display: flex;
                    align-items: center;
                    gap: 11px;

                    color: inherit;
                    text-decoration: none;
                }

                .bb-brand-mark {
                    width: 38px;
                    height: 38px;

                    display: grid;
                    place-items: center;

                    border-radius: 11px;

                    background:
                        linear-gradient(
                            135deg,
                            #19c79a,
                            #22d3ee
                        );

                    color: #03121a;

                    font-size: 17px;
                    font-weight: 900;

                    box-shadow:
                        0 8px 25px
                        rgba(25,199,154,.15);
                }

                .bb-brand-mark.small {
                    width: 30px;
                    height: 30px;
                    border-radius: 8px;
                    font-size: 13px;
                }

                .bb-brand-name {
                    font-size: 17px;
                    font-weight: 800;
                    letter-spacing: -.4px;
                }

                .bb-brand-subtitle {
                    margin-top: 2px;
                    color: #52627c;
                    font-size: 8px;
                    letter-spacing: 1.5px;
                }

                .bb-nav-links {
                    display: flex;
                    gap: 34px;
                }

                .bb-nav-links a {
                    color: #73819a;
                    text-decoration: none;
                    font-size: 11px;
                    font-weight: 600;
                    transition: color .2s ease;
                }

                .bb-nav-links a:hover {
                    color: #f8fafc;
                }

                .bb-nav-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bb-login-link {
                    color: #a6b2c6;
                    text-decoration: none;
                    padding: 10px 15px;
                    font-size: 12px;
                    font-weight: 650;
                }

                .bb-nav-button {
                    display: flex;
                    align-items: center;
                    gap: 7px;

                    padding: 10px 16px;

                    border-radius: 8px;

                    color: #03121a;

                    background:
                        linear-gradient(
                            135deg,
                            #19c79a,
                            #22d3ee
                        );

                    text-decoration: none;

                    font-size: 11px;
                    font-weight: 800;
                }


                /* =================================================
                   HERO
                ================================================= */

                .bb-hero {
                    max-width: 1320px;
                    min-height: 730px;

                    margin: 0 auto;

                    padding:
                        100px 5%
                        80px;

                    display: grid;

                    grid-template-columns:
                        .9fr 1.1fr;

                    align-items: center;

                    gap: 45px;

                    position: relative;
                }

                .bb-glow {
                    position: absolute;

                    border-radius: 50%;

                    pointer-events: none;

                    filter: blur(35px);
                }

                .bb-glow-one {
                    width: 350px;
                    height: 350px;

                    right: 8%;
                    top: 12%;

                    background:
                        rgba(25,199,154,.08);
                }

                .bb-glow-two {
                    width: 250px;
                    height: 250px;

                    left: 0;
                    bottom: 0;

                    background:
                        rgba(34,211,238,.05);
                }

                .bb-hero-content {
                    position: relative;
                    z-index: 2;
                }

                .bb-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;

                    padding:
                        8px 12px;

                    border-radius: 30px;

                    border:
                        1px solid
                        rgba(25,199,154,.16);

                    background:
                        rgba(25,199,154,.055);

                    color: #19c79a;

                    font-size: 9px;
                    font-weight: 750;
                    letter-spacing: 1.4px;
                }

                .bb-eyebrow-dot {
                    width: 6px;
                    height: 6px;

                    border-radius: 50%;

                    background: #19c79a;

                    box-shadow:
                        0 0 10px #19c79a;
                }

                .bb-hero h1 {
                    margin: 25px 0 0;

                    font-size:
                        clamp(48px, 6vw, 78px);

                    line-height: .98;

                    letter-spacing: -4px;

                    font-weight: 850;
                }

                .bb-hero h1 span {
                    background:
                        linear-gradient(
                            90deg,
                            #19c79a,
                            #22d3ee
                        );

                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .bb-hero-description {
                    max-width: 590px;

                    margin: 27px 0 0;

                    color: #7f8da5;

                    font-size: 14px;
                    line-height: 1.85;
                }

                .bb-hero-actions {
                    display: flex;
                    gap: 11px;

                    margin-top: 30px;

                    flex-wrap: wrap;
                }

                .bb-primary-button,
                .bb-secondary-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;

                    border-radius: 9px;

                    text-decoration: none;

                    font-size: 11px;
                    font-weight: 800;

                    transition:
                        transform .2s ease,
                        box-shadow .2s ease;
                }

                .bb-primary-button {
                    padding: 14px 20px;

                    color: #03121a;

                    background:
                        linear-gradient(
                            135deg,
                            #19c79a,
                            #22d3ee
                        );

                    box-shadow:
                        0 12px 30px
                        rgba(25,199,154,.12);
                }

                .bb-secondary-button {
                    padding: 14px 19px;

                    color: #c3cede;

                    border:
                        1px solid
                        rgba(148,163,184,.13);

                    background:
                        rgba(15,23,42,.55);
                }

                .bb-primary-button:hover,
                .bb-secondary-button:hover {
                    transform: translateY(-2px);
                }

                .bb-primary-button:hover {
                    box-shadow:
                        0 18px 35px
                        rgba(25,199,154,.20);
                }

                .bb-trust-row {
                    display: flex;
                    align-items: center;
                    gap: 13px;

                    margin-top: 28px;

                    color: #56647b;

                    font-size: 9px;

                    flex-wrap: wrap;
                }

                .bb-trust-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .bb-trust-item svg {
                    color: #19c79a;
                }

                .bb-trust-divider {
                    width: 1px;
                    height: 12px;

                    background:
                        rgba(148,163,184,.12);
                }


                /* =================================================
                   PRODUCT PREVIEW
                ================================================= */

                .bb-product-wrapper {
                    position: relative;
                    perspective: 1200px;
                }

                .bb-product-glow {
                    position: absolute;
                    inset: 5%;

                    background:
                        rgba(25,199,154,.10);

                    filter: blur(70px);
                }

                .bb-product-window {
                    position: relative;
                    z-index: 2;

                    overflow: hidden;

                    border-radius: 18px;

                    background: #081120;

                    border:
                        1px solid
                        rgba(148,163,184,.15);

                    box-shadow:
                        0 40px 100px
                        rgba(0,0,0,.55);

                    transform:
                        rotateY(-3deg)
                        rotateX(2deg);
                }

                .bb-window-top {
                    height: 42px;

                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    padding: 0 15px;

                    border-bottom:
                        1px solid
                        rgba(148,163,184,.08);

                    background: #0b1628;
                }

                .bb-window-dots {
                    display: flex;
                    gap: 5px;
                }

                .bb-window-dots span {
                    width: 6px;
                    height: 6px;

                    border-radius: 50%;

                    background: #344258;
                }

                .bb-window-title {
                    color: #7e8ba1;
                    font-size: 8px;
                }

                .bb-window-status {
                    display: flex;
                    align-items: center;
                    gap: 5px;

                    color: #19c79a;
                    font-size: 8px;
                }

                .bb-window-status span {
                    width: 5px;
                    height: 5px;

                    border-radius: 50%;

                    background: #19c79a;
                }

                .bb-window-body {
                    display: flex;
                    min-height: 410px;
                }

                .bb-mini-sidebar {
                    width: 54px;

                    padding: 16px 9px;

                    background: #07101e;

                    border-right:
                        1px solid
                        rgba(148,163,184,.07);
                }

                .bb-mini-logo {
                    width: 28px;
                    height: 28px;

                    margin:
                        0 auto 24px;

                    display: grid;
                    place-items: center;

                    border-radius: 8px;

                    background:
                        linear-gradient(
                            135deg,
                            #19c79a,
                            #22d3ee
                        );

                    color: #03121a;

                    font-size: 11px;
                    font-weight: 900;
                }

                .bb-mini-nav {
                    width: 34px;
                    height: 34px;

                    margin: 7px auto;

                    display: grid;
                    place-items: center;

                    color: #52617a;

                    border-radius: 8px;
                }

                .bb-mini-nav.active {
                    color: #19c79a;

                    background:
                        rgba(25,199,154,.10);
                }

                .bb-mini-dashboard {
                    flex: 1;

                    min-width: 0;

                    padding: 22px;
                }

                .bb-mini-heading {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .bb-mini-label,
                .bb-card-heading {
                    color: #58677e;
                    font-size: 7px;
                    letter-spacing: .7px;
                }

                .bb-mini-title {
                    margin-top: 5px;
                    font-size: 13px;
                    font-weight: 750;
                }

                .bb-mini-avatar {
                    width: 29px;
                    height: 29px;

                    display: grid;
                    place-items: center;

                    border-radius: 50%;

                    background:
                        linear-gradient(
                            135deg,
                            #19c79a,
                            #22d3ee
                        );

                    color: #03121a;

                    font-size: 9px;
                    font-weight: 900;
                }

                .bb-stat-grid {
                    display: grid;

                    grid-template-columns:
                        repeat(3, 1fr);

                    gap: 8px;

                    margin-top: 18px;
                }

                .bb-mini-stat {
                    padding: 11px;

                    border-radius: 9px;

                    background: #0d192b;

                    border:
                        1px solid
                        rgba(148,163,184,.07);
                }

                .bb-mini-stat-icon {
                    color: #19c79a;
                    margin-bottom: 8px;
                }

                .bb-mini-stat-label {
                    color: #596880;
                    font-size: 7px;
                }

                .bb-mini-stat-value {
                    margin-top: 3px;
                    font-size: 11px;
                    font-weight: 750;
                }

                .bb-chart-row {
                    display: grid;

                    grid-template-columns:
                        1.35fr .8fr;

                    gap: 9px;

                    margin-top: 9px;
                }

                .bb-chart-card,
                .bb-goal-card,
                .bb-recent-card {
                    padding: 14px;

                    border-radius: 9px;

                    background: #0d192b;

                    border:
                        1px solid
                        rgba(148,163,184,.07);
                }

                .bb-bars {
                    height: 110px;

                    display: flex;
                    align-items: end;

                    gap: 8px;

                    padding:
                        15px 8px 0;
                }

                .bb-bars span {
                    flex: 1;

                    border-radius:
                        3px 3px 1px 1px;

                    background:
                        linear-gradient(
                            180deg,
                            #22d3ee,
                            #19c79a
                        );

                    opacity: .75;
                }

                .bb-chart-line {
                    height: 1px;

                    background:
                        rgba(148,163,184,.09);
                }

                .bb-goal-icon {
                    width: 25px;
                    height: 25px;

                    display: grid;
                    place-items: center;

                    border-radius: 7px;

                    background:
                        rgba(25,199,154,.08);

                    color: #19c79a;

                    margin-bottom: 12px;
                }

                .bb-goal-name {
                    margin-top: 17px;

                    color: #8b99ae;

                    font-size: 8px;
                }

                .bb-goal-value {
                    margin-top: 5px;

                    font-size: 16px;
                    font-weight: 800;
                }

                .bb-progress {
                    height: 5px;

                    margin-top: 17px;

                    border-radius: 5px;

                    background: #19283c;
                }

                .bb-progress span {
                    display: block;

                    width: 76%;
                    height: 100%;

                    border-radius: inherit;

                    background:
                        linear-gradient(
                            90deg,
                            #19c79a,
                            #22d3ee
                        );
                }

                .bb-goal-meta {
                    display: flex;
                    justify-content: space-between;

                    margin-top: 6px;

                    color: #52617a;

                    font-size: 6px;
                }

                .bb-recent-card {
                    margin-top: 9px;
                }

                .bb-recent-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    padding-top: 10px;
                    margin-top: 8px;

                    border-top:
                        1px solid
                        rgba(148,163,184,.06);
                }

                .bb-recent-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bb-recent-icon {
                    width: 23px;
                    height: 23px;

                    display: grid;
                    place-items: center;

                    border-radius: 6px;

                    background: #142238;

                    color: #19c79a;
                }

                .bb-recent-title {
                    color: #9ba8bb;
                    font-size: 8px;
                }

                .bb-recent-amount {
                    color: #f1f5f9;
                    font-size: 8px;
                    font-weight: 700;
                }

                .bb-recent-amount.positive {
                    color: #19c79a;
                }


                /* =================================================
                   FLOATING INSIGHTS
                ================================================= */

                .bb-floating-notification,
                .bb-floating-savings {
                    position: absolute;
                    z-index: 5;

                    display: flex;
                    align-items: center;
                    gap: 9px;

                    border:
                        1px solid
                        rgba(148,163,184,.12);

                    background:
                        rgba(9,19,34,.90);

                    backdrop-filter:
                        blur(16px);

                    box-shadow:
                        0 20px 50px
                        rgba(0,0,0,.35);
                }

                .bb-floating-notification {
                    right: -24px;
                    top: 22%;

                    padding: 11px 13px;

                    border-radius: 10px;
                }

                .bb-floating-savings {
                    left: -28px;
                    bottom: 7%;

                    padding: 11px 14px;

                    border-radius: 10px;

                    color: #19c79a;
                }

                .bb-floating-icon {
                    width: 29px;
                    height: 29px;

                    display: grid;
                    place-items: center;

                    border-radius: 8px;

                    color: #19c79a;

                    background:
                        rgba(25,199,154,.09);
                }

                .bb-floating-title {
                    color: #cbd5e1;
                    font-size: 8px;
                    font-weight: 700;
                }

                .bb-floating-text {
                    margin-top: 3px;
                    color: #59677d;
                    font-size: 7px;
                }

                .bb-floating-check {
                    color: #19c79a;
                    margin-left: 5px;
                }

                .bb-floating-savings span {
                    display: block;
                    color: #62718a;
                    font-size: 7px;
                }

                .bb-floating-savings strong {
                    display: block;
                    margin-top: 3px;
                    color: #f1f5f9;
                    font-size: 11px;
                }


                /* =================================================
                   EXPERIENCE
                ================================================= */

                .bb-experience {
                    max-width: 1100px;

                    margin: 20px auto 0;

                    padding: 75px 35px;

                    display: grid;

                    grid-template-columns:
                        1fr 1fr;

                    gap: 90px;

                    align-items: end;

                    border-top:
                        1px solid
                        rgba(148,163,184,.07);
                }

                .bb-section-kicker {
                    color: #19c79a;

                    font-size: 8px;
                    font-weight: 800;

                    letter-spacing: 1.8px;
                }

                .bb-experience h2,
                .bb-section-header h2,
                .bb-security h2,
                .bb-final-cta h2 {
                    margin: 10px 0 0;

                    font-size:
                        clamp(30px,4vw,48px);

                    line-height: 1.05;

                    letter-spacing: -2px;
                }

                .bb-experience p {
                    max-width: 430px;

                    color: #65748b;

                    font-size: 12px;
                    line-height: 1.9;
                }


                /* =================================================
                   FEATURES
                ================================================= */

                .bb-features-section {
                    max-width: 1100px;

                    margin: 0 auto;

                    padding:
                        60px 35px
                        100px;
                }

                .bb-section-header {
                    display: grid;

                    grid-template-columns:
                        1fr 1fr;

                    gap: 80px;

                    align-items: end;
                }

                .bb-section-header p {
                    max-width: 400px;

                    color: #66758c;

                    font-size: 12px;
                    line-height: 1.8;
                }

                .bb-feature-grid {
                    display: grid;

                    grid-template-columns:
                        repeat(2, 1fr);

                    gap: 13px;

                    margin-top: 45px;
                }

                .bb-feature-card {
                    position: relative;

                    min-height: 190px;

                    padding: 28px;

                    border-radius: 14px;

                    background:
                        linear-gradient(
                            145deg,
                            rgba(13,27,47,.85),
                            rgba(8,16,31,.85)
                        );

                    border:
                        1px solid
                        rgba(148,163,184,.08);

                    transition:
                        transform .25s ease,
                        border-color .25s ease;
                }

                .bb-feature-card:hover {
                    transform: translateY(-4px);

                    border-color:
                        rgba(25,199,154,.20);
                }

                .bb-feature-icon {
                    width: 41px;
                    height: 41px;

                    display: grid;
                    place-items: center;

                    border-radius: 10px;

                    color: #19c79a;

                    background:
                        rgba(25,199,154,.08);
                }

                .bb-feature-number {
                    position: absolute;

                    top: 25px;
                    right: 25px;

                    color: #26364d;

                    font-size: 10px;
                    font-weight: 800;
                }

                .bb-feature-card h3 {
                    margin: 24px 0 8px;

                    font-size: 15px;
                }

                .bb-feature-card p {
                    max-width: 420px;

                    margin: 0;

                    color: #64748b;

                    font-size: 10px;
                    line-height: 1.8;
                }


                /* =================================================
                   SECURITY
                ================================================= */

                .bb-security {
                    max-width: 1100px;

                    margin: 0 auto;

                    padding: 65px 35px;

                    display: grid;

                    grid-template-columns:
                        auto 1fr 1fr;

                    gap: 28px;

                    align-items: start;

                    border-top:
                        1px solid
                        rgba(148,163,184,.07);
                }

                .bb-security-icon {
                    width: 54px;
                    height: 54px;

                    display: grid;
                    place-items: center;

                    border-radius: 14px;

                    color: #19c79a;

                    background:
                        rgba(25,199,154,.08);

                    border:
                        1px solid
                        rgba(25,199,154,.12);
                }

                .bb-security p {
                    max-width: 430px;

                    color: #64748b;

                    font-size: 10px;
                    line-height: 1.8;
                }

                .bb-security-points {
                    padding-top: 8px;
                }

                .bb-security-point {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    padding: 12px 0;

                    color: #9aa7ba;

                    font-size: 10px;

                    border-bottom:
                        1px solid
                        rgba(148,163,184,.06);
                }

                .bb-security-point svg {
                    color: #19c79a;
                }


                /* =================================================
                   CTA
                ================================================= */

                .bb-final-cta {
                    position: relative;

                    max-width: 1100px;

                    margin:
                        40px auto
                        80px;

                    padding:
                        90px 35px;

                    overflow: hidden;

                    text-align: center;

                    border-radius: 20px;

                    background:
                        linear-gradient(
                            145deg,
                            #0b1c2c,
                            #071221
                        );

                    border:
                        1px solid
                        rgba(25,199,154,.12);
                }

                .bb-cta-glow {
                    position: absolute;

                    width: 400px;
                    height: 200px;

                    left: 50%;
                    top: 0;

                    transform:
                        translateX(-50%);

                    background:
                        rgba(25,199,154,.10);

                    filter: blur(80px);
                }

                .bb-final-cta > * {
                    position: relative;
                    z-index: 2;
                }

                .bb-final-cta p {
                    margin:
                        18px auto
                        25px;

                    color: #64748b;

                    font-size: 11px;
                }


                /* =================================================
                   FOOTER
                ================================================= */

                .bb-footer {
                    min-height: 75px;

                    padding: 0 6%;

                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    color: #46546b;

                    font-size: 8px;

                    border-top:
                        1px solid
                        rgba(148,163,184,.07);
                }

                .bb-footer-brand {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    color: #8b98ac;

                    font-weight: 700;
                }


                /* =================================================
                   RESPONSIVE
                ================================================= */

                @media (max-width: 1050px) {

                    .bb-hero {
                        grid-template-columns: 1fr;
                        padding-top: 75px;
                    }

                    .bb-hero-content {
                        max-width: 700px;
                    }

                    .bb-product-wrapper {
                        width: 100%;
                        max-width: 760px;
                        margin: 20px auto 0;
                    }

                    .bb-floating-notification {
                        right: -5px;
                    }

                    .bb-floating-savings {
                        left: -5px;
                    }

                }


                @media (max-width: 760px) {

                    .bb-navbar {
                        padding: 0 20px;
                    }

                    .bb-nav-links,
                    .bb-login-link {
                        display: none;
                    }

                    .bb-hero {
                        padding:
                            65px 20px
                            55px;
                    }

                    .bb-hero h1 {
                        font-size: 48px;
                        letter-spacing: -2.5px;
                    }

                    .bb-trust-row {
                        flex-wrap: wrap;
                    }

                    .bb-product-window {
                        transform: none;
                    }

                    .bb-window-body {
                        min-height: 350px;
                    }

                    .bb-mini-sidebar {
                        width: 44px;
                    }

                    .bb-mini-dashboard {
                        padding: 15px;
                    }

                    .bb-chart-row {
                        grid-template-columns: 1fr;
                    }

                    .bb-goal-card {
                        display: none;
                    }

                    .bb-floating-notification {
                        right: 5px;
                        top: 5%;
                    }

                    .bb-floating-savings {
                        left: 5px;
                        bottom: 3%;
                    }

                    .bb-experience,
                    .bb-section-header,
                    .bb-security {
                        grid-template-columns: 1fr;
                        gap: 25px;

                        padding-left: 20px;
                        padding-right: 20px;
                    }

                    .bb-features-section {
                        padding-left: 20px;
                        padding-right: 20px;
                    }

                    .bb-feature-grid {
                        grid-template-columns: 1fr;
                    }

                    .bb-final-cta {
                        margin:
                            30px 20px
                            60px;

                        padding:
                            70px 20px;
                    }

                    .bb-footer {
                        padding: 20px;

                        gap: 12px;

                        flex-wrap: wrap;
                    }

                }


                @media (max-width: 480px) {

                    .bb-brand-name {
                        font-size: 15px;
                    }

                    .bb-nav-button {
                        padding: 9px 11px;
                    }

                    .bb-hero h1 {
                        font-size: 42px;
                    }

                    .bb-hero-description {
                        font-size: 12px;
                    }

                    .bb-floating-notification {
                        transform: scale(.85);
                        transform-origin: right center;
                    }

                    .bb-floating-savings {
                        transform: scale(.85);
                        transform-origin: left center;
                    }

                    .bb-stat-grid {
                        grid-template-columns: 1fr;
                    }

                    .bb-window-body {
                        min-height: 400px;
                    }

                }

            `}</style>

        </div>
    );
}


/* =============================================================
   MINI STAT
============================================================= */

function MiniStat({
    icon,
    label,
    value,
}) {

    return (

        <div className="bb-mini-stat">

            <div className="bb-mini-stat-icon">
                {icon}
            </div>

            <div className="bb-mini-stat-label">
                {label}
            </div>

            <div className="bb-mini-stat-value">
                {value}
            </div>

        </div>
    );
}


/* =============================================================
   RECENT ACTIVITY
============================================================= */

function RecentRow({
    icon,
    title,
    amount,
    positive = false,
}) {

    return (

        <div className="bb-recent-row">

            <div className="bb-recent-left">

                <div className="bb-recent-icon">
                    {icon}
                </div>

                <div className="bb-recent-title">
                    {title}
                </div>

            </div>

            <div
                className={
                    `bb-recent-amount ${
                        positive
                            ? "positive"
                            : ""
                    }`
                }
            >
                {amount}
            </div>

        </div>
    );
}


/* =============================================================
   FEATURE CARD
============================================================= */

function FeatureCard({
    icon,
    number,
    title,
    text,
}) {

    return (

        <div className="bb-feature-card">

            <div className="bb-feature-icon">
                {icon}
            </div>

            <div className="bb-feature-number">
                {number}
            </div>

            <h3>
                {title}
            </h3>

            <p>
                {text}
            </p>

        </div>
    );
}


/* =============================================================
   SECURITY POINT
============================================================= */

function SecurityPoint({ text }) {

    return (

        <div className="bb-security-point">

            <Check size={14} />

            {text}

        </div>
    );
}