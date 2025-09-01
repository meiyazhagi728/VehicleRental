import React from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaTools, FaShieldAlt, FaMapMarkerAlt, FaStar, FaUsers } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Rent Vehicles with Ease</h1>
          <p>
            Discover the perfect vehicle for your journey in Tamil Nadu. 
            From cars to bikes, we have everything you need for a comfortable ride.
          </p>
          <div className="hero-buttons">
            <Link to="/vehicles" className="btn btn-primary">
              Browse Vehicles
            </Link>
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
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
              <Link to="/register" className="btn btn-primary">
                Sign Up Now
              </Link>
              <Link to="/vehicles" className="btn btn-outline">
                Explore Vehicles
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .features-section {
          padding: 4rem 0;
          background: var(--white-color);
        }

        .section-title {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 3rem;
          color: var(--grey-800);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          text-align: center;
          padding: 2rem;
          background: var(--white-color);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }

        .feature-icon {
          font-size: 3rem;
          color: var(--accent-color);
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: var(--grey-800);
        }

        .feature-card p {
          color: var(--grey-600);
          line-height: 1.6;
        }

        .cta-section {
          padding: 4rem 0;
          background: linear-gradient(135deg, var(--accent-color), #0056b3);
          color: var(--white-color);
        }

        .cta-content {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-content h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .cta-content p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-buttons .btn-outline {
          border-color: var(--white-color);
          color: var(--white-color);
        }

        .cta-buttons .btn-outline:hover {
          background: var(--white-color);
          color: var(--accent-color);
        }

        @media (max-width: 768px) {
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
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
