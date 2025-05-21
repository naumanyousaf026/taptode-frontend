import React, { useState, useEffect, useRef } from "react";
import { FaSignInAlt } from "react-icons/fa";
import Balance from "./Balance";

function App() {
  const [step, setStep] = useState(1);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [whatsappInfo, setWhatsappInfo] = useState(null);
  const [countdown, setCountdown] = useState(20);
  const [timerStarted, setTimerStarted] = useState(false);
  const [showFinalMessage, setShowFinalMessage] = useState(false);

  const handleLoginClick = () => {
    setStep(2);
  };

  useEffect(() => {
    if (step === 2) {
      const fetchQrCode = async () => {
        const storedToken = localStorage.getItem("token");
        const secret = encodeURIComponent("e7d0098a46e0af84f43c2b240af5984ae267e08d");
        const sid = encodeURIComponent("2");

        try {
          const response = await fetch(
            `http://localhost:5000/api/generate-whatsapp-qr?secret=${secret}&sid=${sid}`,
            {
              headers: { Authorization: `Bearer ${storedToken}` },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setQrCodeUrl(data.qrImageLink);
            setToken(data.token);
            setTimerStarted(true);
          } else {
            showErrorPopup("Failed to fetch QR code.");
          }
        } catch (error) {
          showErrorPopup("Error fetching QR code.");
        }
      };

      fetchQrCode();
    }
  }, [step]);

  useEffect(() => {
    let timer;
    if (timerStarted && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (timerStarted && countdown === 0) {
      handleQrScanned();
    }
    return () => clearInterval(timer);
  }, [countdown, timerStarted]);

  const handleQrScanned = async () => {
    if (!token) {
      setShowFinalMessage(true);
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;
    const interval = 3000;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setShowFinalMessage(true);
        return;
      }

      attempts++;

      try {
        const response = await fetch(
          `http://localhost:5000/api/get-whatsapp-info?token=${token}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        const data = await response.json();

        if (data.message && data.message.includes("Waiting for WhatsApp information")) {
          setTimeout(poll, interval);
        } else {
          setWhatsappInfo(data);
          setStep(3);
        }
      } catch (err) {
        setTimeout(poll, interval);
      }
    };

    poll();
  };

  const showErrorPopup = (msg) => {
    setError(msg);
    setShowPopup(true);
  };

  return (
    <div className="p-4 min-h-screen bg-[#f5f5f5]">
      <header className="text-center pt-4">
        <h1 className="text-2xl font-bold font-serif tracking-wide">
          Taptod - Premium <span className="block">Service</span>
        </h1>
        <p className="mt-2 text-gray-500">Premium WhatsApp Service & Earnings Tracker</p>
      </header>

      {/* Step 1: Login */}
      {step === 1 && (
        <div className="mt-6 p-6 rounded-lg shadow bg-white text-center flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-[#008069]">Welcome to Taptod</h2>
          <p className="mt-2 text-gray-500">Please click the button to login.</p>
          <button
            onClick={handleLoginClick}
            className="mt-6 px-12 py-3 bg-[#e6f4f1] rounded-md shadow-[-6px_6px_0_#008069] font-bold hover:scale-105 transition-transform flex items-center"
          >
            <FaSignInAlt className="mr-3" />
            Login
          </button>
        </div>
      )}

      {/* Step 2: QR Code */}
      {step === 2 && (
        <div className="mt-8 p-6 rounded-lg shadow bg-white text-center">
          <h2 className="text-2xl font-semibold text-[#008069]">Scan QR Code to Login</h2>
          <p className="mt-2 text-gray-500">Please scan the QR code using the Taptod app.</p>

          <div className="mt-6 flex justify-center">
            <div className="w-64 h-64 bg-gray-200 flex items-center justify-center rounded-lg">
              {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" /> : <p>Loading...</p>}
            </div>
          </div>

          {!showFinalMessage ? (
            <div className="mt-4 text-gray-700 font-medium text-lg">
              Proceeding in <span className="text-xl font-bold text-[#008069]">{countdown}</span> seconds...
            </div>
          ) : (
            <div className="mt-6 p-4 border border-red-200 rounded-md bg-red-50 text-red-600 text-center">
              <h3 className="text-lg font-bold mb-2">Not Connected</h3>
              <p className="text-sm">
                WhatsApp is not connected. Please refresh the page and scan the QR code again.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Balance */}
      {step === 3 && <Balance whatsappInfo={whatsappInfo} />}

      {/* Error Popup */}
      {showPopup && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md w-full">
            <h2 className="text-lg font-bold text-red-600">Error</h2>
            <p className="mt-4 text-gray-600">{error}</p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <footer className="mt-10 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Taptod | Premium WhatsApp Services
      </footer>
    </div>
  );
}

export default App;
