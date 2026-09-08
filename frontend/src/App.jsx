import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";

import AppRoutes from "./routes/AppRoutes";


export default function App() {

    return (
        <ThemeProvider>

            <NotificationProvider>

                <AppRoutes />

            </NotificationProvider>

        </ThemeProvider>
    );
}