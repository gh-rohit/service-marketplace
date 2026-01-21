// frontend/src/pages/provider/Profile.jsx
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { providersAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  DollarSign, 
  Save,
  Award,
  Star,
  Calendar,
  MapPin,
  Clock,
  Shield,
  TrendingUp,
  CheckCircle,
  Edit,
  Camera,
  FileText,
  Users,
  DollarSign as Money,
  Sparkles
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const ProviderProfile = () => {
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [providerData, setProviderData] = useState(null)
  const [stats, setStats] = useState(null)
  const [formData, setFormData] = useState({
    profession: '',
    experience: '',
    hourlyRate: '',
    description: '',
    skills: '',
    availability: 'available',
    serviceAreas: '',
    certifications: ''
  })
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    fetchProviderData()
    fetchStats()
  }, [])

  const fetchProviderData = async () => {
    try {
      const response = await providersAPI.getProviderStats()
      if (response.data) {
        setProviderData(response.data)
        setFormData({
          profession: response.data.profession || '',
          experience: response.data.experience || '',
          hourlyRate: response.data.hourlyRate || '',
          description: response.data.description || '',
          skills: response.data.skills?.join(', ') || '',
          availability: response.data.availability || 'available',
          serviceAreas: response.data.serviceAreas || '',
          certifications: response.data.certifications || ''
        })
      }
    } catch (error) {
      console.error('Error fetching provider data:', error)
      toast.error('Failed to load profile data')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await providersAPI.getProviderStats()
      setStats(response.data || {
        completedJobs: 0,
        rating: 0,
        totalEarnings: 0,
        activeBookings: 0,
        responseRate: 0,
        repeatCustomers: 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await providersAPI.updateProviderProfile(formData)
      await fetchProviderData()
      toast.success('✅ Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            <Briefcase className="inline-block h-4 w-4 mr-2" />
            Profession
          </label>
          <select
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select Profession</option>
            <option value="plumber">Plumber</option>
            <option value="electrician">Electrician</option>
            <option value="carpenter">Carpenter</option>
            <option value="painter">Painter</option>
            <option value="mechanic">Mechanic</option>
            <option value="cleaner">Cleaner</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            <Calendar className="inline-block h-4 w-4 mr-2" />
            Experience (Years)
          </label>
          <Input
            name="experience"
            type="number"
            value={formData.experience}
            onChange={handleChange}
            placeholder="Enter years of experience"
            min="0"
            max="50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          <DollarSign className="inline-block h-4 w-4 mr-2" />
          Hourly Rate (₹)
        </label>
        <Input
          name="hourlyRate"
          type="number"
          value={formData.hourlyRate}
          onChange={handleChange}
          placeholder="Enter your hourly rate"
          min="100"
          max="10000"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          <FileText className="inline-block h-4 w-4 mr-2" />
          Professional Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="5"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="Describe your services, expertise, and what makes you stand out..."
        />
        <p className="mt-2 text-sm text-gray-600">
          {formData.description.length}/500 characters
        </p>
      </div>
    </div>
  )

  const renderSkillsTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          <Award className="inline-block h-4 w-4 mr-2" />
          Skills & Specializations
        </label>
        <textarea
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="e.g., Plumbing, Pipe Fitting, Leak Detection, Water Heater Installation, Drain Cleaning"
        />
        <p className="mt-2 text-sm text-gray-600">
          Separate skills with commas. This helps customers find you easily.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          <Shield className="inline-block h-4 w-4 mr-2" />
          Certifications & Licenses
        </label>
        <textarea
          name="certifications"
          value={formData.certifications}
          onChange={handleChange}
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="e.g., Certified Master Plumber, Licensed Electrician, Safety Certification..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          <MapPin className="inline-block h-4 w-4 mr-2" />
          Service Areas
        </label>
        <textarea
          name="serviceAreas"
          value={formData.serviceAreas}
          onChange={handleChange}
          rows="2"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="Enter areas where you provide services (e.g., South Mumbai, Bandra, Andheri West)"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          <Clock className="inline-block h-4 w-4 mr-2" />
          Availability Status
        </label>
        <select
          name="availability"
          value={formData.availability}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="available">🟢 Available (Accepting new bookings)</option>
          <option value="busy">🟡 Busy (Limited availability)</option>
          <option value="unavailable">🔴 Unavailable (Not accepting new bookings)</option>
        </select>
      </div>
    </div>
  )

  const renderStatsCard = () => (
    <div className="space-y-4">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Performance Stats</h3>
            <p className="text-sm text-gray-600">Your service provider metrics</p>
          </div>
          <TrendingUp className="h-6 w-6 text-blue-600" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm text-gray-600">Completed Jobs</span>
            </div>
            <p className="text-xl font-bold text-gray-900 mt-2">{stats?.completedJobs || 0}</p>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-2" />
              <span className="text-sm text-gray-600">Rating</span>
            </div>
            <p className="text-xl font-bold text-gray-900 mt-2">
              {stats?.rating ? stats.rating.toFixed(1) : '0.0'}<span className="text-sm text-gray-500">/5</span>
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Money className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm text-gray-600">Earnings</span>
            </div>
            <p className="text-xl font-bold text-gray-900 mt-2">₹{stats?.totalEarnings || 0}</p>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-purple-500 mr-2" />
              <span className="text-sm text-gray-600">Repeat Clients</span>
            </div>
            <p className="text-xl font-bold text-gray-900 mt-2">{stats?.repeatCustomers || 0}</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Response Rate</span>
            <span className="font-semibold text-gray-900">{stats?.responseRate || 0}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${stats?.responseRate || 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Professional Profile</h1>
            <p className="text-gray-600 mt-2">Manage your professional identity and showcase your expertise</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button variant="outline" className="mr-3">
              <Edit className="h-4 w-4 mr-2" />
              Preview Profile
            </Button>
            <Button className="bg-gradient-to-r from-primary-600 to-primary-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Boost Profile
            </Button>
          </div>
        </div>

        {/* Profile Preview */}
        <Card className="mb-8 overflow-hidden border border-gray-200">
          <div className="md:flex">
            <div className="md:w-1/4 bg-gradient-to-b from-primary-50 to-primary-100 p-8 flex flex-col items-center justify-center">
              <div className="relative mb-4">
                <div className="h-32 w-32 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden">
                  <div className="h-full w-full bg-primary-100 flex items-center justify-center">
                    <User className="h-16 w-16 text-primary-600" />
                  </div>
                </div>
                <button className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white border shadow-md flex items-center justify-center hover:bg-gray-50">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <div className="flex items-center mt-2">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="font-semibold text-gray-900">
                  {stats?.rating ? stats.rating.toFixed(1) : '0.0'}
                </span>
                <span className="text-gray-500 ml-1">({stats?.completedJobs || 0} jobs)</span>
              </div>
              <span className="mt-3 px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-full">
                Professional Provider
              </span>
            </div>

            <div className="md:w-3/4 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{user?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Profession</p>
                        <p className="font-medium text-gray-900">{formData.profession || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="font-medium text-gray-900">{formData.experience || '0'} years</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About Me</h3>
                <p className="text-gray-700">
                  {formData.description || 'No description provided. Add a description to showcase your expertise.'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Tabs */}
        <div className="lg:col-span-2">
          <Card>
            <div className="border-b border-gray-200">
              <nav className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'basic'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Briefcase className="inline-block h-4 w-4 mr-2" />
                  Basic Information
                </button>
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'skills'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Award className="inline-block h-4 w-4 mr-2" />
                  Skills & Availability
                </button>
              </nav>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit}>
                {activeTab === 'basic' && renderBasicInfo()}
                {activeTab === 'skills' && renderSkillsTab()}

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Your profile is <span className="font-semibold text-green-600">80% complete</span>
                      </p>
                      <div className="h-2 bg-gray-200 rounded-full w-48 mt-1 overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>
                    <Button type="submit" loading={saving} className="px-8">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </Card>
        </div>

        {/* Right Column - Stats & Tips */}
        <div className="space-y-6">
          {renderStatsCard()}

          <Card>
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
                Profile Tips
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Complete your profile</span> to appear in more searches
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Add photos</span> of your previous work
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Respond quickly</span> to booking requests
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Update availability</span> regularly
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Set Working Hours
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Update Pricing
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Upload Certificates
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View Bookings
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProviderProfile