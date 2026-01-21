import React, { useState } from 'react';
import { 
  Search, Filter, Star, MapPin, CheckCircle, 
  XCircle, Eye, MessageSquare, TrendingUp 
} from 'lucide-react';

const Providers = () => {
  const [providers, setProviders] = useState([
    { 
      id: 1, 
      name: 'Sarah Smith', 
      category: 'Cleaning Services', 
      rating: 4.8, 
      reviews: 124, 
      location: 'New York, NY',
      status: 'Verified', 
      earnings: 12500, 
      services: 8,
      responseRate: 95,
      joinDate: '2023-11-15'
    },
    { 
      id: 2, 
      name: 'Mike Johnson', 
      category: 'Plumbing', 
      rating: 4.5, 
      reviews: 89, 
      location: 'Los Angeles, CA',
      status: 'Pending', 
      earnings: 8200, 
      services: 5,
      responseRate: 88,
      joinDate: '2024-01-10'
    },
    { 
      id: 3, 
      name: 'Emma Wilson', 
      category: 'Tutoring', 
      rating: 4.9, 
      reviews: 156, 
      location: 'Chicago, IL',
      status: 'Verified', 
      earnings: 18700, 
      services: 12,
      responseRate: 98,
      joinDate: '2023-09-20'
    },
    { 
      id: 4, 
      name: 'David Brown', 
      category: 'Electrical', 
      rating: 4.3, 
      reviews: 67, 
      location: 'Houston, TX',
      status: 'Suspended', 
      earnings: 5400, 
      services: 4,
      responseRate: 76,
      joinDate: '2024-02-05'
    },
    { 
      id: 5, 
      name: 'Lisa Taylor', 
      category: 'Home Repair', 
      rating: 4.7, 
      reviews: 92, 
      location: 'Miami, FL',
      status: 'Verified', 
      earnings: 10300, 
      services: 6,
      responseRate: 91,
      joinDate: '2023-12-12'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['All', 'Cleaning Services', 'Plumbing', 'Tutoring', 'Electrical', 'Home Repair', 'Gardening'];

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || provider.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || provider.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleVerify = (providerId) => {
    setProviders(providers.map(provider =>
      provider.id === providerId ? { ...provider, status: 'Verified' } : provider
    ));
  };

  const handleSuspend = (providerId) => {
    setProviders(providers.map(provider =>
      provider.id === providerId ? { ...provider, status: 'Suspended' } : provider
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
              <p className="text-gray-600 mt-2">Manage and verify all service providers</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition">
              Add New Provider
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Total Providers</p>
            <p className="text-2xl font-bold">342</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Verified</p>
            <p className="text-2xl font-bold text-green-600">287</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Pending Verification</p>
            <p className="text-2xl font-bold text-yellow-600">23</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Total Earnings</p>
            <p className="text-2xl font-bold">$452,300</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search providers by name or category..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                <Filter className="w-5 h-5" />
                Advanced
              </button>
            </div>
          </div>
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <div key={provider.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              {/* Provider Header */}
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{provider.name}</h3>
                      {provider.status === 'Verified' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {provider.status === 'Pending' && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{provider.category}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    provider.status === 'Verified' ? 'bg-green-100 text-green-800' :
                    provider.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {provider.status}
                  </span>
                </div>
              </div>

              {/* Provider Info */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="ml-2 font-bold">{provider.rating}</span>
                      <span className="ml-2 text-gray-600">({provider.reviews} reviews)</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                      {provider.responseRate}% response
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {provider.location}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{provider.services}</p>
                      <p className="text-xs text-gray-500">Services</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">${provider.earnings.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Earnings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{provider.joinDate}</p>
                      <p className="text-xs text-gray-500">Joined</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 p-4 border-t">
                <div className="flex justify-between">
                  <button
                    onClick={() => handleVerify(provider.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Verify
                  </button>
                  <button
                    onClick={() => handleSuspend(provider.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition"
                  >
                    <XCircle className="w-4 h-4" />
                    Suspend
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No providers found matching your criteria</div>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('All');
                setFilterCategory('All');
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
              1
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              3
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Providers;