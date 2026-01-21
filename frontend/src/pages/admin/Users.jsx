import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  XCircle,
  User,
  Users as UsersIcon,
  TrendingUp,
  Shield,
  Eye,
  Trash2,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Award,
  Briefcase,
  DollarSign,
  Clock,
  MapPin,
  Star,
  AlertCircle,
  X,
  Check,
  BarChart3,
  Database,
  Wifi,
  WifiOff,
  UserCheck,
  UserX
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking'); // checking, connected, failed
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newThisMonth: 0,
    pendingVerification: 0,
    customers: 0,
    providers: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all'
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  // Mock data for fallback
  const mockUsers = [
    { _id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 8900', 
      role: 'customer', isActive: true, status: 'active', createdAt: '2024-01-15', bookings: 12 },
    { _id: '2', name: 'Sarah Smith', email: 'sarah@example.com', phone: '+1 234 567 8901', 
      role: 'provider', isActive: false, status: 'pending', createdAt: '2024-01-10', bookings: 8, providerInfo: { profession: 'Plumber', experience: 5, hourlyRate: 500 } },
    { _id: '3', name: 'Mike Johnson', email: 'mike@example.com', phone: '+1 234 567 8902', 
      role: 'customer', isActive: true, status: 'active', createdAt: '2024-01-05', bookings: 5 },
    { _id: '4', name: 'Emma Wilson', email: 'emma@example.com', phone: '+1 234 567 8903', 
      role: 'provider', isActive: false, status: 'suspended', createdAt: '2023-12-20', bookings: 0, providerInfo: { profession: 'Electrician', experience: 3, hourlyRate: 400 } },
    { _id: '5', name: 'David Brown', email: 'david@example.com', phone: '+1 234 567 8904', 
      role: 'customer', isActive: true, status: 'active', createdAt: '2024-01-12', bookings: 3 },
  ];

  useEffect(() => {
    if (useMockData) {
      loadMockData();
    } else {
      fetchUsers();
    }
  }, [pagination.page, filters, useMockData]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setApiStatus('checking');
      
      // Try to fetch users from backend
      // Note: You need to create the /admin/users endpoint in your backend
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        role: filters.role !== 'all' ? filters.role : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        search: filters.search || undefined
      };
      
      // Since /admin/users doesn't exist yet, we'll try to get from dashboard stats
      try {
        const dashboardResponse = await adminAPI.getDashboardStats();
        
        if (dashboardResponse.data?.stats?.recentRegistrations) {
          // Use recent registrations as temporary data
          const usersData = dashboardResponse.data.stats.recentRegistrations || [];
          const totalUsers = dashboardResponse.data.stats.totalUsers || 0;
          
          processUsersData(usersData, totalUsers);
          setApiStatus('connected');
          toast.success(`Connected to backend. Showing ${usersData.length} recent users`);
        } else {
          throw new Error('No user data in dashboard');
        }
      } catch (dashboardError) {
        console.log('Dashboard endpoint failed, trying fallback...');
        throw dashboardError;
      }
      
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setApiStatus('failed');
      
      // Switch to mock data
      toast.error('Could not connect to users endpoint. Using sample data.', {
        duration: 5000,
        icon: '⚠️',
        action: {
          label: 'Retry',
          onClick: () => {
            setUseMockData(false);
            fetchUsers();
          }
        }
      });
      
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const processUsersData = (usersData, totalCount) => {
    // Apply filters manually
    let filteredUsers = usersData;
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        (user.name && user.name.toLowerCase().includes(searchTerm)) ||
        (user.email && user.email.toLowerCase().includes(searchTerm)) ||
        (user.phone && user.phone.toLowerCase().includes(searchTerm))
      );
    }
    
    if (filters.role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role);
    }
    
    if (filters.status !== 'all') {
      filteredUsers = filteredUsers.filter(user => {
        if (filters.status === 'active') return user.isActive === true;
        if (filters.status === 'inactive') return user.isActive === false;
        return true;
      });
    }
    
    // Apply pagination
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    setUsers(paginatedUsers);
    setPagination({
      ...pagination,
      total: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / pagination.limit)
    });
    
    // Calculate stats
    const calculatedStats = calculateStats(usersData);
    setStats(calculatedStats);
  };

  const loadMockData = () => {
    setUseMockData(true);
    setApiStatus('mock');
    
    let filteredUsers = [...mockUsers];
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.phone.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role);
    }
    
    if (filters.status !== 'all') {
      filteredUsers = filteredUsers.filter(user => {
        if (filters.status === 'active') return user.isActive === true || user.status === 'active';
        if (filters.status === 'inactive') return user.isActive === false || user.status === 'suspended';
        return true;
      });
    }
    
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    setUsers(paginatedUsers);
    setPagination({
      ...pagination,
      total: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / pagination.limit)
    });
    
    setStats(calculateStats(mockUsers));
  };

  const calculateStats = (usersList) => {
    const totalUsers = usersList.length;
    const activeUsers = usersList.filter(user => 
      user.isActive === true || user.status === 'active'
    ).length;
    const pendingUsers = usersList.filter(user => 
      user.status === 'pending'
    ).length;
    const customers = usersList.filter(user => user.role === 'customer').length;
    const providers = usersList.filter(user => user.role === 'provider').length;
    const admins = usersList.filter(user => user.role === 'admin').length;
    
    // Calculate new users this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = usersList.filter(user => {
      const userDate = new Date(user.createdAt);
      return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
    }).length;

    return {
      totalUsers,
      activeUsers,
      pendingVerification: pendingUsers,
      customers,
      providers,
      admins,
      newThisMonth
    };
  };

  const handleStatusChange = async (userId, newStatus) => {
    const isActive = newStatus === 'active';
    
    if (useMockData) {
      // Update locally for mock data
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { 
            ...user, 
            isActive,
            status: newStatus 
          } : user
        )
      );
      toast.success(`User ${newStatus} successfully (mock data)`);
      return;
    }

    try {
      await adminAPI.updateUserStatus(userId, { isActive });
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    if (useMockData) {
      // Delete locally for mock data
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      toast.success('User deleted (mock data)');
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const fetchUserDetails = async (userId) => {
    setUserLoading(true);
    
    if (useMockData) {
      // Use mock data
      const user = mockUsers.find(u => u._id === userId);
      if (user) {
        setUserDetails(user);
        setSelectedUser(userId);
        setShowUserModal(true);
      }
      setUserLoading(false);
      return;
    }

    try {
      // Try to fetch user details from backend
      // Note: You need to create this endpoint
      toast.info('User details endpoint not implemented yet');
      
      // For now, find user in current list
      const user = users.find(u => u._id === userId);
      if (user) {
        setUserDetails(user);
        setSelectedUser(userId);
        setShowUserModal(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    } finally {
      setUserLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleExport = () => {
    // Export users data as CSV
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Bookings', 'Joined Date'];
    const csvData = users.map(user => [
      user.name || '',
      user.email || '',
      user.phone || '',
      user.role || '',
      user.isActive ? 'Active' : 'Inactive',
      user.bookings || 0,
      user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('Users exported successfully!');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatRole = (role) => {
    if (!role) return 'Unknown';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getStatusColor = (user) => {
    if (user.isActive === false) return 'red';
    if (user.status === 'pending') return 'yellow';
    if (user.status === 'suspended') return 'red';
    return 'green';
  };

  const getStatusText = (user) => {
    if (user.isActive === false) return 'Inactive';
    if (user.status === 'pending') return 'Pending';
    if (user.status === 'suspended') return 'Suspended';
    return 'Active';
  };

  const getRoleColor = (role) => {
    if (!role) return 'gray';
    
    switch (role.toLowerCase()) {
      case 'admin': return 'red';
      case 'provider': return 'purple';
      case 'customer': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* API Status Indicator */}
        <div className="mb-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            apiStatus === 'connected' ? 'bg-green-100 text-green-800' :
            apiStatus === 'checking' ? 'bg-yellow-100 text-yellow-800' :
            apiStatus === 'failed' ? 'bg-red-100 text-red-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {apiStatus === 'connected' ? (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Connected to Backend
              </>
            ) : apiStatus === 'checking' ? (
              <>
                <Database className="w-3 h-3 mr-1 animate-pulse" />
                Connecting...
              </>
            ) : apiStatus === 'failed' ? (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Using Sample Data
              </>
            ) : (
              <>
                <Database className="w-3 h-3 mr-1" />
                Using Mock Data
              </>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-2">
            {useMockData ? 'Using sample data. Add /admin/users endpoint to backend for real data.' : 'Manage all registered users'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-all">
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <UsersIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">New This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.newThisMonth}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Providers</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.providers}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Filters Card */}
        <Card className="mb-6 shadow-lg">
          <Card.Content className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or phone..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="provider">Provider</option>
                  <option value="admin">Admin</option>
                </select>

                <select
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => {
                      setFilters({ search: '', role: 'all', status: 'all' });
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handleExport}
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  
                  {apiStatus !== 'connected' && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => {
                        setUseMockData(false);
                        fetchUsers();
                      }}
                    >
                      <Wifi className="w-4 h-4" />
                      Try Connect
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Users Table */}
        <Card className="shadow-lg">
          <Card.Header className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Registered Users ({pagination.total})
                </h2>
                <p className="text-sm text-gray-600">
                  {useMockData ? 'Sample data - Add /admin/users endpoint for real data' : 'Showing registered users'}
                </p>
              </div>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
            </div>
          </Card.Header>
          
          <Card.Content className="p-0">
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-600">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search filters</p>
                {!useMockData && (
                  <Button
                    onClick={() => setUseMockData(true)}
                    variant="outline"
                  >
                    Load Sample Data
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bookings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id || user.id} className="hover:bg-gray-50 transition-colors">
                        {/* User Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {user.name?.charAt(0) || 'U'}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">
                                ID: {(user._id || user.id)?.toString().slice(-6)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="truncate max-w-[180px]">{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Role Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getRoleColor(user.role)}>
                            {formatRole(user.role)}
                          </Badge>
                          {user.providerInfo?.profession && (
                            <div className="text-xs text-gray-500 mt-1">
                              {user.providerInfo.profession}
                            </div>
                          )}
                        </td>

                        {/* Status Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusColor(user)}>
                            {getStatusText(user)}
                          </Badge>
                        </td>

                        {/* Bookings Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.bookings || 0}
                          </div>
                          {user.completedBookings && (
                            <div className="text-xs text-gray-500">
                              {user.completedBookings} completed
                            </div>
                          )}
                        </td>

                        {/* Join Date Column */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => fetchUserDetails(user._id || user.id)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {user.isActive ? (
                              <button
                                onClick={() => handleStatusChange(user._id || user.id, 'inactive')}
                                className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                title="Deactivate User"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(user._id || user.id, 'active')}
                                className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                                title="Activate User"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDeleteUser(user._id || user.id)}
                              className="text-gray-600 hover:text-red-600 p-1 rounded-full hover:bg-gray-50"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card.Content>

          {/* Pagination */}
          {users.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span> of{' '}
                  <span className="font-medium">{pagination.total}</span> users
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${
                      pagination.page === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4 inline" /> Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          pagination.page === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${
                      pagination.page === pagination.totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    Next <ChevronRight className="w-4 h-4 inline" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* User Details Modal - Similar to previous implementation */}
        {/* ... Keep the same modal code from previous version ... */}
        
      </div>
    </div>
  );
};

export default Users;