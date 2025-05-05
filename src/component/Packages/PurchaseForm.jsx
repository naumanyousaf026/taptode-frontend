import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../Header";
import Header from "../Header_1";

const PurchaseForm = () => {
  const [formData, setFormData] = useState({
    packageId: "",
    method: "jazzcash",
    mobileNumber: "",
    transactionId: "",
    payerName: ""
  });
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const navigate = useNavigate();

  // Fetch packages when component mounts
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/all-packages');
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setPackages(response.data.data);
        } else {
          setError('Failed to load packages');
        }
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Failed to load packages. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Update selected package when packageId changes
  useEffect(() => {
    if (formData.packageId) {
      const pkg = packages.find(p => p._id === formData.packageId);
      setSelectedPackage(pkg);
    } else {
      setSelectedPackage(null);
    }
  }, [formData.packageId, packages]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.packageId) {
      alert("Please select a package");
      return;
    }

    const amount = selectedPackage ? selectedPackage.price : 0;

    const payload = {
      packageId: formData.packageId,
      paymentDetails: {
        amount,
        method: formData.method,
        mobileNumber: formData.mobileNumber,
        transactionId: formData.transactionId,
        payerName: formData.payerName
      }
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/purchase-package",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }
      );

      alert("Package purchased successfully! Your subscription is pending admin approval.");
      console.log(res.data);
      
      // Redirect to subscriptions management page
      navigate("/my-subscriptions");
      
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Failed to purchase package. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50  ">
      <NavigationBar />
      <Header />
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto  bg-white mt-10 mb-20 p-8 rounded-xl shadow-md space-y-6"
      >
        <h2 className="text-2xl font-bold roboto-thin mb-6 text-center text-[#008069]">Purchase Package</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm roboto-thin font-semibold text-gray-700">Select Package</label>
          <div className="flex items-center px-2 border-2 border-[#9CA3AF] rounded-md">
          <select
            name="packageId"
            value={formData.packageId}
            onChange={handleChange}
            className="w-full py-[10px] roboto-thin sm:py-2 outline-none rounded-md border-[#9CA3AF] bg-transparent"
            required
          >
            <option value="" className="roboto-thin">-- Select a Package --</option>
            {packages.map(pkg => (
              <option key={pkg._id} value={pkg._id} className="roboto-thin">
                {pkg.name} - ${pkg.price} ({pkg.validityDays} days)
                {pkg.fetchFromGroups ? " - With System Numbers" : ""}
              </option>
            ))}
          </select>
          </div>
        </div>

        {selectedPackage && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold roboto-thin text-gray-800 mb-2">Package Details</h3>
            
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="roboto-thin">• Valid for {selectedPackage.validityDays} days</li>
              <li className="roboto-thin">• {selectedPackage.maxNumbers > 0 ? `Up to ${selectedPackage.maxNumbers} WhatsApp numbers` : 'Unlimited WhatsApp numbers'}</li>
              {selectedPackage.packageType === 3 || selectedPackage.fetchFromGroups ? (
                <li className="roboto-thin">• Access to system WhatsApp numbers</li>
              ) : null}
              <li className="roboto-thin">• Upload numbers via Excel or PDF</li>
              <li className="text-gray-500 italic mt-2">Payment requires admin verification before activation</li>
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Payment Method</label>
          <div className="flex items-center px-2 border-2 py-2 border-[#9CA3AF] rounded-md">
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="method"
                value="jazzcash"
                checked={formData.method === "jazzcash"}
                onChange={handleChange}
                className="text-blue-600  focus:ring-blue-500"
              />
              <span className="roboto-thin">JazzCash</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="method"
                value="easypaisa"
                checked={formData.method === "easypaisa"}
                onChange={handleChange}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="roboto-thin">EasyPaisa</span>
            </label>
          </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm roboto-thin  font-semibold  text-gray-700">Mobile Number</label>
          <div className="flex items-center px-2 border-2 border-[#9CA3AF] rounded-md">
          <input
            type="text"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            placeholder="e.g., 03001234567"
            className="w-full py-[10px] sm:py-2 outline-none rounded-md border-[#9CA3AF] bg-transparent"
            required
          />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold roboto-thin text-gray-700">Transaction ID</label>
          <div className="flex items-center px-2 border-2 border-[#9CA3AF] rounded-md">
          <input
            type="text"
            name="transactionId"
            value={formData.transactionId}
            onChange={handleChange}
            placeholder="Enter transaction ID from payment app"
            className="w-full py-[10px] sm:py-2 outline-none rounded-md border-[#9CA3AF] bg-transparent"
            required
          />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold roboto-thin text-gray-700">Payer Name</label>
          <div className="flex items-center px-2 border-2 border-[#9CA3AF] rounded-md">
          <input
            type="text"
            name="payerName"
            value={formData.payerName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full py-[10px] sm:py-2 outline-none rounded-md border-[#9CA3AF] bg-transparent"
            required
          />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#008069]   text-white py-3 px-4 rounded-lg  font-medium"
        >
          Complete Purchase
        </button>
      </form>
    </div>
  );
};

export default PurchaseForm;