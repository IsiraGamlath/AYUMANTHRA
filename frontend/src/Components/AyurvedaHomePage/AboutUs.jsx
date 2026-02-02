import React, { useState, useEffect } from 'react';
import { 
  Phone, Mail, MapPin, Leaf, Heart, Users, Award, 
  Shield, Star, ChevronRight, Target, Eye, 
  Clock, BookOpen, Stethoscope, Quote
} from 'lucide-react';
import { Link } from 'react-router-dom';

import AboutUs1 from "../../assets/aboutUs1.jpg";

const AboutUs = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const stats = [
    { number: "2500+", label: "Years of Tradition", icon: <BookOpen className="stats-icon" /> },
    { number: "500+", label: "Happy Patients", icon: <Heart className="stats-icon" /> },
    { number: "15+", label: "Expert Doctors", icon: <Stethoscope className="stats-icon" /> },
    { number: "50+", label: "Herbal Products", icon: <Leaf className="stats-icon" /> }
  ];

  const values = [
    {
      icon: <Heart className="value-icon" />,
      title: "Holistic Healing",
      description: "We believe in treating the whole person - mind, body, and spirit - using time-tested Ayurvedic principles.",
      color: "linear-gradient(to right, #ef4444, #ec4899)"
    },
    {
      icon: <Leaf className="value-icon" />,
      title: "Natural Wellness",
      description: "Our commitment to 100% natural, chemical-free treatments ensures safe and sustainable healing.",
      color: "linear-gradient(to right, #10b981, #059669)"
    },
    {
      icon: <Users className="value-icon" />,
      title: "Personalized Care",
      description: "Every treatment plan is tailored to individual constitution and health needs for optimal results.",
      color: "linear-gradient(to right, #3b82f6, #06b6d4)"
    },
    {
      icon: <Shield className="value-icon" />,
      title: "Quality Assurance",
      description: "We maintain the highest standards in sourcing, preparation, and delivery of Ayurvedic medicines.",
      color: "linear-gradient(to right, #8b5cf6, #6366f1)"
    }
  ];

  const team = [
    {
      name: "Dr. Priya Jayasinghe",
      role: "Chief Ayurvedic Physician",
      experience: "25+ years",
      specialty: "Panchakarma & Women's Health",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
      quote: "Ayurveda is not just medicine, it's a way of life that brings harmony to body and soul."
    },
    {
      name: "Dr. Sampath Perera",
      role: "Senior Consultant",
      experience: "20+ years",
      specialty: "Digestive Disorders & Detox",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
      quote: "Traditional wisdom combined with modern understanding creates the perfect healing approach."
    },
    {
      name: "Dr. Nishani Fernando",
      role: "Wellness Specialist",
      experience: "15+ years",
      specialty: "Stress Management & Mental Health",
      image: "https://images.unsplash.com/photo-1594824388647-82b5c2a3c0e4?w=400&h=400&fit=crop&crop=face",
      quote: "Mental wellness is the foundation of physical health - Ayurveda treats both with equal importance."
    }
  ];

  const testimonials = [
    {
      name: "Ramesh Silva",
      location: "Colombo",
      text: "AyuManthra transformed my health completely. After years of conventional treatments, their personalized Ayurvedic approach gave me the relief I was seeking.",
      rating: 5
    },
    {
      name: "Priyani De Silva",
      location: "Kandy", 
      text: "The online consultations are so convenient, and the doctors are incredibly knowledgeable. I feel more energetic and balanced than ever before.",
      rating: 5
    },
    {
      name: "Mahesh Perera",
      location: "Galle",
      text: "The herbal medicines are of exceptional quality, and the results speak for themselves. Highly recommend AyuManthra to anyone seeking natural healing.",
      rating: 5
    }
  ];

  const timeline = [
    {
      year: "2018",
      title: "Foundation",
      description: "AyuManthra was founded with a vision to make authentic Ayurvedic healthcare accessible to all Sri Lankans."
    },
    {
      year: "2019",
      title: "First Clinic",
      description: "Opened our first physical consultation center in Colombo with a team of 5 certified Ayurvedic physicians."
    },
    {
      year: "2021",
      title: "Digital Expansion",
      description: "Launched online consultations, making Ayurvedic care accessible remotely during the pandemic."
    },
    {
      year: "2023",
      title: "Herbal Store Launch",
      description: "Introduced our premium herbal product line with over 50 authentic Ayurvedic medicines."
    },
    {
      year: "2025",
      title: "Leading Platform",
      description: "Today, we're Sri Lanka's most trusted digital Ayurvedic healthcare platform serving thousands of patients."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="about-container">
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <img
            src={AboutUs1}
            alt="About Us Hero"
            className="hero-image"
          />
        </div>
        
        <div className="hero-content">
          <div className="hero-inner">
            <div className="hero-badge">
              <Users style={{width: '20px', height: '20px', marginRight: '12px'}} />
              About AyuManthra
            </div>
            <h1 className="hero-title">
              Bridging Ancient 
              <span className="hero-accent"> Wisdom & Modern Care</span>
            </h1>
            <p className="hero-description">
              We're on a mission to make authentic Ayurvedic healthcare accessible to every Sri Lankan, 
              combining 2,500 years of traditional wisdom with modern convenience and technology.
            </p>
            
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-icon">
                    {stat.icon}
                  </div>
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="section">
        <div className="section-container">
          <div className="grid-2">
            <div>
              <div className="badge badge-blue">
                <Target style={{width: '16px', height: '16px', marginRight: '8px'}} />
                Our Mission
              </div>
              <h2 className="section-title">
                Making Ayurveda <span className="title-accent">Accessible</span>
              </h2>
              <p className="section-description">
                To democratize Ayurvedic healthcare in Sri Lanka by providing easy access to qualified 
                practitioners, authentic medicines, and personalized wellness solutions through innovative 
                digital platforms.
              </p>
              <div className="check-list">
                <div className="check-item">
                  <div className="check-icon">
                    <ChevronRight style={{width: '16px', height: '16px', color: '#059669'}} />
                  </div>
                  <span className="check-text">Preserve traditional Ayurvedic knowledge</span>
                </div>
                <div className="check-item">
                  <div className="check-icon">
                    <ChevronRight style={{width: '16px', height: '16px', color: '#059669'}} />
                  </div>
                  <span className="check-text">Make healthcare affordable and accessible</span>
                </div>
                <div className="check-item">
                  <div className="check-icon">
                    <ChevronRight style={{width: '16px', height: '16px', color: '#059669'}} />
                  </div>
                  <span className="check-text">Empower individuals with natural wellness</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="badge badge-purple">
                <Eye style={{width: '16px', height: '16px', marginRight: '8px'}} />
                Our Vision
              </div>
              <h2 className="section-title">
                A Healthier <span className="title-accent-purple">Sri Lanka</span>
              </h2>
              <p className="section-description">
                To become the leading digital Ayurvedic healthcare platform in South Asia, where every 
                individual can access personalized, authentic, and effective natural healing solutions.
              </p>
              <div className="quote-card">
                <Quote className="quote-icon" />
                <p className="quote-text">
                  "We envision a future where Ayurvedic wisdom is seamlessly integrated into modern 
                  life, creating a healthier, more balanced society rooted in natural wellness."
                </p>
                <div className="quote-author">
                  — AyuManthra Founding Team
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section section-white">
        <div className="section-container">
          <div className="center-text">
            <div className="badge badge-green">
              <Heart style={{width: '16px', height: '16px', marginRight: '8px'}} />
              Our Core Values
            </div>
            <h2 className="section-title">
              What Drives <span className="title-accent">Our Passion</span>
            </h2>
            <p className="section-description">
              Our values are the foundation of everything we do, guiding our commitment to 
              authentic Ayurvedic care and patient wellbeing.
            </p>
          </div>

          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-overlay" style={{background: value.color}}></div>
                
                <div className="value-icon-container" style={{background: value.color}}>
                  {value.icon}
                </div>
                
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
                
                <div className="value-border" style={{background: value.color}}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section section-gray">
        <div className="section-container">
          <div className="center-text">
            <div className="badge badge-blue">
              <Users style={{width: '16px', height: '16px', marginRight: '8px'}} />
              Meet Our Team
            </div>
            <h2 className="section-title">
              Expert <span className="title-accent-blue">Healers</span>
            </h2>
            <p className="section-description">
              Our certified Ayurvedic physicians bring decades of experience and deep knowledge 
              of traditional healing practices.
            </p>
          </div>

          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-image-container">
                  <div className="team-image">
                    <img
                      src={member.image}
                      alt={member.name}
                      style={{width: '100%', height: '100%', objectFit: 'cover'}}
                    />
                  </div>
                  <div className="team-experience">{member.experience}</div>
                </div>
                
                <div className="team-info">
                  <h3 className="team-name">{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                  <p className="team-specialty">{member.specialty}</p>
                  
                  <div className="team-quote">
                    <Quote className="team-quote-icon" />
                    <p className="team-quote-text">"{member.quote}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="section section-white">
        <div className="section-container">
          <div className="center-text">
            <div className="badge badge-orange">
              <Clock style={{width: '16px', height: '16px', marginRight: '8px'}} />
              Our Journey
            </div>
            <h2 className="section-title">
              The <span className="title-accent-orange">AyuManthra</span> Story
            </h2>
            <p className="section-description">
              From a small vision to Sri Lanka's leading digital Ayurvedic platform - 
              here's how we've grown over the years.
            </p>
          </div>

          <div className="timeline">
            <div className="timeline-container">
              <div className="timeline-line"></div>
              
              {timeline.map((item, index) => (
                <div key={index} className={`timeline-item ${index % 2 === 1 ? 'timeline-item-reverse' : ''}`}>
                  <div className="timeline-dot"></div>
                  
                  <div className={`timeline-content ${index % 2 === 0 ? 'timeline-content-left' : 'timeline-content-right'}`}>
                    <div className="timeline-card">
                      <div className="timeline-year">{item.year}</div>
                      <h3 className="timeline-title">{item.title}</h3>
                      <p className="timeline-description">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section section-green">
        <div className="section-container">
          <div className="center-text">
            <div className="badge badge-white">
              <Star style={{width: '16px', height: '16px', marginRight: '8px'}} />
              Patient Stories
            </div>
            <h2 className="section-title section-title-white">
              What Our <span className="title-accent-green">Patients Say</span>
            </h2>
            <p className="section-description section-description-white">
              Real experiences from people who've transformed their health with AyuManthra
            </p>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-overlay"></div>
            <Quote className="testimonial-quote-icon" />
            
            <p className="testimonial-text">"{testimonials[currentTestimonial].text}"</p>
            
            <div className="testimonial-footer">
              <div>
                <div className="testimonial-name">{testimonials[currentTestimonial].name}</div>
                <div className="testimonial-location">{testimonials[currentTestimonial].location}</div>
              </div>
              
              <div className="testimonial-stars">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="testimonial-star" />
                ))}
              </div>
            </div>
            
            <div className="testimonial-indicators">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`testimonial-indicator ${index === currentTestimonial ? 'testimonial-indicator-active' : ''}`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" style={{background: 'linear-gradient(to bottom right, #f0fdf4, #ecfdf5)'}}>
        <div className="cta-section">
          <h2 className="section-title">
            Ready to Begin Your <span className="title-accent">Wellness Journey?</span>
          </h2>
          <p className="section-description">
            Join thousands of satisfied patients who've discovered the power of authentic Ayurvedic care
          </p>
          <Link
            to="/products"
            className="cta-button"
          >
            Explore Our Services
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <div className="footer-logo">
                  <Leaf style={{width: '20px', height: '20px', color: 'white'}} />
                </div>
                <div className="footer-brand-text">
                  <h3>AyuManthra</h3>
                  <p>Ancient Wisdom, Modern Care</p>
                </div>
              </div>
              <p className="footer-description">
                Bringing ancient Ayurvedic wisdom to modern healthcare in Sri Lanka
              </p>
              <div className="footer-social">
                <div className="social-icon"><Phone size={20} /></div>
                <div className="social-icon"><Mail size={20} /></div>
                <div className="social-icon"><MapPin size={20} /></div>
              </div>
            </div>

            <div>
              <h4 className="footer-section-title">Quick Links</h4>
              <div className="footer-links">
                <Link to="/home" className="footer-link">Home</Link>
                <a href="#services" className="footer-link">Services</a>
                <a href="#products" className="footer-link">Products</a>
                <Link to="/aboutus" className="footer-link">About Us</Link>
              </div>
            </div>

            <div>
              <h4 className="footer-section-title">Services</h4>
              <div className="footer-links">
                <a href="#" className="footer-link">Online Consultation</a>
                <a href="#" className="footer-link">Physical Consultation</a>
                <a href="#" className="footer-link">Herbal Store</a>
                <a href="#" className="footer-link">Wellness Planning</a>
              </div>
            </div>

            <div>
              <h4 className="footer-section-title">Contact Info</h4>
              <div className="footer-contact">
                <div className="contact-item">
                  <Phone className="contact-icon" size={20} />
                  <span className="contact-text">+94 11 234 5678</span>
                </div>
                <div className="contact-item">
                  <Mail className="contact-icon" size={20} />
                  <span className="contact-text">info@ayumanthra.lk</span>
                </div>
                <div className="contact-item">
                  <MapPin className="contact-icon" size={20} />
                  <span className="contact-text">Colombo, Sri Lanka</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2025 AyuManthra. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        /* Keep all your existing CSS here - I've removed the duplicate header styles */
        /* Your existing CSS continues below */
        
.about-container {
  min-height: 100vh;
  background: linear-gradient(to bottom right, #f0fdf4, #ecfdf5);
}

/* Hero Section */
.hero-section {
  position: relative;
  padding: 128px 0;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(6, 78, 59, 0.95), rgba(22, 101, 52, 0.9), rgba(6, 78, 59, 0.95));
  z-index: 10;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  position: relative;
  z-index: 20;
}

.hero-inner {
  max-width: 896px;
  margin: 0 auto;
  text-align: center;
  color: white;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 12px 24px;
  border-radius: 9999px;
  color: white;
  font-weight: 500;
  margin-bottom: 32px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hero-title {
  font-size: 64px;
  font-weight: bold;
  margin-bottom: 32px;
  line-height: 1.1;
}

.hero-accent {
  display: block;
  color: #bbf7d0;
}

.hero-description {
  font-size: 24px;
  line-height: 1.5;
  color: #bbf7d0;
  margin-bottom: 48px;
  max-width: 768px;
  margin: 0 auto 48px auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  margin-top: 64px;
}

.stat-item {
  text-align: center;
}

.stat-icon {
  width: 64px;
  height: 64px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 16px auto;
}

.stats-icon {
  width: 32px;
  height: 32px;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  color: #bbf7d0;
  font-size: 14px;
}

/* Section Styles */
.section {
  padding: 80px 0;
}

.section-white {
  background-color: white;
}

.section-gray {
  background: linear-gradient(to bottom right, #f9fafb, white);
}

.section-green {
  background: linear-gradient(to right, #059669, #10b981);
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 64px;
  align-items: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
}

.badge-blue {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.badge-purple {
  background-color: #ede9fe;
  color: #7c3aed;
}

.badge-green {
  background-color: #dcfce7;
  color: #166534;
}

.badge-orange {
  background-color: #fed7aa;
  color: #c2410c;
}

.badge-white {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.section-title {
  font-size: 48px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 24px;
}

.section-title-white {
  color: white;
}

.title-accent {
  color: #059669;
}

.title-accent-purple {
  color: #7c3aed;
}

.title-accent-blue {
  color: #2563eb;
}

.title-accent-orange {
  color: #ea580c;
}

.title-accent-green {
  color: #bbf7d0;
}

.section-description {
  font-size: 20px;
  color: #4b5563;
  margin-bottom: 32px;
  line-height: 1.6;
}

.section-description-white {
  color: #bbf7d0;
}

.check-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.check-icon {
  width: 32px;
  height: 32px;
  background-color: #dcfce7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-text {
  color: #374151;
  font-weight: 500;
}

.quote-card {
  background: linear-gradient(to right, #7c3aed, #6366f1);
  border-radius: 16px;
  padding: 24px;
  color: white;
}

.quote-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 16px;
  color: #c4b5fd;
}

.quote-text {
  font-size: 18px;
  font-style: italic;
  line-height: 1.6;
  margin-bottom: 16px;
}

.quote-author {
  color: #c4b5fd;
}

.center-text {
  text-align: center;
  margin-bottom: 64px;
}

/* Values Section */
.values-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  max-width: 1152px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .values-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.value-card {
  background-color: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.5s;
  border: 1px solid #f3f4f6;
  overflow: hidden;
  position: relative;
}

.value-card:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transform: translateY(-8px);
}

.value-overlay {
  position: absolute;
  top: 0;
  right: 0;
  width: 128px;
  height: 128px;
  border-radius: 50%;
  transform: translate(64px, -64px);
  opacity: 0.1;
  transition: transform 0.7s;
}

.value-icon-container {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  transition: transform 0.3s;
}

.value-icon {
  width: 40px;
  height: 40px;
}

.value-title {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 16px;
}

.value-description {
  color: #4b5563;
  line-height: 1.6;
}

.value-border {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s;
}

.value-card:hover .value-border {
  transform: scaleX(1);
}

/* Team Section */
.team-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  max-width: 1280px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .team-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.team-card {
  background-color: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.5s;
}

.team-card:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transform: translateY(-12px);
}

.team-image-container {
  position: relative;
  margin-bottom: 24px;
}

.team-image {
  width: 128px;
  height: 128px;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.team-card:hover .team-image {
  transform: scale(1.05);
}

.team-experience {
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(to right, #059669, #10b981);
  color: white;
  padding: 4px 16px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 500;
}

.team-info {
  text-align: center;
}

.team-name {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8px;
}

.team-role {
  color: #059669;
  font-weight: 600;
  margin-bottom: 8px;
}

.team-specialty {
  color: #4b5563;
  font-size: 14px;
  margin-bottom: 16px;
}

.team-quote {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 16px;
}

.team-quote-icon {
  width: 20px;
  height: 20px;
  color: #9ca3af;
  margin: 0 auto 8px auto;
  display: block;
}

.team-quote-text {
  color: #4b5563;
  font-style: italic;
  font-size: 14px;
  line-height: 1.5;
}

/* Timeline Section */
.timeline {
  max-width: 896px;
  margin: 0 auto;
}

.timeline-container {
  position: relative;
}

.timeline-line {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #059669, #10b981);
  border-radius: 2px;
}

.timeline-item {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 48px;
}

.timeline-item-reverse {
  flex-direction: row-reverse;
}

.timeline-dot {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  background: linear-gradient(to right, #059669, #10b981);
  border-radius: 50%;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.timeline-content {
  width: 41.666667%;
}

.timeline-content-left {
  padding-right: 32px;
}

.timeline-content-right {
  padding-left: 32px;
}

.timeline-card {
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  transition: all 0.3s;
}

.timeline-card:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.timeline-year {
  font-size: 24px;
  font-weight: bold;
  color: #059669;
  margin-bottom: 8px;
}

.timeline-title {
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 12px;
}

.timeline-description {
  color: #4b5563;
  line-height: 1.6;
}

/* Testimonial Section */
.testimonial-card {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 48px;
  color: white;
  position: relative;
  overflow: hidden;
  max-width: 896px;
  margin: 0 auto;
}

.testimonial-overlay {
  position: absolute;
  top: 0;
  right: 0;
  width: 128px;
  height: 128px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  transform: translate(64px, -64px);
}

.testimonial-quote-icon {
  width: 48px;
  height: 48px;
  color: #bbf7d0;
  margin-bottom: 24px;
}

.testimonial-text {
  font-size: 24px;
  line-height: 1.6;
  margin-bottom: 32px;
  position: relative;
  z-index: 10;
}

.testimonial-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 10;
}

.testimonial-name {
  font-size: 20px;
  font-weight: bold;
  color: white;
  margin-bottom: 4px;
}

.testimonial-location {
  color: #bbf7d0;
}

.testimonial-stars {
  display: flex;
  gap: 4px;
}

.testimonial-star {
  width: 20px;
  height: 20px;
  color: #fbbf24;
  fill: currentColor;
}

.testimonial-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
}

.testimonial-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 0.2s;
  background-color: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
}

.testimonial-indicator-active {
  background-color: white;
}

/* CTA Section */
.cta-section {
  padding: 80px 16px;
  text-align: center;
  max-width: 896px;
  margin: 0 auto;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  background: linear-gradient(to right, #059669, #10b981);
  color: white;
  border-radius: 9999px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  margin-top: 24px;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Footer */
.footer {
  background-color: #111827;
  color: white;
  padding: 64px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  margin-bottom: 48px;
}

@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.footer-logo {
  width: 40px;
  height: 40px;
  background: linear-gradient(to right, #059669, #10b981);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-brand-text h3 {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.footer-brand-text p {
  color: #10b981;
  font-size: 14px;
  margin: 0;
}

.footer-description {
  color: #9ca3af;
  margin-bottom: 24px;
  line-height: 1.6;
}

.footer-social {
  display: flex;
  gap: 16px;
}

.social-icon {
  width: 40px;
  height: 40px;
  background-color: #059669;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  cursor: pointer;
}

.social-icon:hover {
  background-color: #047857;
}

.footer-section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-link {
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #10b981;
}

.footer-contact {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contact-icon {
  color: #10b981;
}

.contact-text {
  color: #9ca3af;
}

.footer-bottom {
  border-top: 1px solid #374151;
  padding-top: 32px;
  text-align: center;
}

.footer-bottom p {
  color: #9ca3af;
  margin: 0;
}

/* Responsive */
@media (min-width: 1024px) {
  .grid-2 {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 767px) {
  .hero-title {
    font-size: 36px;
  }
  
  .section-title {
    font-size: 32px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .timeline-line {
    left: 24px;
  }
  
  .timeline-dot {
    left: 24px;
  }
  
  .timeline-content {
    width: 100%;
    padding-left: 64px !important;
    padding-right: 0 !important;
  }
}
      `}</style>
    </div>
  );
};

export default AboutUs;