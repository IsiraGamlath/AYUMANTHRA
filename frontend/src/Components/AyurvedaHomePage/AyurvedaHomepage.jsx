import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Calendar, ShoppingCart, Users, Leaf, Heart, Star, ChevronRight, Clock, Shield, Award, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AyurvedaHomepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  // Placeholder images - replace with your actual images
  const Home3 = "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200";
  const Home2 = "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1200";
  const Home1 = "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200";
  const Home4 = "https://images.unsplash.com/photo-1474073705359-5da2a8270c64?w=1200";

  const heroSlides = [
    {
      title: "Traditional Ayurvedic Healing",
      subtitle: "Discover the ancient wisdom of Ayurveda for modern wellness",
      image: Home3
    },
    {
      title: "Online & Physical Consultations",
      subtitle: "Connect with certified Ayurvedic doctors from anywhere",
      image: Home2
    },
    {
      title: "Premium Herbal Products",
      subtitle: "Authentic Sri Lankan herbs and traditional medicines",
      image: Home1
    }
  ];

  const services = [
    {
      icon: <Calendar />,
      title: "Doctor Consultations",
      description: "Book online or physical appointments with experienced Ayurvedic practitioners",
      features: ["Online Video Calls", "In-Person Visits", "24/7 Booking"],
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: <ShoppingCart />,
      title: "Herbal Store",
      description: "Authentic Sri Lankan herbs and traditional Ayurvedic medicines",
      features: ["Quality Assured", "Fast Delivery", "Expert Guidance"],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Heart />,
      title: "Wellness Planning",
      description: "Personalized wellness plans tailored to your unique constitution",
      features: ["Custom Diet Plans", "Lifestyle Guidance", "Progress Tracking"],
      color: "from-teal-500 to-cyan-500"
    },
    {
      icon: <Users />,
      title: "User Management",
      description: "Comprehensive patient care and medical history management",
      features: ["Digital Records", "Appointment History", "Treatment Plans"],
      color: "from-cyan-500 to-blue-500"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero Section with Parallax Effect */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroSlides[currentSlide].image}
            alt="Hero"
            className="w-full h-full object-cover transition-all duration-1000 ease-in-out scale-105 animate-slow-zoom"
          />
          
        </div>
        
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl animate-fade-in-up">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-emerald-300 animate-pulse" />
                <span className="text-emerald-300 font-medium tracking-wide">Welcome to AyuManthra</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                {heroSlides[currentSlide].title}
              </h1>
              <p className="text-xl md:text-2xl text-emerald-100 mb-8 leading-relaxed">
                {heroSlides[currentSlide].subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="group px-8 py-4 bg-white text-emerald-700 rounded-full font-semibold text-lg hover:bg-emerald-50 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 shadow-xl"
                >
                  Explore Products
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/doctors"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-emerald-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Book Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? 'w-12 h-3 bg-white'
                  : 'w-3 h-3 bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Floating Features Bar */}
      <section className="relative z-30 -mt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-lg border border-emerald-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { icon: <Clock className="w-6 h-6" />, title: "24/7 Support", desc: "Always here for you" },
                { icon: <Shield className="w-6 h-6" />, title: "100% Secure", desc: "Your data is safe" },
                { icon: <Award className="w-6 h-6" />, title: "Certified Doctors", desc: "Licensed professionals" },
                { icon: <Leaf className="w-6 h-6" />, title: "Natural Healing", desc: "Herbal remedies" }
              ].map((feature, index) => (
                <div key={index} className="text-center group cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Enhanced */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" id="services" data-animate>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-medium mb-4">
              <Heart className="w-4 h-4" />
              Our Services
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Wellness</span> Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience comprehensive Ayurvedic healthcare combining ancient wisdom with modern convenience
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${service.color} opacity-5 rounded-full -translate-y-32 translate-x-32 group-hover:scale-150 transition-transform duration-700`}></div>
                
                <div className={`w-20 h-20 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 text-white transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  {service.icon}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>

                <div className="space-y-3 mb-6">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-700">
                      <div className={`w-8 h-8 bg-gradient-to-br ${service.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <ChevronRight className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center text-emerald-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                  Learn More
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ayurveda Info Section - Modern Design */}
      <section className="relative py-24 overflow-hidden" data-animate>
        <div className="absolute inset-0">
          <img src={Home4} alt="Ayurveda" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 via-green-900/90 to-teal-900/95"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full font-medium mb-6">
                <Leaf className="w-4 h-4" />
                Ancient Wisdom
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                What is Ayurveda?
              </h2>
              <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
                Ayurveda, meaning "knowledge of life" in Sanskrit, is a 5,000-year-old holistic healing system 
                practiced in Sri Lanka for over 2,500 years.
              </p>

              <div className="space-y-4">
                {[
                  { icon: <Heart />, title: "Holistic Approach", desc: "Treats mind, body, and spirit" },
                  { icon: <Leaf />, title: "Natural Medicine", desc: "Herbs and natural therapies" },
                  { icon: <Users />, title: "Personalized Care", desc: "Customized treatments" }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">{item.title}</h4>
                      <p className="text-emerald-200">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { letter: "V", name: "Vata", element: "Air & Space", color: "from-red-500 to-pink-500" },
                  { letter: "P", name: "Pitta", element: "Fire & Water", color: "from-orange-500 to-amber-500" },
                  { letter: "K", name: "Kapha", element: "Earth & Water", color: "from-green-500 to-emerald-500" }
                ].map((dosha, index) => (
                  <div key={index} className="text-center">
                    <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${dosha.color} rounded-2xl flex items-center justify-center mb-3 text-white font-bold text-2xl shadow-lg`}>
                      {dosha.letter}
                    </div>
                    <h5 className="text-white font-bold text-sm mb-1">{dosha.name}</h5>
                    <p className="text-emerald-200 text-xs">{dosha.element}</p>
                  </div>
                ))}
              </div>
              <div className="text-center pt-6 border-t border-white/20">
                <h4 className="text-white font-bold mb-2">The Three Doshas</h4>
                <p className="text-emerald-200 text-sm">
                  Biological energies governing all physical and mental processes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { number: "500+", label: "Happy Patients" },
              { number: "50+", label: "Herbal Products" },
              { number: "10+", label: "Expert Doctors" },
              { number: "24/7", label: "Online Support" }
            ].map((stat, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="text-5xl md:text-6xl font-bold mb-2 group-hover:scale-110 transition-transform">{stat.number}</div>
                <div className="text-emerald-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Start Your Healing Journey Today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Experience the power of traditional Ayurvedic medicine with modern convenience
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AyuManthra</h3>
                  <p className="text-emerald-400 text-sm">Ancient Wisdom, Modern Care</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Bringing ancient Ayurvedic wisdom to modern healthcare in Sri Lanka
              </p>
            </div>

            {[
              { title: "Quick Links", links: ["Home", "Services", "Products", "Doctors", "About Us"] },
              { title: "Services", links: ["Online Consultation", "Physical Consultation", "Herbal Store", "Wellness Planning"] },
              { title: "Contact", items: [
                { icon: <Phone className="w-4 h-4" />, text: "+94 11 234 5678" },
                { icon: <Mail className="w-4 h-4" />, text: "info@ayumanthra.lk" },
                { icon: <MapPin className="w-4 h-4" />, text: "Colombo, Sri Lanka" }
              ]}
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-bold mb-4">{section.title}</h4>
                {section.links && (
                  <ul className="space-y-2">
                    {section.links.map((link, idx) => (
                      <li key={idx}>
                        <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {section.items && (
                  <div className="space-y-3">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-400">
                        {item.icon}
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© 2025 AyuManthra. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slow-zoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AyurvedaHomepage;