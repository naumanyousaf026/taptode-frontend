import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const SubscriptionDetail = () => {
  const { subscriptionId } = useParams();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [systemNumbersStatus, setSystemNumbersStatus] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptionDetails();
  }, [subscriptionId]);

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/subscription/${subscriptionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.data && response.data.success) {
        setSubscription(response.data.data);
      } else {
        setError("Failed to load subscription details");
      }
    } catch (err) {
      console.error("Error fetching subscription details:", err);
      setError(err.response?.data?.message || "Failed to fetch subscription details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    if (!subscription.isActive) {
      alert("Your subscription is not active yet. Please wait for admin verification.");
      return;
    }
    
    const formData = new FormData();
    const file = fileInputRef.current.files[0];
    
    if (!file) {
      alert("Please select an Excel or PDF file");
      return;
    }

    formData.append("file", file);
    formData.append("subscriptionId", subscriptionId);
    
    setUploadStatus("uploading");
    
    try {
      const response = await axios.post("http://localhost:5000/api/upload-numbers", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        }
      });
      
      setUploadStatus("success");
      alert(response.data.message);
      fetchSubscriptionDetails(); // Refresh data
    } catch (err) {
      console.error("Error uploading file:", err);
      setUploadStatus("error");
      setError(err.response?.data?.message || "Failed to upload file. Please try again.");
    }
  };

  const handleAssignSystemNumbers = async () => {
    if (!subscription.isActive) {
      alert("Your subscription is not active yet. Please wait for admin verification.");
      return;
    }
    
    if (subscription.packageType !== 3 && !subscription.packageId?.fetchFromGroups) {
      alert("Only Package 3 subscribers can access system numbers");
      return;
    }
    
    setSystemNumbersStatus("loading");
    
    try {
      const response = await axios.post("http://localhost:5000/api/assign-system-numbers", 
        { subscriptionId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      setSystemNumbersStatus("success");
      alert(response.data.message);
      fetchSubscriptionDetails(); // Refresh data
    } catch (err) {
      console.error("Error assigning system numbers:", err);
      setSystemNumbersStatus("error");
      setError(err.response?.data?.message || "Failed to assign system numbers. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-gray-50 min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Subscription Not Found</h2>
          <p className="text-gray-600 mb-6">The subscription you're looking for doesn't exist or has expired.</p>
          <button
            onClick={() => navigate("/my-subscriptions")}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to My Subscriptions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/my-subscriptions")}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Subscription Details</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {subscription.subscription.packageId?.name || `Package ${subscription.packageType}`}
                </h2>
                <p className="text-gray-600">
                  Valid until: {formatDate(subscription.subscription.endDate)}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium 
                    ${
                      subscription.paymentStatus === "completed"
                        ? "bg-green-100 text-green-800"
                        : subscription.paymentStatus === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                >
                  {subscription.paymentStatus.charAt(0).toUpperCase() + subscription.paymentStatus.slice(1)}
                </span>
                {subscription.adminVerified && (
                  <p className="text-sm text-gray-500 mt-1">
                    Verified on {formatDate(subscription.subscription.adminVerifiedDate)}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Subscription Status</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${subscription.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span>Subscription Status: <strong>{subscription.isActive ? 'Active' : 'Inactive'}</strong></span>
                </li>
                <li className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${subscription.adminVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>Admin Verification: <strong>{subscription.adminVerified ? 'Verified' : 'Pending'}</strong></span>
                </li>
                <li>
                  <span>Package Type: <strong>Package {subscription.packageType}</strong></span>
                </li>
              </ul>
            </div>

            {!subscription.isActive && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Your subscription is pending admin verification. Once verified, you'll be able to upload WhatsApp numbers and access all features.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp Numbers Management Section */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">WhatsApp Numbers Management</h3>
              
              {/* Upload Your Numbers */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Upload Your Numbers</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Upload a list of WhatsApp numbers in Excel or PDF format.
                  {subscription.subscription.packageId?.maxNumbers > 0 && ` Maximum ${subscription.subscription.packageId.maxNumbers} numbers allowed.`}
                </p>
                
                {subscription.numberListFile ? (
                  <div className="bg-green-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center text-green-800">
                      <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium">File Uploaded: {subscription.numberListFile.fileName}</p>
                        <p className="text-sm">
                          {subscription.userProvidedNumbersCount} numbers extracted on {formatDate(subscription.numberListFile.uploadDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleFileUpload} className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".xlsx,.xls,.pdf"
                        disabled={!subscription.canUploadNumbers}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`py-2 px-4 text-sm ${
                          subscription.canUploadNumbers
                            ? "text-blue-600 hover:text-blue-700"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!subscription.canUploadNumbers}
                      >
                        Select Excel or PDF file
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        {fileInputRef.current?.files?.[0]?.name || "No file selected"}
                      </p>
                    </div>
                    <button
                      type="submit"
                      className={`w-full py-2 px-4 rounded-lg ${
                        subscription.canUploadNumbers
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                      disabled={!subscription.canUploadNumbers || uploadStatus === "uploading"}
                    >
                      {uploadStatus === "uploading" ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </span>
                      ) : (
                        "Upload WhatsApp Numbers"
                      )}
                    </button>
                  </form>
                )}
                
                {!subscription.canUploadNumbers && !subscription.numberListFile && (
                  <div className="text-sm text-gray-500 mt-2">
                    {!subscription.isActive
                      ? "You need an active subscription to upload numbers."
                      : "You cannot upload numbers at this time."}
                  </div>
                )}
              </div>
              
              {/* System Numbers (Only for Package 3) */}
              {(subscription.packageType === 3 || subscription.packageId?.fetchFromGroups) && (
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">System Numbers</h4>
                      <p className="text-gray-600 text-sm">
                        Access numbers from our system database.
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-gray-800">
                        {subscription.systemNumbersCount || 0} numbers assigned
                      </span>
                    </div>
                  </div>
                  
                  {subscription.systemNumbersAssigned ? (
                    <div className="bg-green-50 p-3 rounded-lg mb-4">
                      <div className="flex items-center text-green-800">
                        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-medium">System Numbers Assigned</p>
                          <p className="text-sm">
                            {subscription.systemNumbersCount} numbers assigned on {formatDate(subscription.systemNumbersAssignedDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleAssignSystemNumbers}
                      className={`w-full py-2 px-4 rounded-lg ${
                        subscription.isActive
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                      disabled={!subscription.isActive || systemNumbersStatus === "loading"}
                    >
                      {systemNumbersStatus === "loading" ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Assigning...
                        </span>
                      ) : (
                        "Assign System Numbers"
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Usage Statistics */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Usage Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h4 className="font-medium text-gray-800 mb-3">WhatsApp Numbers</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Your Uploaded Numbers:</span>
                    <span className="font-medium">{subscription.userProvidedNumbersCount || 0}</span>
                  </div>
                  {(subscription.packageType === 3 || subscription.packageId?.fetchFromGroups) && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">System Numbers:</span>
                      <span className="font-medium">{subscription.systemNumbersCount || 0}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-gray-800">Total Numbers:</span>
                    <span className="text-blue-600">{(subscription.userProvidedNumbersCount || 0) + (subscription.systemNumbersCount || 0)}</span>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h4 className="font-medium text-gray-800 mb-3">Package Details</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Package Type:</span>
                    <span className="font-medium">Package {subscription.packageType}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{subscription.subscription.duration || 30} days</span>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-gray-800">Expires on:</span>
                    <span className="text-blue-600">{formatDate(subscription.subscription.endDate)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Customer Support */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Need Help?</h3>
                <p className="text-gray-600 text-sm mb-3">
                  If you have any questions about your subscription or need assistance with WhatsApp number management, our support team is here to help.
                </p>
                <a
                  href="mailto:support@example.com"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetail;