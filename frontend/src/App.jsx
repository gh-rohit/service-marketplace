// frontend/src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './layouts/Layout'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard'
import CustomerRequests from './pages/customer/Requests'
import CustomerProfile from './pages/customer/Profile'

// Provider Pages
import ProviderDashboard from './pages/provider/Dashboard'
import ProviderRequests from './pages/provider/Requests'
import ProviderProfile from './pages/provider/Profile'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminProviders from './pages/admin/Providers'
import AdminAllRequests from './pages/admin/AllRequests'

// Private Route Component
const PrivateRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />
  }

  return children
}

// Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
)

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes with Layout */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              {/* Customer Routes */}
              <Route path="/customer/dashboard" element={
                <PrivateRoute role="customer">
                  <CustomerDashboard />
                </PrivateRoute>
              } />
              
              <Route path="/customer/requests" element={
                <PrivateRoute role="customer">
                  <CustomerRequests />
                </PrivateRoute>
              } />
              
              <Route path="/customer/profile" element={
                <PrivateRoute role="customer">
                  <CustomerProfile />
                </PrivateRoute>
              } />
              
              {/* Provider Routes */}
              <Route path="/provider/dashboard" element={
                <PrivateRoute role="provider">
                  <ProviderDashboard />
                </PrivateRoute>
              } />
              
              <Route path="/provider/requests" element={
                <PrivateRoute role="provider">
                  <ProviderRequests />
                </PrivateRoute>
              } />
              
              <Route path="/provider/profile" element={
                <PrivateRoute role="provider">
                  <ProviderProfile />
                </PrivateRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              } />
              
              <Route path="/admin/users" element={
                <PrivateRoute role="admin">
                  <AdminUsers />
                </PrivateRoute>
              } />
              
              <Route path="/admin/providers" element={
                <PrivateRoute role="admin">
                  <AdminProviders />
                </PrivateRoute>
              } />
              
              <Route path="/admin/requests" element={
                <PrivateRoute role="admin">
                  <AdminAllRequests />
                </PrivateRoute>
              } />
              
              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* 404 Page */}
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-6">Page not found</p>
                  <a href="/" className="btn-primary">
                    Go to Dashboard
                  </a>
                </div>
              } />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  )
}

export default App