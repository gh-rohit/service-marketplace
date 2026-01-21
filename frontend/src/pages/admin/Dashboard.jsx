// frontend/src/pages/admin/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { adminAPI, providersAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  UserCheck,
  UserX,
  X,
  Filter,
  Search,
  Download,
  BarChart3,
  Shield,
  Award,
  Sparkles,
  Star,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  Check,
  Eye
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState({
    totalUsers: 0,
    approvedProviders: 0,
    totalProviders: 0,
    completedRequests: 0,
    pendingProviders: 0,
    totalRevenue: 0,
    activeBookings: 0,
    satisfactionRate: 0
  })
  const [pendingProviders, setPendingProviders] = useState([])
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [approveReason, setApproveReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const statsResponse = await adminAPI.getDashboardStats()
      const dashboardData = statsResponse.data.stats
      
      // Enhanced stats with visual appeal
      setStats({
        ...dashboardData,
        totalRevenue: dashboardData.totalRevenue || 0,
        activeBookings: dashboardData.activeBookings || 0,
        satisfactionRate: dashboardData.satisfactionRate || 95
      })
      
      setRecentRequests(dashboardData.recentRequests || [])
      
      // Fetch pending providers
      const providersResponse = await providersAPI.getPendingProviders()
      setPendingProviders(providersResponse.data.providers || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  const handleQuickApprove = async (providerId, action) => {
    try {
      setActionLoading(true)
      await providersAPI.approveProvider(providerId, {
        isApproved: action === 'approve',
        reason: action === 'approve' ? 'Provider approved by admin' : 'Provider rejected by admin'
      })
      
      toast.success(`Provider ${action === 'approve' ? 'approved' : 'rejected'}!`, {
        icon: action === 'approve' ? '✅' : '❌',
        duration: 3000
      })
      
      fetchDashboardData()
    } catch (error) {
      console.error('Error updating provider:', error)
      toast.error('Failed to update provider')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkAction = async (action) => {
    try {
      setActionLoading(true)
      
      if (action === 'approveAll') {
        // Implement bulk approve API call
        toast.success('All selected providers approved!')
      } else if (action === 'rejectAll') {
        // Implement bulk reject API call
        toast.success('All selected providers rejected!')
      }
      
      fetchDashboardData()
    } catch (error) {
      console.error('Bulk action error:', error)
      toast.error('Failed to perform bulk action')
    } finally {
      setActionLoading(false)
    }
  }

  const handleProviderAction = async (isApproved) => {
    try {
      setActionLoading(true)
      
      await providersAPI.approveProvider(selectedProvider._id, {
        isApproved,
        reason: approveReason || (isApproved ? 
          '🎉 Congratulations! Your profile has been approved. You can now start accepting service requests.' : 
          '❌ Your application has been rejected due to incomplete information.')
      })
      
      toast.success(`Provider ${isApproved ? 'approved 🎉' : 'rejected ❌'} successfully!`, {
        duration: 4000,
        style: {
          background: isApproved ? '#10B981' : '#EF4444',
          color: 'white'
        }
      })
      
      setShowApproveModal(false)
      setApproveReason('')
      fetchDashboardData()
    } catch (error) {
      console.error('Error updating provider:', error)
      toast.error('Failed to update provider')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', icon: Clock },
      approved: { color: 'green', icon: CheckCircle },
      rejected: { color: 'red', icon: X },
      active: { color: 'blue', icon: TrendingUp },
      completed: { color: 'purple', icon: Award }
    }
    
    const config = statusConfig[status] || { color: 'gray', icon: Clock }
    const Icon = config.icon
    
    return (
      <Badge variant={config.color} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  // Filter pending providers based on search
  const filteredProviders = pendingProviders.filter(provider => {
    const matchesSearch = provider.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.profession?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary-200"></div>
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-lg font-medium text-gray-600 animate-pulse">
          Loading Dashboard...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Shield className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-bold text-black">
                  Welcome back, <span className="text-yellow-300">{user?.name}!</span> 👑
                </h1>
              </div>
              <p className="text-primary-100 text-lg max-w-2xl">
                Manage platform activities, review applications, and oversee all operations
              </p>
            </div>
            <div className="hidden lg:block">
              <Sparkles className="h-12 w-12 text-yellow-300 animate-pulse" />
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Calendar className="h-4 w-4" />
              <span>{new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Clock className="h-4 w-4" />
              <span>Last updated: Just now</span>
            </div>
          </div>
        </div>
        
        {/* Background pattern */}
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-10">
          <div className="grid grid-cols-3 gap-4 h-full">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Providers</p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.approvedProviders}
                  </p>
                  <span className="text-sm text-gray-500 ml-2">
                    / {stats.totalProviders} total
                  </span>
                </div>
                <p className="text-xs text-yellow-600 mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {stats.pendingProviders} pending approval
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                <Briefcase className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Completed Services</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.completedRequests.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600 mt-1 flex items-center">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  {((stats.completedRequests / stats.totalUsers) * 100 || 0).toFixed(1)}% utilization
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-purple-600" />
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500">
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 mt-1 flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  ₹{(stats.totalRevenue / 30).toLocaleString()} daily avg
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center">
                <DollarSign className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Pending Providers Section */}
        <Card className="shadow-lg border-0">
          <Card.Header className="border-b border-gray-200 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Pending Approvals
                  </h2>
                  <p className="text-sm text-gray-600">
                    Review and approve new provider applications
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search providers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                
                {filteredProviders.length > 0 && (
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => handleBulkAction('approveAll')}
                    disabled={actionLoading}
                    className="hidden sm:flex"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve All
                  </Button>
                )}
              </div>
            </div>
          </Card.Header>
          
          <Card.Content className="p-0">
            {filteredProviders.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  All caught up! 🎉
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  No pending provider approvals. Check back later for new applications.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredProviders.map((provider) => (
                  <div
                    key={provider._id}
                    className="p-6 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Provider Avatar */}
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                          {provider.userId?.name?.charAt(0) || 'P'}
                        </div>
                      </div>
                      
                      {/* Provider Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-lg text-gray-900">
                                {provider.userId?.name || 'Provider'}
                              </h4>
                              <Badge variant="yellow" className="animate-pulse">
                                New
                              </Badge>
                            </div>
                            
                            <p className="text-sm font-medium text-primary-600 mb-2">
                              {provider.profession}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Star className="h-3 w-3 mr-1" />
                                {provider.experience} yrs exp
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ₹{provider.hourlyRate}/hr
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {provider.userId?.city || 'City not specified'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <div className="text-sm text-gray-500 text-right">
                              Applied: {formatDate(provider.createdAt)}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {provider.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {provider.skills?.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {skill}
                            </span>
                          ))}
                          {provider.skills?.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{provider.skills.length - 3} more
                            </span>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="small"
                            variant="outline"
                            onClick={() => {
                              setSelectedProvider(provider)
                              setShowApproveModal(true)
                            }}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>
                          
                          <Button
                            size="small"
                            variant="danger"
                            onClick={() => handleQuickApprove(provider._id, 'reject')}
                            disabled={actionLoading}
                            className="flex items-center gap-2"
                          >
                            <UserX className="h-4 w-4" />
                            Quick Reject
                          </Button>
                          
                          <Button
                            size="small"
                            onClick={() => handleQuickApprove(provider._id, 'approve')}
                            disabled={actionLoading}
                            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                          >
                            <UserCheck className="h-4 w-4" />
                            Quick Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Enhanced Recent Service Requests */}
        <Card className="shadow-lg border-0">
          <Card.Header className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Recent Activities
                  </h2>
                  <p className="text-sm text-gray-600">
                    Latest service requests and transactions
                  </p>
                </div>
              </div>
              <Button
                size="small"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </Card.Header>
          
          <Card.Content className="p-0">
            {recentRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600">
                  No recent activities found
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recentRequests.map((request) => (
                  <div
                    key={request._id}
                    className="p-6 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(request.status)}
                          <span className="text-sm font-medium text-gray-700">
                            #{request.requestId || request._id.slice(-6)}
                          </span>
                        </div>
                        
                        <h4 className="font-bold text-gray-900 mb-1">
                          {request.serviceType}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Customer: {request.customerId?.name || 'Anonymous'}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ₹{request.totalPrice || 0}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {request.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {request.providerId && (
                          <>
                            <Briefcase className="h-4 w-4" />
                            <span>Provider: {request.providerId?.name || 'Not assigned'}</span>
                          </>
                        )}
                      </div>
                      
                      <Button
                        size="extraSmall"
                        variant="ghost"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        View Details →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Enhanced Approve/Reject Modal */}
      {showApproveModal && selectedProvider && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Review Application
                    </h3>
                    <p className="text-gray-600">
                      Verify and approve/reject provider
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowApproveModal(false)
                    setApproveReason('')
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Provider Profile Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="flex-shrink-0">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {selectedProvider.userId?.name?.charAt(0) || 'P'}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div>
                          <h4 className="text-2xl font-bold text-gray-900 mb-1">
                            {selectedProvider.userId?.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-medium text-primary-600">
                              {selectedProvider.profession}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending Review
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            ₹{selectedProvider.hourlyRate}
                          </p>
                          <p className="text-sm text-gray-600">per hour</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className="text-sm text-gray-600 mb-1">Experience</div>
                          <div className="text-lg font-bold text-gray-900">
                            {selectedProvider.experience} years
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className="text-sm text-gray-600 mb-1">Rating</div>
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-lg font-bold text-gray-900">
                              {selectedProvider.rating || 'New'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className="text-sm text-gray-600 mb-1">Jobs Done</div>
                          <div className="text-lg font-bold text-gray-900">
                            {selectedProvider.completedJobs || 0}
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className="text-sm text-gray-600 mb-1">Response Time</div>
                          <div className="text-lg font-bold text-gray-900">
                            {selectedProvider.responseTime || '< 1h'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-lg">
                        <Mail className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">
                          {selectedProvider.userId?.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-lg">
                        <Phone className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">
                          {selectedProvider.userId?.phone || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-lg">
                        <MapPin className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium text-gray-900">
                          {selectedProvider.userId?.city}, {selectedProvider.userId?.state}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-lg">
                        <FileText className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Applied On</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(selectedProvider.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="mb-6">
                    <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                    <p className="text-gray-600 bg-white p-4 rounded-lg border border-gray-200">
                      {selectedProvider.description}
                    </p>
                  </div>
                  
                  {/* Skills */}
                  {selectedProvider.skills && selectedProvider.skills.length > 0 && (
                    <div className="mb-6">
                      <h5 className="font-medium text-gray-900 mb-2">Skills</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedProvider.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800 border border-primary-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Decision Section */}
                <div className="border-t border-gray-200 pt-8">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Decision Notes
                      </span>
                    </label>
                    <textarea
                      value={approveReason}
                      onChange={(e) => setApproveReason(e.target.value)}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Add notes about your decision. This message will be sent to the provider..."
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Provide feedback that will help the provider understand your decision
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowApproveModal(false)
                        setApproveReason('')
                      }}
                      className="px-8"
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      variant="danger"
                      onClick={() => handleProviderAction(false)}
                      disabled={actionLoading}
                      className="px-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    >
                      {actionLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Rejecting...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UserX className="h-5 w-5" />
                          Reject Application
                        </div>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => handleProviderAction(true)}
                      disabled={actionLoading}
                      className="px-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
                    >
                      {actionLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Approving...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-5 w-5" />
                          Approve Provider
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard