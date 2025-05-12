import React, { useState } from 'react';
import { Send, Upload } from 'lucide-react';
import NavigationBar from "../Header";
import Header from "../Header_1";
import axios from 'axios';

const SmallPackageSendingForm = () => {
  const [formData, setFormData] = useState({
    message: '',
    customNumbers: '',
    attachment: null,
    csvFile: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e, fileType) => {
    setFormData({
      ...formData,
      [fileType]: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create form data for file upload
      const data = new FormData();
      data.append('message', formData.message);
      data.append('customNumbers', formData.customNumbers);
      
      if (formData.attachment) {
        data.append('attachment', formData.attachment);
      }
      
      if (formData.csvFile) {
        data.append('csvFile', formData.csvFile);
      }

      const response = await axios.post('http://localhost:5000/api/send-message', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSuccess('Message sent successfully!');
      
      // Reset form
      setFormData({
        message: '',
        customNumbers: '',
        attachment: null,
        csvFile: null
      });
      
      // Reset file input elements
      document.getElementById('attachment').value = '';
      document.getElementById('csvFile').value = '';
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavigationBar />
      <Header />
      
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="col-span-1 bg-white shadow-md rounded-xl p-8 border border-gray-200">
            <h3 className="text-2xl font-semibold roboto-thin text-[#008069] mb-6 border-b pb-3">Send Message</h3>
            
            {/* Error and Success messages */}
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}
            
            {/* Message */}
            <div className="mb-5">
              <label className="block text-sm roboto-thin text-[#008069] font-medium mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                placeholder="Type your message..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#008069] outline-none resize-none"
                required
              />
            </div>
            
            {/* Attachments */}
            <div className="mb-5">
              <label className="block roboto-thin text-[#008069] text-sm font-medium mb-2">Attachment</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 hover:border-[#22c55e] hover:text-[#22c55e] cursor-pointer transition-all relative">
                <input
                  type="file"
                  id="attachment"
                  onChange={(e) => handleFileChange(e, 'attachment')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="mx-auto mb-2 h-5 w-5" />
                Click to upload or drag file here
                {formData.attachment && (
                  <div className="mt-2 text-sm text-[#008069]">
                    Selected: {formData.attachment.name}
                  </div>
                )}
              </div>
            </div>
            
            {/* CSV Upload */}
            <div className="mb-5">
              <label className="block text-sm font-medium roboto-thin text-[#008069] mb-2">Upload CSV (Phone Numbers)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 hover:border-[#22c55e] hover:text-[#22c55e] cursor-pointer transition-all relative">
                <input
                  type="file"
                  id="csvFile"
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, 'csvFile')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="mx-auto mb-2 h-5 w-5" />
                Click to upload CSV
                {formData.csvFile && (
                  <div className="mt-2 text-sm text-[#008069]">
                    Selected: {formData.csvFile.name}
                  </div>
                )}
              </div>
            </div>
            
            {/* Custom Numbers */}
            <div className="mb-6">
              <label className="block text-sm font-mediumt roboto-thin text-[#008069] mb-2">Custom Phone Numbers</label>
              <textarea
                name="customNumbers"
                value={formData.customNumbers}
                onChange={handleChange}
                rows="3"
                placeholder="Enter one number per line"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#008069] outline-none resize-none"
              />
            </div>
            
            {/* Send Button */}
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full bg-[#008069] text-white py-3 rounded-lg font-medium disabled:bg-gray-400"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SmallPackageSendingForm;