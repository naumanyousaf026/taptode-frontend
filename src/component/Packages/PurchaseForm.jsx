import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import NavigationBar from "../Header";
import Header from "../Header_1";

const PurchaseForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize state and check for package selection from previous page
  const [formData, setFormData] = useState({
    packageId: location.state?.packageId || "",
    method: "easypaisa", // Default to easypaisa
    senderPhoneNumber: "",
    senderAccountName: "", // Added account name field
    transactionId: "",
    paymentScreenshot: null
  });

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);
  const [fileName, setFileName] = useState("No file chosen");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitResponse, setSubmitResponse] = useState(null);

  // Payment account information - updated with only JazzCash and Easypaisa
  const paymentAccounts = {
    jazzcash: {
      number: "03497666510",
      accountName: "Nauman yousaf"
    },
    easypaisa: {
      number: "03111731625",
      accountName: "Nauman yousaf"
    }
  };

  // Fetch packages when component mounts
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/all-packages");
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setPackages(response.data.data);

          // If a package ID was passed from the previous page, select it automatically
          if (location.state?.packageId) {
            const pkg = response.data.data.find((p) => p._id === location.state.packageId);
            if (pkg) {
              setSelectedPackage(pkg);
              setFormData((prev) => ({
                ...prev,
                packageId: pkg._id,
                packageType: mapPackageType(pkg.name)
              }));
            }
          }
        } else {
          setError("Failed to load packages");
        }
      } catch (err) {
        console.error("Error fetching packages:", err);
        setError("Failed to load packages. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [location.state?.packageId]);

  const mapPackageType = (packageName) => {
    if (packageName === "Basic") return 1;
    if (packageName === "Standard") return 2;
    if (packageName === "Premium") return 3;
    return 1; // Default to Basic
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file size - limit to 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Maximum size is 5MB.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        paymentScreenshot: file
      }));
      setFileSelected(true);
      setFileName(file.name);
    }
  };

  const validateForm = () => {
    if (!formData.packageId) {
      alert("Please select a package");
      return false;
    }

    if (!formData.paymentScreenshot) {
      alert("Please upload your payment screenshot");
      return false;
    }

    if (!formData.senderPhoneNumber) {
      alert("Please enter your phone number");
      return false;
    }

    if (!formData.senderAccountName) {
      alert("Please enter your account name");
      return false;
    }

    if (!formData.transactionId) {
      alert("Please enter your transaction ID (TRX/TID)");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Add package type to the request data
      const packageType = formData.packageType;

      // First, upload the screenshot
      const imageFormData = new FormData();
      imageFormData.append("paymentScreenshot", formData.paymentScreenshot);

      const imageUploadResponse = await axios.post(
        "http://localhost:5000/api/upload-payment-proof",
        imageFormData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      // Then send the purchase request with the correct package type
      const purchaseResponse = await axios.post(
        "http://localhost:5000/api/purchase-package",
        {
          packageId: formData.packageId,
          packageType: packageType, // Include the correct package type
          paymentMethod: formData.method,
          senderPhoneNumber: formData.senderPhoneNumber,
          senderAccountName: formData.senderAccountName,
          transactionId: formData.transactionId,
          screenshotUrl: imageUploadResponse.data.fileUrl
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }
      );

      setSubmitResponse(purchaseResponse.data);
      setFormSubmitted(true);

      // Wait for a moment to allow the backend to process the subscription
      setTimeout(() => {
        if (selectedPackage && selectedPackage.packageType) {
          if (selectedPackage.packageType === 3) {
            navigate("/message-sending");
          } else {
            navigate("/small-package-sending");
          }
        } else {
          navigate("/MySubscriptions");
        }
      });

    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Failed to purchase package. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008069]"></div>
      </div>
    );
  }

  if (formSubmitted && submitResponse) {
    return (
      <div className="bg-white">
        <NavigationBar />
        <Header />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <NavigationBar />
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 text-[#008069]">Purchase Your Package</h1>
          <p className="text-green-500 text-lg">Complete your purchase and start messaging</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left side - Package Information */}
          <div className="md:col-span-1">
            {selectedPackage ? (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl sticky top-8">
                <div className="bg-[#e6f4f1] rounded-t-xl p-6">
                  <h3 className="text-xl font-bold text-[#008069] mb-2">{selectedPackage.name}</h3>
                  <div className="text-4xl font-bold flex items-baseline">
                    ${selectedPackage.price}
                    <span className="text-sm text-gray-500 ml-2 font-normal">/ {selectedPackage.validityDays} days</span>
                  </div>
                </div>

                <div className="p-6">
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600">Valid for <span className="font-medium">{selectedPackage.validityDays} days</span></span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600">
                        {selectedPackage.maxNumbers === 0 ? (
                          <span>Unlimited numbers</span>
                        ) : (
                          <span>Up to <span className="font-medium">{selectedPackage.maxNumbers}</span> numbers</span>
                        )}
                      </span>
                    </li>
                    <li className="flex items-center">
                      {selectedPackage.fetchFromGroups ? (
                        <>
                          <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-600">Group Access <span className="font-medium text-green-600">Included</span></span>
                        </>
                      ) : (
                        <>
                          <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-500">No Group Access</span>
                        </>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-6">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500">Please select a package to continue</p>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Payment Form */}
          <div className="md:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8"
            >
              <h2 className="text-2xl font-bold mb-6 text-[#008069] border-b pb-4">Payment Details</h2>

              {/* Package Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#008069]">Selected Package</label>
                <select
                  name="packageId"
                  value={formData.packageId}
                  onChange={handleChange}
                  className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#008069] focus:border-transparent"
                  required
                >
                  <option value="">-- Select a Package --</option>
                  {packages.map((pkg) => (
                    <option key={pkg._id} value={pkg._id}>
                      {pkg.name} - ${pkg.price} ({pkg.validityDays} days)
                      {pkg.fetchFromGroups ? " - With System Numbers" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#008069]">Select Payment Method</h3>
                <p className="text-gray-600 italic mb-4">Account Title: Nauman yousaf</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`flex flex-col items-center p-4 rounded-lg cursor-pointer border-2 transition-all ${formData.method === "easypaisa" ? "border-[#008069] bg-[#e6f4f1]" : "border-gray-200 hover:border-[#008069] hover:bg-[#f0faf8]"}`}>
                    <input
                      type="radio"
                      name="method"
                      value="easypaisa"
                      checked={formData.method === "easypaisa"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div className="text-center">
                      <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-[#e6f4f1] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#008069]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">Easypaisa</span>
                      <p className="text-sm text-gray-600 mt-1">{paymentAccounts.easypaisa.number}</p>
                    </div>
                  </label>

                  <label className={`flex flex-col items-center p-4 rounded-lg cursor-pointer border-2 transition-all ${formData.method === "jazzcash" ? "border-[#008069] bg-[#e6f4f1]" : "border-gray-200 hover:border-[#008069] hover:bg-[#f0faf8]"}`}>
                    <input
                      type="radio"
                      name="method"
                      value="jazzcash"
                      checked={formData.method === "jazzcash"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div className="text-center">
                      <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-[#e6f4f1] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#008069]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">Jazz Cash</span>
                      <p className="text-sm text-gray-600 mt-1">{paymentAccounts.jazzcash.number}</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Information Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#008069]">Your Phone Number</label>
                  <input
                    type="text"
                    name="senderPhoneNumber"
                    value={formData.senderPhoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#008069] focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500">Enter the phone number you used for payment</p>
                </div>

                {/* Added Account Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#008069]">Your Account Name</label>
                  <input
                    type="text"
                    name="senderAccountName"
                    value={formData.senderAccountName}
                    onChange={handleChange}
                    placeholder="Enter your account name"
                    className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#008069] focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500">Enter the account name you used for payment</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#008069]">Transaction ID (TRX/TID)</label>
                <input
                  type="text"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleChange}
                  placeholder="Enter transaction ID"
                  className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#008069] focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500">Enter the Transaction ID you received after payment</p>
              </div>

              {/* Payment Instructions */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">Payment Instructions:</h4>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
                  <li>Select your preferred payment method (JazzCash or Easypaisa).</li>
                  <li>Send the exact amount ({selectedPackage ? `$${selectedPackage.price}` : "package amount"}) to the given number.</li>
                  <li>Enter your phone number that you used for payment.</li>
                  <li>Enter your account name that you used for payment.</li>
                  <li>Enter the Transaction ID (TRX ID/TID) you received after payment.</li>
                  <li>Upload a screenshot of your payment confirmation.</li>
                </ol>
              </div>

              {/* Payment Screenshot */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#008069]">Upload Payment Screenshot</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#008069] transition-colors">
                  <div className={`${fileSelected ? 'text-[#008069]' : 'text-gray-400'}`}>
                    {fileSelected ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}

                    <p className="text-sm mb-2">{fileSelected ? 'File Selected' : 'Drag & drop your payment screenshot here'}</p>
                    <p className="text-xs text-gray-500 mb-4">{fileSelected ? fileName : 'JPG, PNG or GIF files are allowed'}</p>

                    <div className="flex justify-center">
                      <label className="inline-flex items-center px-4 py-2 bg-[#008069] text-white rounded-lg cursor-pointer hover:bg-[#006e5a] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Browse Files</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden" 
                          required
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-lg text-white font-bold transition-colors ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#008069] hover:bg-[#006e5a]"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg 
                        className="animate-spin h-5 w-5 mr-3" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        ></circle>
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    "Confirm Purchase"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseForm;
