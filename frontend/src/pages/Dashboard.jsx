import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import {
    Activity,
    ArrowDownLeft,
    ArrowUpRight,
    ChevronRight,
    CircleDollarSign,
    Compass,
    CreditCard,
    GraduationCap,
    PiggyBank,
    Plus,
    Receipt,
    RefreshCw,
    ShoppingBag,
    Sparkles,
    Target,
    TrendingDown,
    TrendingUp,
    Utensils,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
    getDashboardSummary,
    getCategoryBreakdown,
    getBudgetPerformance,
} from "../services/analyticsService";

import { getExpenses } from "../services/expenseService";


/* =========================================================
   CONFIGURATION
========================================================= */

const REFRESH_INTERVAL = 60000;

const PERIODS = [
    {
        key: "7D",
        label: "7D",
        days: 7,
        granularity: "day",
    },
    {
        key: "30D",
        label: "30D",
        days: 30,
        granularity: "day",
    },
    {
        key: "3M",
        label: "3M",
        months: 3,
        granularity: "month",
    },
    {
        key: "6M",
        label: "6M",
        months: 6,
        granularity: "month",
    },
    {
        key: "1Y",
        label: "1Y",
        months: 12,
        granularity: "month",
    },
];

const CATEGORY_COLORS = [
    "#00D9A6",
    "#9B6CFF",
    "#FF8A65",
    "#38BDF8",
    "#F472B6",
    "#F5C451",
];

const CATEGORY_ICONS = {
    shopping: ShoppingBag,
    food: Utensils,
    travel: Compass,
    entertainment: CreditCard,
    education: GraduationCap,
    miscellaneous: CircleDollarSign,
    bills: Receipt,
    healthcare: Activity,
    others: CircleDollarSign,
    default: Receipt,
};


/* =========================================================
   NUMBER / CURRENCY HELPERS
========================================================= */

function toNumber(...values) {
    for (const value of values) {
        if (
            value !== null &&
            value !== undefined &&
            value !== ""
        ) {
            const parsed = Number(value);

            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
    }

    return 0;
}


function formatCurrency(value) {
    return `₹${toNumber(value).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 0,
        }
    )}`;
}


function formatCompactCurrency(value) {
    const amount = toNumber(value);

    if (amount >= 10000000) {
        return `₹${(
            amount / 10000000
        ).toFixed(1)}Cr`;
    }

    if (amount >= 100000) {
        return `₹${(
            amount / 100000
        ).toFixed(1)}L`;
    }

    if (amount >= 1000) {
        return `₹${(
            amount / 1000
        ).toFixed(1)}K`;
    }

    return formatCurrency(amount);
}


/* =========================================================
   USER / DATE HELPERS
========================================================= */

function getUserName() {
    return (
        localStorage
            .getItem("username")
            ?.trim() ||
        "User"
    );
}


function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
        return "Good morning";
    }

    if (hour < 17) {
        return "Good afternoon";
    }

    if (hour < 21) {
        return "Good evening";
    }

    return "Good night";
}


/*
 * Expense dates from Django are commonly returned as:
 *
 * YYYY-MM-DD
 *
 * Parsing those directly with new Date()
 * can introduce timezone shifts in some browsers.
 *
 * This helper keeps date-only values local.
 */

function parseExpenseDate(value) {
    if (!value) {
        return null;
    }

    const raw = String(value);

    const dateOnlyMatch =
        raw.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );

    if (dateOnlyMatch) {
        const year =
            Number(dateOnlyMatch[1]);

        const month =
            Number(dateOnlyMatch[2]) - 1;

        const day =
            Number(dateOnlyMatch[3]);

        const date =
            new Date(
                year,
                month,
                day
            );

        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;
    }

    const parsed =
        new Date(value);

    return Number.isNaN(
        parsed.getTime()
    )
        ? null
        : parsed;
}


function startOfDay(date) {
    const result =
        new Date(date);

    result.setHours(
        0,
        0,
        0,
        0
    );

    return result;
}


function startOfMonth(date) {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        1
    );
}


function addDays(date, amount) {
    const result =
        new Date(date);

    result.setDate(
        result.getDate() + amount
    );

    return result;
}


function addMonths(date, amount) {
    return new Date(
        date.getFullYear(),
        date.getMonth() + amount,
        1
    );
}


function dateKey(date) {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function monthKey(date) {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    return `${year}-${month}`;
}


function formatDayLabel(date) {
    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
        }
    );
}


function formatMonthLabel(date) {
    return date.toLocaleDateString(
        "en-IN",
        {
            month: "short",
        }
    );
}


function formatActivityDate(value) {
    const date =
        parseExpenseDate(value);

    if (!date) {
        return "Recent";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}


/* =========================================================
   CATEGORY HELPERS
========================================================= */

function getCategoryIcon(category) {
    const normalized =
        String(
            category || ""
        )
            .toLowerCase()
            .trim();

    const match =
        Object.keys(
            CATEGORY_ICONS
        ).find(
            (key) =>
                normalized.includes(key)
        );

    return (
        CATEGORY_ICONS[
            match || "default"
        ]
    );
}


/* =========================================================
   RESPONSE HELPERS
========================================================= */

function extractArray(
    response,
    keys = []
) {
    const payload =
        response?.data ??
        response ??
        null;

    if (Array.isArray(payload)) {
        return payload;
    }

    if (
        !payload ||
        typeof payload !== "object"
    ) {
        return [];
    }

    for (const key of keys) {
        if (
            Array.isArray(
                payload[key]
            )
        ) {
            return payload[key];
        }
    }

    if (
        Array.isArray(
            payload.results
        )
    ) {
        return payload.results;
    }

    if (
        Array.isArray(
            payload.data
        )
    ) {
        return payload.data;
    }

    return [];
}


/*
 * getExpenses() is already used by the
 * Expenses page and returns response.data
 * as the expense collection.
 *
 * This normalization also tolerates
 * paginated responses.
 */

function extractExpenses(response) {
    const payload =
        response?.data ??
        response ??
        [];

    if (Array.isArray(payload)) {
        return payload;
    }

    if (
        payload &&
        Array.isArray(
            payload.results
        )
    ) {
        return payload.results;
    }

    if (
        payload &&
        Array.isArray(
            payload.data
        )
    ) {
        return payload.data;
    }

    return [];
}


/* =========================================================
   REAL SPENDING PULSE BUILDER
========================================================= */

function buildSpendingPulse(
    expenses,
    period
) {
    const today =
        startOfDay(
            new Date()
        );

    const validExpenses =
        expenses
            .map((expense) => {
                const date =
                    parseExpenseDate(
                        expense?.expense_date ||
                        expense?.date ||
                        expense?.transaction_date ||
                        expense?.created_at
                    );

                return {
                    ...expense,
                    parsedDate: date,
                    numericAmount:
                        toNumber(
                            expense?.amount,
                            expense?.expense_amount,
                            expense?.total
                        ),
                };
            })
            .filter(
                (expense) =>
                    expense.parsedDate &&
                    expense.numericAmount >= 0
            );


    /* =====================================================
       DAILY MODE
       7D / 30D
    ===================================================== */

    if (
        period.granularity ===
        "day"
    ) {
        const start =
            addDays(
                today,
                -(period.days - 1)
            );

        const buckets = [];

        for (
            let index = 0;
            index < period.days;
            index += 1
        ) {
            const current =
                addDays(
                    start,
                    index
                );

            const key =
                dateKey(current);

            buckets.push({
                key,
                date: current,
                label:
                    formatDayLabel(
                        current
                    ),
                amount: 0,
            });
        }


        const bucketMap =
            new Map(
                buckets.map(
                    (bucket) => [
                        bucket.key,
                        bucket,
                    ]
                )
            );


        validExpenses.forEach(
            (expense) => {

                const expenseDay =
                    startOfDay(
                        expense.parsedDate
                    );

                const key =
                    dateKey(
                        expenseDay
                    );

                const bucket =
                    bucketMap.get(key);

                if (bucket) {
                    bucket.amount +=
                        expense.numericAmount;
                }
            }
        );


        return buckets;
    }


    /* =====================================================
       MONTHLY MODE
       3M / 6M / 1Y
    ===================================================== */

    const currentMonth =
        startOfMonth(
            today
        );

    const firstMonth =
        addMonths(
            currentMonth,
            -(period.months - 1)
        );

    const buckets = [];

    for (
        let index = 0;
        index < period.months;
        index += 1
    ) {
        const current =
            addMonths(
                firstMonth,
                index
            );

        buckets.push({
            key:
                monthKey(
                    current
                ),
            date: current,
            label:
                formatMonthLabel(
                    current
                ),
            amount: 0,
        });
    }


    const bucketMap =
        new Map(
            buckets.map(
                (bucket) => [
                    bucket.key,
                    bucket,
                ]
            )
        );


    validExpenses.forEach(
        (expense) => {

            const expenseMonth =
                startOfMonth(
                    expense.parsedDate
                );

            const key =
                monthKey(
                    expenseMonth
                );

            const bucket =
                bucketMap.get(key);

            if (bucket) {
                bucket.amount +=
                    expense.numericAmount;
            }
        }
    );


    return buckets;
}


/* =========================================================
   SPENDING TOOLTIP
========================================================= */

function SpendingTooltip({
    active,
    payload,
    label,
}) {
    if (
        !active ||
        !payload?.length
    ) {
        return null;
    }

    return (
        <div className="bb-tooltip">

            <span>
                {label}
            </span>

            <strong>
                {formatCurrency(
                    payload[0]?.value
                )}
            </strong>

            <small>
                Spending
            </small>

        </div>
    );
}


/* =========================================================
   SPENDING PULSE
========================================================= */

function SpendingPulse({
    expenses,
    period,
}) {
    const chartData =
        useMemo(
            () =>
                buildSpendingPulse(
                    expenses,
                    period
                ),
            [
                expenses,
                period,
            ]
        );


    const total =
        chartData.reduce(
            (sum, item) =>
                sum +
                toNumber(
                    item.amount
                ),
            0
        );


    const peak =
        chartData.length
            ? Math.max(
                ...chartData.map(
                    (item) =>
                        toNumber(
                            item.amount
                        )
                )
            )
            : 0;


    const current =
        chartData.length
            ? toNumber(
                chartData[
                    chartData.length - 1
                ].amount
            )
            : 0;


    const previous =
        chartData.length > 1
            ? toNumber(
                chartData[
                    chartData.length - 2
                ].amount
            )
            : 0;


    const change =
        previous > 0
            ? (
                (
                    current -
                    previous
                ) /
                previous
            ) * 100
            : 0;


    if (!chartData.length) {
        return (
            <div className="bb-chart-empty">

                <div className="bb-chart-empty-icon">
                    <Activity
                        size={22}
                    />
                </div>

                <strong>
                    Your spending pulse is waiting
                </strong>

                <span>
                    Add expenses to reveal
                    your spending pattern.
                </span>

            </div>
        );
    }


    return (
        <div className="bb-pulse-wrapper">

            <div className="bb-pulse-meta">

                <div>
                    <span>
                        PERIOD SPEND
                    </span>

                    <strong>
                        {formatCurrency(
                            total
                        )}
                    </strong>
                </div>

                <div>
                    <span>
                        PEAK
                    </span>

                    <strong>
                        {formatCurrency(
                            peak
                        )}
                    </strong>
                </div>

            </div>


            <div className="bb-pulse-chart">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <AreaChart
                        data={chartData}
                        margin={{
                            top: 16,
                            right: 12,
                            left: 0,
                            bottom: 0,
                        }}
                    >

                        <defs>

                            <linearGradient
                                id="bbPulseFill"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >

                                <stop
                                    offset="0%"
                                    stopColor="#00D9A6"
                                    stopOpacity={0.30}
                                />

                                <stop
                                    offset="70%"
                                    stopColor="#00D9A6"
                                    stopOpacity={0.07}
                                />

                                <stop
                                    offset="100%"
                                    stopColor="#00D9A6"
                                    stopOpacity={0}
                                />

                            </linearGradient>

                        </defs>


                        <CartesianGrid
                            vertical={false}
                            stroke="rgba(148,163,184,.075)"
                            strokeDasharray="4 7"
                        />


                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            minTickGap={
                                period.granularity ===
                                "day"
                                    ? 24
                                    : 20
                            }
                            tick={{
                                fill: "#78879A",
                                fontSize: 11,
                                fontWeight: 600,
                            }}
                        />


                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            width={54}
                            allowDecimals={false}
                            tick={{
                                fill: "#78879A",
                                fontSize: 11,
                                fontWeight: 600,
                            }}
                            tickFormatter={
                                formatCompactCurrency
                            }
                        />


                        <Tooltip
                            cursor={{
                                stroke:
                                    "rgba(0,217,166,.35)",
                                strokeWidth: 1,
                                strokeDasharray:
                                    "4 5",
                            }}
                            content={
                                <SpendingTooltip />
                            }
                        />


                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#00D9A6"
                            strokeWidth={3}
                            fill="url(#bbPulseFill)"
                            dot={false}
                            activeDot={{
                                r: 6,
                                fill: "#00D9A6",
                                stroke: "#08110F",
                                strokeWidth: 3,
                            }}
                            isAnimationActive
                            animationDuration={850}
                            animationEasing="ease-out"
                        />

                    </AreaChart>

                </ResponsiveContainer>

            </div>


            <div className="bb-pulse-change">

                <span
                    className={
                        change > 0
                            ? "increase"
                            : change < 0
                                ? "decrease"
                                : "neutral"
                    }
                >
                    {change > 0
                        ? "↑"
                        : change < 0
                            ? "↓"
                            : "•"}{" "}
                    {Math.abs(
                        Math.round(
                            change
                        )
                    ) || 0}% vs previous point
                </span>

            </div>

        </div>
    );
}


/* =========================================================
   PROGRESS RING
========================================================= */

function ProgressRing({
    value,
    size = 82,
    stroke = 7,
}) {
    const safeValue =
        Math.min(
            100,
            Math.max(
                0,
                toNumber(value)
            )
        );

    const radius =
        (size - stroke) / 2;

    const circumference =
        2 *
        Math.PI *
        radius;

    const offset =
        circumference -
        (
            safeValue / 100
        ) *
        circumference;

    return (
        <div
            className="bb-ring"
            style={{
                width: size,
                height: size,
            }}
        >

            <svg
                width={size}
                height={size}
            >

                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#202936"
                    strokeWidth={stroke}
                />

                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#9B6CFF"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={
                        circumference
                    }
                    strokeDashoffset={
                        offset
                    }
                    transform={`rotate(-90 ${
                        size / 2
                    } ${
                        size / 2
                    })`}
                />

            </svg>

            <strong>
                {Math.round(
                    safeValue
                )}%
            </strong>

        </div>
    );
}


/* =========================================================
   CATEGORY ROW
========================================================= */

function CategoryRow({
    item,
    index,
    total,
}) {
    const percentage =
        total > 0
            ? Math.round(
                (
                    item.amount /
                    total
                ) *
                100
            )
            : 0;

    const color =
        CATEGORY_COLORS[
            index %
            CATEGORY_COLORS.length
        ];

    const Icon =
        getCategoryIcon(
            item.name
        );

    return (
        <div className="bb-category-row">

            <div className="bb-category-header">

                <div className="bb-category-name">

                    <span
                        style={{
                            color,
                            background:
                                `${color}14`,
                        }}
                    >
                        <Icon size={16} />
                    </span>

                    <strong>
                        {item.name}
                    </strong>

                </div>


                <div className="bb-category-value">

                    {formatCurrency(
                        item.amount
                    )}

                    <em>·</em>

                    {percentage}%

                </div>

            </div>


            <div className="bb-progress-track">

                <span
                    style={{
                        width:
                            `${Math.min(
                                percentage,
                                100
                            )}%`,
                        background:
                            color,
                    }}
                />

            </div>

        </div>
    );
}


/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {

    const [
        summary,
        setSummary,
    ] = useState({
        total_income: 0,
        total_expenses: 0,
        total_saved: 0,
        balance: 0,
    });


    const [
        categoryData,
        setCategoryData,
    ] = useState([]);


    const [
        budgets,
        setBudgets,
    ] = useState([]);


    /*
     * IMPORTANT:
     * This is now the authoritative dataset
     * for Spending Pulse and Recent Activity.
     */
    const [
        expenses,
        setExpenses,
    ] = useState([]);


    const [
        savingGoals,
        setSavingGoals,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        refreshing,
        setRefreshing,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState(null);


    const [
        selectedPeriod,
        setSelectedPeriod,
    ] = useState("30D");


    const [
        lastUpdated,
        setLastUpdated,
    ] = useState(null);


    const username =
        useMemo(
            getUserName,
            []
        );


    /* =====================================================
       LOAD DASHBOARD
    ===================================================== */

    const loadDashboard =
        useCallback(
            async (
                silent = false
            ) => {

                try {

                    if (silent) {
                        setRefreshing(true);
                    } else {
                        setLoading(true);
                    }

                    setError(null);


                    const [
                        summaryResponse,
                        categoryResponse,
                        budgetResponse,
                        expenseResponse,
                    ] =
                        await Promise.all([
                            getDashboardSummary(),
                            getCategoryBreakdown(),
                            getBudgetPerformance(),

                            /*
                             * REAL USER EXPENSE DATA
                             */
                            getExpenses(),
                        ]);


                    const summaryPayload =
                        summaryResponse
                            ?.data
                            ?.summary ||
                        summaryResponse
                            ?.data ||
                        {};


                    setSummary({

                        total_income:
                            toNumber(
                                summaryPayload.total_income,
                                summaryPayload.income
                            ),

                        total_expenses:
                            toNumber(
                                summaryPayload.total_expenses,
                                summaryPayload.expenses,
                                summaryPayload.total_expense
                            ),

                        total_saved:
                            toNumber(
                                summaryPayload.total_saved,
                                summaryPayload.saved,
                                summaryPayload.savings
                            ),

                        balance:
                            toNumber(
                                summaryPayload.balance,
                                summaryPayload.available_balance,
                                summaryPayload.remaining
                            ),
                    });


                    setCategoryData(
                        extractArray(
                            categoryResponse,
                            [
                                "categories",
                                "breakdown",
                                "category_breakdown",
                            ]
                        )
                    );


                    setBudgets(
                        extractArray(
                            budgetResponse,
                            [
                                "budgets",
                                "budget_performance",
                                "performance",
                            ]
                        )
                    );


                    const actualExpenses =
                        extractExpenses(
                            expenseResponse
                        );


                    setExpenses(
                        actualExpenses
                    );


                    setSavingGoals(
                        extractArray(
                            summaryResponse,
                            [
                                "active_savings_goals",
                                "saving_goals",
                                "savings_goals",
                                "goals",
                            ]
                        )
                    );


                    setLastUpdated(
                        new Date()
                    );

                } catch (dashboardError) {

                    console.error(
                        "[BudgetBuddy] Dashboard error:",
                        dashboardError
                    );

                    setError(
                        "We couldn't load your latest financial data."
                    );

                } finally {

                    setLoading(false);
                    setRefreshing(false);
                }

            },
            []
        );


    /* =====================================================
       INITIAL LOAD + AUTO REFRESH
    ===================================================== */

    useEffect(() => {

        loadDashboard(false);


        const interval =
            window.setInterval(
                () =>
                    loadDashboard(true),
                REFRESH_INTERVAL
            );


        const handleVisibility =
            () => {

                if (
                    document.visibilityState ===
                    "visible"
                ) {
                    loadDashboard(true);
                }

            };


        const handleFocus =
            () => {
                loadDashboard(true);
            };


        document.addEventListener(
            "visibilitychange",
            handleVisibility
        );


        window.addEventListener(
            "focus",
            handleFocus
        );


        return () => {

            window.clearInterval(
                interval
            );

            document.removeEventListener(
                "visibilitychange",
                handleVisibility
            );

            window.removeEventListener(
                "focus",
                handleFocus
            );

        };

    }, [loadDashboard]);


    /* =====================================================
       DERIVED FINANCIAL DATA
    ===================================================== */

    const income =
        summary.total_income;

    const expensesTotal =
        summary.total_expenses;

    const savings =
        summary.total_saved;

    const balance =
        summary.balance;


    const savingsRate =
        income > 0
            ? (
                savings /
                income
            ) *
            100
            : 0;


    const spendingRate =
        income > 0
            ? (
                expensesTotal /
                income
            ) *
            100
            : 0;


    /* =====================================================
       CATEGORY DATA
    ===================================================== */

    const categoryRows =
        useMemo(
            () =>
                categoryData
                    .map(
                        (item) => ({
                            name:
                                String(
                                    item?.category ||
                                    item?.category_name ||
                                    item?.name ||
                                    item?.label ||
                                    "Miscellaneous"
                                ),

                            amount:
                                toNumber(
                                    item?.amount,
                                    item?.total,
                                    item?.total_amount,
                                    item?.spent,
                                    item?.value
                                ),
                        })
                    )
                    .filter(
                        (item) =>
                            item.amount > 0
                    )
                    .sort(
                        (a, b) =>
                            b.amount -
                            a.amount
                    ),
            [categoryData]
        );


    const categoryTotal =
        categoryRows.reduce(
            (sum, item) =>
                sum + item.amount,
            0
        );


    /* =====================================================
       ACTIVE PERIOD
    ===================================================== */

    const activePeriod =
        PERIODS.find(
            (period) =>
                period.key ===
                selectedPeriod
        ) ||
        PERIODS[1];


    /* =====================================================
       PULSE DATA
       REAL EXPENSES → CHART
    ===================================================== */

    const pulseData =
        useMemo(
            () =>
                buildSpendingPulse(
                    expenses,
                    activePeriod
                ),
            [
                expenses,
                activePeriod,
            ]
        );


    const pulseTotal =
        pulseData.reduce(
            (sum, item) =>
                sum +
                toNumber(
                    item.amount
                ),
            0
        );


    const currentPulse =
        pulseData.length
            ? pulseData[
                pulseData.length - 1
            ].amount
            : 0;


    const previousPulse =
        pulseData.length > 1
            ? pulseData[
                pulseData.length - 2
            ].amount
            : 0;


    const pulseChange =
        previousPulse > 0
            ? (
                (
                    currentPulse -
                    previousPulse
                ) /
                previousPulse
            ) *
            100
            : 0;


    /* =====================================================
       RECENT EXPENSES
    ===================================================== */

    const recentExpenses =
        useMemo(
            () =>
                [...expenses]
                    .sort(
                        (a, b) => {

                            const dateA =
                                parseExpenseDate(
                                    a?.expense_date ||
                                    a?.date ||
                                    a?.created_at
                                );

                            const dateB =
                                parseExpenseDate(
                                    b?.expense_date ||
                                    b?.date ||
                                    b?.created_at
                                );

                            return (
                                (
                                    dateB?.getTime() ||
                                    0
                                ) -
                                (
                                    dateA?.getTime() ||
                                    0
                                )
                            );
                        }
                    )
                    .slice(0, 5),
            [expenses]
        );


    /* =====================================================
       BUDGET DISCIPLINE
    ===================================================== */

    const budgetDiscipline =
        budgets.length
            ? budgets.reduce(
                (total, budget) => {

                    const spent =
                        toNumber(
                            budget?.spent,
                            budget?.spent_amount,
                            budget?.used
                        );

                    const limit =
                        toNumber(
                            budget?.limit,
                            budget?.budget,
                            budget?.budget_amount,
                            budget?.amount
                        );

                    if (
                        limit <= 0
                    ) {
                        return total;
                    }

                    return (
                        total +
                        Math.max(
                            0,
                            100 -
                            (
                                spent /
                                limit
                            ) *
                            100
                        )
                    );
                },
                0
            ) /
            budgets.length
            : 0;


    /* =====================================================
       GOAL PROGRESS
    ===================================================== */

    const goalProgress =
        savingGoals.length
            ? savingGoals.reduce(
                (total, goal) => {

                    const current =
                        toNumber(
                            goal?.saved_amount,
                            goal?.current_amount,
                            goal?.current,
                            goal?.saved
                        );

                    const target =
                        toNumber(
                            goal?.target_amount,
                            goal?.target,
                            goal?.goal_amount
                        );

                    return (
                        total +
                        (
                            target > 0
                                ? (
                                    current /
                                    target
                                ) *
                                100
                                : 0
                        )
                    );

                },
                0
            ) /
            savingGoals.length
            : 0;


    /* =====================================================
       MONEY MOMENTUM
    ===================================================== */

    const momentum =
        Math.min(
            100,
            Math.max(
                0,
                Math.round(
                    (
                        Math.min(
                            savingsRate,
                            100
                        ) * 0.4
                    ) +
                    (
                        Math.max(
                            0,
                            100 -
                            Math.min(
                                spendingRate,
                                100
                            )
                        ) * 0.35
                    ) +
                    (
                        budgetDiscipline *
                        0.25
                    )
                )
            )
        );


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (
            <>
                <DashboardStyles />

                <main className="bb-dashboard-state">

                    <div className="bb-state-icon">
                        <Activity size={22} />
                    </div>

                    <strong>
                        Building your financial overview
                    </strong>

                    <span>
                        Syncing your latest activity...
                    </span>

                </main>
            </>
        );
    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (
        error &&
        !expenses.length &&
        !categoryData.length
    ) {

        return (
            <>
                <DashboardStyles />

                <main className="bb-dashboard-state">

                    <div className="bb-error-card">

                        <strong>
                            Dashboard unavailable
                        </strong>

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                loadDashboard(false)
                            }
                        >
                            Try again
                        </button>

                    </div>

                </main>
            </>
        );
    }


    /* =====================================================
       MAIN DASHBOARD
    ===================================================== */

    return (
        <>
            <DashboardStyles />

            <main className="bb-dashboard">

                {/* HEADER */}

                <header className="bb-dashboard-header">

                    <div>

                        <div className="bb-eyebrow">
                            <span />
                            FINANCIAL OVERVIEW
                        </div>

                        <h1>
                            {getGreeting()},{" "}
                            {username} 👋
                        </h1>

                        <p>
                            Here's how your money
                            is moving this month.
                        </p>

                    </div>


                    <div className="bb-header-actions">

                        <button
                            type="button"
                            className={
                                `bb-refresh ${
                                    refreshing
                                        ? "is-refreshing"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                loadDashboard(true)
                            }
                            disabled={
                                refreshing
                            }
                            aria-label="Refresh dashboard"
                            title="Refresh dashboard"
                        >
                            <RefreshCw
                                size={17}
                            />
                        </button>


                        <Link
                            to="/expenses"
                            className="bb-add-button"
                        >
                            <Plus size={17} />
                            Add expense
                        </Link>

                    </div>

                </header>


                {/* HERO */}

                <section className="bb-hero-grid">

                    <article className="bb-balance-card">

                        <div className="bb-balance-glow" />

                        <div className="bb-balance-content">

                            <span className="bb-label">
                                <i />
                                AVAILABLE THIS MONTH
                            </span>

                            <strong className="bb-balance">
                                {formatCurrency(
                                    balance
                                )}
                            </strong>

                            <div className="bb-balance-status">

                                {pulseChange > 0
                                    ? (
                                        <TrendingUp
                                            size={14}
                                        />
                                    )
                                    : (
                                        <TrendingDown
                                            size={14}
                                        />
                                    )}

                                {Math.abs(
                                    Math.round(
                                        pulseChange
                                    )
                                ) || 0}%{" "}

                                {pulseChange > 0
                                    ? "higher spending recently"
                                    : "lower spending recently"}

                            </div>

                        </div>


                        <div className="bb-hero-metrics">

                            <div>

                                <span>
                                    <ArrowDownLeft
                                        size={14}
                                    />
                                    Income
                                </span>

                                <strong>
                                    {formatCompactCurrency(
                                        income
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    <ArrowUpRight
                                        size={14}
                                    />
                                    Spent
                                </span>

                                <strong>
                                    {formatCompactCurrency(
                                        expensesTotal
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    <PiggyBank
                                        size={14}
                                    />
                                    Saved
                                </span>

                                <strong>
                                    {formatCompactCurrency(
                                        savings
                                    )}
                                </strong>

                            </div>

                        </div>

                    </article>


                    {/* MOMENTUM */}

                    <article className="bb-momentum-card">

                        <div className="bb-card-heading">

                            <span>
                                MONEY MOMENTUM
                            </span>

                            <Activity
                                size={17}
                            />

                        </div>


                        <div className="bb-momentum-main">

                            <ProgressRing
                                value={momentum}
                            />

                            <div>

                                <strong>
                                    {momentum}
                                </strong>

                                <span>
                                    /100
                                </span>

                                <p>
                                    {momentum >= 70
                                        ? "Your financial habits are moving in a strong direction."
                                        : momentum >= 45
                                            ? "A few smart adjustments could improve your momentum."
                                            : "Your spending pattern needs some attention."}
                                </p>

                            </div>

                        </div>


                        <div className="bb-momentum-stats">

                            <div>

                                <span>
                                    Budget discipline
                                </span>

                                <strong>
                                    {Math.round(
                                        budgetDiscipline
                                    )}
                                </strong>

                                <i>
                                    <b
                                        style={{
                                            width:
                                                `${Math.min(
                                                    budgetDiscipline,
                                                    100
                                                )}%`,
                                        }}
                                    />
                                </i>

                            </div>


                            <div>

                                <span>
                                    Savings progress
                                </span>

                                <strong>
                                    {Math.round(
                                        goalProgress
                                    )}
                                </strong>

                                <i>
                                    <b
                                        style={{
                                            width:
                                                `${Math.min(
                                                    goalProgress,
                                                    100
                                                )}%`,
                                        }}
                                    />
                                </i>

                            </div>

                        </div>

                    </article>

                </section>


                {/* SPENDING PULSE + WHERE IT WENT */}

                <section className="bb-main-grid">

                    <article className="bb-panel bb-pulse-panel">

                        <div className="bb-panel-header">

                            <div>

                                <span>
                                    SPENDING PULSE
                                </span>

                                <div className="bb-pulse-title">

                                    {formatCurrency(
                                        pulseTotal
                                    )}

                                    <small
                                        className={
                                            pulseChange > 0
                                                ? "increase"
                                                : pulseChange < 0
                                                    ? "decrease"
                                                    : "neutral"
                                        }
                                    >
                                        {pulseChange > 0
                                            ? "↑"
                                            : pulseChange < 0
                                                ? "↓"
                                                : "•"}{" "}
                                        {Math.abs(
                                            Math.round(
                                                pulseChange
                                            )
                                        ) || 0}%
                                        {" "}
                                        vs previous point
                                    </small>

                                </div>

                            </div>


                            <div className="bb-periods">

                                {PERIODS.map(
                                    (period) => (

                                        <button
                                            key={
                                                period.key
                                            }
                                            type="button"
                                            className={
                                                selectedPeriod ===
                                                period.key
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setSelectedPeriod(
                                                    period.key
                                                )
                                            }
                                        >
                                            {
                                                period.label
                                            }
                                        </button>

                                    )
                                )}

                            </div>

                        </div>


                        <div className="bb-chart-container">

                            <SpendingPulse
                                expenses={
                                    expenses
                                }
                                period={
                                    activePeriod
                                }
                            />

                        </div>


                        <div className="bb-chart-footer">

                            <span>
                                <i />
                                Live financial data
                            </span>

                            {lastUpdated && (
                                <span>
                                    Updated{" "}
                                    {lastUpdated.toLocaleTimeString(
                                        "en-IN",
                                        {
                                            hour:
                                                "2-digit",
                                            minute:
                                                "2-digit",
                                        }
                                    )}
                                </span>
                            )}

                        </div>

                    </article>


                    {/* WHERE IT WENT */}

                    <article className="bb-panel">

                        <div className="bb-panel-header">

                            <div>

                                <span>
                                    WHERE IT WENT
                                </span>

                                <small>
                                    Spending by category
                                </small>

                            </div>

                            <Link
                                to="/reports"
                            >
                                Details
                            </Link>

                        </div>


                        <div className="bb-category-list">

                            {categoryRows
                                .slice(0, 6)
                                .map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <CategoryRow
                                            key={
                                                item.name
                                            }
                                            item={
                                                item
                                            }
                                            index={
                                                index
                                            }
                                            total={
                                                categoryTotal
                                            }
                                        />

                                    )
                                )}


                            {!categoryRows.length && (
                                <div className="bb-empty">
                                    No spending categories yet.
                                </div>
                            )}

                        </div>

                    </article>

                </section>


                {/* BUDGET RADAR + GOALS */}

                <section className="bb-secondary-grid">

                    <article className="bb-panel">

                        <div className="bb-panel-header">

                            <div>

                                <span>
                                    BUDGET RADAR
                                </span>

                                <small>
                                    Stay ahead of your limits
                                </small>

                            </div>

                            <Link
                                to="/budgets"
                            >
                                Manage
                            </Link>

                        </div>


                        <div className="bb-budget-grid">

                            {budgets
                                .slice(0, 4)
                                .map(
                                    (
                                        budget,
                                        index
                                    ) => {

                                        const spent =
                                            toNumber(
                                                budget?.spent,
                                                budget?.spent_amount,
                                                budget?.used
                                            );

                                        const limit =
                                            toNumber(
                                                budget?.limit,
                                                budget?.budget,
                                                budget?.budget_amount,
                                                budget?.amount
                                            );

                                        const percentage =
                                            limit > 0
                                                ? (
                                                    spent /
                                                    limit
                                                ) *
                                                100
                                                : 0;

                                        const exceeded =
                                            percentage >
                                            100;

                                        return (
                                            <div
                                                className="bb-budget"
                                                key={
                                                    budget?.id ||
                                                    index
                                                }
                                            >

                                                <div className="bb-budget-top">

                                                    <strong>
                                                        {
                                                            budget?.name ||
                                                            budget?.category ||
                                                            budget?.budget_name ||
                                                            "Budget"
                                                        }
                                                    </strong>

                                                    <span
                                                        className={
                                                            exceeded
                                                                ? "danger"
                                                                : ""
                                                        }
                                                    >
                                                        {exceeded
                                                            ? "Over limit"
                                                            : `${Math.round(
                                                                percentage
                                                            )}%`}
                                                    </span>

                                                </div>


                                                <div className="bb-budget-value">
                                                    {formatCurrency(
                                                        spent
                                                    )}
                                                    {" / "}
                                                    {formatCurrency(
                                                        limit
                                                    )}
                                                </div>


                                                <div className="bb-progress-track">

                                                    <span
                                                        style={{
                                                            width:
                                                                `${Math.min(
                                                                    percentage,
                                                                    100
                                                                )}%`,
                                                            background:
                                                                exceeded
                                                                    ? "#FF5864"
                                                                    : "#00D9A6",
                                                        }}
                                                    />

                                                </div>

                                            </div>
                                        );
                                    }
                                )}


                            {!budgets.length && (
                                <div className="bb-empty">
                                    No budgets created yet.
                                </div>
                            )}

                        </div>

                    </article>


                    {/* GOALS */}

                    <article className="bb-panel">

                        <div className="bb-panel-header">

                            <div>

                                <span>
                                    YOUR GOALS
                                </span>

                                <small>
                                    Progress toward what matters
                                </small>

                            </div>

                            <Link
                                to="/savings"
                            >
                                All goals
                            </Link>

                        </div>


                        <div className="bb-goal-list">

                            {savingGoals
                                .slice(0, 3)
                                .map(
                                    (
                                        goal,
                                        index
                                    ) => {

                                        const current =
                                            toNumber(
                                                goal?.saved_amount,
                                                goal?.current_amount,
                                                goal?.current,
                                                goal?.saved
                                            );

                                        const target =
                                            toNumber(
                                                goal?.target_amount,
                                                goal?.target,
                                                goal?.goal_amount
                                            );

                                        const percentage =
                                            target > 0
                                                ? (
                                                    current /
                                                    target
                                                ) *
                                                100
                                                : 0;

                                        return (
                                            <div
                                                className="bb-goal"
                                                key={
                                                    goal?.id ||
                                                    index
                                                }
                                            >

                                                <ProgressRing
                                                    value={
                                                        percentage
                                                    }
                                                    size={66}
                                                    stroke={6}
                                                />

                                                <div className="bb-goal-copy">

                                                    <strong>
                                                        {
                                                            goal?.name ||
                                                            goal?.title ||
                                                            goal?.goal_name ||
                                                            "Savings goal"
                                                        }
                                                    </strong>

                                                    <span>
                                                        {formatCurrency(
                                                            current
                                                        )}
                                                        {" / "}
                                                        {formatCurrency(
                                                            target
                                                        )}
                                                    </span>

                                                </div>

                                                <ChevronRight
                                                    size={17}
                                                />

                                            </div>
                                        );
                                    }
                                )}


                            {!savingGoals.length && (
                                <div className="bb-empty">
                                    Create your first savings goal.
                                </div>
                            )}

                        </div>

                    </article>

                </section>


                {/* INSIGHTS + RECENT ACTIVITY */}

                <section className="bb-secondary-grid">

                    <article className="bb-panel">

                        <div className="bb-panel-header">

                            <div>

                                <span>
                                    BUDGETBUDDY INSIGHTS
                                </span>

                                <small>
                                    Small signals worth noticing
                                </small>

                            </div>

                            <Sparkles
                                size={17}
                                color="#00D9A6"
                            />

                        </div>


                        <div className="bb-insights">

                            {categoryRows[0] && (

                                <div className="bb-insight">

                                    <div className="bb-insight-icon amber">
                                        <TrendingUp
                                            size={17}
                                        />
                                    </div>

                                    <div>

                                        <strong>
                                            {
                                                categoryRows[0]
                                                    .name
                                            }{" "}
                                            leads your spending
                                        </strong>

                                        <p>
                                            {Math.round(
                                                (
                                                    categoryRows[0]
                                                        .amount /
                                                    categoryTotal
                                                ) *
                                                100
                                            )}
                                            % of tracked spending
                                            is going here.
                                        </p>

                                    </div>

                                </div>
                            )}


                            <div className="bb-insight">

                                <div className="bb-insight-icon green">
                                    <PiggyBank
                                        size={17}
                                    />
                                </div>

                                <div>

                                    <strong>
                                        Savings rate
                                    </strong>

                                    <p>
                                        You are currently
                                        saving{" "}
                                        {Math.round(
                                            savingsRate
                                        )}
                                        % of recorded income.
                                    </p>

                                </div>

                            </div>


                            <div className="bb-insight">

                                <div className="bb-insight-icon purple">
                                    <Target
                                        size={17}
                                    />
                                </div>

                                <div>

                                    <strong>
                                        {savingGoals.length
                                            ? `${savingGoals.length} active savings goal${
                                                savingGoals.length >
                                                1
                                                    ? "s"
                                                    : ""
                                            }`
                                            : "No active savings goals"}
                                    </strong>

                                    <p>
                                        {savingGoals.length
                                            ? "Consistency matters more than speed."
                                            : "Give your savings a destination."}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </article>


                    {/* ACTIVITY */}

                    <article className="bb-panel">

                        <div className="bb-panel-header">

                            <div>

                                <span>
                                    RECENT ACTIVITY
                                </span>

                                <small>
                                    Your latest transactions
                                </small>

                            </div>

                            <Link
                                to="/expenses"
                            >
                                See all
                            </Link>

                        </div>


                        <div className="bb-activity-list">

                            {recentExpenses
                                .map(
                                    (
                                        expense,
                                        index
                                    ) => {

                                        const category =
                                            expense?.category ||
                                            expense?.category_name ||
                                            "Expense";

                                        const Icon =
                                            getCategoryIcon(
                                                category
                                            );

                                        const amount =
                                            toNumber(
                                                expense?.amount,
                                                expense?.expense_amount,
                                                expense?.total
                                            );

                                        const expenseDate =
                                            expense?.expense_date ||
                                            expense?.date ||
                                            expense?.created_at;


                                        return (
                                            <div
                                                className="bb-activity"
                                                key={
                                                    expense?.id ||
                                                    index
                                                }
                                            >

                                                <div className="bb-activity-icon">
                                                    <Icon
                                                        size={16}
                                                    />
                                                </div>


                                                <div className="bb-activity-copy">

                                                    <strong>
                                                        {
                                                            expense?.title ||
                                                            expense?.description ||
                                                            category
                                                        }
                                                    </strong>

                                                    <span>
                                                        {formatActivityDate(
                                                            expenseDate
                                                        )}
                                                    </span>

                                                </div>


                                                <strong className="bb-activity-amount">
                                                    -
                                                    {formatCurrency(
                                                        amount
                                                    )}
                                                </strong>

                                            </div>
                                        );
                                    }
                                )}


                            {!recentExpenses.length && (
                                <div className="bb-empty">
                                    Your recent transactions
                                    will appear here.
                                </div>
                            )}

                        </div>

                    </article>

                </section>

            </main>
        </>
    );
}


/* =========================================================
   PREMIUM DASHBOARD CSS
========================================================= */

function DashboardStyles() {

    return (
        <style>{`

.bb-dashboard,
.bb-dashboard * {
    box-sizing: border-box;
}

.bb-dashboard {

    --bb-bg: #070A0F;
    --bb-surface: #0E131A;
    --bb-surface-soft: #111821;
    --bb-border: #232D39;

    --bb-text: #F4F7F9;
    --bb-text-secondary: #A2ADBA;
    --bb-text-muted: #78879A;

    --bb-green: #00D9A6;
    --bb-purple: #9B6CFF;
    --bb-red: #FF5864;
    --bb-amber: #F5C451;

    width: 100%;
    max-width: 1240px;

    margin: 0 auto;

    padding:
        10px
        4px
        60px;

    color:
        var(--bb-text);

    font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;

    font-size: 14px;
    line-height: 1.45;
}


/* HEADER */

.bb-dashboard-header {

    display: flex;
    align-items: flex-end;
    justify-content: space-between;

    gap: 24px;
    margin-bottom: 24px;
}


.bb-eyebrow {

    display: flex;
    align-items: center;
    gap: 8px;

    color: var(--bb-text-muted);

    font-size: 11px;
    font-weight: 800;

    letter-spacing: 1.3px;
}


.bb-eyebrow span {

    width: 7px;
    height: 7px;

    border-radius: 50%;

    background:
        var(--bb-green);

    box-shadow:
        0 0 12px
        rgba(0,217,166,.65);
}


.bb-dashboard-header h1 {

    margin: 8px 0 0;

    color: var(--bb-text);

    font-size:
        clamp(28px, 3vw, 38px);

    font-weight: 780;
    line-height: 1.1;

    letter-spacing: -1.5px;
}


.bb-dashboard-header p {

    margin: 8px 0 0;

    color: var(--bb-text-secondary);

    font-size: 14px;
    line-height: 1.5;
}


.bb-header-actions {

    display: flex;
    align-items: center;
    gap: 9px;
}


.bb-refresh {

    width: 42px;
    height: 42px;

    display: grid;
    place-items: center;

    border:
        1px solid
        var(--bb-border);

    border-radius: 11px;

    background:
        var(--bb-surface-soft);

    color:
        var(--bb-text-secondary);

    cursor: pointer;

    transition: .2s ease;
}


.bb-refresh:hover {

    color:
        var(--bb-green);

    border-color:
        rgba(0,217,166,.35);

    background:
        rgba(0,217,166,.05);
}


.bb-refresh:disabled {

    cursor: not-allowed;
    opacity: .65;
}


.bb-refresh.is-refreshing svg {

    animation:
        bb-dashboard-spin
        .8s linear infinite;
}


.bb-add-button {

    height: 42px;

    display: inline-flex;
    align-items: center;
    gap: 8px;

    padding: 0 16px;

    border-radius: 11px;

    background:
        var(--bb-green);

    color:
        #03150F;

    text-decoration: none;

    font-size: 12px;
    font-weight: 800;

    box-shadow:
        0 10px 28px
        rgba(0,217,166,.16);

    transition: .2s ease;
}


.bb-add-button:hover {

    transform:
        translateY(-2px);

    box-shadow:
        0 15px 34px
        rgba(0,217,166,.25);
}


/* HERO */

.bb-hero-grid {

    display: grid;

    grid-template-columns:
        minmax(0,1.65fr)
        minmax(330px,.85fr);

    gap: 16px;

    margin-bottom: 16px;
}


.bb-balance-card {

    position: relative;

    min-height: 238px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 24px;

    overflow: hidden;

    padding: 30px;

    border:
        1px solid
        rgba(0,217,166,.28);

    border-radius: 19px;

    background:
        radial-gradient(
            circle at 75% 15%,
            rgba(0,217,166,.12),
            transparent 38%
        ),
        linear-gradient(
            145deg,
            #101820,
            #0B1016
        );

    box-shadow:
        inset 0 1px 0
        rgba(255,255,255,.035),
        0 20px 55px
        rgba(0,0,0,.14);
}


.bb-balance-glow {

    position: absolute;

    top: -150px;
    right: -100px;

    width: 320px;
    height: 320px;

    border-radius: 50%;

    background:
        rgba(0,217,166,.10);

    filter:
        blur(65px);

    pointer-events: none;
}


.bb-balance-content {

    position: relative;
    z-index: 1;
}


.bb-label {

    display: flex;
    align-items: center;
    gap: 8px;

    color:
        var(--bb-text-muted);

    font-size: 11px;
    font-weight: 800;

    letter-spacing: 1.15px;
}


.bb-label i {

    width: 7px;
    height: 7px;

    border-radius: 50%;

    background:
        var(--bb-green);
}


.bb-balance {

    display: block;

    margin-top: 12px;

    color: #FFFFFF;

    font-size:
        clamp(42px, 5vw, 63px);

    line-height: 1;

    font-weight: 800;

    letter-spacing: -3px;
}


.bb-balance-status {

    display: inline-flex;
    align-items: center;
    gap: 6px;

    margin-top: 14px;

    padding: 6px 10px;

    border-radius: 999px;

    color:
        #E5B744;

    background:
        rgba(245,196,81,.08);

    font-size: 10px;
    font-weight: 750;
}


.bb-hero-metrics {

    position: relative;
    z-index: 1;

    display: grid;

    grid-template-columns:
        repeat(3,1fr);

    gap: 8px;

    min-width: 305px;
}


.bb-hero-metrics > div {

    padding: 14px;

    border:
        1px solid
        rgba(255,255,255,.07);

    border-radius: 12px;

    background:
        rgba(5,10,15,.72);
}


.bb-hero-metrics span {

    display: flex;
    align-items: center;
    gap: 6px;

    color:
        var(--bb-text-muted);

    font-size: 11px;
    font-weight: 600;
}


.bb-hero-metrics span svg {

    color:
        var(--bb-green);
}


.bb-hero-metrics strong {

    display: block;

    margin-top: 7px;

    color: #EDF1F4;

    font-size: 15px;
    font-weight: 750;

    white-space: nowrap;
}


/* MOMENTUM */

.bb-momentum-card,
.bb-panel {

    overflow: hidden;

    border:
        1px solid
        var(--bb-border);

    border-radius: 18px;

    background:
        linear-gradient(
            145deg,
            #10151D,
            #0C1117
        );

    box-shadow:
        inset 0 1px 0
        rgba(255,255,255,.025);
}


.bb-momentum-card {

    padding: 23px;
}


.bb-card-heading {

    display: flex;
    align-items: center;
    justify-content: space-between;

    color: #94A2B5;

    font-size: 11px;
    font-weight: 800;

    letter-spacing: 1.15px;
}


.bb-card-heading svg {

    color:
        var(--bb-green);
}


.bb-momentum-main {

    display: flex;
    align-items: center;

    gap: 17px;

    margin-top: 19px;
}


.bb-ring {

    position: relative;

    flex-shrink: 0;

    display: grid;
    place-items: center;
}


.bb-ring svg {

    position: absolute;
    inset: 0;
}


.bb-ring strong {

    position: relative;

    color: #F5F7F9;

    font-size: 16px;
    font-weight: 800;
}


.bb-momentum-main > div:last-child > strong {

    color: #F2F5F7;

    font-size: 28px;
    font-weight: 800;
}


.bb-momentum-main > div:last-child > span {

    margin-left: 4px;

    color: #68768A;

    font-size: 11px;
}


.bb-momentum-main p {

    max-width: 175px;

    margin: 5px 0 0;

    color: var(--bb-text-muted);

    font-size: 11px;
    line-height: 1.5;
}


.bb-momentum-stats {

    display: grid;

    grid-template-columns:
        1fr 1fr;

    gap: 8px;

    margin-top: 20px;
}


.bb-momentum-stats > div {

    padding: 10px;

    border:
        1px solid
        rgba(255,255,255,.055);

    border-radius: 10px;

    background:
        rgba(255,255,255,.015);
}


.bb-momentum-stats span {

    display: block;

    color: var(--bb-text-muted);

    font-size: 10px;
}


.bb-momentum-stats strong {

    display: block;

    margin-top: 3px;

    color: #E6EBEF;

    font-size: 14px;
}


.bb-momentum-stats i {

    display: block;

    height: 4px;

    margin-top: 7px;

    overflow: hidden;

    border-radius: 999px;

    background: #1D2733;
}


.bb-momentum-stats i b {

    display: block;

    height: 100%;

    border-radius: inherit;

    background:
        var(--bb-green);

    transition:
        width .7s ease;
}


/* GRID */

.bb-main-grid,
.bb-secondary-grid {

    display: grid;

    grid-template-columns:
        minmax(0,1.55fr)
        minmax(330px,.85fr);

    gap: 16px;

    margin-bottom: 16px;
}


/* PANEL HEADER */

.bb-panel-header {

    min-height: 70px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 16px;

    padding: 14px 20px;

    border-bottom:
        1px solid
        rgba(255,255,255,.055);
}


.bb-panel-header > div > span {

    color: #94A2B5;

    font-size: 11px;
    font-weight: 800;

    letter-spacing: 1.15px;
}


.bb-panel-header small {

    display: block;

    margin-top: 4px;

    color: #69788C;

    font-size: 11px;
}


.bb-panel-header a {

    color:
        var(--bb-green);

    text-decoration: none;

    font-size: 11px;
    font-weight: 750;
}


/* SPENDING PULSE */

.bb-pulse-title {

    margin-top: 6px;

    color: #F5F7F9;

    font-size: 25px;
    font-weight: 780;

    line-height: 1;
}


.bb-pulse-title small {

    margin-left: 10px;

    font-size: 11px;
    font-weight: 750;
}


.bb-pulse-title small.increase,
.bb-pulse-change .increase {

    color:
        #F5C451;
}


.bb-pulse-title small.decrease,
.bb-pulse-change .decrease {

    color:
        var(--bb-green);
}


.bb-pulse-title small.neutral,
.bb-pulse-change .neutral {

    color:
        #748399;
}


.bb-periods {

    display: flex;
    align-items: center;

    gap: 2px;

    padding: 4px;

    border:
        1px solid
        #27313D;

    border-radius: 10px;

    background:
        #111821;
}


.bb-periods button {

    border: 0;

    border-radius: 7px;

    padding: 7px 9px;

    background: transparent;

    color: #8190A4;

    font:
        650 11px inherit;

    cursor: pointer;

    transition: .2s ease;
}


.bb-periods button:hover {

    color: #E7ECF0;
}


.bb-periods button.active {

    color: #03150F;

    background:
        var(--bb-green);

    font-weight: 800;

    box-shadow:
        0 4px 14px
        rgba(0,217,166,.17);
}


.bb-chart-container {

    height: 345px;

    padding:
        14px 18px 4px;
}


.bb-pulse-wrapper {

    height: 100%;

    display: flex;
    flex-direction: column;
}


.bb-pulse-meta {

    display: flex;
    justify-content: flex-end;

    gap: 22px;

    margin-bottom: 3px;
}


.bb-pulse-meta div {

    display: flex;
    align-items: center;

    gap: 6px;
}


.bb-pulse-meta span {

    color: #637187;

    font-size: 9px;
    font-weight: 800;

    letter-spacing: .8px;
}


.bb-pulse-meta strong {

    color: #C2CAD3;

    font-size: 11px;
    font-weight: 700;
}


.bb-pulse-chart {

    flex: 1;

    min-height: 0;
}


.bb-pulse-change {

    display: flex;
    justify-content: flex-end;

    min-height: 18px;

    padding:
        2px 4px 0;
}


.bb-pulse-change span {

    font-size: 10px;
    font-weight: 700;
}


.bb-tooltip {

    min-width: 140px;

    padding: 11px 13px;

    border:
        1px solid
        rgba(0,217,166,.22);

    border-radius: 10px;

    background:
        rgba(8,13,18,.97);

    box-shadow:
        0 15px 35px
        rgba(0,0,0,.35);

    backdrop-filter:
        blur(14px);
}


.bb-tooltip span {

    display: block;

    color: #7C8A9D;

    font-size: 10px;
}


.bb-tooltip strong {

    display: block;

    margin-top: 4px;

    color: #F3F6F8;

    font-size: 17px;
    font-weight: 800;
}


.bb-tooltip small {

    display: block;

    margin-top: 2px;

    color:
        var(--bb-green);

    font-size: 9px;
}


.bb-chart-footer {

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding:
        7px 20px 12px;

    color: #59687B;

    font-size: 10px;
}


.bb-chart-footer span:first-child {

    display: flex;
    align-items: center;
    gap: 6px;
}


.bb-chart-footer i {

    width: 5px;
    height: 5px;

    border-radius: 50%;

    background:
        var(--bb-green);

    box-shadow:
        0 0 9px
        rgba(0,217,166,.7);
}


/* EMPTY CHART */

.bb-chart-empty {

    height: 100%;

    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;

    text-align: center;
}


.bb-chart-empty-icon {

    width: 48px;
    height: 48px;

    display: grid;
    place-items: center;

    border:
        1px solid
        rgba(0,217,166,.15);

    border-radius: 14px;

    color:
        var(--bb-green);

    background:
        rgba(0,217,166,.06);
}


.bb-chart-empty strong {

    margin-top: 13px;

    color: #D2D9E0;

    font-size: 14px;
    font-weight: 700;
}


.bb-chart-empty span {

    margin-top: 5px;

    color: #718095;

    font-size: 11px;
}


/* CATEGORIES */

.bb-category-list {

    padding:
        10px 20px 17px;
}


.bb-category-row {

    padding: 10px 0;
}


.bb-category-header {

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 10px;
}


.bb-category-name {

    display: flex;
    align-items: center;

    gap: 9px;
}


.bb-category-name > span {

    width: 31px;
    height: 31px;

    display: grid;
    place-items: center;

    border-radius: 9px;
}


.bb-category-name strong {

    color: #E6EBEF;

    font-size: 13px;
    font-weight: 680;
}


.bb-category-value {

    color: #8492A4;

    font-size: 11px;
    font-weight: 600;

    white-space: nowrap;
}


.bb-category-value em {

    margin: 0 5px;

    color: #465364;

    font-style: normal;
}


.bb-progress-track {

    height: 7px;

    margin-top: 8px;

    overflow: hidden;

    border-radius: 999px;

    background: #1C2632;
}


.bb-progress-track span {

    display: block;

    height: 100%;

    border-radius: inherit;

    transition:
        width .7s ease;
}


/* BUDGET */

.bb-budget-grid {

    display: grid;

    grid-template-columns:
        1fr 1fr;

    gap: 10px;

    padding:
        12px 20px 20px;
}


.bb-budget {

    padding: 14px;

    border:
        1px solid
        #26313D;

    border-radius: 13px;

    background:
        rgba(255,255,255,.015);
}


.bb-budget-top {

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 10px;
}


.bb-budget-top strong {

    overflow: hidden;

    color: #E5EAEE;

    font-size: 12px;
    font-weight: 700;

    white-space: nowrap;
    text-overflow: ellipsis;
}


.bb-budget-top span {

    color:
        var(--bb-green);

    font-size: 10px;
    font-weight: 750;
}


.bb-budget-top span.danger {

    color:
        var(--bb-red);
}


.bb-budget-value {

    margin-top: 5px;

    color: #75849A;

    font-size: 10px;
}


.bb-budget .bb-progress-track {

    margin-top: 9px;
}


/* GOALS */

.bb-goal-list {

    display: flex;
    flex-direction: column;

    gap: 9px;

    padding:
        12px 20px 20px;
}


.bb-goal {

    display: flex;
    align-items: center;

    gap: 12px;

    padding: 12px;

    border:
        1px solid
        #26313D;

    border-radius: 13px;

    background:
        rgba(255,255,255,.015);

    transition: .2s ease;
}


.bb-goal:hover {

    transform:
        translateY(-2px);

    border-color:
        rgba(155,108,255,.3);
}


.bb-goal-copy {

    min-width: 0;
    flex: 1;
}


.bb-goal-copy strong {

    display: block;

    overflow: hidden;

    color: #E6EBEF;

    font-size: 12px;
    font-weight: 700;

    white-space: nowrap;
    text-overflow: ellipsis;
}


.bb-goal-copy span {

    display: block;

    margin-top: 4px;

    color: #748399;

    font-size: 10px;
}


.bb-goal > svg {

    color: #5E6D81;
}


/* INSIGHTS */

.bb-insights {

    display: flex;
    flex-direction: column;

    gap: 9px;

    padding:
        12px 20px 20px;
}


.bb-insight {

    display: flex;

    gap: 11px;

    padding: 13px;

    border:
        1px solid
        #26313D;

    border-radius: 13px;

    background:
        rgba(255,255,255,.015);
}


.bb-insight-icon {

    width: 34px;
    height: 34px;

    display: grid;
    place-items: center;

    flex-shrink: 0;

    border-radius: 9px;
}


.bb-insight-icon.amber {

    color: #E7B84D;

    background:
        rgba(231,184,77,.08);
}


.bb-insight-icon.green {

    color:
        var(--bb-green);

    background:
        rgba(0,217,166,.08);
}


.bb-insight-icon.purple {

    color: #A979FF;

    background:
        rgba(155,108,255,.08);
}


.bb-insight strong {

    display: block;

    color: #E4E9ED;

    font-size: 12px;
    font-weight: 700;

    line-height: 1.4;
}


.bb-insight p {

    margin: 4px 0 0;

    color: #78869A;

    font-size: 11px;
    line-height: 1.5;
}


/* ACTIVITY */

.bb-activity-list {

    padding:
        5px 20px 16px;
}


.bb-activity {

    display: flex;
    align-items: center;

    gap: 11px;

    padding: 12px 0;

    border-bottom:
        1px solid
        rgba(255,255,255,.05);
}


.bb-activity:last-child {

    border-bottom: 0;
}


.bb-activity-icon {

    width: 33px;
    height: 33px;

    display: grid;
    place-items: center;

    flex-shrink: 0;

    border-radius: 9px;

    color:
        var(--bb-green);

    background:
        rgba(0,217,166,.08);
}


.bb-activity-copy {

    min-width: 0;
    flex: 1;
}


.bb-activity-copy strong {

    display: block;

    overflow: hidden;

    color: #E5EAEE;

    font-size: 12px;
    font-weight: 700;

    white-space: nowrap;
    text-overflow: ellipsis;
}


.bb-activity-copy span {

    display: block;

    margin-top: 3px;

    color: #718096;

    font-size: 10px;

    white-space: nowrap;
}


.bb-activity-amount {

    color: #DBE1E6;

    font-size: 12px;
    font-weight: 750;

    white-space: nowrap;
}


/* EMPTY */

.bb-empty {

    padding:
        40px 10px;

    color: #68778B;

    font-size: 11px;

    text-align: center;
}


/* STATES */

.bb-dashboard-state {

    min-height: 560px;

    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;

    color:
        var(--bb-text-muted);

    font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        sans-serif;
}


.bb-state-icon {

    width: 52px;
    height: 52px;

    display: grid;
    place-items: center;

    border:
        1px solid
        rgba(0,217,166,.18);

    border-radius: 16px;

    color:
        var(--bb-green);

    background:
        rgba(0,217,166,.06);

    animation:
        bb-dashboard-pulse
        1.5s ease-in-out infinite;
}


.bb-dashboard-state > strong {

    margin-top: 16px;

    color: #DBE2E8;

    font-size: 15px;
    font-weight: 700;
}


.bb-dashboard-state > span {

    margin-top: 5px;

    color: #718096;

    font-size: 12px;
}


.bb-error-card {

    display: flex;
    flex-direction: column;

    align-items: center;

    max-width: 420px;

    padding: 24px;

    border:
        1px solid
        rgba(255,88,100,.18);

    border-radius: 16px;

    background:
        rgba(255,88,100,.045);

    text-align: center;
}


.bb-error-card strong {

    color: #F1F4F6;

    font-size: 15px;
}


.bb-error-card span {

    margin-top: 7px;

    color: #7A889B;

    font-size: 11px;
}


.bb-error-card button {

    margin-top: 14px;

    padding: 8px 13px;

    border:
        1px solid
        rgba(0,217,166,.2);

    border-radius: 8px;

    background:
        rgba(0,217,166,.07);

    color:
        var(--bb-green);

    font-size: 11px;
    font-weight: 700;

    cursor: pointer;
}


/* ANIMATIONS */

@keyframes bb-dashboard-spin {

    to {
        transform:
            rotate(360deg);
    }
}


@keyframes bb-dashboard-pulse {

    0%,
    100% {
        transform:
            scale(1);

        box-shadow:
            0 0 30px
            rgba(0,217,166,.07);
    }

    50% {
        transform:
            scale(1.04);

        box-shadow:
            0 0 45px
            rgba(0,217,166,.16);
    }
}


/* RESPONSIVE */

@media (max-width: 1050px) {

    .bb-hero-grid,
    .bb-main-grid,
    .bb-secondary-grid {

        grid-template-columns:
            1fr;
    }

    .bb-momentum-card {

        min-height:
            250px;
    }
}


@media (max-width: 720px) {

    .bb-dashboard {

        padding:
            6px
            8px
            45px;
    }


    .bb-dashboard-header {

        align-items:
            flex-start;

        flex-direction:
            column;
    }


    .bb-header-actions {

        width:
            100%;
    }


    .bb-add-button {

        flex: 1;

        justify-content:
            center;
    }


    .bb-balance-card {

        flex-direction:
            column;

        align-items:
            flex-start;

        padding:
            24px;
    }


    .bb-hero-metrics {

        width: 100%;
        min-width: 0;
    }


    .bb-budget-grid {

        grid-template-columns:
            1fr;
    }


    .bb-panel-header {

        align-items:
            flex-start;

        flex-direction:
            column;
    }


    .bb-panel-header a {

        align-self:
            flex-end;
    }


    .bb-periods {

        width: 100%;

        justify-content:
            space-between;
    }


    .bb-periods button {

        flex: 1;
    }


    .bb-chart-container {

        height:
            315px;

        padding:
            12px 8px;
    }
}


@media (max-width: 500px) {

    .bb-dashboard-header h1 {

        font-size:
            28px;
    }


    .bb-balance {

        font-size:
            43px;
    }


    .bb-hero-metrics {

        grid-template-columns:
            1fr;
    }


    .bb-pulse-title {

        font-size:
            22px;
    }


    .bb-pulse-title small {

        display:
            block;

        margin:
            6px 0 0;
    }


    .bb-pulse-meta {

        gap:
            10px;
    }
}


@media (
    prefers-reduced-motion: reduce
) {

    *,
    *::before,
    *::after {

        animation-duration:
            .01ms !important;

        animation-iteration-count:
            1 !important;

        transition-duration:
            .01ms !important;
    }
}

        `}</style>
    );
}