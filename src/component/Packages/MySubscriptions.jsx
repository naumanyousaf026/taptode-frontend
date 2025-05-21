import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import NavigationBar from '../Header';
import Header from '../Header_1';

const MySubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentNotification, setShowPaymentNotification] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showRetryMessage, setShowRetryMessage] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchSubscriptions();
    
    // Check if redirected from a protected route due to payment requirement
    if (location.state?.paymentRequired) {
      setShowPaymentNotification(true);
      setTimeout(() => {
        setShowPaymentNotification(false);
      }, 7000); // Show for longer time (7 seconds) since this is important
    }
  }, [location]);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/my-subscriptions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.data && response.data.success) {
        const updatedSubscriptions = response.data.data;
        setSubscriptions(updatedSubscriptions);

        // Find a subscription with "completed" payment status
        const completedSubscription = updatedSubscriptions.find(
          sub => sub.paymentStatus === "completed"
        );

        if (completedSubscription) {
          handleCompletedSubscription(completedSubscription);
        }

        // Handle status change to "pending" and show retry message after 1 minute
        const pendingSubscription = updatedSubscriptions.find(
          sub => sub.paymentStatus === "pending"
        );

        if (pendingSubscription) {
          handlePendingSubscription(pendingSubscription);
        }
      } else {
        setError("Failed to load subscriptions");
      }
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      setError(err.response?.data?.message || "Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleCompletedSubscription = (completedSubscription) => {
    // We don't want to automatically redirect anymore
    // Let the user choose when to start the campaign
  };

  const handlePendingSubscription = (subscription) => {
    // Wait for 1 minute (60 seconds) to check if the status changes
    setTimeout(() => {
      // If the subscription status is still "pending", show the retry message
      setShowRetryMessage(true);
    }, 60000); // 60 seconds = 1 minute
  };

  const handleManageSubscription = (subscription) => {
    if (subscription.paymentStatus !== "completed") {
      setShowPaymentNotification(true);
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setShowPaymentNotification(false);
      }, 5000);
      
      return;
    }
    
    // If payment status is completed, proceed to subscription details
    navigate(`/subscription/${subscription._id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Create a function to handle the "Start Campaign" button
  const handleStartCampaign = (subscription) => {
    // Only allow navigation if payment status is "completed"
    if (subscription.paymentStatus === "completed") {
      setShowAnimation(true);
      
      setTimeout(() => {
        if (subscription.packageType === 3) {
          navigate("/message-sending");
        } else {
          navigate("/small-package-sending");
        }
      }, 1000);
    } else {
      setShowPaymentNotification(true);
      setTimeout(() => {
        setShowPaymentNotification(false);
      }, 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008069]"></div>
      </div>
    );
  }

  // Animation component that appears when redirecting after completed payment
  const LoadingAnimation = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
      <div className="text-center">
        <div className="animate-bounce mb-4">
          <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-[#008069] mx-auto"></div>
        </div>
        <p className="text-xl font-medium text-gray-800">Processing your subscription...</p>
        <p className="text-gray-600">Please wait while we redirect you</p>
      </div>
    </div>
  );

  // Payment notification component - now with dynamic message
  const PaymentNotification = () => (
    <div className="fixed top-6 right-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50 max-w-md animate-fade-in">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            {location.state?.paymentRequired 
              ? "You need a completed payment subscription to access this feature. Please complete your payment before proceeding." 
              : "Please complete your payment before proceeding"}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavigationBar />
      <Header />
      {showAnimation && <LoadingAnimation />}
      {showPaymentNotification && <PaymentNotification />}
      
      {/* Show retry message if the subscription status is still pending after 1 minute */}
      {showRetryMessage && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg max-w-md mx-auto mb-6 mt-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                Your payment is still pending. Please purchase the package again to proceed.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#008069] mb-8">My Subscriptions</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Display message if redirected from protected route */}
        {location.state?.paymentRequired && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg mb-6 animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">
                  <strong>Access Restricted:</strong> You need a subscription with completed payment to access that page. 
                  Please complete your payment or purchase a package below.
                </p>
              </div>
            </div>
          </div>
        )}

        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-[#008069] mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-gray-600 mb-6">You don't have any active subscriptions yet.</p>
            <Link
              to="/packages"
              className="inline-block bg-[#008069] text-white py-3 px-8 rounded-lg hover:bg-opacity-90 transition-colors font-medium shadow-md"
            >
              Browse Packages
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {subscriptions.map((subscription) => (
              <div
                key={subscription._id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-[#008069]">
                        {subscription.packageId?.name || `Package ${subscription.packageType}`}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        Valid until: {formatDate(subscription.endDate)}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                        subscription.paymentStatus
                      )}`}
                    >
                      {subscription.paymentStatus.charAt(0).toUpperCase() +
                        subscription.paymentStatus.slice(1)}
                    </span>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => subscription.isActive 
                        ? handleManageSubscription(subscription) 
                        : handleStartCampaign(subscription)
                      }
                      className={`py-2.5 px-6 rounded-lg inline-block font-medium transition-colors ${
                        subscription.paymentStatus !== "completed"
                          ? "bg-gray-200 text-gray-700 cursor-not-allowed"
                          : "bg-[#008069] text-white hover:bg-opacity-90 shadow-sm"
                      }`}
                    >
                      {subscription.isActive ? "Manage Subscription" : "Start Campaign"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubscriptions;