import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { FaUpload, FaTimes, FaSave, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import "./AddVehicle.css";
import { useSelector } from "react-redux";

const AddVehicle = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const schema = yup.object().shape({
    name: yup.string().required("Vehicle name is required").min(2, "Name must be at least 2 characters"),
    type: yup.string().required("Vehicle type is required"),
    fuelType: yup.string().required("Fuel type is required"),
    brand: yup.string().required("Brand is required"),
    model: yup.string().required("Model is required"),
    year: yup.number().required("Year is required").min(1900).max(new Date().getFullYear() + 1),
    description: yup.string().required("Description is required").min(10).max(1000),
    pricePerDay: yup.number().required("Price per day is required").min(0),
    location: yup.string().required("Location is required"),
    seats: yup.number().required("Number of seats is required").min(1),
    transmission: yup.string().required("Transmission type is required"),
    mileage: yup.number().required("Mileage is required").min(0),
    engineCapacity: yup.string().required("Engine capacity is required"),
    color: yup.string().required("Color is required"),
    registrationNumber: yup.string().required("Registration number is required"),
    insuranceExpiry: yup.date().required("Insurance expiry date is required"),
    permitExpiry: yup.date().required("Permit expiry date is required")
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          file,
          preview: e.target.result,
          id: Date.now() + Math.random()
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const onSubmit = async (data) => {
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setUploading(true);
    try {
      const payload = {
        name: data.name,
        type: data.type,
        fuelType: data.fuelType,
        brand: data.brand,
        model: data.model,
        year: Number(data.year),
        description: data.description,
        pricePerDay: Number(data.pricePerDay),
        location: data.location,
        images: images.map(img => img.preview),
        specifications: {
          seats: Number(data.seats),
          transmission: data.transmission,
          mileage: Number(data.mileage),
          engineCapacity: data.engineCapacity,
          color: data.color,
          registrationNumber: data.registrationNumber,
          insuranceExpiry: new Date(data.insuranceExpiry).toISOString(),
          permitExpiry: new Date(data.permitExpiry).toISOString()
        }
      };

      const response = await axios.post("/api/vehicles", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`
        }
      });

      if (response.status === 201) {
        toast.success("Vehicle added successfully!");
        navigate("/vendor/manage-vehicles");
      } else {
        throw new Error("Failed to add vehicle");
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to add vehicle");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="add-vehicle-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/vendor/dashboard")}>
          <FaArrowLeft />
          Back to Dashboard
        </button>
        <h1>Add New Vehicle</h1>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit(onSubmit)} className="vehicle-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Vehicle Name *</label>
                <input
                  type="text"
                  {...register("name")}
                  placeholder="e.g., Toyota Camry"
                />
                {errors.name && <span className="error">{errors.name.message}</span>}
              </div>

              <div className="form-group">
                <label>Vehicle Type *</label>
                <select {...register("type")}>
                  <option value="">Select Type</option>
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                  <option value="SUV">SUV</option>
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                  <option value="Bus">Bus</option>
                  <option value="Auto">Auto</option>
                </select>
                {errors.type && <span className="error">{errors.type.message}</span>}
              </div>

              <div className="form-group">
                <label>Fuel Type *</label>
                <select {...register("fuelType")}>
                  <option value="">Select Fuel Type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="CNG">CNG</option>
                </select>
                {errors.fuelType && <span className="error">{errors.fuelType.message}</span>}
              </div>

              <div className="form-group">
                <label>Brand *</label>
                <input
                  type="text"
                  {...register("brand")}
                  placeholder="e.g., Toyota"
                />
                {errors.brand && <span className="error">{errors.brand.message}</span>}
              </div>

              <div className="form-group">
                <label>Model *</label>
                <input
                  type="text"
                  {...register("model")}
                  placeholder="e.g., Camry"
                />
                {errors.model && <span className="error">{errors.model.message}</span>}
              </div>

              <div className="form-group">
                <label>Year *</label>
                <input
                  type="number"
                  {...register("year")}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
                {errors.year && <span className="error">{errors.year.message}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Pricing & Location</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Price Per Day (₹) *</label>
                <input
                  type="number"
                  {...register("pricePerDay")}
                  min="0"
                  step="0.01"
                  placeholder="1500"
                />
                {errors.pricePerDay && <span className="error">{errors.pricePerDay.message}</span>}
              </div>

              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  {...register("location")}
                  placeholder="e.g., Chennai, Tamil Nadu"
                />
                {errors.location && <span className="error">{errors.location.message}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Specifications</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Number of Seats *</label>
                <input
                  type="number"
                  {...register("seats")}
                  min="1"
                  placeholder="5"
                />
                {errors.seats && <span className="error">{errors.seats.message}</span>}
              </div>

              <div className="form-group">
                <label>Transmission *</label>
                <select {...register("transmission")}>
                  <option value="">Select Transmission</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
                {errors.transmission && <span className="error">{errors.transmission.message}</span>}
              </div>

              <div className="form-group">
                <label>Mileage (km/l) *</label>
                <input
                  type="number"
                  {...register("mileage")}
                  min="0"
                  step="0.1"
                  placeholder="15.5"
                />
                {errors.mileage && <span className="error">{errors.mileage.message}</span>}
              </div>

              <div className="form-group">
                <label>Engine Capacity *</label>
                <input
                  type="text"
                  {...register("engineCapacity")}
                  placeholder="e.g., 1.8L"
                />
                {errors.engineCapacity && <span className="error">{errors.engineCapacity.message}</span>}
              </div>

              <div className="form-group">
                <label>Color *</label>
                <input
                  type="text"
                  {...register("color")}
                  placeholder="e.g., White"
                />
                {errors.color && <span className="error">{errors.color.message}</span>}
              </div>

              <div className="form-group">
                <label>Registration Number *</label>
                <input
                  type="text"
                  {...register("registrationNumber")}
                  placeholder="e.g., TN-01-AB-1234"
                />
                {errors.registrationNumber && <span className="error">{errors.registrationNumber.message}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Documentation</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Insurance Expiry Date *</label>
                <input
                  type="date"
                  {...register("insuranceExpiry")}
                />
                {errors.insuranceExpiry && <span className="error">{errors.insuranceExpiry.message}</span>}
              </div>

              <div className="form-group">
                <label>Permit Expiry Date *</label>
                <input
                  type="date"
                  {...register("permitExpiry")}
                />
                {errors.permitExpiry && <span className="error">{errors.permitExpiry.message}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Description</h3>
            <div className="form-group">
              <label>Vehicle Description *</label>
              <textarea
                {...register("description")}
                rows="4"
                placeholder="Describe your vehicle, its features, condition, etc."
              />
              {errors.description && <span className="error">{errors.description.message}</span>}
            </div>
          </div>

          <div className="form-section">
            <h3>Vehicle Images</h3>
            <div className="image-upload-section">
              <div className="upload-area">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                <label htmlFor="image-upload" className="upload-btn">
                  <FaUpload />
                  Upload Images (Max 5)
                </label>
                <p className="upload-hint">Click to select images or drag and drop</p>
              </div>

              {images.length > 0 && (
                <div className="image-preview-grid">
                  {images.map((img) => (
                    <div key={img.id} className="image-preview">
                      <img src={img.preview} alt="Preview" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage(img.id)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/vendor/dashboard")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={uploading}
            >
              {uploading ? "Adding Vehicle..." : (
                <>
                  <FaSave />
                  Add Vehicle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;
