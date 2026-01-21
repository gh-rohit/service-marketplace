// frontend/src/pages/customer/Requests.jsx
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { servicesAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  MessageSquare,
  AlertCircle
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

const CustomerRequests = () => {
  const { user } = useSelector((state) => state.auth)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showRateModal, setShowRateModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await servicesAPI.getCustomerRequests()
      setRequests(response.data.requests)
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const handleRateClick = (request) => {
    setSelectedRequest(request)
    setShowRateModal(true)
  }

  const handleRateSubmit = async () => {
    try {
      await servicesAPI.rateService(selectedRequest._id, {
        rating,
        review
      })
      toast.success('Rating submitted successfully!')
      setShowRateModal(false)
      setRating(5)
      setReview('')
      fetchRequests() // Refresh data
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast.error('Failed to submit rating')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending', icon: Clock },
      accepted: { variant: 'info', text: 'Accepted', icon: CheckCircle },
      rejected: { variant: 'danger', text: 'Rejected', icon: XCircle },
      completed: { variant: 'success', text: 'Completed', icon: CheckCircle },
      cancelled: { variant: 'danger', text: 'Cancelled', icon: XCircle },
      'in-progress': { variant: 'info', text: 'In Progress', icon: Clock }
    }
    
    const config = statusConfig[status] || { variant: 'default', text: status, icon: AlertCircle }
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center">
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    )
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Service Requests</h1>
        <p className="text-gray-600 mt-2">Track and manage all your service requests</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests.length === 0 ? (
          <Card>
            <Card.Content className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No service requests yet
              </h3>
              <p className="text-gray-600">
                Book your first service to get started
              </p>
              <Button className="mt-4" onClick={() => window.location.href = '/customer/dashboard'}>
                Find Service Providers
              </Button>
            </Card.Content>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request._id}>
              <Card.Content>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.serviceType}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Provider: {request.providerId?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">
                      {request.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          Scheduled: {formatDate(request.scheduledDate)}
                        </div>
                        <div className="text-gray-500">
                          Address: {request.address}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-gray-500">
                          Estimated Hours: {request.estimatedHours}
                        </div>
                        <div className="text-gray-500">
                          Total Price: ₹{request.totalPrice}
                        </div>
                        {request.customerRating && (
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-2">Your Rating:</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < request.customerRating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {request.status === 'completed' && !request.customerRating && (
                    <div className="md:pl-4 md:border-l md:border-gray-200">
                      <Button
                        onClick={() => handleRateClick(request)}
                        className="whitespace-nowrap"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Rate Service
                      </Button>
                    </div>
                  )}
                </div>

                {request.providerNotes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Provider Notes:
                    </h4>
                    <p className="text-sm text-gray-600">
                      {request.providerNotes}
                    </p>
                  </div>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </div>

      {/* Rate Service Modal */}
      {showRateModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Rate Service
                </h3>
                <button
                  onClick={() => setShowRateModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Service Details
                  </h4>
                  <p className="text-sm text-gray-600">
                    Service: {selectedRequest.serviceType}
                  </p>
                  <p className="text-sm text-gray-600">
                    Provider: {selectedRequest.providerId?.name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review (Optional)
                  </label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Share your experience with this service..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRateModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleRateSubmit}>
                  Submit Rating
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerRequests