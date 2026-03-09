import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";

import "./App.css";

function App() {
  
  
  return (
    <AuthProvider>
        <BrowserRouter>
            <Routes>
                <Route path='/login' element={<LoginPage  />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<DashboardPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    </AuthProvider>
  )
}

export default App;
