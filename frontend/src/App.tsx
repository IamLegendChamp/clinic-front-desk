import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppTheme } from "./theme";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { QueuePage } from "./pages/QueuePage";
import { AppointmentsPage } from "./pages/AppointmentsPage";

import "./App.css";

const App = () => (
    <AppTheme>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path='/login' element={<LoginPage  />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/queue" element={<QueuePage />} />
                        <Route path="/appointments" element={<AppointmentsPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </AppTheme>
);

export default App;
