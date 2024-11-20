import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useVerifyOtpMutation } from "../../redux/api/usersApiSlice"; 
import { setCredentials } from "../../redux/features/auth/authSlice";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import { useLocation, useNavigate } from "react-router-dom";

const OtpInput = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = location.state || {}; 
  const [otp, setOtp] = useState(Array(6).fill("")); // Array for 6 OTP digits
  const dispatch = useDispatch();
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation(); 

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, ""); // Allow only numbers
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;

      // Move to the next input field
      if (value && index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }

      setOtp(newOtp);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index]) {
      // Move to the previous input field
      if (index > 0) {
        document.getElementById(`otp-input-${index - 1}`).focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    
    console.log("User ID:", userId); 
    console.log("OTP:", otpString); 

    try {
      const response = await verifyOtp({ userId, otp: otpString }).unwrap();
      console.log("Response:", response); 
      dispatch(setCredentials({ ...response.user }));
      toast.success(response.message); 
      navigate("/"); 
    } catch (error) {
      console.error("Verification error:", error); 
      toast.error(error.data || "Verification failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-back">
      <h2 className="text-2xl font-semibold mb-6">Enter OTP</h2>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-input-${index}`}
            type="text"
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            placeholder="0"
            className="w-14 h-14 text-center text-2xl border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition duration-200 ease-in-out"
            maxLength="1"
          />
        ))}
      </form>
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={isLoading}
        className="mt-6 w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition duration-200 ease-in-out"
      >
        {isLoading ? <Loader /> : "Verify OTP"}
      </button>
    </div>
  );
};

export default OtpInput;