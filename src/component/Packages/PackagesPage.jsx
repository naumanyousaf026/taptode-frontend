import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import NavigationBar from '../Header';
import Header from '../Header_1';
import { GoPackageDependents } from "react-icons/go";

const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    validityDays: '',
    maxNumbers: '',
    fetchFromGroups: false
  });

  useEffect(() => {
    fetchPackages();
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAdmin(true);
    }
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/all-packages');
      if (response.data?.success && Array.isArray(response.data.data)) {
        setPackages(response.data.data);
      } else {
        setError('Unexpected data format received from server.');
        setPackages([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch packages. Please try again.');
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
      console.error('Save error:', err);
      setError(err.response?.data?.message || 'Failed to save package.');
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
        console.error('Delete error:', err);
      }
    }
  };

  const handleSubscribe = (pkg) => {
    navigate('/PurchaseForm', { state: { packageId: pkg._id } });
  };

  const handleSpecialEditClick = () => {
    // Navigate to MySubscriptions page
    navigate('/MySubscriptions');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white">
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Validity (Days)</label>
                      <input type="number" name="validityDays" value={formData.validityDays} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Numbers</label>
                      <input type="number" name="maxNumbers" value={formData.maxNumbers} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="flex items-center">
                        <input type="checkbox" name="fetchFromGroups" checked={formData.fetchFromGroups} onChange={handleInputChange} className="mr-2 h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Fetch From Groups</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-center gap-4">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-full"> {editingPackage ? 'Update Package' : 'Add Package'} </button>
                    <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-full">Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {packages.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500 text-lg">No packages available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 mb-10 gap-8">
            {packages.map((pkg) => (
              <div key={pkg._id} className="bg-white rounded-2xl shadow-lg overflow-hidden border hover:shadow-xl">
                <div className="bg-[#e6f4f1] rounded-t-xl p-6">
                  <h3 className="text-xl font-bold text-[#008069] mb-2">{pkg.name}</h3>
                  <div className="text-4xl font-bold">${pkg.price}<span className="text-sm text-gray-500 ml-2 font-normal">/ {pkg.validityDays} days</span></div>
                </div>
                <div className="p-6">
                  <ul className="space-y-4 mb-8 text-gray-600">
                    <li>Valid for {pkg.validityDays} days</li>
                    <li>{pkg.maxNumbers === 0 ? 'Unlimited numbers' : `Up to ${pkg.maxNumbers} numbers`}</li>
                    <li>{pkg.fetchFromGroups ? 'Group Access Included' : 'No Group Access'}</li>
                  </ul>
                  <button onClick={() => handleSubscribe(pkg)} className="w-full py-3 px-4 bg-[#008069] text-white font-medium rounded-lg hover:bg-[#006e5a]">Subscribe Now</button>
                  {isAdmin && (
                    <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                      <button onClick={() => handleEdit(pkg)} className="text-blue-600 hover:text-blue-800">Edit</button>
                      <button onClick={() => handleDelete(pkg._id)} className="text-red-500 hover:text-red-700">Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decorative wave and floating action button */}
      <div className="relative mt-16">
        <svg className="w-full h-24" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path fill="#e6f4f1" fillOpacity="1" d="M0,224L80,197.3C160,171,320,117,480,122.7C640,128,800,192,960,202.7C1120,213,1280,171,1360,149.3L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        </svg>

        {/* Button with rotating text */}
        <div className="fixed bottom-24 right-20 flex items-center z-50">
          {/* Rotating text */}
          <div className="text-[#008069] font-medium bg-white px-3 py-1 rounded-full shadow-md mr-3 animate-bounce">
            Check your subscription
          </div>
          
          {/* Button */}
          <button
            onClick={handleSpecialEditClick}
            className="bg-[#008069] text-white font-medium p-4 rounded-full shadow-lg hover:bg-[#006e5a] transition-all"
          >
            <GoPackageDependents className="text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackagesPage;