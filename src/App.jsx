import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ReportsProvider } from './context/ReportsContext'
import { ToastProvider } from './context/ToastContext'
import Header from './components/Header/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ReportIssue from './pages/ReportIssue'
import SOS from './pages/SOS'
import Community from './pages/Community'
import AdminDashboard from './pages/AdminDashboard'
import PoliceAdmin from './pages/PoliceAdmin'
import AmbulanceAdmin from './pages/AmbulanceAdmin'
import FireAdmin from './pages/FireAdmin'
import UserProfile from './pages/UserProfile'

// Protected Route wrapper for authenticated users
function ProtectedRoute({ children, adminOnly = false }) {
    const { isAuthenticated, isAdmin, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />
    }

    return children
}

// Redirect authenticated users away from auth pages
function AuthRoute({ children }) {
    const { isAuthenticated, isAdmin, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
            </div>
        )
    }

    if (isAuthenticated) {
        return <Navigate to={isAdmin ? "/admin" : "/"} replace />
    }

    return children
}

function AppContent() {
    const { isAdmin, user } = useAuth()
    const userId = user?.id

    return (
        <div className="app">
            <Header />
            <main className="main-content">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/community" element={<Community />} />

                    {/* Auth Routes - redirect if logged in */}
                    <Route path="/login" element={
                        <AuthRoute><Login /></AuthRoute>
                    } />
                    <Route path="/register" element={
                        <AuthRoute><Register /></AuthRoute>
                    } />

                    {/* SOS - available to all but more features when logged in */}
                    <Route path="/sos" element={<SOS userId={userId} />} />

                    {/* Protected Routes - requires login */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute><Dashboard /></ProtectedRoute>
                    } />
                    <Route path="/report" element={
                        <ProtectedRoute><ReportIssue userId={userId} /></ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute><UserProfile /></ProtectedRoute>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
                    } />
                    <Route path="/admin/police" element={
                        <ProtectedRoute adminOnly><PoliceAdmin /></ProtectedRoute>
                    } />
                    <Route path="/admin/ambulance" element={
                        <ProtectedRoute adminOnly><AmbulanceAdmin /></ProtectedRoute>
                    } />
                    <Route path="/admin/fire" element={
                        <ProtectedRoute adminOnly><FireAdmin /></ProtectedRoute>
                    } />
                    <Route path="/admin/report/:id" element={
                        <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
                    } />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    )
}

function App() {
    return (
        <AuthProvider>
            <ReportsProvider>
                <ToastProvider>
                    <AppContent />
                </ToastProvider>
            </ReportsProvider>
        </AuthProvider>
    )
}

export default App
