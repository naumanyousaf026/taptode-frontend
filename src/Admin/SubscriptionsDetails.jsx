import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SubscriptionsDetails = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    packageType: ""
  });

  // Fetch subscriptions data from API
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        
        // Build query string for filters
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append("status", filters.status);
        if (filters.packageType) queryParams.append("packageType", filters.packageType);
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
        
        // For testing/development, use a hardcoded token if needed
        // In production, you should get this from your authentication system
        const authToken = localStorage.getItem("authToken") || "your-development-token";
        
        const response = await axios.get(
          `http://localhost:5000/api/admin/all-subscriptions${queryString}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        );

        if (response.data.success) {
          setSubscriptions(response.data.data);
        } else {
          setError("Failed to fetch subscriptions");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching data");
        console.error("Error fetching subscriptions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [filters]);

  const handleBack = () => {
    navigate("/admin/dashboard"); // Adjust this path as per your routing
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (err) {
      return "Invalid Date";
    }
  };

  // Get status classes for styling
  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get package name from package id
  const getPackageName = (subscription) => {
    if (subscription.packageId && subscription.packageId.name) {
      return subscription.packageId.name;
    }
    return `Package Type ${subscription.packageType || 'Unknown'}`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subscription Details</h1>
        <button 
          onClick={handleBack} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package Type
            </label>
            <select
              name="packageType"
              value={filters.packageType}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All Packages</option>
              <option value="1">Basic</option>
              <option value="2">Standard</option>
              <option value="3">Premium</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading subscriptions...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error!</p>
          <p>{error}</p>
        </div>
      )}

      {/* Subscriptions Table */}
      {!loading && !error && subscriptions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Package</th>
                <th className="px-4 py-2 text-left">Start Date</th>
                <th className="px-4 py-2 text-left">End Date</th>
                <th className="px-4 py-2 text-left">Payment ID</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Verified</th>
                <th className="px-4 py-2 text-left">Active</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 truncate max-w-xs" title={sub._id}>
                    {sub._id.substring(0, 8)}...
                  </td>
                  <td className="px-4 py-2">
                    {sub.userId ? (
                      <span>
                        {sub.userId.name || "Unknown"}
                        <div className="text-xs text-gray-500">
                          {sub.userId.email || "No email"}
                        </div>
                      </span>
                    ) : (
                      "No User Data"
                    )}
                  </td>
                  <td className="px-4 py-2">{getPackageName(sub)}</td>
                  <td className="px-4 py-2">{formatDate(sub.startDate)}</td>
                  <td className="px-4 py-2">{formatDate(sub.endDate)}</td>
                  <td className="px-4 py-2">
                    <span className="text-xs">{sub.paymentId || "N/A"}</span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(sub.paymentStatus)}`}>
                      {sub.paymentStatus || "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {sub.adminVerified ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {sub.isActive ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No Results Message */}
      {!loading && !error && subscriptions.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded">
          <p className="text-gray-500">No subscriptions found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsDetails;