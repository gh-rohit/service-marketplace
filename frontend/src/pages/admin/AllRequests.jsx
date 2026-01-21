import React, { useState } from 'react';
import { 
  Search, Filter, Calendar, Clock, User, 
  MapPin, DollarSign, CheckCircle, XCircle, Eye, 
  MessageSquare, AlertCircle, TrendingUp
} from 'lucide-react';

const AllRequests = () => {
  const [requests, setRequests] = useState([
    {
      id: 1,
      customer: 'John Doe',
      provider: 'Sarah Smith',
      service: 'Home Cleaning',
      date: '2024-01-20',
      time: '10:00 AM',
      duration: '3 hours',
      price: 120,
      status: 'Pending',
      location: 'New York, NY',
      priority: 'Medium'
    },
    {
      id: 2,
      customer: 'Mike Johnson',
      provider: 'Emma Wilson',
      service: 'Math Tutoring',
      date: '2024-01-20',
      time: '2:00 PM',
      duration: '2 hours',
      price: 80,
      status: 'Confirmed',
      location: 'Los Angeles, CA',
      priority: 'Low'
    },
    {
      id: 3,
      customer: 'David Brown',
      provider: 'Mike Johnson',
      service: 'Plumbing Repair',
      date: '2024-01-19',
      time: '9:00 AM',
      duration: '1.5 hours',
      price: 150,
      status: 'Completed',
      location: 'Chicago, IL',
      priority: 'High'
    },
    {
      id: 4,
      customer: 'Lisa Taylor',
      provider: 'David Brown',
      service: 'Electrical Work',
      date: '2024-01-21',
      time: '11:00 AM',
      duration: '2 hours',
      price: 200,
      status: 'Cancelled',
      location: 'Miami, FL',
      priority: 'Medium'
    },
    {
      id: 5,
      customer: 'Emma Wilson',
      provider: 'Lisa Taylor',
      service: 'Gardening',
      date: '2024-01-22',
      time: '3:00 PM',
      duration: '4 hours',
      price: 180,
      status: 'Pending',
      location: 'Houston, TX',
      priority: 'Low'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDate, setFilterDate] = useState('');

  const statusOptions = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];
  const priorityOptions = ['All', 'High', 'Medium', 'Low'];

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || request.status === filterStatus;
    const matchesDate = !filterDate || request.date === filterDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleStatusChange = (requestId, newStatus) => {
    setRequests(requests.map(request =>
      request.id === requestId ? { ...request, status: newStatus } : request
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Service Requests</h1>
              <p className="text-gray-600 mt-2">Monitor and manage all service bookings</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition">
              Export Report
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Total Requests</p>
            <p className="text-2xl font-bold">1,245</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">56</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-600">892</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Revenue</p>
            <p className="text-2xl font-bold">$45,230</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Avg. Rating</p>
            <p className="text-2xl font-bold">4.5</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search requests..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
              <Filter className="w-5 h-5" />
              More Filters
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer & Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price & Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{request.service}</div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {request.location}
                        </div>
                        <div className="flex items-center mt-2">
                          <AlertCircle className={`w-4 h-4 mr-1 ${getPriorityColor(request.priority)}`} />
                          <span className={`text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority} Priority
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium">{request.customer}</div>
                            <div className="text-xs text-gray-500">Customer</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium">{request.provider}</div>
                            <div className="text-xs text-gray-500">Provider</div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 mr-2" />
                          {request.date}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-2" />
                          {request.time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-lg font-bold text-gray-900">
                          <DollarSign className="w-5 h-5" />
                          {request.price}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.duration}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusChange(request.id, 'Confirmed')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Confirm"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(request.id, 'Cancelled')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Cancel"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View Details">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition" title="Message">
                          <MessageSquare className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No service requests found</div>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('All');
                setFilterDate('');
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-lg mb-4">Status Distribution</h3>
            <div className="space-y-3">
              {['Completed', 'Pending', 'Confirmed', 'Cancelled'].map((status) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-gray-700">{status}</span>
                  <span className="font-bold">{
                    status === 'Completed' ? '892' :
                    status === 'Pending' ? '56' :
                    status === 'Confirmed' ? '245' :
                    '52'
                  }</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-lg mb-4">Revenue Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Today</span>
                <span className="font-bold text-green-600">$1,250</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">This Week</span>
                <span className="font-bold text-green-600">$8,750</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">This Month</span>
                <span className="font-bold text-green-600">$45,230</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total</span>
                <span className="font-bold">$452,300</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition">
                Process Pending Requests
              </button>
              <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition">
                Generate Monthly Report
              </button>
              <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition">
                Send Notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllRequests;