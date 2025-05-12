import React from 'react';
import { Paperclip, Send, Upload } from 'lucide-react';

const   MessageSendingForm= () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Groups */}
        <div className="col-span-1 bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[#008069]  mb-4 roboto-thin border-b pb-2">Groups</h3>
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-sm flex items-start gap-2">
            <span className="text-xl">❌</span>
            <span className='roboto-thin'>Request failed with status code 404</span>
          </div>
        </div>

        {/* Contacts */}
        <div className="col-span-1 bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-lg roboto-thin font-semibold text-[#008069] mb-4 border-b pb-2">Contacts</h3>
          <p className="text-gray-500 text-sm">Please select a group to view contacts.</p>
        </div>

        {/* Message Sender */}
         <div className="col-span-2 bg-white shadow-md rounded-xl p-8 border border-gray-200">
                  <h3 className="text-2xl font-semibold roboto-thin text-[#008069]  mb-6 border-b pb-3">Send Message</h3>
        
                  {/* Message */}
                  <div className="mb-5">
                    <label className="block text-sm  roboto-thin text-[#008069] font-medium  mb-2">Message</label>
                    <textarea
                      rows="4"
                      placeholder="Type your message..."
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#008069] outline-none resize-none"
                    />
                  </div>
        
                  {/* Attachments */}
                  <div className="mb-5">
                    <label className="block roboto-thin text-[#008069] text-sm font-medium  mb-2">Attachment</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 hover:border-[#22c55e] hover:text-[#22c55e] cursor-pointer transition-all">
                      <Upload className="mx-auto mb-2 h-5 w-5" />
                      Click to upload or drag file here
                    </div>
                  </div>
        
                  {/* CSV Upload */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium roboto-thin text-[#008069] mb-2">Upload CSV (Phone Numbers)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 hover:border-[#22c55e] hover:text-[#22c55e] cursor-pointer transition-all">
                      <Upload className="mx-auto mb-2 h-5 w-5" />
                      Click to upload CSV
                    </div>
                  </div>
        
                  {/* Custom Numbers */}
                  <div className="mb-6">
                    <label className="block text-sm font-mediumt roboto-thin text-[#008069] mb-2">Custom Phone Numbers</label>
                    <textarea
                      rows="3"
                      placeholder="Enter one number per line"
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#008069] outline-none resize-none"
                    />
                  </div>
        
                  {/* Send Button */}
                  <button className="flex items-center justify-center gap-2 w-full bg-[#008069] text-white py-3 rounded-lg font-medium ">
                    <Send size={18} />
                    Send Message
                  </button>
                </div>
      </div>
    </div>
  );
};

export default MessageSendingForm;
