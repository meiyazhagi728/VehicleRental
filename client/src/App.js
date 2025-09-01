import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UserDashboard from './pages/user/UserDashboard';
import VendorDashboard from './pages/vendor/VendorDashboard';
import MechanicDashboard from './pages/mechanic/MechanicDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import VehicleList from './pages/vehicles/VehicleList';
import VehicleDetail from './pages/vehicles/VehicleDetail';
import MechanicList from './pages/mechanics/MechanicList';
import BookingHistory from './pages/bookings/BookingHistory';
import PrivateRoute from './components/auth/PrivateRoute';
import './App.css';

function App() {
  const { user } = useSelector(state => state.auth);

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
          <Route path="/dashboard" element={
            <PrivateRoute>
              {user?.role === 'user' && <UserDashboard />}
              {user?.role === 'vendor' && <VendorDashboard />}
              {user?.role === 'mechanic' && <MechanicDashboard />}
              {user?.role === 'admin' && <AdminDashboard />}
            </PrivateRoute>
          } />

          <Route path="/bookings" element={
            <PrivateRoute>
              <BookingHistory />
            </PrivateRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <PrivateRoute requiredRole="admin">
              <AdminDashboard />
            </PrivateRoute>
          } />

          {/* Vendor Routes */}
          <Route path="/vendor/*" element={
            <PrivateRoute requiredRole="vendor">
              <VendorDashboard />
            </PrivateRoute>
          } />

          {/* Mechanic Routes */}
          <Route path="/mechanic/*" element={
            <PrivateRoute requiredRole="mechanic">
              <MechanicDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
