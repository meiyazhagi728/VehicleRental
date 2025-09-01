import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>VehicleRental</h3>
            <p>
              Your trusted partner for vehicle rentals in Tamil Nadu. 
              We provide a wide range of vehicles for all your transportation needs.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="#" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" aria-label="Instagram">
                <FaInstagram />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/vehicles">Vehicles</Link></li>
              <li><Link to="/mechanics">Mechanics</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Services</h3>
            <ul>
              <li><Link to="/vehicles?type=Car">Car Rental</Link></li>
              <li><Link to="/vehicles?type=Bike">Bike Rental</Link></li>
              <li><Link to="/vehicles?type=SUV">SUV Rental</Link></li>
              <li><Link to="/mechanics">Mechanic Services</Link></li>
              <li><Link to="/support">24/7 Support</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Contact Info</h3>
            <div className="contact-info">
              <p>
                <FaPhone /> +91 98765 43210
              </p>
              <p>
                <FaEnvelope /> info@vehiclerental.com
              </p>
              <p>
                <FaMapMarkerAlt /> Chennai, Tamil Nadu, India
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 VehicleRental. All rights reserved.</p>
        </div>
      </div>

      <style jsx>{`
        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section ul li {
          margin-bottom: 0.5rem;
        }

        .social-links {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .social-links a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: var(--grey-700);
          border-radius: 50%;
          transition: background-color 0.3s ease;
        }

        .social-links a:hover {
          background: var(--accent-color);
        }

        .contact-info p {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
