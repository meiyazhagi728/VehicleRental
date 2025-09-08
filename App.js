import React from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import UserDashboard from "./pages/user/UserDashboard";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import AddVehicle from "./pages/vendor/AddVehicle";
import ManageVehicles from "./pages/vendor/ManageVehicles";
import VendorBookings from "./pages/vendor/VendorBookings";
import VendorProfile from "./pages/vendor/VendorProfile";
import VendorMechanics from "./pages/vendor/VendorMechanics";
import MechanicDashboard from "./pages/mechanic/MechanicDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import VehicleList from "./pages/vehicles/VehicleList";
import VehicleDetail from "./pages/vehicles/VehicleDetail";
import MechanicList from "./pages/mechanics/MechanicList";
import BookingHistory from "./pages/bookings/BookingHistory";
import PrivateRoute from "./components/auth/PrivateRoute";
import "./App.css";

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vehicles" element={<VehicleList />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
          <Route path="/mechanics" element={<MechanicList />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                {user?.role === "user" && <UserDashboard />}
                {user?.role === "vendor" && <VendorDashboard />}
                {user?.role === "mechanic" && <MechanicDashboard />}
                {user?.role === "admin" && <AdminDashboard />}
              </PrivateRoute>
            }
          />

          <Route
            path="/bookings"
            element={
              <PrivateRoute>
                <BookingHistory />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* Vendor Routes */}
          <Route
            path="/vendor/dashboard"
            element={
              <PrivateRoute requiredRole="vendor">
                <VendorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/vendor/add-vehicle"
            element={
              <PrivateRoute requiredRole="vendor">
                <AddVehicle />
              </PrivateRoute>
            }
          />
          <Route
            path="/vendor/manage-vehicles"
            element={
              <PrivateRoute requiredRole="vendor">
                <ManageVehicles />
              </PrivateRoute>
            }
          />
          <Route
            path="/vendor/bookings"
            element={
              <PrivateRoute requiredRole="vendor">
                <VendorBookings />
              </PrivateRoute>
            }
          />
          <Route
            path="/vendor/profile"
            element={
              <PrivateRoute requiredRole="vendor">
                <VendorProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/vendor/mechanics"
            element={
              <PrivateRoute requiredRole="vendor">
                <VendorMechanics />
              </PrivateRoute>
            }
          />

          {/* Mechanic Routes */}
          <Route
            path="/mechanic/*"
            element={
              <PrivateRoute requiredRole="mechanic">
                <MechanicDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
