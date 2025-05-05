import React, { useEffect, useState } from "react";
import axios from "axios";
import NavigationBar from '../Header'
import Header from '../Header_1'
import { useNavigate } from "react-router-dom"; // Import for navigation

export default function LastConnectedUser() {
  const navigate = useNavigate(); // Initialize navigate function
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showLimits, setShowLimits] = useState(false); // State to toggle limits display

  const fetchLastConnectedUser = async () => { 
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/last-connected", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUserData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLastConnectedUser();
  }, [refreshKey]);

  const handleDelete = async () => {
    if (!userData?.uniqueId) {
      alert("Required data is missing!");
      return;
    }
  
    setDeleting(true);
  
    try {
      const response = await axios.delete(
        "http://localhost:5000/api/delete-wa-account",
        {
          params: { unique: userData.uniqueId },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );
  
      if (response.data.message === "Account deleted successfully") {
        setUserData(prev => ({
          ...prev,
          status: "Disconnected"
        }));
        
        setTimeout(() => {
          setRefreshKey(prevKey => prevKey + 1);
          alert("Deleted successfully!");
        }, 500);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Deletion failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleWithdrawClick = () => {
    navigate("/withdraw"); // Navigate to withdraw page
  };

  const toggleLimitsDisplay = () => {
    setShowLimits(!showLimits);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-16 h-16 border-4 border-[#008069] border-t-[#ffdd59] rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-[#008069] font-medium">Loading user data...</p>
    </div>
  );

  if (error || !userData) {
    return (
      <div>
        <div>
          <Header />
        </div>
        <div>
          <NavigationBar />
        </div>
        <div className="flex flex-col items-center justify-center mt-16 px-4">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-[#008069] bg-opacity-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#008069" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#008069] mb-2">No WhatsApp Connection</h2>
            <p className="text-gray-600 mb-6">
              {error ? "There was a problem connecting to WhatsApp. Please try again later." : 
              "You don't have any connected WhatsApp account yet. Please connect your WhatsApp to continue."}
            </p>
            <button
              onClick={() => navigate('/state')}
              className="px-6 py-3 bg-gradient-to-r from-[#008069] to-[#00a884] text-white font-medium rounded-lg shadow-md hover:scale-105 transition-transform"
            >
              Connect WhatsApp
            </button>
          </div>
          
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md max-w-md">
            <h3 className="text-xl font-semibold text-[#008069] mb-4">Why Connect WhatsApp?</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="mr-2 text-[#ffdd59] font-bold">•</span>
                <span className="text-gray-700">Withdraw earnings to your account</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-[#ffdd59] font-bold">•</span>
                <span className="text-gray-700">Receive real-time notifications</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-[#ffdd59] font-bold">•</span>
                <span className="text-gray-700">Manage your transactions easily</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const randomProfileImage = `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
  const statusColorClass = userData.status === "Connected" ? "text-green-500" : "text-red-500";

  return (
    <div>
      <div>
        <Header />
      </div>
      <div>
        <NavigationBar />
      </div>
      <div className="mt-8 bg-[#008069] p-4 mx-3 rounded-lg shadow-xl text-center relative">
        <h2 className="text-3xl font-semibold roboto-slab text-[#ffdd59]">Rs {userData.balance}</h2>
        <p className="text-lg sm:text-xl sans text-gray-300 mt-2">Last Connected User</p>
        <p className="text-sm sans text-gray-400 italic mt-1">Real-time updates</p>
        
        {/* Payment limits information */}
        <div className="mt-4">
          <button 
            onClick={toggleLimitsDisplay}
            className="text-sm font-medium text-[#ffdd59] underline mb-2"
          >
            {showLimits ? "Hide Payment Limits" : "View Payment Limits"}
          </button>
          
          {showLimits && (
            <div className="bg-white bg-opacity-10 p-3 rounded-lg mt-2 text-left">
              <h4 className="text-[#ffdd59] font-semibold mb-2 text-center">Withdrawal Limits</h4>
              <ul className="text-white text-sm">
                <li className="mb-1">• First withdrawal: Rs 500</li>
                <li className="mb-1">• Second withdrawal: Rs 2,200</li>
                <li className="mb-1">• Third withdrawal: Rs 5,500</li>
                <li className="mb-1">• Subsequent withdrawals: Rs 10,000</li>
                <li className="mb-1">• Maximum limit: Rs 55,000</li>
              </ul>
            </div>
          )}
        </div>
        
        {/* Withdraw button */}
        <button
          onClick={handleWithdrawClick}
          className="w-full mt-4 px-4 py-3 roboto-slab bg-gradient-to-r from-[#ffdd59] to-[#ffa801] text-[#008069] font-bold rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          Request Withdrawal
        </button>
      </div>

      <div className="mt-8 p-6 mx-3 rounded-lg shadow-md bg-white">
        <div className="flex items-center">
          <img
            src={randomProfileImage}
            alt="Profile"
            className={`w-20 h-20 rounded-full border-4 ${userData.status === "Connected" ? "border-green-500" : "border-red-500"} shadow-md`}
          />
          <div className="ml-6">
            <h3 className="text-xl sm:text-2xl roboto-slab font-semibold text-[#008069]">
              WhatsApp ID: {userData.whatsappId}
            </h3>
            <p className={`text-sm font-medium ${statusColorClass}`}>
              Status: {userData.status}
            </p>
            <p className={`text-sm sans font-medium ${userData.status === "Connected" ? "text-green-400" : "text-red-400"}`}>
              {userData.status === "Connected" ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div>
            <p className="text-sm roboto-slab text-[#008069]">Last Connected At</p>
            <p className="text-2xl sm:text-3xl font-bold roboto-slab text-[#ffdd59]">
              {new Date(userData.lastConnectedAt).toLocaleString()}
            </p>
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting || userData.status === "Disconnected"}
            className="px-4 py-2 mr-4 roboto-slab bg-gradient-to-r from-red-500 to-red-700 text-white font-bold rounded-lg shadow-md hover:scale-105 transition-transform disabled:opacity-50"
          >
            {deleting ? "Deleting..." : userData.status === "Disconnected" ? "Deleted" : "Go Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}