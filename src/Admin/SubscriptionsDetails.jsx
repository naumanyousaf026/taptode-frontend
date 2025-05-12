import React, { useState, useEffect } from "react";

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState({});

  // Fetch subscriptions data
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      
      // Get auth token from storage
      const authToken = localStorage.getItem("authToken");
      
      const response = await fetch(
        "http://localhost:5000/api/admin/all-subscriptions",
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setSubscriptions(data.data);
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

  // Get status styling
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
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

  // Get package name
  const getPackageName = (packageType) => {
    switch (packageType) {
      case 1: return "Basic";
      case 2: return "Standard";
      case 3: return "Premium";
      default: return `Type ${packageType}`;
    }
  };

  // Toggle verification status
  const toggleVerification = async (subscriptionId, currentValue) => {
    try {
      setUpdateLoading(prev => ({ ...prev, [subscriptionId]: true }));
      
      const authToken = localStorage.getItem("authToken");
      
      // Use the verify-payment endpoint as it's already set up in the backend
      const response = await fetch(
        `http://localhost:5000/api/verify-payment`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            subscriptionId: subscriptionId,
            approvalStatus: !currentValue 
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update local state with the change
        setSubscriptions(prevSubscriptions => 
          prevSubscriptions.map(sub => 
            sub._id === subscriptionId 
              ? { 
                  ...sub, 
                  adminVerified: !currentValue,
                  paymentStatus: !currentValue ? "completed" : "pending",
                  isActive: !currentValue
                } 
              : sub
          )
        );
      } else {
        setError(`Failed to update verification: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Error updating verification: ${err.message || 'Unknown error'}`);
      console.error("Error updating subscription verification:", err);
    } finally {
      setUpdateLoading(prev => ({ ...prev, [subscriptionId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error!</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>
      
      {/* Subscriptions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-500" title={sub.userId?._id}>
                  {sub.userId?._id ? `${sub.userId._id.substring(0, 6)}...` : "N/A"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                  {sub.userId?.name || "Unknown"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {sub.userId?.phone || sub.userId?.mobile || "N/A"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {getPackageName(sub.packageType)}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {formatDate(sub.startDate)}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {sub.paymentId || "N/A"}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(sub.paymentStatus)}`}>
                    {sub.paymentStatus || "Unknown"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => toggleVerification(sub._id, sub.adminVerified)}
                    disabled={updateLoading[sub._id]}
                    className={`px-3 py-1 rounded text-white text-sm ${
                      sub.adminVerified 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "bg-gray-400 hover:bg-gray-500"
                    }`}
                  >
                    {updateLoading[sub._id] 
                      ? "..." 
                      : sub.adminVerified 
                        ? "Approved" 
                        : "Approve"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Results Message */}
      {subscriptions.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded">
          <p className="text-gray-500">No subscriptions found.</p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;