import { useEffect, useMemo, useRef, useState } from "react";

import {
    Wallet,
    Receipt,
    CircleDollarSign,
    BriefcaseBusiness,
    Search,
    Plus,
    Pencil,
    Trash2,
    X,
    CalendarDays,
    FileText,
    TrendingUp,
    Sparkles,
    ArrowUpRight,
    Landmark,
    Award,
    Banknote,
    Laptop,
    Gift,
    Building2,
    RefreshCw,
} from "lucide-react";

import {
    createIncome,
    getIncomes,
    updateIncome,
    deleteIncome,
} from "../services/incomeService";


/* =========================================================
   CONSTANTS
========================================================= */

const INCOME_SOURCES = [
    "Business",
    "Salary",
    "Freelancing",
    "Investments",
    "Bonus",
    "Rental",
    "Others",
];

const EMPTY_FORM = {
    title: "",
    amount: "",
    source: "",
    income_date: "",
    notes: "",
};

const SOURCE_COLORS = [
    "#00D9A6",
    "#9B6CFF",
    "#38BDF8",
    "#F5C451",
    "#F472B6",
    "#FF8A65",
];

const SOURCE_ICONS = {
    salary: Banknote,
    business: BriefcaseBusiness,
    freelancing: Laptop,
    investments: Landmark,
    gift: Gift,
    bonus: Award,
    rental: Building2,
    other: CircleDollarSign,
};


/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(value) {
    const amount = Number(value || 0);

    return `₹${amount.toLocaleString("en-IN", {
        maximumFractionDigits: 0,
    })}`;
}


function formatDate(date) {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}


function formatShortDate(date) {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
    });
}


function parseIncomeDate(date) {
    if (!date) return null;

    if (
        typeof date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
        const [year, month, day] =
            date.split("-").map(Number);

        return new Date(
            year,
            month - 1,
            day
        );
    }

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
        ? null
        : parsed;
}


function getMonthKey(date) {
    const parsed = parseIncomeDate(date);

    if (!parsed) return null;

    return `${parsed.getFullYear()}-${String(
        parsed.getMonth() + 1
    ).padStart(2, "0")}`;
}


function getSourceIcon(source) {
    const normalized = String(
        source || "Other"
    ).toLowerCase();

    const key = Object.keys(
        SOURCE_ICONS
    ).find((item) =>
        normalized.includes(item)
    );

    const Icon =
        SOURCE_ICONS[key || "other"];

    return Icon;
}


function getSourceColor(index) {
    return SOURCE_COLORS[
        index % SOURCE_COLORS.length
    ];
}


function getMonthLabel(date) {
    return date.toLocaleDateString(
        "en-IN",
        {
            month: "short",
        }
    );
}


function getRelativeTime(date) {
    const parsed = parseIncomeDate(date);

    if (!parsed) return "Date unavailable";

    const now = new Date();

    const diff =
        now.getTime() -
        parsed.getTime();

    const days = Math.floor(
        diff /
            (1000 * 60 * 60 * 24)
    );

    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";

    if (days < 30) {
        return `${days} days ago`;
    }

    if (days < 60) {
        return "1 month ago";
    }

    return `${Math.floor(
        days / 30
    )} months ago`;
}


function getCurrentMonthRange() {
    const now = new Date();

    return {
        year: now.getFullYear(),
        month: now.getMonth(),
    };
}


/* =========================================================
   FORM FIELD
========================================================= */

function Field({ label, children }) {
    return (
        <div className="bb-income-field">
            <label>{label}</label>
            {children}
        </div>
    );
}


/* =========================================================
   KPI
========================================================= */

function IncomeKPI({
    icon,
    label,
    value,
    description,
    accent,
}) {
    return (
        <article className="bb-income-kpi">
            <div
                className="bb-income-kpi-glow"
                style={{
                    background: accent,
                }}
            />

            <div className="bb-income-kpi-icon">
                {icon}
            </div>

            <span className="bb-income-kpi-label">
                {label}
            </span>

            <strong className="bb-income-kpi-value">
                {value}
            </strong>

            <span className="bb-income-kpi-description">
                {description}
            </span>
        </article>
    );
}


/* =========================================================
   INCOME TREND
========================================================= */

function IncomeTrendChart({ data }) {

    const max =
        Math.max(
            ...data.map(
                (item) => item.amount
            ),
            1
        );

    const width = 700;
    const height = 255;

    const left = 48;
    const right = 12;
    const top = 15;
    const bottom = 38;

    const chartWidth =
        width - left - right;

    const chartHeight =
        height - top - bottom;

    const points = data.map(
        (item, index) => {

            const x =
                data.length === 1
                    ? left +
                      chartWidth / 2
                    : left +
                      (
                          index /
                          (data.length - 1)
                      ) *
                          chartWidth;

            const y =
                top +
                chartHeight -
                (
                    item.amount /
                    max
                ) *
                    chartHeight;

            return {
                ...item,
                x,
                y,
            };
        }
    );

    const linePath = points
        .map(
            (point, index) =>
                `${index === 0 ? "M" : "L"} ${
                    point.x
                } ${point.y}`
        )
        .join(" ");

    const areaPath =
        points.length
            ? `${linePath}
               L ${points[points.length - 1].x}
                 ${height - bottom}
               L ${points[0].x}
                 ${height - bottom}
               Z`
            : "";

    return (
        <div className="bb-income-chart">

            <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                role="img"
                aria-label="Twelve month income trend"
            >

                <defs>

                    <linearGradient
                        id="incomeAreaGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="#00D9A6"
                            stopOpacity=".22"
                        />

                        <stop
                            offset="100%"
                            stopColor="#00D9A6"
                            stopOpacity="0"
                        />
                    </linearGradient>

                    <filter
                        id="incomeGlow"
                        x="-30%"
                        y="-30%"
                        width="160%"
                        height="160%"
                    >
                        <feGaussianBlur
                            stdDeviation="4"
                            result="blur"
                        />

                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                </defs>


                {[0, 1, 2, 3].map(
                    (line) => {

                        const y =
                            top +
                            (
                                chartHeight /
                                3
                            ) *
                                line;

                        return (
                            <line
                                key={line}
                                x1={left}
                                x2={
                                    width -
                                    right
                                }
                                y1={y}
                                y2={y}
                                stroke="rgba(148,163,184,.09)"
                                strokeDasharray="4 7"
                            />
                        );
                    }
                )}


                {[
                    max,
                    max * 0.66,
                    max * 0.33,
                    0,
                ].map(
                    (
                        value,
                        index
                    ) => {

                        const y =
                            top +
                            (
                                chartHeight /
                                3
                            ) *
                                index;

                        return (
                            <text
                                key={index}
                                x="8"
                                y={y + 4}
                                fill="#7D8B9D"
                                fontSize="10"
                                fontWeight="600"
                            >
                                {formatCurrency(
                                    value
                                )}
                            </text>
                        );
                    }
                )}


                {areaPath && (
                    <path
                        d={areaPath}
                        fill="url(#incomeAreaGradient)"
                    />
                )}


                {linePath && (
                    <path
                        d={linePath}
                        fill="none"
                        stroke="#00D9A6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#incomeGlow)"
                    />
                )}


                {points.map(
                    (point) => (
                        <g key={point.key}>

                            <circle
                                cx={point.x}
                                cy={point.y}
                                r="5"
                                fill="#0D1722"
                                stroke="#00D9A6"
                                strokeWidth="2"
                            />

                            <text
                                x={point.x}
                                y={
                                    height -
                                    10
                                }
                                textAnchor="middle"
                                fill="#8FA0B4"
                                fontSize="10"
                                fontWeight="650"
                            >
                                {point.label}
                            </text>

                        </g>
                    )
                )}

            </svg>

        </div>
    );
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Income() {

    const [incomes, setIncomes] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [formOpen, setFormOpen] =
        useState(false);

    const [editingIncome, setEditingIncome] =
        useState(null);

    const [formData, setFormData] =
        useState(EMPTY_FORM);

    const [search, setSearch] =
        useState("");

    const [selectedSource, setSelectedSource] =
        useState("All");

    const [selectedRange, setSelectedRange] =
        useState("all");

    const [refreshing, setRefreshing] =
        useState(false);

    const [toastMessage, setToastMessage] =
        useState("");

    const [toastType, setToastType] =
        useState("success");

    const [deleteDialogOpen, setDeleteDialogOpen] =
        useState(false);

    const [selectedIncome, setSelectedIncome] =
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

    const scrollToIncomeForm = () => {
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


    /* =========================================================
       FETCH
    ========================================================= */

    const loadIncomes = async () => {

        try {

            setError("");

            const response =
                await getIncomes();

            const incoming =
                Array.isArray(response?.data)
                    ? response.data
                    : [];

            setIncomes(incoming);

        } catch (err) {

            console.error(
                "Income loading error:",
                err
            );

            setError(
                "Unable to load your income data."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };


    useEffect(() => {
        loadIncomes();
    }, []);


    /* =========================================================
       CURRENT MONTH
    ========================================================= */

    const currentMonth =
        useMemo(
            () =>
                getCurrentMonthRange(),
            []
        );


    const currentMonthIncomes =
        useMemo(
            () =>
                incomes.filter(
                    (income) => {

                        const date =
                            parseIncomeDate(
                                income.income_date
                            );

                        if (!date) return false;

                        return (
                            date.getFullYear() ===
                                currentMonth.year &&
                            date.getMonth() ===
                                currentMonth.month
                        );
                    }
                ),
            [
                incomes,
                currentMonth,
            ]
        );


    /* =========================================================
       12-MONTH TREND
    ========================================================= */

    const trendData =
        useMemo(() => {

            const now = new Date();

            const months = [];

            /*
             * Rolling twelve-month window.
             *
             * The latest point is always the
             * current month and the earliest point
             * is eleven months before it.
             */

            for (
                let i = 11;
                i >= 0;
                i--
            ) {

                const date =
                    new Date(
                        now.getFullYear(),
                        now.getMonth() - i,
                        1
                    );

                const year =
                    date.getFullYear();

                const month =
                    date.getMonth();

                const amount =
                    incomes.reduce(
                        (
                            total,
                            income
                        ) => {

                            const incomeDate =
                                parseIncomeDate(
                                    income.income_date
                                );

                            if (
                                !incomeDate ||
                                incomeDate.getFullYear() !==
                                    year ||
                                incomeDate.getMonth() !==
                                    month
                            ) {
                                return total;
                            }

                            return (
                                total +
                                Number(
                                    income.amount ||
                                        0
                                )
                            );
                        },
                        0
                    );

                months.push({
                    key:
                        `${year}-${String(
                            month + 1
                        ).padStart(2, "0")}`,

                    year,
                    month,
                    amount,

                    label:
                        getMonthLabel(date),
                });
            }

            return months;

        }, [incomes]);


    /* =========================================================
       SIX-MONTH / YEAR TOTAL
    ========================================================= */

    const totalTracked =
        useMemo(
            () =>
                incomes.reduce(
                    (
                        total,
                        income
                    ) =>
                        total +
                        Number(
                            income.amount || 0
                        ),
                    0
                ),
            [incomes]
        );


    const currentMonthTotal =
        useMemo(
            () =>
                currentMonthIncomes.reduce(
                    (
                        total,
                        income
                    ) =>
                        total +
                        Number(
                            income.amount || 0
                        ),
                    0
                ),
            [currentMonthIncomes]
        );


    const previousMonthTotal =
        useMemo(() => {

            const date =
                new Date(
                    currentMonth.year,
                    currentMonth.month - 1,
                    1
                );

            return incomes.reduce(
                (
                    total,
                    income
                ) => {

                    const incomeDate =
                        parseIncomeDate(
                            income.income_date
                        );

                    if (!incomeDate) {
                        return total;
                    }

                    if (
                        incomeDate.getFullYear() ===
                            date.getFullYear() &&
                        incomeDate.getMonth() ===
                            date.getMonth()
                    ) {

                        return (
                            total +
                            Number(
                                income.amount || 0
                            )
                        );
                    }

                    return total;
                },
                0
            );

        }, [
            incomes,
            currentMonth,
        ]);


    const monthlyChange =
        previousMonthTotal > 0
            ? (
                  (
                      currentMonthTotal -
                      previousMonthTotal
                  ) /
                  previousMonthTotal
              ) *
              100
            : 0;


    /* =========================================================
       SOURCE BREAKDOWN
    ========================================================= */

    const sourceBreakdown =
        useMemo(() => {

            const map = {};

            currentMonthIncomes.forEach(
                (income) => {

                    const source =
                        income.source ||
                        "Others";

                    map[source] =
                        (
                            map[source] ||
                            0
                        ) +
                        Number(
                            income.amount ||
                                0
                        );
                }
            );

            const total =
                Object.values(map).reduce(
                    (
                        sum,
                        amount
                    ) =>
                        sum + amount,
                    0
                );

            return Object.entries(map)
                .map(
                    (
                        [
                            source,
                            amount,
                        ],
                        index
                    ) => ({
                        source,
                        amount,
                        percentage:
                            total > 0
                                ? (
                                      amount /
                                      total
                                  ) *
                                  100
                                : 0,
                        color:
                            getSourceColor(
                                index
                            ),
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

        }, [currentMonthIncomes]);


    /* =========================================================
       FILTER
    ========================================================= */

    const filteredIncomes =
        useMemo(() => {

            const normalizedSearch =
                search
                    .trim()
                    .toLowerCase();

            return incomes
                .filter(
                    (income) => {

                        if (
                            selectedSource !==
                                "All" &&
                            income.source !==
                                selectedSource
                        ) {
                            return false;
                        }

                        if (
                            !normalizedSearch
                        ) {
                            return true;
                        }

                        return [
                            income.title,
                            income.source,
                            income.notes,
                        ]
                            .filter(Boolean)
                            .some(
                                (value) =>
                                    String(
                                        value
                                    )
                                        .toLowerCase()
                                        .includes(
                                            normalizedSearch
                                        )
                            );
                    }
                )
                .sort(
                    (
                        a,
                        b
                    ) => {

                        const dateA =
                            parseIncomeDate(
                                a.income_date
                            );

                        const dateB =
                            parseIncomeDate(
                                b.income_date
                            );

                        return (
                            (dateB?.getTime() ||
                                0) -
                            (dateA?.getTime() ||
                                0)
                        );
                    }
                );

        }, [
            incomes,
            search,
            selectedSource,
        ]);


    /* =========================================================
       FORM
    ========================================================= */

    const openCreateForm = () => {

        setEditingIncome(null);

        setFormData({
            ...EMPTY_FORM,
            income_date:
                new Date()
                    .toISOString()
                    .split("T")[0],
        });

        setFormOpen(true);

        scrollToIncomeForm();
    };


    const openEditForm = (
        income
    ) => {

        setEditingIncome(income);

        setFormData({
            title:
                income.title || "",

            amount:
                income.amount || "",

            source:
                income.source || "",

            income_date:
                income.income_date || "",

            notes:
                income.notes || "",
        });

        setFormOpen(true);

        scrollToIncomeForm();
    };


    const closeForm = () => {

        if (saving) return;

        setFormOpen(false);
        setEditingIncome(null);
        setFormData(EMPTY_FORM);
    };


    const handleFormChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;

        setFormData(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );
    };


    /* =========================================================
       SAVE
    ========================================================= */

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        if (
            !formData.title.trim() ||
            !formData.amount ||
            !formData.source ||
            !formData.income_date
        ) {
            setError(
                "Please complete all required income fields."
            );

            return;
        }

        try {

            setSaving(true);
            setError("");

            if (editingIncome) {

                await updateIncome(
                    editingIncome.id,
                    formData
                );

            } else {

                await createIncome(
                    formData
                );
            }

            closeForm();

            showToast(
                editingIncome
                    ? "Income updated successfully."
                    : "Income added successfully.",
                "success"
            );

            await loadIncomes();

        } catch (err) {

            console.error(
                "Income save error:",
                err
            );

            setError(
                err.response?.data
                    ?.detail ||
                "Unable to save the income entry."
            );

        } finally {

            setSaving(false);

        }
    };


    /* =========================================================
       DELETE
    ========================================================= */

    const handleDelete = (income) => {
        setSelectedIncome(income);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedIncome(null);
    };

    const confirmDelete = async () => {
        if (!selectedIncome) {
            return;
        }

        try {
            setError("");

            await deleteIncome(
                selectedIncome.id
            );

            await loadIncomes();

            closeDeleteDialog();

            showToast(
                "Income deleted successfully.",
                "success"
            );

        } catch (err) {
            console.error(
                "Income delete error:",
                err
            );

            closeDeleteDialog();

            showToast(
                "Unable to delete this income entry.",
                "error"
            );
        }
    };


    /* =========================================================
       REFRESH
    ========================================================= */

    const handleRefresh = async () => {

        setRefreshing(true);

        await loadIncomes();
    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <main className="bb-income-page">

            <style>{`

                .bb-income-page {
                    min-height: 100%;
                    color: #F4F7FA;
                    background: #070B12;
                    font-family:
                        Inter,
                        "Segoe UI",
                        Roboto,
                        Helvetica,
                        Arial,
                        sans-serif;
                    font-size: 14px;
                    line-height: 1.55;
                    letter-spacing: 0;
                    -webkit-font-smoothing: antialiased;
                    text-rendering: optimizeLegibility;
                }

                .bb-income-page * {
                    box-sizing: border-box;
                }

                .bb-income-shell {
                    width: min(1220px, 100%);
                    margin: 0 auto;
                    padding: 32px 28px 60px;
                }

                .bb-income-header {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    gap: 24px;
                    margin-bottom: 28px;
                }

                .bb-income-eyebrow {
                    display: block;
                    margin-bottom: 8px;
                    color: #00D9A6;
                    font-size: 11px !important;
                    font-weight: 800 !important;
                    letter-spacing: 1.25px !important;
                    text-transform: uppercase;
                }

                .bb-income-header h1 {
                    margin: 0;
                    color: #F7F9FB;
                    font-size: 38px !important;
                    line-height: 1.08 !important;
                    font-weight: 800 !important;
                    letter-spacing: -1.5px !important;
                }

                .bb-income-header p {
                    margin: 8px 0 0;
                    color: #9AA8B8 !important;
                    font-size: 15px !important;
                    line-height: 1.55 !important;
                }

                .bb-income-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bb-income-add,
                .bb-income-refresh {
                    min-height: 42px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 0 16px;
                    border-radius: 10px;
                    font-family: inherit;
                    cursor: pointer;
                    transition:
                        transform .18s ease,
                        border-color .18s ease,
                        background .18s ease;
                }

                .bb-income-add {
                    border: 1px solid #00D9A6;
                    background: #00D9A6;
                    color: #03130F;
                    font-size: 13px !important;
                    font-weight: 800 !important;
                }

                .bb-income-refresh {
                    border: 1px solid rgba(148,163,184,.18);
                    background: rgba(255,255,255,.025);
                    color: #AAB7C7;
                    font-size: 13px !important;
                }

                .bb-income-add:hover,
                .bb-income-refresh:hover {
                    transform: translateY(-1px);
                }

                .bb-income-kpis {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 14px;
                    margin-bottom: 16px;
                }

                .bb-income-kpi {
                    position: relative;
                    overflow: hidden;
                    min-height: 160px;
                    padding: 20px;
                    border: 1px solid rgba(148,163,184,.13);
                    border-radius: 16px;
                    background: #0E151F;
                }

                .bb-income-kpi-glow {
                    position: absolute;
                    width: 120px;
                    height: 120px;
                    right: -70px;
                    top: -70px;
                    opacity: .08;
                    border-radius: 50%;
                    filter: blur(35px);
                }

                .bb-income-kpi-icon {
                    width: 38px;
                    height: 38px;
                    display: grid;
                    place-items: center;
                    margin-bottom: 16px;
                    border-radius: 10px;
                    background: rgba(0,217,166,.08);
                    color: #00D9A6;
                }

                .bb-income-kpi-label {
                    display: block;
                    color: #8EA0B5;
                    font-size: 11px !important;
                    font-weight: 800 !important;
                    letter-spacing: 1px !important;
                    text-transform: uppercase;
                }

                .bb-income-kpi-value {
                    display: block;
                    margin-top: 5px;
                    color: #F7F9FB;
                    font-size: 27px !important;
                    line-height: 1.15 !important;
                    font-weight: 800 !important;
                    letter-spacing: -.7px !important;
                }

                .bb-income-kpi-description {
                    display: block;
                    margin-top: 7px;
                    color: #7D8B9D !important;
                    font-size: 12px !important;
                    line-height: 1.45 !important;
                }

                .bb-income-main-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1.55fr) minmax(320px, .9fr);
                    gap: 16px;
                    margin-bottom: 16px;
                }

                .bb-income-card {
                    border: 1px solid rgba(148,163,184,.13);
                    border-radius: 16px;
                    background: #0E151F;
                    overflow: hidden;
                }

                .bb-income-card-header {
                    padding: 20px 22px 15px;
                }

                .bb-income-card-header span {
                    display: block;
                    color: #91A2B7;
                    font-size: 13px !important;
                    font-weight: 800 !important;
                    letter-spacing: 1px !important;
                    text-transform: uppercase;
                }

                .bb-income-card-header small {
                    display: block;
                    margin-top: 5px;
                    color: #718095;
                    font-size: 12px !important;
                    line-height: 1.45 !important;
                }

                .bb-income-chart {
                    width: 100%;
                    height: 300px;
                    padding: 0 18px 15px;
                }

                .bb-income-chart svg {
                    width: 100%;
                    height: 100%;
                    display: block;
                }

                .bb-income-source-list {
                    padding: 0 22px 16px;
                }

                .bb-source-row {
                    padding: 12px 0 !important;
                    border-bottom: 1px solid rgba(148,163,184,.07);
                }

                .bb-source-row:last-child {
                    border-bottom: 0;
                }

                .bb-source-name {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                }

                .bb-source-name strong {
                    color: #E8EDF2;
                    font-size: 14px !important;
                    font-weight: 700 !important;
                }

                .bb-source-value {
                    color: #A9B6C6;
                    font-size: 13px !important;
                    font-weight: 650 !important;
                }

                .bb-income-progress {
                    height: 8px !important;
                    margin-top: 8px;
                    overflow: hidden;
                    border-radius: 999px;
                    background: #1B2533;
                }

                .bb-income-progress > div {
                    height: 100%;
                    border-radius: inherit;
                    transition: width .45s ease;
                }

                .bb-recent-income-list {
                    padding: 0 22px 12px;
                }

                .bb-recent-income-row {
                    padding: 13px 0 !important;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-bottom: 1px solid rgba(148,163,184,.07);
                }

                .bb-recent-income-row:last-child {
                    border-bottom: 0;
                }

                .bb-recent-income-icon {
                    width: 38px;
                    height: 38px;
                    min-width: 38px;
                    display: grid;
                    place-items: center;
                    border-radius: 10px;
                    background: rgba(0,217,166,.08);
                    color: #00D9A6;
                }

                .bb-recent-income-copy {
                    min-width: 0;
                    flex: 1;
                }

                .bb-recent-income-copy strong {
                    display: block;
                    overflow: hidden;
                    color: #E9EEF3;
                    font-size: 14px !important;
                    line-height: 1.35 !important;
                    font-weight: 700 !important;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .bb-recent-income-copy span {
                    display: block;
                    margin-top: 2px;
                    color: #718095;
                    font-size: 12px !important;
                    line-height: 1.4 !important;
                }

                .bb-recent-income-amount {
                    color: #00D9A6;
                    font-size: 14px !important;
                    font-weight: 800 !important;
                    white-space: nowrap;
                }

                .bb-income-insight {
                    display: flex;
                    gap: 12px;
                    margin-top: 16px;
                    padding: 16px 18px;
                    border: 1px solid rgba(0,217,166,.12);
                    border-radius: 14px;
                    background: rgba(0,217,166,.035);
                }

                .bb-income-insight-icon {
                    color: #00D9A6;
                    flex-shrink: 0;
                }

                .bb-income-insight strong {
                    display: block;
                    color: #DDE6EE;
                    font-size: 14px !important;
                    line-height: 1.45 !important;
                }

                .bb-income-insight p {
                    margin: 4px 0 0;
                    color: #8190A3;
                    font-size: 12px !important;
                    line-height: 1.6 !important;
                }

                .bb-income-mini-stats {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    padding: 0 22px 22px;
                }

                .bb-income-mini-stat {
                    padding: 13px;
                    border: 1px solid rgba(148,163,184,.1);
                    border-radius: 11px;
                    background: rgba(255,255,255,.015);
                }

                .bb-income-mini-stats span {
                    display: block;
                    color: #718095;
                    font-size: 11px !important;
                }

                .bb-income-mini-stats strong {
                    display: block;
                    margin-top: 4px;
                    color: #EAF0F5;
                    font-size: 15px !important;
                }

                .bb-income-form {
                    margin-bottom: 16px;
                }

                .bb-income-form-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                    padding: 20px 22px;
                    border-bottom: 1px solid rgba(148,163,184,.08);
                }

                .bb-income-form-header h2 {
                    margin: 0;
                    color: #EAF0F5;
                    font-size: 17px !important;
                    font-weight: 750 !important;
                }

                .bb-income-form-header p {
                    margin: 4px 0 0;
                    color: #75859A;
                    font-size: 12px !important;
                    line-height: 1.5 !important;
                }

                .bb-income-close {
                    width: 34px;
                    height: 34px;
                    display: grid;
                    place-items: center;
                    border: 1px solid rgba(148,163,184,.12);
                    border-radius: 9px;
                    background: transparent;
                    color: #8190A3;
                    cursor: pointer;
                }

                .bb-income-form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 18px;
                    padding: 22px;
                }

                .bb-income-field {
                    min-width: 0;
                }

                .bb-income-field.full {
                    grid-column: 1 / -1;
                }

                .bb-income-field label {
                    display: block;
                    margin-bottom: 7px;
                    color: #AAB7C7;
                    font-size: 11px !important;
                    font-weight: 800 !important;
                    letter-spacing: .65px !important;
                    text-transform: uppercase;
                }

                .bb-income-field input,
                .bb-income-field select,
                .bb-income-field textarea {
                    width: 100%;
                    border: 1px solid rgba(148,163,184,.14);
                    outline: none;
                    border-radius: 10px;
                    background: #09111C;
                    color: #EAF0F5;
                    font-family: inherit;
                    font-size: 13px !important;
                    line-height: 1.5 !important;
                    transition: border-color .18s ease, box-shadow .18s ease;
                }

                .bb-income-field input,
                .bb-income-field select {
                    height: 46px !important;
                    padding: 0 13px;
                }

                .bb-income-field textarea {
                    min-height: 92px !important;
                    padding: 12px 13px;
                    resize: vertical;
                }

                .bb-income-field input:focus,
                .bb-income-field select:focus,
                .bb-income-field textarea:focus {
                    border-color: rgba(0,217,166,.55);
                    box-shadow: 0 0 0 3px rgba(0,217,166,.07);
                }

                .bb-income-form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    padding: 0 22px 22px;
                }

                .bb-income-cancel,
                .bb-income-save {
                    min-height: 42px;
                    padding: 0 16px;
                    border-radius: 9px;
                    font-family: inherit;
                    cursor: pointer;
                    font-size: 12px !important;
                    font-weight: 800 !important;
                }

                .bb-income-cancel {
                    border: 1px solid rgba(148,163,184,.14);
                    background: transparent;
                    color: #AAB7C7;
                }

                .bb-income-save {
                    border: 1px solid #00D9A6;
                    background: #00D9A6;
                    color: #03130F;
                }

                .bb-income-history {
                    overflow: hidden;
                    border: 1px solid rgba(148,163,184,.13);
                    border-radius: 16px;
                    background: #0E151F;
                }

                .bb-income-history-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 18px;
                    padding: 20px 22px;
                    border-bottom: 1px solid rgba(148,163,184,.08);
                }

                .bb-income-history-header h2 {
                    margin: 0;
                    color: #F0F4F8;
                    font-size: 23px !important;
                    font-weight: 750 !important;
                    letter-spacing: -.5px !important;
                }

                .bb-income-history-header p {
                    margin: 4px 0 0;
                    color: #718095;
                    font-size: 12px;
                }

                .bb-income-search {
                    position: relative;
                    width: min(280px, 100%);
                }

                .bb-income-search svg {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #64748B;
                }

                .bb-income-search input {
                    width: 100%;
                    height: 40px;
                    padding: 0 12px 0 38px;
                    border: 1px solid rgba(148,163,184,.14);
                    border-radius: 9px;
                    outline: none;
                    background: #09111C;
                    color: #EAF0F5;
                    font-family: inherit;
                    font-size: 13px !important;
                }

                .bb-income-filters {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    flex-wrap: wrap;
                    padding: 13px 22px;
                    border-bottom: 1px solid rgba(148,163,184,.07);
                }

                .bb-income-filters > span {
                    margin-right: 5px;
                    color: #65758A;
                    font-size: 11px !important;
                }

                .bb-income-filters button {
                    min-height: 30px;
                    padding: 0 10px;
                    border: 1px solid rgba(148,163,184,.12);
                    border-radius: 7px;
                    background: transparent;
                    color: #8797AA;
                    font-family: inherit;
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    cursor: pointer;
                }

                .bb-income-filters button.active {
                    border-color: rgba(0,217,166,.3);
                    background: rgba(0,217,166,.08);
                    color: #00D9A6;
                }

                .bb-income-table-wrapper {
                    width: 100%;
                    overflow-x: auto;
                }

                .bb-income-table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 720px;
                }

                .bb-income-table-wrapper th {
                    padding: 13px 18px;
                    border-bottom: 1px solid rgba(148,163,184,.08);
                    color: #718095;
                    text-align: left;
                    font-size: 11px !important;
                    font-weight: 800 !important;
                    letter-spacing: .75px !important;
                    text-transform: uppercase;
                }

                .bb-income-table-wrapper td {
                    padding: 15px 18px;
                    border-bottom: 1px solid rgba(148,163,184,.06);
                    color: #C8D2DD;
                    font-size: 13px !important;
                    line-height: 1.45 !important;
                }

                .bb-income-table-wrapper tr:last-child td {
                    border-bottom: 0;
                }

                .bb-income-table-name strong {
                    display: block;
                    color: #EAF0F5;
                    font-size: 13px !important;
                    line-height: 1.35 !important;
                }

                .bb-income-table-name span {
                    display: block;
                    margin-top: 3px;
                    color: #718095;
                    font-size: 11px !important;
                    line-height: 1.4 !important;
                }

                .bb-income-source-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 5px 8px;
                    border-radius: 999px;
                    background: rgba(0,217,166,.07);
                    color: #A9B8C8;
                    font-size: 11px !important;
                    font-weight: 700 !important;
                }

                .bb-income-date {
                    color: #8797AA;
                    font-size: 12px !important;
                }

                .bb-income-table-amount {
                    color: #00D9A6;
                    font-size: 14px !important;
                    font-weight: 800 !important;
                    white-space: nowrap;
                }

                .bb-income-table-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 6px;
                }

                .bb-income-table-action {
                    width: 32px;
                    height: 32px;
                    display: grid;
                    place-items: center;
                    border: 1px solid rgba(148,163,184,.11);
                    border-radius: 8px;
                    background: transparent;
                    color: #718095;
                    cursor: pointer;
                }

                .bb-income-table-action:hover {
                    color: #EAF0F5;
                    border-color: rgba(148,163,184,.25);
                }

                .bb-income-table-action.delete:hover {
                    color: #FB7185;
                    border-color: rgba(251,113,133,.25);
                }

                .bb-income-empty,
                .bb-income-table-state {
                    padding: 42px 22px;
                    text-align: center;
                }

                .bb-income-empty strong,
                .bb-income-table-state strong {
                    display: block;
                    color: #DDE6EE;
                    font-size: 15px !important;
                }

                .bb-income-empty span,
                .bb-income-table-state span {
                    display: block;
                    margin-top: 5px;
                    color: #718095;
                    font-size: 12px !important;
                    line-height: 1.55 !important;
                }

                .bb-income-error {
                    margin-bottom: 16px;
                    padding: 12px 14px;
                    border: 1px solid rgba(248,113,113,.18);
                    border-radius: 10px;
                    background: rgba(127,29,29,.14);
                    color: #FDA4AF;
                    font-size: 12px;
                }

                .bb-income-page button:focus-visible,
                .bb-income-page input:focus-visible,
                .bb-income-page select:focus-visible,
                .bb-income-page textarea:focus-visible {
                    outline: 2px solid rgba(0,217,166,.55);
                    outline-offset: 2px;
                }

                @media (max-width: 980px) {
                    .bb-income-kpis {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .bb-income-main-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 720px) {
                    .bb-income-shell {
                        padding: 24px 16px 45px;
                    }

                    .bb-income-header {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .bb-income-header h1 {
                        font-size: 32px !important;
                    }

                    .bb-income-header p {
                        font-size: 14px !important;
                    }

                    .bb-income-kpis {
                        grid-template-columns: 1fr;
                    }

                    .bb-income-kpi-value {
                        font-size: 24px !important;
                    }

                    .bb-income-form-grid {
                        grid-template-columns: 1fr;
                    }

                    .bb-income-field.full {
                        grid-column: auto;
                    }

                    .bb-income-history-header {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .bb-income-search {
                        width: 100%;
                    }

                    .bb-income-chart {
                        height: 260px;
                        padding-left: 10px;
                        padding-right: 10px;
                    }

                    .bb-income-chart text {
                        font-size: 9px;
                    }
                }

                @media (max-width: 480px) {
                    .bb-income-header-actions {
                        width: 100%;
                    }

                    .bb-income-add,
                    .bb-income-refresh {
                        flex: 1;
                    }

                    .bb-income-form-actions {
                        flex-direction: column;
                    }

                    .bb-income-cancel,
                    .bb-income-save {
                        width: 100%;
                    }

                    .bb-income-chart {
                        height: 235px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .bb-income-page *,
                    .bb-income-page *::before,
                    .bb-income-page *::after {
                        animation: none !important;
                        transition: none !important;
                    }
                }

            `}</style>


            <div className="bb-income-shell">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="bb-income-header">

                    <div>
                        <span className="bb-income-eyebrow">
                            INCOME
                        </span>

                        <h1>
                            Income
                        </h1>

                        <p>
                            Where your money comes from.
                        </p>
                    </div>


                    <div className="bb-income-header-actions">

                        <button
                            type="button"
                            className="bb-income-refresh"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            aria-label="Refresh income data"
                        >
                            <RefreshCw
                                size={15}
                                className={
                                    refreshing
                                        ? "bb-income-refresh-spin"
                                        : ""
                                }
                            />

                            Refresh
                        </button>

                        <button
                            type="button"
                            className="bb-income-add"
                            onClick={openCreateForm}
                        >
                            <Plus size={17} />
                            Add income
                        </button>

                    </div>

                </header>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div
                        className="bb-income-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}


                {/* =================================================
                    KPIs
                ================================================= */}

                <section className="bb-income-kpis">

                    <IncomeKPI
                        icon={<CircleDollarSign size={19} />}
                        label="This month"
                        value={formatCurrency(
                            currentMonthTotal
                        )}
                        description={
                            monthlyChange > 0
                                ? `↑ ${Math.round(
                                      monthlyChange
                                  )}% vs last month`
                                : monthlyChange < 0
                                ? `↓ ${Math.abs(
                                      Math.round(
                                          monthlyChange
                                      )
                                  )}% vs last month`
                                : "Same as last month"
                        }
                        accent="#00D9A6"
                    />

                    <IncomeKPI
                        icon={<Receipt size={19} />}
                        label="Total tracked"
                        value={formatCurrency(
                            totalTracked
                        )}
                        description={`${incomes.length} income ${
                            incomes.length === 1
                                ? "entry"
                                : "entries"
                        }`}
                        accent="#9B6CFF"
                    />

                    <IncomeKPI
                        icon={<TrendingUp size={19} />}
                        label="Average monthly"
                        value={formatCurrency(
                            trendData.reduce(
                                (
                                    total,
                                    item
                                ) =>
                                    total +
                                    item.amount,
                                0
                            ) / 12
                        )}
                        description="Across the last 12 months"
                        accent="#38BDF8"
                    />

                    <IncomeKPI
                        icon={<Wallet size={19} />}
                        label="Top source"
                        value={
                            sourceBreakdown[0]
                                ?.source ||
                            "—"
                        }
                        description={
                            sourceBreakdown[0]
                                ? formatCurrency(
                                      sourceBreakdown[0]
                                          .amount
                                  )
                                : "No income this month"
                        }
                        accent="#F5C451"
                    />

                </section>


                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <section className="bb-income-main-grid">

                    {/* TREND */}

                    <article className="bb-income-card">

                        <div className="bb-income-card-header">

                            <span>
                                MONTHLY INCOME TREND
                            </span>

                            <small>
                                Your income movement over the last twelve months.
                            </small>

                        </div>

                        <IncomeTrendChart
                            data={trendData}
                        />

                    </article>


                    {/* SOURCE BREAKDOWN */}

                    <article className="bb-income-card">

                        <div className="bb-income-card-header">

                            <span>
                                WHERE YOUR MONEY COMES FROM
                            </span>

                            <small>
                                This month's income by source.
                            </small>

                        </div>


                        {sourceBreakdown.length === 0 ? (

                            <div className="bb-income-empty">

                                <CircleDollarSign
                                    size={28}
                                    color="#00D9A6"
                                />

                                <strong>
                                    No income recorded yet
                                </strong>

                                <span>
                                    Add your first income source
                                    to see the breakdown.
                                </span>

                            </div>

                        ) : (

                            <div className="bb-income-source-list">

                                {sourceBreakdown.map(
                                    (
                                        item
                                    ) => {

                                        const Icon =
                                            getSourceIcon(
                                                item.source
                                            );

                                        return (
                                            <div
                                                className="bb-source-row"
                                                key={
                                                    item.source
                                                }
                                            >

                                                <div className="bb-source-name">

                                                    <strong>
                                                        {item.source}
                                                    </strong>

                                                    <span className="bb-source-value">
                                                        {formatCurrency(
                                                            item.amount
                                                        )}
                                                        {" · "}
                                                        {Math.round(
                                                            item.percentage
                                                        )}
                                                        %
                                                    </span>

                                                </div>

                                                <div className="bb-income-progress">

                                                    <div
                                                        style={{
                                                            width:
                                                                `${item.percentage}%`,
                                                            background:
                                                                item.color,
                                                        }}
                                                    />

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>
                        )}

                    </article>

                </section>


                {/* =================================================
                    RECENT INCOME
                ================================================= */}

                <section className="bb-income-card">

                    <div className="bb-income-card-header">

                        <span>
                            RECENT INCOME
                        </span>

                        <small>
                            Your latest recorded income.
                        </small>

                    </div>


                    {loading ? (

                        <div className="bb-income-table-state">

                            <strong>
                                Loading income...
                            </strong>

                            <span>
                                Fetching your latest financial activity.
                            </span>

                        </div>

                    ) : filteredIncomes.length === 0 ? (

                        <div className="bb-income-table-state">

                            <strong>
                                No matching income
                            </strong>

                            <span>
                                Try changing your search or filters.
                            </span>

                        </div>

                    ) : (

                        <div className="bb-recent-income-list">

                            {filteredIncomes
                                .slice(0, 6)
                                .map(
                                    (
                                        income
                                    ) => {

                                        const Icon =
                                            getSourceIcon(
                                                income.source
                                            );

                                        return (
                                            <div
                                                className="bb-recent-income-row"
                                                key={
                                                    income.id
                                                }
                                            >

                                                <div className="bb-recent-income-icon">

                                                    <Icon
                                                        size={17}
                                                    />

                                                </div>


                                                <div className="bb-recent-income-copy">

                                                    <strong>
                                                        {
                                                            income.title
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            income.source
                                                        }
                                                        {" · "}
                                                        {getRelativeTime(
                                                            income.income_date
                                                        )}
                                                    </span>

                                                </div>


                                                <span className="bb-recent-income-amount">
                                                    +
                                                    {formatCurrency(
                                                        income.amount
                                                    )}
                                                </span>

                                            </div>
                                        );
                                    }
                                )}

                        </div>
                    )}

                </section>


                {/* =================================================
                    INSIGHT
                ================================================= */}

                <div className="bb-income-insight">

                    <Sparkles
                        size={18}
                        className="bb-income-insight-icon"
                    />

                    <div>

                        <strong>
                            Keep your income history complete.
                        </strong>

                        <p>
                            Consistent income tracking makes
                            your twelve-month financial trends
                            more meaningful and improves the
                            accuracy of BudgetBuddy's insights.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    FORM
                ================================================= */}

                {formOpen && (

                    <section
                        ref={formSectionRef}
                        className="bb-income-card bb-income-form"
                        style={{ scrollMarginTop: "24px" }}
                    >

                        <div className="bb-income-form-header">

                            <div>

                                <h2>
                                    {editingIncome
                                        ? "Edit income"
                                        : "Add income"}
                                </h2>

                                <p>
                                    Keep your financial records
                                    accurate and up to date.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="bb-income-close"
                                onClick={closeForm}
                                aria-label="Close income form"
                            >
                                <X size={17} />
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="bb-income-form-grid">

                                <Field label="Title">

                                    <input
                                        ref={titleInputRef}
                                        name="title"
                                        type="text"
                                        value={
                                            formData.title
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="e.g. Monthly salary"
                                        required
                                    />

                                </Field>


                                <Field label="Amount">

                                    <input
                                        name="amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            formData.amount
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="₹ 0"
                                        required
                                    />

                                </Field>


                                <Field label="Source">

                                    <select
                                        name="source"
                                        value={
                                            formData.source
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select source
                                        </option>

                                        {INCOME_SOURCES.map(
                                            (
                                                source
                                            ) => (
                                                <option
                                                    key={
                                                        source
                                                    }
                                                    value={
                                                        source
                                                    }
                                                >
                                                    {source}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </Field>


                                <Field label="Date">

                                    <input
                                        name="income_date"
                                        type="date"
                                        value={
                                            formData.income_date
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    />

                                </Field>


                                <div className="bb-income-field full">

                                    <label>
                                        Notes
                                    </label>

                                    <textarea
                                        name="notes"
                                        value={
                                            formData.notes
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Add any useful details..."
                                    />

                                </div>

                            </div>


                            <div className="bb-income-form-actions">

                                <button
                                    type="button"
                                    className="bb-income-cancel"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="bb-income-save"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingIncome
                                        ? "Update income"
                                        : "Save income"}
                                </button>

                            </div>

                        </form>

                    </section>
                )}


                {/* =================================================
                    FULL HISTORY
                ================================================= */}

                <section className="bb-income-history">

                    <div className="bb-income-history-header">

                        <div>

                            <h2>
                                Income history
                            </h2>

                            <p>
                                Search and manage your recorded income.
                            </p>

                        </div>


                        <div className="bb-income-search">

                            <Search size={16} />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search income..."
                                aria-label="Search income"
                            />

                        </div>

                    </div>


                    <div className="bb-income-filters">

                        <span>
                            Source:
                        </span>

                        {[
                            "All",
                            ...INCOME_SOURCES,
                        ].map(
                            (
                                source
                            ) => (
                                <button
                                    type="button"
                                    key={
                                        source
                                    }
                                    className={
                                        selectedSource ===
                                        source
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setSelectedSource(
                                            source
                                        )
                                    }
                                >
                                    {source}
                                </button>
                            )
                        )}

                    </div>


                    {loading ? (

                        <div className="bb-income-table-state">

                            <strong>
                                Loading income history...
                            </strong>

                            <span>
                                Please wait while your records are retrieved.
                            </span>

                        </div>

                    ) : filteredIncomes.length === 0 ? (

                        <div className="bb-income-table-state">

                            <strong>
                                No income records found
                            </strong>

                            <span>
                                Your matching income entries will appear here.
                            </span>

                        </div>

                    ) : (

                        <div className="bb-income-table-wrapper">

                            <table className="bb-income-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Income
                                        </th>

                                        <th>
                                            Source
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Amount
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredIncomes.map(
                                        (
                                            income
                                        ) => {

                                            const Icon =
                                                getSourceIcon(
                                                    income.source
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        income.id
                                                    }
                                                >

                                                    <td>

                                                        <div className="bb-income-table-name">

                                                            <strong>
                                                                {
                                                                    income.title
                                                                }
                                                            </strong>

                                                            {income.notes && (
                                                                <span>
                                                                    {
                                                                        income.notes
                                                                    }
                                                                </span>
                                                            )}

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span className="bb-income-source-pill">

                                                            <Icon
                                                                size={13}
                                                            />

                                                            {
                                                                income.source
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span className="bb-income-date">

                                                            {formatDate(
                                                                income.income_date
                                                            )}

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span className="bb-income-table-amount">

                                                            +
                                                            {formatCurrency(
                                                                income.amount
                                                            )}

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <div className="bb-income-table-actions">

                                                            <button
                                                                type="button"
                                                                className="bb-income-table-action"
                                                                onClick={() =>
                                                                    openEditForm(
                                                                        income
                                                                    )
                                                                }
                                                                aria-label={`Edit ${income.title}`}
                                                            >
                                                                <Pencil
                                                                    size={14}
                                                                />
                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="bb-income-table-action delete"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        income
                                                                    )
                                                                }
                                                                aria-label={`Delete ${income.title}`}
                                                            >
                                                                <Trash2
                                                                    size={14}
                                                                />
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </section>

            </div>

            {toastMessage && (
                <div
                    role="status"
                    aria-live="polite"
                    className="bb-income-toast"
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
                                : "1px solid rgba(0,217,166,.28)",
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
                            color: "#FFFFFF",
                            fontSize: "13px",
                            fontWeight: 900,
                        }}
                    >
                        {toastType === "error" ? "!" : "✓"}
                    </span>

                    <span>
                        {toastMessage}
                    </span>
                </div>
            )}

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
                        aria-labelledby="bb-delete-income-title"
                        aria-describedby="bb-delete-income-description"
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
                                color: "#F27A7F",
                                background:
                                    "rgba(242,122,127,.09)",
                                border:
                                    "1px solid rgba(242,122,127,.16)",
                            }}
                        >
                            <Trash2 size={19} />
                        </div>

                        <h3
                            id="bb-delete-income-title"
                            style={{
                                margin: 0,
                                color: "#F4F7FA",
                                fontSize: "18px",
                                lineHeight: 1.3,
                                fontWeight: 800,
                                letterSpacing: "-.25px",
                            }}
                        >
                            Delete this income?
                        </h3>

                        <p
                            id="bb-delete-income-description"
                            style={{
                                margin: "8px 0 0",
                                color: "#7D8B9D",
                                fontSize: "12px",
                                lineHeight: 1.6,
                                fontWeight: 500,
                            }}
                        >
                            {selectedIncome?.title
                                ? `"${selectedIncome.title}" will be permanently removed from your income history.`
                                : "This income entry will be permanently removed from your income history."}
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
                                    color: "#AAB7C7",
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
                                Delete Income
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .bb-income-refresh-spin {
                    animation: bb-income-spin .8s linear infinite;
                }

                @keyframes bb-income-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @media (prefers-color-scheme: light) {
                    .bb-income-page {
                        color: #172033;
                        background: #F5F7FA;
                    }

                    .bb-income-page .bb-income-toast {
                        box-shadow: 0 16px 40px rgba(15,23,42,.16) !important;
                    }

                    .bb-income-page [role="dialog"] {
                        background:
                            linear-gradient(145deg,#FFFFFF,#F7F8FA) !important;
                        border-color:
                            rgba(15,23,42,.10) !important;
                        box-shadow:
                            0 24px 70px rgba(15,23,42,.18) !important;
                    }
                }
            `}</style>

        </main>
    );
}