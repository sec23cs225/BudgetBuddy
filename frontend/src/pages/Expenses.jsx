import { useEffect, useMemo, useRef, useState } from "react";

import {
    Wallet,
    Receipt,
    ShoppingBag,
    CreditCard,
    Search,
    Plus,
    Pencil,
    Trash2,
    X,
    CalendarDays,
    FileText,
    CircleDollarSign,
    SlidersHorizontal,
    TrendingDown,
    ArrowDownRight,
    ChevronDown,
} from "lucide-react";

import {
    createExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
} from "../services/expenseService";


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

const PAYMENT_METHODS = [
    "Cash",
    "UPI",
    "Card",
    "Net Banking",
];

const EMPTY_FORM = {
    title: "",
    amount: "",
    category: "",
    payment_method: "",
    expense_date: "",
    notes: "",
};


/* =========================================================
   DESIGN TOKENS
========================================================= */

const COLORS = {
    background: "#080D13",
    surface: "#0D141D",
    surfaceRaised: "#111A25",
    surfaceSoft: "#121D29",

    border: "rgba(148,163,184,.13)",
    borderStrong: "rgba(148,163,184,.20)",

    text: "#F4F7FA",
    textSecondary: "#A8B3C2",
    textMuted: "#7E8A9B",

    gold: "#D8B46A",
    goldBright: "#E6C77F",

    red: "#F27A7F",
    cyan: "#5DD6E8",
    green: "#45D3A6",
    violet: "#A78BFA",
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


const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


const getErrorMessage = (error) => {
    const serverError =
        error?.response?.data;

    if (!serverError) {
        return (
            error?.message ||
            "Something went wrong. Please try again."
        );
    }

    if (typeof serverError === "string") {
        return serverError;
    }

    if (serverError.detail) {
        return String(serverError.detail);
    }

    if (typeof serverError === "object") {
        return Object.entries(serverError)
            .map(([field, messages]) => {
                const message = Array.isArray(messages)
                    ? messages.join(", ")
                    : String(messages);

                return `${field}: ${message}`;
            })
            .join("\n");
    }

    return "Unable to save expense.";
};


/* =========================================================
   INPUT STYLES
========================================================= */

const inputStyle = {
    width: "100%",
    height: "46px",
    boxSizing: "border-box",
    padding: "0 14px",
    borderRadius: "10px",
    border:
        "1px solid rgba(148,163,184,.15)",
    outline: "none",
    background: "#0A1119",
    color: COLORS.text,
    fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: "13px",
    lineHeight: "1.4",
    fontWeight: 550,
    transition:
        "border-color .18s ease, box-shadow .18s ease",
};


const textareaStyle = {
    ...inputStyle,
    minHeight: "96px",
    height: "96px",
    padding: "13px 14px",
    resize: "vertical",
    lineHeight: "1.55",
};


/* =========================================================
   FORM FIELD
========================================================= */

function Field({ label, required = false, children }) {
    return (
        <div>
            <label
                style={{
                    display: "block",
                    marginBottom: "8px",
                    color: COLORS.textSecondary,
                    fontSize: "11px",
                    lineHeight: "1.3",
                    fontWeight: 750,
                    letterSpacing: ".45px",
                }}
            >
                {label}

                {required && (
                    <span
                        style={{
                            marginLeft: "3px",
                            color: COLORS.red,
                        }}
                    >
                        *
                    </span>
                )}
            </label>

            {children}
        </div>
    );
}


/* =========================================================
   KPI CARD
========================================================= */

function ExpenseKPI({
    icon,
    label,
    value,
    color,
    description,
}) {
    return (
        <article
            className="bb-expense-kpi"
            style={{
                position: "relative",
                overflow: "hidden",
                minWidth: 0,
                padding: "21px",
                borderRadius: "16px",
                background:
                    "linear-gradient(145deg,#111A25,#0D141D)",
                border:
                    `1px solid ${COLORS.border}`,
                boxShadow:
                    "0 12px 32px rgba(0,0,0,.14)",
                transition:
                    "transform .22s ease, border-color .22s ease, box-shadow .22s ease",
            }}
            onMouseEnter={(event) => {
                event.currentTarget.style.transform =
                    "translateY(-3px)";

                event.currentTarget.style.borderColor =
                    `${color}45`;

                event.currentTarget.style.boxShadow =
                    "0 17px 38px rgba(0,0,0,.20)";
            }}
            onMouseLeave={(event) => {
                event.currentTarget.style.transform =
                    "translateY(0)";

                event.currentTarget.style.borderColor =
                    COLORS.border;

                event.currentTarget.style.boxShadow =
                    "0 12px 32px rgba(0,0,0,.14)";
            }}
        >
            <div
                style={{
                    position: "absolute",
                    width: "120px",
                    height: "120px",
                    right: "-55px",
                    top: "-55px",
                    borderRadius: "50%",
                    background: color,
                    opacity: 0.055,
                    filter: "blur(24px)",
                    pointerEvents: "none",
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
                        width: "42px",
                        height: "42px",
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "11px",
                        marginBottom: "17px",
                        color,
                        background: `${color}12`,
                        border: `1px solid ${color}22`,
                    }}
                >
                    {icon}
                </div>

                <div
                    style={{
                        marginBottom: "7px",
                        color: COLORS.textMuted,
                        fontSize: "10px",
                        lineHeight: 1.2,
                        fontWeight: 800,
                        letterSpacing: "1.15px",
                    }}
                >
                    {label}
                </div>

                <div
                    style={{
                        color: COLORS.text,
                        fontSize: "24px",
                        lineHeight: 1.2,
                        fontWeight: 800,
                        letterSpacing: "-.55px",
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
                        color: COLORS.textMuted,
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
   MAIN EXPENSE PAGE
========================================================= */

export default function Expenses() {
    const [formData, setFormData] =
        useState({ ...EMPTY_FORM });

    const [expenses, setExpenses] =
        useState([]);

    const [editingExpense, setEditingExpense] =
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

    const [toastType, setToastType] =
        useState("success");

    const [deleteDialogOpen, setDeleteDialogOpen] =
        useState(false);

    const [selectedExpenseId, setSelectedExpenseId] =
        useState(null);

    const formSectionRef = useRef(null);
    const titleInputRef = useRef(null);

    const showToast = (
        message,
        type = "success"
    ) => {
        setToastMessage(message);
        setToastType(type);

        window.setTimeout(() => {
            setToastMessage("");
        }, 3500);
    };

    const scrollToExpenseForm = () => {
        window.setTimeout(() => {
            formSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });

            window.setTimeout(() => {
                titleInputRef.current?.focus();
            }, 500);
        }, 80);
    };


    /* =====================================================
       FETCH EXPENSES
    ===================================================== */

    const fetchExpenses = async () => {
        try {
            setLoading(true);

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
                error
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchExpenses();
    }, []);


    /* =====================================================
       HANDLE CHANGE
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
        setEditingExpense(null);

        setFormData({
            ...EMPTY_FORM,
        });

        setShowForm(true);

        scrollToExpenseForm();
    };


    /* =====================================================
       EDIT EXPENSE
    ===================================================== */

    const handleEdit = (expense) => {
        setEditingExpense(expense);

        setFormData({
            title:
                expense.title || "",
            amount:
                expense.amount || "",
            category:
                expense.category || "",
            payment_method:
                expense.payment_method || "",
            expense_date:
                expense.expense_date || "",
            notes:
                expense.notes || "",
        });

        setShowForm(true);

        scrollToExpenseForm();
    };


    /* =====================================================
       CLOSE FORM
    ===================================================== */

    const closeForm = () => {
        if (saving) {
            return;
        }

        setEditingExpense(null);

        setFormData({
            ...EMPTY_FORM,
        });

        setShowForm(false);
    };


    /* =====================================================
       SUBMIT
    ===================================================== */

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (saving) {
            return;
        }

        if (!formData.title.trim()) {
            alert(
                "Please enter an expense title."
            );
            return;
        }

        if (
            formData.amount === "" ||
            !Number.isFinite(
                Number(formData.amount)
            ) ||
            Number(formData.amount) <= 0
        ) {
            alert(
                "Please enter a valid expense amount."
            );
            return;
        }

        if (!formData.category) {
            alert(
                "Please select a category."
            );
            return;
        }

        if (!formData.payment_method) {
            alert(
                "Please select a payment method."
            );
            return;
        }

        if (!formData.expense_date) {
            alert(
                "Please select an expense date."
            );
            return;
        }

        try {
            setSaving(true);

            if (editingExpense) {
                await updateExpense(
                    editingExpense.id,
                    formData
                );

                alert(
                    "Expense updated successfully."
                );
            } else {
                await createExpense(
                    formData
                );

                showToast(
                    "Expense added successfully.",
                    "success"
                );
            }

            await fetchExpenses();

            closeForm();
        } catch (error) {
            console.error(
                "Expense save failed:",
                error.response?.data || error
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

    const handleDelete = (id) => {
        setSelectedExpenseId(id);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedExpenseId(null);
    };

    const confirmDelete = async () => {
        if (!selectedExpenseId) {
            return;
        }

        try {
            await deleteExpense(
                selectedExpenseId
            );

            await fetchExpenses();

            closeDeleteDialog();

            showToast(
                "Expense deleted successfully.",
                "success"
            );
        } catch (error) {
            console.error(
                "Delete failed:",
                error.response?.data || error
            );

            closeDeleteDialog();

            showToast(
                getErrorMessage(error),
                "error"
            );
        }
    };


    /* =====================================================
       FILTERED EXPENSES
    ===================================================== */

    const filteredExpenses = useMemo(() => {
        const search =
            searchTerm
                .toLowerCase()
                .trim();

        return expenses.filter(
            (expense) => {
                const matchesSearch =
                    !search ||
                    expense.title
                        ?.toLowerCase()
                        .includes(search) ||
                    expense.category
                        ?.toLowerCase()
                        .includes(search) ||
                    expense.payment_method
                        ?.toLowerCase()
                        .includes(search) ||
                    expense.notes
                        ?.toLowerCase()
                        .includes(search);

                const matchesCategory =
                    categoryFilter === "All" ||
                    expense.category ===
                        categoryFilter;

                return (
                    matchesSearch &&
                    matchesCategory
                );
            }
        );
    }, [
        expenses,
        searchTerm,
        categoryFilter,
    ]);


    /* =====================================================
       STATISTICS
    ===================================================== */

    const totalSpent = useMemo(() => {
        return expenses.reduce(
            (total, expense) =>
                total +
                Number(
                    expense.amount || 0
                ),
            0
        );
    }, [expenses]);


    const averageExpense =
        expenses.length > 0
            ? totalSpent / expenses.length
            : 0;


    const highestExpense =
        expenses.length > 0
            ? Math.max(
                  ...expenses.map(
                      (expense) =>
                          Number(
                              expense.amount || 0
                          )
                  )
              )
            : 0;


    const topCategory = useMemo(() => {
        const totals = {};

        expenses.forEach(
            (expense) => {
                const category =
                    expense.category ||
                    "Others";

                totals[category] =
                    (totals[category] || 0) +
                    Number(
                        expense.amount || 0
                    );
            }
        );

        const sorted =
            Object.entries(
                totals
            ).sort(
                (a, b) =>
                    b[1] - a[1]
            );

        return sorted.length
            ? sorted[0][0]
            : "—";
    }, [expenses]);


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <main
            className="bb-expenses-page"
            style={{
                width: "100%",
                maxWidth: "1280px",
                margin: "0 auto",
                padding: "30px 30px 60px",
                boxSizing: "border-box",
                color: COLORS.text,
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
                    className="bb-expense-toast"
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
                        border:
                            toastType === "error"
                                ? "1px solid rgba(242,122,127,.30)"
                                : "1px solid rgba(52,211,153,.28)",
                        borderRadius: "12px",
                        background:
                            toastType === "error"
                                ? "#2A171A"
                                : "#10261F",
                        boxShadow:
                            "0 16px 40px rgba(0,0,0,.28)",
                        color:
                            toastType === "error"
                                ? "#FECACA"
                                : "#D1FAE5",
                        fontSize: "12px",
                        fontWeight: 700,
                    }}
                >
                    <span
                        aria-hidden="true"
                        style={{
                            width: "20px",
                            height: "20px",
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            borderRadius: "50%",
                            background:
                                toastType === "error"
                                    ? "#EF4444"
                                    : "#10B981",
                            color:
                                toastType === "error"
                                    ? "#FFF1F2"
                                    : "#052E24",
                            fontSize: "13px",
                            fontWeight: 900,
                        }}
                    >
                        {toastType === "error" ? "!" : "✓"}
                    </span>
                    <span style={{ whiteSpace: "pre-line" }}>
                        {toastMessage}
                    </span>
                </div>
            )}

            {/* =================================================
                HERO
            ================================================= */}

            <section
                className="bb-expense-hero"
                style={{
                    position: "relative",
                    overflow: "hidden",
                    minHeight: "205px",
                    padding: "31px 32px",
                    marginBottom: "19px",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "19px",
                    background:
                        "linear-gradient(135deg,#111B27 0%,#0D151F 58%,#101923 100%)",
                    border:
                        "1px solid rgba(148,163,184,.13)",
                    boxShadow:
                        "0 18px 48px rgba(0,0,0,.17)",
                }}
            >

                <div
                    style={{
                        position: "absolute",
                        width: "290px",
                        height: "290px",
                        right: "-105px",
                        top: "-170px",
                        borderRadius: "50%",
                        background:
                            "rgba(229,107,111,.075)",
                        filter: "blur(58px)",
                        pointerEvents: "none",
                    }}
                />

                <div
                    style={{
                        position: "absolute",
                        width: "230px",
                        height: "230px",
                        left: "36%",
                        bottom: "-190px",
                        borderRadius: "50%",
                        background:
                            "rgba(216,180,106,.045)",
                        filter: "blur(60px)",
                        pointerEvents: "none",
                    }}
                />

                <div
                    style={{
                        position: "relative",
                        zIndex: 1,
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "space-between",
                        gap: "25px",
                    }}
                >

                    <div>

                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "7px",
                                marginBottom: "10px",
                                color: COLORS.goldBright,
                                fontSize: "10px",
                                lineHeight: 1,
                                fontWeight: 800,
                                letterSpacing: "1.55px",
                            }}
                        >
                            <Receipt size={12} />
                            EXPENSE MANAGEMENT
                        </div>

                        <h1
                            style={{
                                margin: 0,
                                color: COLORS.text,
                                fontSize: "31px",
                                lineHeight: 1.14,
                                fontWeight: 850,
                                letterSpacing: "-.85px",
                            }}
                        >
                            Know where
                            <br />
                            your money goes.
                        </h1>

                        <p
                            style={{
                                maxWidth: "580px",
                                margin: "10px 0 0",
                                color: COLORS.textMuted,
                                fontSize: "13px",
                                lineHeight: 1.6,
                                fontWeight: 500,
                            }}
                        >
                            Capture every transaction,
                            understand your spending
                            patterns, and stay in control
                            of your financial life.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={
                            showForm
                                ? closeForm
                                : openCreateForm
                        }
                        style={{
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            minHeight: "44px",
                            padding: "0 17px",
                            border:
                                "1px solid rgba(216,180,106,.25)",
                            borderRadius: "10px",
                            background:
                                "linear-gradient(135deg,#D8B46A,#B99250)",
                            color: "#17120A",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontSize: "12px",
                            fontWeight: 800,
                            boxShadow:
                                "0 9px 25px rgba(216,180,106,.13)",
                        }}
                    >

                        {showForm ? (
                            <X size={16} />
                        ) : (
                            <Plus size={16} />
                        )}

                        {showForm
                            ? "Close Form"
                            : "Add Expense"}

                    </button>

                </div>

            </section>


            {/* =================================================
                KPI GRID
            ================================================= */}

            <section
                className="bb-expense-kpi-grid"
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(4,minmax(0,1fr))",
                    gap: "13px",
                    marginBottom: "26px",
                }}
            >

                <ExpenseKPI
                    icon={
                        <TrendingDown
                            size={19}
                        />
                    }
                    label="TOTAL SPENT"
                    value={formatCurrency(
                        totalSpent
                    )}
                    color={COLORS.red}
                    description="Across all recorded expenses"
                />

                <ExpenseKPI
                    icon={
                        <Receipt size={19} />
                    }
                    label="TRANSACTIONS"
                    value={expenses.length}
                    color={COLORS.cyan}
                    description="Total recorded transactions"
                />

                <ExpenseKPI
                    icon={
                        <CircleDollarSign
                            size={19}
                        />
                    }
                    label="AVERAGE EXPENSE"
                    value={formatCurrency(
                        averageExpense
                    )}
                    color={COLORS.gold}
                    description="Average per transaction"
                />

                <ExpenseKPI
                    icon={
                        <ShoppingBag size={19} />
                    }
                    label="TOP CATEGORY"
                    value={topCategory}
                    color={COLORS.green}
                    description={
                        highestExpense > 0
                            ? `Highest transaction ${formatCurrency(
                                  highestExpense
                              )}`
                            : "No expenses recorded yet"
                    }
                />

            </section>


            {/* =================================================
                CREATE / EDIT FORM
            ================================================= */}

            {showForm && (
                <section
                    ref={formSectionRef}
                    className="bb-expense-form"
                    style={{
                        scrollMarginTop: "24px",
                        marginBottom: "26px",
                        padding: "25px",
                        borderRadius: "17px",
                        background:
                            "linear-gradient(145deg,#111A25,#0D141D)",
                        border:
                            "1px solid rgba(216,180,106,.13)",
                        boxShadow:
                            "0 16px 40px rgba(0,0,0,.15)",
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "23px",
                        }}
                    >

                        <div
                            style={{
                                width: "42px",
                                height: "42px",
                                display: "grid",
                                placeItems: "center",
                                flexShrink: 0,
                                borderRadius: "11px",
                                color: COLORS.goldBright,
                                background:
                                    "rgba(216,180,106,.09)",
                                border:
                                    "1px solid rgba(216,180,106,.16)",
                            }}
                        >
                            {editingExpense ? (
                                <Pencil size={18} />
                            ) : (
                                <Plus size={19} />
                            )}
                        </div>

                        <div>

                            <h2
                                style={{
                                    margin: 0,
                                    color: COLORS.text,
                                    fontSize: "19px",
                                    lineHeight: 1.3,
                                    fontWeight: 800,
                                    letterSpacing: "-.2px",
                                }}
                            >
                                {editingExpense
                                    ? "Edit Expense"
                                    : "Record an Expense"}
                            </h2>

                            <p
                                style={{
                                    margin:
                                        "5px 0 0",
                                    color:
                                        COLORS.textMuted,
                                    fontSize: "12px",
                                    lineHeight: 1.5,
                                    fontWeight: 500,
                                }}
                            >
                                {editingExpense
                                    ? "Update the transaction details below."
                                    : "Add a transaction to keep your financial records accurate."}
                            </p>

                        </div>

                    </div>


                    <form onSubmit={handleSubmit}>

                        <div
                            className="bb-expense-form-grid"
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(2,minmax(0,1fr))",
                                gap: "18px",
                            }}
                        >

                            <Field
                                label="EXPENSE TITLE"
                                required
                            >
                                <input
                                    ref={titleInputRef}
                                    type="text"
                                    name="title"
                                    placeholder="e.g. Grocery shopping"
                                    value={
                                        formData.title
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    style={inputStyle}
                                    required
                                />
                            </Field>


                            <Field
                                label="AMOUNT"
                                required
                            >
                                <div
                                    style={{
                                        position:
                                            "relative",
                                    }}
                                >

                                    <span
                                        style={{
                                            position:
                                                "absolute",
                                            left: "14px",
                                            top: "50%",
                                            transform:
                                                "translateY(-50%)",
                                            color:
                                                COLORS.gold,
                                            fontSize:
                                                "13px",
                                            fontWeight:
                                                750,
                                            pointerEvents:
                                                "none",
                                        }}
                                    >
                                        ₹
                                    </span>

                                    <input
                                        type="number"
                                        name="amount"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        value={
                                            formData.amount
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        style={{
                                            ...inputStyle,
                                            paddingLeft:
                                                "30px",
                                        }}
                                        required
                                    />

                                </div>
                            </Field>


                            <Field
                                label="CATEGORY"
                                required
                            >
                                <div
                                    style={{
                                        position:
                                            "relative",
                                    }}
                                >

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
                                            appearance:
                                                "none",
                                            paddingRight:
                                                "40px",
                                            cursor:
                                                "pointer",
                                        }}
                                        required
                                    >

                                        <option value="">
                                            Select category
                                        </option>

                                        {CATEGORIES.map(
                                            (
                                                category
                                            ) => (
                                                <option
                                                    key={
                                                        category
                                                    }
                                                    value={
                                                        category
                                                    }
                                                >
                                                    {
                                                        category
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                    <ChevronDown
                                        size={15}
                                        color={
                                            COLORS.textMuted
                                        }
                                        style={{
                                            position:
                                                "absolute",
                                            right: "14px",
                                            top: "50%",
                                            transform:
                                                "translateY(-50%)",
                                            pointerEvents:
                                                "none",
                                        }}
                                    />

                                </div>
                            </Field>


                            <Field
                                label="PAYMENT METHOD"
                                required
                            >
                                <div
                                    style={{
                                        position:
                                            "relative",
                                    }}
                                >

                                    <select
                                        name="payment_method"
                                        value={
                                            formData.payment_method
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        style={{
                                            ...inputStyle,
                                            appearance:
                                                "none",
                                            paddingRight:
                                                "40px",
                                            cursor:
                                                "pointer",
                                        }}
                                        required
                                    >

                                        <option value="">
                                            Select payment method
                                        </option>

                                        {PAYMENT_METHODS.map(
                                            (
                                                method
                                            ) => (
                                                <option
                                                    key={
                                                        method
                                                    }
                                                    value={
                                                        method
                                                    }
                                                >
                                                    {
                                                        method
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                    <ChevronDown
                                        size={15}
                                        color={
                                            COLORS.textMuted
                                        }
                                        style={{
                                            position:
                                                "absolute",
                                            right: "14px",
                                            top: "50%",
                                            transform:
                                                "translateY(-50%)",
                                            pointerEvents:
                                                "none",
                                        }}
                                    />

                                </div>
                            </Field>


                            <Field
                                label="EXPENSE DATE"
                                required
                            >
                                <div
                                    style={{
                                        position:
                                            "relative",
                                    }}
                                >

                                    <CalendarDays
                                        size={15}
                                        color={
                                            COLORS.textMuted
                                        }
                                        style={{
                                            position:
                                                "absolute",
                                            left: "14px",
                                            top: "15px",
                                            pointerEvents:
                                                "none",
                                        }}
                                    />

                                    <input
                                        type="date"
                                        name="expense_date"
                                        value={
                                            formData.expense_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        style={{
                                            ...inputStyle,
                                            paddingLeft:
                                                "39px",
                                        }}
                                        required
                                    />

                                </div>
                            </Field>


                            <Field label="NOTES">

                                <textarea
                                    name="notes"
                                    placeholder="Add context about this expense..."
                                    value={
                                        formData.notes
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    style={
                                        textareaStyle
                                    }
                                />

                            </Field>

                        </div>


                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "flex-end",
                                gap: "10px",
                                marginTop: "22px",
                                paddingTop: "18px",
                                borderTop:
                                    "1px solid rgba(148,163,184,.08)",
                            }}
                        >

                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={saving}
                                style={{
                                    height: "42px",
                                    padding:
                                        "0 18px",
                                    border:
                                        "1px solid rgba(148,163,184,.14)",
                                    borderRadius:
                                        "9px",
                                    background:
                                        "rgba(255,255,255,.02)",
                                    color:
                                        COLORS.textSecondary,
                                    cursor:
                                        saving
                                            ? "not-allowed"
                                            : "pointer",
                                    fontFamily:
                                        "inherit",
                                    fontSize:
                                        "12px",
                                    fontWeight:
                                        700,
                                    opacity:
                                        saving
                                            ? .55
                                            : 1,
                                }}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    height: "42px",
                                    minWidth:
                                        "145px",
                                    padding:
                                        "0 18px",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    gap: "7px",
                                    border: 0,
                                    borderRadius:
                                        "9px",
                                    background:
                                        saving
                                            ? "#59616B"
                                            : "linear-gradient(135deg,#D8B46A,#B99250)",
                                    color:
                                        "#17120A",
                                    cursor:
                                        saving
                                            ? "not-allowed"
                                            : "pointer",
                                    fontFamily:
                                        "inherit",
                                    fontSize:
                                        "12px",
                                    fontWeight:
                                        800,
                                }}
                            >

                                {saving
                                    ? "Saving..."
                                    : editingExpense
                                    ? (
                                        <>
                                            <Pencil
                                                size={
                                                    14
                                                }
                                            />
                                            Update Expense
                                        </>
                                    )
                                    : (
                                        <>
                                            <Plus
                                                size={
                                                    14
                                                }
                                            />
                                            Save Expense
                                        </>
                                    )}

                            </button>

                        </div>

                    </form>

                </section>
            )}


            {/* =================================================
                TRANSACTION HEADER
            ================================================= */}

            <section>

                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent:
                            "space-between",
                        gap: "18px",
                        flexWrap: "wrap",
                        marginBottom: "15px",
                    }}
                >

                    <div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "7px",
                                marginBottom: "7px",
                                color:
                                    COLORS.goldBright,
                                fontSize: "10px",
                                lineHeight: 1,
                                fontWeight: 800,
                                letterSpacing:
                                    "1.35px",
                            }}
                        >
                            <Receipt size={12} />
                            TRANSACTION HISTORY
                        </div>

                        <h2
                            style={{
                                margin: 0,
                                color: COLORS.text,
                                fontSize: "21px",
                                lineHeight: 1.25,
                                fontWeight: 800,
                                letterSpacing:
                                    "-.3px",
                            }}
                        >
                            Your expenses
                        </h2>

                        <p
                            style={{
                                margin:
                                    "5px 0 0",
                                color:
                                    COLORS.textMuted,
                                fontSize: "12px",
                                lineHeight: 1.45,
                            }}
                        >
                            Review, search and
                            manage your recorded
                            transactions.
                        </p>

                    </div>


                    {/* SEARCH */}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "9px",
                            width: "280px",
                            height: "42px",
                            padding: "0 12px",
                            boxSizing:
                                "border-box",
                            borderRadius: "10px",
                            background:
                                "#0D141D",
                            border:
                                "1px solid rgba(148,163,184,.14)",
                        }}
                    >

                        <Search
                            size={16}
                            color={
                                COLORS.textMuted
                            }
                        />

                        <input
                            type="text"
                            placeholder="Search expenses..."
                            value={
                                searchTerm
                            }
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target
                                        .value
                                )
                            }
                            style={{
                                width: "100%",
                                border: 0,
                                outline: 0,
                                background:
                                    "transparent",
                                color:
                                    COLORS.text,
                                fontFamily:
                                    "inherit",
                                fontSize:
                                    "12px",
                                fontWeight:
                                    550,
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
                                    display:
                                        "grid",
                                    placeItems:
                                        "center",
                                    padding: 0,
                                    border: 0,
                                    background:
                                        "transparent",
                                    color:
                                        COLORS.textMuted,
                                    cursor:
                                        "pointer",
                                }}
                                aria-label="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}

                    </div>

                </div>


                {/* =================================================
                    FILTERS
                ================================================= */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        flexWrap: "wrap",
                        marginBottom: "13px",
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginRight: "3px",
                            color:
                                COLORS.textMuted,
                            fontSize: "10px",
                            fontWeight: 750,
                        }}
                    >
                        <SlidersHorizontal
                            size={13}
                        />
                        Filter
                    </div>


                    {[
                        "All",
                        ...CATEGORIES,
                    ].map((category) => {
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
                                            ? "1px solid rgba(216,180,106,.32)"
                                            : "1px solid rgba(148,163,184,.11)",
                                    background:
                                        active
                                            ? "rgba(216,180,106,.10)"
                                            : "rgba(255,255,255,.015)",
                                    color:
                                        active
                                            ? COLORS.goldBright
                                            : COLORS.textMuted,
                                    cursor:
                                        "pointer",
                                    fontFamily:
                                        "inherit",
                                    fontSize:
                                        "11px",
                                    fontWeight:
                                        700,
                                    transition:
                                        "all .16s ease",
                                }}
                            >
                                {category}
                            </button>
                        );
                    })}

                </div>


                {/* =================================================
                    TRANSACTION TABLE
                ================================================= */}

                <div
                    className="bb-expense-table-wrapper"
                    style={{
                        overflowX: "auto",
                        borderRadius: "16px",
                        border:
                            "1px solid rgba(148,163,184,.12)",
                        background:
                            "#0D141D",
                        boxShadow:
                            "0 14px 38px rgba(0,0,0,.12)",
                    }}
                >

                    {loading ? (

                        <div
                            style={{
                                minHeight:
                                    "330px",
                                display:
                                    "grid",
                                placeItems:
                                    "center",
                                textAlign:
                                    "center",
                            }}
                        >
                            <div>

                                <div
                                    style={{
                                        width:
                                            "48px",
                                        height:
                                            "48px",
                                        display:
                                            "grid",
                                        placeItems:
                                            "center",
                                        margin:
                                            "0 auto 13px",
                                        borderRadius:
                                            "14px",
                                        color:
                                            COLORS.gold,
                                        background:
                                            "rgba(216,180,106,.08)",
                                    }}
                                >
                                    <Receipt
                                        size={
                                            22
                                        }
                                    />
                                </div>

                                <div
                                    style={{
                                        color:
                                            COLORS.text,
                                        fontSize:
                                            "14px",
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    Loading expenses
                                </div>

                                <div
                                    style={{
                                        marginTop:
                                            "5px",
                                        color:
                                            COLORS.textMuted,
                                        fontSize:
                                            "12px",
                                    }}
                                >
                                    Fetching your
                                    transaction history...
                                </div>

                            </div>
                        </div>

                    ) : filteredExpenses.length ===
                      0 ? (

                        <div
                            style={{
                                minHeight:
                                    "330px",
                                display:
                                    "grid",
                                placeItems:
                                    "center",
                                padding:
                                    "30px",
                                textAlign:
                                    "center",
                            }}
                        >

                            <div>

                                <div
                                    style={{
                                        width:
                                            "58px",
                                        height:
                                            "58px",
                                        display:
                                            "grid",
                                        placeItems:
                                            "center",
                                        margin:
                                            "0 auto 16px",
                                        borderRadius:
                                            "16px",
                                        color:
                                            COLORS.gold,
                                        background:
                                            "rgba(216,180,106,.07)",
                                        border:
                                            "1px solid rgba(216,180,106,.13)",
                                    }}
                                >
                                    <FileText
                                        size={
                                            25
                                        }
                                    />
                                </div>

                                <h3
                                    style={{
                                        margin:
                                            0,
                                        color:
                                            COLORS.text,
                                        fontSize:
                                            "17px",
                                        lineHeight:
                                            1.3,
                                        fontWeight:
                                            800,
                                    }}
                                >
                                    No expenses found
                                </h3>

                                <p
                                    style={{
                                        maxWidth:
                                            "420px",
                                        margin:
                                            "7px auto 0",
                                        color:
                                            COLORS.textMuted,
                                        fontSize:
                                            "12px",
                                        lineHeight:
                                            1.55,
                                    }}
                                >
                                    {searchTerm ||
                                    categoryFilter !==
                                        "All"
                                        ? "Try changing your search or category filter."
                                        : "Your recorded expenses will appear here once you add your first transaction."}
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
                                                    "inline-flex",
                                                alignItems:
                                                    "center",
                                                gap:
                                                    "7px",
                                                height:
                                                    "40px",
                                                marginTop:
                                                    "17px",
                                                padding:
                                                    "0 15px",
                                                border:
                                                    0,
                                                borderRadius:
                                                    "9px",
                                                background:
                                                    "linear-gradient(135deg,#D8B46A,#B99250)",
                                                color:
                                                    "#17120A",
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
                                            <Plus
                                                size={
                                                    15
                                                }
                                            />
                                            Add your first expense
                                        </button>
                                    )}

                            </div>

                        </div>

                    ) : (

                        <table
                            style={{
                                width: "100%",
                                minWidth:
                                    "900px",
                                borderCollapse:
                                    "collapse",
                            }}
                        >

                            <thead>

                                <tr
                                    style={{
                                        background:
                                            "#111A24",
                                    }}
                                >

                                    {[
                                        "EXPENSE",
                                        "CATEGORY",
                                        "PAYMENT",
                                        "DATE",
                                        "AMOUNT",
                                        "ACTION",
                                    ].map(
                                        (
                                            heading
                                        ) => (
                                            <th
                                                key={
                                                    heading
                                                }
                                                style={{
                                                    padding:
                                                        "15px 16px",
                                                    textAlign:
                                                        heading ===
                                                        "AMOUNT"
                                                            ? "right"
                                                            : "left",
                                                    color:
                                                        COLORS.textMuted,
                                                    fontSize:
                                                        "10px",
                                                    lineHeight:
                                                        1.2,
                                                    fontWeight:
                                                        800,
                                                    letterSpacing:
                                                        "1px",
                                                    whiteSpace:
                                                        "nowrap",
                                                    borderBottom:
                                                        "1px solid rgba(148,163,184,.09)",
                                                }}
                                            >
                                                {
                                                    heading
                                                }
                                            </th>
                                        )
                                    )}

                                </tr>

                            </thead>


                            <tbody>

                                {filteredExpenses.map(
                                    (expense) => (
                                        <tr
                                            key={
                                                expense.id
                                            }
                                            style={{
                                                transition:
                                                    "background .16s ease",
                                            }}
                                            onMouseEnter={(
                                                event
                                            ) => {
                                                event.currentTarget.style.background =
                                                    "rgba(216,180,106,.025)";
                                            }}
                                            onMouseLeave={(
                                                event
                                            ) => {
                                                event.currentTarget.style.background =
                                                    "transparent";
                                            }}
                                        >

                                            {/* EXPENSE */}

                                            <td
                                                style={{
                                                    padding:
                                                        "16px",
                                                    borderBottom:
                                                        "1px solid rgba(148,163,184,.065)",
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        gap:
                                                            "11px",
                                                    }}
                                                >

                                                    <div
                                                        style={{
                                                            width:
                                                                "38px",
                                                            height:
                                                                "38px",
                                                            display:
                                                                "grid",
                                                            placeItems:
                                                                "center",
                                                            flexShrink:
                                                                0,
                                                            borderRadius:
                                                                "10px",
                                                            color:
                                                                COLORS.red,
                                                            background:
                                                                "rgba(242,122,127,.08)",
                                                            border:
                                                                "1px solid rgba(242,122,127,.11)",
                                                        }}
                                                    >
                                                        <Receipt
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </div>

                                                    <div
                                                        style={{
                                                            minWidth:
                                                                0,
                                                        }}
                                                    >

                                                        <div
                                                            style={{
                                                                color:
                                                                    COLORS.text,
                                                                fontSize:
                                                                    "13px",
                                                                lineHeight:
                                                                    1.35,
                                                                fontWeight:
                                                                    700,
                                                                overflow:
                                                                    "hidden",
                                                                textOverflow:
                                                                    "ellipsis",
                                                                whiteSpace:
                                                                    "nowrap",
                                                                maxWidth:
                                                                    "230px",
                                                            }}
                                                        >
                                                            {
                                                                expense.title
                                                            }
                                                        </div>

                                                        {expense.notes && (
                                                            <div
                                                                style={{
                                                                    maxWidth:
                                                                        "230px",
                                                                    marginTop:
                                                                        "4px",
                                                                    color:
                                                                        COLORS.textMuted,
                                                                    fontSize:
                                                                        "11px",
                                                                    lineHeight:
                                                                        1.35,
                                                                    overflow:
                                                                        "hidden",
                                                                    textOverflow:
                                                                        "ellipsis",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {
                                                                    expense.notes
                                                                }
                                                            </div>
                                                        )}

                                                    </div>

                                                </div>

                                            </td>


                                            {/* CATEGORY */}

                                            <td
                                                style={{
                                                    padding:
                                                        "16px",
                                                    borderBottom:
                                                        "1px solid rgba(148,163,184,.065)",
                                                }}
                                            >

                                                <span
                                                    style={{
                                                        display:
                                                            "inline-flex",
                                                        alignItems:
                                                            "center",
                                                        padding:
                                                            "6px 10px",
                                                        borderRadius:
                                                            "999px",
                                                        background:
                                                            "rgba(216,180,106,.065)",
                                                        border:
                                                            "1px solid rgba(216,180,106,.11)",
                                                        color:
                                                            COLORS.goldBright,
                                                        fontSize:
                                                            "11px",
                                                        lineHeight:
                                                            1.2,
                                                        fontWeight:
                                                            700,
                                                        whiteSpace:
                                                            "nowrap",
                                                    }}
                                                >
                                                    {expense.category ||
                                                        "Others"}
                                                </span>

                                            </td>


                                            {/* PAYMENT */}

                                            <td
                                                style={{
                                                    padding:
                                                        "16px",
                                                    color:
                                                        COLORS.textSecondary,
                                                    fontSize:
                                                        "12px",
                                                    fontWeight:
                                                        550,
                                                    whiteSpace:
                                                        "nowrap",
                                                    borderBottom:
                                                        "1px solid rgba(148,163,184,.065)",
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
                                                    }}
                                                >
                                                    <CreditCard
                                                        size={
                                                            14
                                                        }
                                                        color={
                                                            COLORS.textMuted
                                                        }
                                                    />

                                                    {expense.payment_method ||
                                                        "-"}
                                                </div>

                                            </td>


                                            {/* DATE */}

                                            <td
                                                style={{
                                                    padding:
                                                        "16px",
                                                    color:
                                                        COLORS.textSecondary,
                                                    fontSize:
                                                        "12px",
                                                    fontWeight:
                                                        550,
                                                    whiteSpace:
                                                        "nowrap",
                                                    borderBottom:
                                                        "1px solid rgba(148,163,184,.065)",
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
                                                    }}
                                                >

                                                    <CalendarDays
                                                        size={
                                                            14
                                                        }
                                                        color={
                                                            COLORS.textMuted
                                                        }
                                                    />

                                                    {formatDate(
                                                        expense.expense_date
                                                    )}

                                                </div>

                                            </td>


                                            {/* AMOUNT */}

                                            <td
                                                style={{
                                                    padding:
                                                        "16px",
                                                    textAlign:
                                                        "right",
                                                    color:
                                                        "#F0D79D",
                                                    fontSize:
                                                        "14px",
                                                    lineHeight:
                                                        1.2,
                                                    fontWeight:
                                                        800,
                                                    whiteSpace:
                                                        "nowrap",
                                                    borderBottom:
                                                        "1px solid rgba(148,163,184,.065)",
                                                }}
                                            >
                                                -
                                                {formatCurrency(
                                                    expense.amount
                                                )}
                                            </td>


                                            {/* ACTION */}

                                            <td
                                                style={{
                                                    padding:
                                                        "16px",
                                                    borderBottom:
                                                        "1px solid rgba(148,163,184,.065)",
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        gap:
                                                            "7px",
                                                    }}
                                                >

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEdit(
                                                                expense
                                                            )
                                                        }
                                                        title="Edit expense"
                                                        aria-label="Edit expense"
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
                                                                "1px solid rgba(216,180,106,.13)",
                                                            borderRadius:
                                                                "8px",
                                                            background:
                                                                "rgba(216,180,106,.035)",
                                                            color:
                                                                COLORS.goldBright,
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
                                                                expense.id
                                                            )
                                                        }
                                                        title="Delete expense"
                                                        aria-label="Delete expense"
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
                                                                "1px solid rgba(242,122,127,.13)",
                                                            borderRadius:
                                                                "8px",
                                                            background:
                                                                "rgba(242,122,127,.035)",
                                                            color:
                                                                COLORS.red,
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

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>
                    )}

                </div>

            </section>


            {deleteDialogOpen && (
                <div
                    role="presentation"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeDeleteDialog();
                        }
                    }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 2000,
                        display: "grid",
                        placeItems: "center",
                        padding: "24px",
                        background:
                            "rgba(3,7,12,.68)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="bb-delete-expense-title"
                        aria-describedby="bb-delete-expense-description"
                        style={{
                            width: "100%",
                            maxWidth: "430px",
                            padding: "25px",
                            boxSizing: "border-box",
                            border:
                                "1px solid rgba(148,163,184,.16)",
                            borderRadius: "18px",
                            background:
                                "linear-gradient(145deg,#111A25,#0D141D)",
                            boxShadow:
                                "0 24px 70px rgba(0,0,0,.42)",
                        }}
                    >
                        <div
                            style={{
                                width: "46px",
                                height: "46px",
                                display: "grid",
                                placeItems: "center",
                                marginBottom: "17px",
                                borderRadius: "13px",
                                color: COLORS.red,
                                background:
                                    "rgba(242,122,127,.09)",
                                border:
                                    "1px solid rgba(242,122,127,.16)",
                            }}
                        >
                            <Trash2 size={19} />
                        </div>

                        <h3
                            id="bb-delete-expense-title"
                            style={{
                                margin: 0,
                                color: COLORS.text,
                                fontSize: "18px",
                                lineHeight: 1.3,
                                fontWeight: 800,
                                letterSpacing: "-.25px",
                            }}
                        >
                            Delete this expense?
                        </h3>

                        <p
                            id="bb-delete-expense-description"
                            style={{
                                margin: "8px 0 0",
                                color: COLORS.textMuted,
                                fontSize: "12px",
                                lineHeight: 1.6,
                                fontWeight: 500,
                            }}
                        >
                            This transaction will be permanently
                            removed from your expense history.
                        </p>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "9px",
                                marginTop: "23px",
                                paddingTop: "17px",
                                borderTop:
                                    "1px solid rgba(148,163,184,.08)",
                            }}
                        >
                            <button
                                type="button"
                                onClick={closeDeleteDialog}
                                style={{
                                    height: "40px",
                                    padding: "0 16px",
                                    border:
                                        "1px solid rgba(148,163,184,.14)",
                                    borderRadius: "9px",
                                    background:
                                        "rgba(255,255,255,.025)",
                                    color:
                                        COLORS.textSecondary,
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmDelete}
                                style={{
                                    height: "40px",
                                    padding: "0 16px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "7px",
                                    border:
                                        "1px solid rgba(242,122,127,.24)",
                                    borderRadius: "9px",
                                    background:
                                        "linear-gradient(135deg,#D85F68,#B74750)",
                                    color: "#FFF5F5",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    fontSize: "12px",
                                    fontWeight: 800,
                                    boxShadow:
                                        "0 8px 22px rgba(242,122,127,.12)",
                                }}
                            >
                                <Trash2 size={14} />
                                Delete Expense
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =================================================
                RESPONSIVE STYLES
            ================================================= */}

            <style>
                {`
                    .bb-expenses-page input::placeholder,
                    .bb-expenses-page textarea::placeholder {
                        color: #667385;
                        opacity: 1;
                    }

                    .bb-expenses-page input:focus,
                    .bb-expenses-page textarea:focus,
                    .bb-expenses-page select:focus {
                        border-color: rgba(216,180,106,.42) !important;
                        box-shadow: 0 0 0 3px rgba(216,180,106,.07);
                    }

                    .bb-expenses-page select option {
                        background: #0D141D;
                        color: #F4F7FA;
                    }

                    .bb-expenses-page input[type="date"] {
                        color-scheme: dark;
                    }

                    .bb-expenses-page button {
                        font-family: inherit;
                    }

                    .bb-expenses-page button:focus-visible,
                    .bb-expenses-page input:focus-visible,
                    .bb-expenses-page textarea:focus-visible,
                    .bb-expenses-page select:focus-visible {
                        outline: 2px solid rgba(216,180,106,.55);
                        outline-offset: 2px;
                    }

                    @media (max-width: 1080px) {
                        .bb-expense-kpi-grid {
                            grid-template-columns:
                                repeat(2,minmax(0,1fr)) !important;
                        }
                    }

                    @media (max-width: 760px) {
                        .bb-expenses-page {
                            padding:
                                22px 18px 45px !important;
                        }

                        .bb-expense-hero {
                            min-height: auto !important;
                            padding:
                                25px 22px !important;
                        }

                        .bb-expense-hero > div {
                            align-items:
                                flex-start !important;
                            flex-direction:
                                column !important;
                        }

                        .bb-expense-form-grid {
                            grid-template-columns:
                                1fr !important;
                        }
                    }

                    @media (max-width: 600px) {
                        .bb-expense-kpi-grid {
                            grid-template-columns:
                                1fr !important;
                        }

                        .bb-expenses-page h1 {
                            font-size:
                                27px !important;
                        }

                        .bb-expense-hero button {
                            width: 100%;
                        }
                    }

                    @media (prefers-color-scheme: light) {
                        .bb-expenses-page .bb-expense-toast {
                            box-shadow: 0 16px 40px rgba(15,23,42,.16) !important;
                        }

                        .bb-expenses-page [role="dialog"] {
                            background:
                                linear-gradient(145deg,#FFFFFF,#F7F8FA) !important;
                            border-color:
                                rgba(15,23,42,.10) !important;
                            box-shadow:
                                0 24px 70px rgba(15,23,42,.18) !important;
                        }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .bb-expenses-page *,
                        .bb-expenses-page *::before,
                        .bb-expenses-page *::after {
                            scroll-behavior: auto !important;
                            transition: none !important;
                        }
                    }
                `}
            </style>

        </main>
    );
}