import { useEffect, useMemo, useState } from "react";

import {
    Wallet,
    Target,
    TrendingDown,
    AlertTriangle,
    Search,
    Plus,
    Pencil,
    Trash2,
    X,
    CalendarDays,
    FileText,
    CheckCircle2,
    CircleDollarSign,
    Sparkles,
    ShieldCheck,
} from "lucide-react";

import {
    createBudget,
    getBudgets,
    updateBudget,
    deleteBudget,
} from "../services/budgetService";

import { getExpenses } from "../services/expenseService";

import {
    calculateSpent,
    calculateRemaining,
    calculateProgress,
} from "../utils/budgetUtils";


/* =========================================================
   CONSTANTS
========================================================= */

const CATEGORIES = [
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Entertainment",
    "Healthcare",
    "Education",
    "Others",
];

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

const MONTH_NAMES = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
};

const EMPTY_FORM = {
    title: "",
    category: "",
    budget_amount: "",
    month: "",
    year: "",
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


const getStatus = (progress) => {
    const safeProgress = Number(progress || 0);

    if (safeProgress >= 100) {
        return {
            label: "Budget Exceeded",
            color: "#FB7185",
            background: "rgba(251,113,133,.09)",
            border: "rgba(251,113,133,.22)",
            icon: <AlertTriangle size={13} />,
        };
    }

    if (safeProgress >= 80) {
        return {
            label: "Almost Exhausted",
            color: "#FBBF24",
            background: "rgba(251,191,36,.09)",
            border: "rgba(251,191,36,.22)",
            icon: <AlertTriangle size={13} />,
        };
    }

    return {
        label: "Within Budget",
        color: "#34D399",
        background: "rgba(52,211,153,.09)",
        border: "rgba(52,211,153,.22)",
        icon: <CheckCircle2 size={13} />,
    };
};


const getErrorMessage = (error) => {
    const data = error?.response?.data;

    if (!data) {
        return (
            error?.message ||
            "Something went wrong. Please try again."
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

    return "Unable to save budget.";
};


const getCurrentYear = () =>
    new Date().getFullYear();


/* =========================================================
   INPUT STYLE
========================================================= */

const inputStyle = {
    width: "100%",
    height: "46px",
    boxSizing: "border-box",
    padding: "0 14px",
    borderRadius: "10px",
    border: "1px solid rgba(148,163,184,.16)",
    outline: "none",
    background: "#0B1119",
    color: "#F1F5F9",
    fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: "13px",
    fontWeight: 550,
};


/* =========================================================
   FIELD
========================================================= */

function Field({ label, children }) {
    return (
        <div>
            <label
                style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#AAB4C3",
                    fontSize: "11px",
                    lineHeight: 1.2,
                    fontWeight: 750,
                    letterSpacing: ".35px",
                }}
            >
                {label}
            </label>

            {children}
        </div>
    );
}


/* =========================================================
   KPI CARD
========================================================= */

function BudgetKPI({
    icon,
    label,
    value,
    color,
    description,
}) {
    return (
        <article
            style={{
                position: "relative",
                overflow: "hidden",
                minWidth: 0,
                padding: "20px",
                borderRadius: "15px",
                background:
                    "linear-gradient(145deg,#101925,#0C141E)",
                border:
                    "1px solid rgba(148,163,184,.12)",
                boxShadow:
                    "0 12px 30px rgba(0,0,0,.10)",
                transition:
                    "transform .2s ease, border-color .2s ease, box-shadow .2s ease",
            }}
            onMouseEnter={(event) => {
                event.currentTarget.style.transform =
                    "translateY(-3px)";

                event.currentTarget.style.borderColor =
                    `${color}45`;

                event.currentTarget.style.boxShadow =
                    "0 16px 35px rgba(0,0,0,.16)";
            }}
            onMouseLeave={(event) => {
                event.currentTarget.style.transform =
                    "translateY(0)";

                event.currentTarget.style.borderColor =
                    "rgba(148,163,184,.12)";

                event.currentTarget.style.boxShadow =
                    "0 12px 30px rgba(0,0,0,.10)";
            }}
        >
            <div
                style={{
                    position: "absolute",
                    width: "110px",
                    height: "110px",
                    right: "-48px",
                    top: "-48px",
                    borderRadius: "50%",
                    background: color,
                    opacity: 0.06,
                    filter: "blur(20px)",
                }}
            />

            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <div
                    style={{
                        width: "40px",
                        height: "40px",
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "10px",
                        marginBottom: "16px",
                        color,
                        background: `${color}12`,
                        border: `1px solid ${color}22`,
                    }}
                >
                    {icon}
                </div>

                <div
                    style={{
                        color: "#9AA6B6",
                        fontSize: "11px",
                        lineHeight: 1.2,
                        fontWeight: 750,
                        letterSpacing: "1px",
                        marginBottom: "7px",
                    }}
                >
                    {label}
                </div>

                <div
                    style={{
                        color: "#F8FAFC",
                        fontSize: "25px",
                        lineHeight: 1.15,
                        fontWeight: 800,
                        letterSpacing: "-.6px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {value}
                </div>

                <div
                    style={{
                        marginTop: "7px",
                        color: "#8290A2",
                        fontSize: "11px",
                        lineHeight: 1.45,
                        fontWeight: 500,
                    }}
                >
                    {description}
                </div>
            </div>
        </article>
    );
}


/* =========================================================
   MAIN
========================================================= */

export default function Budgets() {
    const [formData, setFormData] =
        useState({ ...EMPTY_FORM });

    const [budgets, setBudgets] =
        useState([]);

    const [expenses, setExpenses] =
        useState([]);

    const [editingBudget, setEditingBudget] =
        useState(null);

    const [searchTerm, setSearchTerm] =
        useState("");

    const [categoryFilter, setCategoryFilter] =
        useState("All");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [showForm, setShowForm] =
        useState(false);

    const [toastMessage, setToastMessage] =
        useState("");

    const showSuccessToast = (message) => {
        setToastMessage(message);

        window.setTimeout(() => {
            setToastMessage("");
        }, 3500);
    };


    /* =====================================================
       FETCH BUDGETS
    ===================================================== */

    const fetchBudgets = async () => {
        try {
            const response =
                await getBudgets();

            const data =
                Array.isArray(response?.data)
                    ? response.data
                    : [];

            setBudgets(data);
        } catch (error) {
            console.error(
                "Failed to fetch budgets:",
                error.response?.data || error
            );
        }
    };


    /* =====================================================
       FETCH EXPENSES
    ===================================================== */

    const fetchExpenses = async () => {
        try {
            const response =
                await getExpenses();

            const data =
                Array.isArray(response?.data)
                    ? response.data
                    : [];

            setExpenses(data);
        } catch (error) {
            console.error(
                "Failed to fetch expenses:",
                error.response?.data || error
            );
        }
    };


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                await Promise.all([
                    fetchBudgets(),
                    fetchExpenses(),
                ]);
            } catch (error) {
                console.error(
                    "Budget page loading error:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);


    /* =====================================================
       FORM CHANGE
    ===================================================== */

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    /* =====================================================
       OPEN CREATE FORM
    ===================================================== */

    const openCreateForm = () => {
        setEditingBudget(null);

        setFormData({
            ...EMPTY_FORM,
            year: String(
                getCurrentYear()
            ),
        });

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    /* =====================================================
       EDIT BUDGET
    ===================================================== */

    const handleEdit = (budget) => {
        setEditingBudget(budget);

        setFormData({
            title:
                budget.title || "",
            category:
                budget.category || "",
            budget_amount:
                budget.budget_amount ?? "",
            month:
                String(
                    budget.month || ""
                ),
            year:
                String(
                    budget.year || ""
                ),
        });

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    /* =====================================================
       CLOSE FORM
    ===================================================== */

    const closeForm = () => {
        if (saving) {
            return;
        }

        setEditingBudget(null);

        setFormData({
            ...EMPTY_FORM,
        });

        setShowForm(false);
    };


    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {
        if (!formData.title.trim()) {
            return "Please enter a budget title.";
        }

        if (!formData.category) {
            return "Please select a category.";
        }

        const amount =
            Number(
                formData.budget_amount
            );

        if (
            formData.budget_amount === "" ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return "Please enter a budget amount greater than 0.";
        }

        const month =
            Number(formData.month);

        if (
            !Number.isInteger(month) ||
            month < 1 ||
            month > 12
        ) {
            return "Please select a valid month.";
        }

        const year =
            Number(formData.year);

        if (
            !Number.isInteger(year) ||
            year < 2000 ||
            year > 2100
        ) {
            return "Please enter a valid year.";
        }

        return null;
    };


    /* =====================================================
       BUILD PAYLOAD
    ===================================================== */

    const buildPayload = () => ({
        title:
            formData.title.trim(),

        category:
            formData.category,

        budget_amount:
            Number(
                formData.budget_amount
            ),

        month:
            Number(
                formData.month
            ),

        year:
            Number(
                formData.year
            ),
    });


    /* =====================================================
       CREATE / UPDATE
    ===================================================== */

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (saving) {
            return;
        }

        const validationError =
            validateForm();

        if (validationError) {
            alert(validationError);
            return;
        }

        const payload =
            buildPayload();

        try {
            setSaving(true);

            if (editingBudget) {
                await updateBudget(
                    editingBudget.id,
                    payload
                );

                alert(
                    "Budget updated successfully."
                );
            } else {
                await createBudget(
                    payload
                );

                await fetchBudgets();

                setEditingBudget(null);

                setFormData({
                    ...EMPTY_FORM,
                });

                setShowForm(false);

                showSuccessToast(
                    "Budget created successfully."
                );

                return;
            }

            await fetchBudgets();

            closeForm();
        } catch (error) {
            console.error(
                "Budget save failed:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            alert(
                getErrorMessage(error)
            );
        } finally {
            setSaving(false);
        }
    };


    /* =====================================================
       DELETE
    ===================================================== */

    const handleDelete = async (id) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this budget?"
            );

        if (!confirmed) {
            return;
        }

        try {
            await deleteBudget(id);

            await fetchBudgets();

            alert(
                "Budget deleted successfully."
            );
        } catch (error) {
            console.error(
                "Delete failed:",
                error.response?.data || error
            );

            alert(
                getErrorMessage(error)
            );
        }
    };


    /* =====================================================
       CALCULATED BUDGET DATA
    ===================================================== */

    const budgetData =
        useMemo(() => {
            return budgets.map(
                (budget) => {
                    const spent =
                        calculateSpent(
                            expenses,
                            budget.category
                        );

                    const remaining =
                        calculateRemaining(
                            expenses,
                            budget.budget_amount,
                            budget.category
                        );

                    const progress =
                        calculateProgress(
                            expenses,
                            budget.budget_amount,
                            budget.category
                        );

                    return {
                        ...budget,
                        spent,
                        remaining,
                        progress,
                        status:
                            getStatus(
                                progress
                            ),
                    };
                }
            );
        }, [
            budgets,
            expenses,
        ]);


    /* =====================================================
       FILTERED BUDGETS
    ===================================================== */

    const filteredBudgets =
        useMemo(() => {
            const search =
                searchTerm
                    .toLowerCase()
                    .trim();

            return budgetData.filter(
                (budget) => {
                    const monthName =
                        MONTH_NAMES[
                            Number(
                                budget.month
                            )
                        ] || "";

                    const matchesSearch =
                        !search ||
                        budget.title
                            ?.toLowerCase()
                            .includes(search) ||
                        budget.category
                            ?.toLowerCase()
                            .includes(search) ||
                        String(
                            budget.year
                        ).includes(search) ||
                        monthName
                            .toLowerCase()
                            .includes(search);

                    const matchesCategory =
                        categoryFilter ===
                            "All" ||
                        budget.category ===
                            categoryFilter;

                    return (
                        matchesSearch &&
                        matchesCategory
                    );
                }
            );
        }, [
            budgetData,
            searchTerm,
            categoryFilter,
        ]);


    /* =====================================================
       KPI STATISTICS
    ===================================================== */

    const totalBudget =
        useMemo(() => {
            return budgets.reduce(
                (total, budget) =>
                    total +
                    Number(
                        budget.budget_amount ||
                            0
                    ),
                0
            );
        }, [budgets]);


    const totalSpent =
        useMemo(() => {
            return budgetData.reduce(
                (total, budget) =>
                    total +
                    Number(
                        budget.spent || 0
                    ),
                0
            );
        }, [budgetData]);


    const totalRemaining =
        totalBudget -
        totalSpent;


    const exceededBudgets =
        budgetData.filter(
            (budget) =>
                Number(
                    budget.progress
                ) >= 100
        ).length;


    const overallProgress =
        totalBudget > 0
            ? Math.min(
                  (
                      totalSpent /
                      totalBudget
                  ) * 100,
                  100
              )
            : 0;


    /* =====================================================
       CURRENT MONTH SUMMARY
    ===================================================== */

    const currentDate =
        new Date();

    const currentMonth =
        currentDate.getMonth() + 1;

    const currentYear =
        currentDate.getFullYear();

    const currentMonthBudgets =
        budgetData.filter(
            (budget) =>
                Number(
                    budget.month
                ) === currentMonth &&
                Number(
                    budget.year
                ) === currentYear
        );

    const currentMonthBudgetTotal =
        currentMonthBudgets.reduce(
            (total, budget) =>
                total +
                Number(
                    budget.budget_amount ||
                        0
                ),
            0
        );

    const currentMonthSpent =
        currentMonthBudgets.reduce(
            (total, budget) =>
                total +
                Number(
                    budget.spent || 0
                ),
            0
        );

    const currentMonthProgress =
        currentMonthBudgetTotal > 0
            ? Math.min(
                  (
                      currentMonthSpent /
                      currentMonthBudgetTotal
                  ) * 100,
                  100
              )
            : 0;


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <main
                style={{
                    width: "100%",
                    maxWidth: "1280px",
                    margin: "0 auto",
                    padding: "34px 30px 60px",
                    color: "#F8FAFC",
                    fontFamily:
                        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
            >
                <div
                    style={{
                        minHeight: "55vh",
                        display: "grid",
                        placeItems: "center",
                        textAlign: "center",
                    }}
                >
                    <div>
                        <div
                            style={{
                                width: "52px",
                                height: "52px",
                                margin: "0 auto 16px",
                                display: "grid",
                                placeItems: "center",
                                borderRadius: "14px",
                                color: "#A78BFA",
                                background:
                                    "rgba(167,139,250,.10)",
                            }}
                        >
                            <Wallet size={24} />
                        </div>

                        <h2
                            style={{
                                margin: 0,
                                fontSize: "20px",
                                fontWeight: 800,
                                color: "#F8FAFC",
                            }}
                        >
                            Loading your budgets
                        </h2>

                        <p
                            style={{
                                margin: "7px 0 0",
                                fontSize: "13px",
                                color: "#8793A5",
                            }}
                        >
                            Preparing your spending overview...
                        </p>
                    </div>
                </div>
            </main>
        );
    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <main
            style={{
                width: "100%",
                maxWidth: "1280px",
                margin: "0 auto",
                padding: "30px 30px 60px",
                boxSizing: "border-box",
                color: "#F8FAFC",
                fontFamily:
                    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                WebkitFontSmoothing:
                    "antialiased",
                textRendering:
                    "optimizeLegibility",
            }}
        >

            {toastMessage && (
                <div
                    role="status"
                    aria-live="polite"
                    style={{
                        position: "fixed",
                        right: "24px",
                        bottom: "24px",
                        zIndex: 1000,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        maxWidth: "calc(100vw - 48px)",
                        padding: "13px 16px",
                        border: "1px solid rgba(52,211,153,.28)",
                        borderRadius: "12px",
                        background: "#10261F",
                        boxShadow: "0 16px 40px rgba(0,0,0,.28)",
                        color: "#D1FAE5",
                        fontSize: "13px",
                        fontWeight: 700,
                        animation: "budget-toast-fade 3.5s ease forwards",
                    }}
                >
                    <span
                        aria-hidden="true"
                        style={{
                            width: "20px",
                            height: "20px",
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "50%",
                            background: "#10B981",
                            color: "#052E24",
                            fontSize: "13px",
                            fontWeight: 900,
                        }}
                    >
                        ✓
                    </span>

                    {toastMessage}
                </div>
            )}

            {/* =================================================
                HERO
            ================================================= */}

            <section
                style={{
                    position: "relative",
                    overflow: "hidden",
                    padding: "30px 32px",
                    marginBottom: "20px",
                    borderRadius: "18px",
                    background:
                        "linear-gradient(135deg,#101B2A,#0C1521)",
                    border:
                        "1px solid rgba(148,163,184,.13)",
                    boxShadow:
                        "0 18px 45px rgba(0,0,0,.15)",
                }}
            >

                <div
                    style={{
                        position: "absolute",
                        width: "280px",
                        height: "280px",
                        right: "-90px",
                        top: "-160px",
                        borderRadius: "50%",
                        background:
                            "rgba(167,139,250,.12)",
                        filter: "blur(55px)",
                    }}
                />

                <div
                    style={{
                        position: "absolute",
                        width: "200px",
                        height: "200px",
                        left: "-110px",
                        bottom: "-150px",
                        borderRadius: "50%",
                        background:
                            "rgba(52,211,153,.055)",
                        filter: "blur(50px)",
                    }}
                />

                <div
                    style={{
                        position: "relative",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "space-between",
                        gap: "25px",
                        flexWrap: "wrap",
                    }}
                >

                    <div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "7px",
                                color: "#B39AFF",
                                fontSize: "11px",
                                lineHeight: 1,
                                fontWeight: 800,
                                letterSpacing: "1.5px",
                                marginBottom: "11px",
                            }}
                        >
                            <Sparkles size={13} />
                            BUDGET CONTROL
                        </div>

                        <h1
                            style={{
                                margin: 0,
                                color: "#F8FAFC",
                                fontSize: "32px",
                                lineHeight: 1.15,
                                fontWeight: 850,
                                letterSpacing: "-.9px",
                            }}
                        >
                            Give every rupee
                            a purpose.
                        </h1>

                        <p
                            style={{
                                maxWidth: "600px",
                                margin: "10px 0 0",
                                color: "#94A3B8",
                                fontSize: "14px",
                                lineHeight: 1.6,
                                fontWeight: 500,
                            }}
                        >
                            Set spending limits,
                            monitor progress and
                            stay ahead of your
                            expenses.
                        </p>

                    </div>


                    {/* HERO ADD BUTTON */}

                    <button
                        type="button"
                        onClick={
                            showForm
                                ? closeForm
                                : openCreateForm
                        }
                        disabled={saving}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            minHeight: "44px",
                            padding: "0 17px",
                            border: "none",
                            borderRadius: "10px",
                            cursor: saving
                                ? "not-allowed"
                                : "pointer",
                            color: "#160C27",
                            background:
                                "linear-gradient(135deg,#B59AFF,#8B5CF6)",
                            fontFamily: "inherit",
                            fontSize: "12px",
                            fontWeight: 800,
                            boxShadow:
                                "0 9px 25px rgba(139,92,246,.20)",
                            opacity:
                                saving ? .6 : 1,
                        }}
                    >

                        {showForm ? (
                            <X size={16} />
                        ) : (
                            <Plus size={16} />
                        )}

                        {showForm
                            ? "Close Form"
                            : "Create Budget"}

                    </button>

                </div>

            </section>


            {/* =================================================
                KPI CARDS
            ================================================= */}

            <section
                className="budget-kpi-grid"
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(4,minmax(0,1fr))",
                    gap: "13px",
                    marginBottom: "20px",
                }}
            >

                <BudgetKPI
                    icon={
                        <Wallet size={18} />
                    }
                    label="TOTAL BUDGET"
                    value={formatCurrency(
                        totalBudget
                    )}
                    color="#A78BFA"
                    description={`${budgets.length} active budget${
                        budgets.length === 1
                            ? ""
                            : "s"
                    }`}
                />

                <BudgetKPI
                    icon={
                        <TrendingDown size={18} />
                    }
                    label="TOTAL SPENT"
                    value={formatCurrency(
                        totalSpent
                    )}
                    color="#FB7185"
                    description={`${overallProgress.toFixed(
                        1
                    )}% of allocated budget`}
                />

                <BudgetKPI
                    icon={
                        <CircleDollarSign
                            size={18}
                        />
                    }
                    label="REMAINING"
                    value={formatCurrency(
                        totalRemaining
                    )}
                    color={
                        totalRemaining < 0
                            ? "#FB7185"
                            : "#34D399"
                    }
                    description={
                        totalRemaining < 0
                            ? "Spending is above budget"
                            : "Available to spend"
                    }
                />

                <BudgetKPI
                    icon={
                        <AlertTriangle size={18} />
                    }
                    label="EXCEEDED"
                    value={exceededBudgets}
                    color="#FBBF24"
                    description={
                        exceededBudgets === 0
                            ? "All budgets under control"
                            : "Budget limits crossed"
                    }
                />

            </section>


            {/* =================================================
                OVERALL PROGRESS
            ================================================= */}

            {budgets.length > 0 && (
                <section
                    style={{
                        padding: "20px",
                        marginBottom: "24px",
                        borderRadius: "15px",
                        background:
                            "linear-gradient(145deg,#101925,#0C141E)",
                        border:
                            "1px solid rgba(148,163,184,.12)",
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                                "space-between",
                            gap: "15px",
                            marginBottom: "11px",
                        }}
                    >

                        <div>

                            <div
                                style={{
                                    color: "#A0ACBB",
                                    fontSize: "11px",
                                    fontWeight: 750,
                                    letterSpacing: ".8px",
                                }}
                            >
                                OVERALL SPENDING
                            </div>

                            <div
                                style={{
                                    marginTop: "5px",
                                    color: "#F8FAFC",
                                    fontSize: "14px",
                                    fontWeight: 700,
                                }}
                            >
                                {formatCurrency(
                                    totalSpent
                                )}{" "}
                                of{" "}
                                {formatCurrency(
                                    totalBudget
                                )}
                            </div>

                        </div>

                        <strong
                            style={{
                                color:
                                    overallProgress >= 100
                                        ? "#FB7185"
                                        : overallProgress >= 80
                                            ? "#FBBF24"
                                            : "#34D399",
                                fontSize: "15px",
                                fontWeight: 800,
                            }}
                        >
                            {overallProgress.toFixed(1)}%
                        </strong>

                    </div>


                    <div
                        style={{
                            height: "9px",
                            overflow: "hidden",
                            borderRadius: "999px",
                            background:
                                "rgba(255,255,255,.065)",
                        }}
                    >
                        <div
                            style={{
                                width:
                                    `${overallProgress}%`,
                                height: "100%",
                                borderRadius: "inherit",
                                background:
                                    overallProgress >= 100
                                        ? "linear-gradient(90deg,#FB7185,#F43F5E)"
                                        : overallProgress >= 80
                                            ? "linear-gradient(90deg,#FBBF24,#D8B46A)"
                                            : "linear-gradient(90deg,#34D399,#10B981)",
                                transition:
                                    "width .55s ease",
                            }}
                        />
                    </div>

                </section>
            )}


            {/* =================================================
                CREATE / EDIT FORM
            ================================================= */}

            {showForm && (
                <section
                    style={{
                        marginBottom: "24px",
                        padding: "24px",
                        borderRadius: "16px",
                        background:
                            "linear-gradient(145deg,#101925,#0B131D)",
                        border:
                            "1px solid rgba(167,139,250,.18)",
                        boxShadow:
                            "0 18px 40px rgba(0,0,0,.12)",
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "13px",
                            marginBottom: "23px",
                        }}
                    >

                        <div
                            style={{
                                width: "42px",
                                height: "42px",
                                display: "grid",
                                placeItems: "center",
                                borderRadius: "11px",
                                color: "#B39AFF",
                                background:
                                    "rgba(167,139,250,.10)",
                                border:
                                    "1px solid rgba(167,139,250,.16)",
                            }}
                        >
                            {editingBudget ? (
                                <Pencil size={18} />
                            ) : (
                                <Plus size={19} />
                            )}
                        </div>

                        <div>

                            <h2
                                style={{
                                    margin: 0,
                                    color: "#F8FAFC",
                                    fontSize: "19px",
                                    lineHeight: 1.25,
                                    fontWeight: 800,
                                    letterSpacing: "-.25px",
                                }}
                            >
                                {editingBudget
                                    ? "Edit Budget"
                                    : "Create Budget"}
                            </h2>

                            <p
                                style={{
                                    margin: "5px 0 0",
                                    color: "#8793A5",
                                    fontSize: "12px",
                                    lineHeight: 1.5,
                                }}
                            >
                                {editingBudget
                                    ? "Update your spending allocation."
                                    : "Define a clear spending limit for a category."}
                            </p>

                        </div>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                        noValidate
                    >

                        <div
                            className="budget-form-grid"
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(2,minmax(0,1fr))",
                                gap: "17px",
                            }}
                        >

                            {/* TITLE */}

                            <Field label="BUDGET TITLE">

                                <input
                                    type="text"
                                    name="title"
                                    placeholder="e.g. August Food Budget"
                                    value={
                                        formData.title
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    style={
                                        inputStyle
                                    }
                                    autoComplete="off"
                                    required
                                />

                            </Field>


                            {/* CATEGORY */}

                            <Field label="CATEGORY">

                                <select
                                    name="category"
                                    value={
                                        formData.category
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    style={{
                                        ...inputStyle,
                                        cursor: "pointer",
                                    }}
                                    required
                                >

                                    <option value="">
                                        Select category
                                    </option>

                                    {CATEGORIES.map(
                                        (category) => (
                                            <option
                                                key={category}
                                                value={category}
                                            >
                                                {category}
                                            </option>
                                        )
                                    )}

                                </select>

                            </Field>


                            {/* AMOUNT */}

                            <Field label="BUDGET AMOUNT">

                                <input
                                    type="number"
                                    name="budget_amount"
                                    placeholder="Enter amount"
                                    min="1"
                                    step="0.01"
                                    value={
                                        formData.budget_amount
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    style={
                                        inputStyle
                                    }
                                    required
                                />

                            </Field>


                            {/* MONTH */}

                            <Field label="MONTH">

                                <select
                                    name="month"
                                    value={
                                        formData.month
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    style={{
                                        ...inputStyle,
                                        cursor: "pointer",
                                    }}
                                    required
                                >

                                    <option value="">
                                        Select month
                                    </option>

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

                            </Field>


                            {/* YEAR */}

                            <Field label="YEAR">

                                <input
                                    type="number"
                                    name="year"
                                    placeholder="e.g. 2026"
                                    min="2000"
                                    max="2100"
                                    value={
                                        formData.year
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    style={
                                        inputStyle
                                    }
                                    required
                                />

                            </Field>

                        </div>


                        {/* FORM ACTIONS */}

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "10px",
                                marginTop: "23px",
                                paddingTop: "18px",
                                borderTop:
                                    "1px solid rgba(148,163,184,.09)",
                            }}
                        >

                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={saving}
                                style={{
                                    height: "42px",
                                    padding: "0 17px",
                                    borderRadius: "9px",
                                    border:
                                        "1px solid rgba(148,163,184,.13)",
                                    background: "#0B1119",
                                    color: "#A0ACBB",
                                    cursor: saving
                                        ? "not-allowed"
                                        : "pointer",
                                    fontFamily: "inherit",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    opacity:
                                        saving ? .55 : 1,
                                }}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "7px",
                                    height: "42px",
                                    minWidth: "140px",
                                    padding: "0 18px",
                                    border: 0,
                                    borderRadius: "9px",
                                    background:
                                        saving
                                            ? "#4B5563"
                                            : "linear-gradient(135deg,#B59AFF,#8B5CF6)",
                                    color: "#160C27",
                                    cursor: saving
                                        ? "not-allowed"
                                        : "pointer",
                                    fontFamily: "inherit",
                                    fontSize: "12px",
                                    fontWeight: 800,
                                }}
                            >

                                {saving ? (
                                    <>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        {editingBudget ? (
                                            <Pencil size={14} />
                                        ) : (
                                            <Plus size={14} />
                                        )}

                                        {editingBudget
                                            ? "Update Budget"
                                            : "Add Budget"}
                                    </>
                                )}

                            </button>

                        </div>

                    </form>

                </section>
            )}


            {/* =================================================
                BUDGET LIST HEADER
            ================================================= */}

            <section
                style={{
                    marginBottom: "15px",
                }}
            >

                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        gap: "16px",
                        flexWrap: "wrap",
                    }}
                >

                    <div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "7px",
                                color: "#D8B46A",
                                fontSize: "11px",
                                lineHeight: 1,
                                fontWeight: 800,
                                letterSpacing: "1.3px",
                                marginBottom: "7px",
                            }}
                        >
                            <Target size={13} />

                            YOUR BUDGETS
                        </div>

                        <h2
                            style={{
                                margin: 0,
                                color: "#F4F7FA",
                                fontSize: "21px",
                                lineHeight: 1.25,
                                fontWeight: 800,
                                letterSpacing: "-.25px",
                            }}
                        >
                            Spending plans
                        </h2>

                    </div>


                    {/* SEARCH + ADD BUDGET */}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "9px",
                            flexWrap: "wrap",
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "9px",
                                width: "260px",
                                height: "40px",
                                padding: "0 12px",
                                boxSizing: "border-box",
                                borderRadius: "9px",
                                background: "#0D141D",
                                border:
                                    "1px solid rgba(148,163,184,.13)",
                            }}
                        >

                            <Search
                                size={15}
                                color="#7E8A9C"
                            />

                            <input
                                type="text"
                                placeholder="Search budgets..."
                                value={
                                    searchTerm
                                }
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                                style={{
                                    width: "100%",
                                    border: 0,
                                    outline: 0,
                                    background:
                                        "transparent",
                                    color: "#E7EDF4",
                                    fontFamily:
                                        "inherit",
                                    fontSize: "12px",
                                    fontWeight: 550,
                                }}
                            />

                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearchTerm(
                                            ""
                                        )
                                    }
                                    style={{
                                        display: "grid",
                                        placeItems: "center",
                                        padding: 0,
                                        border: 0,
                                        background:
                                            "transparent",
                                        color: "#7E8A9C",
                                        cursor: "pointer",
                                    }}
                                    aria-label="Clear search"
                                >
                                    <X size={14} />
                                </button>
                            )}

                        </div>


                        <button
                            type="button"
                            onClick={openCreateForm}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "7px",
                                height: "40px",
                                padding: "0 15px",
                                border: 0,
                                borderRadius: "9px",
                                background:
                                    "linear-gradient(135deg,#D8B46A,#B99250)",
                                color: "#17120A",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                fontSize: "12px",
                                fontWeight: 800,
                                boxShadow:
                                    "0 7px 18px rgba(216,180,106,.13)",
                            }}
                        >
                            <Plus size={15} />
                            Add Budget
                        </button>

                    </div>

                </div>


                {/* CATEGORY FILTER */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        flexWrap: "wrap",
                        marginTop: "13px",
                    }}
                >

                    {[
                        "All",
                        ...CATEGORIES,
                    ].map(
                        (category) => {
                            const active =
                                categoryFilter ===
                                category;

                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() =>
                                        setCategoryFilter(
                                            category
                                        )
                                    }
                                    style={{
                                        height: "31px",
                                        padding:
                                            "0 12px",
                                        borderRadius:
                                            "999px",
                                        border:
                                            active
                                                ? "1px solid rgba(216,180,106,.30)"
                                                : "1px solid rgba(148,163,184,.10)",
                                        background:
                                            active
                                                ? "rgba(216,180,106,.10)"
                                                : "#0D141D",
                                        color:
                                            active
                                                ? "#E8C77D"
                                                : "#8995A6",
                                        cursor:
                                            "pointer",
                                        fontFamily:
                                            "inherit",
                                        fontSize:
                                            "11px",
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    {category}
                                </button>
                            );
                        }
                    )}

                </div>

            </section>


            {/* =================================================
                BUDGET CARDS
            ================================================= */}

            {filteredBudgets.length > 0 ? (

                <section
                    className="budget-card-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(2,minmax(0,1fr))",
                        gap: "14px",
                    }}
                >

                    {filteredBudgets.map(
                        (budget) => {

                            const status =
                                budget.status;

                            const progress =
                                Math.min(
                                    Number(
                                        budget.progress ||
                                            0
                                    ),
                                    100
                                );

                            const budgetAmount =
                                Number(
                                    budget.budget_amount ||
                                        0
                                );

                            const spent =
                                Number(
                                    budget.spent ||
                                        0
                                );

                            const remaining =
                                Number(
                                    budget.remaining ||
                                        0
                                );

                            return (
                                <article
                                    key={
                                        budget.id
                                    }
                                    style={{
                                        position:
                                            "relative",
                                        overflow:
                                            "hidden",
                                        padding:
                                            "20px",
                                        borderRadius:
                                            "15px",
                                        background:
                                            "linear-gradient(145deg,#101925,#0C141E)",
                                        border:
                                            `1px solid ${status.border}`,
                                        boxShadow:
                                            "0 10px 30px rgba(0,0,0,.09)",
                                        transition:
                                            "transform .2s ease, border-color .2s ease",
                                    }}
                                    onMouseEnter={(
                                        event
                                    ) => {
                                        event.currentTarget.style.transform =
                                            "translateY(-2px)";
                                    }}
                                    onMouseLeave={(
                                        event
                                    ) => {
                                        event.currentTarget.style.transform =
                                            "translateY(0)";
                                    }}
                                >

                                    {/* STATUS GLOW */}

                                    <div
                                        style={{
                                            position:
                                                "absolute",
                                            width:
                                                "130px",
                                            height:
                                                "130px",
                                            right:
                                                "-75px",
                                            top:
                                                "-75px",
                                            borderRadius:
                                                "50%",
                                            background:
                                                status.color,
                                            opacity:
                                                .045,
                                            filter:
                                                "blur(25px)",
                                        }}
                                    />


                                    {/* CARD HEADER */}

                                    <div
                                        style={{
                                            position:
                                                "relative",
                                            zIndex: 1,
                                            display:
                                                "flex",
                                            alignItems:
                                                "flex-start",
                                            justifyContent:
                                                "space-between",
                                            gap:
                                                "15px",
                                        }}
                                    >

                                        <div
                                            style={{
                                                minWidth:
                                                    0,
                                            }}
                                        >

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap:
                                                        "7px",
                                                    marginBottom:
                                                        "8px",
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        width:
                                                            "34px",
                                                        height:
                                                            "34px",
                                                        display:
                                                            "grid",
                                                        placeItems:
                                                            "center",
                                                        borderRadius:
                                                            "9px",
                                                        color:
                                                            "#A78BFA",
                                                        background:
                                                            "rgba(167,139,250,.09)",
                                                    }}
                                                >
                                                    <Wallet
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </div>

                                                <div>

                                                    <h3
                                                        style={{
                                                            margin:
                                                                0,
                                                            color:
                                                                "#F1F5F9",
                                                            fontSize:
                                                                "15px",
                                                            lineHeight:
                                                                1.3,
                                                            fontWeight:
                                                                800,
                                                            overflow:
                                                                "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                            whiteSpace:
                                                                "nowrap",
                                                        }}
                                                    >
                                                        {budget.title ||
                                                            `${budget.category} Budget`}
                                                    </h3>

                                                    <span
                                                        style={{
                                                            display:
                                                                "block",
                                                            marginTop:
                                                                "3px",
                                                            color:
                                                                "#8491A3",
                                                            fontSize:
                                                                "11px",
                                                            fontWeight:
                                                                550,
                                                        }}
                                                    >
                                                        {
                                                            budget.category
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        </div>


                                        {/* ACTIONS */}

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                gap:
                                                    "6px",
                                            }}
                                        >

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(
                                                        budget
                                                    )
                                                }
                                                aria-label="Edit budget"
                                                style={{
                                                    width:
                                                        "34px",
                                                    height:
                                                        "34px",
                                                    display:
                                                        "grid",
                                                    placeItems:
                                                        "center",
                                                    border:
                                                        "1px solid rgba(148,163,184,.12)",
                                                    borderRadius:
                                                        "8px",
                                                    background:
                                                        "#0C141E",
                                                    color:
                                                        "#9AA6B6",
                                                    cursor:
                                                        "pointer",
                                                }}
                                            >
                                                <Pencil
                                                    size={
                                                        14
                                                    }
                                                />
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(
                                                        budget.id
                                                    )
                                                }
                                                aria-label="Delete budget"
                                                style={{
                                                    width:
                                                        "34px",
                                                    height:
                                                        "34px",
                                                    display:
                                                        "grid",
                                                    placeItems:
                                                        "center",
                                                    border:
                                                        "1px solid rgba(251,113,133,.12)",
                                                    borderRadius:
                                                        "8px",
                                                    background:
                                                        "rgba(251,113,133,.035)",
                                                    color:
                                                        "#FB7185",
                                                    cursor:
                                                        "pointer",
                                                }}
                                            >
                                                <Trash2
                                                    size={
                                                        14
                                                    }
                                                />
                                            </button>

                                        </div>

                                    </div>


                                    {/* STATUS */}

                                    <div
                                        style={{
                                            display:
                                                "inline-flex",
                                            alignItems:
                                                "center",
                                            gap:
                                                "6px",
                                            marginTop:
                                                "13px",
                                            padding:
                                                "6px 9px",
                                            borderRadius:
                                                "999px",
                                            color:
                                                status.color,
                                            background:
                                                status.background,
                                            border:
                                                `1px solid ${status.border}`,
                                            fontSize:
                                                "10px",
                                            fontWeight:
                                                750,
                                        }}
                                    >
                                        {status.icon}
                                        {status.label}
                                    </div>


                                    {/* AMOUNT SUMMARY */}

                                    <div
                                        style={{
                                            display:
                                                "grid",
                                            gridTemplateColumns:
                                                "repeat(3,minmax(0,1fr))",
                                            gap:
                                                "10px",
                                            marginTop:
                                                "18px",
                                        }}
                                    >

                                        <div>

                                            <span
                                                style={{
                                                    display:
                                                        "block",
                                                    color:
                                                        "#7F8B9D",
                                                    fontSize:
                                                        "10px",
                                                    fontWeight:
                                                        650,
                                                }}
                                            >
                                                Budget
                                            </span>

                                            <strong
                                                style={{
                                                    display:
                                                        "block",
                                                    marginTop:
                                                        "5px",
                                                    color:
                                                        "#F1F5F9",
                                                    fontSize:
                                                        "14px",
                                                    fontWeight:
                                                        800,
                                                }}
                                            >
                                                {formatCurrency(
                                                    budgetAmount
                                                )}
                                            </strong>

                                        </div>


                                        <div>

                                            <span
                                                style={{
                                                    display:
                                                        "block",
                                                    color:
                                                        "#7F8B9D",
                                                    fontSize:
                                                        "10px",
                                                    fontWeight:
                                                        650,
                                                }}
                                            >
                                                Spent
                                            </span>

                                            <strong
                                                style={{
                                                    display:
                                                        "block",
                                                    marginTop:
                                                        "5px",
                                                    color:
                                                        "#FB7185",
                                                    fontSize:
                                                        "14px",
                                                    fontWeight:
                                                        800,
                                                }}
                                            >
                                                {formatCurrency(
                                                    spent
                                                )}
                                            </strong>

                                        </div>


                                        <div>

                                            <span
                                                style={{
                                                    display:
                                                        "block",
                                                    color:
                                                        "#7F8B9D",
                                                    fontSize:
                                                        "10px",
                                                    fontWeight:
                                                        650,
                                                }}
                                            >
                                                Remaining
                                            </span>

                                            <strong
                                                style={{
                                                    display:
                                                        "block",
                                                    marginTop:
                                                        "5px",
                                                    color:
                                                        remaining <
                                                        0
                                                            ? "#FB7185"
                                                            : "#34D399",
                                                    fontSize:
                                                        "14px",
                                                    fontWeight:
                                                        800,
                                                }}
                                            >
                                                {formatCurrency(
                                                    remaining
                                                )}
                                            </strong>

                                        </div>

                                    </div>


                                    {/* PROGRESS */}

                                    <div
                                        style={{
                                            marginTop:
                                                "19px",
                                        }}
                                    >

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "space-between",
                                                marginBottom:
                                                    "8px",
                                            }}
                                        >

                                            <span
                                                style={{
                                                    color:
                                                        "#8A96A7",
                                                    fontSize:
                                                        "10px",
                                                    fontWeight:
                                                        650,
                                                }}
                                            >
                                                Budget
                                                utilization
                                            </span>

                                            <strong
                                                style={{
                                                    color:
                                                        status.color,
                                                    fontSize:
                                                        "11px",
                                                    fontWeight:
                                                        800,
                                                }}
                                            >
                                                {Number(
                                                    budget.progress ||
                                                        0
                                                ).toFixed(
                                                    1
                                                )}
                                                %
                                            </strong>

                                        </div>


                                        <div
                                            style={{
                                                width:
                                                    "100%",
                                                height:
                                                    "8px",
                                                overflow:
                                                    "hidden",
                                                borderRadius:
                                                    "999px",
                                                background:
                                                    "rgba(255,255,255,.065)",
                                            }}
                                        >

                                            <div
                                                style={{
                                                    width:
                                                        `${progress}%`,
                                                    height:
                                                        "100%",
                                                    borderRadius:
                                                        "inherit",
                                                    background:
                                                        `linear-gradient(90deg,${status.color},${status.color}B5)`,
                                                    transition:
                                                        "width .5s ease",
                                                }}
                                            />

                                        </div>

                                    </div>


                                    {/* FOOTER */}

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "space-between",
                                            gap:
                                                "12px",
                                            marginTop:
                                                "17px",
                                            paddingTop:
                                                "14px",
                                            borderTop:
                                                "1px solid rgba(148,163,184,.08)",
                                        }}
                                    >

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                gap:
                                                    "7px",
                                                color:
                                                    "#7F8B9D",
                                                fontSize:
                                                    "11px",
                                                fontWeight:
                                                    600,
                                            }}
                                        >
                                            <CalendarDays
                                                size={
                                                    13
                                                }
                                            />

                                            {MONTH_NAMES[
                                                Number(
                                                    budget.month
                                                )
                                            ] ||
                                                "Month"}{" "}
                                            {budget.year}

                                        </div>


                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                gap:
                                                    "6px",
                                                color:
                                                    "#7F8B9D",
                                                fontSize:
                                                    "10px",
                                                fontWeight:
                                                    600,
                                            }}
                                        >
                                            <ShieldCheck
                                                size={
                                                    13
                                                }
                                            />

                                            Tracked

                                        </div>

                                    </div>

                                </article>
                            );
                        }
                    )}

                </section>

            ) : (

                /* =================================================
                   EMPTY STATE
                ================================================= */

                <section
                    style={{
                        minHeight: "310px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "35px",
                        textAlign: "center",
                        borderRadius: "15px",
                        border:
                            "1px dashed rgba(148,163,184,.18)",
                        background:
                            "rgba(255,255,255,.012)",
                    }}
                >

                    <div
                        style={{
                            width: "58px",
                            height: "58px",
                            display: "grid",
                            placeItems: "center",
                            marginBottom: "15px",
                            borderRadius: "15px",
                            color: "#A78BFA",
                            background:
                                "rgba(167,139,250,.09)",
                            border:
                                "1px solid rgba(167,139,250,.14)",
                        }}
                    >
                        {searchTerm ||
                        categoryFilter !==
                            "All" ? (
                            <Search size={25} />
                        ) : (
                            <Target size={25} />
                        )}
                    </div>


                    <h3
                        style={{
                            margin: 0,
                            color: "#F1F5F9",
                            fontSize: "17px",
                            lineHeight: 1.3,
                            fontWeight: 800,
                        }}
                    >
                        {searchTerm ||
                        categoryFilter !==
                            "All"
                            ? "No matching budgets"
                            : "No budgets created yet"}
                    </h3>


                    <p
                        style={{
                            maxWidth: "450px",
                            margin: "7px 0 0",
                            color: "#8591A3",
                            fontSize: "12px",
                            lineHeight: 1.6,
                            fontWeight: 500,
                        }}
                    >
                        {searchTerm ||
                        categoryFilter !==
                            "All"
                            ? "Try a different search term or category filter."
                            : "Create your first spending plan to start tracking your financial limits."}
                    </p>


                    {!searchTerm &&
                        categoryFilter ===
                            "All" && (
                            <button
                                type="button"
                                onClick={
                                    openCreateForm
                                }
                                style={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    gap:
                                        "7px",
                                    height:
                                        "40px",
                                    marginTop:
                                        "18px",
                                    padding:
                                        "0 15px",
                                    border: 0,
                                    borderRadius:
                                        "9px",
                                    background:
                                        "linear-gradient(135deg,#B59AFF,#8B5CF6)",
                                    color:
                                        "#160C27",
                                    cursor:
                                        "pointer",
                                    fontFamily:
                                        "inherit",
                                    fontSize:
                                        "12px",
                                    fontWeight:
                                        800,
                                }}
                            >
                                <Plus size={15} />
                                Create your first budget
                            </button>
                        )}

                </section>

            )}


            {/* =================================================
                CURRENT MONTH INSIGHT
            ================================================= */}

            {currentMonthBudgetTotal > 0 && (
                <section
                    style={{
                        marginTop: "20px",
                        padding: "20px",
                        borderRadius: "15px",
                        background:
                            "linear-gradient(145deg,#0F1824,#0B131D)",
                        border:
                            "1px solid rgba(52,211,153,.10)",
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "12px",
                        }}
                    >

                        <div
                            style={{
                                width: "34px",
                                height: "34px",
                                display: "grid",
                                placeItems: "center",
                                borderRadius: "9px",
                                color: "#34D399",
                                background:
                                    "rgba(52,211,153,.08)",
                            }}
                        >
                            <CalendarDays
                                size={16}
                            />
                        </div>

                        <div>

                            <div
                                style={{
                                    color: "#8793A5",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    letterSpacing:
                                        ".7px",
                                }}
                            >
                                CURRENT MONTH
                            </div>

                            <div
                                style={{
                                    marginTop:
                                        "3px",
                                    color:
                                        "#F1F5F9",
                                    fontSize:
                                        "14px",
                                    fontWeight:
                                        750,
                                }}
                            >
                                {
                                    MONTH_NAMES[
                                        currentMonth
                                    ]
                                }{" "}
                                {currentYear}
                            </div>

                        </div>

                    </div>


                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                                "space-between",
                            gap: "20px",
                            flexWrap: "wrap",
                        }}
                    >

                        <div>

                            <span
                                style={{
                                    color:
                                        "#8491A3",
                                    fontSize:
                                        "11px",
                                    fontWeight:
                                        600,
                                }}
                            >
                                Current month spending
                            </span>

                            <strong
                                style={{
                                    display:
                                        "block",
                                    marginTop:
                                        "5px",
                                    color:
                                        "#F8FAFC",
                                    fontSize:
                                        "19px",
                                    fontWeight:
                                        800,
                                }}
                            >
                                {formatCurrency(
                                    currentMonthSpent
                                )}{" "}
                                <span
                                    style={{
                                        color:
                                            "#7D899A",
                                        fontSize:
                                            "12px",
                                        fontWeight:
                                            600,
                                    }}
                                >
                                    of{" "}
                                    {formatCurrency(
                                        currentMonthBudgetTotal
                                    )}
                                </span>
                            </strong>

                        </div>


                        <div
                            style={{
                                minWidth:
                                    "180px",
                                flex:
                                    "1 1 220px",
                                maxWidth:
                                    "420px",
                            }}
                        >

                            <div
                                style={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "space-between",
                                    marginBottom:
                                        "7px",
                                }}
                            >

                                <span
                                    style={{
                                        color:
                                            "#8491A3",
                                        fontSize:
                                            "10px",
                                        fontWeight:
                                            650,
                                    }}
                                >
                                    Utilization
                                </span>

                                <strong
                                    style={{
                                        color:
                                            currentMonthProgress >=
                                            100
                                                ? "#FB7185"
                                                : currentMonthProgress >=
                                                    80
                                                    ? "#FBBF24"
                                                    : "#34D399",
                                        fontSize:
                                            "11px",
                                        fontWeight:
                                            800,
                                    }}
                                >
                                    {currentMonthProgress.toFixed(
                                        1
                                    )}
                                    %
                                </strong>

                            </div>

                            <div
                                style={{
                                    height:
                                        "7px",
                                    overflow:
                                        "hidden",
                                    borderRadius:
                                        "999px",
                                    background:
                                        "rgba(255,255,255,.06)",
                                }}
                            >

                                <div
                                    style={{
                                        width:
                                            `${currentMonthProgress}%`,
                                        height:
                                            "100%",
                                        borderRadius:
                                            "inherit",
                                        background:
                                            currentMonthProgress >=
                                            100
                                                ? "#FB7185"
                                                : currentMonthProgress >=
                                                    80
                                                    ? "#FBBF24"
                                                    : "#34D399",
                                    }}
                                />

                            </div>

                        </div>

                    </div>

                </section>
            )}


            {/* =================================================
                RESPONSIVE STYLES
            ================================================= */}

            <style>
                {`
                    @media (max-width: 1050px) {
                        .budget-kpi-grid {
                            grid-template-columns:
                                repeat(2, minmax(0, 1fr)) !important;
                        }

                        .budget-card-grid {
                            grid-template-columns:
                                1fr !important;
                        }
                    }

                    @media (max-width: 720px) {
                        .budget-kpi-grid {
                            grid-template-columns:
                                1fr !important;
                        }

                        .budget-form-grid {
                            grid-template-columns:
                                1fr !important;
                        }
                    }

                    @media (max-width: 560px) {
                        .budget-card-grid {
                            grid-template-columns:
                                1fr !important;
                        }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        * {
                            scroll-behavior: auto !important;
                        }
                    }

                    @keyframes budget-toast-fade {
                        0%,
                        85% {
                            opacity: 1;
                            transform: translateY(0);
                        }

                        100% {
                            opacity: 0;
                            transform: translateY(8px);
                        }
                    }
                `}
            </style>

        </main>
    );
}
