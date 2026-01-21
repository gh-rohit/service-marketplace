// frontend/src/pages/auth/Register.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register, clearError } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'
import { 
  UserPlus, 
  MapPin, 
  Briefcase, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Home, 
  Map, 
  Award, 
  DollarSign,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Star,
  Shield,
  Check,
  Users,
  Clock,
  Award as AwardIcon
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    profession: '',
    experience: '',
    hourlyRate: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
  })
  
  const [step, setStep] = useState(1)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    setStep(step - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) {
          toast.error('Please enter your full name')
          return false
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          toast.error('Please enter a valid email address')
          return false
        }
        if (!formData.password || formData.password.length < 6) {
          toast.error('Password must be at least 6 characters')
          return false
        }
        if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) {
          toast.error('Please enter a valid 10-digit phone number')
          return false
        }
        return true
      case 2:
        if (!formData.address.street.trim()) {
          toast.error('Please enter street address')
          return false
        }
        if (!formData.address.city.trim()) {
          toast.error('Please enter city')
          return false
        }
        if (!formData.address.state.trim()) {
          toast.error('Please enter state')
          return false
        }
        if (!formData.address.pincode.trim() || !/^\d{6}$/.test(formData.address.pincode)) {
          toast.error('Please enter a valid 6-digit pincode')
          return false
        }
        return true
      case 3:
        if (formData.role === 'provider') {
          if (!formData.profession.trim()) {
            toast.error('Please select your profession')
            return false
          }
          if (!formData.experience || parseInt(formData.experience) < 0) {
            toast.error('Please enter valid experience in years')
            return false
          }
          if (!formData.hourlyRate || parseInt(formData.hourlyRate) <= 0) {
            toast.error('Please enter valid hourly rate')
            return false
          }
          if (!formData.description.trim() || formData.description.length < 20) {
            toast.error('Please write a description of at least 20 characters')
            return false
          }
        }
        return true
      default:
        return true
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearError())
    
    if (!validateStep(step)) return
    
    const result = await dispatch(register(formData))
    
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('🎉 Account created successfully! Redirecting to dashboard...')
      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('user'))
        navigate(`/${user.role}/dashboard`)
      }, 1500)
    } else {
      toast.error(error || 'Registration failed. Please check your details and try again.')
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create Your Account
              </h2>
              <p className="text-gray-700">Fill in your basic information to get started</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="h-12 pl-10 text-base"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="h-12 pl-10 text-base"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="h-12 pl-10 text-base"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600">At least 6 characters</p>
              </div>
              
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter 10-digit number"
                    className="h-12 pl-10 text-base"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                What describes you best?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'customer' })}
                  className={`p-5 border-2 rounded-xl transition-all duration-200 ${
                    formData.role === 'customer'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-300 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-3 ${
                      formData.role === 'customer' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <User className={`h-6 w-6 ${
                        formData.role === 'customer' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">Customer</h4>
                    <p className="text-sm text-gray-700 mb-3">I want to book services</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center">
                        <Check className={`h-4 w-4 mr-1 ${
                          formData.role === 'customer' ? 'text-green-500' : 'text-gray-400'
                        }`} />
                        <span className="text-xs text-gray-600">Book instantly</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <Check className={`h-4 w-4 mr-1 ${
                          formData.role === 'customer' ? 'text-green-500' : 'text-gray-400'
                        }`} />
                        <span className="text-xs text-gray-600">Track requests</span>
                      </div>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'provider' })}
                  className={`p-5 border-2 rounded-xl transition-all duration-200 ${
                    formData.role === 'provider'
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-300 hover:border-green-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-3 ${
                      formData.role === 'provider' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Briefcase className={`h-6 w-6 ${
                        formData.role === 'provider' ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">Service Provider</h4>
                    <p className="text-sm text-gray-700 mb-3">I want to offer services</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center">
                        <Check className={`h-4 w-4 mr-1 ${
                          formData.role === 'provider' ? 'text-green-500' : 'text-gray-400'
                        }`} />
                        <span className="text-xs text-gray-600">Earn money</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <Check className={`h-4 w-4 mr-1 ${
                          formData.role === 'provider' ? 'text-green-500' : 'text-gray-400'
                        }`} />
                        <span className="text-xs text-gray-600">Flexible schedule</span>
                      </div>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  className={`p-5 border-2 rounded-xl transition-all duration-200 ${
                    formData.role === 'admin'
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-300 hover:border-purple-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-3 ${
                      formData.role === 'admin' ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      <Shield className={`h-6 w-6 ${
                        formData.role === 'admin' ? 'text-purple-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">Admin</h4>
                    <p className="text-sm text-gray-700 mb-3">Manage the platform</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center">
                        <Check className={`h-4 w-4 mr-1 ${
                          formData.role === 'admin' ? 'text-green-500' : 'text-gray-400'
                        }`} />
                        <span className="text-xs text-gray-600">Manage users</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <Check className={`h-4 w-4 mr-1 ${
                          formData.role === 'admin' ? 'text-green-500' : 'text-gray-400'
                        }`} />
                        <span className="text-xs text-gray-600">Oversee operations</span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-4">
                <MapPin className="h-8 w-8 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Where are you located?
              </h2>
              <p className="text-gray-700">We'll use this to connect you with nearby services</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  Street Address
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="House no, Building, Street"
                    className="h-12 pl-10 text-base"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2">
                    City
                  </label>
                  <div className="relative">
                    <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      placeholder="Enter your city"
                      className="h-12 pl-10 text-base"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2">
                    State
                  </label>
                  <Input
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    placeholder="Enter your state"
                    className="h-12 text-base"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  Pincode
                </label>
                <Input
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  placeholder="Enter 6-digit pincode"
                  className="h-12 text-base"
                  required
                />
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex">
                <MapPin className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-800 mb-1">Why we need your location?</h4>
                  <p className="text-sm text-blue-700">
                    Your address helps us match you with service providers in your area. 
                    This ensures faster service delivery and better availability.
                    Your location information is kept secure and private.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 3:
        if (formData.role !== 'provider') {
          return (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Complete Registration!
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Review your information and click "Create Account" to finish
              </p>
              <div className="bg-gray-50 p-6 rounded-lg text-left max-w-md mx-auto">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="text-gray-900">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="text-gray-900">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Account Type:</span>
                    <span className="text-gray-900 capitalize">{formData.role}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        }
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <Briefcase className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Professional Details
              </h2>
              <p className="text-gray-700">Tell us about your professional background</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  Profession
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="w-full h-12 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white text-base"
                    required
                  >
                    <option value="">-- Select Your Profession --</option>
                    <option value="plumber">👨‍🔧 Plumber</option>
                    <option value="electrician">🔌 Electrician</option>
                    <option value="carpenter">🪚 Carpenter</option>
                    <option value="painter">🎨 Painter</option>
                    <option value="mechanic">🔧 Mechanic</option>
                    <option value="cleaner">🧹 Cleaner</option>
                    <option value="other">✨ Other Service</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2">
                    Years of Experience
                  </label>
                  <div className="relative">
                    <AwardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="Enter years of experience"
                      className="h-12 pl-10 text-base"
                      min="0"
                      max="50"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2">
                    Hourly Rate (₹)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="number"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      placeholder="Enter your hourly rate"
                      className="h-12 pl-10 text-base"
                      min="100"
                      max="10000"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  Professional Bio
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-base"
                  placeholder="Describe your skills, experience, and what services you offer. This helps customers understand your expertise."
                  required
                />
                <p className="mt-2 text-sm text-gray-600">
                  Minimum 20 characters. Current: {formData.description.length}
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex">
                <Star className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-green-800 mb-1">Tips for a great profile:</h4>
                  <ul className="text-sm text-green-700 list-disc pl-5 space-y-1">
                    <li>Mention your certifications and qualifications</li>
                    <li>Include specific services you specialize in</li>
                    <li>Add your availability and service areas</li>
                    <li>Highlight what makes your service unique</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  const getStepProgress = () => {
    const totalSteps = formData.role === 'provider' ? 3 : 2
    return ((step - 1) / (totalSteps - 1)) * 100
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Join <span className="text-blue-600">ServiceHub</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
            Connect with trusted professionals or start your service business today
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Progress & Info */}
          <div className="lg:w-1/3">
            <Card className="sticky top-8">
              <Card.Content>
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Step {step} of {formData.role === 'provider' ? 3 : 2}
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {Math.round(getStepProgress())}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${getStepProgress()}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-white border border-blue-200 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">50,000+ Members</h3>
                      <p className="text-sm text-gray-600">Join our growing community</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-white border border-green-200 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">100% Verified</h3>
                      <p className="text-sm text-gray-600">All providers are background checked</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-3 bg-orange-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-white border border-orange-200 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Quick Setup</h3>
                      <p className="text-sm text-gray-600">Get started in 5 minutes</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-3">What you'll get:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-gray-700">Access to all features</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-gray-700">24/7 customer support</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-gray-700">Secure payment options</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-gray-700">Free account for 30 days</span>
                    </li>
                  </ul>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Right Side - Form */}
          <div className="lg:w-2/3">
            <Card className="shadow-lg">
              <Card.Content>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {renderStep()}

                <div className="mt-10 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      {step > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="px-6 py-3"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <p className="text-gray-700">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
                          Sign In
                        </Link>
                      </p>
                      
                      {step < (formData.role === 'provider' ? 3 : 2) ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
                        >
                          Continue
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          onClick={handleSubmit}
                          loading={loading}
                          className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                          {loading ? (
                            'Creating Account...'
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Create Account
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    By creating an account, you agree to our{' '}
                    <a href="#" className="font-bold text-blue-600 hover:text-blue-700">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="font-bold text-blue-600 hover:text-blue-700">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-600">
            <span className="flex items-center">
              <Shield className="h-4 w-4 text-green-500 mr-1" />
              Secure & Encrypted
            </span>
            <span>•</span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 text-blue-500 mr-1" />
              24/7 Support
            </span>
            <span>•</span>
            <span className="flex items-center">
              <Users className="h-4 w-4 text-orange-500 mr-1" />
              Trusted by Thousands
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register