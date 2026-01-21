// frontend/src/pages/provider/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { providersAPI, servicesAPI, notificationsAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Star, 
  Users,
  AlertCircle,
  Calendar,
  MessageSquare,
  TrendingUp,
  Briefcase,
  Award,
  Sparkles,
  Zap,
  ThumbsUp,
  X,
  Check,
  MapPin,
  Phone,
  Mail,
  User,
  Eye,
  Download,
  Filter
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

const ProviderDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState({
    pendingRequests: 0,
    completedRequests: 0,
    rating: 0,
    totalEarnings: 0,
    activeJobs: 0,
    responseRate: 0,
    totalClients: 0,
    monthlyEarnings: 0
  })
  const [requests, setRequests] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState('')
  const [providerNotes, setProviderNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchDashboardData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats
      const statsResponse = await providersAPI.getProviderStats()
      const statsData = statsResponse.data.stats || {}
      setStats({
        ...statsData,
        pendingRequests: statsData.pendingRequests || 0,
        completedRequests: statsData.completedRequests || 0,
        rating: statsData.rating || 0,
        totalEarnings: statsData.totalEarnings || 0,
        activeJobs: statsData.activeJobs || 0,
        responseRate: statsData.responseRate || 95,
        totalClients: statsData.totalClients || 0,
        monthlyEarnings: statsData.monthlyEarnings || 0
      })
      
      // Fetch requests based on active tab
      let status = 'pending'
      if (activeTab === 'active') status = 'accepted'
      if (activeTab === 'completed') status = 'completed'
      
      const requestsResponse = await servicesAPI.getProviderRequests(status)
      setRequests(requestsResponse.data.requests || [])
      
      // Fetch notifications
      const notificationsResponse = await notificationsAPI.getNotifications()
      setNotifications(notificationsResponse.data.notifications || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestAction = (request, type) => {
    setSelectedRequest(request)
    setActionType(type)
    setShowActionModal(true)
  }

  const confirmAction = async () => {
    if (actionType === 'reject' && !providerNotes.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    try {
      setSubmitting(true)
      
      if (actionType === 'accept') {
        await servicesAPI.updateRequestStatus(selectedRequest._id, {
          status: 'accepted',
          providerNotes: providerNotes || 'Request accepted'
        })
        toast.success('🎉 Request accepted successfully!', {
          duration: 4000
        })
      } else if (actionType === 'reject') {
        await servicesAPI.updateRequestStatus(selectedRequest._id, {
          status: 'rejected',
          providerNotes: providerNotes
        })
        toast.error('Request rejected', {
          duration: 4000
        })
      } else if (actionType === 'complete') {
        await servicesAPI.markAsComplete(selectedRequest._id)
        toast.success('✅ Service marked as completed!', {
          duration: 4000
        })
      }
      
      setShowActionModal(false)
      setProviderNotes('')
      fetchDashboardData() // Refresh data
    } catch (error) {
      console.error('Error updating request:', error)
      const errorMsg = error.response?.data?.message || 'Failed to update request'
      toast.error(errorMsg, {
        duration: 4000
      })
    } finally {
      setSubmitting(false)
    }
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId)
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow'
      case 'accepted': return 'blue'
      case 'in_progress': return 'purple'
      case 'completed': return 'green'
      case 'rejected': return 'red'
      case 'cancelled': return 'gray'
      default: return 'gray'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock
      case 'accepted': return CheckCircle
      case 'in_progress': return Zap
      case 'completed': return Award
      case 'rejected': return X
      case 'cancelled': return X
      default: return AlertCircle
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const filteredRequests = requests.filter(request => {
    if (filterStatus === 'all') return true
    return request.status === filterStatus
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary-200"></div>
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-lg font-medium text-gray-700">
          Loading your dashboard...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="relative z-10 text-black">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 ">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold text-black">
                  Welcome back, <span className="text-yellow-300">{user?.name}! 👷‍♂️</span>
                </h1>
              </div>
              <p className="text-black/90 text-lg">
                Manage your service requests, grow your business, and delight your customers
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Sparkles className="h-5 w-5" />
              <span>Professional Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pending Requests Card */}
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500">
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.pendingRequests}
                </p>
                <p className="text-xs text-yellow-600 mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Awaiting your response
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Completed Jobs Card */}
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Completed Jobs</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.completedRequests}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stats.totalClients} happy clients
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Rating Card */}
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Your Rating</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.rating.toFixed(1)}
                  </p>
                  <span className="text-sm text-gray-500">/5</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {renderStars(stats.rating)}
                </div>
              </div>
              <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center">
                <Star className="h-7 w-7 text-purple-600 fill-current" />
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Earnings Card */}
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{stats.totalEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 mt-1 flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  ₹{stats.monthlyEarnings.toLocaleString()} this month
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Response Rate</p>
                <p className="text-2xl font-bold text-green-900">{stats.responseRate}%</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </Card.Content>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Active Jobs</p>
                <p className="text-2xl font-bold text-blue-900">{stats.activeJobs}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </Card.Content>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Repeat Clients</p>
                <p className="text-2xl font-bold text-purple-900">{Math.round(stats.totalClients * 0.3)}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Service Requests Section */}
        <Card className="shadow-lg border-0">
          <Card.Header className="border-b border-gray-200 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Service Requests
                  </h2>
                  <p className="text-sm text-gray-600">
                    Manage your incoming service requests
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setActiveTab('pending')
                  setFilterStatus('all')
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'pending'
                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Pending ({stats.pendingRequests})
              </button>
              <button
                onClick={() => {
                  setActiveTab('active')
                  setFilterStatus('all')
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'active'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Active ({stats.activeJobs})
              </button>
              <button
                onClick={() => {
                  setActiveTab('completed')
                  setFilterStatus('all')
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'completed'
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Completed ({stats.completedRequests})
              </button>
            </div>
          </Card.Header>
          
          <Card.Content className="p-0">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                  <CheckCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No requests found
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'pending' 
                    ? 'You have no pending requests at the moment' 
                    : activeTab === 'active'
                    ? 'No active service requests'
                    : 'No completed requests yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {filteredRequests.map((request) => {
                  const StatusIcon = getStatusIcon(request.status)
                  const statusColor = getStatusColor(request.status)
                  
                  return (
                    <div
                      key={request._id}
                      className="p-6 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Customer Info */}
                        <div className="flex-shrink-0">
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {request.customerId?.name?.charAt(0) || 'C'}
                          </div>
                        </div>
                        
                        {/* Request Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-lg text-gray-900">
                                  {request.customerId?.name || 'Customer'}
                                </h4>
                                <Badge variant={statusColor} className="flex items-center gap-1">
                                  <StatusIcon className="h-3 w-3" />
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                              </div>
                              
                              <p className="text-sm font-medium text-primary-600 mb-2">
                                {request.serviceType}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">
                                ₹{request.totalPrice || 0}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDate(request.createdAt)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Service Description */}
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {request.description}
                          </p>
                          
                          {/* Additional Details */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>{formatDate(request.scheduledDate)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="truncate">{request.address?.split(',')[0] || 'Location'}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>{request.estimatedHours || 1} hours</span>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          {request.status === 'pending' && (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="small"
                                variant="outline"
                                onClick={() => {
                                  // View details functionality
                                  setSelectedRequest(request)
                                  setActionType('view')
                                  setShowActionModal(true)
                                }}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </Button>
                              
                              <Button
                                size="small"
                                variant="danger"
                                onClick={() => handleRequestAction(request, 'reject')}
                                className="flex items-center gap-2"
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </Button>
                              
                              <Button
                                size="small"
                                onClick={() => handleRequestAction(request, 'accept')}
                                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                              >
                                <Check className="h-4 w-4" />
                                Accept Request
                              </Button>
                            </div>
                          )}
                          
                          {request.status === 'accepted' && (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="small"
                                variant="outline"
                                className="flex items-center gap-2"
                              >
                                <Phone className="h-4 w-4" />
                                Contact Customer
                              </Button>
                              
                              <Button
                                size="small"
                                onClick={() => handleRequestAction(request, 'complete')}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Mark Complete
                              </Button>
                            </div>
                          )}
                          
                          {request.status === 'completed' && (
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                Completed on {formatDate(request.completedAt || request.updatedAt)}
                              </div>
                              {request.rating && (
                                <div className="flex items-center gap-1">
                                  {renderStars(request.rating)}
                                  <span className="text-sm font-medium text-gray-900">
                                    {request.rating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Notifications Section */}
        <Card className="shadow-lg border-0">
          <Card.Header className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Notifications
                  </h2>
                  <p className="text-sm text-gray-600">
                    Stay updated with important alerts
                  </p>
                </div>
              </div>
              
              {notifications.filter(n => !n.isRead).length > 0 && (
                <Badge variant="red" className="animate-pulse">
                  {notifications.filter(n => !n.isRead).length} new
                </Badge>
              )}
            </div>
          </Card.Header>
          
          <Card.Content className="p-0">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600">
                  No notifications at the moment
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {notifications.slice(0, 10).map((notification) => {
                  const isUnread = !notification.isRead
                  
                  return (
                    <div
                      key={notification._id}
                      className={`p-6 cursor-pointer transition-colors duration-200 ${
                        isUnread 
                          ? 'bg-blue-50 hover:bg-blue-100' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => markNotificationAsRead(notification._id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
                          isUnread 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {notification.type === 'request' ? (
                            <Briefcase className="h-5 w-5" />
                          ) : notification.type === 'payment' ? (
                            <DollarSign className="h-5 w-5" />
                          ) : notification.type === 'rating' ? (
                            <Star className="h-5 w-5" />
                          ) : (
                            <Bell className="h-5 w-5" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className={`font-bold ${
                              isUnread ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            {isUnread && (
                              <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.createdAt)}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            {notifications.length > 10 && (
              <div className="border-t border-gray-200 p-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = '/provider/notifications'}
                >
                  View All Notifications
                </Button>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Action Modal */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg">
                    {actionType === 'accept' && <Check className="h-6 w-6 text-white" />}
                    {actionType === 'reject' && <X className="h-6 w-6 text-white" />}
                    {actionType === 'complete' && <Award className="h-6 w-6 text-white" />}
                    {actionType === 'view' && <Eye className="h-6 w-6 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {actionType === 'accept' && 'Accept Service Request'}
                      {actionType === 'reject' && 'Reject Service Request'}
                      {actionType === 'complete' && 'Mark Service as Complete'}
                      {actionType === 'view' && 'Request Details'}
                    </h3>
                    <p className="text-gray-600">
                      {actionType === 'view' 
                        ? 'View complete request details' 
                        : `Request from ${selectedRequest.customerId?.name || 'Customer'}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowActionModal(false)
                    setProviderNotes('')
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Request Details Card */}
                <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="flex-shrink-0">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {selectedRequest.customerId?.name?.charAt(0) || 'C'}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div>
                          <h4 className="text-2xl font-bold text-gray-900 mb-1">
                            {selectedRequest.customerId?.name || 'Customer'}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-medium text-primary-600">
                              {selectedRequest.serviceType}
                            </span>
                            <Badge variant={getStatusColor(selectedRequest.status)}>
                              {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900">
                            ₹{selectedRequest.totalPrice || 0}
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedRequest.estimatedHours || 1} hours
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">Scheduled</div>
                          <div className="font-bold text-gray-900">
                            {formatDate(selectedRequest.scheduledDate)}
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">Location</div>
                          <div className="font-bold text-gray-900 truncate" title={selectedRequest.address}>
                            {selectedRequest.address?.split(',')[0] || 'N/A'}
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">Contact</div>
                          <div className="font-bold text-gray-900">
                            {selectedRequest.customerId?.phone || 'N/A'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">Service Description</h5>
                        <p className="text-gray-600 bg-white p-4 rounded-lg border border-gray-200">
                          {selectedRequest.description}
                        </p>
                      </div>
                      
                      {/* Special Instructions */}
                      {selectedRequest.specialInstructions && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">Special Instructions</h5>
                          <p className="text-gray-600 bg-white p-4 rounded-lg border border-gray-200">
                            {selectedRequest.specialInstructions}
                          </p>
                        </div>
                      )}
                      
                      {/* Contact Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-white rounded-lg">
                            <Phone className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-medium text-gray-900">
                              {selectedRequest.customerId?.phone || 'Not provided'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-white rounded-lg">
                            <Mail className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">
                              {selectedRequest.customerId?.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Form (for accept/reject/complete) */}
                {actionType !== 'view' && (
                  <div className="border-t border-gray-200 pt-8">
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        <span className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          {actionType === 'reject' ? 'Reason for Rejection *' : 'Notes for Customer'}
                        </span>
                      </label>
                      <textarea
                        value={providerNotes}
                        onChange={(e) => setProviderNotes(e.target.value)}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        placeholder={
                          actionType === 'accept' 
                            ? 'Add any notes or instructions for the customer...'
                            : actionType === 'reject'
                            ? 'Please provide a clear reason for rejecting this request...'
                            : 'Add completion notes and feedback...'
                        }
                        required={actionType === 'reject'}
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-end gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowActionModal(false)
                          setProviderNotes('')
                        }}
                        className="px-8"
                      >
                        Cancel
                      </Button>
                      
                      {actionType === 'reject' && (
                        <Button
                          variant="danger"
                          onClick={confirmAction}
                          disabled={!providerNotes.trim() || submitting}
                          className="px-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                        >
                          {submitting ? (
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Rejecting...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <X className="h-5 w-5" />
                              Reject Request
                            </div>
                          )}
                        </Button>
                      )}
                      
                      {actionType === 'accept' && (
                        <Button
                          onClick={confirmAction}
                          disabled={submitting}
                          className="px-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                          {submitting ? (
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Accepting...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Check className="h-5 w-5" />
                              Accept Request
                            </div>
                          )}
                        </Button>
                      )}
                      
                      {actionType === 'complete' && (
                        <Button
                          onClick={confirmAction}
                          disabled={submitting}
                          className="px-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                          {submitting ? (
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Completing...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Award className="h-5 w-5" />
                              Mark as Complete
                            </div>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Close button for view mode */}
                {actionType === 'view' && (
                  <div className="flex justify-end pt-8 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => setShowActionModal(false)}
                      className="px-8"
                    >
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProviderDashboard