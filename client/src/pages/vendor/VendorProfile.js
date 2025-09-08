import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { FaArrowLeft, FaEdit, FaSave, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";
import "./VendorProfile.css";

const VendorProfile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    businessName: "",
    businessDescription: "",
    businessLicense: ""
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        businessName: user.businessName || "",
        businessDescription: user.businessDescription || "",
        businessLicense: user.businessLicense || ""
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axios.put("/api/users/profile", profile, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-profile-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/vendor/dashboard")}>
          <FaArrowLeft />
          Back to Dashboard
        </button>
        <h1>Vendor Profile</h1>
        <button 
          className="edit-btn"
          onClick={() => editing ? handleSave() : setEditing(true)}
          disabled={loading}
        >
          {editing ? <FaSave /> : <FaEdit />}
          {editing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar">
            <FaUser />
          </div>
          
          <div className="profile-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              
              <div className="form-group">
                <label>
                  <FaUser />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>

              <div className="form-group">
                <label>
                  <FaEnvelope />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  disabled={true} // Email should not be editable
                />
              </div>

              <div className="form-group">
                <label>
                  <FaPhone />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>

              <div className="form-group">
                <label>
                  <FaMapMarkerAlt />
                  Address
                </label>
                <textarea
                  name="address"
                  value={profile.address}
                  onChange={handleInputChange}
                  disabled={!editing}
                  rows="3"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Business Information</h3>
              
              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={profile.businessName}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="Your business name"
                />
              </div>

              <div className="form-group">
                <label>Business Description</label>
                <textarea
                  name="businessDescription"
                  value={profile.businessDescription}
                  onChange={handleInputChange}
                  disabled={!editing}
                  rows="4"
                  placeholder="Describe your vehicle rental business"
                />
              </div>

              <div className="form-group">
                <label>Business License Number</label>
                <input
                  type="text"
                  name="businessLicense"
                  value={profile.businessLicense}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="Your business license number"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
