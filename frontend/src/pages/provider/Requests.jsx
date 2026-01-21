// frontend/src/pages/provider/Requests.jsx
import React, { useState, useEffect } from 'react'
import { servicesAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  MessageSquare,
  DollarSign,
  Star,
  TrendingUp,
  Filter
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const ProviderRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    completed: 0,
    rejected: 0
  })
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchRequests()
    fetchStats()
  }, [statusFilter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await servicesAPI.getProviderRequests(statusFilter)
      setRequests(response.data.requests || [])
    } catch (error) {
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await servicesAPI.getProviderRequests('all')
      const allRequests = response.data.requests || []
      
      const stats = {
        pending: allRequests.filter(r => r.status === 'pending').length,
        accepted: allRequests.filter(r => r.status === 'accepted').length,
        completed: allRequests.filter(r => r.status === 'completed').length,
        rejected: allRequests.filter(r => r.status === 'rejected').length,
        total: allRequests.length
      }
      setStats(stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleAction = async (requestId, action) => {
    try {
      if (action === 'accept' || action === 'reject') {
        await servicesAPI.updateRequestStatus(requestId, {
          status: action === 'accept' ? 'accepted' : 'rejected',
          providerNotes: 'Updated by provider'
        })
        toast.success(`Request ${action === 'accept' ? '✅ accepted' : '❌ rejected'}`)
      } else if (action === 'complete') {
        await servicesAPI.markAsComplete(requestId)
        toast.success('✅ Service marked as completed')
      }
      fetchRequests()
      fetchStats()
    } catch (error) {
      toast.error('Failed to update request')
    }
  }

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="h-4 w-4" /> },
      accepted: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <CheckCircle className="h-4 w-4" /> },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="h-4 w-4" /> }
    }
    
    const { bg, text, icon } = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: null }
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>
        {icon}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const filterOptions = [
    { value: 'all', label: 'All Requests', color: 'bg-gradient-to-r from-gray-600 to-gray-700' },
    { value: 'pending', label: 'Pending', color: 'bg-gradient-to-r from-yellow-500 to-yellow-600' },
    { value: 'accepted', label: 'Accepted', color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    { value: 'completed', label: 'Completed', color: 'bg-gradient-to-r from-green-500 to-green-600' },
    { value: 'rejected', label: 'Rejected', color: 'bg-gradient-to-r from-red-500 to-red-600' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
        <p className="text-gray-600 mt-1">Manage and respond to customer requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            <p className="text-sm text-gray-600 mt-1">Pending Requests</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 text-blue-600" />
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
            <p className="text-sm text-gray-600 mt-1">Accepted</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <Star className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            <p className="text-sm text-gray-600 mt-1">Completed</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <TrendingUp className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            <p className="text-sm text-gray-600 mt-1">Rejected</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Requests</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2.5 rounded-lg font-medium text-white transition-all duration-200 ${
                statusFilter === option.value
                  ? option.color + ' shadow-lg transform scale-105'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 mb-6">
              <Clock className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">
              {statusFilter === 'all' 
                ? "You don't have any service requests yet" 
                : `No ${statusFilter} requests found`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <Card key={request._id} className="overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="mb-3 md:mb-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {request.serviceType || 'Service Request'}
                    </h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-1" />
                        <span>{request.customerId?.name || 'Customer'}</span>
                      </div>
                      {request.customerId?.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-1" />
                          <span>{request.customerId.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStatusBadge(request.status)}
                  </div>
                </div>

                {/* Description */}
                {request.description && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start">
                      <MessageSquare className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{request.description}</p>
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Scheduled Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(request.scheduledDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-semibold text-gray-900">₹{request.totalPrice || '0'}</p>
                    </div>
                  </div>

                  {request.address && (
                    <div className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-semibold text-gray-900">{request.address.city || 'City'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200">
                  {request.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div>
                        <p className="text-sm text-gray-600">
                          <Clock className="inline-block h-4 w-4 mr-1 text-yellow-500" />
                          Respond within 24 hours for best results
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <Button 
                          onClick={() => handleAction(request._id, 'accept')}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-6"
                        >
                          Accept Request
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleAction(request._id, 'reject')}
                          className="border-red-300 text-red-600 hover:bg-red-50 px-6"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}

                  {request.status === 'accepted' && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div>
                        <p className="text-sm text-gray-600">
                          <CheckCircle className="inline-block h-4 w-4 mr-1 text-blue-500" />
                          Service scheduled for {formatDate(request.scheduledDate)}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleAction(request._id, 'complete')}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6"
                      >
                        Mark as Completed
                      </Button>
                    </div>
                  )}

                  {(request.status === 'completed' || request.status === 'rejected') && (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-600">
                        This request has been {request.status}. No further action required.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProviderRequests