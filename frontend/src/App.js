import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ItemsPage from './pages/ItemsPage';
import ItemDetailPage from './pages/ItemDetailPage';
import ReportItemPage from './pages/ReportItemPage';
import MyItemsPage from './pages/MyItemsPage';
import ClaimsPage from './pages/ClaimsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector(s => s.auth);
  return user ? children : <Navigate to="/auth" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useSelector(s => s.auth);
  return user && user.role === 'admin' ? children : <Navigate to="/" replace />;
};

export default function App() {
  const { user } = useSelector(s => s.auth);
  return (
    <div className="app">
      {user && <Navbar />}
      <main className={user ? 'main-with-nav' : 'main-full'}>
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/items" element={<ProtectedRoute><ItemsPage /></ProtectedRoute>} />
          <Route path="/items/:id" element={<ProtectedRoute><ItemDetailPage /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><ReportItemPage /></ProtectedRoute>} />
          <Route path="/my-items" element={<ProtectedRoute><MyItemsPage /></ProtectedRoute>} />
          <Route path="/claims" element={<ProtectedRoute><ClaimsPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
