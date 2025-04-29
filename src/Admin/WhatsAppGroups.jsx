// WhatsAppGroups.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Loader, Copy, Download, User, Users, Phone, AlertTriangle, Wifi, WifiOff, 
         Send, Smartphone, Info, Clock, File, Image, Video, Mic, FileText, Link, Paperclip, X } from 'lucide-react';
import axios from 'axios';

const WhatsAppGroups = () => {
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState({ accounts: false, groups: false, contacts: false, sending: false });
  const [error, setError] = useState({ accounts: null, groups: null, contacts: null, sending: null });
  const [connectionStatus, setConnectionStatus] = useState(true);
  const [message, setMessage] = useState('');
  const [customPhoneNumbers, setCustomPhoneNumbers] = useState('');
  const [sendingProgress, setSendingProgress] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

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
          setConnectedAccounts(response.data.results || []);
          
          // If accounts are loaded, select the first one by default
          if (response.data.results && response.data.results.length > 0) {
            const firstAccount = response.data.results[0];
            setSelectedAccount(firstAccount.contact);
            
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
          // console.error("Unexpected API response structure:", response.data);
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
    setSelectedAccount(account);
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

  // Toggle selecting individual contact
  const handleContactSelect = (phone) => {
    if (selectedContacts.includes(phone)) {
      setSelectedContacts(selectedContacts.filter(p => p !== phone));
    } else {
      setSelectedContacts([...selectedContacts, phone]);
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

  // Send message function
  const handleSendMessage = async () => {
    if (!message.trim() && !selectedFile) {
      alert("Please enter a message or attach a file");
      return;
    }

    // Determine recipients
    let recipients = [...selectedContacts];
    
    // If no specific contacts are selected but a group is selected, use all contacts
    if (selectedGroup && recipients.length === 0 && contacts.length > 0) {
      recipients = contacts.map(contact => contact.phone);
    }
    
    if (recipients.length === 0 && !customPhoneNumbers.trim()) {
      alert("Please select contacts or enter custom phone numbers");
      return;
    }
    
    setLoading(prev => ({ ...prev, sending: true }));
    setError(prev => ({ ...prev, sending: null }));
    setSendingProgress(null);
    
    try {
      // Create form data for API call
      const formData = new FormData();
      formData.append('message', message);
      formData.append('contactId', selectedAccount?.id);
      
      // Add recipients
      if (recipients.length > 0) {
        // Because FormData doesn't handle arrays well, we need to stringify or append each
        formData.append('recipients', JSON.stringify(recipients));
      }
      
      // Add custom numbers
      if (customPhoneNumbers.trim()) {
        formData.append('customNumbers', customPhoneNumbers);
      }
      
      // Add file if selected
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      // Make API call
      const response = await axios.post('http://localhost:5000/api/whatsapp/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Handle successful response
      if (response.data && response.data.success) {
        setSendingProgress({
          totalRecipients: response.data.totalRecipients,
          batchCount: response.data.batchCount,
          batchSize: response.data.batchSize,
          status: 'in_progress',
          startTime: new Date(),
          messageType: response.data.messageType || 'text'
        });
        
        // Clear the form
        setCustomPhoneNumbers('');
        setMessage('');
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
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

      {/* Account Selection */}
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
                  <div className="bg-blue-100 rounded-full p-2">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{account.contact.name || "Unnamed"}</h3>
                    <p className="text-sm text-gray-500">{account.contact.id}</p>
                  </div>
                </div>
              </div>
            ))}
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
                      <p className="text-xs text-gray-500 truncate">{group.gid}</p>
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

          {!selectedAccount ? (
            <div className="text-center p-4 text-gray-500">
              Please select an account to send messages.
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2 min-h-32"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={handleMessageChange}
                  disabled={loading.sending}
                ></textarea>
              </div>

              {/* File Attachment */}
              <div className="mb-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading.sending}
                />
                {!selectedFile ? (
                  <button
                    type="button"
                    onClick={handleAttachClick}
                    disabled={loading.sending}
                    className="flex items-center text-gray-600 border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50"
                  >
                    <Paperclip className="w-4 h-4 mr-2" />
                    Attach File
                  </button>
                ) : (
                  <div className="border border-gray-300 rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {getFileIcon(selectedFile)}
                        <div className="ml-2">
                          <p className="font-medium text-sm truncate max-w-40">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getFileSize(selectedFile)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {filePreview && (
                      <div className="mt-2">
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="max-h-32 rounded-md mx-auto"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Custom Numbers (one per line, with country code)
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2 h-20"
                  placeholder="Examples:
+1234567890
+9876543210"
                  value={customPhoneNumbers}
                  onChange={handleCustomPhoneNumbersChange}
                  disabled={loading.sending}
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipients Summary
                </label>
                <div className="text-sm bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center mb-1">
                    <Users className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-gray-800 font-medium">Selected contacts:</span>
                    <span className="ml-1">{selectedContacts.length}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-gray-800 font-medium">Custom numbers:</span>
                    <span className="ml-1">
                      {customPhoneNumbers.trim() ? customPhoneNumbers.trim().split('\n').length : 0}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={loading.sending || (!selectedGroup && !customPhoneNumbers.trim())}
                className={`w-full flex items-center justify-center py-2 px-4 rounded-md ${
                  loading.sending || (!selectedGroup && !customPhoneNumbers.trim())
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {loading.sending ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </button>

              {/* Progress Display */}
              {sendingProgress && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <h4 className="font-medium text-blue-800">Sending in Progress</h4>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center mb-1">
                      <span className="font-medium mr-1">Total recipients:</span>
                      <span>{sendingProgress.totalRecipients}</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <span className="font-medium mr-1">Batch count:</span>
                      <span>{sendingProgress.batchCount}</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <span className="font-medium mr-1">Batch size:</span>
                      <span>{sendingProgress.batchSize}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-blue-500" />
                      <span className="font-medium mr-1">Estimated completion:</span>
                      <span>{calculateETA(sendingProgress)}</span>
                    </div>
                  </div>
                </div>
              )}

              {error.sending && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-red-700">{error.sending}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppGroups;