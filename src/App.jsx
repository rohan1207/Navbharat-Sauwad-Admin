import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MobileMessage from "./components/MobileMessage";

// Admin imports
import Login from "./pages/Login";
import Layout from "./Layout";
import RequireAuth from "./RequireAuth";
import Dashboard from "./pages/Dashboard";
import EPaperManagement from "./pages/EPaperManagement";

const App = () => {
  return (
    <AuthProvider>
        <MobileMessage />
        <React.Suspense
          fallback={<div className="p-6 text-center">Loading admin...</div>}
        >
          <Routes>
            {/* Redirect root to admin */}
            <Route path="/" element={<Navigate to="/admin" replace />} />

            {/* Admin auth */}
            <Route path="/admin/login" element={<Login />} />

            {/* Admin protected routes */}
            <Route
              path="/admin/*"
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="epaper" element={<EPaperManagement />} />
            </Route>

            {/* Catch all other routes */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </React.Suspense>
    </AuthProvider>
  );
};

export default App;
