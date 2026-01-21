// frontend/src/pages/auth/Login.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  UserPlus,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (error) {
      dispatch(clearError())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearError())
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }
    
    const result = await dispatch(login(formData))
    
    if (result.meta.requestStatus === 'fulfilled') {
      const user = JSON.parse(localStorage.getItem('user'))
      toast.success(
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="font-semibold">Login successful! Welcome back {user?.name}!</span>
        </div>,
        {
          duration: 3000,
          icon: '🎉'
        }
      )
      navigate(`/${user.role}/dashboard`)
    } else {
      toast.error(
        error || 'Login failed. Please check your credentials.',
        {
          duration: 4000,
          style: {
            background: '#EF4444',
            color: 'white'
          }
        }
      )
    }
  }

  const handleDemoLogin = (type) => {
    let demoCredentials = {}
    
    switch(type) {
      case 'admin':
        demoCredentials = { email: 'admin@service.com', password: 'admin123' }
        break
      case 'customer':
        demoCredentials = { email: 'customer@test.com', password: 'test123' }
        break
      case 'provider':
        demoCredentials = { email: 'provider@test.com', password: 'test123' }
        break
      default:
        return
    }
    
    setFormData(demoCredentials)
    toast.info(`Demo ${type} credentials loaded`, {
      icon: '👆',
      duration: 2000
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Column - Brand & Info */}
          <div className="text-center lg:text-left">
            <div className="mb-8">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-xl">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    Service<span className="text-blue-600">Hub</span>
                  </h1>
                  <p className="text-gray-600 mt-1">Professional Services Platform</p>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Connect with Trusted Professionals
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Login to access your personalized dashboard. Whether you're looking for services or providing them, we've got you covered.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">1000+ Verified Service Providers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">Secure & Encrypted Platform</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-gray-700 font-medium">Instant Booking & Real-time Tracking</span>
              </div>
            </div>

            {/* Demo Accounts */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="h-5 w-5 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-800">✨</span>
                Quick Demo Access
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => handleDemoLogin('admin')}
                  className="px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg hover:from-red-100 hover:to-red-200 transition-all duration-200"
                >
                  <div className="font-bold text-red-700 text-sm">Admin</div>
                  <div className="text-xs text-red-600 mt-1">admin@service.com</div>
                </button>
                <button
                  onClick={() => handleDemoLogin('customer')}
                  className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200"
                >
                  <div className="font-bold text-blue-700 text-sm">Customer</div>
                  <div className="text-xs text-blue-600 mt-1">customer@test.com</div>
                </button>
                <button
                  onClick={() => handleDemoLogin('provider')}
                  className="px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200"
                >
                  <div className="font-bold text-green-700 text-sm">Provider</div>
                  <div className="text-xs text-green-600 mt-1">provider@test.com</div>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Click any button to auto-fill credentials. Password: test123
              </p>
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div className="max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <Card className="shadow-2xl border-0 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Welcome Back! 👋</h2>
                    <p className="text-blue-100 mt-1">Sign in to access your account</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <LogIn className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">Secure Login</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">24/7 Access</span>
                </div>
              </div>

              {/* Form */}
              <Card.Content className="p-8">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-red-600 font-bold">!</span>
                      </div>
                      <div>
                        <p className="font-semibold text-red-800">Login Error</p>
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        Email Address
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900"
                        required
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <span className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-gray-500" />
                        Password
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900"
                        required
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={() => setRememberMe(!rememberMe)}
                          className="h-5 w-5 rounded border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        />
                        {rememberMe && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <span className="text-gray-700 font-medium select-none">Remember me</span>
                    </label>
                    
                    <Link
                      to="/forgot-password"
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Sign In
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="my-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 bg-white text-sm text-gray-500 font-medium">
                        New to ServiceHub?
                      </span>
                    </div>
                  </div>
                </div>

                {/* Register Button */}
                <Link to="/register">
                  <Button
                    variant="outline"
                    className="w-full py-3 border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 font-semibold"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create New Account
                  </Button>
                </Link>
              </Card.Content>

              {/* Footer */}
              <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
                <p className="text-center text-xs text-gray-600">
                  By signing in, you agree to our{' '}
                  <Link to="/terms" className="text-blue-600 hover:underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </p>
                <p className="text-center text-xs text-gray-500 mt-2">
                  Need help?{' '}
                  <Link to="/contact" className="text-blue-600 hover:underline font-medium">
                    Contact Support
                  </Link>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login