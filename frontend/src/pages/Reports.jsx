import { useEffect, useMemo, useState } from "react";

import {
    BarChart3,
    WalletCards,
    Receipt,
    Target,
    Eye,
    FileText,
    FileSpreadsheet,
    RefreshCw,
    CheckCircle2,
    AlertTriangle,
    PiggyBank,
    TrendingUp,
    TrendingDown,
} from "lucide-react";

import {
    getReportData,
    downloadExpenseReport,
} from "../services/reportService";

import { getBudgets } from "../services/budgetService";

import { getSavingsGoals } from "../services/savingsService";


/* =========================================================
   CONSTANTS
========================================================= */

const MONTHS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];


const CATEGORY_ORDER = [
    "Shopping",
    "Food",
    "Travel",
    "Entertainment",
    "Education",
    "Bills",
    "Healthcare",
    "Others",
];


const CATEGORY_COLORS = {
    Shopping: "#E69A72",
    Food: "#35D9A7",
    Travel: "#9B7CFF",
    Entertainment: "#E987C6",
    Education: "#4DB7E8",
    Bills: "#D8B46A",
    Healthcare: "#F07E8D",
    Others: "#87939F",
};


/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return `₹${amount.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
};


const getErrorMessage = (error) => {
    const data = error?.response?.data;

    if (!data) {
        return (
            error?.message ||
            "Unable to load the report."
        );
    }

    if (typeof data === "string") {
        return data;
    }

    if (data.detail) {
        return String(data.detail);
    }

    if (typeof data === "object") {
        return Object.entries(data)
            .map(([field, messages]) => {
                const message = Array.isArray(messages)
                    ? messages.join(", ")
                    : String(messages);

                return `${field}: ${message}`;
            })
            .join("\n");
    }

    return "Unable to load the report.";
};


const getDateValue = (item) => {
    return (
        item?.expense_date ||
        item?.income_date ||
        item?.date ||
        item?.created_at ||
        item?.transaction_date ||
        null
    );
};


const belongsToMonth = (
    item,
    month,
    year
) => {
    const rawDate =
        getDateValue(item);

    if (!rawDate) {
        return false;
    }

    const date =
        new Date(rawDate);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return false;
    }

    return (
        date.getMonth() + 1 ===
            Number(month) &&
        date.getFullYear() ===
            Number(year)
    );
};


const getCategoryColor = (
    category
) => {
    return (
        CATEGORY_COLORS[
            category
        ] || CATEGORY_COLORS.Others
    );
};


const getBudgetProgress = (
    spent,
    limit
) => {
    const amount =
        Number(limit || 0);

    if (amount <= 0) {
        return 0;
    }

    return (
        Number(spent || 0) /
        amount
    ) * 100;
};


const getGoalProgress = (
    saved,
    target
) => {
    const targetAmount =
        Number(target || 0);

    if (targetAmount <= 0) {
        return 0;
    }

    return Math.min(
        (Number(saved || 0) /
            targetAmount) *
            100,
        100
    );
};


/* =========================================================
   REPORT CONTAINER
========================================================= */

function ReportContainer({
    icon,
    iconColor,
    iconBackground,
    title,
    subtitle,
    description,
    children,
    onGenerate,
    onPDF,
    onExcel,
    generating,
}) {
    return (
        <article
            className="report-container"
            style={{
                position: "relative",
                overflow: "hidden",
                minWidth: 0,
                padding: "20px",
                borderRadius: "14px",
                background:
                    "linear-gradient(145deg,#11161F,#10151D)",
                border:
                    "1px solid rgba(255,255,255,.075)",
                boxShadow:
                    "0 12px 34px rgba(0,0,0,.16)",
            }}
        >

            {/* SOFT GLOW */}

            <div
                style={{
                    position: "absolute",
                    width: "130px",
                    height: "130px",
                    right: "-80px",
                    top: "-75px",
                    borderRadius: "50%",
                    background:
                        iconColor,
                    opacity: 0.035,
                    filter: "blur(32px)",
                    pointerEvents:
                        "none",
                }}
            />


            {/* HEADER */}

            <div
                style={{
                    position:
                        "relative",
                    display:
                        "flex",
                    alignItems:
                        "flex-start",
                    gap: "11px",
                    marginBottom:
                        "17px",
                }}
            >

                <div
                    style={{
                        width: "34px",
                        height: "34px",
                        flexShrink: 0,
                        display: "grid",
                        placeItems:
                            "center",
                        borderRadius:
                            "10px",
                        color:
                            iconColor,
                        background:
                            iconBackground,
                        border:
                            `1px solid ${iconColor}20`,
                    }}
                >
                    {icon}
                </div>


                <div
                    style={{
                        minWidth: 0,
                    }}
                >

                    <h2
                        style={{
                            margin: 0,
                            color:
                                "#F3F6F5",
                            fontSize:
                                "13px",
                            lineHeight:
                                1.3,
                            fontWeight:
                                750,
                            letterSpacing:
                                "-.1px",
                        }}
                    >
                        {title}
                    </h2>


                    <p
                        style={{
                            margin:
                                "3px 0 0",
                            color:
                                "#81908B",
                            fontSize:
                                "10px",
                            lineHeight:
                                1.4,
                            fontWeight:
                                500,
                        }}
                    >
                        {subtitle}
                    </p>

                </div>

            </div>


            {/* DESCRIPTION */}

            <p
                style={{
                    margin:
                        "0 0 12px",
                    color:
                        "#91A09B",
                    fontSize:
                        "11px",
                    lineHeight:
                        1.45,
                    fontWeight:
                        500,
                }}
            >
                {description}
            </p>


            {/* DATA */}

            <div
                style={{
                    position:
                        "relative",
                    minHeight:
                        "84px",
                    padding:
                        "11px",
                    boxSizing:
                        "border-box",
                    borderRadius:
                        "10px",
                    background:
                        "#0C1118",
                    border:
                        "1px solid rgba(255,255,255,.065)",
                }}
            >
                {children}
            </div>


            {/* ACTIONS */}

            <div
                style={{
                    display:
                        "flex",
                    alignItems:
                        "center",
                    gap:
                        "7px",
                    marginTop:
                        "12px",
                }}
            >

                <button
                    type="button"
                    onClick={onGenerate}
                    disabled={generating}
                    className="report-generate-button"
                    style={{
                        flex: 1,
                        height:
                            "34px",
                        display:
                            "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        gap:
                            "6px",
                        border:
                            "0",
                        borderRadius:
                            "999px",
                        background:
                            generating
                                ? "#2E403A"
                                : "linear-gradient(135deg,#35E0A5,#1ED29F)",
                        color:
                            generating
                                ? "#7B918A"
                                : "#03130E",
                        cursor:
                            generating
                                ? "not-allowed"
                                : "pointer",
                        fontSize:
                            "10px",
                        fontWeight:
                            800,
                    }}
                >
                    {generating ? (
                        <RefreshCw
                            size={12}
                            style={{
                                animation:
                                    "bbReportSpin 1s linear infinite",
                            }}
                        />
                    ) : (
                        <Eye size={12} />
                    )}

                    {generating
                        ? "Preparing..."
                        : "Generate"}
                </button>


                <button
                    type="button"
                    onClick={onPDF}
                    disabled={generating}
                    className="report-secondary-button"
                >
                    <FileText size={12} />
                    PDF
                </button>


                <button
                    type="button"
                    onClick={onExcel}
                    disabled={generating}
                    className="report-secondary-button"
                >
                    <FileSpreadsheet
                        size={12}
                    />
                    Excel
                </button>

            </div>

        </article>
    );
}


/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({
    label,
    value,
    valueColor = "#E8EEEC",
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                    "space-between",
                gap: "15px",
                minHeight:
                    "22px",
            }}
        >
            <span
                style={{
                    color:
                        "#8B9995",
                    fontSize:
                        "10px",
                    fontWeight:
                        500,
                }}
            >
                {label}
            </span>

            <span
                style={{
                    color:
                        valueColor,
                    fontSize:
                        "10px",
                    fontWeight:
                        750,
                    whiteSpace:
                        "nowrap",
                }}
            >
                {value}
            </span>
        </div>
    );
}


/* =========================================================
   CATEGORY ROW
========================================================= */

function CategoryRow({
    category,
    amount,
    percentage,
}) {
    const color =
        getCategoryColor(
            category
        );

    return (
        <div
            style={{
                display:
                    "flex",
                alignItems:
                    "center",
                justifyContent:
                    "space-between",
                gap:
                    "10px",
                minHeight:
                    "22px",
            }}
        >

            <span
                style={{
                    color:
                        "#8B9995",
                    fontSize:
                        "10px",
                    fontWeight:
                        500,
                    minWidth:
                        0,
                    overflow:
                        "hidden",
                    textOverflow:
                        "ellipsis",
                    whiteSpace:
                        "nowrap",
                }}
            >
                {category}
            </span>


            <div
                style={{
                    display:
                        "flex",
                    alignItems:
                        "center",
                    gap:
                        "7px",
                    flexShrink:
                        0,
                }}
            >

                <span
                    style={{
                        color:
                            "#E8EEEC",
                        fontSize:
                            "10px",
                        fontWeight:
                            750,
                    }}
                >
                    {formatCurrency(
                        amount
                    )}
                </span>

                <span
                    style={{
                        color:
                            color,
                        fontSize:
                            "10px",
                        fontWeight:
                            800,
                    }}
                >
                    {Math.round(
                        percentage
                    )}
                    %
                </span>

            </div>

        </div>
    );
}


/* =========================================================
   MAIN
========================================================= */

export default function Reports() {

    const currentDate =
        new Date();

    const [selectedMonth, setSelectedMonth] =
        useState(
            currentDate.getMonth() + 1
        );

    const [selectedYear, setSelectedYear] =
        useState(
            currentDate.getFullYear()
        );


    const [expenses, setExpenses] =
        useState([]);

    const [incomes, setIncomes] =
        useState([]);

    const [budgets, setBudgets] =
        useState([]);

    const [goals, setGoals] =
        useState([]);


    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [generating, setGenerating] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [exportError, setExportError] =
        useState("");


    /* =====================================================
       YEARS
    ===================================================== */

    const years = useMemo(() => {
        const currentYear =
            currentDate.getFullYear();

        return Array.from(
            {
                length: 6,
            },
            (_, index) =>
                currentYear - index
        );
    }, [currentDate]);


    /* =====================================================
       SELECTED MONTH NAME
    ===================================================== */

    const selectedMonthName =
        MONTHS.find(
            (month) =>
                month.value ===
                Number(
                    selectedMonth
                )
        )?.label ||
        "Selected month";


    /* =====================================================
       FETCH ALL REPORT DATA
    ===================================================== */

    const fetchReportData =
        async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    reportResponse,
                    budgetResponse,
                    goalResponse,
                ] =
                    await Promise.all([
                        getReportData(),
                        getBudgets(),
                        getSavingsGoals(),
                    ]);


                setExpenses(
                    Array.isArray(
                        reportResponse?.expenses
                    )
                        ? reportResponse.expenses
                        : []
                );


                setIncomes(
                    Array.isArray(
                        reportResponse?.incomes
                    )
                        ? reportResponse.incomes
                        : []
                );


                setBudgets(
                    Array.isArray(
                        budgetResponse?.data
                    )
                        ? budgetResponse.data
                        : []
                );


                setGoals(
                    Array.isArray(
                        goalResponse?.data
                    )
                        ? goalResponse.data
                        : []
                );

            } catch (fetchError) {
                console.error(
                    "Reports data loading error:",
                    fetchError
                );

                setError(
                    getErrorMessage(
                        fetchError
                    )
                );
            } finally {
                setLoading(false);
            }
        };


    useEffect(() => {
        fetchReportData();
    }, []);


    /* =====================================================
       SELECTED MONTH EXPENSES
    ===================================================== */

    const monthlyExpenses =
        useMemo(() => {
            return expenses.filter(
                (expense) =>
                    belongsToMonth(
                        expense,
                        selectedMonth,
                        selectedYear
                    )
            );
        }, [
            expenses,
            selectedMonth,
            selectedYear,
        ]);


    /* =====================================================
       SELECTED MONTH INCOME
    ===================================================== */

    const monthlyIncome =
        useMemo(() => {
            return incomes.filter(
                (income) =>
                    belongsToMonth(
                        income,
                        selectedMonth,
                        selectedYear
                    )
            );
        }, [
            incomes,
            selectedMonth,
            selectedYear,
        ]);


    /* =====================================================
       MONTHLY TOTALS
    ===================================================== */

    const monthlyIncomeTotal =
        useMemo(() => {
            return monthlyIncome.reduce(
                (total, income) =>
                    total +
                    Number(
                        income.amount || 0
                    ),
                0
            );
        }, [monthlyIncome]);


    const monthlyExpenseTotal =
        useMemo(() => {
            return monthlyExpenses.reduce(
                (total, expense) =>
                    total +
                    Number(
                        expense.amount || 0
                    ),
                0
            );
        }, [monthlyExpenses]);


    const monthlySavings =
        monthlyIncomeTotal -
        monthlyExpenseTotal;


    /* =====================================================
       EXPENSE CATEGORY SUMMARY
    ===================================================== */

    const expenseCategorySummary =
        useMemo(() => {

            const categoryTotals =
                monthlyExpenses.reduce(
                    (
                        totals,
                        expense
                    ) => {
                        const category =
                            expense.category ||
                            "Others";

                        totals[category] =
                            (totals[
                                category
                            ] || 0) +
                            Number(
                                expense.amount ||
                                    0
                            );

                        return totals;
                    },
                    {}
                );


            const total =
                Object.values(
                    categoryTotals
                ).reduce(
                    (
                        sum,
                        amount
                    ) =>
                        sum +
                        Number(
                            amount
                        ),
                    0
                );


            return Object.entries(
                categoryTotals
            )
                .sort(
                    (
                        [, amountA],
                        [, amountB]
                    ) =>
                        Number(
                            amountB
                        ) -
                        Number(
                            amountA
                        )
                )
                .map(
                    ([
                        category,
                        amount,
                    ]) => ({
                        category,
                        amount,
                        percentage:
                            total > 0
                                ? (Number(
                                      amount
                                  ) /
                                      total) *
                                  100
                                : 0,
                    })
                );

        }, [
            monthlyExpenses,
        ]);


    /* =====================================================
       BUDGET PERFORMANCE
    ===================================================== */

    const monthlyBudgets =
        useMemo(() => {

            return budgets
                .filter(
                    (budget) =>
                        Number(
                            budget.month
                        ) ===
                            Number(
                                selectedMonth
                            ) &&
                        Number(
                            budget.year
                        ) ===
                            Number(
                                selectedYear
                            )
                )
                .map(
                    (budget) => {

                        const categoryExpenses =
                            monthlyExpenses.filter(
                                (
                                    expense
                                ) =>
                                    String(
                                        expense.category ||
                                            ""
                                    ).toLowerCase() ===
                                    String(
                                        budget.category ||
                                            ""
                                    ).toLowerCase()
                            );


                        const spent =
                            categoryExpenses.reduce(
                                (
                                    total,
                                    expense
                                ) =>
                                    total +
                                    Number(
                                        expense.amount ||
                                            0
                                    ),
                                0
                            );


                        const limit =
                            Number(
                                budget.budget_amount ||
                                    0
                            );


                        const progress =
                            getBudgetProgress(
                                spent,
                                limit
                            );


                        return {
                            ...budget,
                            spent,
                            limit,
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
                );

        }, [
            budgets,
            monthlyExpenses,
            selectedMonth,
            selectedYear,
        ]);


    /* =====================================================
       SAVINGS GOALS
    ===================================================== */

    const savingsGoals =
        useMemo(() => {

            return goals
                .map(
                    (goal) => ({
                        ...goal,
                        progress:
                            getGoalProgress(
                                goal.saved_amount,
                                goal.target_amount
                            ),
                    })
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        b.progress -
                        a.progress
                );

        }, [goals]);


    /* =====================================================
       EXPORT
    ===================================================== */

    const handleExport = async (
        format
    ) => {
        try {
            setGenerating(true);
            setMessage("");
            setExportError("");

            await downloadExpenseReport(
                selectedMonth,
                selectedYear,
                format
            );

            setMessage(
                `${selectedMonthName} ${selectedYear} ${format.toUpperCase()} report downloaded successfully.`
            );

        } catch (exportFailure) {
            console.error(
                "Report export failed:",
                exportFailure
            );

            setExportError(
                getErrorMessage(
                    exportFailure
                )
            );
        } finally {
            setGenerating(false);
        }
    };


    /* =====================================================
       GENERATE
    ===================================================== */

    const handleGenerate = () => {
        setMessage(
            `${selectedMonthName} ${selectedYear} report is ready to review.`
        );

        setExportError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    /* =====================================================
       REPORT DATA
    ===================================================== */

    const balanceColor =
        monthlySavings >= 0
            ? "#35D9A7"
            : "#FF646D";


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <main
            style={{
                width: "100%",
                maxWidth: "1000px",
                margin: "0 auto",
                paddingBottom: "45px",
            }}
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <section
                style={{
                    display:
                        "flex",
                    alignItems:
                        "flex-end",
                    justifyContent:
                        "space-between",
                    gap:
                        "20px",
                    marginBottom:
                        "19px",
                    flexWrap:
                        "wrap",
                }}
            >

                <div>

                    <h1
                        style={{
                            margin: 0,
                            color:
                                "#F5F7F6",
                            fontSize:
                                "28px",
                            lineHeight:
                                1.15,
                            fontWeight:
                                850,
                            letterSpacing:
                                "-.8px",
                        }}
                    >
                        Reports
                    </h1>


                    <p
                        style={{
                            margin:
                                "5px 0 0",
                            color:
                                "#82908C",
                            fontSize:
                                "12px",
                            lineHeight:
                                1.45,
                            fontWeight:
                                500,
                        }}
                    >
                        Generate and export
                        clean financial
                        summaries.
                    </p>

                </div>


                {/* MONTH SELECTOR */}

                <div
                    style={{
                        display:
                            "flex",
                        alignItems:
                            "center",
                        gap:
                            "6px",
                        padding:
                            "4px",
                        borderRadius:
                            "10px",
                        background:
                            "#11161E",
                        border:
                            "1px solid rgba(255,255,255,.075)",
                    }}
                >

                    <select
                        value={
                            selectedMonth
                        }
                        onChange={(
                            event
                        ) =>
                            setSelectedMonth(
                                Number(
                                    event
                                        .target
                                        .value
                                )
                            )
                        }
                        style={{
                            height:
                                "31px",
                            padding:
                                "0 8px",
                            border: 0,
                            outline:
                                "none",
                            borderRadius:
                                "8px",
                            background:
                                "#35D9A7",
                            color:
                                "#03130E",
                            fontSize:
                                "10px",
                            fontWeight:
                                800,
                            fontFamily:
                                "inherit",
                            cursor:
                                "pointer",
                        }}
                    >
                        {MONTHS.map(
                            (month) => (
                                <option
                                    key={
                                        month.value
                                    }
                                    value={
                                        month.value
                                    }
                                >
                                    {
                                        month.label
                                    }
                                </option>
                            )
                        )}
                    </select>


                    <select
                        value={
                            selectedYear
                        }
                        onChange={(
                            event
                        ) =>
                            setSelectedYear(
                                Number(
                                    event
                                        .target
                                        .value
                                )
                            )
                        }
                        style={{
                            height:
                                "31px",
                            padding:
                                "0 8px",
                            border: 0,
                            outline:
                                "none",
                            borderRadius:
                                "8px",
                            background:
                                "transparent",
                            color:
                                "#9AA7A3",
                            fontSize:
                                "10px",
                            fontWeight:
                                650,
                            fontFamily:
                                "inherit",
                            cursor:
                                "pointer",
                        }}
                    >
                        {years.map(
                            (year) => (
                                <option
                                    key={
                                        year
                                    }
                                    value={
                                        year
                                    }
                                >
                                    {year}
                                </option>
                            )
                        )}
                    </select>

                </div>

            </section>


            {/* =================================================
                STATUS
            ================================================= */}

            {(message ||
                exportError ||
                error) && (
                <div
                    style={{
                        marginBottom:
                            "15px",
                    }}
                >

                    {(message ||
                        error) && (
                        <div
                            style={{
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap:
                                    "7px",
                                padding:
                                    "10px 12px",
                                marginBottom:
                                    exportError
                                        ? "7px"
                                        : 0,
                                borderRadius:
                                    "9px",
                                background:
                                    "rgba(53,217,167,.06)",
                                border:
                                    "1px solid rgba(53,217,167,.12)",
                                color:
                                    error
                                        ? "#FF646D"
                                        : "#35D9A7",
                                fontSize:
                                    "10px",
                                fontWeight:
                                    600,
                            }}
                        >
                            {error ? (
                                <AlertTriangle
                                    size={
                                        13
                                    }
                                />
                            ) : (
                                <CheckCircle2
                                    size={
                                        13
                                    }
                                />
                            )}

                            {error ||
                                message}
                        </div>
                    )}


                    {exportError && (
                        <div
                            style={{
                                padding:
                                    "10px 12px",
                                borderRadius:
                                    "9px",
                                background:
                                    "rgba(255,100,109,.06)",
                                border:
                                    "1px solid rgba(255,100,109,.13)",
                                color:
                                    "#FF646D",
                                fontSize:
                                    "10px",
                                fontWeight:
                                    600,
                            }}
                        >
                            {exportError}
                        </div>
                    )}

                </div>
            )}


            {/* =================================================
                REPORT GRID
            ================================================= */}

            <div
                className="reports-grid"
                style={{
                    display:
                        "grid",
                    gridTemplateColumns:
                        "repeat(2,minmax(0,1fr))",
                    gap:
                        "16px",
                }}
            >

                {/* =================================================
                    MONTHLY FINANCIAL SUMMARY
                ================================================= */}

                <ReportContainer
                    icon={
                        <BarChart3
                            size={17}
                        />
                    }
                    iconColor="#35D9A7"
                    iconBackground="rgba(53,217,167,.08)"
                    title="Monthly Financial Summary"
                    subtitle={`${selectedMonthName} ${selectedYear}`}
                    description="Income, spending, savings and balance at a glance."
                    onGenerate={
                        handleGenerate
                    }
                    onPDF={() =>
                        handleExport(
                            "pdf"
                        )
                    }
                    onExcel={() =>
                        handleExport(
                            "csv"
                        )
                    }
                    generating={
                        generating
                    }
                >

                    {loading ? (
                        <LoadingRows />
                    ) : (
                        <>
                            <SummaryRow
                                label="Income"
                                value={formatCurrency(
                                    monthlyIncomeTotal
                                )}
                                valueColor="#35D9A7"
                            />

                            <SummaryRow
                                label="Spent"
                                value={formatCurrency(
                                    monthlyExpenseTotal
                                )}
                                valueColor="#FF8B92"
                            />

                            <SummaryRow
                                label="Saved"
                                value={formatCurrency(
                                    monthlySavings
                                )}
                                valueColor="#9B7CFF"
                            />

                            <SummaryRow
                                label="Balance"
                                value={formatCurrency(
                                    monthlySavings
                                )}
                                valueColor={
                                    balanceColor
                                }
                            />
                        </>
                    )}

                </ReportContainer>


                {/* =================================================
                    EXPENSE HISTORY
                ================================================= */}

                <ReportContainer
                    icon={
                        <Receipt
                            size={17}
                        />
                    }
                    iconColor="#9B7CFF"
                    iconBackground="rgba(155,124,255,.08)"
                    title="Expense History"
                    subtitle={`${selectedMonthName} ${selectedYear}`}
                    description="Every expense in the period, categorised."
                    onGenerate={
                        handleGenerate
                    }
                    onPDF={() =>
                        handleExport(
                            "pdf"
                        )
                    }
                    onExcel={() =>
                        handleExport(
                            "csv"
                        )
                    }
                    generating={
                        generating
                    }
                >

                    {loading ? (
                        <LoadingRows />
                    ) : expenseCategorySummary.length ===
                      0 ? (
                        <EmptyReportState
                            text="No expenses recorded for this month."
                        />
                    ) : (
                        expenseCategorySummary
                            .slice(0, 5)
                            .map(
                                (
                                    item
                                ) => (
                                    <CategoryRow
                                        key={
                                            item.category
                                        }
                                        category={
                                            item.category
                                        }
                                        amount={
                                            item.amount
                                        }
                                        percentage={
                                            item.percentage
                                        }
                                    />
                                )
                            )
                    )}

                </ReportContainer>


                {/* =================================================
                    BUDGET PERFORMANCE
                ================================================= */}

                <ReportContainer
                    icon={
                        <Target
                            size={17}
                        />
                    }
                    iconColor="#4DB7E8"
                    iconBackground="rgba(77,183,232,.08)"
                    title="Budget Performance"
                    subtitle={`${selectedMonthName} ${selectedYear}`}
                    description="How each category tracked against its limit."
                    onGenerate={
                        handleGenerate
                    }
                    onPDF={() =>
                        handleExport(
                            "pdf"
                        )
                    }
                    onExcel={() =>
                        handleExport(
                            "csv"
                        )
                    }
                    generating={
                        generating
                    }
                >

                    {loading ? (
                        <LoadingRows />
                    ) : monthlyBudgets.length ===
                      0 ? (
                        <EmptyReportState
                            text="No budgets configured for this month."
                        />
                    ) : (
                        monthlyBudgets
                            .slice(0, 5)
                            .map(
                                (
                                    budget
                                ) => {
                                    const over =
                                        budget.progress >=
                                        100;

                                    return (
                                        <div
                                            key={
                                                budget.id
                                            }
                                            style={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "space-between",
                                                gap:
                                                    "12px",
                                                minHeight:
                                                    "22px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color:
                                                        "#8B9995",
                                                    fontSize:
                                                        "10px",
                                                    fontWeight:
                                                        500,
                                                    overflow:
                                                        "hidden",
                                                    textOverflow:
                                                        "ellipsis",
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                {budget.category ||
                                                    budget.title ||
                                                    "Budget"}
                                            </span>

                                            <span
                                                style={{
                                                    color:
                                                        over
                                                            ? "#FF646D"
                                                            : "#E8EEEC",
                                                    fontSize:
                                                        "10px",
                                                    fontWeight:
                                                        800,
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                {Math.round(
                                                    budget.progress
                                                )}
                                                %
                                            </span>
                                        </div>
                                    );
                                }
                            )
                    )}

                </ReportContainer>


                {/* =================================================
                    SAVINGS PROGRESS
                ================================================= */}

                <ReportContainer
                    icon={
                        <PiggyBank
                            size={17}
                        />
                    }
                    iconColor="#D8B46A"
                    iconBackground="rgba(216,180,106,.09)"
                    title="Savings Progress"
                    subtitle={`${selectedMonthName} ${selectedYear}`}
                    description="Progress toward every savings goal."
                    onGenerate={
                        handleGenerate
                    }
                    onPDF={() =>
                        handleExport(
                            "pdf"
                        )
                    }
                    onExcel={() =>
                        handleExport(
                            "csv"
                        )
                    }
                    generating={
                        generating
                    }
                >

                    {loading ? (
                        <LoadingRows />
                    ) : savingsGoals.length ===
                      0 ? (
                        <EmptyReportState
                            text="No savings goals created yet."
                        />
                    ) : (
                        savingsGoals
                            .slice(0, 5)
                            .map(
                                (
                                    goal
                                ) => (
                                    <div
                                        key={
                                            goal.id
                                        }
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "space-between",
                                            gap:
                                                "12px",
                                            minHeight:
                                                "22px",
                                        }}
                                    >

                                        <span
                                            style={{
                                                color:
                                                    "#8B9995",
                                                fontSize:
                                                    "10px",
                                                fontWeight:
                                                    500,
                                                overflow:
                                                    "hidden",
                                                textOverflow:
                                                    "ellipsis",
                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            {goal.goal_name ||
                                                "Savings goal"}
                                        </span>


                                        <span
                                            style={{
                                                color:
                                                    goal.progress >=
                                                    100
                                                        ? "#35D9A7"
                                                        : "#E8EEEC",
                                                fontSize:
                                                    "10px",
                                                fontWeight:
                                                    800,
                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            {Math.round(
                                                goal.progress
                                            )}
                                            %
                                        </span>

                                    </div>
                                )
                            )
                    )}

                </ReportContainer>

            </div>


            {/* =================================================
                FOOTNOTE
            ================================================= */}

            <div
                style={{
                    display:
                        "flex",
                    alignItems:
                        "center",
                    justifyContent:
                        "center",
                    gap:
                        "6px",
                    marginTop:
                        "18px",
                    color:
                        "#596762",
                    fontSize:
                        "9px",
                    fontWeight:
                        500,
                }}
            >

                <WalletCards
                    size={11}
                />

                Showing report data for{" "}
                <strong
                    style={{
                        color:
                            "#7F8D88",
                        fontWeight:
                            700,
                    }}
                >
                    {selectedMonthName}{" "}
                    {selectedYear}
                </strong>

            </div>


            {/* =================================================
                RESPONSIVE + INTERACTION STYLES
            ================================================= */}

            <style>
                {`
                    @keyframes bbReportSpin {
                        from {
                            transform: rotate(0deg);
                        }

                        to {
                            transform: rotate(360deg);
                        }
                    }


                    .report-container {
                        transition:
                            transform .20s ease,
                            border-color .20s ease,
                            box-shadow .20s ease;
                    }


                    .report-container:hover {
                        transform:
                            translateY(-2px);

                        border-color:
                            rgba(53,217,167,.14) !important;

                        box-shadow:
                            0 17px 42px rgba(0,0,0,.24);
                    }


                    .report-secondary-button {
                        height: 34px;
                        padding: 0 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 5px;
                        border: 1px solid rgba(255,255,255,.075);
                        border-radius: 999px;
                        background: #0D131B;
                        color: #A0ACA8;
                        cursor: pointer;
                        font-family: inherit;
                        font-size: 9px;
                        font-weight: 700;
                        transition:
                            border-color .18s ease,
                            color .18s ease,
                            background .18s ease;
                    }


                    .report-secondary-button:hover:not(:disabled) {
                        color: #E8EEEC;
                        border-color:
                            rgba(53,217,167,.22);
                        background:
                            rgba(53,217,167,.04);
                    }


                    .report-secondary-button:disabled {
                        opacity: .5;
                        cursor: not-allowed;
                    }


                    .report-generate-button {
                        transition:
                            transform .18s ease,
                            box-shadow .18s ease;
                    }


                    .report-generate-button:hover:not(:disabled) {
                        transform:
                            translateY(-1px);

                        box-shadow:
                            0 7px 18px
                            rgba(53,217,167,.14);
                    }


                    select option {
                        background:
                            #10161E;
                        color:
                            #E8EEEC;
                    }


                    @media (max-width: 760px) {

                        .reports-grid {
                            grid-template-columns:
                                1fr !important;
                        }

                    }


                    @media (max-width: 500px) {

                        .report-container {
                            padding:
                                16px !important;
                        }

                        .report-secondary-button {
                            padding:
                                0 9px !important;
                        }

                    }

                `}
            </style>

        </main>
    );
}


/* =========================================================
   LOADING
========================================================= */

function LoadingRows() {
    return (
        <div
            style={{
                display:
                    "flex",
                flexDirection:
                    "column",
                gap:
                    "3px",
            }}
        >
            {[1, 2, 3, 4].map(
                (item) => (
                    <div
                        key={item}
                        style={{
                            height:
                                "22px",
                            borderRadius:
                                "5px",
                            background:
                                "linear-gradient(90deg,#111821,#182129,#111821)",
                            opacity:
                                0.65,
                            animation:
                                "bbReportPulse 1.4s ease-in-out infinite",
                        }}
                    />
                )
            )}

            <style>
                {`
                    @keyframes bbReportPulse {
                        0%,100% {
                            opacity: .4;
                        }

                        50% {
                            opacity: .8;
                        }
                    }
                `}
            </style>
        </div>
    );
}


/* =========================================================
   EMPTY REPORT STATE
========================================================= */

function EmptyReportState({
    text,
}) {
    return (
        <div
            style={{
                minHeight:
                    "82px",
                display:
                    "grid",
                placeItems:
                    "center",
                textAlign:
                    "center",
                color:
                    "#697773",
                fontSize:
                    "10px",
                lineHeight:
                    1.45,
                fontWeight:
                    500,
            }}
        >
            {text}
        </div>
    );
}