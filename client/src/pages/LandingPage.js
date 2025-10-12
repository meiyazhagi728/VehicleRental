import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaTools, FaShieldAlt, FaMapMarkerAlt, FaStar, FaUsers, FaSearch, FaPhone, FaEnvelope, FaArrowRight, FaCheckCircle, FaPlay } from 'react-icons/fa';
import jaguarImage from '../assets/jaguar xf.png';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to vehicles page with search query
      window.location.href = `/vehicles?search=${encodeURIComponent(searchQuery)}`;
    }
  };
  return (
    <div className="landing-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <img src={jaguarImage} alt="Luxury Vehicle" className="hero-vehicle-image animate-scale" />
          <div className="hero-particles"></div>
        </div>
        <div className="hero-content animate-slide-up">
          <div className={`hero-text ${isVisible ? 'animate-in' : ''}`}>
            <h1 className="hero-title">
              <span className="title-line">Premium Vehicle</span>
              <span className="title-line highlight">Rental Experience</span>
            </h1>
            <p className="hero-subtitle">
              Experience luxury and comfort with our premium fleet of vehicles in Tamil Nadu. 
              From elegant sedans to powerful SUVs, find your perfect ride.
            </p>
            <form className="hero-search" onSubmit={handleSearch}>
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search for vehicles, locations..." 
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary search-btn">
                <FaSearch />
                Search
              </button>
            </form>
            <div className="hero-buttons">
              <Link to="/vehicles" className="btn btn-primary btn-large">
                <FaCar />
                Explore Fleet
                <FaArrowRight />
              </Link>
              <Link to="/register" className="btn btn-outline btn-large">
                <FaUsers />
                Join Now
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Vehicles</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Cities</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose VehicleRental?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaCar />
              </div>
              <h3>Wide Vehicle Selection</h3>
              <p>
                Choose from a diverse fleet of cars, bikes, SUVs, and more. 
                All vehicles are well-maintained and ready for your journey.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaTools />
              </div>
              <h3>24/7 Mechanic Support</h3>
              <p>
                Get instant access to qualified mechanics in your area. 
                Emergency roadside assistance available round the clock.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaShieldAlt />
              </div>
              <h3>Secure & Reliable</h3>
              <p>
                All vehicles are insured and verified. 
                Your safety and satisfaction are our top priorities.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaMapMarkerAlt />
              </div>
              <h3>GPS Integration</h3>
              <p>
                Find nearby mechanics and track your vehicle location. 
                Real-time updates for a worry-free experience.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaStar />
              </div>
              <h3>Verified Reviews</h3>
              <p>
                Read authentic reviews from real customers. 
                Make informed decisions based on community feedback.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaUsers />
              </div>
              <h3>Multi-Role Platform</h3>
              <p>
                Whether you're a customer, vendor, or mechanic, 
                we have the perfect solution for your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>500+</h3>
              <p>Vehicles Available</p>
            </div>
            <div className="stat-item">
              <h3>10,000+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat-item">
              <h3>50+</h3>
              <p>Expert Mechanics</p>
            </div>
            <div className="stat-item">
              <h3>24/7</h3>
              <p>Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Journey?</h2>
            <p>
              Join thousands of satisfied customers who trust VehicleRental 
              for their transportation needs in Tamil Nadu.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Sign Up Now
              </Link>
              <Link to="/vehicles" className="btn btn-outline btn-large">
                Explore Vehicles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h3>Get in Touch</h3>
              <p>Have questions? We're here to help!</p>
              <div className="contact-details">
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <span>support@vehiclerental.com</span>
                </div>
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <span>Chennai, Tamil Nadu</span>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <h4>Send us a message</h4>
              <form>
                <div className="form-row">
                  <input type="text" placeholder="Your Name" className="form-control" />
                  <input type="email" placeholder="Your Email" className="form-control" />
                </div>
                <textarea placeholder="Your Message" className="form-control" rows="4"></textarea>
                <button type="submit" className="btn btn-primary">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

        <style>{`
          .landing-page {
            min-height: 100vh;
            overflow-x: hidden;
            background: var(--bg-tertiary);
            background-attachment: fixed;
            position: relative;
          }

          .hero-section {
            position: relative;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: var(--blue-shard-gradient);
          }

          .hero-particles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(217, 70, 239, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 40% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%);
            animation: float 20s ease-in-out infinite;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }

          .hero-text.animate-in {
            animation: slideInUp 1s ease-out forwards;
          }

          .hero-title {
            font-size: 3.5rem;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 1.5rem;
            text-align: center;
          }

          .title-line {
            display: block;
            opacity: 0;
            animation: fadeInUp 0.8s ease-out forwards;
          }

          .title-line:nth-child(1) {
            animation-delay: 0.2s;
          }

          .title-line:nth-child(2) {
            animation-delay: 0.4s;
          }

          .title-line.highlight {
            background: linear-gradient(135deg, var(--primary-500), var(--secondary-500));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .hero-stats {
            display: flex;
            justify-content: center;
            gap: 3rem;
            margin-top: 3rem;
            opacity: 0;
            animation: fadeInUp 0.8s ease-out 0.6s forwards;
          }

          .stat-item {
            text-align: center;
          }

          .stat-number {
            display: block;
            font-size: 2.5rem;
            font-weight: 800;
            color: var(--primary-500);
            line-height: 1;
          }

          .stat-label {
            display: block;
            font-size: 0.9rem;
            color: var(--gray-600);
            margin-top: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .feature-card {
            opacity: 0;
            transform: translateY(30px);
            animation: fadeInUp 0.8s ease-out forwards;
          }

          .feature-badge {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: var(--success-50);
            color: var(--success-600);
            border-radius: var(--radius-full);
            font-size: 0.875rem;
            font-weight: 600;
            width: fit-content;
          }

          .section-title {
            text-align: center;
            margin-bottom: 3rem;
            font-size: 2.5rem;
            font-weight: 700;
          }

          .title-text {
            color: var(--gray-900);
          }

          .title-highlight {
            background: linear-gradient(135deg, var(--primary-500), var(--secondary-500));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--blue-shard-gradient);
          -webkit-backdrop-filter: blur(8px);
          z-index: 2;
        }

        .hero-vehicle-image {
          position: absolute;
          top: 50%;
          right: 10%;
          transform: translateY(-50%);
          width: 600px;
          height: auto;
          object-fit: contain;
          z-index: 1;
          opacity: 0.9;
        }

        .hero-content {
          position: relative;
          z-index: 3;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-text h1 {
          font-size: 3.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.3rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .hero-search {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: center;
        }

        .search-container {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--grey-500);
          font-size: 1.2rem;
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: none;
          border-radius: 50px;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
        }

        .search-input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
        }

        .search-btn {
          padding: 1rem 2rem;
          border-radius: 50px;
          white-space: nowrap;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn-large {
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .features-section {
          padding: 6rem 0;
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
        }

        .section-title {
          text-align: center;
          font-size: 3rem;
          margin-bottom: 4rem;
          color: var(--grey-800);
          font-weight: 700;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 3rem;
        }

        .feature-card {
          text-align: center;
          padding: 3rem 2rem;
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 123, 255, 0.1);
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 123, 255, 0.15);
        }

        .feature-icon {
          font-size: 4rem;
          color: var(--accent-color);
          margin-bottom: 1.5rem;
        }

        .feature-card h3 {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          color: var(--grey-800);
          font-weight: 600;
        }

        .feature-card p {
          color: var(--grey-600);
          line-height: 1.8;
          font-size: 1.1rem;
        }

        .stats-section {
          padding: 4rem 0;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          text-align: center;
        }

        .stat-item h3 {
          font-size: 3rem;
          font-weight: 700;
          color: var(--accent-color);
          margin-bottom: 0.5rem;
        }

        .stat-item p {
          font-size: 1.2rem;
          color: var(--grey-600);
          font-weight: 500;
        }

        .cta-section {
          padding: 6rem 0;
          background: linear-gradient(135deg, var(--accent-color), #0056b3);
          color: var(--white-color);
        }

        .cta-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .cta-content h2 {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          font-weight: 700;
        }

        .cta-content p {
          font-size: 1.3rem;
          margin-bottom: 3rem;
          opacity: 0.9;
          line-height: 1.6;
        }

        .cta-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-buttons .btn-outline {
          border-color: var(--white-color);
          color: var(--white-color);
          background: transparent;
        }

        .cta-buttons .btn-outline:hover {
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          color: var(--accent-color);
        }

        .contact-section {
          padding: 6rem 0;
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
        }

        .contact-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }

        .contact-info h3 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: var(--grey-800);
        }

        .contact-info p {
          font-size: 1.2rem;
          color: var(--grey-600);
          margin-bottom: 2rem;
        }

        .contact-details {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 1.1rem;
          color: var(--grey-700);
        }

        .contact-icon {
          color: var(--accent-color);
          font-size: 1.3rem;
        }

        .contact-form h4 {
          font-size: 1.8rem;
          margin-bottom: 2rem;
          color: var(--grey-800);
        }

        .contact-form .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .contact-form .form-control {
          padding: 1rem;
          border: 2px solid var(--grey-300);
          border-radius: 10px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .contact-form .form-control:focus {
          outline: none;
          border-color: var(--accent-color);
        }

        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 2rem;
          }

          .hero-vehicle-image {
            position: static;
            transform: none;
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
          }

          .hero-text h1 {
            font-size: 2.5rem;
          }

          .hero-search {
            flex-direction: column;
            align-items: stretch;
          }

          .hero-buttons,
          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .section-title,
          .cta-content h2 {
            font-size: 2rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .contact-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .contact-form .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
