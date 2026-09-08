import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Award,
    BarChart3,
    CheckCircle2,
    CircleDollarSign,
    Lightbulb,
    PiggyBank,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Target,
    TrendingDown,
    TrendingUp,
    Wallet,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { getExpenses } from "../services/expenseService";
import { getIncomes } from "../services/incomeService";
import { getBudgets } from "../services/budgetService";
import { getSavingsGoals } from "../services/savingsService";


/* =========================================================
   CONSTANTS
========================================================= */

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const CATEGORY_COLORS = [
    "#00D9A6",
    "#9B6CFF",
    "#F5C451",
    "#38BDF8",
    "#FF6670",
    "#45D8D0",
];

const DEFAULT_CURRENCY = "INR";


/* =========================================================
   HELPERS
========================================================= */

const number = (value) => {
    const parsed = Number(value);

    return Number.isFinite(parsed)
        ? parsed
        : 0;
};


const clamp = (
    value,
    min = 0,
    max = 100
) =>
    Math.min(
        max,
        Math.max(
            min,
            number(value)
        )
    );


const formatCurrency = (
    value,
    currency = DEFAULT_CURRENCY
) => {

    const amount =
        number(value);

    try {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency,
                maximumFractionDigits: 0,
            }
        ).format(amount);

    } catch {

        return `₹${amount.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 0,
            }
        )}`;
    }
};


const formatCompactCurrency = (
    value,
    currency = DEFAULT_CURRENCY
) => {

    const amount =
        number(value);

    if (amount < 1000) {
        return formatCurrency(
            amount,
            currency
        );
    }

    try {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency,
                notation: "compact",
                maximumFractionDigits: 1,
            }
        ).format(amount);

    } catch {

        return formatCurrency(
            amount,
            currency
        );
    }
};


const getDate = (value) => {

    if (!value) {
        return null;
    }

    /*
     * Django DateField values are normally
     * YYYY-MM-DD. Parse them locally so that
     * timezone conversion cannot move the
     * transaction into another day/month.
     */
    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {

        const [
            year,
            month,
            day,
        ] = value
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


const sameMonth = (
    value,
    month,
    year
) => {

    const date =
        getDate(value);

    return Boolean(
        date &&
        date.getMonth() === month &&
        date.getFullYear() === year
    );
};


const percentageChange = (
    current,
    previous
) => {

    const currentValue =
        number(current);

    const previousValue =
        number(previous);

    if (
        previousValue === 0
    ) {

        return currentValue > 0
            ? 100
            : 0;
    }

    return (
        (
            (
                currentValue -
                previousValue
            ) /
            previousValue
        ) *
        100
    );
};


const normalizeCategory = (
    category
) => {

    if (!category) {
        return "Others";
    }

    return String(category)
        .trim()
        .replace(/\s+/g, " ")
        .replace(
            /\b\w/g,
            (character) =>
                character.toUpperCase()
        );
};


const getMonthKey = (
    month,
    year
) =>
    `${year}-${String(
        month + 1
    ).padStart(2, "0")}`;


const getLastMonths = (
    count = 12
) => {

    const result = [];

    const today =
        new Date();

    for (
        let index = count - 1;
        index >= 0;
        index--
    ) {

        const date =
            new Date(
                today.getFullYear(),
                today.getMonth() -
                    index,
                1
            );

        result.push({
            month:
                date.getMonth(),

            year:
                date.getFullYear(),

            key:
                getMonthKey(
                    date.getMonth(),
                    date.getFullYear()
                ),

            label:
                MONTHS[
                    date.getMonth()
                ].slice(0, 3),
        });
    }

    return result;
};


/* =========================================================
   REUSABLE UI
========================================================= */

function SectionHeader({
    icon: Icon,
    eyebrow,
    title,
    description,
}) {

    return (
        <div className="bb-insights-section-header">

            <div className="bb-section-heading">

                <div className="bb-insights-eyebrow">
                    <Icon size={15} />
                    <span>
                        {eyebrow}
                    </span>
                </div>

                <h2>
                    {title}
                </h2>

                {description && (
                    <p>
                        {description}
                    </p>
                )}

            </div>

        </div>
    );
}


function TrendBadge({
    value,
    positiveIsGood = true,
}) {

    const change =
        number(value);

    if (change === 0) {

        return (
            <span className="bb-trend-neutral">
                Stable
            </span>
        );
    }

    const positive =
        change > 0;

    const good =
        positive ===
        positiveIsGood;

    return (
        <span
            className={
                good
                    ? "bb-trend-good"
                    : "bb-trend-bad"
            }
        >

            {positive ? (
                <ArrowUpRight
                    size={13}
                />
            ) : (
                <ArrowDownRight
                    size={13}
                />
            )}

            {Math.abs(
                Math.round(change)
            )}%

        </span>
    );
}


function MetricCard({
    icon: Icon,
    label,
    value,
    description,
    tone = "green",
    trend,
    positiveIsGood = true,
}) {

    return (
        <article
            className={
                `bb-insight-metric bb-tone-${tone}`
            }
        >

            <div className="bb-metric-top">

                <div className="bb-metric-icon">
                    <Icon
                        size={20}
                        strokeWidth={2}
                    />
                </div>

                {trend !== undefined && (
                    <TrendBadge
                        value={trend}
                        positiveIsGood={
                            positiveIsGood
                        }
                    />
                )}

            </div>

            <span className="bb-metric-label">
                {label}
            </span>

            <strong className="bb-metric-value">
                {value}
            </strong>

            <span className="bb-metric-description">
                {description}
            </span>

        </article>
    );
}


function ProgressBar({
    value,
    tone = "green",
}) {

    return (
        <div className="bb-progress-track">

            <div
                className={
                    `bb-progress-fill bb-progress-${tone}`
                }
                style={{
                    width:
                        `${clamp(value)}%`,
                }}
            />

        </div>
    );
}


function EmptyState({
    icon: Icon,
    title,
    description,
}) {

    return (
        <div className="bb-insights-empty">

            <div className="bb-empty-icon">
                <Icon size={24} />
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
   MAIN
========================================================= */

export default function Insights() {

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

    const [
        currency,
        setCurrency,
    ] = useState(
        localStorage.getItem(
            "currency"
        ) || DEFAULT_CURRENCY
    );


    /* =====================================================
       DATE
    ===================================================== */

    const today =
        new Date();

    const currentMonth =
        today.getMonth();

    const currentYear =
        today.getFullYear();

    const previousDate =
        new Date(
            currentYear,
            currentMonth - 1,
            1
        );

    const previousMonth =
        previousDate.getMonth();

    const previousYear =
        previousDate.getFullYear();

    const currentMonthName =
        MONTHS[currentMonth];


    /* =====================================================
       LOAD DATA
    ===================================================== */

    const loadData = async (
        silent = false
    ) => {

        try {

            if (!silent) {
                setLoading(true);
            }

            setError("");

            const [
                expenseResponse,
                incomeResponse,
                budgetResponse,
                savingsResponse,
            ] = await Promise.all([
                getExpenses(),
                getIncomes(),
                getBudgets(),
                getSavingsGoals(),
            ]);

            setExpenses(
                Array.isArray(
                    expenseResponse?.data
                )
                    ? expenseResponse.data
                    : []
            );

            setIncomes(
                Array.isArray(
                    incomeResponse?.data
                )
                    ? incomeResponse.data
                    : []
            );

            setBudgets(
                Array.isArray(
                    budgetResponse?.data
                )
                    ? budgetResponse.data
                    : []
            );

            setSavingsGoals(
                Array.isArray(
                    savingsResponse?.data
                )
                    ? savingsResponse.data
                    : []
            );

        } catch (requestError) {

            console.error(
                "Insights loading failed:",
                requestError
            );

            setError(
                "We couldn't load your financial insights right now."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    };


    useEffect(() => {

        loadData();

        const syncSettings =
            () => {

                setCurrency(
                    localStorage.getItem(
                        "currency"
                    ) || DEFAULT_CURRENCY
                );
            };

        window.addEventListener(
            "budgetbuddy-settings-updated",
            syncSettings
        );

        window.addEventListener(
            "storage",
            syncSettings
        );

        return () => {

            window.removeEventListener(
                "budgetbuddy-settings-updated",
                syncSettings
            );

            window.removeEventListener(
                "storage",
                syncSettings
            );
        };

    }, []);


    /* =====================================================
       MONTHLY DATA
    ===================================================== */

    const currentExpenses =
        useMemo(
            () =>
                expenses.filter(
                    (expense) =>
                        sameMonth(
                            expense.expense_date,
                            currentMonth,
                            currentYear
                        )
                ),
            [
                expenses,
                currentMonth,
                currentYear,
            ]
        );


    const previousExpenses =
        useMemo(
            () =>
                expenses.filter(
                    (expense) =>
                        sameMonth(
                            expense.expense_date,
                            previousMonth,
                            previousYear
                        )
                ),
            [
                expenses,
                previousMonth,
                previousYear,
            ]
        );


    const currentIncomes =
        useMemo(
            () =>
                incomes.filter(
                    (income) =>
                        sameMonth(
                            income.income_date,
                            currentMonth,
                            currentYear
                        )
                ),
            [
                incomes,
                currentMonth,
                currentYear,
            ]
        );


    const previousIncomes =
        useMemo(
            () =>
                incomes.filter(
                    (income) =>
                        sameMonth(
                            income.income_date,
                            previousMonth,
                            previousYear
                        )
                ),
            [
                incomes,
                previousMonth,
                previousYear,
            ]
        );


    const totalExpense =
        useMemo(
            () =>
                currentExpenses.reduce(
                    (
                        total,
                        expense
                    ) =>
                        total +
                        number(
                            expense.amount
                        ),
                    0
                ),
            [currentExpenses]
        );


    const previousExpense =
        useMemo(
            () =>
                previousExpenses.reduce(
                    (
                        total,
                        expense
                    ) =>
                        total +
                        number(
                            expense.amount
                        ),
                    0
                ),
            [previousExpenses]
        );


    const totalIncome =
        useMemo(
            () =>
                currentIncomes.reduce(
                    (
                        total,
                        income
                    ) =>
                        total +
                        number(
                            income.amount
                        ),
                    0
                ),
            [currentIncomes]
        );


    const previousIncome =
        useMemo(
            () =>
                previousIncomes.reduce(
                    (
                        total,
                        income
                    ) =>
                        total +
                        number(
                            income.amount
                        ),
                    0
                ),
            [previousIncomes]
        );


    const balance =
        totalIncome -
        totalExpense;


    const expenseChange =
        percentageChange(
            totalExpense,
            previousExpense
        );


    const incomeChange =
        percentageChange(
            totalIncome,
            previousIncome
        );


    const savingsRate =
        totalIncome > 0
            ? clamp(
                  (
                      balance /
                      totalIncome
                  ) *
                      100
              )
            : 0;


    /* =====================================================
       TWELVE-MONTH MONEY FLOW
    ===================================================== */

    const months =
        useMemo(
            () =>
                getLastMonths(12),
            []
        );


    const monthlyTrend =
        useMemo(
            () =>
                months.map(
                    (month) => {

                        const income =
                            incomes
                                .filter(
                                    (
                                        item
                                    ) =>
                                        sameMonth(
                                            item.income_date,
                                            month.month,
                                            month.year
                                        )
                                )
                                .reduce(
                                    (
                                        total,
                                        item
                                    ) =>
                                        total +
                                        number(
                                            item.amount
                                        ),
                                    0
                                );

                        const expense =
                            expenses
                                .filter(
                                    (
                                        item
                                    ) =>
                                        sameMonth(
                                            item.expense_date,
                                            month.month,
                                            month.year
                                        )
                                )
                                .reduce(
                                    (
                                        total,
                                        item
                                    ) =>
                                        total +
                                        number(
                                            item.amount
                                        ),
                                    0
                                );

                        return {
                            ...month,
                            income,
                            expense,
                            balance:
                                income -
                                expense,
                        };
                    }
                ),
            [
                months,
                incomes,
                expenses,
            ]
        );


    const trendMaximum =
        Math.max(
            ...monthlyTrend.flatMap(
                (item) => [
                    item.income,
                    item.expense,
                ]
            ),
            1
        );


    /* =====================================================
       CATEGORY ANALYSIS
    ===================================================== */

    const categoryAnalysis =
        useMemo(() => {

            const map =
                new Map();

            currentExpenses.forEach(
                (expense) => {

                    const category =
                        normalizeCategory(
                            expense.category
                        );

                    map.set(
                        category,
                        (
                            map.get(
                                category
                            ) || 0
                        ) +
                        number(
                            expense.amount
                        )
                    );
                }
            );

            return Array.from(
                map.entries()
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
                    (a, b) =>
                        b.amount -
                        a.amount
                );

        }, [
            currentExpenses,
            totalExpense,
        ]);


    const previousCategoryMap =
        useMemo(() => {

            const map =
                new Map();

            previousExpenses.forEach(
                (expense) => {

                    const category =
                        normalizeCategory(
                            expense.category
                        );

                    map.set(
                        category,
                        (
                            map.get(
                                category
                            ) || 0
                        ) +
                        number(
                            expense.amount
                        )
                    );
                }
            );

            return map;

        }, [
            previousExpenses,
        ]);


    const categoryTrends =
        useMemo(
            () =>
                categoryAnalysis.map(
                    (item) => {

                        const previous =
                            previousCategoryMap.get(
                                item.category
                            ) || 0;

                        return {
                            ...item,
                            previous,
                            change:
                                percentageChange(
                                    item.amount,
                                    previous
                                ),
                        };
                    }
                ),
            [
                categoryAnalysis,
                previousCategoryMap,
            ]
        );


    const topCategory =
        categoryAnalysis[0] ||
        null;


    const fastestGrowingCategory =
        [...categoryTrends]
            .filter(
                (item) =>
                    item.change > 0 &&
                    item.amount > 0
            )
            .sort(
                (a, b) =>
                    b.change -
                    a.change
            )[0] ||
        null;


    const biggestReduction =
        [...categoryTrends]
            .filter(
                (item) =>
                    item.previous > 0 &&
                    item.amount <
                        item.previous
            )
            .sort(
                (a, b) =>
                    a.change -
                    b.change
            )[0] ||
        null;


    /* =====================================================
       BUDGET ANALYSIS
    ===================================================== */

    const budgetAnalysis =
        useMemo(
            () =>
                budgets
                    .filter(
                        (budget) =>
                            number(
                                budget.month
                            ) ===
                                currentMonth +
                                    1 &&
                            number(
                                budget.year
                            ) ===
                                currentYear
                    )
                    .map(
                        (budget) => {

                            const category =
                                normalizeCategory(
                                    budget.category
                                );

                            const spent =
                                currentExpenses
                                    .filter(
                                        (
                                            expense
                                        ) =>
                                            normalizeCategory(
                                                expense.category
                                            ) ===
                                            category
                                    )
                                    .reduce(
                                        (
                                            total,
                                            expense
                                        ) =>
                                            total +
                                            number(
                                                expense.amount
                                            ),
                                        0
                                    );

                            const limit =
                                number(
                                    budget.budget_amount
                                );

                            const utilization =
                                limit > 0
                                    ? (
                                          spent /
                                          limit
                                      ) *
                                      100
                                    : 0;

                            return {
                                ...budget,
                                category,
                                limit,
                                spent,
                                remaining:
                                    limit -
                                    spent,
                                utilization,
                            };
                        }
                    )
                    .sort(
                        (a, b) =>
                            b.utilization -
                            a.utilization
                    ),
            [
                budgets,
                currentExpenses,
                currentMonth,
                currentYear,
            ]
        );


    const totalBudget =
        budgetAnalysis.reduce(
            (
                total,
                budget
            ) =>
                total +
                budget.limit,
            0
        );


    const totalBudgetSpent =
        budgetAnalysis.reduce(
            (
                total,
                budget
            ) =>
                total +
                budget.spent,
            0
        );


    const budgetUtilization =
        totalBudget > 0
            ? (
                  totalBudgetSpent /
                  totalBudget
              ) *
              100
            : 0;


    const criticalBudget =
        budgetAnalysis.find(
            (budget) =>
                budget.utilization >
                100
        ) || null;


    const pressuredBudget =
        [...budgetAnalysis]
            .filter(
                (budget) =>
                    budget.utilization >=
                        80 &&
                    budget.utilization <=
                        100
            )
            .sort(
                (a, b) =>
                    b.utilization -
                    a.utilization
            )[0] || null;


    /* =====================================================
       SAVINGS
    ===================================================== */

    const savingsAnalysis =
        useMemo(
            () =>
                savingsGoals.map(
                    (goal) => {

                        const target =
                            number(
                                goal.target_amount
                            );

                        const saved =
                            number(
                                goal.saved_amount
                            );

                        const progress =
                            target > 0
                                ? clamp(
                                      (
                                          saved /
                                          target
                                      ) *
                                          100
                                  )
                                : 0;

                        return {
                            ...goal,
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
                ),
            [savingsGoals]
        );


    const totalSavingsTarget =
        savingsAnalysis.reduce(
            (
                total,
                goal
            ) =>
                total +
                goal.target,
            0
        );


    const totalSaved =
        savingsAnalysis.reduce(
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
                  ) *
                      100
              )
            : 0;


    const closestGoal =
        [...savingsAnalysis]
            .filter(
                (goal) =>
                    goal.remaining > 0
            )
            .sort(
                (a, b) =>
                    a.remaining -
                    b.remaining
            )[0] ||
        null;


    const bestGoal =
        [...savingsAnalysis]
            .sort(
                (a, b) =>
                    b.progress -
                    a.progress
            )[0] ||
        null;


    const completedGoals =
        savingsAnalysis.filter(
            (goal) =>
                goal.progress >=
                100
        ).length;


    /* =====================================================
       FINANCIAL HEALTH
    ===================================================== */

    const healthScore =
        useMemo(() => {

            let score = 50;

            if (
                totalIncome > 0
            ) {

                if (
                    balance > 0
                ) {

                    score +=
                        Math.min(
                            20,
                            (
                                balance /
                                totalIncome
                            ) *
                                30
                        );

                } else {

                    score -=
                        Math.min(
                            25,
                            (
                                Math.abs(
                                    balance
                                ) /
                                totalIncome
                            ) *
                                35
                        );
                }
            }


            if (
                totalBudget > 0
            ) {

                if (
                    budgetUtilization <=
                    70
                ) {

                    score += 15;

                } else if (
                    budgetUtilization <=
                    85
                ) {

                    score += 7;

                } else if (
                    budgetUtilization <=
                    100
                ) {

                    score -= 5;

                } else {

                    score -= 15;
                }
            }


            if (
                totalSavingsTarget >
                0
            ) {

                score +=
                    (
                        overallSavingsProgress /
                        100
                    ) *
                    15;
            }


            if (
                expenseChange < 0
            ) {

                score += 5;

            } else if (
                expenseChange > 20
            ) {

                score -= 8;
            }


            return Math.round(
                clamp(score)
            );

        }, [
            totalIncome,
            balance,
            totalBudget,
            budgetUtilization,
            totalSavingsTarget,
            overallSavingsProgress,
            expenseChange,
        ]);


    /* =====================================================
       RECOMMENDED ACTION
    ===================================================== */

    const recommendedAction =
        useMemo(() => {

            if (
                criticalBudget
            ) {

                return {
                    icon:
                        AlertTriangle,

                    title:
                        "One budget needs attention",

                    text:
                        `${criticalBudget.category} is ${Math.round(
                            criticalBudget.utilization
                        )}% of its limit. A small adjustment can prevent further overspending.`,
                };
            }


            if (
                pressuredBudget
            ) {

                return {
                    icon:
                        Target,

                    title:
                        "Watch your remaining budget",

                    text:
                        `${pressuredBudget.category} has only ${formatCurrency(
                            Math.max(
                                0,
                                pressuredBudget.remaining
                            ),
                            currency
                        )} remaining.`,
                };
            }


            if (
                balance > 0 &&
                totalSavingsTarget ===
                    0
            ) {

                return {
                    icon:
                        PiggyBank,

                    title:
                        "Turn surplus into progress",

                    text:
                        `You currently have ${formatCurrency(
                            balance,
                            currency
                        )} left after tracked spending.`,
                };
            }


            if (
                closestGoal
            ) {

                return {
                    icon:
                        Target,

                    title:
                        "Finish your nearest goal",

                    text:
                        `${formatCurrency(
                            closestGoal.remaining,
                            currency
                        )} remains to complete ${
                            closestGoal.goal_name ||
                            closestGoal.name ||
                            "your savings goal"
                        }.`,
                };
            }


            if (
                expenseChange < 0
            ) {

                return {
                    icon:
                        TrendingDown,

                    title:
                        "Keep your momentum",

                    text:
                        `Your spending has fallen ${Math.abs(
                            Math.round(
                                expenseChange
                            )
                        )}% compared with last month.`,
                };
            }


            return {
                icon:
                    Lightbulb,

                title:
                    "Keep building your financial picture",

                text:
                    "Continue recording income and expenses consistently to make your financial insights more precise.",
            };

        }, [
            criticalBudget,
            pressuredBudget,
            balance,
            totalSavingsTarget,
            closestGoal,
            expenseChange,
            currency,
        ]);


    /* =====================================================
       REFRESH
    ===================================================== */

    const handleRefresh =
        async () => {

            setRefreshing(true);

            await loadData(true);
        };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (
            <main className="bb-insights-page">

                <div className="bb-insights-loading">

                    <div className="bb-loading-orb">
                        <RefreshCw
                            size={24}
                        />
                    </div>

                    <h2>
                        Building your financial intelligence
                    </h2>

                    <p>
                        Analysing your income,
                        spending, budgets and
                        savings...
                    </p>

                </div>

                <InsightsStyles />

            </main>
        );
    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {

        return (
            <main className="bb-insights-page">

                <div className="bb-insights-error">

                    <div className="bb-error-icon">
                        <AlertTriangle
                            size={24}
                        />
                    </div>

                    <h2>
                        Insights are temporarily unavailable
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            loadData()
                        }
                    >
                        <RefreshCw
                            size={15}
                        />
                        Try again
                    </button>

                </div>

                <InsightsStyles />

            </main>
        );
    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <main className="bb-insights-page">

            <div className="bb-insights-shell">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="bb-insights-header">

                    <div>

                        <div className="bb-insights-title-eyebrow">
                            <Sparkles size={14} />
                            FINANCIAL INTELLIGENCE
                        </div>

                        <h1>
                            Insights
                        </h1>

                        <p>
                            Patterns worth noticing,
                            and the story of your month.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="bb-insights-refresh"
                        onClick={
                            handleRefresh
                        }
                        disabled={
                            refreshing
                        }
                        title="Refresh insights"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                refreshing
                                    ? "bb-refresh-spin"
                                    : ""
                            }
                        />

                        <span>
                            Refresh
                        </span>
                    </button>

                </header>


                {/* =================================================
                    METRICS
                ================================================= */}

                <section className="bb-insights-metrics">

                    <MetricCard
                        icon={
                            CircleDollarSign
                        }
                        label="MONTHLY BALANCE"
                        value={
                            formatCompactCurrency(
                                balance,
                                currency
                            )
                        }
                        description={
                            balance >= 0
                                ? "Remaining after tracked spending"
                                : "Spending exceeds tracked income"
                        }
                        tone={
                            balance >= 0
                                ? "green"
                                : "red"
                        }
                    />


                    <MetricCard
                        icon={
                            ArrowDownRight
                        }
                        label="SPENDING"
                        value={
                            formatCompactCurrency(
                                totalExpense,
                                currency
                            )
                        }
                        description={
                            `${currentExpenses.length} transaction${
                                currentExpenses.length ===
                                1
                                    ? ""
                                    : "s"
                            } this month`
                        }
                        trend={
                            previousExpense >
                            0
                                ? expenseChange
                                : undefined
                        }
                        positiveIsGood={
                            false
                        }
                        tone="red"
                    />


                    <MetricCard
                        icon={
                            TrendingUp
                        }
                        label="INCOME"
                        value={
                            formatCompactCurrency(
                                totalIncome,
                                currency
                            )
                        }
                        description="Tracked income this month"
                        trend={
                            previousIncome >
                            0
                                ? incomeChange
                                : undefined
                        }
                        tone="blue"
                    />


                    <MetricCard
                        icon={
                            PiggyBank
                        }
                        label="SAVINGS RATE"
                        value={
                            `${Math.round(
                                savingsRate
                            )}%`
                        }
                        description="Income retained after spending"
                        tone="purple"
                    />

                </section>


                {/* =================================================
                    MONEY FLOW + SPENDING MIX
                ================================================= */}

                <section className="bb-insights-main-grid">

                    <section className="bb-insights-panel bb-money-flow-panel">

                        <SectionHeader
                            icon={
                                Activity
                            }
                            eyebrow="MONEY FLOW"
                            title="Twelve-month financial trend"
                            description="See how your income and spending have moved over the last year."
                        />


                        <div className="bb-trend-legend">

                            <span>
                                <i className="bb-legend-income" />
                                Income
                            </span>

                            <span>
                                <i className="bb-legend-expense" />
                                Spending
                            </span>

                        </div>


                        <div className="bb-trend-chart">

                            {monthlyTrend.map(
                                (item) => {

                                    const incomeHeight =
                                        trendMaximum >
                                        0
                                            ? (
                                                  item.income /
                                                  trendMaximum
                                              ) *
                                              100
                                            : 0;

                                    const expenseHeight =
                                        trendMaximum >
                                        0
                                            ? (
                                                  item.expense /
                                                  trendMaximum
                                              ) *
                                              100
                                            : 0;

                                    return (
                                        <div
                                            key={
                                                item.key
                                            }
                                            className="bb-chart-column"
                                            title={`${item.label}: Income ${formatCurrency(
                                                item.income,
                                                currency
                                            )} · Spending ${formatCurrency(
                                                item.expense,
                                                currency
                                            )}`}
                                        >

                                            <div className="bb-chart-bars">

                                                <div
                                                    className="bb-chart-bar bb-bar-income"
                                                    style={{
                                                        height:
                                                            `${Math.max(
                                                                item.income >
                                                                    0
                                                                    ? 3
                                                                    : 0,
                                                                incomeHeight
                                                            )}%`,
                                                    }}
                                                />

                                                <div
                                                    className="bb-chart-bar bb-bar-expense"
                                                    style={{
                                                        height:
                                                            `${Math.max(
                                                                item.expense >
                                                                    0
                                                                    ? 3
                                                                    : 0,
                                                                expenseHeight
                                                            )}%`,
                                                    }}
                                                />

                                            </div>

                                            <span className="bb-chart-month">
                                                {
                                                    item.label
                                                }
                                            </span>

                                        </div>
                                    );
                                }
                            )}

                        </div>


                        <div className="bb-trend-summary">

                            <div>

                                <span>
                                    Current balance
                                </span>

                                <strong>
                                    {formatCurrency(
                                        balance,
                                        currency
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Spending trend
                                </span>

                                <strong
                                    className={
                                        expenseChange <=
                                        0
                                            ? "bb-positive"
                                            : "bb-negative"
                                    }
                                >

                                    {previousExpense ===
                                    0
                                        ? "New baseline"
                                        : `${expenseChange > 0 ? "+" : ""}${Math.round(
                                              expenseChange
                                          )}% vs last month`}

                                </strong>

                            </div>

                        </div>

                    </section>


                    <section className="bb-insights-panel">

                        <SectionHeader
                            icon={
                                BarChart3
                            }
                            eyebrow="SPENDING MIX"
                            title="Where your money goes"
                            description={`${currentMonthName} spending by category.`}
                        />


                        {categoryAnalysis.length ===
                        0 ? (

                            <EmptyState
                                icon={
                                    BarChart3
                                }
                                title="No spending data yet"
                                description="Record expenses to see your category mix."
                            />

                        ) : (

                            <div className="bb-spending-mix">

                                {categoryAnalysis
                                    .slice(
                                        0,
                                        6
                                    )
                                    .map(
                                        (
                                            item
                                        ) => (
                                            <div
                                                className="bb-mix-row"
                                                key={
                                                    item.category
                                                }
                                            >

                                                <div className="bb-mix-top">

                                                    <div className="bb-mix-name">

                                                        <span
                                                            className="bb-mix-dot"
                                                            style={{
                                                                background:
                                                                    item.color,
                                                            }}
                                                        />

                                                        <strong>
                                                            {
                                                                item.category
                                                            }
                                                        </strong>

                                                    </div>

                                                    <strong>
                                                        {formatCurrency(
                                                            item.amount,
                                                            currency
                                                        )}
                                                    </strong>

                                                </div>


                                                <ProgressBar
                                                    value={
                                                        item.percentage
                                                    }
                                                />


                                                <div className="bb-mix-meta">

                                                    <span>
                                                        {Math.round(
                                                            item.percentage
                                                        )}% of spending
                                                    </span>

                                                    <span>
                                                        {item.change ===
                                                        0
                                                            ? "Stable"
                                                            : `${item.change > 0 ? "+" : ""}${Math.round(
                                                                  item.change
                                                              )}% vs last month`}
                                                    </span>

                                                </div>

                                            </div>
                                        )
                                    )}

                            </div>
                        )}

                    </section>

                </section>


                {/* =================================================
                    CATEGORY ANALYSIS + INCOME TREND
                ================================================= */}

                <section className="bb-insights-secondary-grid">

                    <section className="bb-insights-panel">

                        <SectionHeader
                            icon={
                                BarChart3
                            }
                            eyebrow="CATEGORY ANALYSIS"
                            title="This month vs last month"
                            description="See which categories are driving your spending."
                        />


                        {categoryTrends.length ===
                        0 ? (

                            <EmptyState
                                icon={
                                    BarChart3
                                }
                                title="Not enough category data"
                                description="Your category comparison will appear once expenses are recorded."
                            />

                        ) : (

                            <div className="bb-category-analysis">

                                {categoryTrends
                                    .slice(
                                        0,
                                        6
                                    )
                                    .map(
                                        (
                                            item
                                        ) => {

                                            const maximum =
                                                Math.max(
                                                    item.amount,
                                                    item.previous,
                                                    1
                                                );

                                            return (
                                                <div
                                                    className="bb-category-row"
                                                    key={
                                                        item.category
                                                    }
                                                >

                                                    <div className="bb-category-heading">

                                                        <strong>
                                                            {
                                                                item.category
                                                            }
                                                        </strong>

                                                        <span>
                                                            {formatCurrency(
                                                                item.amount,
                                                                currency
                                                            )}
                                                        </span>

                                                    </div>


                                                    <div className="bb-category-bars">

                                                        <div className="bb-category-current">

                                                            <span
                                                                style={{
                                                                    width:
                                                                        `${(
                                                                            item.amount /
                                                                            maximum
                                                                        ) *
                                                                            100}%`,
                                                                    background:
                                                                        item.color,
                                                                }}
                                                            />

                                                        </div>


                                                        <div className="bb-category-previous">

                                                            <span
                                                                style={{
                                                                    width:
                                                                        `${(
                                                                            item.previous /
                                                                            maximum
                                                                        ) *
                                                                            100}%`,
                                                                }}
                                                            />

                                                        </div>

                                                    </div>


                                                    <div className="bb-category-meta">

                                                        <span>
                                                            Current
                                                        </span>

                                                        <span>
                                                            Previous
                                                        </span>

                                                        <strong
                                                            className={
                                                                item.change >
                                                                0
                                                                    ? "bb-negative"
                                                                    : item.change <
                                                                      0
                                                                    ? "bb-positive"
                                                                    : ""
                                                            }
                                                        >
                                                            {item.previous ===
                                                            0
                                                                ? "New"
                                                                : `${
                                                                      item.change >
                                                                      0
                                                                          ? "+"
                                                                          : ""
                                                                  }${Math.round(
                                                                      item.change
                                                                  )}%`}
                                                        </strong>

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )}

                            </div>
                        )}

                    </section>


                    <section className="bb-insights-panel">

                        <SectionHeader
                            icon={
                                TrendingUp
                            }
                            eyebrow="INCOME TRENDS"
                            title="Your income over time"
                            description="Twelve months of recorded income."
                        />


                        <div className="bb-income-trend-chart">

                            {monthlyTrend.map(
                                (item) => {

                                    const maximum =
                                        Math.max(
                                            ...monthlyTrend.map(
                                                (
                                                    month
                                                ) =>
                                                    month.income
                                            ),
                                            1
                                        );

                                    const height =
                                        item.income >
                                        0
                                            ? Math.max(
                                                  4,
                                                  (
                                                      item.income /
                                                      maximum
                                                  ) *
                                                      100
                                              )
                                            : 0;

                                    return (
                                        <div
                                            className="bb-income-month-column"
                                            key={
                                                item.key
                                            }
                                            title={`${item.label}: ${formatCurrency(
                                                item.income,
                                                currency
                                            )}`}
                                        >

                                            <div className="bb-income-month-bar-wrap">

                                                <div
                                                    className="bb-income-month-bar"
                                                    style={{
                                                        height:
                                                            `${height}%`,
                                                    }}
                                                />

                                            </div>

                                            <span>
                                                {
                                                    item.label
                                                }
                                            </span>

                                        </div>
                                    );
                                }
                            )}

                        </div>


                        <div className="bb-chart-callout">

                            <Lightbulb
                                size={16}
                            />

                            <span>

                                {totalIncome >
                                0
                                    ? `Your current income is ${formatCurrency(
                                          totalIncome,
                                          currency
                                      )}.`
                                    : "Record income consistently to reveal a meaningful income trend."}

                            </span>

                        </div>

                    </section>

                </section>


                {/* =================================================
                    BUDGET UTILIZATION
                ================================================= */}

                <section className="bb-insights-panel bb-budget-panel">

                    <SectionHeader
                        icon={
                            ShieldCheck
                        }
                        eyebrow="BUDGET UTILIZATION"
                        title="How closely you're following your limits"
                        description={
                            totalBudget > 0
                                ? `${formatCurrency(
                                      totalBudgetSpent,
                                      currency
                                  )} used of ${formatCurrency(
                                      totalBudget,
                                      currency
                                  )} this month.`
                                : "Set monthly budgets to monitor your spending discipline."
                        }
                    />


                    {budgetAnalysis.length ===
                    0 ? (

                        <EmptyState
                            icon={
                                ShieldCheck
                            }
                            title="No budgets set for this month"
                            description="Create category budgets to see utilization and pressure points."
                        />

                    ) : (

                        <div className="bb-budget-grid">

                            {budgetAnalysis
                                .slice(
                                    0,
                                    8
                                )
                                .map(
                                    (
                                        budget
                                    ) => {

                                        const tone =
                                            budget.utilization >
                                            100
                                                ? "red"
                                                : budget.utilization >=
                                                  80
                                                ? "gold"
                                                : "green";

                                        return (
                                            <article
                                                className="bb-budget-item"
                                                key={`${budget.category}-${budget.month}-${budget.year}`}
                                            >

                                                <div className="bb-budget-item-top">

                                                    <div>

                                                        <strong>
                                                            {
                                                                budget.category
                                                            }
                                                        </strong>

                                                        <span>
                                                            {formatCurrency(
                                                                budget.spent,
                                                                currency
                                                            )}
                                                            {" / "}
                                                            {formatCurrency(
                                                                budget.limit,
                                                                currency
                                                            )}
                                                        </span>

                                                    </div>

                                                    <strong
                                                        className={`bb-budget-percent bb-${tone}`}
                                                    >
                                                        {Math.round(
                                                            budget.utilization
                                                        )}%
                                                    </strong>

                                                </div>


                                                <ProgressBar
                                                    value={
                                                        budget.utilization
                                                    }
                                                    tone={
                                                        tone
                                                    }
                                                />


                                                <div className="bb-budget-item-bottom">

                                                    <span>
                                                        {budget.remaining >=
                                                        0
                                                            ? `${formatCurrency(
                                                                  budget.remaining,
                                                                  currency
                                                              )} remaining`
                                                            : `${formatCurrency(
                                                                  Math.abs(
                                                                      budget.remaining
                                                                  ),
                                                                  currency
                                                              )} over limit`}
                                                    </span>

                                                    {budget.utilization >
                                                    100 ? (
                                                        <span className="bb-negative">
                                                            Over budget
                                                        </span>
                                                    ) : budget.utilization >=
                                                      80 ? (
                                                        <span className="bb-warning">
                                                            Near limit
                                                        </span>
                                                    ) : (
                                                        <span className="bb-positive">
                                                            On track
                                                        </span>
                                                    )}

                                                </div>

                                            </article>
                                        );
                                    }
                                )}

                        </div>
                    )}

                </section>


                {/* =================================================
                    SAVINGS + HEALTH
                ================================================= */}

                <section className="bb-insights-bottom-grid">

                    <section className="bb-insights-panel">

                        <SectionHeader
                            icon={
                                PiggyBank
                            }
                            eyebrow="SAVINGS PROGRESS"
                            title="Progress toward your goals"
                            description="A consolidated view of your savings momentum."
                        />


                        {savingsAnalysis.length ===
                        0 ? (

                            <EmptyState
                                icon={
                                    PiggyBank
                                }
                                title="No savings goals yet"
                                description="Create a savings goal to start measuring progress."
                            />

                        ) : (

                            <div className="bb-savings-list">

                                {savingsAnalysis
                                    .slice(
                                        0,
                                        5
                                    )
                                    .map(
                                        (
                                            goal
                                        ) => (
                                            <div
                                                className="bb-savings-row"
                                                key={
                                                    goal.id ||
                                                    goal.goal_name
                                                }
                                            >

                                                <div className="bb-savings-row-top">

                                                    <div>

                                                        <strong>
                                                            {
                                                                goal.goal_name ||
                                                                goal.name ||
                                                                "Savings goal"
                                                            }
                                                        </strong>

                                                        <span>
                                                            {formatCurrency(
                                                                goal.saved,
                                                                currency
                                                            )}
                                                            {" / "}
                                                            {formatCurrency(
                                                                goal.target,
                                                                currency
                                                            )}
                                                        </span>

                                                    </div>

                                                    <strong>
                                                        {Math.round(
                                                            goal.progress
                                                        )}%
                                                    </strong>

                                                </div>


                                                <ProgressBar
                                                    value={
                                                        goal.progress
                                                    }
                                                    tone="purple"
                                                />


                                                <span className="bb-savings-remaining">

                                                    {goal.progress >=
                                                    100
                                                        ? "Goal completed"
                                                        : `${formatCurrency(
                                                              goal.remaining,
                                                              currency
                                                          )} remaining`}

                                                </span>

                                            </div>
                                        )
                                    )}

                            </div>
                        )}

                    </section>


                    <section className="bb-insights-panel bb-health-panel">

                        <SectionHeader
                            icon={
                                ShieldCheck
                            }
                            eyebrow="FINANCIAL HEALTH"
                            title="Your financial momentum"
                            description="A balanced score based on your current financial signals."
                        />


                        <div className="bb-health-content">

                            <div className="bb-health-ring">

                                <svg
                                    viewBox="0 0 120 120"
                                >

                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="48"
                                        className="bb-health-ring-track"
                                    />

                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="48"
                                        className="bb-health-ring-progress"
                                        strokeDasharray={
                                            `${(
                                                healthScore /
                                                100
                                            ) *
                                                301.59} 301.59`
                                        }
                                    />

                                </svg>

                                <div>

                                    <strong>
                                        {
                                            healthScore
                                        }
                                    </strong>

                                    <span>
                                        /100
                                    </span>

                                </div>

                            </div>


                            <div className="bb-health-copy">

                                <strong>

                                    {healthScore >=
                                    80
                                        ? "Strong financial momentum"
                                        : healthScore >=
                                          60
                                        ? "Healthy progress"
                                        : healthScore >=
                                          40
                                        ? "Room for improvement"
                                        : "Needs attention"}

                                </strong>

                                <p>

                                    {totalIncome ===
                                    0
                                        ? "Add income records to build a more complete financial picture."
                                        : balance >=
                                          0
                                        ? `You retained ${formatCurrency(
                                              Math.max(
                                                  0,
                                                  balance
                                              ),
                                              currency
                                          )} after tracked spending this month.`
                                        : `Your tracked spending is ${formatCurrency(
                                              Math.abs(
                                                  balance
                                              ),
                                              currency
                                          )} above income this month.`}

                                </p>

                            </div>

                        </div>


                        <div className="bb-health-stats">

                            <div>

                                <span>
                                    Budget discipline
                                </span>

                                <strong>
                                    {totalBudget >
                                    0
                                        ? `${Math.round(
                                              100 -
                                                  clamp(
                                                      budgetUtilization
                                                  )
                                          )}`
                                        : "—"}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Savings progress
                                </span>

                                <strong>
                                    {totalSavingsTarget >
                                    0
                                        ? `${Math.round(
                                              overallSavingsProgress
                                          )}`
                                        : "—"}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Goals completed
                                </span>

                                <strong>
                                    {
                                        completedGoals
                                    }
                                </strong>

                            </div>

                        </div>

                    </section>

                </section>


                {/* =================================================
                    FINANCIAL JOURNEY
                ================================================= */}

                <section className="bb-insights-panel">

                    <SectionHeader
                        icon={
                            Award
                        }
                        eyebrow="YOUR FINANCIAL JOURNEY"
                        title="The signals behind your month"
                        description="A concise view of the most important changes in your financial behaviour."
                    />


                    <div className="bb-journey">

                        <div className="bb-journey-line" />


                        <div className="bb-journey-item">

                            <div className="bb-journey-icon bb-journey-income">
                                <TrendingUp
                                    size={16}
                                />
                            </div>

                            <div>

                                <strong>
                                    Income received
                                </strong>

                                <span>
                                    {formatCurrency(
                                        totalIncome,
                                        currency
                                    )}{" "}
                                    recorded this month.
                                </span>

                            </div>

                        </div>


                        <div className="bb-journey-item">

                            <div className="bb-journey-icon bb-journey-spending">
                                <BarChart3
                                    size={16}
                                />
                            </div>

                            <div>

                                <strong>
                                    Spending behaviour
                                </strong>

                                <span>
                                    {formatCurrency(
                                        totalExpense,
                                        currency
                                    )}{" "}
                                    spent across{" "}
                                    {
                                        categoryAnalysis.length
                                    }{" "}
                                    categories.
                                </span>

                            </div>

                        </div>


                        <div className="bb-journey-item">

                            <div className="bb-journey-icon bb-journey-budget">
                                <Target
                                    size={16}
                                />
                            </div>

                            <div>

                                <strong>
                                    Budget decisions
                                </strong>

                                <span>
                                    {criticalBudget
                                        ? `${criticalBudget.category} is currently above its budget limit.`
                                        : budgetAnalysis.length
                                        ? "Your current budgets are being monitored against actual spending."
                                        : "No monthly budgets are currently available for analysis."}
                                </span>

                            </div>

                        </div>


                        <div className="bb-journey-item">

                            <div className="bb-journey-icon bb-journey-savings">
                                <PiggyBank
                                    size={16}
                                />
                            </div>

                            <div>

                                <strong>
                                    Savings contributions
                                </strong>

                                <span>
                                    {totalSavingsTarget >
                                    0
                                        ? `${formatCurrency(
                                              totalSaved,
                                              currency
                                          )} saved toward ${formatCurrency(
                                              totalSavingsTarget,
                                              currency
                                          )} across ${
                                              savingsAnalysis.length
                                          } goals.`
                                        : "No savings goals have been recorded yet."}
                                </span>

                            </div>

                        </div>


                        <div className="bb-journey-item">

                            <div className="bb-journey-icon bb-journey-goal">
                                <Award
                                    size={16}
                                />
                            </div>

                            <div>

                                <strong>
                                    Goal milestones
                                </strong>

                                <span>
                                    {completedGoals >
                                    0
                                        ? `${completedGoals} savings goal${
                                              completedGoals ===
                                              1
                                                  ? ""
                                                  : "s"
                                          } completed.`
                                        : bestGoal
                                        ? `${Math.round(
                                              bestGoal.progress
                                          )}% progress on ${
                                              bestGoal.goal_name ||
                                              bestGoal.name ||
                                              "your leading goal"
                                          }.`
                                        : "Your goal milestones will appear as you build savings."}
                                </span>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    SMART ACTION
                ================================================= */}

                <section className="bb-smart-action">

                    <div className="bb-smart-action-icon">

                        {(() => {

                            const ActionIcon =
                                recommendedAction.icon;

                            return (
                                <ActionIcon
                                    size={21}
                                />
                            );

                        })()}

                    </div>


                    <div>

                        <span>
                            SMART ACTION
                        </span>

                        <strong>
                            {
                                recommendedAction.title
                            }
                        </strong>

                        <p>
                            {
                                recommendedAction.text
                            }
                        </p>

                    </div>

                </section>

            </div>

            <InsightsStyles />

        </main>
    );
}


/* =========================================================
   STYLES
========================================================= */

function InsightsStyles() {

    return (
        <style>
            {`

            .bb-insights-page,
            .bb-insights-page * {
                box-sizing: border-box;
            }

            .bb-insights-page {
                width: 100%;
                min-height: 100%;
                padding: 8px 4px 60px;

                color: #F1F5F7;

                font-family:
                    Inter,
                    ui-sans-serif,
                    system-ui,
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    sans-serif;

                font-size: 14px;
                line-height: 1.5;

                -webkit-font-smoothing: antialiased;
                text-rendering: optimizeLegibility;
            }

            .bb-insights-shell {
                width: 100%;
                max-width: 1240px;
                margin: 0 auto;
            }


            /* =================================================
               HEADER
            ================================================= */

            .bb-insights-header {
                display: flex;
                align-items: flex-end;
                justify-content: space-between;

                gap: 24px;

                margin-bottom: 24px;
            }

            .bb-insights-title-eyebrow {
                display: flex;
                align-items: center;
                gap: 7px;

                color: #00D9A6;

                font-size: 11px;
                font-weight: 800;

                letter-spacing: 1.15px;
            }

            .bb-insights-header h1 {
                margin: 7px 0 0;

                color: #F7F9FA;

                font-size: 36px;
                line-height: 1.08;
                font-weight: 800;

                letter-spacing: -1.4px;
            }

            .bb-insights-header p {
                margin: 7px 0 0;

                color: #8E9CAF;

                font-size: 14px;
                line-height: 1.5;
            }

            .bb-insights-refresh {
                height: 40px;

                display: inline-flex;
                align-items: center;
                justify-content: center;

                gap: 8px;

                padding: 0 13px;

                border: 1px solid #27313D;
                border-radius: 10px;

                background: #10161E;
                color: #9BA9B9;

                font-family: inherit;
                font-size: 12px;
                font-weight: 750;

                cursor: pointer;

                transition:
                    .2s ease;
            }

            .bb-insights-refresh:hover {
                color: #00D9A6;

                border-color:
                    rgba(0,217,166,.3);

                background:
                    rgba(0,217,166,.04);
            }

            .bb-insights-refresh:disabled {
                opacity: .55;
                cursor: not-allowed;
            }

            .bb-refresh-spin {
                animation:
                    bbInsightsSpin .8s
                    linear infinite;
            }


            /* =================================================
               METRICS
            ================================================= */

            .bb-insights-metrics {
                display: grid;

                grid-template-columns:
                    repeat(4,minmax(0,1fr));

                gap: 12px;

                margin-bottom: 16px;
            }

            .bb-insight-metric {
                position: relative;

                min-height: 150px;

                padding: 19px;

                overflow: hidden;

                border: 1px solid #232D39;
                border-radius: 15px;

                background:
                    linear-gradient(
                        145deg,
                        #10161E,
                        #0D1219
                    );

                box-shadow:
                    inset 0 1px 0
                    rgba(255,255,255,.025);

                transition:
                    transform .2s ease,
                    border-color .2s ease;
            }

            .bb-insight-metric:hover {
                transform:
                    translateY(-2px);

                border-color:
                    rgba(0,217,166,.2);
            }

            .bb-metric-top {
                display: flex;
                align-items: center;
                justify-content: space-between;

                gap: 10px;

                margin-bottom: 15px;
            }

            .bb-metric-icon {
                width: 39px;
                height: 39px;

                display: grid;
                place-items: center;

                border-radius: 10px;

                border: 1px solid
                    rgba(255,255,255,.055);

                background:
                    rgba(0,217,166,.06);

                color: #00D9A6;
            }

            .bb-tone-red .bb-metric-icon {
                color: #FF6670;
                background:
                    rgba(255,102,112,.07);
            }

            .bb-tone-blue .bb-metric-icon {
                color: #38BDF8;
                background:
                    rgba(56,189,248,.07);
            }

            .bb-tone-purple .bb-metric-icon {
                color: #9B6CFF;
                background:
                    rgba(155,108,255,.07);
            }

            .bb-metric-label {
                display: block;

                color: #7E8DA0;

                font-size: 10px;
                font-weight: 800;

                letter-spacing: 1px;
            }

            .bb-metric-value {
                display: block;

                margin-top: 5px;

                color: #F4F7F8;

                font-size: 24px;
                line-height: 1.15;

                font-weight: 800;

                letter-spacing: -.6px;
            }

            .bb-metric-description {
                display: block;

                margin-top: 6px;

                color: #69778B;

                font-size: 11px;
                line-height: 1.45;
            }

            .bb-trend-good,
            .bb-trend-bad,
            .bb-trend-neutral {
                display: inline-flex;
                align-items: center;
                gap: 3px;

                padding: 4px 7px;

                border-radius: 999px;

                font-size: 10px;
                font-weight: 800;
            }

            .bb-trend-good {
                color: #00D9A6;
                background:
                    rgba(0,217,166,.07);
            }

            .bb-trend-bad {
                color: #FF6670;
                background:
                    rgba(255,102,112,.07);
            }

            .bb-trend-neutral {
                color: #8190A3;
                background:
                    rgba(148,163,184,.07);
            }


            /* =================================================
               PANELS
            ================================================= */

            .bb-insights-main-grid {
                display: grid;

                grid-template-columns:
                    minmax(0,1.55fr)
                    minmax(340px,.9fr);

                gap: 16px;

                margin-bottom: 16px;
            }

            .bb-insights-secondary-grid {
                display: grid;

                grid-template-columns:
                    minmax(0,1.25fr)
                    minmax(340px,.75fr);

                gap: 16px;

                margin-bottom: 16px;
            }

            .bb-insights-bottom-grid {
                display: grid;

                grid-template-columns:
                    minmax(0,1.15fr)
                    minmax(340px,.85fr);

                gap: 16px;

                margin-bottom: 16px;
            }

            .bb-insights-panel {
                overflow: hidden;

                border: 1px solid #232D39;
                border-radius: 17px;

                background:
                    linear-gradient(
                        145deg,
                        #10161E,
                        #0D1219
                    );

                box-shadow:
                    inset 0 1px 0
                    rgba(255,255,255,.025);
            }

            .bb-insights-section-header {
                min-height: 77px;

                display: flex;
                align-items: center;

                padding:
                    15px 20px;

                border-bottom:
                    1px solid
                    rgba(255,255,255,.055);
            }

            .bb-section-heading {
                min-width: 0;
            }

            .bb-insights-eyebrow {
                display: flex;
                align-items: center;
                gap: 7px;

                color: #00D9A6;

                font-size: 10px;
                font-weight: 800;

                letter-spacing: 1.05px;
            }

            .bb-section-heading h2 {
                margin: 5px 0 0;

                color: #EEF2F4;

                font-size: 16px;
                line-height: 1.25;

                font-weight: 750;

                letter-spacing: -.2px;
            }

            .bb-section-heading p {
                margin: 4px 0 0;

                color: #6F7E92;

                font-size: 11px;
                line-height: 1.45;
            }


            /* =================================================
               MONEY FLOW
            ================================================= */

            .bb-trend-legend {
                display: flex;
                align-items: center;
                gap: 17px;

                padding:
                    12px 20px 4px;
            }

            .bb-trend-legend span {
                display: inline-flex;
                align-items: center;
                gap: 7px;

                color: #8896A8;

                font-size: 11px;
                font-weight: 650;
            }

            .bb-trend-legend i {
                width: 7px;
                height: 7px;

                display: block;

                border-radius: 50%;
            }

            .bb-legend-income {
                background: #00D9A6;
            }

            .bb-legend-expense {
                background: #FF6670;
            }

            .bb-trend-chart {
                height: 245px;

                display: grid;

                grid-template-columns:
                    repeat(12,minmax(0,1fr));

                align-items: end;

                gap: 7px;

                padding:
                    15px 18px 0;

                border-bottom:
                    1px solid
                    rgba(255,255,255,.055);
            }

            .bb-chart-column {
                min-width: 0;

                height: 100%;

                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                align-items: center;

                gap: 7px;
            }

            .bb-chart-bars {
                width: 100%;
                max-width: 44px;

                height:
                    calc(100% - 22px);

                display: flex;
                align-items: flex-end;
                justify-content: center;

                gap: 3px;
            }

            .bb-chart-bar {
                width: 9px;

                min-height: 0;

                border-radius:
                    4px 4px 2px 2px;

                transition:
                    height .5s ease;
            }

            .bb-bar-income {
                background:
                    linear-gradient(
                        180deg,
                        #00D9A6,
                        #007C63
                    );

                box-shadow:
                    0 0 15px
                    rgba(0,217,166,.12);
            }

            .bb-bar-expense {
                background:
                    linear-gradient(
                        180deg,
                        #FF6670,
                        #7D3039
                    );
            }

            .bb-chart-month {
                color: #7C8A9D;

                font-size: 9px;
                font-weight: 700;
            }

            .bb-trend-summary {
                display: grid;

                grid-template-columns:
                    1fr 1fr;

                gap: 18px;

                padding:
                    13px 20px 17px;
            }

            .bb-trend-summary span {
                display: block;

                color: #69778B;

                font-size: 10px;
            }

            .bb-trend-summary strong {
                display: block;

                margin-top: 4px;

                color: #E9EEF1;

                font-size: 14px;
                font-weight: 800;
            }


            /* =================================================
               SPENDING MIX
            ================================================= */

            .bb-spending-mix {
                padding:
                    9px 20px 18px;
            }

            .bb-mix-row {
                padding:
                    10px 0;

                border-bottom:
                    1px solid
                    rgba(255,255,255,.045);
            }

            .bb-mix-row:last-child {
                border-bottom: 0;
            }

            .bb-mix-top {
                display: flex;
                align-items: center;
                justify-content: space-between;

                gap: 12px;
            }

            .bb-mix-name {
                min-width: 0;

                display: flex;
                align-items: center;
                gap: 8px;
            }

            .bb-mix-dot {
                width: 7px;
                height: 7px;

                flex-shrink: 0;

                border-radius: 50%;
            }

            .bb-mix-top strong {
                color: #E5EBEF;

                font-size: 13px;
                font-weight: 700;
            }

            .bb-progress-track {
                width: 100%;
                height: 7px;

                margin-top: 8px;

                overflow: hidden;

                border-radius: 999px;

                background: #1B2531;
            }

            .bb-progress-fill {
                height: 100%;

                border-radius: inherit;

                transition:
                    width .6s ease;
            }

            .bb-progress-green {
                background:
                    linear-gradient(
                        90deg,
                        #00D9A6,
                        #10B981
                    );
            }

            .bb-progress-red {
                background:
                    linear-gradient(
                        90deg,
                        #FF6670,
                        #F43F5E
                    );
            }

            .bb-progress-gold {
                background:
                    linear-gradient(
                        90deg,
                        #F5C451,
                        #D89D2A
                    );
            }

            .bb-progress-purple {
                background:
                    linear-gradient(
                        90deg,
                        #9B6CFF,
                        #7C3AED
                    );
            }

            .bb-mix-meta {
                display: flex;
                justify-content: space-between;

                gap: 10px;

                margin-top: 6px;

                color: #69778B;

                font-size: 9px;
            }


            /* =================================================
               CATEGORY ANALYSIS
            ================================================= */

            .bb-category-analysis {
                padding:
                    8px 20px 18px;
            }

            .bb-category-row {
                padding:
                    10px 0 13px;

                border-bottom:
                    1px solid
                    rgba(255,255,255,.045);
            }

            .bb-category-row:last-child {
                border-bottom: 0;
            }

            .bb-category-heading {
                display: flex;
                align-items: center;
                justify-content: space-between;

                gap: 10px;
            }

            .bb-category-heading strong {
                color: #E7EDF1;

                font-size: 12px;
                font-weight: 700;
            }

            .bb-category-heading span {
                color: #B1BDCA;

                font-size: 11px;
                font-weight: 700;
            }

            .bb-category-bars {
                margin-top: 7px;
            }

            .bb-category-current,
            .bb-category-previous {
                height: 5px;

                overflow: hidden;

                border-radius: 999px;

                background: #1B2531;
            }

            .bb-category-previous {
                margin-top: 4px;

                opacity: .55;
            }

            .bb-category-current span,
            .bb-category-previous span {
                display: block;

                height: 100%;

                border-radius: inherit;
            }

            .bb-category-previous span {
                background: #738196;
            }

            .bb-category-meta {
                display: flex;
                align-items: center;
                gap: 9px;

                margin-top: 6px;

                color: #657387;

                font-size: 9px;
            }

            .bb-category-meta strong {
                margin-left: auto;

                font-size: 10px;
            }


            /* =================================================
               INCOME TREND
            ================================================= */

            .bb-income-trend-chart {
                height: 245px;

                display: grid;

                grid-template-columns:
                    repeat(12,minmax(0,1fr));

                align-items: end;

                gap: 7px;

                padding:
                    17px 20px 14px;
            }

            .bb-income-month-column {
                height: 100%;

                min-width: 0;

                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                align-items: center;

                gap: 7px;
            }

            .bb-income-month-bar-wrap {
                width: 100%;
                max-width: 31px;

                height:
                    calc(100% - 20px);

                display: flex;
                align-items: flex-end;

                overflow: hidden;

                border-radius:
                    6px 6px 3px 3px;

                background:
                    rgba(155,108,255,.035);
            }

            .bb-income-month-bar {
                width: 100%;

                min-height: 0;

                border-radius:
                    6px 6px 3px 3px;

                background:
                    linear-gradient(
                        180deg,
                        #9B6CFF,
                        #5B35A7
                    );

                box-shadow:
                    0 0 18px
                    rgba(155,108,255,.1);
            }

            .bb-income-month-column > span {
                color: #7C8A9D;

                font-size: 9px;
                font-weight: 700;
            }

            .bb-chart-callout {
                display: flex;
                align-items: flex-start;
                gap: 9px;

                margin:
                    0 20px 18px;

                padding:
                    11px 12px;

                border:
                    1px solid
                    rgba(0,217,166,.1);

                border-radius: 10px;

                background:
                    rgba(0,217,166,.025);

                color: #8190A3;

                font-size: 10px;
                line-height: 1.5;
            }

            .bb-chart-callout svg {
                flex-shrink: 0;
                color: #00D9A6;
            }


            /* =================================================
               BUDGET
            ================================================= */

            .bb-budget-panel {
                margin-bottom: 16px;
            }

            .bb-budget-grid {
                display: grid;

                grid-template-columns:
                    repeat(3,minmax(0,1fr));

                gap: 10px;

                padding:
                    10px 20px 20px;
            }

            .bb-budget-item {
                padding: 13px;

                border: 1px solid #26313D;
                border-radius: 11px;

                background:
                    rgba(255,255,255,.012);
            }

            .bb-budget-item-top {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;

                gap: 10px;
            }

            .bb-budget-item-top strong {
                display: block;

                color: #E6EBEF;

                font-size: 12px;
                font-weight: 750;
            }

            .bb-budget-item-top span {
                display: block;

                margin-top: 3px;

                color: #758398;

                font-size: 10px;
            }

            .bb-budget-percent {
                white-space: nowrap;
            }

            .bb-green {
                color: #00D9A6 !important;
            }

            .bb-gold {
                color: #F5C451 !important;
            }

            .bb-red {
                color: #FF6670 !important;
            }

            .bb-budget-item-bottom {
                display: flex;
                justify-content: space-between;

                gap: 8px;

                margin-top: 7px;

                color: #69778B;

                font-size: 9px;
            }


            /* =================================================
               SAVINGS
            ================================================= */

            .bb-savings-list {
                padding:
                    8px 20px 18px;
            }

            .bb-savings-row {
                padding:
                    11px 0;

                border-bottom:
                    1px solid
                    rgba(255,255,255,.045);
            }

            .bb-savings-row:last-child {
                border-bottom: 0;
            }

            .bb-savings-row-top {
                display: flex;
                justify-content: space-between;

                gap: 12px;
            }

            .bb-savings-row-top strong {
                color: #E7EDF1;

                font-size: 12px;
                font-weight: 700;
            }

            .bb-savings-row-top span {
                display: block;

                margin-top: 3px;

                color: #758398;

                font-size: 10px;
            }

            .bb-savings-remaining {
                display: block;

                margin-top: 6px;

                color: #69778B;

                font-size: 9px;
            }


            /* =================================================
               HEALTH
            ================================================= */

            .bb-health-content {
                display: flex;
                align-items: center;

                gap: 20px;

                padding:
                    18px 20px 13px;
            }

            .bb-health-ring {
                position: relative;

                width: 125px;
                height: 125px;

                flex-shrink: 0;
            }

            .bb-health-ring svg {
                width: 100%;
                height: 100%;

                transform:
                    rotate(-90deg);
            }

            .bb-health-ring-track,
            .bb-health-ring-progress {
                fill: none;

                stroke-width: 10;
            }

            .bb-health-ring-track {
                stroke: #1B2531;
            }

            .bb-health-ring-progress {
                stroke: #00D9A6;

                stroke-linecap: round;

                transition:
                    stroke-dasharray .7s ease;
            }

            .bb-health-ring > div {
                position: absolute;

                inset: 0;

                display: flex;
                flex-direction: column;

                align-items: center;
                justify-content: center;
            }

            .bb-health-ring strong {
                color: #F5F8FA;

                font-size: 28px;
                line-height: 1;

                font-weight: 800;
            }

            .bb-health-ring span {
                margin-top: 4px;

                color: #68778B;

                font-size: 10px;
            }

            .bb-health-copy strong {
                display: block;

                color: #EAF0F3;

                font-size: 15px;
                font-weight: 750;
            }

            .bb-health-copy p {
                margin: 6px 0 0;

                color: #718096;

                font-size: 11px;
                line-height: 1.55;
            }

            .bb-health-stats {
                display: grid;

                grid-template-columns:
                    repeat(3,1fr);

                gap: 8px;

                padding:
                    0 20px 20px;
            }

            .bb-health-stats > div {
                padding: 10px;

                border:
                    1px solid
                    #26313D;

                border-radius: 10px;

                background:
                    rgba(255,255,255,.012);
            }

            .bb-health-stats span {
                display: block;

                color: #69778B;

                font-size: 9px;
            }

            .bb-health-stats strong {
                display: block;

                margin-top: 4px;

                color: #E7EDF1;

                font-size: 15px;
                font-weight: 800;
            }


            /* =================================================
               JOURNEY
            ================================================= */

            .bb-journey {
                position: relative;

                padding:
                    12px 20px 20px;
            }

            .bb-journey-line {
                position: absolute;

                left: 38px;
                top: 32px;
                bottom: 33px;

                width: 1px;

                background:
                    #26313D;
            }

            .bb-journey-item {
                position: relative;

                display: flex;
                align-items: flex-start;

                gap: 12px;

                padding:
                    10px 0;
            }

            .bb-journey-icon {
                position: relative;
                z-index: 2;

                width: 36px;
                height: 36px;

                display: grid;
                place-items: center;

                flex-shrink: 0;

                border:
                    1px solid
                    #26313D;

                border-radius: 10px;

                background: #10161E;
            }

            .bb-journey-income {
                color: #00D9A6;
            }

            .bb-journey-spending {
                color: #9B6CFF;
            }

            .bb-journey-budget {
                color: #38BDF8;
            }

            .bb-journey-savings {
                color: #00D9A6;
            }

            .bb-journey-goal {
                color: #F5C451;
            }

            .bb-journey-item strong {
                display: block;

                color: #E8EDF1;

                font-size: 12px;
                font-weight: 750;
            }

            .bb-journey-item span {
                display: block;

                margin-top: 3px;

                max-width: 650px;

                color: #718096;

                font-size: 10px;
                line-height: 1.5;
            }


            /* =================================================
               SMART ACTION
            ================================================= */

            .bb-smart-action {
                display: flex;
                align-items: flex-start;

                gap: 13px;

                margin-top: 16px;

                padding:
                    17px 19px;

                border:
                    1px solid
                    rgba(0,217,166,.15);

                border-radius: 15px;

                background:
                    linear-gradient(
                        145deg,
                        rgba(0,217,166,.055),
                        rgba(0,217,166,.015)
                    );
            }

            .bb-smart-action-icon {
                width: 39px;
                height: 39px;

                display: grid;
                place-items: center;

                flex-shrink: 0;

                border-radius: 10px;

                color: #00D9A6;

                background:
                    rgba(0,217,166,.08);

                border:
                    1px solid
                    rgba(0,217,166,.12);
            }

            .bb-smart-action span {
                display: block;

                color: #00D9A6;

                font-size: 9px;
                font-weight: 800;

                letter-spacing: 1px;
            }

            .bb-smart-action strong {
                display: block;

                margin-top: 3px;

                color: #EAF0F3;

                font-size: 14px;
                font-weight: 750;
            }

            .bb-smart-action p {
                margin: 4px 0 0;

                color: #7C8A9D;

                font-size: 11px;
                line-height: 1.5;
            }


            /* =================================================
               STATES
            ================================================= */

            .bb-insights-empty {
                min-height: 170px;

                display: flex;
                flex-direction: column;

                align-items: center;
                justify-content: center;

                padding: 25px;

                text-align: center;
            }

            .bb-empty-icon {
                width: 42px;
                height: 42px;

                display: grid;
                place-items: center;

                border-radius: 11px;

                color: #00D9A6;

                background:
                    rgba(0,217,166,.06);

                border:
                    1px solid
                    rgba(0,217,166,.1);
            }

            .bb-insights-empty strong {
                margin-top: 10px;

                color: #DDE5E9;

                font-size: 13px;
                font-weight: 750;
            }

            .bb-insights-empty span {
                max-width: 290px;

                margin-top: 4px;

                color: #69778B;

                font-size: 10px;
                line-height: 1.55;
            }

            .bb-insights-loading,
            .bb-insights-error {
                min-height: 420px;

                display: flex;
                flex-direction: column;

                align-items: center;
                justify-content: center;

                text-align: center;
            }

            .bb-loading-orb,
            .bb-error-icon {
                width: 52px;
                height: 52px;

                display: grid;
                place-items: center;

                border-radius: 14px;

                color: #00D9A6;

                background:
                    rgba(0,217,166,.07);

                border:
                    1px solid
                    rgba(0,217,166,.12);
            }

            .bb-insights-loading h2,
            .bb-insights-error h2 {
                margin: 15px 0 0;

                color: #EAF0F3;

                font-size: 18px;
                font-weight: 750;
            }

            .bb-insights-loading p,
            .bb-insights-error p {
                max-width: 390px;

                margin: 6px 0 0;

                color: #718096;

                font-size: 12px;
                line-height: 1.55;
            }

            .bb-insights-error button {
                display: inline-flex;
                align-items: center;
                gap: 7px;

                margin-top: 15px;

                height: 39px;

                padding: 0 14px;

                border: 0;
                border-radius: 9px;

                background: #00D9A6;
                color: #03140F;

                font-family: inherit;

                font-size: 12px;
                font-weight: 800;

                cursor: pointer;
            }

            .bb-positive {
                color: #00D9A6 !important;
            }

            .bb-negative {
                color: #FF6670 !important;
            }

            .bb-warning {
                color: #F5C451 !important;
            }


            /* =================================================
               RESPONSIVE
            ================================================= */

            @media (max-width: 1080px) {

                .bb-insights-metrics {
                    grid-template-columns:
                        repeat(2,minmax(0,1fr));
                }

                .bb-insights-main-grid,
                .bb-insights-secondary-grid,
                .bb-insights-bottom-grid {
                    grid-template-columns: 1fr;
                }

                .bb-budget-grid {
                    grid-template-columns:
                        repeat(2,minmax(0,1fr));
                }
            }


            @media (max-width: 720px) {

                .bb-insights-page {
                    padding:
                        5px 8px 45px;
                }

                .bb-insights-header {
                    align-items:
                        flex-start;

                    flex-direction:
                        column;
                }

                .bb-insights-header h1 {
                    font-size: 30px;
                }

                .bb-insights-header p {
                    font-size: 13px;
                }

                .bb-insights-refresh {
                    width: 100%;
                }

                .bb-insights-metrics {
                    grid-template-columns:
                        1fr;
                }

                .bb-trend-chart,
                .bb-income-trend-chart {
                    gap: 4px;
                }

                .bb-chart-bar {
                    width: 7px;
                }

                .bb-chart-month,
                .bb-income-month-column > span {
                    font-size: 8px;
                }

                .bb-budget-grid {
                    grid-template-columns:
                        1fr;
                }

                .bb-health-content {
                    align-items:
                        flex-start;

                    flex-direction:
                        column;
                }

                .bb-health-stats {
                    grid-template-columns:
                        1fr;
                }
            }


            @media (max-width: 480px) {

                .bb-insights-section-header {
                    padding:
                        14px 15px;
                }

                .bb-section-heading h2 {
                    font-size: 15px;
                }

                .bb-section-heading p {
                    font-size: 10px;
                }

                .bb-trend-chart,
                .bb-income-trend-chart {
                    height: 210px;

                    gap: 2px;

                    padding:
                        12px 10px 0;
                }

                .bb-chart-bar {
                    width: 5px;
                }

                .bb-income-month-bar-wrap {
                    max-width: 22px;
                }

                .bb-trend-summary {
                    grid-template-columns:
                        1fr;
                }

                .bb-health-content {
                    padding:
                        16px 15px 12px;
                }

                .bb-health-stats {
                    padding:
                        0 15px 16px;
                }

                .bb-journey {
                    padding:
                        10px 15px 17px;
                }

                .bb-journey-line {
                    left: 33px;
                }

                .bb-smart-action {
                    padding:
                        15px;
                }
            }


            @media (
                prefers-reduced-motion: reduce
            ) {

                .bb-insights-page *,
                .bb-insights-page *::before,
                .bb-insights-page *::after {
                    animation-duration:
                        .01ms !important;

                    animation-iteration-count:
                        1 !important;

                    transition-duration:
                        .01ms !important;
                }
            }


            @keyframes bbInsightsSpin {
                to {
                    transform:
                        rotate(360deg);
                }
            }

            `}
        </style>
    );
}