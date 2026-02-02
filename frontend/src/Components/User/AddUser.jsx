import React, { useState } from 'react';
import axios from 'axios';
import { X, User, Phone, Mail, Lock, Check, Sparkles, Leaf } from 'lucide-react';

const AddUser = ({ onClose, onUserAdded }) => {
  const [inputs, setInputs] = useState({
    userName: '',
    userPhone: '',
    userGmail: '',
    userPassword: '',
    UserAgree: false,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const validatePhone = (phone) => {
    if (!phone.startsWith('0')) return false;
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'userPhone') {
      if (!value.startsWith('0')) {
        setPhoneError('Phone number must start with 0.');
      } else if (!validatePhone(value)) {
        setPhoneError('Phone number must be 10 digits.');
      } else {
        setPhoneError('');
      }
    }

    setInputs((prev) => ({
      ...prev,
      [name]: name === 'isActive' ? value === 'true' : value,
    }));
  };

  const handleCheckbox = () => {
    setInputs((prev) => ({ ...prev, UserAgree: !prev.UserAgree }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (phoneError) {
      alert('Please fix phone number errors before submitting.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/users', {
        userName: String(inputs.userName),
        userPhone: String(inputs.userPhone),
        userGmail: String(inputs.userGmail),
        userPassword: String(inputs.userPassword),
        UserAgree: Boolean(inputs.UserAgree),
        isActive: Boolean(inputs.isActive),
      });

      setInputs({
        userName: '',
        userPhone: '',
        userGmail: '',
        userPassword: '',
        UserAgree: false,
        isActive: true,
      });

      onUserAdded();
      onClose();
    } catch (err) {
      console.error('Add user error:', err);
      if (err.response && err.response.status === 400) {
        alert(err.response.data.message);
      } else {
        alert('Failed to add user.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        .shimmer-bg {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
        .input-glow:focus {
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        }
      `}</style>

      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
        <div className="bg-white/95 backdrop-blur-xl w-full max-w-2xl rounded-3xl shadow-2xl border border-emerald-100 relative animate-slideUp overflow-hidden">
          
          {/* Decorative Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 z-10"
          >
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>

          {/* Header */}
          <div className="pt-8 pb-6 px-8 text-center border-b border-emerald-100/50">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h3>
            <p className="text-gray-600">Join AyuManthra wellness community</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[calc(80vh-1rem)] overflow-y-auto">
            
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="userName"
                  value={inputs.userName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none input-glow transition-all duration-300"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="userPhone"
                  value={inputs.userPhone}
                  onChange={handleChange}
                  required
                  placeholder="0XXXXXXXXX"
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 ${
                    phoneError ? 'border-red-400' : 'border-gray-200'
                  } rounded-xl focus:outline-none input-glow transition-all duration-300`}
                />
              </div>
              {phoneError && (
                <p className="text-red-500 text-xs mt-2 flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {phoneError}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="userGmail"
                  value={inputs.userGmail}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none input-glow transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="userPassword"
                  value={inputs.userPassword}
                  onChange={handleChange}
                  required
                  placeholder="Create a strong password"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none input-glow transition-all duration-300"
                />
              </div>
            </div>

            {/* Status Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Status</label>
              <select
                name="isActive"
                value={inputs.isActive}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none input-glow transition-all duration-300"
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-3 pt-2">
              <div className="relative flex items-center justify-center mt-1">
                <input
                  type="checkbox"
                  name="UserAgree"
                  checked={inputs.UserAgree}
                  onChange={handleCheckbox}
                  className="w-5 h-5 text-emerald-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                />
                {inputs.UserAgree && (
                  <Check className="w-3 h-3 text-white absolute pointer-events-none" />
                )}
              </div>
              <label className="text-sm text-gray-600 leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || phoneError || !inputs.UserAgree}
                className="relative flex-1 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 shimmer-bg"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Leaf className="w-5 h-5" />
                      Create Account
                    </>
                  )}
                </span>
              </button>
              
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Footer Note */}
          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Your data is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddUser;