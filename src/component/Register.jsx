import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import taptod from "../images/taptod_1.png";

const Register = () => {
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [showReward, setShowReward] = useState(false);
  const navigate = useNavigate();

  // Extract referral code from the URL on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const refCode = queryParams.get("ref");
    if (refCode) {
      setInvitationCode(refCode);
    }
  }, []);

  const validateEmail = (e) => {
    const email = e.target.value;
    setEmail(email);
    const regex = /\S+@\S+\.\S+/;
    setEmailError(
      !regex.test(email) ? "Please enter a valid email address." : ""
    );
  };

  const validatePassword = (e) => {
    const password = e.target.value;
    setPassword(password);
    setPasswordError(
      password.length < 6 ? "Password must be at least 6 characters." : ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailError && !passwordError) {
      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phone,
              email,
              password,
              referredBy: invitationCode, // Send the invitation code as referredBy
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.token);
          console.log("Registration successful");
          
          // Show reward message
          setShowReward(true);
          
          // Hide reward message after 5 seconds and redirect to login
          setTimeout(() => {
            setShowReward(false);
            navigate("/login");
          }, 5000);
        } else {
          const data = await response.json();
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header with animated gradient */}
      <header className="w-full bg-gradient-to-r from-[#008069] to-[#00a884] text-white py-3 px-4 shadow-lg border-b-4 border-[#006c58] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+')]"></div>
        <div className="max-w-4xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-white rounded-full shadow-md">
              <img
                src={taptod}
                alt="Logo"
                className="w-12 h-12 rounded-full transform hover:scale-110 transition-transform duration-300 ease-in-out"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-wide uppercase">
              <span className="text-[#ffdd59] drop-shadow-md">Tap</span>
              <span className="text-white drop-shadow-md">tod</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Reward Modal for Mobile */}
      {showReward && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border-4 border-[#008069] transform transition-all duration-500 animate-pulse">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 flex items-center justify-center bg-[#008069] bg-opacity-20 rounded-full">
                  <span className="text-5xl">🎁</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#008069] mb-3">Congratulations!</h3>
              <div className="h-1 w-16 bg-[#ffdd59] mx-auto mb-4 rounded-full"></div>
              <p className="text-gray-700 mb-4">You've received a welcome bonus of</p>
              <div className="text-4xl font-bold text-[#008069] mb-4">10 Rupees</div>
              <div className="flex justify-center space-x-1 mb-3">
                {"★★★★★".split("").map((star, i) => (
                  <span key={i} className="text-[#ffdd59] text-xl">
                    {star}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600">Redirecting to login page...</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-[#008069] h-1.5 rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Content with decorative elements */}
      <main className="flex-grow flex flex-col items-center px-4 py-8 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#008069] opacity-5 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#ffdd59] opacity-5 rounded-full -ml-20 -mb-20"></div>
        
        <div className="w-full max-w-lg mt-5 px-8 py-8 bg-white rounded-lg shadow-lg transform transition-all hover:shadow-2xl relative z-10 border border-gray-100">
          {/* Form title with accent */}
          <div className="w-full mb-8 text-center">
            <div className="inline-block p-2 rounded-lg bg-[#008069] bg-opacity-10 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#008069]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
              <span className="block">Create Your Account</span>
            </h1>
            <div className="h-1 w-12 bg-[#008069] mx-auto mt-2 rounded-full"></div>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-[#008069] mb-1"
              >
                Phone Number
              </label>
              <div className="flex items-center mt-1 bg-gray-50 border-b-2 border-[#008069] rounded-t-lg overflow-hidden group focus-within:ring-2 focus-within:ring-[#008069] focus-within:ring-opacity-50 transition-all">
                <div className="bg-[#008069] bg-opacity-10 p-3 text-[#008069]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  id="phone"
                  placeholder="Enter your phone number (+923107726015)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 outline-none roboto-thin bg-gray-50 rounded-md border-[#9CA3AF] bg-transparent"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="email"
                className="block text-[#008069] text-sm font-medium mb-1"
              >
                Email Address
              </label>
              <div className="flex items-center mt-1 border-b-2 bg-gray-50 border-[#008069] rounded-t-lg overflow-hidden group focus-within:ring-2 focus-within:ring-[#008069] focus-within:ring-opacity-50 transition-all">
                <div className="bg-[#008069] bg-opacity-10 p-3 text-[#008069]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  onChange={validateEmail}
                  className="w-full p-3 outline-none bg-gray-50 roboto-thin rounded-md"
                  required
                />
              </div>
              {emailError && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {emailError}
                </p>
              )}
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm text-[#008069] font-medium mb-1"
              >
                Password
              </label>
              <div className="flex items-center bg-gray-50 mt-1 border-b-2 border-[#008069] rounded-t-lg overflow-hidden group focus-within:ring-2 focus-within:ring-[#008069] focus-within:ring-opacity-50 transition-all">
                <div className="bg-[#008069] bg-opacity-10 p-3 text-[#008069]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter a secure password"
                  onChange={validatePassword}
                  className="w-full p-3 outline-none roboto-thin rounded-md border-[#9CA3AF] bg-transparent"
                  required
                />
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {passwordError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="invitation-code"
                className="block text-sm font-medium text-[#008069] mb-1"
              >
                Invitation Code (Optional)
              </label>
              <div className="flex bg-gray-50 items-center mt-1 border-b-2 border-[#008069] rounded-t-lg overflow-hidden group focus-within:ring-2 focus-within:ring-[#008069] focus-within:ring-opacity-50 transition-all">
                <div className="bg-[#008069] bg-opacity-10 p-3 text-[#008069]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="invitation-code"
                  placeholder="Enter your invitation code"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  className="w-full p-3 outline-none roboto-thin rounded-md border-[#9CA3AF] bg-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#008069] text-white py-4 rounded-lg font-semibold hover:bg-[#006c58] hover:shadow-lg transition-all flex items-center justify-center space-x-2 group mt-8"
            >
              <span>Register Now</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            
            <div className="text-center mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">or</span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-[#008069] font-medium hover:underline inline-flex items-center">
                  Login here
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </p>
            </div>
          </form>
        </div>
        
        {/* Trust badges */}
        <div className="flex justify-center items-center space-x-4 mt-8 text-gray-400 text-sm">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#008069]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secure</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#008069]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Private</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#008069]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Trusted</span>
          </div>
        </div>
      </main>
      
      {/* Add CSS animation for progress bar */}
      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default Register;