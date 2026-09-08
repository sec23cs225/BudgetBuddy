import {
    Activity,
    AlertTriangle,
    BarChart3,
    CalendarDays,
    CircleDollarSign,
    PieChart as PieChartIcon,
    RefreshCw,
    Target,
    TrendingDown,
    TrendingUp,
    Wallet,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

import { getExpenses } from "../services/expenseService";
import { getIncomes } from "../services/incomeService";
import { getBudgets } from "../services/budgetService";
import { getSavingsGoals } from "../services/savingsService";


/* =========================================================
   CONSTANTS
========================================================= */

const CURRENCY = "INR";

const LOCALE = "en-IN";

const PERIODS = [
    {
        value: "30D",
        label: "30D",
    },
    {
        value: "3M",
        label: "3M",
    },
    {
        value: "6M",
        label: "6M",
    },
    {
        value: "1Y",
        label: "1Y",
    },
];

const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

const CATEGORY_COLORS = [
    "#08D69B",
    "#9B72FF",
    "#42B9FF",
    "#F0B85A",
    "#FF6672",
    "#45D8D0",
    "#D879B9",
    "#7F8EA3",
];


/* =========================================================
   BASIC HELPERS
========================================================= */

const toNumber = (value) => {

    const parsed =
        Number(value);

    return Number.isFinite(parsed)
        ? parsed
        : 0;
};


const clamp = (
    value,
    minimum = 0,
    maximum = 100
) =>
    Math.min(
        maximum,
        Math.max(
            minimum,
            toNumber(value)
        )
    );


/* =========================================================
   INR FORMATTERS
========================================================= */

const formatCurrency = (
    value
) => {

    const amount =
        toNumber(value);

    return new Intl.NumberFormat(
        LOCALE,
        {
            style: "currency",
            currency: CURRENCY,
            currencyDisplay: "symbol",
            maximumFractionDigits: 0,
        }
    ).format(amount);
};


const formatCompactCurrency = (
    value
) => {

    const amount =
        toNumber(value);

    return new Intl.NumberFormat(
        LOCALE,
        {
            style: "currency",
            currency: CURRENCY,
            currencyDisplay: "symbol",
            notation: "compact",
            maximumFractionDigits: 1,
        }
    ).format(amount);
};


const formatPercent = (
    value
) =>
    `${Math.round(
        Math.abs(
            toNumber(value)
        )
    )}%`;


/* =========================================================
   DATE HELPERS
========================================================= */

const parseDate = (
    value
) => {

    if (!value) {
        return null;
    }

    /*
     * Important:
     * YYYY-MM-DD is parsed manually so that
     * browser timezone conversion cannot move
     * the transaction into another day/month.
     */

    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(
            value
        )
    ) {

        const [
            year,
            month,
            day,
        ] =
            value
                .split("-")
                .map(Number);

        return new Date(
            year,
            month - 1,
            day
        );
    }

    const date =
        new Date(value);

    return Number.isNaN(
        date.getTime()
    )
        ? null
        : date;
};


const startOfDay = (
    date
) =>
    new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );


const endOfDay = (
    date
) =>
    new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59,
        999
    );


const startOfMonth = (
    year,
    month
) =>
    new Date(
        year,
        month,
        1
    );


const endOfMonth = (
    year,
    month
) =>
    new Date(
        year,
        month + 1,
        0,
        23,
        59,
        59,
        999
    );


const dateKey = (
    date
) =>
    `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}-${String(
        date.getDate()
    ).padStart(2, "0")}`;


const monthKey = (
    date
) =>
    `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}`;


const monthLabel = (
    date
) =>
    `${MONTHS[
        date.getMonth()
    ]} ${String(
        date.getFullYear()
    ).slice(-2)}`;


const isBetween = (
    date,
    start,
    end
) =>
    Boolean(date) &&
    date >= start &&
    date <= end;


/* =========================================================
   API RESPONSE NORMALIZER
========================================================= */

const extractArray = (
    response
) => {

    const data =
        response?.data;

    if (
        Array.isArray(data)
    ) {
        return data;
    }

    /*
     * Supports DRF pagination without
     * changing the service layer.
     */

    if (
        Array.isArray(
            data?.results
        )
    ) {
        return data.results;
    }

    return [];
};


/* =========================================================
   CATEGORY NORMALIZER
========================================================= */

const normalizeCategory = (
    value
) => {

    const category =
        String(
            value || ""
        )
            .trim()
            .replace(
                /\s+/g,
                " "
            );

    return (
        category ||
        "Uncategorized"
    );
};


/* =========================================================
   DATE FIELD RESOLVERS
========================================================= */

const getExpenseDate = (
    expense
) =>
    parseDate(
        expense?.expense_date
    );


const getIncomeDate = (
    income
) =>
    parseDate(
        income?.income_date
    );


/* =========================================================
   TREND CALCULATION
========================================================= */

const getPercentageChange = (
    current,
    previous
) => {

    const currentValue =
        toNumber(current);

    const previousValue =
        toNumber(previous);

    if (
        previousValue === 0
    ) {

        if (
            currentValue === 0
        ) {
            return 0;
        }

        return null;
    }

    return (
        (
            currentValue -
            previousValue
        ) /
        Math.abs(
            previousValue
        )
    ) * 100;
};


/* =========================================================
   PERIOD START
========================================================= */

const getPeriodStart = (
    today,
    period
) => {

    if (
        period === "30D"
    ) {

        return new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 29
        );
    }

    if (
        period === "3M"
    ) {

        return startOfMonth(
            today.getFullYear(),
            today.getMonth() - 2
        );
    }

    if (
        period === "6M"
    ) {

        return startOfMonth(
            today.getFullYear(),
            today.getMonth() - 5
        );
    }

    return startOfMonth(
        today.getFullYear(),
        today.getMonth() - 11
    );
};


/* =========================================================
   CHART TOOLTIP
========================================================= */

function FinancialTooltip({
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
        <div className="bb-analytics-tooltip">

            <div className="bb-tooltip-title">
                {label}
            </div>

            {payload.map(
                (item) => (

                    <div
                        key={
                            item.dataKey
                        }
                        className="bb-tooltip-item"
                    >

                        <span>

                            <i
                                style={{
                                    background:
                                        item.color,
                                }}
                            />

                            {item.name}

                        </span>

                        <strong>
                            {formatCurrency(
                                item.value
                            )}
                        </strong>

                    </div>
                )
            )}

        </div>
    );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
    icon: Icon,
    title,
    description,
}) {

    return (
        <div className="bb-analytics-empty">

            <div className="bb-empty-icon">

                <Icon
                    size={23}
                    strokeWidth={1.8}
                />

            </div>

            <strong>
                {title}
            </strong>

            <span>
                {description}
            </span>

        </div>
    );
}


/* =========================================================
   ANALYTICS PANEL
========================================================= */

function AnalyticsPanel({
    icon: Icon,
    title,
    description,
    children,
}) {

    return (
        <section className="bb-analytics-panel">

            <header className="bb-panel-header">

                <div className="bb-panel-heading">

                    <div className="bb-panel-icon">

                        <Icon
                            size={17}
                            strokeWidth={1.9}
                        />

                    </div>

                    <div>

                        <h2>
                            {title}
                        </h2>

                        <p>
                            {description}
                        </p>

                    </div>

                </div>

            </header>

            <div className="bb-panel-content">
                {children}
            </div>

        </section>
    );
}


/* =========================================================
   KPI
========================================================= */

function AnalyticsKPI({
    icon: Icon,
    label,
    value,
    description,
    tone = "green",
    trend,
    trendGood = true,
}) {

    const hasTrend =
        trend !== null &&
        trend !== undefined;

    const trendPositive =
        toNumber(trend) >= 0;

    const isGood =
        trendGood
            ? trendPositive
            : !trendPositive;

    return (
        <article
            className={
                `bb-analytics-kpi bb-kpi-${tone}`
            }
        >

            <div className="bb-kpi-top">

                <div className="bb-kpi-icon">

                    <Icon
                        size={18}
                        strokeWidth={1.9}
                    />

                </div>

                {hasTrend && (

                    <span
                        className={
                            isGood
                                ? "bb-kpi-trend positive"
                                : "bb-kpi-trend negative"
                        }
                    >

                        {trendPositive ? (
                            <TrendingUp
                                size={11}
                            />
                        ) : (
                            <TrendingDown
                                size={11}
                            />
                        )}

                        {formatPercent(
                            trend
                        )}

                    </span>

                )}

            </div>

            <span className="bb-kpi-label">
                {label}
            </span>

            <strong className="bb-kpi-value">
                {value}
            </strong>

            <span className="bb-kpi-description">
                {description}
            </span>

        </article>
    );
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Analytics() {

    const [
        expenses,
        setExpenses,
    ] = useState([]);

    const [
        incomes,
        setIncomes,
    ] = useState([]);

    const [
        budgets,
        setBudgets,
    ] = useState([]);

    const [
        savingsGoals,
        setSavingsGoals,
    ] = useState([]);

    const [
        period,
        setPeriod,
    ] = useState("6M");

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
    ] = useState("");


    /* =====================================================
       LOAD AUTHENTICATED DATA
    ===================================================== */

    const loadData = useCallback(
        async (
            isRefresh = false
        ) => {

            const accessToken =
                localStorage.getItem(
                    "access"
                );

            if (!accessToken) {

                setError(
                    "Your session has expired. Please sign in again."
                );

                setLoading(false);

                return;
            }

            try {

                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const [
                    expenseResponse,
                    incomeResponse,
                    budgetResponse,
                    savingsResponse,
                ] =
                    await Promise.all([
                        getExpenses(),
                        getIncomes(),
                        getBudgets(),
                        getSavingsGoals(),
                    ]);

                setExpenses(
                    extractArray(
                        expenseResponse
                    )
                );

                setIncomes(
                    extractArray(
                        incomeResponse
                    )
                );

                setBudgets(
                    extractArray(
                        budgetResponse
                    )
                );

                setSavingsGoals(
                    extractArray(
                        savingsResponse
                    )
                );

            } catch (
                requestError
            ) {

                console.error(
                    "Analytics loading error:",
                    requestError
                );

                if (
                    requestError?.response
                        ?.status === 401
                ) {

                    setError(
                        "Your session has expired. Please sign in again."
                    );

                } else {

                    setError(
                        "Unable to load your financial analytics right now."
                    );
                }

            } finally {

                setLoading(false);
                setRefreshing(false);
            }

        },
        []
    );


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        loadData();

    }, [
        loadData,
    ]);


    /* =====================================================
       REFRESH AFTER FINANCIAL CHANGES
    ===================================================== */

    useEffect(() => {

        const handleFinancialUpdate =
            () => {

                loadData(
                    true
                );
            };

        window.addEventListener(
            "budgetbuddy:financial-data-updated",
            handleFinancialUpdate
        );

        window.addEventListener(
            "budgetbuddy:expenses-updated",
            handleFinancialUpdate
        );

        window.addEventListener(
            "budgetbuddy:income-updated",
            handleFinancialUpdate
        );

        window.addEventListener(
            "budgetbuddy:budgets-updated",
            handleFinancialUpdate
        );

        window.addEventListener(
            "budgetbuddy:savings-updated",
            handleFinancialUpdate
        );

        return () => {

            window.removeEventListener(
                "budgetbuddy:financial-data-updated",
                handleFinancialUpdate
            );

            window.removeEventListener(
                "budgetbuddy:expenses-updated",
                handleFinancialUpdate
            );

            window.removeEventListener(
                "budgetbuddy:income-updated",
                handleFinancialUpdate
            );

            window.removeEventListener(
                "budgetbuddy:budgets-updated",
                handleFinancialUpdate
            );

            window.removeEventListener(
                "budgetbuddy:savings-updated",
                handleFinancialUpdate
            );

        };

    }, [
        loadData,
    ]);


    /* =====================================================
       DATE RANGE
    ===================================================== */

    const today =
        useMemo(
            () =>
                new Date(),
            []
        );


    const rangeStart =
        useMemo(
            () =>
                getPeriodStart(
                    today,
                    period
                ),
            [
                today,
                period,
            ]
        );


    const rangeEnd =
        useMemo(
            () =>
                endOfDay(today),
            [
                today,
            ]
        );


    const rangeDays =
        Math.max(
            1,
            Math.ceil(
                (
                    rangeEnd -
                    rangeStart
                ) /
                    86400000
            ) + 1
        );


    /* =====================================================
       PREVIOUS COMPARISON PERIOD
    ===================================================== */

    const previousRangeEnd =
        useMemo(
            () =>
                new Date(
                    rangeStart.getTime() -
                        1
                ),
            [
                rangeStart,
            ]
        );


    const previousRangeStart =
        useMemo(
            () =>
                new Date(
                    previousRangeEnd.getTime() -
                        (
                            rangeDays -
                            1
                        ) *
                            86400000
                ),
            [
                previousRangeEnd,
                rangeDays,
            ]
        );


    /* =====================================================
       CURRENT TRANSACTIONS
    ===================================================== */

    const currentExpenses =
        useMemo(
            () =>
                expenses.filter(
                    (expense) =>
                        isBetween(
                            getExpenseDate(
                                expense
                            ),
                            rangeStart,
                            rangeEnd
                        )
                ),
            [
                expenses,
                rangeStart,
                rangeEnd,
            ]
        );


    const currentIncomes =
        useMemo(
            () =>
                incomes.filter(
                    (income) =>
                        isBetween(
                            getIncomeDate(
                                income
                            ),
                            rangeStart,
                            rangeEnd
                        )
                ),
            [
                incomes,
                rangeStart,
                rangeEnd,
            ]
        );


    /* =====================================================
       PREVIOUS TRANSACTIONS
    ===================================================== */

    const previousExpenses =
        useMemo(
            () =>
                expenses.filter(
                    (expense) =>
                        isBetween(
                            getExpenseDate(
                                expense
                            ),
                            previousRangeStart,
                            previousRangeEnd
                        )
                ),
            [
                expenses,
                previousRangeStart,
                previousRangeEnd,
            ]
        );


    const previousIncomes =
        useMemo(
            () =>
                incomes.filter(
                    (income) =>
                        isBetween(
                            getIncomeDate(
                                income
                            ),
                            previousRangeStart,
                            previousRangeEnd
                        )
                ),
            [
                incomes,
                previousRangeStart,
                previousRangeEnd,
            ]
        );


    /* =====================================================
       TOTALS
    ===================================================== */

    const totalExpense =
        useMemo(
            () =>
                currentExpenses.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        toNumber(
                            item.amount
                        ),
                    0
                ),
            [
                currentExpenses,
            ]
        );


    const totalIncome =
        useMemo(
            () =>
                currentIncomes.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        toNumber(
                            item.amount
                        ),
                    0
                ),
            [
                currentIncomes,
            ]
        );


    const previousExpense =
        useMemo(
            () =>
                previousExpenses.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        toNumber(
                            item.amount
                        ),
                    0
                ),
            [
                previousExpenses,
            ]
        );


    const previousIncome =
        useMemo(
            () =>
                previousIncomes.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        toNumber(
                            item.amount
                        ),
                    0
                ),
            [
                previousIncomes,
            ]
        );


    const balance =
        totalIncome -
        totalExpense;


    const savingsRate =
        totalIncome > 0
            ? (
                balance /
                totalIncome
            ) * 100
            : 0;


    const expenseChange =
        getPercentageChange(
            totalExpense,
            previousExpense
        );


    const incomeChange =
        getPercentageChange(
            totalIncome,
            previousIncome
        );


    /* =====================================================
       TREND DATA
    ===================================================== */

    const trendData =
        useMemo(() => {

            /*
             * 30D → daily
             * 3M / 6M / 1Y → monthly
             */

            if (
                period === "30D"
            ) {

                return Array.from(
                    {
                        length: 30,
                    },
                    (
                        _,
                        index
                    ) => {

                        const date =
                            new Date(
                                rangeStart
                                    .getFullYear(),
                                rangeStart
                                    .getMonth(),
                                rangeStart
                                    .getDate() +
                                    index
                            );

                        const start =
                            startOfDay(
                                date
                            );

                        const end =
                            endOfDay(
                                date
                            );

                        const expense =
                            expenses
                                .filter(
                                    (
                                        item
                                    ) =>
                                        isBetween(
                                            getExpenseDate(
                                                item
                                            ),
                                            start,
                                            end
                                        )
                                )
                                .reduce(
                                    (
                                        sum,
                                        item
                                    ) =>
                                        sum +
                                        toNumber(
                                            item.amount
                                        ),
                                    0
                                );

                        const income =
                            incomes
                                .filter(
                                    (
                                        item
                                    ) =>
                                        isBetween(
                                            getIncomeDate(
                                                item
                                            ),
                                            start,
                                            end
                                        )
                                )
                                .reduce(
                                    (
                                        sum,
                                        item
                                    ) =>
                                        sum +
                                        toNumber(
                                            item.amount
                                        ),
                                    0
                                );

                        return {

                            key:
                                dateKey(
                                    date
                                ),

                            label:
                                `${date.getDate()} ${
                                    MONTHS[
                                        date.getMonth()
                                    ]
                                }`,

                            income,

                            expense,

                            balance:
                                income -
                                expense,
                        };
                    }
                );
            }


            const count =
                period === "3M"
                    ? 3
                    : period === "6M"
                        ? 6
                        : 12;


            return Array.from(
                {
                    length: count,
                },
                (
                    _,
                    index
                ) => {

                    const offset =
                        count -
                        1 -
                        index;

                    const date =
                        new Date(
                            today.getFullYear(),
                            today.getMonth() -
                                offset,
                            1
                        );

                    const year =
                        date.getFullYear();

                    const month =
                        date.getMonth();

                    const start =
                        startOfMonth(
                            year,
                            month
                        );

                    const end =
                        endOfMonth(
                            year,
                            month
                        );

                    const expense =
                        expenses
                            .filter(
                                (
                                    item
                                ) =>
                                    isBetween(
                                        getExpenseDate(
                                            item
                                        ),
                                        start,
                                        end
                                    )
                            )
                            .reduce(
                                (
                                    sum,
                                    item
                                ) =>
                                    sum +
                                    toNumber(
                                        item.amount
                                    ),
                                0
                            );

                    const income =
                        incomes
                            .filter(
                                (
                                    item
                                ) =>
                                    isBetween(
                                        getIncomeDate(
                                            item
                                        ),
                                        start,
                                        end
                                    )
                            )
                            .reduce(
                                (
                                    sum,
                                    item
                                ) =>
                                    sum +
                                    toNumber(
                                        item.amount
                                    ),
                                0
                            );

                    return {

                        key:
                            monthKey(
                                date
                            ),

                        label:
                            monthLabel(
                                date
                            ),

                        income,

                        expense,

                        balance:
                            income -
                            expense,
                    };
                }
            );

        }, [
            period,
            rangeStart,
            today,
            expenses,
            incomes,
        ]);


    /* =====================================================
       CATEGORY ANALYSIS
    ===================================================== */

    const categoryData =
        useMemo(() => {

            const categoryMap =
                new Map();

            currentExpenses.forEach(
                (expense) => {

                    const category =
                        normalizeCategory(
                            expense.category
                        );

                    const amount =
                        toNumber(
                            expense.amount
                        );

                    categoryMap.set(
                        category,
                        (
                            categoryMap.get(
                                category
                            ) || 0
                        ) +
                            amount
                    );
                }
            );


            return Array.from(
                categoryMap.entries()
            )
                .map(
                    (
                        [
                            category,
                            amount,
                        ],
                        index
                    ) => ({

                        category,

                        amount,

                        percentage:
                            totalExpense > 0
                                ? (
                                    amount /
                                    totalExpense
                                ) *
                                    100
                                : 0,

                        color:
                            CATEGORY_COLORS[
                                index %
                                    CATEGORY_COLORS.length
                            ],
                    })
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        b.amount -
                        a.amount
                );

        }, [
            currentExpenses,
            totalExpense,
        ]);


    /* =====================================================
       CURRENT MONTH BUDGETS
    ===================================================== */

    const currentMonthBudgets =
        useMemo(() => {

            const month =
                today.getMonth() + 1;

            const year =
                today.getFullYear();

            return budgets
                .filter(
                    (budget) =>
                        Number(
                            budget.month
                        ) === month &&
                        Number(
                            budget.year
                        ) === year
                )
                .map(
                    (budget) => {

                        const category =
                            normalizeCategory(
                                budget.category
                            );

                        const limit =
                            toNumber(
                                budget.budget_amount
                            );

                        const spent =
                            expenses
                                .filter(
                                    (
                                        expense
                                    ) => {

                                        const date =
                                            getExpenseDate(
                                                expense
                                            );

                                        return (
                                            date &&
                                            date.getMonth() ===
                                                today.getMonth() &&
                                            date.getFullYear() ===
                                                today.getFullYear() &&
                                            normalizeCategory(
                                                expense.category
                                            ) ===
                                                category
                                        );
                                    }
                                )
                                .reduce(
                                    (
                                        sum,
                                        expense
                                    ) =>
                                        sum +
                                        toNumber(
                                            expense.amount
                                        ),
                                    0
                                );

                        return {

                            category,

                            limit,

                            spent,

                            utilization:
                                limit > 0
                                    ? (
                                        spent /
                                        limit
                                    ) *
                                        100
                                    : 0,
                        };
                    }
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        b.utilization -
                        a.utilization
                );

        }, [
            budgets,
            expenses,
            today,
        ]);


    const totalBudget =
        currentMonthBudgets.reduce(
            (
                total,
                item
            ) =>
                total +
                item.limit,
            0
        );


    const totalBudgetSpent =
        currentMonthBudgets.reduce(
            (
                total,
                item
            ) =>
                total +
                item.spent,
            0
        );


    const budgetUtilization =
        totalBudget > 0
            ? (
                totalBudgetSpent /
                totalBudget
            ) * 100
            : 0;


    /* =====================================================
       SAVINGS GOALS
    ===================================================== */

    const savingsData =
        useMemo(
            () =>
                savingsGoals
                    .map(
                        (goal) => {

                            const target =
                                toNumber(
                                    goal.target_amount
                                );

                            const saved =
                                toNumber(
                                    goal.saved_amount
                                );

                            const progress =
                                target > 0
                                    ? clamp(
                                        (
                                            saved /
                                            target
                                        ) * 100
                                    )
                                    : 0;

                            return {

                                id:
                                    goal.id,

                                name:
                                    goal.goal_name ||
                                    "Savings goal",

                                target,

                                saved,

                                remaining:
                                    Math.max(
                                        0,
                                        target -
                                            saved
                                    ),

                                progress,
                            };
                        }
                    )
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            b.progress -
                            a.progress
                    ),
            [
                savingsGoals,
            ]
        );


    const totalSavingsTarget =
        savingsData.reduce(
            (
                total,
                goal
            ) =>
                total +
                goal.target,
            0
        );


    const totalSaved =
        savingsData.reduce(
            (
                total,
                goal
            ) =>
                total +
                goal.saved,
            0
        );


    const overallSavingsProgress =
        totalSavingsTarget > 0
            ? clamp(
                (
                    totalSaved /
                    totalSavingsTarget
                ) * 100
            )
            : 0;


    /* =====================================================
       TOP CATEGORY
    ===================================================== */

    const topCategory =
        categoryData[0] ||
        null;


    /* =====================================================
       DATA AVAILABILITY
    ===================================================== */

    const hasFinancialData =
        expenses.length > 0 ||
        incomes.length > 0 ||
        budgets.length > 0 ||
        savingsGoals.length > 0;


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (
            <main className="bb-analytics-page">

                <div className="bb-analytics-loading">

                    <div className="bb-loading-icon">

                        <RefreshCw
                            size={23}
                        />

                    </div>

                    <h1>
                        Building your analytics
                    </h1>

                    <p>
                        Calculating your actual
                        financial activity.
                    </p>

                </div>

                <AnalyticsStyles />

            </main>
        );
    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {

        return (
            <main className="bb-analytics-page">

                <div className="bb-analytics-error">

                    <div className="bb-error-icon">

                        <AlertTriangle
                            size={23}
                        />

                    </div>

                    <h1>
                        Analytics unavailable
                    </h1>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            loadData(
                                true
                            )
                        }
                    >

                        <RefreshCw
                            size={14}
                        />

                        Try again

                    </button>

                </div>

                <AnalyticsStyles />

            </main>
        );
    }


    /* =====================================================
       MAIN UI
    ===================================================== */

    return (

        <main className="bb-analytics-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="bb-analytics-header">

                <div>

                    <div className="bb-analytics-eyebrow">

                        <BarChart3
                            size={13}
                        />

                        FINANCIAL ANALYTICS

                    </div>

                    <h1>
                        Analytics
                    </h1>

                    <p>
                        Understand your real
                        income, spending,
                        budgets and savings
                        performance.
                    </p>

                </div>


                <div className="bb-analytics-actions">

                    <div
                        className="bb-period-selector"
                        role="tablist"
                        aria-label="Analytics period"
                    >

                        {PERIODS.map(
                            (item) => (

                                <button
                                    key={
                                        item.value
                                    }
                                    type="button"
                                    className={
                                        period ===
                                        item.value
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setPeriod(
                                            item.value
                                        )
                                    }
                                >
                                    {
                                        item.label
                                    }
                                </button>

                            )
                        )}

                    </div>


                    <button
                        type="button"
                        className="bb-refresh-button"
                        onClick={() =>
                            loadData(
                                true
                            )
                        }
                        disabled={
                            refreshing
                        }
                    >

                        <RefreshCw
                            size={14}
                            className={
                                refreshing
                                    ? "bb-spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>

                </div>

            </header>


            {/* =================================================
                EMPTY FINANCIAL WORKSPACE
            ================================================= */}

            {!hasFinancialData ? (

                <section className="bb-analytics-no-data">

                    <div className="bb-no-data-icon">

                        <BarChart3
                            size={28}
                        />

                    </div>

                    <h2>
                        Your financial story starts here
                    </h2>

                    <p>
                        Record income, expenses,
                        budgets or savings goals
                        and BudgetBuddy will build
                        your analytics automatically.
                    </p>

                </section>

            ) : (

                <>

                    {/* =================================================
                        KPI CARDS
                    ================================================= */}

                    <section className="bb-analytics-kpis">

                        <AnalyticsKPI
                            icon={Wallet}
                            label="TOTAL SPENDING"
                            value={formatCurrency(
                                totalExpense
                            )}
                            description={
                                `${currentExpenses.length} expense${
                                    currentExpenses.length ===
                                    1
                                        ? ""
                                        : "s"
                                } in selected period`
                            }
                            tone="red"
                            trend={
                                expenseChange
                            }
                            trendGood={
                                false
                            }
                        />


                        <AnalyticsKPI
                            icon={TrendingUp}
                            label="TOTAL INCOME"
                            value={formatCurrency(
                                totalIncome
                            )}
                            description={
                                `${currentIncomes.length} income record${
                                    currentIncomes.length ===
                                    1
                                        ? ""
                                        : "s"
                                } in selected period`
                            }
                            tone="green"
                            trend={
                                incomeChange
                            }
                            trendGood={
                                true
                            }
                        />


                        <AnalyticsKPI
                            icon={
                                CircleDollarSign
                            }
                            label="NET CASH FLOW"
                            value={formatCurrency(
                                balance
                            )}
                            description={
                                balance >= 0
                                    ? "Income remaining after spending"
                                    : "Spending exceeded tracked income"
                            }
                            tone={
                                balance >= 0
                                    ? "blue"
                                    : "red"
                            }
                        />


                        <AnalyticsKPI
                            icon={Target}
                            label="SAVINGS RATE"
                            value={
                                `${Math.max(
                                    0,
                                    Math.round(
                                        savingsRate
                                    )
                                )}%`
                            }
                            description={
                                totalIncome > 0
                                    ? "Income retained after spending"
                                    : "Add income to calculate"
                            }
                            tone="purple"
                        />

                    </section>


                    {/* =================================================
                        SPENDING + SAVINGS
                    ================================================= */}

                    <section className="bb-analytics-main-grid">

                        <AnalyticsPanel
                            icon={Activity}
                            title="Spending trends"
                            description={
                                period ===
                                "30D"
                                    ? "Daily spending across the last 30 days."
                                    : `Monthly spending across the selected ${period} period.`
                            }
                        >

                            {trendData.some(
                                (
                                    item
                                ) =>
                                    item.expense >
                                    0
                            ) ? (

                                <div className="bb-chart bb-chart-large">

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <LineChart
                                            data={
                                                trendData
                                            }
                                            margin={{
                                                top: 10,
                                                right: 10,
                                                left: 0,
                                                bottom: 5,
                                            }}
                                        >

                                            <CartesianGrid
                                                vertical={
                                                    false
                                                }
                                                stroke="rgba(148,163,184,.08)"
                                            />

                                            <XAxis
                                                dataKey="label"
                                                tick={{
                                                    fill:
                                                        "#7F8EA3",
                                                    fontSize: 10,
                                                }}
                                                tickLine={
                                                    false
                                                }
                                                axisLine={
                                                    false
                                                }
                                                interval={
                                                    period ===
                                                    "30D"
                                                        ? 4
                                                        : 0
                                                }
                                            />

                                            <YAxis
                                                tick={{
                                                    fill:
                                                        "#7F8EA3",
                                                    fontSize: 10,
                                                }}
                                                tickLine={
                                                    false
                                                }
                                                axisLine={
                                                    false
                                                }
                                                width={
                                                    60
                                                }
                                                tickFormatter={
                                                    formatCompactCurrency
                                                }
                                            />

                                            <Tooltip
                                                content={
                                                    <FinancialTooltip />
                                                }
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="expense"
                                                name="Spending"
                                                stroke="#08D69B"
                                                strokeWidth={
                                                    3
                                                }
                                                dot={
                                                    false
                                                }
                                                activeDot={{
                                                    r: 5,
                                                }}
                                                animationDuration={
                                                    650
                                                }
                                            />

                                        </LineChart>

                                    </ResponsiveContainer>

                                </div>

                            ) : (

                                <EmptyState
                                    icon={
                                        Activity
                                    }
                                    title="No spending in this period"
                                    description="Your spending trend will appear once expense activity is recorded."
                                />

                            )}

                        </AnalyticsPanel>


                        <AnalyticsPanel
                            icon={Target}
                            title="Savings progress"
                            description="Progress calculated from your actual savings goals."
                        >

                            {savingsData.length >
                            0 ? (

                                <div className="bb-savings-analytics">

                                    <div className="bb-savings-overview">

                                        <div className="bb-savings-ring">

                                            <svg
                                                viewBox="0 0 100 100"
                                            >

                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="38"
                                                    fill="none"
                                                    stroke="rgba(148,163,184,.10)"
                                                    strokeWidth="9"
                                                />

                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="38"
                                                    fill="none"
                                                    stroke="#9B72FF"
                                                    strokeWidth="9"
                                                    strokeLinecap="round"
                                                    strokeDasharray={
                                                        2 *
                                                        Math.PI *
                                                        38
                                                    }
                                                    strokeDashoffset={
                                                        2 *
                                                        Math.PI *
                                                        38 *
                                                        (
                                                            1 -
                                                            clamp(
                                                                overallSavingsProgress
                                                            ) /
                                                                100
                                                        )
                                                    }
                                                    transform="rotate(-90 50 50)"
                                                />

                                            </svg>

                                            <strong>
                                                {
                                                    Math.round(
                                                        overallSavingsProgress
                                                    )
                                                }%
                                            </strong>

                                        </div>


                                        <div className="bb-savings-summary">

                                            <span>
                                                Total saved
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    totalSaved
                                                )}
                                            </strong>

                                            <small>
                                                of{" "}
                                                {formatCurrency(
                                                    totalSavingsTarget
                                                )}
                                            </small>

                                        </div>

                                    </div>


                                    <div className="bb-goal-list">

                                        {savingsData
                                            .slice(
                                                0,
                                                5
                                            )
                                            .map(
                                                (
                                                    goal
                                                ) => (

                                                    <div
                                                        key={
                                                            goal.id ||
                                                            goal.name
                                                        }
                                                        className="bb-goal-row"
                                                    >

                                                        <div>

                                                            <strong>
                                                                {
                                                                    goal.name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {formatCurrency(
                                                                    goal.saved
                                                                )}{" "}
                                                                /{" "}
                                                                {formatCurrency(
                                                                    goal.target
                                                                )}
                                                            </span>

                                                        </div>

                                                        <strong>
                                                            {
                                                                Math.round(
                                                                    goal.progress
                                                                )
                                                            }%
                                                        </strong>

                                                    </div>

                                                )
                                            )}

                                    </div>

                                </div>

                            ) : (

                                <EmptyState
                                    icon={
                                        Target
                                    }
                                    title="No savings goals yet"
                                    description="Create a savings goal to see your actual progress here."
                                />

                            )}

                        </AnalyticsPanel>

                    </section>


                    {/* =================================================
                        CATEGORY + INCOME
                    ================================================= */}

                    <section className="bb-analytics-two-column">

                        <AnalyticsPanel
                            icon={
                                PieChartIcon
                            }
                            title="Category analysis"
                            description="Actual spending grouped by category."
                        >

                            {categoryData.length >
                            0 ? (

                                <div className="bb-category-layout">

                                    <div className="bb-category-chart">

                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >

                                            <PieChart>

                                                <Pie
                                                    data={
                                                        categoryData
                                                    }
                                                    dataKey="amount"
                                                    nameKey="category"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius="53%"
                                                    outerRadius="76%"
                                                    paddingAngle={
                                                        3
                                                    }
                                                    stroke="none"
                                                >

                                                    {categoryData.map(
                                                        (
                                                            item
                                                        ) => (

                                                            <Cell
                                                                key={
                                                                    item.category
                                                                }
                                                                fill={
                                                                    item.color
                                                                }
                                                            />

                                                        )
                                                    )}

                                                </Pie>

                                                <Tooltip
                                                    formatter={(
                                                        value
                                                    ) =>
                                                        formatCurrency(
                                                            value
                                                        )
                                                    }
                                                />

                                            </PieChart>

                                        </ResponsiveContainer>

                                    </div>


                                    <div className="bb-category-list">

                                        {categoryData.map(
                                            (
                                                item
                                            ) => (

                                                <div
                                                    key={
                                                        item.category
                                                    }
                                                    className="bb-category-row"
                                                >

                                                    <div>

                                                        <i
                                                            style={{
                                                                background:
                                                                    item.color,
                                                            }}
                                                        />

                                                        <span>
                                                            {
                                                                item.category
                                                            }
                                                        </span>

                                                    </div>

                                                    <strong>
                                                        {
                                                            formatCurrency(
                                                                item.amount
                                                            )
                                                        }
                                                    </strong>

                                                    <small>
                                                        {
                                                            Math.round(
                                                                item.percentage
                                                            )
                                                        }%
                                                    </small>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>

                            ) : (

                                <EmptyState
                                    icon={
                                        PieChartIcon
                                    }
                                    title="No category data"
                                    description="Category analysis will appear when expenses are recorded."
                                />

                            )}

                        </AnalyticsPanel>


                        <AnalyticsPanel
                            icon={
                                TrendingUp
                            }
                            title="Income trends"
                            description="Actual income received during the selected period."
                        >

                            {trendData.some(
                                (
                                    item
                                ) =>
                                    item.income >
                                    0
                            ) ? (

                                <div className="bb-chart bb-chart-medium">

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <BarChart
                                            data={
                                                trendData
                                            }
                                            margin={{
                                                top: 10,
                                                right: 5,
                                                left: 0,
                                                bottom: 5,
                                            }}
                                        >

                                            <CartesianGrid
                                                vertical={
                                                    false
                                                }
                                                stroke="rgba(148,163,184,.08)"
                                            />

                                            <XAxis
                                                dataKey="label"
                                                tick={{
                                                    fill:
                                                        "#7F8EA3",
                                                    fontSize: 10,
                                                }}
                                                tickLine={
                                                    false
                                                }
                                                axisLine={
                                                    false
                                                }
                                            />

                                            <YAxis
                                                tick={{
                                                    fill:
                                                        "#7F8EA3",
                                                    fontSize: 10,
                                                }}
                                                tickLine={
                                                    false
                                                }
                                                axisLine={
                                                    false
                                                }
                                                width={
                                                    58
                                                }
                                                tickFormatter={
                                                    formatCompactCurrency
                                                }
                                            />

                                            <Tooltip
                                                content={
                                                    <FinancialTooltip />
                                                }
                                            />

                                            <Bar
                                                dataKey="income"
                                                name="Income"
                                                fill="#9B72FF"
                                                radius={[
                                                    6,
                                                    6,
                                                    0,
                                                    0,
                                                ]}
                                                maxBarSize={
                                                    38
                                                }
                                                animationDuration={
                                                    650
                                                }
                                            />

                                        </BarChart>

                                    </ResponsiveContainer>

                                </div>

                            ) : (

                                <EmptyState
                                    icon={
                                        TrendingUp
                                    }
                                    title="No income recorded"
                                    description="Income trends will appear after income activity is recorded."
                                />

                            )}

                        </AnalyticsPanel>

                    </section>


                    {/* =================================================
                        BUDGET UTILIZATION
                    ================================================= */}

                    <AnalyticsPanel
                        icon={
                            Target
                        }
                        title="Budget utilization"
                        description="Current-month budgets compared against actual spending."
                    >

                        {currentMonthBudgets.length >
                        0 ? (

                            <div className="bb-budget-analytics">

                                <div className="bb-budget-summary">

                                    <div>

                                        <span>
                                            Spent
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                totalBudgetSpent
                                            )}
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Allocated
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                totalBudget
                                            )}
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Utilization
                                        </span>

                                        <strong
                                            className={
                                                budgetUtilization >=
                                                100
                                                    ? "danger"
                                                    : budgetUtilization >=
                                                        80
                                                        ? "warning"
                                                        : "healthy"
                                            }
                                        >
                                            {
                                                Math.round(
                                                    budgetUtilization
                                                )
                                            }%
                                        </strong>

                                    </div>

                                </div>


                                <div className="bb-budget-list">

                                    {currentMonthBudgets.map(
                                        (
                                            budget
                                        ) => {

                                            const percentage =
                                                Math.max(
                                                    0,
                                                    budget.utilization
                                                );

                                            const width =
                                                Math.min(
                                                    percentage,
                                                    100
                                                );

                                            const tone =
                                                percentage >=
                                                100
                                                    ? "danger"
                                                    : percentage >=
                                                        80
                                                        ? "warning"
                                                        : "healthy";

                                            return (

                                                <div
                                                    key={
                                                        budget.category
                                                    }
                                                    className="bb-budget-row"
                                                >

                                                    <div className="bb-budget-row-head">

                                                        <strong>
                                                            {
                                                                budget.category
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                formatCurrency(
                                                                    budget.spent
                                                                )
                                                            }{" "}
                                                            /{" "}
                                                            {
                                                                formatCurrency(
                                                                    budget.limit
                                                                )
                                                            }
                                                        </span>

                                                    </div>

                                                    <div className="bb-budget-track">

                                                        <div
                                                            className={
                                                                `bb-budget-fill ${tone}`
                                                            }
                                                            style={{
                                                                width:
                                                                    `${width}%`,
                                                            }}
                                                        />

                                                    </div>

                                                    <span
                                                        className={
                                                            `bb-budget-percent ${tone}`
                                                        }
                                                    >
                                                        {
                                                            Math.round(
                                                                percentage
                                                            )
                                                        }%
                                                    </span>

                                                </div>

                                            );
                                        }
                                    )}

                                </div>

                            </div>

                        ) : (

                            <EmptyState
                                icon={
                                    Target
                                }
                                title="No current-month budgets"
                                description="Create a monthly budget to start tracking utilization."
                            />

                        )}

                    </AnalyticsPanel>


                    {/* =================================================
                        DATA INTEGRITY FOOTER
                    ================================================= */}

                    <div className="bb-analytics-footer">

                        <div>

                            <CalendarDays
                                size={14}
                            />

                            <span>
                                Analytics are calculated
                                from your authenticated
                                BudgetBuddy records.
                            </span>

                        </div>


                        {topCategory && (

                            <strong>
                                Highest spending:{" "}
                                {
                                    topCategory.category
                                }
                            </strong>

                        )}

                    </div>

                </>
            )}

            <AnalyticsStyles />

        </main>
    );
}


/* =========================================================
   STYLES
========================================================= */

function AnalyticsStyles() {

    return (
        <style>
            {`

            /* =====================================================
               ROOT
            ===================================================== */

            .bb-analytics-page {

                width: 100%;
                max-width: 1280px;
                margin: 0 auto;
                padding-bottom: 42px;

                color:
                    var(
                        --bb-text,
                        #F4F7FA
                    );

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

                text-rendering:
                    optimizeLegibility;

            }


            /* =====================================================
               HEADER
            ===================================================== */

            .bb-analytics-header {

                display: flex;
                align-items: flex-end;
                justify-content: space-between;

                gap: 24px;
                margin-bottom: 22px;

            }


            .bb-analytics-eyebrow {

                display: flex;
                align-items: center;
                gap: 7px;

                margin-bottom: 7px;

                color:
                    var(
                        --bb-primary,
                        #08D69B
                    );

                font-size: 10px;
                line-height: 1;
                font-weight: 850;
                letter-spacing: 1.25px;

            }


            .bb-analytics-header h1 {

                margin: 0;

                color:
                    var(
                        --bb-text,
                        #F4F7FA
                    );

                font-size: 32px;
                line-height: 1.08;
                font-weight: 850;
                letter-spacing: -1px;

            }


            .bb-analytics-header p {

                max-width: 580px;

                margin: 7px 0 0;

                color:
                    var(
                        --bb-text-muted,
                        #91A0B3
                    );

                font-size: 12px;
                line-height: 1.55;
                font-weight: 500;

            }


            .bb-analytics-actions {

                display: flex;
                align-items: center;
                gap: 8px;

            }


            /* =====================================================
               PERIOD
            ===================================================== */

            .bb-period-selector {

                display: flex;
                align-items: center;
                gap: 2px;

                padding: 4px;

                border:
                    1px solid
                    rgba(148,163,184,.14);

                border-radius: 10px;

                background:
                    var(
                        --bb-surface,
                        #0B1119
                    );

            }


            .bb-period-selector button {

                min-width: 39px;
                height: 31px;

                padding: 0 9px;

                border: 0;
                border-radius: 7px;

                background:
                    transparent;

                color:
                    #7F8EA3;

                font-family:
                    inherit;

                font-size: 10px;
                font-weight: 800;

                cursor: pointer;

                transition:
                    .18s ease;

            }


            .bb-period-selector button:hover {

                color:
                    #F4F7FA;

            }


            .bb-period-selector button.active {

                background:
                    #08D69B;

                color:
                    #03130D;

                box-shadow:
                    0 5px 15px
                    rgba(8,214,155,.15);

            }


            /* =====================================================
               REFRESH
            ===================================================== */

            .bb-refresh-button {

                height: 40px;

                display: inline-flex;
                align-items: center;
                gap: 7px;

                padding: 0 13px;

                border:
                    1px solid
                    rgba(148,163,184,.14);

                border-radius: 9px;

                background:
                    var(
                        --bb-surface,
                        #0B1119
                    );

                color:
                    #91A0B3;

                font-family:
                    inherit;

                font-size: 10px;
                font-weight: 800;

                cursor: pointer;

                transition:
                    .18s ease;

            }


            .bb-refresh-button:hover {

                color:
                    #F4F7FA;

                border-color:
                    rgba(8,214,155,.25);

                background:
                    rgba(8,214,155,.04);

            }


            .bb-refresh-button:disabled {

                opacity: .55;
                cursor: not-allowed;

            }


            .bb-spin {

                animation:
                    bbAnalyticsSpin
                    .8s linear infinite;

            }


            @keyframes bbAnalyticsSpin {

                to {
                    transform: rotate(360deg);
                }

            }


            /* =====================================================
               KPI
            ===================================================== */

            .bb-analytics-kpis {

                display: grid;

                grid-template-columns:
                    repeat(4,minmax(0,1fr));

                gap: 12px;

                margin-bottom: 13px;

            }


            .bb-analytics-kpi {

                min-width: 0;

                padding: 17px;

                border:
                    1px solid
                    rgba(148,163,184,.12);

                border-radius: 14px;

                background:
                    var(
                        --bb-surface,
                        #0B1119
                    );

                box-shadow:
                    0 12px 30px
                    rgba(0,0,0,.08);

                transition:
                    transform .18s ease,
                    border-color .18s ease;

            }


            .bb-analytics-kpi:hover {

                transform:
                    translateY(-2px);

                border-color:
                    rgba(148,163,184,.22);

            }


            .bb-kpi-top {

                display: flex;
                align-items: center;
                justify-content: space-between;

                margin-bottom: 14px;

            }


            .bb-kpi-icon {

                width: 37px;
                height: 37px;

                display: grid;
                place-items: center;

                border-radius: 10px;

                color:
                    #08D69B;

                background:
                    rgba(8,214,155,.075);

            }


            .bb-kpi-red
            .bb-kpi-icon {

                color:
                    #FF6672;

                background:
                    rgba(255,102,114,.075);

            }


            .bb-kpi-blue
            .bb-kpi-icon {

                color:
                    #42B9FF;

                background:
                    rgba(66,185,255,.075);

            }


            .bb-kpi-purple
            .bb-kpi-icon {

                color:
                    #9B72FF;

                background:
                    rgba(155,114,255,.075);

            }


            .bb-kpi-label {

                display: block;

                color:
                    #91A0B3;

                font-size: 10px;
                line-height: 1.2;
                font-weight: 850;
                letter-spacing: .85px;

            }


            .bb-kpi-value {

                display: block;

                margin-top: 7px;

                color:
                    #F4F7FA;

                font-size: 23px;
                line-height: 1.12;
                font-weight: 850;
                letter-spacing: -.6px;

                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;

            }


            .bb-kpi-description {

                display: block;

                margin-top: 6px;

                color:
                    #718096;

                font-size: 10px;
                line-height: 1.45;
                font-weight: 550;

            }


            .bb-kpi-trend {

                display: inline-flex;
                align-items: center;
                gap: 3px;

                font-size: 10px;
                font-weight: 850;

            }


            .bb-kpi-trend.positive {

                color:
                    #08D69B;

            }


            .bb-kpi-trend.negative {

                color:
                    #FF6672;

            }


            /* =====================================================
               GRID
            ===================================================== */

            .bb-analytics-main-grid {

                display: grid;

                grid-template-columns:
                    minmax(0,1.42fr)
                    minmax(320px,.78fr);

                gap: 13px;

                margin-bottom: 13px;

            }


            .bb-analytics-two-column {

                display: grid;

                grid-template-columns:
                    minmax(0,1.08fr)
                    minmax(0,.92fr);

                gap: 13px;

                margin-bottom: 13px;

            }


            /* =====================================================
               PANEL
            ===================================================== */

            .bb-analytics-panel {

                min-width: 0;
                overflow: hidden;

                border:
                    1px solid
                    rgba(148,163,184,.12);

                border-radius: 15px;

                background:
                    var(
                        --bb-surface,
                        #0B1119
                    );

                box-shadow:
                    0 12px 32px
                    rgba(0,0,0,.08);

            }


            .bb-panel-header {

                min-height: 69px;

                display: flex;
                align-items: center;

                padding:
                    13px 17px;

                border-bottom:
                    1px solid
                    rgba(148,163,184,.07);

            }


            .bb-panel-heading {

                display: flex;
                align-items: center;
                gap: 10px;

                min-width: 0;

            }


            .bb-panel-icon {

                width: 34px;
                height: 34px;
                min-width: 34px;

                display: grid;
                place-items: center;

                border-radius: 9px;

                color:
                    #08D69B;

                background:
                    rgba(8,214,155,.075);

            }


            .bb-panel-heading h2 {

                margin: 0;

                color:
                    #F4F7FA;

                font-size: 14px;
                line-height: 1.2;
                font-weight: 800;

            }


            .bb-panel-heading p {

                margin: 4px 0 0;

                color:
                    #8996A8;

                font-size: 10px;
                line-height: 1.35;
                font-weight: 520;

            }


            .bb-panel-content {

                padding: 13px;

            }


            /* =====================================================
               CHARTS
            ===================================================== */

            .bb-chart {

                width: 100%;

            }


            .bb-chart-large {

                height: 310px;

            }


            .bb-chart-medium {

                height: 265px;

            }


            .bb-analytics-tooltip {

                min-width: 155px;

                padding: 10px 11px;

                border:
                    1px solid
                    rgba(148,163,184,.16);

                border-radius: 9px;

                background:
                    rgba(9,15,23,.97);

                box-shadow:
                    0 16px 38px
                    rgba(0,0,0,.3);

                backdrop-filter:
                    blur(12px);

            }


            .bb-tooltip-title {

                margin-bottom: 7px;

                color:
                    #F4F7FA;

                font-size: 10px;
                font-weight: 850;

            }


            .bb-tooltip-item {

                display: flex;
                align-items: center;
                justify-content: space-between;

                gap: 15px;

                margin-top: 5px;

                color:
                    #8996A8;

                font-size: 9px;

            }


            .bb-tooltip-item span {

                display: inline-flex;
                align-items: center;
                gap: 6px;

            }


            .bb-tooltip-item i {

                width: 6px;
                height: 6px;

                border-radius: 50%;

            }


            .bb-tooltip-item strong {

                color:
                    #F4F7FA;

                font-size: 9px;
                font-weight: 800;

            }


            /* =====================================================
               SAVINGS
            ===================================================== */

            .bb-savings-analytics {

                min-height: 265px;

            }


            .bb-savings-overview {

                display: flex;
                align-items: center;
                justify-content: center;

                gap: 18px;

                padding:
                    7px 0 17px;

                border-bottom:
                    1px solid
                    rgba(148,163,184,.07);

            }


            .bb-savings-ring {

                position: relative;

                width: 108px;
                height: 108px;

                flex-shrink: 0;

            }


            .bb-savings-ring svg {

                width: 100%;
                height: 100%;

            }


            .bb-savings-ring strong {

                position: absolute;

                inset: 0;

                display: grid;
                place-items: center;

                color:
                    #F4F7FA;

                font-size: 20px;
                font-weight: 850;

            }


            .bb-savings-summary {

                display: flex;
                flex-direction: column;
                gap: 3px;

            }


            .bb-savings-summary span {

                color:
                    #8996A8;

                font-size: 10px;
                font-weight: 600;

            }


            .bb-savings-summary strong {

                color:
                    #F4F7FA;

                font-size: 21px;
                font-weight: 850;

            }


            .bb-savings-summary small {

                color:
                    #718096;

                font-size: 9px;

            }


            .bb-goal-list {

                display: flex;
                flex-direction: column;

                gap: 3px;

                margin-top: 11px;

            }


            .bb-goal-row {

                display: flex;
                align-items: center;
                justify-content: space-between;

                gap: 10px;

                padding:
                    8px 9px;

                border-radius: 8px;

                background:
                    rgba(255,255,255,.018);

            }


            .bb-goal-row > div {

                min-width: 0;

                display: flex;
                flex-direction: column;

                gap: 3px;

            }


            .bb-goal-row strong {

                overflow: hidden;

                color:
                    #F4F7FA;

                font-size: 10px;
                font-weight: 750;

                white-space: nowrap;
                text-overflow: ellipsis;

            }


            .bb-goal-row span {

                color:
                    #718096;

                font-size: 8px;

            }


            .bb-goal-row > strong {

                color:
                    #9B72FF;

                font-size: 10px;

            }


            /* =====================================================
               CATEGORY
            ===================================================== */

            .bb-category-layout {

                display: grid;

                grid-template-columns:
                    195px minmax(0,1fr);

                align-items: center;

                gap: 12px;

                min-height: 265px;

            }


            .bb-category-chart {

                height: 225px;

            }


            .bb-category-list {

                display: flex;
                flex-direction: column;

                gap: 9px;

                max-height: 240px;

                overflow-y: auto;

                padding-right: 4px;

            }


            .bb-category-row {

                display: grid;

                grid-template-columns:
                    minmax(0,1fr)
                    auto
                    32px;

                align-items: center;

                gap: 7px;

                min-height: 29px;

            }


            .bb-category-row > div {

                display: flex;
                align-items: center;

                min-width: 0;

                gap: 7px;

            }


            .bb-category-row i {

                width: 7px;
                height: 7px;

                min-width: 7px;

                border-radius: 50%;

            }


            .bb-category-row span {

                overflow: hidden;

                color:
                    #91A0B3;

                font-size: 10px;
                font-weight: 600;

                white-space: nowrap;
                text-overflow: ellipsis;

            }


            .bb-category-row strong {

                color:
                    #F4F7FA;

                font-size: 10px;
                font-weight: 750;

            }


            .bb-category-row small {

                color:
                    #718096;

                font-size: 9px;
                font-weight: 750;

                text-align: right;

            }


            /* =====================================================
               BUDGET
            ===================================================== */

            .bb-budget-analytics {

                padding:
                    2px;

            }


            .bb-budget-summary {

                display: grid;

                grid-template-columns:
                    repeat(3,1fr);

                gap: 8px;

                margin-bottom: 17px;

            }


            .bb-budget-summary > div {

                padding:
                    11px;

                border:
                    1px solid
                    rgba(148,163,184,.08);

                border-radius: 9px;

                background:
                    rgba(255,255,255,.018);

            }


            .bb-budget-summary span {

                display: block;

                color:
                    #718096;

                font-size: 9px;
                font-weight: 650;

            }


            .bb-budget-summary strong {

                display: block;

                margin-top: 5px;

                color:
                    #F4F7FA;

                font-size: 14px;
                font-weight: 800;

            }


            .bb-budget-summary strong.healthy {

                color:
                    #08D69B;

            }


            .bb-budget-summary strong.warning {

                color:
                    #F0B85A;

            }


            .bb-budget-summary strong.danger {

                color:
                    #FF6672;

            }


            .bb-budget-list {

                display: flex;
                flex-direction: column;

                gap: 14px;

            }


            .bb-budget-row {

                display: grid;

                grid-template-columns:
                    minmax(130px,175px)
                    minmax(0,1fr)
                    43px;

                align-items: center;

                gap: 10px;

            }


            .bb-budget-row-head {

                display: flex;
                flex-direction: column;

                gap: 3px;

                min-width: 0;

            }


            .bb-budget-row-head strong {

                overflow: hidden;

                color:
                    #F4F7FA;

                font-size: 10px;
                font-weight: 750;

                white-space: nowrap;
                text-overflow: ellipsis;

            }


            .bb-budget-row-head span {

                color:
                    #718096;

                font-size: 8px;
                white-space: nowrap;

            }


            .bb-budget-track {

                height: 8px;

                overflow: hidden;

                border-radius: 999px;

                background:
                    #18212D;

            }


            .bb-budget-fill {

                height: 100%;

                border-radius: inherit;

                transition:
                    width .55s ease;

            }


            .bb-budget-fill.healthy {

                background:
                    #08D69B;

            }


            .bb-budget-fill.warning {

                background:
                    #F0B85A;

            }


            .bb-budget-fill.danger {

                background:
                    #FF6672;

            }


            .bb-budget-percent {

                font-size: 9px;
                font-weight: 800;

                text-align: right;

            }


            .bb-budget-percent.healthy {

                color:
                    #08D69B;

            }


            .bb-budget-percent.warning {

                color:
                    #F0B85A;

            }


            .bb-budget-percent.danger {

                color:
                    #FF6672;

            }


            /* =====================================================
               EMPTY
            ===================================================== */

            .bb-analytics-empty {

                min-height: 225px;

                display: flex;
                flex-direction: column;

                align-items: center;
                justify-content: center;

                padding: 22px;

                text-align: center;

            }


            .bb-empty-icon {

                width: 48px;
                height: 48px;

                display: grid;
                place-items: center;

                margin-bottom: 11px;

                border:
                    1px solid
                    rgba(148,163,184,.08);

                border-radius: 13px;

                color:
                    #718096;

                background:
                    rgba(148,163,184,.045);

            }


            .bb-analytics-empty strong {

                color:
                    #F4F7FA;

                font-size: 12px;
                font-weight: 800;

            }


            .bb-analytics-empty span {

                max-width: 340px;

                margin-top: 6px;

                color:
                    #718096;

                font-size: 10px;
                line-height: 1.5;

            }


            /* =====================================================
               NO DATA
            ===================================================== */

            .bb-analytics-no-data {

                min-height: 370px;

                display: flex;
                flex-direction: column;

                align-items: center;
                justify-content: center;

                padding: 35px;

                border:
                    1px solid
                    rgba(148,163,184,.12);

                border-radius: 16px;

                background:
                    var(
                        --bb-surface,
                        #0B1119
                    );

                text-align: center;

            }


            .bb-no-data-icon {

                width: 64px;
                height: 64px;

                display: grid;
                place-items: center;

                margin-bottom: 14px;

                border-radius: 17px;

                color:
                    #08D69B;

                background:
                    rgba(8,214,155,.07);

                border:
                    1px solid
                    rgba(8,214,155,.13);

            }


            .bb-analytics-no-data h2 {

                margin: 0;

                color:
                    #F4F7FA;

                font-size: 18px;
                font-weight: 850;

            }


            .bb-analytics-no-data p {

                max-width: 450px;

                margin: 8px 0 0;

                color:
                    #8996A8;

                font-size: 11px;
                line-height: 1.6;

            }


            /* =====================================================
               LOADING / ERROR
            ===================================================== */

            .bb-analytics-loading,
            .bb-analytics-error {

                min-height: 520px;

                display: flex;
                flex-direction: column;

                align-items: center;
                justify-content: center;

                text-align: center;

            }


            .bb-loading-icon,
            .bb-error-icon {

                width: 56px;
                height: 56px;

                display: grid;
                place-items: center;

                margin-bottom: 14px;

                border-radius: 16px;

                color:
                    #08D69B;

                background:
                    rgba(8,214,155,.07);

                border:
                    1px solid
                    rgba(8,214,155,.12);

            }


            .bb-loading-icon svg {

                animation:
                    bbAnalyticsSpin
                    .9s linear infinite;

            }


            .bb-analytics-loading h1,
            .bb-analytics-error h1 {

                margin: 0;

                color:
                    #F4F7FA;

                font-size: 18px;
                font-weight: 850;

            }


            .bb-analytics-loading p,
            .bb-analytics-error p {

                margin: 7px 0 17px;

                color:
                    #8996A8;

                font-size: 11px;

            }


            .bb-error-icon {

                color:
                    #FF6672;

                background:
                    rgba(255,102,114,.07);

                border-color:
                    rgba(255,102,114,.13);

            }


            .bb-analytics-error button {

                height: 38px;

                display: inline-flex;
                align-items: center;
                gap: 7px;

                padding:
                    0 14px;

                border: 0;
                border-radius: 9px;

                background:
                    #08D69B;

                color:
                    #03130D;

                font-family:
                    inherit;

                font-size: 10px;
                font-weight: 850;

                cursor: pointer;

            }


            /* =====================================================
               FOOTER
            ===================================================== */

            .bb-analytics-footer {

                display: flex;
                align-items: center;
                justify-content: space-between;

                gap: 12px;

                margin-top: 12px;
                padding:
                    10px 12px;

                border:
                    1px solid
                    rgba(148,163,184,.08);

                border-radius: 9px;

                color:
                    #718096;

                background:
                    rgba(255,255,255,.015);

                font-size: 9px;
                line-height: 1.4;

            }


            .bb-analytics-footer > div {

                display: flex;
                align-items: center;
                gap: 7px;

            }


            .bb-analytics-footer svg {

                flex-shrink: 0;

                color:
                    #08D69B;

            }


            .bb-analytics-footer strong {

                color:
                    #8996A8;

                font-weight: 750;

            }


            /* =====================================================
               RESPONSIVE
            ===================================================== */

            @media (max-width: 1100px) {

                .bb-analytics-kpis {

                    grid-template-columns:
                        repeat(2,minmax(0,1fr));

                }

                .bb-analytics-main-grid,
                .bb-analytics-two-column {

                    grid-template-columns:
                        1fr;

                }

            }


            @media (max-width: 720px) {

                .bb-analytics-header {

                    flex-direction: column;

                    align-items:
                        flex-start;

                }

                .bb-analytics-actions {

                    width: 100%;

                    justify-content:
                        space-between;

                }

                .bb-category-layout {

                    grid-template-columns:
                        1fr;

                }

                .bb-category-chart {

                    height: 210px;

                }

            }


            @media (max-width: 520px) {

                .bb-analytics-header h1 {

                    font-size:
                        28px;

                }

                .bb-analytics-header p {

                    font-size:
                        11px;

                }

                .bb-analytics-actions {

                    flex-direction:
                        column;

                    align-items:
                        stretch;

                }

                .bb-period-selector {

                    width: 100%;

                }

                .bb-period-selector button {

                    flex: 1;

                }

                .bb-refresh-button {

                    justify-content:
                        center;

                }

                .bb-analytics-kpis {

                    grid-template-columns:
                        1fr;

                }

                .bb-panel-content {

                    padding:
                        9px;

                }

                .bb-chart-large {

                    height:
                        270px;

                }

                .bb-chart-medium {

                    height:
                        245px;

                }

                .bb-budget-summary {

                    grid-template-columns:
                        1fr;

                }

                .bb-budget-row {

                    grid-template-columns:
                        1fr;

                    gap: 5px;

                }

                .bb-budget-percent {

                    text-align:
                        left;

                }

                .bb-analytics-footer {

                    align-items:
                        flex-start;

                    flex-direction:
                        column;

                }

            }


            /* =====================================================
               REDUCED MOTION
            ===================================================== */

            @media (prefers-reduced-motion: reduce) {

                .bb-analytics-page *,
                .bb-analytics-page *::before,
                .bb-analytics-page *::after {

                    animation-duration:
                        .01ms !important;

                    animation-iteration-count:
                        1 !important;

                    transition-duration:
                        .01ms !important;

                }

            }

            `}
        </style>
    );
}