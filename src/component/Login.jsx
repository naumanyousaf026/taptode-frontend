import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import taptod from "../images/taptod_1.png"; // Logo image
import ForgotPasswordModal from "./ForgotPassword";
import { saveToken } from "../utils/auth";
import { useAuth } from "../context/AuthContext";

const ErrorModal = ({ message, isOpen, onClose }) => {
  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-2xl p-6 border-l-4 border-red-500 max-w-sm w-full transform transition-all animate-fadeIn">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-semibold text-gray-800">Error</h2>
              <p className="mt-1 text-gray-600">{message}</p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              className="bg-[#008069] text-white py-2 px-4 rounded-md hover:bg-[#006c58] transition-colors flex items-center space-x-1"
              onClick={onClose}
            >
              <span>Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  );
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Phone number validation
  const validatePhone = (e) => {
    const phoneValue = e.target.value;
    const regex = /^[0-9]{10}$/; // 10-digit phone number validation
    setPhone(phoneValue);
    setPhoneError(
      !regex.test(phoneValue) ? "Please enter a valid phone number." : ""
    );
  };

  // Password validation
  const validatePassword = (e) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);
    setPasswordError(
      passwordValue.length < 6 ? "Password must be at least 6 characters." : ""
    );
  };

  // Toggle Forgot Password modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone || !password) {
      setErrorMessage("Please fill in all fields.");
      setIsErrorModalOpen(true);
      return;
    }

    if (!phoneError && !passwordError) {
      try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone, password }),
        });

        const data = await response.json();

        if (response.ok) {
          login(data.token);
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", "user");
          saveToken(data.token);
          navigate("/home");
        } else {
          setErrorMessage(data.message || "Login failed. Please try again.");
          setIsErrorModalOpen(true);
        }
      } catch (error) {
        console.error("Error:", error);
        setErrorMessage("An unexpected error occurred. Please try again.");
        setIsErrorModalOpen(true);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header with animated gradient */}
      <header className="w-full bg-gradient-to-r from-[#008069] to-[#00a884] text-white py-3 px-4 sm:px-6 shadow-lg border-b-4 border-[#006c58] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+')]"></div>
        <div className="max-w-4xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-white rounded-full shadow-md">
              <img
                src={taptod}
                alt="Logo"
                className="w-8 h-8 sm:w-12 sm:h-12 rounded-full transform hover:scale-110 transition-transform duration-300 ease-in-out"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide uppercase">
              <span className="text-[#ffdd59] drop-shadow-md">Tap</span>
              <span className="text-white drop-shadow-md">tod</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Page Content with decorative elements */}
      <main className="flex-grow flex flex-col items-center px-4 py-6 sm:py-8 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-[#008069] opacity-5 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 sm:w-60 h-48 sm:h-60 bg-[#ffdd59] opacity-5 rounded-full -ml-16 sm:-ml-20 -mb-16 sm:-mb-20"></div>
        
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg mt-4 sm:mt-5 px-4 sm:px-8 py-6 sm:py-8 bg-white rounded-lg shadow-lg transform transition-all hover:shadow-2xl relative z-10 border border-gray-100">
          {/* Form title with accent */}
          <div className="w-full mb-6 sm:mb-8 text-center">
            <div className="inline-block p-2 rounded-lg bg-[#008069] bg-opacity-10 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-[#008069]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-wide">
              <span className="block">Welcome Back</span>
            </h1>
            <div className="h-1 w-12 bg-[#008069] mx-auto mt-2 rounded-full"></div>
          </div>
          
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            {/* Phone Number */}
            <div className="relative">
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-[#008069] mb-1"
              >
                Phone Number
              </label>
              <div className="flex items-center mt-1 bg-gray-50 border-b-2 border-[#008069] rounded-t-lg overflow-hidden group focus-within:ring-2 focus-within:ring-[#008069] focus-within:ring-opacity-50 transition-all">
                <div className="bg-[#008069] bg-opacity-10 p-2 sm:p-3 text-[#008069]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="text-[#008069] text-sm sm:text-base font-medium px-1">+92</span>
                <input
                  type="tel"
                  id="phone"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={validatePhone}
                  className="w-full p-2 sm:p-3 text-sm sm:text-base outline-none roboto-thin bg-gray-50 rounded-md border-[#9CA3AF] bg-transparent"
                  required
                />
              </div>
              {phoneError && (
                <p className="text-red-500 text-xs sm:text-sm mt-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {phoneError}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm text-[#008069] font-medium mb-1"
              >
                Password
              </label>
              <div className="flex items-center bg-gray-50 mt-1 border-b-2 border-[#008069] rounded-t-lg overflow-hidden group focus-within:ring-2 focus-within:ring-[#008069] focus-within:ring-opacity-50 transition-all">
                <div className="bg-[#008069] bg-opacity-10 p-2 sm:p-3 text-[#008069]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={validatePassword}
                  className="w-full p-2 sm:p-3 text-sm sm:text-base outline-none roboto-thin rounded-md border-[#9CA3AF] bg-transparent"
                  required
                />
              </div>
              {passwordError && (
                <p className="text-red-500 text-xs sm:text-sm mt-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {passwordError}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 text-[#008069] focus:ring-[#008069] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs sm:text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={toggleModal}
                className="text-xs sm:text-sm font-medium text-[#008069] hover:text-[#006c58] hover:underline focus:outline-none"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#008069] text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-[#006c58] hover:shadow-lg transition-all flex items-center justify-center space-x-2 group mt-6 sm:mt-8"
            >
              <span>Login</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            
            <div className="text-center mt-4 sm:mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs sm:text-sm text-gray-500">or</span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-[#008069] font-medium hover:underline inline-flex items-center">
                  Register here
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </p>
            </div>
          </form>
        </div>
        
        {/* Trust badges */}
        <div className="flex justify-center items-center space-x-3 sm:space-x-4 mt-6 sm:mt-8 text-gray-400 text-xs sm:text-sm">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-[#008069]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secure</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-[#008069]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Private</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-[#008069]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Trusted</span>
          </div>
        </div>
      </main>
      
      {/* Forgot Password Modal */}
      <ForgotPasswordModal isOpen={isModalOpen} onClose={toggleModal} />

      {/* Error Modal */}
      <ErrorModal
        message={errorMessage}
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
      />
      
      {/* Add CSS animation for fadeIn */}
      <style jsx>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        /* Add responsive media queries */
        @media (max-width: 640px) {
          /* Additional mobile styles can go here */
        }
      `}</style>
    </div>
  );
};

export default Login;