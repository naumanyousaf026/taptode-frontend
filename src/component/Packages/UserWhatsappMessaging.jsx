import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserWhatsappMessaging = () => {
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [whatsappNumbers, setWhatsappNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [mediaFile, setMediaFile] = useState(null);
  const fileInputRef = useRef(null);
  const mediaInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch active subscription on mount
  useEffect(() => {
    const fetchActiveSubscription = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/active-subscription', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        if (response.data && response.data.success) {
          const subscription = response.data.data;
          
          // Redirect to WhatsApp group page if user has package type 3
          if (subscription.packageType === 3) {
            navigate("/whatsapp-groups");
            return;
          }
          
          setActiveSubscription(subscription);
          
          // If user has active subscription, fetch their WhatsApp numbers
          if (subscription.isActive) {
            fetchWhatsappNumbers(subscription._id);
          }
        } else {
          setError("No active subscription found. Please purchase a package.");
        }
      } catch (err) {
        console.error("Error fetching active subscription:", err);
        setError(err.response?.data?.message || "Failed to fetch subscription information");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSubscription();
  }, [navigate]);

  const fetchWhatsappNumbers = async (subscriptionId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/whatsapp-numbers/${subscriptionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.data && response.data.success) {
        setWhatsappNumbers(response.data.data);
      } else {
        setError("Failed to load WhatsApp numbers");
      }
    } catch (err) {
      console.error("Error fetching WhatsApp numbers:", err);
      setError(err.response?.data?.message || "Failed to fetch WhatsApp numbers");
    }
  };

  const handleFileChange = (e) => {
    setFileToUpload(e.target.files[0]);
  };

  const handleMediaChange = (e) => {
    setMediaFile(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    if (!activeSubscription.isActive) {
      alert("Your subscription is not active yet. Please wait for admin verification.");
      return;
    }
    
    if (!fileToUpload) {
      alert("Please select an Excel or PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("subscriptionId", activeSubscription._id);
    
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
      fetchWhatsappNumbers(activeSubscription._id); // Refresh data
      setFileToUpload(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setUploadStatus("error");
      setError(err.response?.data?.message || "Failed to upload file. Please try again.");
    }
  };

  const toggleSelectAll = () => {
    if (selectedNumbers.length === whatsappNumbers.length) {
      setSelectedNumbers([]);
    } else {
      setSelectedNumbers(whatsappNumbers.map(number => number._id));
    }
  };

  const toggleSelectNumber = (numberId) => {
    if (selectedNumbers.includes(numberId)) {
      setSelectedNumbers(selectedNumbers.filter(id => id !== numberId));
    } else {
      setSelectedNumbers([...selectedNumbers, numberId]);
    }
  };

  const handleSendMessage = async () => {
    if (selectedNumbers.length === 0) {
      alert("Please select at least one WhatsApp number");
      return;
    }

    if (!message.trim() && !mediaFile) {
      alert("Please enter a message or select a media file");
      return;
    }

    setSending(true);
    setSendProgress(0);

    const formData = new FormData();
    formData.append("message", message);
    formData.append("numbers", JSON.stringify(selectedNumbers));
    if (mediaFile) {
      formData.append("media", mediaFile);
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/send-message",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data"
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setSendProgress(percentCompleted);
          }
        }
      );

      alert(response.data.message || "Message sent successfully");
      setMessage("");
      setMediaFile(null);
      if (mediaInputRef.current) {
        mediaInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alert(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
      setSendProgress(0);
    }
  };

  const filteredNumbers = whatsappNumbers.filter(number => 
    number.phoneNumber.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!activeSubscription || !activeSubscription.isActive) {
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Active Subscription</h2>
          <p className="text-gray-600 mb-6">You don't have an active subscription. Please purchase a package to use this feature.</p>
          <button
            onClick={() => navigate("/packages")}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Packages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">WhatsApp Numbers Management</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {/* Subscription Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {activeSubscription.packageId?.name || `Package ${activeSubscription.packageType}`}
              </h2>
              <p className="text-gray-600">
                {new Date(activeSubscription.endDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })}
              </p>
            </div>
            <div className="mt-3 sm:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Active
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Your Numbers</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Numbers:</span>
                <span className="font-bold text-blue-600">{whatsappNumbers.length}</span>
              </div>
              {activeSubscription.packageId?.maxNumbers > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (whatsappNumbers.length / activeSubscription.packageId.maxNumbers) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>{whatsappNumbers.length} used</span>
                    <span>{activeSubscription.packageId.maxNumbers} max</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Upload Numbers</h3>
              <form onSubmit={handleFileUpload} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-grow">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept=".xlsx,.xls,.pdf"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                  disabled={!fileToUpload || uploadStatus === "uploading"}
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
                    "Upload"
                  )}
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2">Upload Excel or PDF file with WhatsApp numbers</p>
            </div>
          </div>
        </div>
        
        {/* Message sending panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Send Messages</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="4"
                placeholder="Type your message here..."
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attach Media (optional)</label>
              <input
                type="file"
                onChange={handleMediaChange}
                ref={mediaInputRef}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                accept="image/*,video/*"
              />
              {mediaFile && (
                <div className="mt-2 text-sm text-green-600">
                  Media selected: {mediaFile.name}
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Selected: {selectedNumbers.length} out of {whatsappNumbers.length}
                </label>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedNumbers.length === whatsappNumbers.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={sending || selectedNumbers.length === 0 || (!message.trim() && !mediaFile)}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300"
              >
                {sending ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending... {sendProgress}%
                  </div>
                ) : (
                  "Send Message"
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* WhatsApp Numbers List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Your WhatsApp Numbers</h2>
            
            <div className="mt-3 sm:mt-0">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search numbers..."
                className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {whatsappNumbers.length === 0 ? (
            <div className="text-center py-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-1">No WhatsApp Numbers Yet</h3>
              <p className="text-gray-600">Upload your WhatsApp numbers to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedNumbers.length === whatsappNumbers.length}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Number
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Message
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNumbers.map((number) => (
                    <tr key={number._id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedNumbers.includes(number._id)}
                          onChange={() => toggleSelectNumber(number._id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{number.phoneNumber}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          number.status === 'active' ? 'bg-green-100 text-green-800' : 
                          number.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {number.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {number.source || 'User Upload'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {number.lastMessageDate ? new Date(number.lastMessageDate).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredNumbers.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500">No numbers found matching your search</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserWhatsappMessaging;