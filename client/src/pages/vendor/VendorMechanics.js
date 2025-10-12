import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { 
  FaArrowLeft, 
  FaWrench, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaStar,
  FaPlus,
  FaSearch,
  FaFilter
} from "react-icons/fa";
import axios from "axios";
import "./VendorMechanics.css";

const VendorMechanics = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [mechanics, setMechanics] = useState([]);
  const [associatedMechanics, setAssociatedMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssociated, setShowAssociated] = useState(true);

  useEffect(() => {
    fetchMechanics();
    fetchAssociatedMechanics();
  }, []);

  const fetchMechanics = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/mechanics", {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      setMechanics(response.data.mechanics || response.data);
    } catch (error) {
      console.error("Error fetching mechanics:", error);
      toast.error("Failed to fetch mechanics");
    }
  };

  const fetchAssociatedMechanics = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/vehicles/vendor/mechanics", {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      setAssociatedMechanics(response.data);
    } catch (error) {
      console.error("Error fetching associated mechanics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssociateMechanic = async (mechanicId) => {
    try {
      await axios.post(`http://localhost:5000/api/vehicles/vendor/mechanics/${mechanicId}/associate`, {}, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      toast.success("Mechanic associated successfully");
      fetchAssociatedMechanics();
    } catch (error) {
      console.error("Error associating mechanic:", error);
      toast.error("Failed to associate mechanic");
    }
  };

  const handleDisassociateMechanic = async (mechanicId) => {
    if (window.confirm("Are you sure you want to remove this mechanic association?")) {
      try {
        await axios.delete(`http://localhost:5000/api/vehicles/vendor/mechanics/${mechanicId}/disassociate`, {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        });
        toast.success("Mechanic disassociated successfully");
        fetchAssociatedMechanics();
      } catch (error) {
        console.error("Error disassociating mechanic:", error);
        toast.error("Failed to disassociate mechanic");
      }
    }
  };

  const filteredMechanics = (showAssociated ? associatedMechanics : mechanics).filter(mechanic =>
    mechanic.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mechanic.services?.some(service => 
      service.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="vendor-mechanics-page">
        <div className="loading">Loading mechanics...</div>
      </div>
    );
  }

  return (
    <div className="vendor-mechanics-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/vendor/dashboard")}>
          <FaArrowLeft />
          Back to Dashboard
        </button>
        <h1>Manage Mechanics</h1>
      </div>

      <div className="mechanics-controls">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search mechanics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="view-toggles">
          <button
            className={`toggle-btn ${showAssociated ? "active" : ""}`}
            onClick={() => setShowAssociated(true)}
          >
            Associated Mechanics ({associatedMechanics.length})
          </button>
          <button
            className={`toggle-btn ${!showAssociated ? "active" : ""}`}
            onClick={() => setShowAssociated(false)}
          >
            All Mechanics ({mechanics.length})
          </button>
        </div>
      </div>

      <div className="mechanics-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FaWrench />
          </div>
          <div className="stat-info">
            <h3>{associatedMechanics.length}</h3>
            <p>Associated Mechanics</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaStar />
          </div>
          <div className="stat-info">
            <h3>
              {associatedMechanics.length > 0 
                ? (associatedMechanics.reduce((sum, m) => sum + (m.rating || 0), 0) / associatedMechanics.length).toFixed(1)
                : "0.0"
              }
            </h3>
            <p>Average Rating</p>
          </div>
        </div>
      </div>

      <div className="mechanics-grid">
        {filteredMechanics.length === 0 ? (
          <div className="no-mechanics">
            <FaWrench />
            <h3>
              {showAssociated 
                ? "No associated mechanics" 
                : "No mechanics found"
              }
            </h3>
            <p>
              {showAssociated 
                ? "Start by associating mechanics with your business" 
                : "Try adjusting your search terms"
              }
            </p>
          </div>
        ) : (
          filteredMechanics.map((mechanic) => (
            <div key={mechanic._id} className="mechanic-card">
              <div className="mechanic-header">
                <div className="mechanic-avatar">
                  <FaWrench />
                </div>
                <div className="mechanic-info">
                  <h3>{mechanic.userId?.name || mechanic.name}</h3>
                  <div className="rating">
                    <FaStar />
                    <span>{mechanic.rating || "0.0"}</span>
                    <span className="reviews">({mechanic.totalReviews || 0} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="mechanic-details">
                <div className="detail-row">
                  <FaPhone />
                  <span>{mechanic.userId?.phone || mechanic.phone}</span>
                </div>

                <div className="detail-row">
                  <FaMapMarkerAlt />
                  <span>{mechanic.location || "Location not specified"}</span>
                </div>

                {mechanic.services && mechanic.services.length > 0 && (
                  <div className="services">
                    <strong>Services:</strong>
                    <div className="service-tags">
                      {mechanic.services.map((service, index) => (
                        <span key={index} className="service-tag">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="availability">
                  <span className={`status ${mechanic.availability ? "available" : "unavailable"}`}>
                    {mechanic.availability ? "Available" : "Busy"}
                  </span>
                </div>
              </div>

              <div className="mechanic-actions">
                {showAssociated ? (
                  <>
                    <button
                      className="action-btn contact"
                      onClick={() => window.open(`tel:${mechanic.userId?.phone || mechanic.phone}`)}
                    >
                      <FaPhone />
                      Call
                    </button>
                    <button
                      className="action-btn remove"
                      onClick={() => handleDisassociateMechanic(mechanic._id)}
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <button
                    className="action-btn associate"
                    onClick={() => handleAssociateMechanic(mechanic._id)}
                    disabled={associatedMechanics.some(am => am._id === mechanic._id)}
                  >
                    <FaPlus />
                    {associatedMechanics.some(am => am._id === mechanic._id) 
                      ? "Already Associated" 
                      : "Associate"
                    }
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VendorMechanics;
