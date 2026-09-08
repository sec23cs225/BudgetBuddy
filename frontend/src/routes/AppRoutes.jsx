import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";

import Dashboard from "../pages/Dashboard";
import Expenses from "../pages/Expenses";
import Income from "../pages/Income";
import Budgets from "../pages/Budgets";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Savings from "../pages/Savings";
import Notification from "../pages/Notification";

import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/layout/Layout";
import Insights from "../pages/Insights";
import Analytics from "../pages/Analytics";


export default function AppRoutes() {
    return (
        <Routes>

            {/* =====================================================
                PUBLIC PAGES
            ===================================================== */}

            <Route
                path="/"
                element={<Home />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />


            {/* =====================================================
                PROTECTED APPLICATION
            ===================================================== */}

            <Route
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/income"
                    element={<Income />}
                />

                <Route
                    path="/expenses"
                    element={<Expenses />}
                />

                <Route
                    path="/budgets"
                    element={<Budgets />}
                />

                <Route
                    path="/savings"
                    element={<Savings />}
                />

                <Route
                    path="/reports"
                    element={<Reports />}
                />
                
                <Route
                    path="/insights"
                    element={<Insights />}
                />

                <Route
                    path="/analytics"
                    element={<Analytics />}
                />
                
                <Route
                    path="/notifications"
                    element={<Notification />}
                />

                <Route
                    path="/settings"
                    element={<Settings />}
                />

            </Route>


            {/* =====================================================
                FALLBACK
                Prevents blank / undefined pages.
            ===================================================== */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />

        </Routes>
    );
}