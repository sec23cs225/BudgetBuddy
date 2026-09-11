import { useEffect, useMemo, useRef, useState } from "react";

import {
    PiggyBank,
    Target,
    CalendarDays,
    Plus,
    Pencil,
    Trash2,
    X,
    Search,
    CheckCircle2,
    Clock3,
    AlertCircle,
    CircleDollarSign,
    Trophy,
    Sparkles,
    ArrowUpRight,
    WalletCards,
    Laptop,
    Plane,
    ShieldCheck,
    Gift,
    PartyPopper,
    Coins,
    TrendingUp,
    ChevronRight,
} from "lucide-react";

import {
    createSavingsGoal,
    getSavingsGoals,
    updateSavingsGoal,
    deleteSavingsGoal,
} from "../services/savingsService";


/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_FORM = {
    goal_name: "",
    target_amount: "",
    saved_amount: "",
    target_date: "",
};

const MILESTONES = [25, 50, 75, 100];


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
    if (!date) {
        return "No target date";
    }

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


const getProgress = (saved, target) => {
    const savedAmount = Number(saved || 0);
    const targetAmount = Number(target || 0);

    if (targetAmount <= 0) {
        return 0;
    }

    return Math.min(
        Math.max((savedAmount / targetAmount) * 100, 0),
        100
    );
};


const getNextMilestone = (progress) => {
    return (
        MILESTONES.find(
            (milestone) => progress < milestone
        ) || null
    );
};


const getCrossedMilestone = (
    previousProgress,
    currentProgress
) => {
    const crossed = MILESTONES.filter(
        (milestone) =>
            previousProgress < milestone &&
            currentProgress >= milestone
    );

    return crossed.length
        ? crossed[crossed.length - 1]
        : null;
};


const getGoalIcon = (name = "") => {
    const value = name.toLowerCase();

    if (
        value.includes("laptop") ||
        value.includes("computer") ||
        value.includes("phone") ||
        value.includes("mobile")
    ) {
        return <Laptop size={21} />;
    }

    if (
        value.includes("trip") ||
        value.includes("travel") ||
        value.includes("vacation") ||
        value.includes("japan")
    ) {
        return <Plane size={21} />;
    }

    if (
        value.includes("emergency") ||
        value.includes("medical") ||
        value.includes("health")
    ) {
        return <ShieldCheck size={21} />;
    }

    if (
        value.includes("gift") ||
        value.includes("birthday")
    ) {
        return <Gift size={21} />;
    }

    return <Target size={21} />;
};


/* =========================================================
   GOAL STATUS
========================================================= */

const getGoalStatus = (goal) => {
    const target = Number(goal.target_amount || 0);
    const saved = Number(goal.saved_amount || 0);

    const progress = getProgress(saved, target);

    const backendStatus =
        String(goal.status || "").toLowerCase();

    if (
        backendStatus === "completed" ||
        progress >= 100
    ) {
        return {
            label: "Completed",
            color: "#35E0A5",
            background: "rgba(53,224,165,.09)",
            border: "rgba(53,224,165,.22)",
            icon: <CheckCircle2 size={13} />,
        };
    }

    if (
        goal.target_date &&
        new Date(goal.target_date) < new Date()
    ) {
        return {
            label: "Target passed",
            color: "#FF747C",
            background: "rgba(255,116,124,.08)",
            border: "rgba(255,116,124,.20)",
            icon: <AlertCircle size={13} />,
        };
    }

    return {
        label: "In progress",
        color: "#B9A0FF",
        background: "rgba(185,160,255,.08)",
        border: "rgba(185,160,255,.20)",
        icon: <Clock3 size={13} />,
    };
};


/* =========================================================
   TOAST
========================================================= */

function Toast({
    toast,
    onClose,
}) {
    if (!toast) {
        return null;
    }

    return (
        <div
            style={{
                position: "fixed",
                top: "88px",
                right: "26px",
                zIndex: 3000,
                minWidth: "310px",
                maxWidth: "390px",
                padding: "15px 17px",
                borderRadius: "14px",
                background:
                    "linear-gradient(145deg,#0E211D,#081713)",
                border:
                    "1px solid rgba(53,224,165,.28)",
                boxShadow:
                    "0 20px 55px rgba(0,0,0,.45)",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                animation:
                    "bbToastIn .28s ease-out",
            }}
        >
            <div
                style={{
                    width: "32px",
                    height: "32px",
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "9px",
                    background:
                        "rgba(53,224,165,.12)",
                    color: "#35E0A5",
                }}
            >
                <CheckCircle2 size={17} />
            </div>

            <div
                style={{
                    flex: 1,
                }}
            >
                <div
                    style={{
                        color: "#F7FAF8",
                        fontSize: "14px",
                        fontWeight: 750,
                        lineHeight: 1.3,
                    }}
                >
                    {toast.title}
                </div>

                {toast.message && (
                    <div
                        style={{
                            marginTop: "4px",
                            color: "#91A39D",
                            fontSize: "12px",
                            lineHeight: 1.45,
                        }}
                    >
                        {toast.message}
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={onClose}
                style={{
                    border: 0,
                    background: "transparent",
                    color: "#71827D",
                    cursor: "pointer",
                    padding: "2px",
                }}
            >
                <X size={15} />
            </button>
        </div>
    );
}


/* =========================================================
   MILESTONE CELEBRATION
========================================================= */

function MilestoneModal({
    milestone,
    goal,
    onClose,
}) {
    if (!milestone || !goal) {
        return null;
    }

    const isComplete = milestone >= 100;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 2500,
                display: "grid",
                placeItems: "center",
                padding: "24px",
                background:
                    "rgba(2,6,12,.78)",
                backdropFilter:
                    "blur(13px)",
            }}
        >
            <div
                className="bb-milestone-card"
                style={{
                    position: "relative",
                    width: "min(440px,100%)",
                    overflow: "hidden",
                    padding: "34px 32px 30px",
                    borderRadius: "24px",
                    textAlign: "center",
                    background:
                        "linear-gradient(145deg,#111A20 0%,#0C1319 65%,#101B18 100%)",
                    border:
                        "1px solid rgba(53,224,165,.34)",
                    boxShadow:
                        "0 35px 100px rgba(0,0,0,.60), 0 0 70px rgba(53,224,165,.10)",
                }}
            >
                {/* CONFETTI */}

                {Array.from({
                    length: 18,
                }).map((_, index) => (
                    <span
                        key={index}
                        className="bb-confetti"
                        style={{
                            left: `${8 + ((index * 17) % 84)}%`,
                            top: `${5 + ((index * 13) % 45)}%`,
                            animationDelay:
                                `${(index % 6) * .12}s`,
                            transform:
                                `rotate(${index * 31}deg)`,
                        }}
                    />
                ))}

                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        width: "32px",
                        height: "32px",
                        display: "grid",
                        placeItems: "center",
                        border: 0,
                        borderRadius: "9px",
                        background:
                            "rgba(255,255,255,.04)",
                        color: "#8B9895",
                        cursor: "pointer",
                    }}
                >
                    <X size={17} />
                </button>

                <div
                    style={{
                        position: "relative",
                        width: "68px",
                        height: "68px",
                        margin: "0 auto 18px",
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "18px",
                        color: "#35E0A5",
                        background:
                            "rgba(53,224,165,.10)",
                        border:
                            "1px solid rgba(53,224,165,.28)",
                        boxShadow:
                            "0 0 40px rgba(53,224,165,.12)",
                    }}
                >
                    {isComplete ? (
                        <Trophy size={31} />
                    ) : (
                        <PartyPopper size={31} />
                    )}
                </div>

                <div
                    style={{
                        color: "#35E0A5",
                        fontSize: "12px",
                        fontWeight: 850,
                        letterSpacing: "2px",
                    }}
                >
                    {isComplete
                        ? "GOAL ACHIEVED"
                        : "MILESTONE UNLOCKED"}
                </div>

                <h2
                    style={{
                        margin:
                            "10px 0 8px",
                        color: "#F5F8F7",
                        fontSize: "30px",
                        lineHeight: 1.1,
                        fontWeight: 850,
                        letterSpacing: "-1px",
                    }}
                >
                    {milestone}% there!
                </h2>

                <p
                    style={{
                        maxWidth: "330px",
                        margin: "0 auto",
                        color: "#9AA9A4",
                        fontSize: "14px",
                        lineHeight: 1.6,
                    }}
                >
                    {isComplete
                        ? `You completed your ${goal.goal_name} savings goal. That's a big financial win.`
                        : `You've reached ${milestone}% of your ${goal.goal_name} goal. Keep the momentum going.`}
                </p>

                <div
                    style={{
                        marginTop: "22px",
                        padding: "13px",
                        borderRadius: "12px",
                        background:
                            "rgba(53,224,165,.055)",
                        border:
                            "1px solid rgba(53,224,165,.10)",
                        color: "#C8D4D0",
                        fontSize: "13px",
                    }}
                >
                    <strong
                        style={{
                            color: "#35E0A5",
                        }}
                    >
                        {formatCurrency(
                            goal.saved_amount
                        )}
                    </strong>{" "}
                    saved of{" "}
                    <strong>
                        {formatCurrency(
                            goal.target_amount
                        )}
                    </strong>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        width: "100%",
                        height: "46px",
                        marginTop: "20px",
                        border: 0,
                        borderRadius: "12px",
                        background:
                            "linear-gradient(135deg,#35E0A5,#1EC8A1)",
                        color: "#03130E",
                        fontSize: "13px",
                        fontWeight: 850,
                        cursor: "pointer",
                        boxShadow:
                            "0 10px 30px rgba(53,224,165,.15)",
                    }}
                >
                    Keep building
                </button>
            </div>
        </div>
    );
}


/* =========================================================
   ADD MONEY MODAL
========================================================= */

function AddMoneyModal({
    goal,
    amount,
    setAmount,
    onClose,
    onSubmit,
    saving,
}) {
    if (!goal) {
        return null;
    }

    const target = Number(
        goal.target_amount || 0
    );

    const saved = Number(
        goal.saved_amount || 0
    );

    const remaining = Math.max(
        target - saved,
        0
    );

    const numericAmount = Number(
        amount || 0
    );

    const projectedSaved = Math.min(
        saved +
            (Number.isFinite(numericAmount)
                ? numericAmount
                : 0),
        target
    );

    const projectedProgress =
        target > 0
            ? Math.min(
                  (projectedSaved / target) *
                      100,
                  100
              )
            : 0;

    const exceedsTarget =
        numericAmount > remaining;

    const quickAmounts = [
        Math.min(500, remaining),
        Math.min(1000, remaining),
        Math.min(2500, remaining),
    ].filter(
        (value, index, array) =>
            value > 0 &&
            array.indexOf(value) === index
    );

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 2200,
                display: "grid",
                placeItems: "center",
                padding: "24px",
                background:
                    "rgba(2,6,12,.76)",
                backdropFilter:
                    "blur(12px)",
            }}
        >
            <div
                style={{
                    width: "min(430px,100%)",
                    padding: "27px",
                    borderRadius: "20px",
                    background:
                        "linear-gradient(145deg,#111923,#0B1118)",
                    border:
                        "1px solid rgba(53,224,165,.20)",
                    boxShadow:
                        "0 30px 90px rgba(0,0,0,.58)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "space-between",
                        gap: "15px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "11px",
                        }}
                    >
                        <div
                            style={{
                                width: "40px",
                                height: "40px",
                                display: "grid",
                                placeItems: "center",
                                borderRadius: "11px",
                                color: "#35E0A5",
                                background:
                                    "rgba(53,224,165,.09)",
                            }}
                        >
                            <Coins size={20} />
                        </div>

                        <div>
                            <div
                                style={{
                                    color: "#35E0A5",
                                    fontSize: "10px",
                                    fontWeight: 850,
                                    letterSpacing:
                                        "1.2px",
                                    textTransform:
                                        "uppercase",
                                }}
                            >
                                {goal.goal_name}
                            </div>

                            <div
                                style={{
                                    marginTop: "3px",
                                    color: "#7F8D89",
                                    fontSize: "12px",
                                }}
                            >
                                {formatCurrency(
                                    remaining
                                )}{" "}
                                remaining
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            width: "34px",
                            height: "34px",
                            display: "grid",
                            placeItems: "center",
                            border: 0,
                            borderRadius: "9px",
                            background:
                                "rgba(255,255,255,.04)",
                            color: "#87938F",
                            cursor: "pointer",
                        }}
                    >
                        <X size={17} />
                    </button>
                </div>

                <h2
                    style={{
                        margin:
                            "27px 0 7px",
                        color: "#F5F8F7",
                        fontSize: "22px",
                        fontWeight: 800,
                        letterSpacing: "-.5px",
                    }}
                >
                    How much are you adding?
                </h2>

                <p
                    style={{
                        margin: 0,
                        color: "#7F8D89",
                        fontSize: "12px",
                        lineHeight: 1.5,
                    }}
                >
                    Add money to this goal and
                    watch your progress move forward.
                </p>

                <div
                    style={{
                        position: "relative",
                        marginTop: "20px",
                    }}
                >
                    <span
                        style={{
                            position: "absolute",
                            left: "15px",
                            top: "50%",
                            transform:
                                "translateY(-50%)",
                            color: "#8E9A96",
                            fontSize: "16px",
                            fontWeight: 700,
                        }}
                    >
                        ₹
                    </span>

                    <input
                        autoFocus
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(event) =>
                            setAmount(
                                event.target.value
                            )
                        }
                        placeholder="0"
                        style={{
                            width: "100%",
                            height: "52px",
                            boxSizing: "border-box",
                            padding:
                                "0 16px 0 35px",
                            borderRadius: "12px",
                            border:
                                exceedsTarget
                                    ? "1px solid #FF747C"
                                    : "1px solid rgba(53,224,165,.65)",
                            outline: "none",
                            background:
                                "#080E14",
                            color: "#F5F8F7",
                            fontSize: "17px",
                            fontWeight: 750,
                            fontFamily:
                                "inherit",
                        }}
                    />
                </div>

                {exceedsTarget && (
                    <div
                        style={{
                            marginTop: "8px",
                            color: "#FF747C",
                            fontSize: "11px",
                            fontWeight: 650,
                        }}
                    >
                        You can add up to{" "}
                        {formatCurrency(
                            remaining
                        )}.
                    </div>
                )}

                {quickAmounts.length > 0 && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(3,1fr)",
                            gap: "8px",
                            marginTop: "14px",
                        }}
                    >
                        {quickAmounts.map(
                            (quickAmount) => (
                                <button
                                    key={
                                        quickAmount
                                    }
                                    type="button"
                                    onClick={() =>
                                        setAmount(
                                            String(
                                                quickAmount
                                            )
                                        )
                                    }
                                    style={{
                                        height: "39px",
                                        border:
                                            "1px solid rgba(255,255,255,.09)",
                                        borderRadius:
                                            "10px",
                                        background:
                                            "rgba(255,255,255,.025)",
                                        color: "#B7C2BE",
                                        cursor:
                                            "pointer",
                                        fontSize:
                                            "11px",
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    +
                                    {formatCurrency(
                                        quickAmount
                                    )}
                                </button>
                            )
                        )}
                    </div>
                )}

                {numericAmount > 0 &&
                    !exceedsTarget && (
                        <div
                            style={{
                                marginTop: "17px",
                                padding: "13px 14px",
                                borderRadius: "11px",
                                background:
                                    "rgba(53,224,165,.045)",
                                border:
                                    "1px solid rgba(53,224,165,.09)",
                            }}
                        >
                            <div
                                style={{
                                    display:
                                        "flex",
                                    justifyContent:
                                        "space-between",
                                    color:
                                        "#7F8D89",
                                    fontSize:
                                        "11px",
                                }}
                            >
                                <span>
                                    New progress
                                </span>

                                <strong
                                    style={{
                                        color:
                                            "#35E0A5",
                                    }}
                                >
                                    {projectedProgress.toFixed(
                                        1
                                    )}
                                    %
                                </strong>
                            </div>

                            <div
                                style={{
                                    height: "5px",
                                    marginTop:
                                        "8px",
                                    overflow:
                                        "hidden",
                                    borderRadius:
                                        "999px",
                                    background:
                                        "#1A242B",
                                }}
                            >
                                <div
                                    style={{
                                        width:
                                            `${projectedProgress}%`,
                                        height:
                                            "100%",
                                        borderRadius:
                                            "999px",
                                        background:
                                            "linear-gradient(90deg,#B9A0FF,#35E0A5)",
                                    }}
                                />
                            </div>
                        </div>
                    )}

                <button
                    type="button"
                    disabled={
                        saving ||
                        !numericAmount ||
                        numericAmount <= 0 ||
                        exceedsTarget
                    }
                    onClick={onSubmit}
                    style={{
                        width: "100%",
                        height: "47px",
                        marginTop: "19px",
                        border: 0,
                        borderRadius: "11px",
                        background:
                            saving ||
                            !numericAmount ||
                            numericAmount <= 0 ||
                            exceedsTarget
                                ? "#34403D"
                                : "linear-gradient(135deg,#35E0A5,#1EC8A1)",
                        color:
                            saving ||
                            !numericAmount ||
                            numericAmount <= 0 ||
                            exceedsTarget
                                ? "#71807B"
                                : "#03130E",
                        cursor:
                            saving ||
                            !numericAmount ||
                            numericAmount <= 0 ||
                            exceedsTarget
                                ? "not-allowed"
                                : "pointer",
                        fontSize: "13px",
                        fontWeight: 850,
                    }}
                >
                    {saving
                        ? "Adding..."
                        : "Add to goal"}
                </button>
            </div>
        </div>
    );
}


/* =========================================================
   FIELD
========================================================= */

function Field({
    label,
    children,
}) {
    return (
        <div>
            <label
                style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#93A09C",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: ".7px",
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

function SavingsKPI({
    icon,
    label,
    value,
    description,
    color,
}) {
    return (
        <article
            style={{
                position: "relative",
                overflow: "hidden",
                padding: "20px",
                minWidth: 0,
                borderRadius: "16px",
                background:
                    "linear-gradient(145deg,#111923,#0B1219)",
                border:
                    "1px solid rgba(255,255,255,.075)",
                boxShadow:
                    "0 12px 35px rgba(0,0,0,.18)",
                transition:
                    "transform .2s ease,border-color .2s ease",
            }}
            onMouseEnter={(event) => {
                event.currentTarget.style.transform =
                    "translateY(-3px)";

                event.currentTarget.style.borderColor =
                    `${color}45`;
            }}
            onMouseLeave={(event) => {
                event.currentTarget.style.transform =
                    "translateY(0)";

                event.currentTarget.style.borderColor =
                    "rgba(255,255,255,.075)";
            }}
        >
            <div
                style={{
                    position: "absolute",
                    width: "120px",
                    height: "120px",
                    right: "-50px",
                    top: "-55px",
                    borderRadius: "50%",
                    background: color,
                    opacity: 0.055,
                    filter: "blur(25px)",
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
                        display: "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "space-between",
                        marginBottom: "16px",
                    }}
                >
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "11px",
                            color,
                            background:
                                `${color}0D`,
                            border:
                                `1px solid ${color}1A`,
                        }}
                    >
                        {icon}
                    </div>

                    <ArrowUpRight
                        size={15}
                        color="#596863"
                    />
                </div>

                <div
                    style={{
                        color: "#81908B",
                        fontSize: "10px",
                        fontWeight: 800,
                        letterSpacing: "1.2px",
                        marginBottom: "7px",
                    }}
                >
                    {label}
                </div>

                <div
                    style={{
                        color: "#F4F7F6",
                        fontSize: "24px",
                        lineHeight: 1.15,
                        fontWeight: 800,
                        letterSpacing: "-.6px",
                        whiteSpace:
                            "nowrap",
                        overflow:
                            "hidden",
                        textOverflow:
                            "ellipsis",
                    }}
                >
                    {value}
                </div>

                <div
                    style={{
                        marginTop: "7px",
                        color: "#71807B",
                        fontSize: "11px",
                        lineHeight: 1.4,
                    }}
                >
                    {description}
                </div>
            </div>
        </article>
    );
}


/* =========================================================
   GOAL CARD
========================================================= */

function GoalCard({
    goal,
    onEdit,
    onDelete,
    onAddMoney,
}) {
    const status = goal.statusInfo;
    const nextMilestone =
        getNextMilestone(goal.progress);

    const remainingToMilestone =
        nextMilestone
            ? Math.max(
                  nextMilestone -
                      goal.progress,
                  0
              )
            : 0;

    return (
        <article
            className="bb-goal-card"
            style={{
                position: "relative",
                overflow: "hidden",
                padding: "24px",
                borderRadius: "20px",
                background:
                    "linear-gradient(145deg,#111923 0%,#0C131A 100%)",
                border:
                    "1px solid rgba(255,255,255,.075)",
                boxShadow:
                    "0 15px 45px rgba(0,0,0,.18)",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    width: "180px",
                    height: "180px",
                    right: "-110px",
                    top: "-105px",
                    borderRadius: "50%",
                    background:
                        goal.progress >= 100
                            ? "rgba(53,224,165,.10)"
                            : "rgba(185,160,255,.075)",
                    filter: "blur(40px)",
                    pointerEvents: "none",
                }}
            />

            {/* HEADER */}

            <div
                style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent:
                        "space-between",
                    gap: "15px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems:
                            "center",
                        gap: "13px",
                        minWidth: 0,
                    }}
                >
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "14px",
                            color:
                                goal.progress >=
                                100
                                    ? "#35E0A5"
                                    : "#B9A0FF",
                            background:
                                goal.progress >=
                                100
                                    ? "rgba(53,224,165,.09)"
                                    : "rgba(185,160,255,.09)",
                            border:
                                goal.progress >=
                                100
                                    ? "1px solid rgba(53,224,165,.17)"
                                    : "1px solid rgba(185,160,255,.17)",
                        }}
                    >
                        {getGoalIcon(
                            goal.goal_name
                        )}
                    </div>

                    <div
                        style={{
                            minWidth: 0,
                        }}
                    >
                        <h3
                            style={{
                                margin: 0,
                                color:
                                    "#F4F7F6",
                                fontSize:
                                    "17px",
                                lineHeight:
                                    1.25,
                                fontWeight:
                                    800,
                                letterSpacing:
                                    "-.25px",
                                overflow:
                                    "hidden",
                                textOverflow:
                                    "ellipsis",
                                whiteSpace:
                                    "nowrap",
                            }}
                        >
                            {goal.goal_name}
                        </h3>

                        <div
                            style={{
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap: "6px",
                                marginTop:
                                    "5px",
                                color:
                                    "#83918D",
                                fontSize:
                                    "11px",
                            }}
                        >
                            <CalendarDays
                                size={12}
                            />

                            Target{" "}
                            {formatDate(
                                goal.target_date
                            )}
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "6px",
                    }}
                >
                    <button
                        type="button"
                        onClick={() =>
                            onEdit(goal)
                        }
                        title="Edit goal"
                        style={{
                            width: "34px",
                            height: "34px",
                            display: "grid",
                            placeItems:
                                "center",
                            border:
                                "1px solid rgba(255,255,255,.08)",
                            borderRadius:
                                "9px",
                            background:
                                "rgba(255,255,255,.025)",
                            color: "#9AA6A2",
                            cursor: "pointer",
                        }}
                    >
                        <Pencil size={14} />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            onDelete(goal)
                        }
                        title="Delete goal"
                        style={{
                            width: "34px",
                            height: "34px",
                            display: "grid",
                            placeItems:
                                "center",
                            border:
                                "1px solid rgba(255,116,124,.12)",
                            borderRadius:
                                "9px",
                            background:
                                "rgba(255,116,124,.035)",
                            color: "#FF747C",
                            cursor: "pointer",
                        }}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* PROGRESS AREA */}

            <div
                style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns:
                        "126px minmax(0,1fr)",
                    alignItems:
                        "center",
                    gap: "22px",
                    marginTop: "25px",
                }}
            >
                {/* RING */}

                <div
                    style={{
                        width: "126px",
                        height: "126px",
                        position:
                            "relative",
                        display: "grid",
                        placeItems:
                            "center",
                        borderRadius:
                            "50%",
                        background:
                            `conic-gradient(#A978FF ${goal.progress}%, #202B37 0)`,
                        boxShadow:
                            "0 0 30px rgba(169,120,255,.08)",
                    }}
                >
                    <div
                        style={{
                            position:
                                "absolute",
                            inset: "9px",
                            borderRadius:
                                "50%",
                            background:
                                "#0E151C",
                        }}
                    />

                    <div
                        style={{
                            position:
                                "relative",
                            zIndex: 1,
                            textAlign:
                                "center",
                        }}
                    >
                        <div
                            style={{
                                color:
                                    "#F5F8F7",
                                fontSize:
                                    "24px",
                                fontWeight:
                                    850,
                                letterSpacing:
                                    "-.8px",
                            }}
                        >
                            {Math.round(
                                goal.progress
                            )}
                            %
                        </div>

                        <div
                            style={{
                                marginTop:
                                    "2px",
                                color:
                                    "#71807B",
                                fontSize:
                                    "10px",
                            }}
                        >
                            saved
                        </div>
                    </div>
                </div>

                {/* MONEY */}

                <div>
                    <div
                        style={{
                            color:
                                "#81908B",
                            fontSize:
                                "10px",
                            fontWeight:
                                800,
                            letterSpacing:
                                "1px",
                            textTransform:
                                "uppercase",
                        }}
                    >
                        Current savings
                    </div>

                    <div
                        style={{
                            marginTop:
                                "5px",
                            color:
                                "#F5F8F7",
                            fontSize:
                                "27px",
                            fontWeight:
                                850,
                            letterSpacing:
                                "-.8px",
                        }}
                    >
                        {formatCurrency(
                            goal.saved_amount
                        )}
                    </div>

                    <div
                        style={{
                            marginTop:
                                "5px",
                            color:
                                "#788680",
                            fontSize:
                                "12px",
                        }}
                    >
                        of{" "}
                        <strong
                            style={{
                                color:
                                    "#C7D0CD",
                            }}
                        >
                            {formatCurrency(
                                goal.target_amount
                            )}
                        </strong>
                    </div>

                    <div
                        style={{
                            marginTop:
                                "15px",
                            display:
                                "flex",
                            alignItems:
                                "center",
                            gap: "7px",
                            color:
                                "#35E0A5",
                            fontSize:
                                "12px",
                            fontWeight:
                                700,
                        }}
                    >
                        {goal.progress >=
                        100 ? (
                            <>
                                <Trophy
                                    size={13}
                                />
                                Goal completed
                            </>
                        ) : (
                            <>
                                <TrendingUp
                                    size={13}
                                />
                                {formatCurrency(
                                    goal.remaining
                                )}{" "}
                                remaining
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* PROGRESS BAR */}

            <div
                style={{
                    marginTop: "25px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        marginBottom: "8px",
                        color:
                            "#74827E",
                        fontSize:
                            "10px",
                        fontWeight:
                            700,
                    }}
                >
                    <span>
                        Goal progress
                    </span>

                    <span
                        style={{
                            color:
                                status.color,
                        }}
                    >
                        {goal.progress.toFixed(
                            1
                        )}
                        %
                    </span>
                </div>

                <div
                    style={{
                        height: "8px",
                        overflow:
                            "hidden",
                        borderRadius:
                            "999px",
                        background:
                            "#1B2530",
                    }}
                >
                    <div
                        style={{
                            width:
                                `${goal.progress}%`,
                            height:
                                "100%",
                            borderRadius:
                                "999px",
                            background:
                                goal.progress >=
                                100
                                    ? "#35E0A5"
                                    : "linear-gradient(90deg,#A978FF,#35E0A5)",
                            boxShadow:
                                goal.progress >
                                0
                                    ? "0 0 14px rgba(53,224,165,.16)"
                                    : "none",
                            transition:
                                "width .65s cubic-bezier(.2,.8,.2,1)",
                        }}
                    />
                </div>

                {/* MILESTONES */}

                <div
                    style={{
                        display:
                            "flex",
                        justifyContent:
                            "space-between",
                        marginTop:
                            "10px",
                    }}
                >
                    {MILESTONES.map(
                        (milestone) => (
                            <div
                                key={
                                    milestone
                                }
                                style={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap:
                                        "4px",
                                    color:
                                        goal.progress >=
                                        milestone
                                            ? "#35E0A5"
                                            : "#596762",
                                    fontSize:
                                        "10px",
                                    fontWeight:
                                        650,
                                }}
                            >
                                <span
                                    style={{
                                        width:
                                            "7px",
                                        height:
                                            "7px",
                                        borderRadius:
                                            "50%",
                                        background:
                                            goal.progress >=
                                            milestone
                                                ? "#35E0A5"
                                                : "#35413E",
                                    }}
                                />

                                {milestone}%
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* NEXT MILESTONE */}

            {nextMilestone &&
                goal.progress <
                    nextMilestone && (
                    <div
                        style={{
                            marginTop:
                                "17px",
                            padding:
                                "11px 12px",
                            borderRadius:
                                "10px",
                            background:
                                "rgba(185,160,255,.045)",
                            border:
                                "1px solid rgba(185,160,255,.09)",
                            color:
                                "#929F9B",
                            fontSize:
                                "11px",
                        }}
                    >
                        <strong
                            style={{
                                color:
                                    "#B9A0FF",
                            }}
                        >
                            {remainingToMilestone.toFixed(
                                1
                            )}%
                        </strong>{" "}
                        more to unlock your{" "}
                        <strong
                            style={{
                                color:
                                    "#D4DCD9",
                            }}
                        >
                            {nextMilestone}%
                        </strong>{" "}
                        milestone.
                    </div>
                )}

            {/* STATUS */}

            <div
                style={{
                    display:
                        "flex",
                    alignItems:
                        "center",
                    justifyContent:
                        "space-between",
                    gap: "12px",
                    marginTop:
                        "17px",
                }}
            >
                <span
                    style={{
                        display:
                            "inline-flex",
                        alignItems:
                            "center",
                        gap: "6px",
                        padding:
                            "7px 10px",
                        borderRadius:
                            "999px",
                        background:
                            status.background,
                        border:
                            `1px solid ${status.border}`,
                        color:
                            status.color,
                        fontSize:
                            "10px",
                        fontWeight:
                            750,
                    }}
                >
                    {status.icon}
                    {status.label}
                </span>

                <span
                    style={{
                        color:
                            "#6E7B77",
                        fontSize:
                            "11px",
                    }}
                >
                    {formatCurrency(
                        goal.remaining
                    )}{" "}
                    to target
                </span>
            </div>

            {/* ADD MONEY */}

            {goal.progress < 100 && (
                <button
                    type="button"
                    onClick={() =>
                        onAddMoney(goal)
                    }
                    style={{
                        width: "100%",
                        height: "46px",
                        marginTop: "19px",
                        display:
                            "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        gap: "8px",
                        border: 0,
                        borderRadius:
                            "11px",
                        background:
                            "linear-gradient(135deg,#35E0A5,#1EC8A1)",
                        color: "#03130E",
                        cursor: "pointer",
                        fontSize:
                            "12px",
                        fontWeight:
                            850,
                        boxShadow:
                            "0 8px 24px rgba(53,224,165,.10)",
                    }}
                >
                    <Plus size={16} />
                    Add to this goal
                    <ChevronRight
                        size={15}
                    />
                </button>
            )}
        </article>
    );
}


/* =========================================================
   MAIN PAGE
========================================================= */

export default function Savings() {
    const [formData, setFormData] =
        useState({
            ...EMPTY_FORM,
        });

    const [goals, setGoals] =
        useState([]);

    const [editingGoal, setEditingGoal] =
        useState(null);

    const [showForm, setShowForm] =
        useState(false);

    const [searchTerm, setSearchTerm] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [addMoneyGoal, setAddMoneyGoal] =
        useState(null);

    const [addAmount, setAddAmount] =
        useState("");

    const [milestone, setMilestone] =
        useState(null);

    const [toast, setToast] =
        useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] =
        useState(false);

    const [selectedGoal, setSelectedGoal] =
        useState(null);

    const formSectionRef = useRef(null);
    const goalNameInputRef = useRef(null);


    /* =====================================================
       TOAST
    ===================================================== */

    const showToast = (
        title,
        message = ""
    ) => {
        setToast({
            title,
            message,
        });
    };


    useEffect(() => {
        if (!toast) {
            return undefined;
        }

        const timer =
            window.setTimeout(() => {
                setToast(null);
            }, 4200);

        return () =>
            window.clearTimeout(timer);
    }, [toast]);


    const scrollToSavingsForm = () => {
        window.setTimeout(() => {
            formSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });

            window.setTimeout(() => {
                goalNameInputRef.current?.focus();
            }, 500);
        }, 80);
    };


    /* =====================================================
       FETCH GOALS
    ===================================================== */

    const fetchGoals = async () => {
        try {
            const response =
                await getSavingsGoals();

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            setGoals(data);
        } catch (error) {
            console.error(
                "Failed to fetch savings goals:",
                error.response?.data ||
                    error.message
            );

            showToast(
                "Unable to load savings goals",
                "Please refresh and try again."
            );
        }
    };


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        const loadGoals = async () => {
            try {
                setLoading(true);
                await fetchGoals();
            } finally {
                setLoading(false);
            }
        };

        loadGoals();
    }, []);


    /* =====================================================
       FORM
    ===================================================== */

    const handleChange = (
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


    const openCreateForm = () => {
        setEditingGoal(null);

        setFormData({
            ...EMPTY_FORM,
        });

        setShowForm(true);

        scrollToSavingsForm();
    };


    const handleEdit = (
        goal
    ) => {
        setEditingGoal(goal);

        setFormData({
            goal_name:
                goal.goal_name || "",

            target_amount:
                goal.target_amount ??
                "",

            saved_amount:
                goal.saved_amount ??
                "",

            target_date:
                goal.target_date || "",
        });

        setShowForm(true);

        scrollToSavingsForm();
    };


    const closeForm = () => {
        setEditingGoal(null);

        setFormData({
            ...EMPTY_FORM,
        });

        setShowForm(false);
    };


    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {
        if (
            !formData.goal_name.trim()
        ) {
            return "Please enter a savings goal name.";
        }

        const target =
            Number(
                formData.target_amount
            );

        if (
            !Number.isFinite(target) ||
            target <= 0
        ) {
            return "Target amount must be greater than zero.";
        }

        const saved =
            Number(
                formData.saved_amount
            );

        if (
            formData.saved_amount ===
                "" ||
            !Number.isFinite(saved) ||
            saved < 0
        ) {
            return "Saved amount cannot be negative.";
        }

        if (saved > target) {
            return "Saved amount cannot exceed target amount.";
        }

        if (
            !formData.target_date
        ) {
            return "Please select a target date.";
        }

        return null;
    };


    /* =====================================================
       CREATE / UPDATE
    ===================================================== */

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        if (saving) {
            return;
        }

        const validationError =
            validateForm();

        if (validationError) {
            showToast(
                "Check your goal details",
                validationError
            );
            return;
        }

        const payload = {
            goal_name:
                formData.goal_name.trim(),

            target_amount:
                Number(
                    formData.target_amount
                ),

            saved_amount:
                Number(
                    formData.saved_amount
                ),

            target_date:
                formData.target_date,
        };

        try {
            setSaving(true);

            if (editingGoal) {
                await updateSavingsGoal(
                    editingGoal.id,
                    payload
                );

                showToast(
                    "Savings goal updated",
                    "Your goal details have been updated."
                );
            } else {
                await createSavingsGoal(
                    payload
                );

                showToast(
                    "Savings goal created",
                    "Your new financial target is ready to track."
                );
            }

            await fetchGoals();

            closeForm();
        } catch (error) {
            console.error(
                "Savings goal save failed:",
                error
            );

            const backendError =
                error.response?.data;

            if (
                backendError &&
                typeof backendError ===
                    "object"
            ) {
                const message =
                    Object.entries(
                        backendError
                    )
                        .map(
                            ([
                                field,
                                messages,
                            ]) =>
                                `${field}: ${
                                    Array.isArray(
                                        messages
                                    )
                                        ? messages.join(
                                              ", "
                                          )
                                        : messages
                                }`
                        )
                        .join(" • ");

                showToast(
                    "Unable to save goal",
                    message
                );
            } else {
                showToast(
                    "Unable to save goal",
                    "Please try again."
                );
            }
        } finally {
            setSaving(false);
        }
    };


    /* =====================================================
       DELETE
    ===================================================== */

    const handleDelete = (goal) => {
        setSelectedGoal(goal);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedGoal(null);
    };

    const confirmDelete = async () => {
        if (!selectedGoal) {
            return;
        }

        try {
            await deleteSavingsGoal(
                selectedGoal.id
            );

            await fetchGoals();

            closeDeleteDialog();

            showToast(
                "Savings goal deleted",
                "The goal has been removed from your portfolio."
            );
        } catch (error) {
            console.error(
                "Delete failed:",
                error.response?.data ||
                    error.message
            );

            closeDeleteDialog();

            showToast(
                "Unable to delete goal",
                "Please try again."
            );
        }
    };


    /* =====================================================
       ADD MONEY
    ===================================================== */

    const openAddMoney = (
        goal
    ) => {
        setAddMoneyGoal(goal);
        setAddAmount("");
    };


    const closeAddMoney = () => {
        if (saving) {
            return;
        }

        setAddMoneyGoal(null);
        setAddAmount("");
    };


    const handleAddMoney = async () => {
        if (
            !addMoneyGoal ||
            saving
        ) {
            return;
        }

        const amount =
            Number(addAmount);

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            showToast(
                "Enter a valid amount",
                "The amount must be greater than zero."
            );
            return;
        }

        const target =
            Number(
                addMoneyGoal.target_amount ||
                    0
            );

        const previousSaved =
            Number(
                addMoneyGoal.saved_amount ||
                    0
            );

        const remaining =
            Math.max(
                target -
                    previousSaved,
                0
            );

        if (amount > remaining) {
            showToast(
                "Amount is too high",
                `You can add up to ${formatCurrency(
                    remaining
                )}.`
            );
            return;
        }

        const previousProgress =
            getProgress(
                previousSaved,
                target
            );

        const newSaved =
            previousSaved + amount;

        const newProgress =
            getProgress(
                newSaved,
                target
            );

        const payload = {
            goal_name:
                addMoneyGoal.goal_name,

            target_amount:
                target,

            saved_amount:
                newSaved,

            target_date:
                addMoneyGoal.target_date,
        };

        try {
            setSaving(true);

            await updateSavingsGoal(
                addMoneyGoal.id,
                payload
            );

            await fetchGoals();

            const updatedGoal = {
                ...addMoneyGoal,
                saved_amount:
                    newSaved,
            };

            setAddMoneyGoal(null);
            setAddAmount("");

            showToast(
                `${formatCurrency(
                    amount
                )} added to ${addMoneyGoal.goal_name}`,
                `${newProgress.toFixed(
                    1
                )}% of your goal is now complete.`
            );

            const crossedMilestone =
                getCrossedMilestone(
                    previousProgress,
                    newProgress
                );

            if (crossedMilestone) {
                window.setTimeout(() => {
                    setMilestone({
                        value:
                            crossedMilestone,
                        goal:
                            updatedGoal,
                    });
                }, 450);
            }
        } catch (error) {
            console.error(
                "Failed to add money to savings goal:",
                error.response?.data ||
                    error.message
            );

            showToast(
                "Unable to add money",
                "Your savings goal was not changed."
            );
        } finally {
            setSaving(false);
        }
    };


    /* =====================================================
       CALCULATED DATA
    ===================================================== */

    const goalData = useMemo(
        () =>
            goals.map(
                (goal) => {
                    const target =
                        Number(
                            goal.target_amount ||
                                0
                        );

                    const saved =
                        Number(
                            goal.saved_amount ||
                                0
                        );

                    const remaining =
                        Math.max(
                            target -
                                saved,
                            0
                        );

                    const progress =
                        getProgress(
                            saved,
                            target
                        );

                    return {
                        ...goal,
                        remaining,
                        progress,
                        statusInfo:
                            getGoalStatus(
                                goal
                            ),
                    };
                }
            ),
        [goals]
    );


    const filteredGoals =
        useMemo(() => {
            const search =
                searchTerm
                    .toLowerCase()
                    .trim();

            if (!search) {
                return goalData;
            }

            return goalData.filter(
                (goal) =>
                    goal.goal_name
                        ?.toLowerCase()
                        .includes(search) ||
                    String(
                        goal.status || ""
                    )
                        .toLowerCase()
                        .includes(search)
            );
        }, [
            goalData,
            searchTerm,
        ]);


    const totalTarget =
        goalData.reduce(
            (total, goal) =>
                total +
                Number(
                    goal.target_amount ||
                        0
                ),
            0
        );


    const totalSaved =
        goalData.reduce(
            (total, goal) =>
                total +
                Number(
                    goal.saved_amount ||
                        0
                ),
            0
        );


    const totalRemaining =
        Math.max(
            totalTarget -
                totalSaved,
            0
        );


    const completedGoals =
        goalData.filter(
            (goal) =>
                goal.progress >= 100
        ).length;


    const overallProgress =
        getProgress(
            totalSaved,
            totalTarget
        );


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <main
            style={{
                width: "100%",
                maxWidth: "1280px",
                margin: "0 auto",
                paddingBottom: "45px",
            }}
        >
            {/* =================================================
                GLOBAL STYLE
            ================================================= */}

            <style>
                {`
                    @keyframes bbToastIn {
                        from {
                            opacity: 0;
                            transform: translateY(-10px) translateX(10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) translateX(0);
                        }
                    }

                    @keyframes bbConfettiFall {
                        0% {
                            opacity: 0;
                            transform: translateY(-10px) rotate(0deg);
                        }

                        15% {
                            opacity: 1;
                        }

                        100% {
                            opacity: 0;
                            transform: translateY(180px) rotate(240deg);
                        }
                    }

                    .bb-confetti {
                        position: absolute;
                        width: 7px;
                        height: 12px;
                        border-radius: 2px;
                        background: #35E0A5;
                        animation: bbConfettiFall 2.2s ease-out infinite;
                    }

                    .bb-confetti:nth-of-type(3n) {
                        background: #A978FF;
                    }

                    .bb-confetti:nth-of-type(4n) {
                        background: #F3C969;
                    }

                    .bb-goal-card {
                        transition:
                            transform .22s ease,
                            border-color .22s ease,
                            box-shadow .22s ease;
                    }

                    .bb-goal-card:hover {
                        transform: translateY(-4px);
                        border-color: rgba(53,224,165,.16) !important;
                        box-shadow:
                            0 22px 55px rgba(0,0,0,.28),
                            0 0 35px rgba(53,224,165,.035);
                    }

                    .bb-savings-input::placeholder {
                        color: #56645F;
                    }

                    .bb-savings-input:focus {
                        border-color: rgba(53,224,165,.55) !important;
                        box-shadow: 0 0 0 3px rgba(53,224,165,.07);
                    }

                    @media (max-width: 900px) {
                        .bb-savings-kpi-grid {
                            grid-template-columns: repeat(2,minmax(0,1fr)) !important;
                        }

                        .bb-goals-grid {
                            grid-template-columns: 1fr !important;
                        }
                    }

                    @media (max-width: 620px) {
                        .bb-savings-kpi-grid {
                            grid-template-columns: 1fr !important;
                        }

                        .bb-savings-form-grid {
                            grid-template-columns: 1fr !important;
                        }

                        .bb-savings-page-padding {
                            padding-left: 14px !important;
                            padding-right: 14px !important;
                        }
                    }
                `}
            </style>


            {/* =================================================
                TOAST
            ================================================= */}

            <Toast
                toast={toast}
                onClose={() =>
                    setToast(null)
                }
            />


            {/* =================================================
                MILESTONE MODAL
            ================================================= */}

            <MilestoneModal
                milestone={
                    milestone?.value
                }
                goal={
                    milestone?.goal
                }
                onClose={() =>
                    setMilestone(null)
                }
            />


            {/* =================================================
                ADD MONEY MODAL
            ================================================= */}

            <AddMoneyModal
                goal={addMoneyGoal}
                amount={addAmount}
                setAmount={setAddAmount}
                onClose={closeAddMoney}
                onSubmit={
                    handleAddMoney
                }
                saving={saving}
            />


            {/* =================================================
                HERO
            ================================================= */}

            <section
                className="bb-savings-page-padding"
                style={{
                    position: "relative",
                    overflow: "hidden",
                    padding: "30px",
                    marginBottom: "20px",
                    borderRadius: "20px",
                    background:
                        "linear-gradient(135deg,#111B22 0%,#0B1219 58%,#0D1917 100%)",
                    border:
                        "1px solid rgba(255,255,255,.075)",
                    boxShadow:
                        "0 18px 50px rgba(0,0,0,.20)",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        width: "320px",
                        height: "320px",
                        right: "-100px",
                        top: "-190px",
                        borderRadius: "50%",
                        background:
                            "rgba(53,224,165,.085)",
                        filter: "blur(60px)",
                        pointerEvents:
                            "none",
                    }}
                />

                <div
                    style={{
                        position: "relative",
                        zIndex: 1,
                        display: "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "space-between",
                        gap: "25px",
                        flexWrap: "wrap",
                    }}
                >
                    <div
                        style={{
                            maxWidth:
                                "720px",
                        }}
                    >
                        <div
                            style={{
                                display:
                                    "inline-flex",
                                alignItems:
                                    "center",
                                gap: "7px",
                                marginBottom:
                                    "10px",
                                color:
                                    "#35E0A5",
                                fontSize:
                                    "10px",
                                fontWeight:
                                    850,
                                letterSpacing:
                                    "1.7px",
                            }}
                        >
                            <Sparkles
                                size={12}
                            />
                            SAVINGS PLANNER
                        </div>

                        <h1
                            style={{
                                margin: 0,
                                color:
                                    "#F5F8F7",
                                fontSize:
                                    "32px",
                                lineHeight:
                                    1.1,
                                fontWeight:
                                    850,
                                letterSpacing:
                                    "-1.1px",
                            }}
                        >
                            Turn your plans{" "}
                            <span
                                style={{
                                    color:
                                        "#35E0A5",
                                }}
                            >
                                into progress.
                            </span>
                        </h1>

                        <p
                            style={{
                                maxWidth:
                                    "600px",
                                margin:
                                    "11px 0 0",
                                color:
                                    "#84938E",
                                fontSize:
                                    "13px",
                                lineHeight:
                                    1.65,
                            }}
                        >
                            Set meaningful
                            savings goals,
                            monitor your
                            progress, and
                            celebrate every
                            milestone along
                            the way.
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
                            display:
                                "flex",
                            alignItems:
                                "center",
                            gap: "8px",
                            height:
                                "44px",
                            padding:
                                "0 18px",
                            border: 0,
                            borderRadius:
                                "11px",
                            background:
                                "linear-gradient(135deg,#35E0A5,#1EC8A1)",
                            color:
                                "#03130E",
                            cursor:
                                "pointer",
                            fontSize:
                                "12px",
                            fontWeight:
                                850,
                            boxShadow:
                                "0 10px 28px rgba(53,224,165,.13)",
                        }}
                    >
                        {showForm ? (
                            <X size={16} />
                        ) : (
                            <Plus size={16} />
                        )}

                        {showForm
                            ? "Close form"
                            : "New savings goal"}
                    </button>
                </div>
            </section>


            {/* =================================================
                KPI CARDS
            ================================================= */}

            <div
                className="bb-savings-kpi-grid"
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(4,minmax(0,1fr))",
                    gap: "13px",
                    marginBottom: "22px",
                }}
            >
                <SavingsKPI
                    icon={
                        <Target
                            size={18}
                        />
                    }
                    label="TOTAL TARGET"
                    value={formatCurrency(
                        totalTarget
                    )}
                    color="#62D8E8"
                    description={`${goals.length} savings goal${
                        goals.length === 1
                            ? ""
                            : "s"
                    }`}
                />

                <SavingsKPI
                    icon={
                        <PiggyBank
                            size={18}
                        />
                    }
                    label="TOTAL SAVED"
                    value={formatCurrency(
                        totalSaved
                    )}
                    color="#35E0A5"
                    description={`${overallProgress.toFixed(
                        1
                    )}% of total target`}
                />

                <SavingsKPI
                    icon={
                        <CircleDollarSign
                            size={18}
                        />
                    }
                    label="REMAINING"
                    value={formatCurrency(
                        totalRemaining
                    )}
                    color="#A978FF"
                    description="Still to save"
                />

                <SavingsKPI
                    icon={
                        <Trophy
                            size={18}
                        />
                    }
                    label="COMPLETED"
                    value={
                        completedGoals
                    }
                    color="#F3C969"
                    description={
                        completedGoals ===
                        0
                            ? "Keep building momentum"
                            : "Goals successfully reached"
                    }
                />
            </div>


            {/* =================================================
                OVERALL PROGRESS
            ================================================= */}

            {goals.length > 0 && (
                <section
                    style={{
                        padding: "19px 20px",
                        marginBottom:
                            "25px",
                        borderRadius:
                            "15px",
                        background:
                            "#0D151C",
                        border:
                            "1px solid rgba(255,255,255,.07)",
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
                                "11px",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    color:
                                        "#7D8C87",
                                    fontSize:
                                        "10px",
                                    fontWeight:
                                        800,
                                    letterSpacing:
                                        "1px",
                                }}
                            >
                                OVERALL SAVINGS
                            </div>

                            <div
                                style={{
                                    marginTop:
                                        "5px",
                                    color:
                                        "#F2F6F4",
                                    fontSize:
                                        "14px",
                                    fontWeight:
                                        750,
                                }}
                            >
                                {formatCurrency(
                                    totalSaved
                                )}{" "}
                                <span
                                    style={{
                                        color:
                                            "#687771",
                                        fontWeight:
                                            500,
                                    }}
                                >
                                    of{" "}
                                    {formatCurrency(
                                        totalTarget
                                    )}
                                </span>
                            </div>
                        </div>

                        <div
                            style={{
                                color:
                                    overallProgress >=
                                    100
                                        ? "#35E0A5"
                                        : "#A978FF",
                                fontSize:
                                    "17px",
                                fontWeight:
                                    850,
                            }}
                        >
                            {overallProgress.toFixed(
                                1
                            )}
                            %
                        </div>
                    </div>

                    <div
                        style={{
                            height: "8px",
                            overflow:
                                "hidden",
                            borderRadius:
                                "999px",
                            background:
                                "#1A252E",
                        }}
                    >
                        <div
                            style={{
                                width:
                                    `${overallProgress}%`,
                                height:
                                    "100%",
                                borderRadius:
                                    "999px",
                                background:
                                    "linear-gradient(90deg,#A978FF,#35E0A5)",
                                transition:
                                    "width .65s ease",
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
                    ref={formSectionRef}
                    className="bb-savings-page-padding"
                    style={{
                        scrollMarginTop: "24px",
                        marginBottom:
                            "27px",
                        padding: "23px",
                        borderRadius:
                            "17px",
                        background:
                            "#0E161D",
                        border:
                            "1px solid rgba(255,255,255,.075)",
                        boxShadow:
                            "0 14px 40px rgba(0,0,0,.16)",
                    }}
                >
                    <div
                        style={{
                            display:
                                "flex",
                            alignItems:
                                "center",
                            gap: "11px",
                            marginBottom:
                                "21px",
                        }}
                    >
                        <div
                            style={{
                                width: "39px",
                                height: "39px",
                                display:
                                    "grid",
                                placeItems:
                                    "center",
                                borderRadius:
                                    "11px",
                                color:
                                    "#35E0A5",
                                background:
                                    "rgba(53,224,165,.07)",
                                border:
                                    "1px solid rgba(53,224,165,.12)",
                            }}
                        >
                            {editingGoal ? (
                                <Pencil
                                    size={17}
                                />
                            ) : (
                                <Plus
                                    size={17}
                                />
                            )}
                        </div>

                        <div>
                            <h2
                                style={{
                                    margin: 0,
                                    color:
                                        "#F2F6F4",
                                    fontSize:
                                        "17px",
                                    fontWeight:
                                        800,
                                }}
                            >
                                {editingGoal
                                    ? "Edit savings goal"
                                    : "Create savings goal"}
                            </h2>

                            <p
                                style={{
                                    margin:
                                        "4px 0 0",
                                    color:
                                        "#788680",
                                    fontSize:
                                        "12px",
                                }}
                            >
                                {editingGoal
                                    ? "Update your target and current progress."
                                    : "Define what you're saving for and when you want to reach it."}
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={
                            handleSubmit
                        }
                        noValidate
                    >
                        <div
                            className="bb-savings-form-grid"
                            style={{
                                display:
                                    "grid",
                                gridTemplateColumns:
                                    "repeat(2,minmax(0,1fr))",
                                gap: "17px",
                            }}
                        >
                            <Field label="GOAL NAME">
                                <input
                                    ref={goalNameInputRef}
                                    className="bb-savings-input"
                                    type="text"
                                    name="goal_name"
                                    placeholder="e.g. New Laptop"
                                    value={
                                        formData.goal_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    style={{
                                        width:
                                            "100%",
                                        height:
                                            "46px",
                                        boxSizing:
                                            "border-box",
                                        padding:
                                            "0 14px",
                                        borderRadius:
                                            "10px",
                                        border:
                                            "1px solid rgba(255,255,255,.08)",
                                        outline:
                                            "none",
                                        background:
                                            "#080E14",
                                        color:
                                            "#F0F5F3",
                                        fontSize:
                                            "13px",
                                        fontFamily:
                                            "inherit",
                                    }}
                                    required
                                />
                            </Field>

                            <Field label="TARGET AMOUNT">
                                <input
                                    className="bb-savings-input"
                                    type="number"
                                    name="target_amount"
                                    placeholder="e.g. 75000"
                                    min="0.01"
                                    step="0.01"
                                    value={
                                        formData.target_amount
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    style={{
                                        width:
                                            "100%",
                                        height:
                                            "46px",
                                        boxSizing:
                                            "border-box",
                                        padding:
                                            "0 14px",
                                        borderRadius:
                                            "10px",
                                        border:
                                            "1px solid rgba(255,255,255,.08)",
                                        outline:
                                            "none",
                                        background:
                                            "#080E14",
                                        color:
                                            "#F0F5F3",
                                        fontSize:
                                            "13px",
                                        fontFamily:
                                            "inherit",
                                    }}
                                    required
                                />
                            </Field>

                            <Field label="CURRENT SAVINGS">
                                <input
                                    className="bb-savings-input"
                                    type="number"
                                    name="saved_amount"
                                    placeholder="e.g. 15000"
                                    min="0"
                                    step="0.01"
                                    value={
                                        formData.saved_amount
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    style={{
                                        width:
                                            "100%",
                                        height:
                                            "46px",
                                        boxSizing:
                                            "border-box",
                                        padding:
                                            "0 14px",
                                        borderRadius:
                                            "10px",
                                        border:
                                            "1px solid rgba(255,255,255,.08)",
                                        outline:
                                            "none",
                                        background:
                                            "#080E14",
                                        color:
                                            "#F0F5F3",
                                        fontSize:
                                            "13px",
                                        fontFamily:
                                            "inherit",
                                    }}
                                    required
                                />
                            </Field>

                            <Field label="TARGET DATE">
                                <div
                                    style={{
                                        position:
                                            "relative",
                                    }}
                                >
                                    <CalendarDays
                                        size={15}
                                        color="#71807B"
                                        style={{
                                            position:
                                                "absolute",
                                            left:
                                                "14px",
                                            top:
                                                "15px",
                                            pointerEvents:
                                                "none",
                                        }}
                                    />

                                    <input
                                        className="bb-savings-input"
                                        type="date"
                                        name="target_date"
                                        value={
                                            formData.target_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        style={{
                                            width:
                                                "100%",
                                            height:
                                                "46px",
                                            boxSizing:
                                                "border-box",
                                            padding:
                                                "0 14px 0 39px",
                                            borderRadius:
                                                "10px",
                                            border:
                                                "1px solid rgba(255,255,255,.08)",
                                            outline:
                                                "none",
                                            background:
                                                "#080E14",
                                            color:
                                                "#F0F5F3",
                                            fontSize:
                                                "13px",
                                            fontFamily:
                                                "inherit",
                                        }}
                                        required
                                    />
                                </div>
                            </Field>
                        </div>

                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "flex-end",
                                gap: "9px",
                                marginTop:
                                    "19px",
                            }}
                        >
                            <button
                                type="button"
                                onClick={
                                    closeForm
                                }
                                disabled={
                                    saving
                                }
                                style={{
                                    height:
                                        "42px",
                                    padding:
                                        "0 17px",
                                    border:
                                        "1px solid rgba(255,255,255,.08)",
                                    borderRadius:
                                        "10px",
                                    background:
                                        "rgba(255,255,255,.025)",
                                    color:
                                        "#899691",
                                    cursor:
                                        saving
                                            ? "not-allowed"
                                            : "pointer",
                                    fontSize:
                                        "12px",
                                    fontWeight:
                                        700,
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    saving
                                }
                                style={{
                                    height:
                                        "42px",
                                    minWidth:
                                        "135px",
                                    padding:
                                        "0 18px",
                                    border: 0,
                                    borderRadius:
                                        "10px",
                                    background:
                                        saving
                                            ? "#35413D"
                                            : "linear-gradient(135deg,#35E0A5,#1EC8A1)",
                                    color:
                                        saving
                                            ? "#71807B"
                                            : "#03130E",
                                    cursor:
                                        saving
                                            ? "not-allowed"
                                            : "pointer",
                                    fontSize:
                                        "12px",
                                    fontWeight:
                                        850,
                                }}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingGoal
                                    ? "Update goal"
                                    : "Save goal"}
                            </button>
                        </div>
                    </form>
                </section>
            )}


            {/* =================================================
                PORTFOLIO HEADER
            ================================================= */}

            <section>
                <div
                    style={{
                        display:
                            "flex",
                        alignItems:
                            "flex-end",
                        justifyContent:
                            "space-between",
                        gap: "15px",
                        marginBottom:
                            "16px",
                        flexWrap:
                            "wrap",
                    }}
                >
                    <div>
                        <div
                            style={{
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap: "7px",
                                color:
                                    "#35E0A5",
                                fontSize:
                                    "10px",
                                fontWeight:
                                    850,
                                letterSpacing:
                                    "1.5px",
                                marginBottom:
                                    "6px",
                            }}
                        >
                            <WalletCards
                                size={12}
                            />
                            SAVINGS PORTFOLIO
                        </div>

                        <h2
                            style={{
                                margin: 0,
                                color:
                                    "#F3F7F5",
                                fontSize:
                                    "22px",
                                lineHeight:
                                    1.2,
                                fontWeight:
                                    800,
                                letterSpacing:
                                    "-.4px",
                            }}
                        >
                            What you're building
                            towards
                        </h2>

                        <p
                            style={{
                                margin:
                                    "5px 0 0",
                                color:
                                    "#74827E",
                                fontSize:
                                    "12px",
                            }}
                        >
                            Every goal is a step
                            toward greater
                            financial freedom.
                        </p>
                    </div>

                    <div
                        style={{
                            display:
                                "flex",
                            alignItems:
                                "center",
                            gap: "8px",
                            width:
                                "270px",
                            height:
                                "40px",
                            padding:
                                "0 12px",
                            boxSizing:
                                "border-box",
                            borderRadius:
                                "10px",
                            background:
                                "#0D151C",
                            border:
                                "1px solid rgba(255,255,255,.08)",
                        }}
                    >
                        <Search
                            size={15}
                            color="#697872"
                        />

                        <input
                            className="bb-savings-input"
                            type="text"
                            placeholder="Search savings goals..."
                            value={
                                searchTerm
                            }
                            onChange={(
                                event
                            ) =>
                                setSearchTerm(
                                    event
                                        .target
                                        .value
                                )
                            }
                            style={{
                                width:
                                    "100%",
                                border: 0,
                                outline: 0,
                                background:
                                    "transparent",
                                color:
                                    "#EDF3F1",
                                fontSize:
                                    "12px",
                                fontFamily:
                                    "inherit",
                            }}
                        />
                    </div>
                </div>


                {/* =================================================
                    GOAL CONTAINERS
                ================================================= */}

                {loading ? (
                    <div
                        style={{
                            minHeight:
                                "300px",
                            display:
                                "grid",
                            placeItems:
                                "center",
                            borderRadius:
                                "18px",
                            background:
                                "#0D151C",
                            border:
                                "1px solid rgba(255,255,255,.07)",
                            color:
                                "#788680",
                            fontSize:
                                "13px",
                        }}
                    >
                        Loading your savings goals...
                    </div>
                ) : filteredGoals.length ===
                  0 ? (
                    <div
                        style={{
                            minHeight:
                                "300px",
                            display:
                                "grid",
                            placeItems:
                                "center",
                            textAlign:
                                "center",
                            padding:
                                "30px",
                            borderRadius:
                                "18px",
                            background:
                                "#0D151C",
                            border:
                                "1px solid rgba(255,255,255,.07)",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    width:
                                        "58px",
                                    height:
                                        "58px",
                                    margin:
                                        "0 auto",
                                    display:
                                        "grid",
                                    placeItems:
                                        "center",
                                    borderRadius:
                                        "16px",
                                    background:
                                        "rgba(53,224,165,.07)",
                                    color:
                                        "#35E0A5",
                                    border:
                                        "1px solid rgba(53,224,165,.11)",
                                }}
                            >
                                <PiggyBank
                                    size={25}
                                />
                            </div>

                            <h3
                                style={{
                                    margin:
                                        "15px 0 0",
                                    color:
                                        "#EAF0EE",
                                    fontSize:
                                        "16px",
                                    fontWeight:
                                        750,
                                }}
                            >
                                No savings goals found
                            </h3>

                            <p
                                style={{
                                    margin:
                                        "6px 0 0",
                                    color:
                                        "#71807B",
                                    fontSize:
                                        "12px",
                                }}
                            >
                                Create your first
                                goal and start
                                turning plans into
                                progress.
                            </p>

                            <button
                                type="button"
                                onClick={
                                    openCreateForm
                                }
                                style={{
                                    marginTop:
                                        "17px",
                                    height:
                                        "40px",
                                    padding:
                                        "0 16px",
                                    border: 0,
                                    borderRadius:
                                        "10px",
                                    background:
                                        "#35E0A5",
                                    color:
                                        "#03130E",
                                    cursor:
                                        "pointer",
                                    fontSize:
                                        "12px",
                                    fontWeight:
                                        850,
                                }}
                            >
                                <Plus
                                    size={14}
                                    style={{
                                        verticalAlign:
                                            "middle",
                                        marginRight:
                                            "5px",
                                    }}
                                />
                                Create goal
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="bb-goals-grid"
                        style={{
                            display:
                                "grid",
                            gridTemplateColumns:
                                "repeat(2,minmax(0,1fr))",
                            gap: "16px",
                        }}
                    >
                        {filteredGoals.map(
                            (goal) => (
                                <GoalCard
                                    key={
                                        goal.id
                                    }
                                    goal={
                                        goal
                                    }
                                    onEdit={
                                        handleEdit
                                    }
                                    onDelete={
                                        handleDelete
                                    }
                                    onAddMoney={
                                        openAddMoney
                                    }
                                />
                            )
                        )}
                    </div>
                )}
            </section>


            {/* =================================================
                DELETE CONFIRMATION
            ================================================= */}

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
                        zIndex: 3200,
                        display: "grid",
                        placeItems: "center",
                        padding: "24px",
                        background:
                            "rgba(2,6,12,.72)",
                        backdropFilter:
                            "blur(9px)",
                        WebkitBackdropFilter:
                            "blur(9px)",
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="bb-delete-goal-title"
                        aria-describedby="bb-delete-goal-description"
                        style={{
                            width: "min(430px,100%)",
                            padding: "26px",
                            boxSizing: "border-box",
                            borderRadius: "19px",
                            background:
                                "linear-gradient(145deg,#111923,#0B1219)",
                            border:
                                "1px solid rgba(255,255,255,.09)",
                            boxShadow:
                                "0 30px 90px rgba(0,0,0,.55)",
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
                                color: "#FF747C",
                                background:
                                    "rgba(255,116,124,.08)",
                                border:
                                    "1px solid rgba(255,116,124,.16)",
                            }}
                        >
                            <Trash2 size={19} />
                        </div>

                        <h2
                            id="bb-delete-goal-title"
                            style={{
                                margin: 0,
                                color: "#F5F8F7",
                                fontSize: "19px",
                                lineHeight: 1.25,
                                fontWeight: 850,
                                letterSpacing: "-.3px",
                            }}
                        >
                            Delete this savings goal?
                        </h2>

                        <p
                            id="bb-delete-goal-description"
                            style={{
                                margin:
                                    "9px 0 0",
                                color: "#899792",
                                fontSize: "12px",
                                lineHeight: 1.6,
                            }}
                        >
                            {selectedGoal?.goal_name
                                ? `"${selectedGoal.goal_name}" will be permanently removed from your savings portfolio.`
                                : "This savings goal will be permanently removed from your savings portfolio."}
                        </p>

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "flex-end",
                                gap: "9px",
                                marginTop: "23px",
                                paddingTop: "17px",
                                borderTop:
                                    "1px solid rgba(255,255,255,.07)",
                            }}
                        >
                            <button
                                type="button"
                                onClick={
                                    closeDeleteDialog
                                }
                                style={{
                                    height: "41px",
                                    padding:
                                        "0 16px",
                                    border:
                                        "1px solid rgba(255,255,255,.09)",
                                    borderRadius:
                                        "10px",
                                    background:
                                        "rgba(255,255,255,.025)",
                                    color: "#9AA6A2",
                                    cursor: "pointer",
                                    fontFamily:
                                        "inherit",
                                    fontSize:
                                        "12px",
                                    fontWeight:
                                        700,
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={
                                    confirmDelete
                                }
                                style={{
                                    height: "41px",
                                    padding:
                                        "0 16px",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    gap: "7px",
                                    border:
                                        "1px solid rgba(255,116,124,.22)",
                                    borderRadius:
                                        "10px",
                                    background:
                                        "linear-gradient(135deg,#D85F68,#B74750)",
                                    color:
                                        "#FFF5F5",
                                    cursor:
                                        "pointer",
                                    fontFamily:
                                        "inherit",
                                    fontSize:
                                        "12px",
                                    fontWeight:
                                        850,
                                    boxShadow:
                                        "0 9px 25px rgba(255,116,124,.12)",
                                }}
                            >
                                <Trash2 size={14} />
                                Delete Goal
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* =================================================
                LIGHT THEME SUPPORT FOR NEW SURFACES
            ================================================= */}

            <style>
                {`
                    @media (prefers-color-scheme: light) {
                        [role="dialog"] {
                            background:
                                linear-gradient(145deg,#FFFFFF,#F7F9FA) !important;
                            border-color:
                                rgba(15,23,42,.10) !important;
                            box-shadow:
                                0 30px 90px rgba(15,23,42,.20) !important;
                        }

                        [role="dialog"] h2 {
                            color: #172033 !important;
                        }

                        [role="dialog"] p {
                            color: #64748B !important;
                        }

                        [role="dialog"] button[type="button"]:first-of-type {
                            background: #F8FAFC !important;
                            border-color: rgba(15,23,42,.10) !important;
                            color: #475569 !important;
                        }
                    }
                `}
            </style>
        </main>
    );
}