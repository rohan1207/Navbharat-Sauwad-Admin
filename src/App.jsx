import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import MobileMessage from "./components/MobileMessage";

// Admin imports
import Login from "./pages/Login";
import Layout from "./Layout";
import RequireAuth from "./RequireAuth";
import Dashboard from "./pages/Dashboard";
import ArticlesList from "./pages/ArticlesList";
import ArticleForm from "./pages/ArticleForm";
import CategoriesManagement from "./pages/CategoriesManagement";
import AuthorsManagement from "./pages/AuthorsManagement";
import MediaLibrary from "./pages/MediaLibrary";
import EPaperManagement2 from "./pages/EPaperManagement2";
import AdManagement from "./pages/AdManagement";
import PhotoOfTheDayManagement from "./pages/PhotoOfTheDayManagement";
import ShortsManagement from "./pages/ShortsManagement";
import SubscribersList from "./pages/SubscribersList";
import Settings from "./pages/Settings";

const App = () => {
  return (
    <AuthProvider>
      <WebSocketProvider>
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
              <Route path="articles" element={<ArticlesList />} />
              <Route path="articles/create" element={<ArticleForm />} />
              <Route path="articles/edit/:id" element={<ArticleForm />} />
              <Route path="categories" element={<CategoriesManagement />} />
              <Route path="authors" element={<AuthorsManagement />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="epaper2" element={<EPaperManagement2 />} />
              <Route path="ads" element={<AdManagement />} />
              <Route path="photo-of-the-day" element={<PhotoOfTheDayManagement />} />
              <Route path="shorts" element={<ShortsManagement />} />
              <Route path="subscribers" element={<SubscribersList />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch all other routes */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </React.Suspense>
      </WebSocketProvider>
    </AuthProvider>
  );
};

export default App;
