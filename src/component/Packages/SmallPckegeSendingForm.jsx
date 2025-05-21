import React, { useState, useEffect } from 'react';
import { Send, Upload, Phone, Check } from 'lucide-react';
import NavigationBar from "../Header";
import Header from "../Header_1";
import axios from 'axios';

const SmallPackageSendingForm = () => {
  const [formData, setFormData] = useState({
    message: '',
    customNumbers: '',
    contactId: '',
    attachment: null,
    csvFile: null,
    userOwnPhone: '',
    useOwnPhone: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [whatsappAccounts, setWhatsappAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [csvNumbers, setCsvNumbers] = useState([]);
  const [selectedCsvNumbers, setSelectedCsvNumbers] = useState([]);

  // Fetch WhatsApp accounts on component mount
  useEffect(() => {
    fetchWhatsappAccounts();
  }, []);

  // Fetch connected WhatsApp accounts
  const fetchWhatsappAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await axios.get('http://localhost:5000/api/whatsapp/accounts', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success && response.data.accounts.length > 0) {
        setWhatsappAccounts(response.data.accounts);
        // Set first account as default
        setFormData(prev => ({
          ...prev,
          contactId: response.data.accounts[0].id
        }));
      }
    } catch (err) {
      console.error('Error fetching WhatsApp accounts:', err);
      setError('Failed to load WhatsApp accounts. Please try again later.');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'userOwnPhone') {
      // Allow only digits and + sign
      const sanitizedValue = value.replace(/[^\d+]/g, '');
      setFormData({
        ...formData,
        [name]: sanitizedValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle checkbox toggle for using own phone
  const handleUseOwnPhoneToggle = () => {
    setFormData({
      ...formData,
      useOwnPhone: !formData.useOwnPhone
    });
  };

  // Parse CSV file when uploaded
  const parseCsvFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const numbers = lines
        .filter((line, index) => index > 0 && line.trim()) // Skip header row
        .map(line => {
          const columns = line.split(',');
          const number = columns[0]?.trim().replace(/["']/g, '') || '';
          return number ? number : null;
        })
        .filter(Boolean);
      
      setCsvNumbers(numbers);
    };
    reader.readAsText(file);
  };

  // Handle file changes (attachments or CSV)
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFormData({
      ...formData,
      [fileType]: file
    });

    // If it's a CSV file, parse it
    if (fileType === 'csvFile' && file) {
      parseCsvFile(file);
    }
  };

  // Toggle selection of a CSV number
  const toggleCsvNumberSelection = (number) => {
    if (selectedCsvNumbers.includes(number)) {
      setSelectedCsvNumbers(selectedCsvNumbers.filter(num => num !== number));
    } else {
      setSelectedCsvNumbers([...selectedCsvNumbers, number]);
    }
  };

  // Select all or deselect all CSV numbers
  const toggleAllCsvNumbers = () => {
    if (selectedCsvNumbers.length === csvNumbers.length) {
      setSelectedCsvNumbers([]);
    } else {
      setSelectedCsvNumbers([...csvNumbers]);
    }
  };

  // File icons based on type
  const getFileIcon = (file) => {
    if (!file) return null;
    const fileType = file.type;

    if (fileType.startsWith('image/')) return <img src={URL.createObjectURL(file)} alt="Image preview" className="h-10 w-10" />;
    if (fileType.startsWith('video/')) return <span>📹 Video</span>;
    if (fileType.startsWith('audio/')) return <span>🎵 Audio</span>;
    if (fileType === 'application/pdf') return <span>📄 PDF</span>;

    return <span>📎 Document</span>;
  };

  // File size in readable format
  const getFileSize = (file) => {
    if (!file) return '';
    const sizeInBytes = file.size;
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validation
      if (!formData.contactId && !formData.useOwnPhone) {
        throw new Error('Please select a WhatsApp account or use your own phone number');
      }
      
      if (formData.useOwnPhone && !formData.userOwnPhone) {
        throw new Error('Please enter your phone number');
      }

      if (!formData.message && !formData.attachment) {
        throw new Error('Please provide either a message or an attachment');
      }
      
      const hasRecipients = formData.customNumbers.trim() || 
                            selectedCsvNumbers.length > 0 ||
                            (formData.csvFile && csvNumbers.length === 0); // Only count CSV as recipients if we haven't parsed it yet
                            
      if (!hasRecipients) {
        throw new Error('Please provide at least one recipient (via custom numbers or CSV file)');
      }

      // Prepare form data for API call
      const data = new FormData();
      
      // Always include contactId from current active WhatsApp account
      if (!formData.useOwnPhone) {
        data.append('contactId', formData.contactId);
      } else {
        // This is handled separately in the backend - for now using the first connected account
        data.append('contactId', formData.contactId);
        // Additional own phone field - backend will need to be updated to handle this
        data.append('userOwnPhone', formData.userOwnPhone);
      }
      
      // Message is required by the API, even if empty
      data.append('message', formData.message);
      
      // Handle recipient numbers
      let allRecipients = [];
      
      // Add custom numbers
      if (formData.customNumbers.trim()) {
        const customArray = formData.customNumbers
          .split(/[\n, ]+/)
          .map(num => num.trim())
          .filter(Boolean);
        
        allRecipients.push(...customArray);
      }
      
      // Add selected CSV numbers to customNumbers
      if (selectedCsvNumbers.length > 0) {
        allRecipients.push(...selectedCsvNumbers);
      }
      
      // Combine all recipients into a single string
      if (allRecipients.length > 0) {
        // FIX: Combine all recipients into a single string instead of multiple customNumbers entries
        const combinedNumbers = allRecipients.join(',');
        data.append('customNumbers', combinedNumbers);
      }
      
      // Handle file attachment (use 'file' field name as per backend multer config)
      if (formData.attachment) {
        data.append('file', formData.attachment);
      }
      
      // Only attach the CSV file if no specific numbers were selected
      // If we have selected specific numbers from the CSV, we'll include them in customNumbers instead
      if (formData.csvFile && selectedCsvNumbers.length === 0) {
        data.append('csvFile', formData.csvFile);
      }

      console.log('Sending data:', {
        contactId: formData.contactId,
        message: formData.message,
        customNumbers: allRecipients.length > 0 ? allRecipients.join(',') : '',
        selectedCsvNumbersCount: selectedCsvNumbers.length,
        useFullCsvFile: selectedCsvNumbers.length === 0 && !!formData.csvFile,
        hasAttachment: !!formData.attachment
      });

      // Post data to the backend
      const response = await axios.post('http://localhost:5000/api/whatsapp/send', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Response:', response.data);

      if (response.data.success) {
        setSuccess(`Message sent successfully to ${response.data.total} recipients!`);
        
        // Reset the form but keep phone and account data
        setFormData({
          message: '',
          customNumbers: '',
          contactId: formData.contactId,
          userOwnPhone: formData.userOwnPhone,
          useOwnPhone: formData.useOwnPhone,
          attachment: null,
          csvFile: null
        });
        
        // Reset selected CSV numbers
        setSelectedCsvNumbers([]);
        setCsvNumbers([]);
        
        // Reset file inputs
        if (document.getElementById('attachment')) {
          document.getElementById('attachment').value = '';
        }
        if (document.getElementById('csvFile')) {
          document.getElementById('csvFile').value = '';
        }
      } else {
        setError(response.data.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || err.response?.data?.message || 'Failed to send message. Please try again.');
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
            <h3 className="text-2xl font-semibold roboto-thin text-[#008069] mb-6 border-b pb-3">Send WhatsApp Message</h3>

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

            {/* Own Phone Toggle & Number Input */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm roboto-thin text-[#008069] font-medium">Use My Own Phone Number</label>
                <button 
                  type="button"
                  onClick={handleUseOwnPhoneToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${formData.useOwnPhone ? 'bg-[#008069]' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${formData.useOwnPhone ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              
              {formData.useOwnPhone && (
                <div className="flex mt-2 mb-3">
                  <div className="relative flex-grow">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="userOwnPhone"
                      value={formData.userOwnPhone}
                      onChange={handleChange}
                      placeholder="Enter your WhatsApp number (e.g. +92XXXXXXXXXX)"
                      className="w-full pl-10 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#008069] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp Account Selection - always shown but indicated as fallback when using own phone */}
            <div className="mb-5">
              <label className="block text-sm roboto-thin text-[#008069] font-medium mb-2">
                {formData.useOwnPhone ? 'Fallback WhatsApp Account' : 'Send From WhatsApp Account'}
              </label>
              <select
                name="contactId"
                value={formData.contactId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#008069] outline-none"
                required
                disabled={loadingAccounts}
              >
                {loadingAccounts ? (
                  <option value="">Loading accounts...</option>
                ) : whatsappAccounts.length === 0 ? (
                  <option value="">No connected accounts found</option>
                ) : (
                  whatsappAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.whatsappId}
                    </option>
                  ))
                )}
              </select>
              {formData.useOwnPhone && (
                <p className="text-xs text-gray-500 mt-1">
                  This account will be used as a fallback if your phone is unavailable
                </p>
              )}
            </div>

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
              />
            </div>

            {/* Attachment - Changed to match the backend field name 'file' */}
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
                <p>Click to upload or drag file here</p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports images, videos, audio, and documents (up to 16MB)
                </p>
                {formData.attachment && (
                  <div className="mt-2 text-sm text-[#008069]">
                    <p>Selected: {formData.attachment.name} ({getFileSize(formData.attachment)})</p>
                    <div className="mt-2">{getFileIcon(formData.attachment)}</div>
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
                <p>Click to upload CSV</p>
                {formData.csvFile && (
                  <div className="mt-2 text-sm text-[#008069]">
                    Selected: {formData.csvFile.name}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                CSV file should have headers and phone numbers in the first column.
                <strong className="text-[#008069]"> Important: If you select specific numbers below, only those numbers will receive messages. Otherwise, all numbers in the CSV will be used.</strong>
              </div>
            </div>

            {/* Display CSV Numbers for Selection */}
            {csvNumbers.length > 0 && (
              <div className="mb-5">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium roboto-thin text-[#008069] mb-2">Select Numbers from CSV</label>
                  <button
                    type="button"
                    onClick={toggleAllCsvNumbers}
                    className="text-xs text-[#008069] hover:underline"
                  >
                    {selectedCsvNumbers.length === csvNumbers.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {csvNumbers.map((number, index) => (
                    <div 
                      key={index} 
                      className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleCsvNumberSelection(number)}
                    >
                      <div className={`w-5 h-5 border flex items-center justify-center ${selectedCsvNumbers.includes(number) ? 'border-[#008069] bg-[#008069]' : 'border-gray-300'} rounded mr-2`}>
                        {selectedCsvNumbers.includes(number) && <Check size={12} className="text-white" />}
                      </div>
                      <span className="text-sm">{number}</span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedCsvNumbers.length} of {csvNumbers.length} numbers selected
                </div>
              </div>
            )}

            {/* Custom Numbers */}
            <div className="mb-6">
              <label className="block text-sm font-medium roboto-thin text-[#008069] mb-2">Custom Phone Numbers</label>
              <textarea
                name="customNumbers"
                value={formData.customNumbers}
                onChange={handleChange}
                rows="3"
                placeholder="Enter one number per line or comma-separated numbers (e.g. +923XXXXXXXXX)"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#008069] outline-none resize-none"
              />
              <div className="text-xs text-gray-500 mt-1">
                Pakistani numbers can be entered as 03XXXXXXXX or +923XXXXXXXX format
              </div>
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