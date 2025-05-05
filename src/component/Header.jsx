import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaUserAlt, FaShareAlt, FaWallet, FaWhatsapp } from "react-icons/fa";
import { TbPackages } from "react-icons/tb";

const NavigationBar = () => {
  return (
    <div className="bg-gray-100 border-t border-gray-300 fixed bottom-0 w-full">
      <div className="flex justify-around items-center py-2">
        {/* Home Link */}
        <Link to="/home" className="flex flex-col text-[#008069] items-center">
          <FaHome className="text-2xl  hover:text-green-500" />
          <span className="text-xs  hover:text-green-500">Home</span>
        </Link>
        

{/* WhatsApp Link */}
<Link to="/state" className="flex flex-col text-[#008069] items-center">
  <FaWhatsapp className="text-2xl hover:text-green-500" />
  <span className="text-xs hover:text-green-500">WhatsApp</span>
</Link>

        {/* Invite Link */}
        <Link to="/invite" className="flex flex-col text-[#008069] items-center">
          <FaShareAlt className="text-2xl  hover:text-green-500" />
          <span className="text-xs  hover:text-green-500">Invite</span>
        </Link>

        {/* Activity Link */}
        <Link to="/activity" className="flex flex-col text-[#008069]  items-center">
          <FaWallet className="text-2xl  hover:text-green-500" />
          <span className="text-xs  hover:text-green-500">Activity</span>
        </Link>

        {/* Me Link */}
        <Link to="/profile" className="flex flex-col text-[#008069] items-center">
          <FaUserAlt className="text-2xl  hover:text-green-500" />
          <span className="text-xs  hover:text-green-500">Me</span>
        </Link>

        <Link to="/package" className="flex flex-col text-[#008069] items-center">
         <TbPackages className="text-2xl  hover:text-green-500" />
          <span className="text-xs  hover:text-green-500">Packages</span>
        </Link>
      </div>
    </div>
  );
};

export default NavigationBar;
