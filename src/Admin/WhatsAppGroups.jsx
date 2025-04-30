import React, { useState, useEffect, useRef } from 'react';
import { Loader, Copy, Download, User, Users, Phone, AlertTriangle, Wifi, WifiOff, 
         Send, Smartphone, Info, Clock, File, Image, Video, Mic, FileText, Link, Paperclip, X, Upload, Check, List } from 'lucide-react';
import axios from 'axios';
import Papa from 'papaparse';

const WhatsAppGroups = () => {
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState({ accounts: false, groups: false, contacts: false, sending: false, csv: false });
  const [error, setError] = useState({ accounts: null, groups: null, contacts: null, sending: null, csv: null });
  const [connectionStatus, setConnectionStatus] = useState(true);
  const [message, setMessage] = useState('');
  const [customPhoneNumbers, setCustomPhoneNumbers] = useState('');
  const [sendingProgress, setSendingProgress] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Debug state to track account selection
  const [debug, setDebug] = useState({ selectedAccountId: null });

  // CSV states
  const [csvFile, setCsvFile] = useState(null);
  const [csvNumbers, setCsvNumbers] = useState([]);
  const [selectedCsvNumbers, setSelectedCsvNumbers] = useState([]);
  const [selectAllCsv, setSelectAllCsv] = useState(false);
  const [showCsvList, setShowCsvList] = useState(false);
  const csvInputRef = useRef(null);

  // File attachment states
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch all connected WhatsApp accounts and their groups
  useEffect(() => {
    const fetchConnectedAccounts = async () => {
      setLoading(prev => ({ ...prev, accounts: true, groups: true }));
      setError(prev => ({ ...prev, accounts: null, groups: null }));
      
      try {
        const response = await axios.get('http://localhost:5000/api/whatsapp/groups');
        
        // Check the structure of the response
        if (response.data && response.data.success) {
          // Log the accounts data for debugging
          console.log("Fetched WhatsApp accounts:", response.data.results);
          
          setConnectedAccounts(response.data.results || []);
          
          // If accounts are loaded, select the first one by default
          if (response.data.results && response.data.results.length > 0) {
            const firstAccount = response.data.results[0];
            setSelectedAccount(firstAccount.contact);
            setDebug(prev => ({ ...prev, selectedAccountId: firstAccount.contact.id }));
            
            console.log("Selected account:", firstAccount.contact);
            
            // Set groups for the first account
            if (firstAccount.groups && firstAccount.groups.data) {
              setGroups(firstAccount.groups.data || []);
              
              // If groups are loaded and we have a specific group ID, select it
              if (firstAccount.groups.data.length > 0) {
                const educationGroup = firstAccount.groups.data.find(group => 
                  group.gid === "120363411892685562@g.us" || group.name === "Education (News) 3"
                );
                
                if (educationGroup) {
                  setSelectedGroup(educationGroup);
                  fetchGroupContacts(firstAccount.contact.id, educationGroup.gid);
                }
              }
            } else {
              setGroups([]);
            }
          }
        } else {
          console.error("Unexpected API response structure:", response.data);
          setError(prev => ({ ...prev, accounts: "Invalid API response format" }));
        }
        
        setConnectionStatus(true);
      } catch (err) {
        console.error("Error fetching WhatsApp accounts and groups:", err);
        setError(prev => ({ 
          ...prev, 
          accounts: err.message || "Failed to fetch WhatsApp accounts",
          groups: err.message || "Failed to fetch groups"
        }));
        setConnectionStatus(false);
      } finally {
        setLoading(prev => ({ ...prev, accounts: false, groups: false }));
      }
    };

    fetchConnectedAccounts();
  }, []);

  // Handle account selection
  const handleAccountSelect = (account) => {
    console.log("Account selected:", account);
    setSelectedAccount(account);
    setDebug(prev => ({ ...prev, selectedAccountId: account.id }));
    
    setSelectedGroup(null);
    setContacts([]);
    setSelectedContacts([]);
    setSelectAll(false);
    
    // Find the groups for this account
    const accountData = connectedAccounts.find(acc => acc.contact.id === account.id);
    if (accountData && accountData.groups && accountData.groups.data) {
      setGroups(accountData.groups.data || []);
    } else {
      setGroups([]);
    }
  };

  // Fetch contacts for a specific group
  const fetchGroupContacts = async (contactId, groupId) => {
    setLoading(prev => ({ ...prev, contacts: true }));
    setError(prev => ({ ...prev, contacts: null }));
    setSelectedContacts([]);
    setSelectAll(false);
    
    try {
      const response = await axios.get(`http://localhost:5000/api/whatsapp/contact/${contactId}/group/${groupId}/contacts`);
      
      // Check the structure of the response and extract contacts correctly
      if (response.data && response.data.contacts && response.data.contacts.data) {
        setContacts(response.data.contacts.data || []);
      } else {
        console.error("Unexpected contacts API response structure:", response.data);
        setError(prev => ({ ...prev, contacts: "Invalid API response format" }));
      }
      
      setConnectionStatus(true);
    } catch (err) {
      console.error(`Error fetching contacts for group ${groupId}:`, err);
      setError(prev => ({ ...prev, contacts: err.message || "Failed to fetch contacts" }));
      setConnectionStatus(false);
    } finally {
      setLoading(prev => ({ ...prev, contacts: false }));
    }
  };

  // Handle group selection
  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    if (selectedAccount) {
      fetchGroupContacts(selectedAccount.id, group.gid);
    }
  };

  // Copy contacts to clipboard
  const copyContactsToClipboard = () => {
    const phoneNumbers = contacts.map(contact => contact.phone).join('\n');
    navigator.clipboard.writeText(phoneNumbers);
    alert("All contacts copied to clipboard!");
  };

  // Download contacts as CSV
  const downloadContactsCSV = () => {
    const phoneNumbers = contacts.map(contact => contact.phone).join('\n');
    const blob = new Blob([phoneNumbers], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedGroup?.name || 'whatsapp-group'}-contacts.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy CSV numbers to clipboard
  const copyCsvNumbersToClipboard = () => {
    const phoneNumbers = csvNumbers.join('\n');
    navigator.clipboard.writeText(phoneNumbers);
    alert("All CSV numbers copied to clipboard!");
  };

  // Handle message change
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  // Handle custom phone numbers change
  const handleCustomPhoneNumbersChange = (e) => {
    setCustomPhoneNumbers(e.target.value);
  };

  // Toggle selecting all contacts
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(contact => contact.phone));
    }
    setSelectAll(!selectAll);
  };

  // Toggle selecting all CSV numbers
  const handleSelectAllCsv = () => {
    if (selectAllCsv) {
      setSelectedCsvNumbers([]);
    } else {
      setSelectedCsvNumbers([...csvNumbers]);
    }
    setSelectAllCsv(!selectAllCsv);
  };

  // Toggle selecting individual contact
  const handleContactSelect = (phone) => {
    if (selectedContacts.includes(phone)) {
      setSelectedContacts(selectedContacts.filter(p => p !== phone));
    } else {
      setSelectedContacts([...selectedContacts, phone]);
    }
  };

  // Toggle selecting individual CSV number
  const handleCsvNumberSelect = (number) => {
    if (selectedCsvNumbers.includes(number)) {
      setSelectedCsvNumbers(selectedCsvNumbers.filter(n => n !== number));
    } else {
      setSelectedCsvNumbers([...selectedCsvNumbers, number]);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  // Handle CSV file upload
  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(prev => ({ ...prev, csv: true }));
      setError(prev => ({ ...prev, csv: null }));
      setCsvFile(file);
      setCsvNumbers([]);
      setSelectedCsvNumbers([]);
      setSelectAllCsv(false);
      
      // Parse the CSV file
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          // Extract phone numbers from the parsed data
          const phoneNumbers = [];
          
          results.data.forEach(row => {
            // Check if row is an array or object (depends on if header option is true/false)
            if (Array.isArray(row)) {
              // Take first column as phone number
              if (row[0] && typeof row[0] === 'string' && row[0].trim()) {
                phoneNumbers.push(row[0].trim());
              }
            } else if (typeof row === 'object') {
              // Try to find a column that might contain phone numbers
              const firstValue = Object.values(row)[0];
              if (firstValue && typeof firstValue === 'string' && firstValue.trim()) {
                phoneNumbers.push(firstValue.trim());
              }
            }
          });
          
          setCsvNumbers(phoneNumbers);
          setShowCsvList(true);
          setLoading(prev => ({ ...prev, csv: false }));
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          setError(prev => ({ ...prev, csv: error.message || 'Failed to parse CSV file' }));
          setLoading(prev => ({ ...prev, csv: false }));
        }
      });
    }
  };

  // Handle CSV file removal
  const handleRemoveCsvFile = () => {
    setCsvFile(null);
    setCsvNumbers([]);
    setSelectedCsvNumbers([]);
    setSelectAllCsv(false);
    setShowCsvList(false);
    if (csvInputRef.current) {
      csvInputRef.current.value = null;
    }
  };

  // Toggle CSV list visibility
  const toggleCsvList = () => {
    setShowCsvList(!showCsvList);
  };

  // Trigger CSV file input click
  const handleCsvUploadClick = () => {
    if (csvInputRef.current) {
      csvInputRef.current.click();
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  // Trigger file input click
  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Get file icon based on type
  const getFileIcon = (file) => {
    if (!file) return <File className="w-6 h-6" />;
    
    const fileType = file.type;
    
    if (fileType.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (fileType.startsWith('video/')) return <Video className="w-6 h-6" />;
    if (fileType.startsWith('audio/')) return <Mic className="w-6 h-6" />;
    if (fileType === 'application/pdf' || 
        fileType.includes('document') || 
        fileType.includes('sheet') || 
        fileType.includes('presentation')) return <FileText className="w-6 h-6" />;
    if (fileType === 'text/uri-list') return <Link className="w-6 h-6" />;
    
    return <File className="w-6 h-6" />;
  };

  // Get file size in readable format
  const getFileSize = (file) => {
    if (!file) return '';
    
    const sizeInBytes = file.size;
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Send message function - UPDATED with enhanced debugging
  const handleSendMessage = async () => {
    if (!message.trim() && !selectedFile) {
      alert("Please enter a message or attach a file");
      return;
    }

    if (!selectedAccount) {
      alert("Please select a WhatsApp account first");
      return;
    }

    console.log("Preparing to send message from account:", selectedAccount);

    // Determine recipients
    let recipients = [...selectedContacts];
    
    // Add selected CSV numbers to recipients
    if (selectedCsvNumbers.length > 0) {
      recipients = [...recipients, ...selectedCsvNumbers];
    }
    
    // If no specific contacts are selected but a group is selected, use all contacts
    if (selectedGroup && recipients.length === 0 && contacts.length > 0 && selectedCsvNumbers.length === 0) {
      recipients = contacts.map(contact => contact.phone);
    }
    
    // If no CSV numbers are specifically selected but we have CSV numbers, use all of them
    if (selectedCsvNumbers.length === 0 && csvNumbers.length > 0) {
      recipients = [...recipients, ...csvNumbers];
    }
    
    if (recipients.length === 0 && !customPhoneNumbers.trim()) {
      alert("Please select contacts, upload a CSV file, or enter custom phone numbers");
      return;
    }

    console.log("Recipients count:", recipients.length);
    
    setLoading(prev => ({ ...prev, sending: true }));
    setError(prev => ({ ...prev, sending: null }));
    setSendingProgress(null);
    
    try {
      // Create form data for API call
      const formData = new FormData();
      formData.append('message', message);
      
      // Ensure contactId is correctly set - this is the critical part
      console.log("Setting contactId in formData:", selectedAccount.id);
      formData.append('contactId', selectedAccount.id);
      
      // Add recipients
      if (recipients.length > 0) {
        console.log("Adding recipients to formData:", recipients);
        formData.append('recipients', JSON.stringify(recipients));
      }
      
      // Add custom numbers
      if (customPhoneNumbers.trim()) {
        console.log("Adding custom numbers to formData:", customPhoneNumbers);
        formData.append('customNumbers', customPhoneNumbers);
      }
      
      // Add file if selected
      if (selectedFile) {
        console.log("Adding file to formData:", selectedFile.name);
        formData.append('file', selectedFile);
      }

      // Log all form data for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`FormData entry - ${key}:`, value);
      }
      
      // Make API call
      console.log("Sending API request to /api/whatsapp/send");
      const response = await axios.post('http://localhost:5000/api/whatsapp/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("API response:", response.data);
      
      // Handle successful response
      if (response.data && response.data.success) {
        setSendingProgress({
          totalRecipients: response.data.totalRecipients || response.data.total,
          batchCount: response.data.batchCount || Math.ceil(response.data.total / 10),
          batchSize: response.data.batchSize || 10,
          status: 'in_progress',
          startTime: new Date(),
          messageType: response.data.messageType || 'text',
          sentFrom: response.data.sentFrom // Add the account that sent the message
        });
        
        alert(`Message sending initiated from account: ${response.data.sentFrom}`);
        
        // Clear the form
        setCustomPhoneNumbers('');
        setMessage('');
        setSelectedFile(null);
        setFilePreview(null);
        setCsvFile(null);
        setCsvNumbers([]);
        setSelectedCsvNumbers([]);
        setSelectAllCsv(false);
        setShowCsvList(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
        if (csvInputRef.current) {
          csvInputRef.current.value = null;
        }
      } else {
        throw new Error("API returned unsuccessful response");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError(prev => ({ ...prev, sending: err.message || "Failed to send message" }));
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, sending: false }));
    }
  };

  // Calculate batch sending ETA
  const calculateETA = (progress) => {
    if (!progress) return "Unknown";
    
    const { totalRecipients, batchCount, batchSize, startTime } = progress;
    const now = new Date();
    const elapsedMinutes = (now - new Date(startTime)) / (1000 * 60);
    
    // Estimate 1 minute per batch
    const totalEstimatedMinutes = batchCount;
    const remainingMinutes = Math.max(0, totalEstimatedMinutes - elapsedMinutes);
    
    if (remainingMinutes <= 0) return "Completing soon";
    if (remainingMinutes < 1) return "Less than a minute";
    if (remainingMinutes < 2) return "About 1 minute";
    return `About ${Math.ceil(remainingMinutes)} minutes`;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">WhatsApp Groups</h1>
        <div className="flex items-center gap-2">
          {connectionStatus ? (
            <div className="flex items-center text-green-500">
              <Wifi className="w-5 h-5 mr-1" />
              <span>Connected</span>
            </div>
          ) : (
            <div className="flex items-center text-red-500">
              <WifiOff className="w-5 h-5 mr-1" />
              <span>Disconnected</span>
            </div>
          )}
        </div>
      </div>

      {/* Account Selection - UPDATED with more visibility */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Connected WhatsApp Accounts</h2>
          {!loading.accounts && connectedAccounts.length > 0 && (
            <span className="text-sm text-gray-500">({connectedAccounts.length} accounts)</span>
          )}
        </div>

        {loading.accounts ? (
          <div className="flex items-center justify-center p-4">
            <Loader className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading accounts...</span>
          </div>
        ) : error.accounts ? (
          <div className="flex items-center justify-center p-4 text-red-500">
            <AlertTriangle className="w-6 h-6 mr-2" />
            <span>{error.accounts}</span>
          </div>
        ) : connectedAccounts.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            No WhatsApp accounts connected. Please connect an account first.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {connectedAccounts.map((account) => (
              <div 
                key={account.contact.id}
                className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                  selectedAccount?.id === account.contact.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleAccountSelect(account.contact)}
              >
                <div className="flex items-center gap-2">
                  <div className={`rounded-full p-2 ${selectedAccount?.id === account.contact.id ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{account.contact.name || account.contact.whatsappId || "Unnamed"}</h3>
                    <p className="text-xs text-gray-500">{account.contact.whatsappId}</p>
                    <p className="text-xs text-gray-500">ID: {account.contact.id}</p>
                    <p className="text-xs text-gray-400">Unique ID: {account.contact.uniqueId}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Display selected account info more prominently */}
        {selectedAccount && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-medium">Messages will be sent from:</p>
            <div className="flex items-center mt-1">
              <Smartphone className="w-5 h-5 text-blue-500 mr-2" />
              <div>
                <p className="font-bold">{selectedAccount.whatsappId || "Unknown Number"}</p>
                <p className="text-sm text-gray-600">Account ID: {selectedAccount.id}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Groups and Contacts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Groups List */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Groups</h2>
            {!loading.groups && groups.length > 0 && (
              <span className="text-sm text-gray-500">({groups.length})</span>
            )}
          </div>

          {loading.groups ? (
            <div className="flex items-center justify-center p-4">
              <Loader className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading groups...</span>
            </div>
          ) : error.groups ? (
            <div className="flex items-center justify-center p-4 text-red-500">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <span>{error.groups}</span>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center p-4 text-gray-500">
              {selectedAccount ? "No groups found for this account." : "Please select an account first."}
            </div>
          ) : (
            <div className="overflow-y-auto max-h-96">
              {groups.map((group) => (
                <div 
                  key={group.gid}
                  className={`border-b last:border-b-0 p-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
                    selectedGroup?.gid === group.gid ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleGroupSelect(group)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{group.name || "Unnamed Group"}</h3>
                      <p className="text-xs text-gray-500 truncate max-w-40">{group.gid}</p>
                    </div>
                    {group.size && (
                      <div className="bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-1">
                        {group.size} members
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contacts List */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Contacts</h2>
              {!loading.contacts && contacts.length > 0 && (
                <span className="text-sm text-gray-500">({contacts.length})</span>
              )}
            </div>
            {contacts.length > 0 && (
              <div className="flex gap-2">
                <button
                  className="text-blue-500 hover:text-blue-600 flex items-center text-sm"
                  onClick={copyContactsToClipboard}
                >
                  <Copy className="w-4 h-4 mr-1" /> Copy
                </button>
                <button
                  className="text-green-500 hover:text-green-600 flex items-center text-sm"
                  onClick={downloadContactsCSV}
                >
                  <Download className="w-4 h-4 mr-1" /> CSV
                </button>
              </div>
            )}
          </div>

          {loading.contacts ? (
            <div className="flex items-center justify-center p-4">
              <Loader className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading contacts...</span>
            </div>
          ) : error.contacts ? (
            <div className="flex items-center justify-center p-4 text-red-500">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <span>{error.contacts}</span>
            </div>
          ) : !selectedGroup ? (
            <div className="text-center p-4 text-gray-500">
              Please select a group to view contacts.
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center p-4 text-gray-500">
              No contacts found in this group.
            </div>
          ) : (
            <div>
              <div className="mb-2 flex items-center">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="mr-2"
                />
                <label htmlFor="selectAll" className="text-sm">Select All</label>
                {selectedContacts.length > 0 && (
                  <span className="ml-2 text-xs text-blue-500">
                    ({selectedContacts.length} selected)
                  </span>
                )}
              </div>
              <div className="overflow-y-auto max-h-96">
                {contacts.map((contact) => (
                  <div 
                    key={contact.id || contact.phone}
                    className="flex items-center border-b last:border-b-0 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.phone)}
                      onChange={() => handleContactSelect(contact.phone)}
                      className="mr-3"
                    />
                    <div>
                      <h3 className="font-medium">{contact.name || "Unnamed"}</h3>
                      <p className="text-xs text-gray-500">{contact.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>  
          
          )}
        </div>

        {/* Message Composer */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-4">
            <Send className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Send Message</h2>
          </div>

          {/* Message input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
              rows="4"
              placeholder="Type your message here..."
              value={message}
              onChange={handleMessageChange}
            ></textarea>
          </div>

          {/* File attachment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachment
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            
            {selectedFile ? (
              <div className="border border-gray-300 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getFileIcon(selectedFile)}
                    <div className="ml-2">
                      <p className="font-medium truncate max-w-40">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{getFileSize(selectedFile)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleRemoveFile}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {filePreview && (
                  <div className="mt-2">
                    <img 
                      src={filePreview} 
                      alt="Preview" 
                      className="max-h-32 rounded-lg"
                    />
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleAttachClick}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 border-dashed rounded-lg p-3 hover:bg-gray-50 transition-colors duration-150"
              >
                <Paperclip className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Attach a file</span>
              </button>
            )}
          </div>

          {/* CSV Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload CSV with Phone Numbers
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvFileChange}
              className="hidden"
              ref={csvInputRef}
            />
            
            {csvFile ? (
              <div className="border border-gray-300 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5" />
                    <div className="ml-2">
                      <p className="font-medium truncate max-w-40">{csvFile.name}</p>
                      <p className="text-xs text-gray-500">{csvNumbers.length} numbers</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={toggleCsvList}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <List className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleRemoveCsvFile}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {showCsvList && csvNumbers.length > 0 && (
                  <div className="mt-3 border-t pt-2">
                    <div className="mb-2 flex items-center">
                      <input
                        type="checkbox"
                        id="selectAllCsv"
                        checked={selectAllCsv}
                        onChange={handleSelectAllCsv}
                        className="mr-2"
                      />
                      <label htmlFor="selectAllCsv" className="text-sm">Select All</label>
                      {selectedCsvNumbers.length > 0 && (
                        <span className="ml-2 text-xs text-blue-500">
                          ({selectedCsvNumbers.length} selected)
                        </span>
                      )}
                      {csvNumbers.length > 0 && (
                        <button
                          className="ml-auto text-blue-500 hover:text-blue-600 flex items-center text-xs"
                          onClick={copyCsvNumbersToClipboard}
                        >
                          <Copy className="w-3 h-3 mr-1" /> Copy All
                        </button>
                      )}
                    </div>
                    <div className="overflow-y-auto max-h-32">
                      {csvNumbers.map((number, index) => (
                        <div 
                          key={index}
                          className="flex items-center border-b last:border-b-0 py-1"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCsvNumbers.includes(number)}
                            onChange={() => handleCsvNumberSelect(number)}
                            className="mr-2"
                          />
                          <span className="text-sm">{number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleCsvUploadClick}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 border-dashed rounded-lg p-3 hover:bg-gray-50 transition-colors duration-150"
              >
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Upload CSV</span>
              </button>
            )}
          </div>

          {/* Custom Phone Numbers */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Phone Numbers (one per line)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
              rows="3"
              placeholder="Enter phone numbers, one per line"
              value={customPhoneNumbers}
              onChange={handleCustomPhoneNumbersChange}
            ></textarea>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={loading.sending || (!message.trim() && !selectedFile) || (!selectedContacts.length && !customPhoneNumbers.trim() && !selectedCsvNumbers.length && !csvNumbers.length)}
            className={`w-full bg-blue-500 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 ${
              loading.sending || (!message.trim() && !selectedFile) || (!selectedContacts.length && !customPhoneNumbers.trim() && !selectedCsvNumbers.length && !csvNumbers.length)
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-600'
            }`}
          >
            {loading.sending ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </>
            )}
          </button>

          {/* Display error message if any */}
          {error.sending && (
            <div className="mt-2 p-2 bg-red-50 text-red-500 rounded-lg flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>{error.sending}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sending Progress */}
      {sendingProgress && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Message Sending Progress</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-500">Recipients</p>
              <p className="text-lg font-bold">{sendingProgress.totalRecipients}</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-500">Batch Count</p>
              <p className="text-lg font-bold">{sendingProgress.batchCount}</p>
              <p className="text-xs text-gray-400">{sendingProgress.batchSize} per batch</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-500">Estimated Time</p>
              <p className="text-lg font-bold">{calculateETA(sendingProgress)}</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 border border-blue-100 rounded-lg bg-blue-50">
            <div className="flex items-center">
              <Info className="w-5 h-5 text-blue-500 mr-2" />
              <div>
                <p className="font-medium text-blue-600">
                  Message sending is in progress
                </p>
                <p className="text-sm text-blue-500 mt-1">
                  You can navigate away from this page. Messages will continue to be sent in batches to avoid WhatsApp rate limits.
                </p>
                {sendingProgress.sentFrom && (
                  <p className="text-sm text-blue-500 mt-1">
                    Sending from: {sendingProgress.sentFrom}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info (for development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info</h3>
          <pre className="text-xs overflow-auto p-2 bg-gray-800 text-white rounded-lg">
            {JSON.stringify({
              selectedAccountId: debug.selectedAccountId,
              selectedGroup: selectedGroup?.gid,
              connectionStatus,
              contactsCount: contacts.length,
              selectedContacts: selectedContacts.length,
              csvNumbersCount: csvNumbers.length,
              selectedCsvNumbers: selectedCsvNumbers.length,
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default WhatsAppGroups;