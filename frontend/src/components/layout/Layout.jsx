import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#07090d",
            }}
        >
            <Sidebar />

            <main className="app-main">
                <Topbar />

                <div className="app-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}