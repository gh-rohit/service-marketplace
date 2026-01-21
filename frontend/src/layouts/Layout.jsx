// frontend/src/layouts/Layout.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { 
  Menu, 
  X, 
  Home, 
  User, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Users,
  Wrench,
  BarChart
} from 'lucide-react'
import Button from '../components/ui/Button'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const customerMenu = [
    { name: 'Dashboard', icon: Home, path: '/customer/dashboard' },
    { name: 'Find Providers', icon: Search, path: '/customer/providers' },
    { name: 'My Requests', icon: Users, path: '/customer/requests' },
    { name: 'Profile', icon: User, path: '/customer/profile' },
  ]

  const providerMenu = [
    { name: 'Dashboard', icon: Home, path: '/provider/dashboard' },
    { name: 'Service Requests', icon: Bell, path: '/provider/requests' },
    { name: 'My Profile', icon: User, path: '/provider/profile' },
    { name: 'Earnings', icon: BarChart, path: '/provider/earnings' },
  ]

  const adminMenu = [
    { name: 'Dashboard', icon: Home, path: '/admin/dashboard' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Providers', icon: Wrench, path: '/admin/providers' },
    { name: 'Requests', icon: Bell, path: '/admin/requests' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ]

  const getMenuItems = () => {
    if (!user) return []
    switch (user.role) {
      case 'customer': return customerMenu
      case 'provider': return providerMenu
      case 'admin': return adminMenu
      default: return []
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <div className="flex items-center">
                <Wrench className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900">
                  ServiceHub
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="hidden md:flex items-center space-x-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-gray-500 capitalize">{user.role}</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="small"
                    onClick={handleLogout}
                    className="flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate('/login')}>
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar for desktop */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white pt-16">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="flex-1 px-4 space-y-1">
                {getMenuItems().map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition duration-150"
                    >
                      <Icon className="mr-3 h-5 w-5 text-gray-500 group-hover:text-gray-700" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-0 flex z-40">
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <nav className="px-4 space-y-1">
                    {getMenuItems().map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          className="group flex items-center px-3 py-2 text-base font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Icon className="mr-4 h-6 w-6 text-gray-500 group-hover:text-gray-700" />
                          {item.name}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-gray-500">
                © {new Date().getFullYear()} ServiceHub - Local Services Marketplace. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default Layout