import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pacer from './pages/Pacer';
import History from './pages/History';
import Recovery from './pages/Recovery';
import PublicView from './pages/PublicView';
import Pricing from './pages/Pricing';
import AdminPanel from './pages/AdminPanel';
import PaceCalculator from './pages/PaceCalculator';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    return user ? children : <Navigate to="/" />;
};

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

    // Check for both user existence and role
    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/pacer" element={<ProtectedRoute><Pacer /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/recovery" element={<ProtectedRoute><Recovery /></ProtectedRoute>} />
            <Route path="/share/:token" element={<PublicView />} />
            <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
            <Route path="/pace-calculator" element={<ProtectedRoute><PaceCalculator /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
