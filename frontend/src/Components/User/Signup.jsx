import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Leaf, User, Phone, Mail, Lock, Check, Sparkles, Heart, Shield, Star } from 'lucide-react';

export default function SignUp() {
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
  const navigate = useNavigate();

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

      alert('Account created successfully!');
      navigate('/loginH');
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
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
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
        .leaf-pattern {
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(13, 148, 136, 0.1) 0%, transparent 50%);
        }
        .input-glow:focus {
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        }
      `}</style>

      <div className="flex min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 leaf-pattern"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-teal-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 opacity-10">
          <Leaf className="w-32 h-32 text-emerald-600 animate-float" />
        </div>
        <div className="absolute bottom-1/4 right-1/4 opacity-10">
          <Leaf className="w-40 h-40 text-teal-600 animate-float" style={{ animationDelay: '1s' }} />
        </div>

        {/* Left Side - Branding & Benefits */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 z-10">
          <div className="max-w-xl animate-fadeInUp">
            {/* Logo */}
            <div className="flex items-center space-x-4 mb-10">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-40 blur-2xl"></div>
                <div className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-6 rounded-3xl rotate-45">
                  <Leaf className="w-14 h-14 text-white -rotate-45" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-700 via-green-700 to-teal-700 bg-clip-text text-transparent">
                  AyuManthra
                </h1>
                <p className="text-base text-emerald-600 font-medium tracking-wider uppercase mt-1">Ancient Wisdom, Modern Care</p>
              </div>
            </div>

            {/* Welcome Message */}
            <h2 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
              Begin Your Journey to <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Natural Wellness
              </span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-10">
              Join thousands of people who have discovered the power of Ayurveda. Get personalized consultations, authentic herbal products, and holistic wellness guidance.
            </p>

            {/* Benefits */}
            <div className="space-y-5">
              {[
                { 
                  icon: Heart, 
                  title: "Personalized Care", 
                  desc: "Get customized ayurvedic treatments based on your unique constitution" 
                },
                { 
                  icon: Shield, 
                  title: "100% Authentic Products", 
                  desc: "All products are naturally sourced and traditionally prepared" 
                },
                { 
                  icon: Star, 
                  title: "Expert Guidance", 
                  desc: "Access certified ayurvedic doctors and wellness experts 24/7" 
                }
              ].map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-emerald-100/50 animate-fadeInUp" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Badge */}
            <div className="mt-10 flex items-center space-x-2 text-gray-600">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 border-2 border-white"></div>
                ))}
              </div>
              <p className="text-sm">
                <span className="font-bold text-emerald-600">10,000+</span> happy members trust us
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="flex-1 flex items-center justify-center p-6 z-10">
          <div className="w-full max-w-xl">
            {/* Signup Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-emerald-100 p-10 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-5">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-800 mb-3">Create Account</h2>
                <p className="text-gray-600 text-lg">Join the AyuManthra wellness community</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Name & Phone - Two Column */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                        placeholder="John Doe"
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || phoneError || !inputs.UserAgree}
                  className="relative w-full bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
                >
                  <div className="absolute inset-0 shimmer-bg"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating Your Account...
                      </>
                    ) : (
                      <>
                        <Leaf className="w-6 h-6" />
                        Create Account
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <a href="/loginH" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline">
                    Sign In
                  </a>
                </p>
              </div>

              {/* Mobile Logo */}
              <div className="lg:hidden mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold">AyuManthra</span>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span>Secure Registration</span>
                <span className="mx-2">•</span>
                <span>256-bit Encryption</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}