// frontend/src/pages/customer/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { providersAPI, servicesAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { 
  Search, 
  Star, 
  MapPin, 
  Clock, 
  Briefcase,
  CheckCircle,
  Heart,
  Users,
  Shield,
  Award,
  Calendar,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const CustomerDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestData, setRequestData] = useState({
    description: '',
    scheduledDate: '',
    address: '',
    estimatedHours: 1
  })
  const [favorites, setFavorites] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [professionFilter, setProfessionFilter] = useState('')

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      setLoading(true)
      const response = await providersAPI.getApproved({})
      setProviders(response.data.providers || [])
    } catch (error) {
      toast.error('Failed to load service providers')
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (providerId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(providerId)) {
        newFavorites.delete(providerId)
        toast.success('Removed from favorites')
      } else {
        newFavorites.add(providerId)
        toast.success('Added to favorites')
      }
      return newFavorites
    })
  }

  const handleRequestClick = (provider) => {
    setSelectedProvider(provider)
    setRequestData({
      description: '',
      scheduledDate: '',
      address: user?.address ? `${user.address.street}, ${user.address.city}` : '',
      estimatedHours: 1
    })
    setShowRequestModal(true)
  }

  const handleRequestSubmit = async () => {
    if (!requestData.description.trim()) {
      toast.error('Please provide service description')
      return
    }
    
    if (!requestData.scheduledDate) {
      toast.error('Please select date and time')
      return
    }

    try {
      const requestPayload = {
        providerId: selectedProvider.userId._id,
        serviceType: selectedProvider.profession,
        description: requestData.description,
        scheduledDate: new Date(requestData.scheduledDate).toISOString(),
        address: requestData.address || `${user?.address?.street}, ${user?.address?.city}`,
        estimatedHours: requestData.estimatedHours,
        totalPrice: selectedProvider.hourlyRate * requestData.estimatedHours
      }

      await servicesAPI.createRequest(requestPayload)
      toast.success('Service request submitted successfully!')
      setShowRequestModal(false)
      setRequestData({ description: '', scheduledDate: '', address: '', estimatedHours: 1 })
    } catch (error) {
      toast.error('Failed to submit request')
    }
  }

  const professions = [
    'All Services',
    'Plumber',
    'Electrician',
    'Carpenter',
    'Painter',
    'Mechanic',
    'Cleaner'
  ]

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  // Filter providers
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = searchQuery === '' || 
      provider.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesProfession = professionFilter === '' || 
      professionFilter === 'All Services' || 
      provider.profession === professionFilter.toLowerCase()
    
    return matchesSearch && matchesProfession
  })

  const totalEarnings = providers.reduce((sum, provider) => sum + (provider.hourlyRate * 20), 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Find and book trusted professionals for all your service needs
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="p-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{providers.length}</p>
                <p className="text-sm text-gray-600">Available Pros</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">4.8</p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="p-4">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">30 Min</p>
                <p className="text-sm text-gray-600">Response Time</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="p-4">
            <div className="flex items-center">
              <Award className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">98%</p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Find Professionals</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, service, or skill..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="w-full md:w-64">
              <select
                value={professionFilter}
                onChange={(e) => setProfessionFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {professions.map(prof => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
            <Shield className="h-4 w-4" />
            <span>All professionals are verified and background checked</span>
          </div>
        </div>
      </Card>

      {/* Providers Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Available Professionals ({filteredProviders.length})
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-gray-200"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredProviders.length === 0 ? (
          <Card className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No professionals found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <Card key={provider._id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Provider Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        {provider.userId.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{provider.userId.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Briefcase className="h-3 w-3" />
                          {provider.profession}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(provider._id)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <Heart 
                        className={`h-5 w-5 ${favorites.has(provider._id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                      />
                    </button>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {renderStars(provider.rating)}
                    </div>
                    <span className="font-medium text-gray-900">
                      {provider.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({provider.totalReviews || 0})
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {provider.userId.address?.city || 'Not specified'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {provider.experience} years experience
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {provider.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        ₹{provider.hourlyRate}
                      </div>
                      <div className="text-sm text-gray-500">per hour</div>
                    </div>
                    
                    <Button
                      onClick={() => handleRequestClick(provider)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Request Modal */}
      // frontend/src/pages/customer/Dashboard.jsx - Only showing the fixed modal part

{showRequestModal && selectedProvider && (
  <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 overflow-y-auto py-8">
    <div className="bg-white rounded-xl w-full max-w-2xl mx-4 my-8">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
        <div className="flex items-center justify-between p-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Book Service</h3>
            <p className="text-gray-600 mt-1">with {selectedProvider.userId?.name || 'Provider'}</p>
          </div>
          <button
            onClick={() => setShowRequestModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <div className="text-2xl text-gray-500 hover:text-gray-700">×</div>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Provider Info */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {selectedProvider.userId?.name?.charAt(0) || 'P'}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-lg">{selectedProvider.userId?.name || 'Provider'}</h4>
            <p className="text-gray-600">{selectedProvider.profession}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                {(selectedProvider.rating || 0).toFixed(1)} rating
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-500" />
                {selectedProvider.experience || 0} years experience
              </span>
              <span className="flex items-center gap-1 font-bold text-blue-600 text-lg">
                ₹{selectedProvider.hourlyRate}/hour
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              What service do you need? *
            </label>
            <textarea
              value={requestData.description}
              onChange={(e) => setRequestData({ ...requestData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              placeholder="Please describe in detail what service you need. For example: 'Need to fix a leaking tap in the kitchen' or 'Install 3 ceiling fans in living room and bedrooms'"
              required
            />
            <p className="text-sm text-gray-500 mt-2">Be specific to get accurate pricing and service</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                When do you need this service? *
              </label>
              <input
                type="datetime-local"
                value={requestData.scheduledDate}
                onChange={(e) => setRequestData({ ...requestData, scheduledDate: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                How many hours do you estimate? *
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="1"
                    value={requestData.estimatedHours}
                    onChange={(e) => setRequestData({ ...requestData, estimatedHours: parseInt(e.target.value) || 1 })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 hr</span>
                    <span>4 hrs</span>
                    <span>8 hrs</span>
                    <span>12 hrs</span>
                  </div>
                </div>
                <div className="text-center min-w-20">
                  <div className="text-2xl font-bold text-blue-600">{requestData.estimatedHours}</div>
                  <div className="text-sm text-gray-500">hours</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Where is the service needed? *
            </label>
            <textarea
              value={requestData.address}
              onChange={(e) => setRequestData({ ...requestData, address: e.target.value })}
              rows="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              placeholder="Enter complete address including floor, building name, landmark..."
              required
            />
            {user?.address && (
              <button
                type="button"
                onClick={() => setRequestData(prev => ({
                  ...prev,
                  address: `${user.address.street}, ${user.address.city}, ${user.address.pincode}`
                }))}
                className="text-sm text-blue-600 hover:text-blue-700 mt-2"
              >
                Use my registered address
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Any special instructions?
            </label>
            <textarea
              value={requestData.specialInstructions || ''}
              onChange={(e) => setRequestData({ ...requestData, specialInstructions: e.target.value })}
              rows="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              placeholder="Parking information, specific time preferences, access instructions, etc."
            />
          </div>

          {/* Price Summary - Always Visible */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
            <h4 className="font-bold text-gray-900 text-lg mb-4">Price Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Hourly Rate</span>
                <span>₹{selectedProvider.hourlyRate} × {requestData.estimatedHours} hours</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Service Fee (5%)</span>
                <span>₹{Math.round(selectedProvider.hourlyRate * requestData.estimatedHours * 0.05)}</span>
              </div>
              <div className="border-t border-blue-300 pt-3 mt-2">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-2xl text-blue-600">
                    ₹{Math.round(selectedProvider.hourlyRate * requestData.estimatedHours * 1.05)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Payment will be collected after service completion</p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Always Visible */}
          <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRequestModal(false)}
                className="flex-1 py-3 text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestSubmit}
                disabled={!requestData.description || !requestData.scheduledDate || !requestData.address}
                className="flex-1 py-3 text-base bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Submit Request
              </Button>
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">
              The professional will contact you within 30 minutes to confirm the booking
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  )
}

export default CustomerDashboard