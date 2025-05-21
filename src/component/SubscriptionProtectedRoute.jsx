import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const SubscriptionProtectedRoute = ({ children, requiredPackageType }) => {
  const [loading, setLoading] = useState(true);
  const [hasValidSubscription, setHasValidSubscription] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/api/my-subscriptions', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && response.data.success) {
          const subscriptions = response.data.data;
          
          const validSubscription = subscriptions.find(sub => {
            // First check payment status
            if (sub.paymentStatus !== "completed") {
              return false;
            }
            
            // Then check package type if required
            if (requiredPackageType) {
              // Handle both single value and array of package types
              const packageTypes = Array.isArray(requiredPackageType) 
                ? requiredPackageType 
                : [requiredPackageType];
                
              // Check if user's package type is in the allowed types
              return packageTypes.includes(parseInt(sub.packageType));
            }
            
            // If no specific package type required, any completed subscription is valid
            return true;
          });
          
          setHasValidSubscription(!!validSubscription);
        } else {
          setHasValidSubscription(false);
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setHasValidSubscription(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, [requiredPackageType, location.pathname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008069]"></div>
      </div>
    );
  }

  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasValidSubscription) {
    // Critical fix: Use "MySubscriptions" path (notice it's uppercase M, same as in the router)
    return <Navigate to="/MySubscriptions" state={{ 
      from: location, 
      paymentRequired: true,
      requiredPackage: requiredPackageType 
    }} replace />;
  }

  return children;
};

export default SubscriptionProtectedRoute;