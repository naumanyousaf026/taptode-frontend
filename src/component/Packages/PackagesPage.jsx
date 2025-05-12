import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import NavigationBar from '../Header';
import Header from '../Header_1';

const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    validityDays: '',
    maxNumbers: '',
    fetchFromGroups: false
  });

  // Fetch all packages on component mount
  useEffect(() => {
    fetchPackages();
    
    // Check if user is admin (you might want to implement this differently)
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAdmin(true);
    }
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/all-packages');
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setPackages(response.data.data);
      } else {
        console.error('Unexpected API response format:', response.data);
        setPackages([]);
        setError('Received unexpected data format from the server');
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError('Failed to fetch packages. Please try again later.');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      validityDays: '',
      maxNumbers: '',
      fetchFromGroups: false
    });
    setEditingPackage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.validityDays || !formData.maxNumbers) {
      setError('All fields are required');
      return;
    }

    const packageData = {
      name: formData.name,
      price: Number(formData.price),
      validityDays: Number(formData.validityDays),
      maxNumbers: Number(formData.maxNumbers),
      fetchFromGroups: formData.fetchFromGroups
    };

    try {
      if (editingPackage) {
        await axios.put(`http://localhost:5000/api/update-package/${editingPackage._id}`, packageData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
      } else {
        await axios.post('http://localhost:5000/api/add-package', packageData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
      }
      
      fetchPackages();
      resetForm();
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save package. Please try again.');
      console.error('Error saving package:', err);
    }
  };

  const handleEdit = (pkg) => {
    setFormData({
      name: pkg.name,
      price: pkg.price,
      validityDays: pkg.validityDays,
      maxNumbers: pkg.maxNumbers,
      fetchFromGroups: pkg.fetchFromGroups || false
    });
    setEditingPackage(pkg);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await axios.delete(`http://localhost:5000/api/delete-package/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        fetchPackages();
      } catch (err) {
        setError('Failed to delete package. Please try again.');
        console.error('Error deleting package:', err);
      }
    }
  };
  
  const handleSubscribe = (pkg) => {
    // Navigate to purchase form with the selected package ID
    navigate('/PurchaseForm', { state: { packageId: pkg._id } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white ">
      <NavigationBar />
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 text-[#008069]">Choose Your Package</h1>
          <p className="text-green-500 text-lg">Select the perfect plan for your needs</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {isAdmin && (
          <div className="mb-12">
            {!showForm ? (
              <button 
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-blue-50 text-blue-600 font-medium py-2 px-6 rounded-full border border-blue-200 hover:bg-blue-100 transition-all flex items-center mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Package
              </button>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 max-w-3xl mx-auto">
                <h2 className="text-xl font-semibold mb-6 text-center">
                  {editingPackage ? 'Edit Package' : 'Add New Package'}
                </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Package Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
 
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Validity (Days)
                      </label>
                      <input
                        type="number"
                        name="validityDays"
                        value={formData.validityDays}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Numbers
                      </label>
                      <input
                        type="number"
                        name="maxNumbers"
                        value={formData.maxNumbers}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="fetchFromGroups"
                          checked={formData.fetchFromGroups}
                          onChange={handleInputChange}
                          className="mr-2 h-4 w-4 text-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Fetch From Groups
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-center gap-4">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-full transition-all"
                    >
                      {editingPackage ? 'Update Package' : 'Add Package'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-full transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
        
        {packages.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500 text-lg">No packages available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 mb-10 gap-8">
            {packages.map((pkg) => (
              <div key={pkg._id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl ">
                <div className=" ">
                  <div className="bg-[#e6f4f1] rounded-t-xl p-6">
                    <h3 className="text-xl font-bold text-[#008069] mb-2">{pkg.name}</h3>
                    <div className="text-4xl font-bold  flex items-baseline">
                      ${pkg.price}
                      <span className="text-sm text-gray-500 ml-2 font-normal">/ {pkg.validityDays} days</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">Valid for <span className="font-medium">{pkg.validityDays} days</span></span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">
                          {pkg.maxNumbers === 0 ? (
                            <span>Unlimited numbers</span>
                          ) : (
                            <span>Up to <span className="font-medium">{pkg.maxNumbers}</span> numbers</span>
                          )}
                        </span>
                      </li>
                      <li className="flex items-center">
                        {pkg.fetchFromGroups ? (
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
             
                    {/* Replace Link with button that uses the navigate function */}
                    <button
                      onClick={() => handleSubscribe(pkg)}
                      className="w-full py-3 px-4 bg-[#008069] text-white font-medium rounded-lg transition-colors hover:bg-[#006e5a]"
                    >
                      Subscribe Now
                    </button>
                    
                    {isAdmin && (
                      <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleEdit(pkg)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(pkg._id)}
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    )}
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

export default PackagesPage;