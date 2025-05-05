import React, { useState, useEffect } from "react";
import { Search, RefreshCw, Check, X, Filter, ChevronDown, ChevronUp } from "lucide-react";

export default function User() {
  // State variables
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "pending",
    userId: "",
    fromDate: "",
    toDate: ""
  });
  const [approvalDetails, setApprovalDetails] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "userId",
    direction: "asc"
  });
  const [authToken, setAuthToken] = useState("");

  // Get auth token when component mounts
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setAuthToken(token);
    
    // Check if token exists
    if (!token) {
      setError("Authentication token not found. Please login again.");
      setIsLoading(false);
    }
  }, []);

  // Fetch users data
  const fetchUsers = async () => {
    if (!authToken) {
      setError("Authentication token not found. Please login again.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      if (response.status === 401) {
        handleAuthError();
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch users");
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch withdrawals based on filters
  const fetchWithdrawals = async () => {
    if (!authToken) {
      setError("Authentication token not found. Please login again.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.userId) queryParams.append("userId", filters.userId);
      if (filters.fromDate) queryParams.append("fromDate", filters.fromDate);
      if (filters.toDate) queryParams.append("toDate", filters.toDate);

      const url = `http://localhost:5000/api/admin/withdrawals${
        filters.status === "pending" ? "/pending" : "?" + queryParams.toString()
      }`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      if (response.status === 401) {
        handleAuthError();
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch withdrawals");
      }
      
      const data = await response.json();
      setWithdrawals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle authentication errors
  const handleAuthError = () => {
    setError("Your session has expired. Please login again.");
    // Clear the invalid token
    localStorage.removeItem("authToken");
    setAuthToken("");
    setIsLoading(false);
  };

  // Initial data load - only if we have a token
  useEffect(() => {
    if (authToken) {
      if (activeTab === "users") {
        fetchUsers();
      } else {
        fetchWithdrawals();
      }
    }
  }, [activeTab, authToken]);

  // Fetch withdrawals when filters change - only if we have a token
  useEffect(() => {
    if (authToken && activeTab === "withdrawals") {
      fetchWithdrawals();
    }
  }, [filters, authToken]);

  // Handle withdrawal approval
  const handleApproveWithdrawal = async () => {
    if (!authToken) {
      setError("Authentication token not found. Please login again.");
      return;
    }
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/withdrawals/${selectedWithdrawal._id}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({ transactionDetails: approvalDetails })
        }
      );

      if (response.status === 401) {
        handleAuthError();
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve withdrawal");
      }
      
      // Update local state to reflect the change
      setWithdrawals(withdrawals.map(w => 
        w._id === selectedWithdrawal._id ? { ...w, status: "approved" } : w
      ));
      
      setModalOpen(false);
      setApprovalDetails("");
      setSelectedWithdrawal(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle withdrawal rejection
  const handleRejectWithdrawal = async () => {
    if (!authToken) {
      setError("Authentication token not found. Please login again.");
      return;
    }
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/withdrawals/${selectedWithdrawal._id}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({ reason: rejectionReason })
        }
      );

      if (response.status === 401) {
        handleAuthError();
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reject withdrawal");
      }
      
      // Update local state to reflect the change
      setWithdrawals(withdrawals.map(w => 
        w._id === selectedWithdrawal._id ? { ...w, status: "rejected" } : w
      ));
      
      setModalOpen(false);
      setRejectionReason("");
      setSelectedWithdrawal(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle sorting for tables
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
  
  // Get sorted data
  const getSortedData = (data) => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      // Handle nested properties
      let aValue = sortConfig.key.includes('.') ? 
        sortConfig.key.split('.').reduce((obj, key) => obj && obj[key] !== undefined ? obj[key] : null, a) : 
        a[sortConfig.key];
      let bValue = sortConfig.key.includes('.') ? 
        sortConfig.key.split('.').reduce((obj, key) => obj && obj[key] !== undefined ? obj[key] : null, b) : 
        b[sortConfig.key];
      
      // Handle null values
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      
      // Sort numeric values as numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Sort string values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Login redirect button
  const LoginRedirectButton = () => (
    <div className="text-center py-8">
      <p className="mb-4 text-gray-700">You need to login to access this page.</p>
      <button 
        onClick={() => window.location.href = '/login'} 
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go to Login
      </button>
    </div>
  );

  // Sort indicator component
  const SortIndicator = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />;
  };

  // Modal component
  const Modal = () => {
    if (!modalOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            {modalType === "approve" ? "Approve Withdrawal" : "Reject Withdrawal"}
          </h3>
          
          <div className="mb-4">
            <p><span className="font-medium">User:</span> {selectedWithdrawal?.userId?.email || 'N/A'}</p>
            <p><span className="font-medium">Amount:</span> ${selectedWithdrawal?.amount}</p>
            <p><span className="font-medium">Date:</span> {formatDate(selectedWithdrawal?.date)}</p>
          </div>
          
          {modalType === "approve" ? (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Transaction Details (Optional)</label>
              <textarea
                className="w-full border rounded p-2"
                rows="3"
                value={approvalDetails}
                onChange={(e) => setApprovalDetails(e.target.value)}
                placeholder="Enter transaction reference or payment details..."
              />
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Rejection Reason</label>
              <textarea
                className="w-full border rounded p-2"
                rows="3"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                required
              />
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 border rounded hover:bg-gray-100"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            {modalType === "approve" ? (
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={handleApproveWithdrawal}
              >
                Approve
              </button>
            ) : (
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleRejectWithdrawal}
                disabled={!rejectionReason.trim()}
              >
                Reject
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // If no auth token is available, show login button
  if (!authToken && !isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Partners Details</h1>
          <p className="text-gray-600">Authentication required</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <LoginRedirectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <Modal />
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Partners Details</h1>
        <p className="text-gray-600">Manage Partners and withdrawal requests</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "users"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "withdrawals"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("withdrawals")}
        >
          Withdrawals
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            className="underline ml-2" 
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
          {error.includes("expired") && (
            <button 
              className="ml-4 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
              onClick={() => window.location.href = '/login'}
            >
              Login Again
            </button>
          )}
        </div>
      )}
      
      {/* Users Tab Content */}
      {activeTab === "users" && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">User List</h2>
            <button
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              onClick={fetchUsers}
              disabled={!authToken}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('userId')}
                    >
                      <div className="flex items-center">
                        User ID
                        <SortIndicator column="userId" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('balance')}
                    >
                      <div className="flex items-center">
                        Balance
                        <SortIndicator column="balance" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('rewards')}
                    >
                      <div className="flex items-center">
                        Rewards
                        <SortIndicator column="rewards" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referral Link
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('wasReferred')}
                    >
                      <div className="flex items-center">
                        Referred By
                        <SortIndicator column="wasReferred" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getSortedData(users).map((user) => (
                    <tr key={user.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{user.userId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${user.balance}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${user.rewards}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.referralLink}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.wasReferred ? (
                          <div>
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Referred
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              by {user.referredBy.email} (ID: {user.referredBy.userId})
                            </p>
                          </div>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            Direct
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-600">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Withdrawals Tab Content */}
      {activeTab === "withdrawals" && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Withdrawal Requests</h2>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                onClick={fetchWithdrawals}
                disabled={!authToken}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                onClick={() => setShowFilters(!showFilters)}
                disabled={!authToken}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
          
          {/* Filters section */}
          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Filter Withdrawals</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Status</label>
                  <select
                    className="w-full border rounded p-2"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="">All</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">User ID</label>
                  <input
                    type="text"
                    className="w-full border rounded p-2"
                    placeholder="Enter user ID"
                    value={filters.userId}
                    onChange={(e) => setFilters({...filters, userId: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">From Date</label>
                  <input
                    type="date"
                    className="w-full border rounded p-2"
                    value={filters.fromDate}
                    onChange={(e) => setFilters({...filters, fromDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">To Date</label>
                  <input
                    type="date"
                    className="w-full border rounded p-2"
                    value={filters.toDate}
                    onChange={(e) => setFilters({...filters, toDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading withdrawals...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('userId.userId')}
                    >
                      <div className="flex items-center">
                        User
                        <SortIndicator column="userId.userId" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('amount')}
                    >
                      <div className="flex items-center">
                        Amount
                        <SortIndicator column="amount" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('date')}
                    >
                      <div className="flex items-center">
                        Request Date
                        <SortIndicator column="date" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        <SortIndicator column="status" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getSortedData(withdrawals).map((withdrawal) => (
                    <tr key={withdrawal._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {withdrawal.userId?.userId || 'N/A'}
                          <p className="text-xs text-gray-500">{withdrawal.userId?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">${withdrawal.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(withdrawal.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{withdrawal.paymentMethod || 'Standard'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          withdrawal.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {withdrawal.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              className="flex items-center text-green-600 hover:text-green-800"
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setModalType("approve");
                                setModalOpen(true);
                              }}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </button>
                            <button
                              className="flex items-center text-red-600 hover:text-red-800"
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setModalType("reject");
                                setModalOpen(true);
                              }}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </button>
                          </div>
                        )}
                        {withdrawal.status !== 'pending' && (
                          <div className="text-gray-500 text-sm">
                            {withdrawal.status === 'approved' && (
                              <div>{withdrawal.transactionDetails || 'Approved'}</div>
                            )}
                            {withdrawal.status === 'rejected' && (
                              <div>{withdrawal.rejectionReason || 'Rejected'}</div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {withdrawals.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-600">
                  No withdrawal requests found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}