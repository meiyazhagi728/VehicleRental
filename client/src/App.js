import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from './store/slices/authSlice';
import { invalidateCache } from './utils/cache';

// Import dashboard styles
import './styles/DashboardStyles.css';

import Header from './components/layout/Header';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DebugLogin from './components/DebugLogin';
import DashboardRedirect from './components/DashboardRedirect';

// Pages
import LandingPage from './pages/LandingPage';
import VehicleList from './pages/vehicles/VehicleList';
import VehicleDetail from './pages/vehicles/VehicleDetail';
import MechanicList from './pages/mechanics/MechanicList';
import PublicMechanicProfile from './pages/mechanics/PublicMechanicProfile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PendingApproval from './pages/PendingApproval';
import UserDashboard from './pages/user/UserDashboard';
import Profile from './pages/user/Profile';
import MyBookings from './pages/user/MyBookings';
import BookingHistory from './pages/bookings/BookingHistory';
import BookingDetails from './pages/bookings/BookingDetails';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorBookings from './pages/vendor/VendorBookings';
import VendorMechanics from './pages/vendor/VendorMechanics';
import VendorProfile from './pages/vendor/VendorProfile';
import AddVehicle from './pages/vendor/AddVehicle';
import ManageVehicles from './pages/vendor/ManageVehicles';
import VendorEarnings from './pages/vendor/VendorEarnings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import ManageUsers from './pages/admin/ManageUsers';
import AdminManageVehicles from './pages/admin/ManageVehicles';
import MechanicDashboard from './pages/mechanic/MechanicDashboard';
import MechanicProfile from './pages/mechanic/MechanicProfile';
import SetAvailability from './pages/mechanic/SetAvailability';
import ManageServices from './pages/mechanic/ManageServices';
import MechanicSchedule from './pages/mechanic/MechanicSchedule';
import AllMechanicBookings from './pages/mechanics/AllMechanicBookings';

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Initialize authentication from localStorage
    dispatch(initializeAuth());
    
    // Clear cache on app start
    invalidateCache.onLogin();
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <div className="app-container">
        <div className="main-content">
          <Header />
          <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/debug-login" element={<DebugLogin />} />
        <Route path="/pending-approval" element={<PendingApproval />} />

        <Route path="/vehicles" element={<VehicleList />} />
        <Route path="/vehicles/:id" element={<VehicleDetail />} />

        <Route path="/mechanics" element={<MechanicList />} />
        <Route path="/mechanics/:id" element={<PublicMechanicProfile />} />
        <Route path="/mechanic/dashboard" element={
          <ProtectedRoute requiredRoles={["mechanic"]}>
            <MechanicDashboard />
          </ProtectedRoute>
        } />
        <Route path="/mechanic/profile" element={
          <ProtectedRoute requiredRoles={["mechanic"]}>
            <MechanicProfile />
          </ProtectedRoute>
        } />
        <Route path="/mechanic/availability" element={
          <ProtectedRoute requiredRoles={["mechanic"]}>
            <SetAvailability />
          </ProtectedRoute>
        } />
        <Route path="/mechanic/services" element={
          <ProtectedRoute requiredRoles={["mechanic"]}>
            <ManageServices />
          </ProtectedRoute>
        } />
        <Route path="/mechanic/schedule" element={
          <ProtectedRoute requiredRoles={["mechanic"]}>
            <MechanicSchedule />
          </ProtectedRoute>
        } />
        <Route path="/mechanic-bookings" element={
          <ProtectedRoute requiredRoles={["user", "admin", "vendor", "mechanic"]}>
            <AllMechanicBookings />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute requiredRoles={["user","admin","vendor","mechanic"]}>
            <UserDashboard />
          </ProtectedRoute>
        } />
        
        {/* Role-based dashboard redirects */}
        <Route path="/dashboard/redirect" element={
          <ProtectedRoute requiredRoles={["user","admin","vendor","mechanic"]}>
            <DashboardRedirect />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute requiredRoles={["user","admin","vendor","mechanic"]}>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute requiredRoles={["user","admin","vendor","mechanic"]}>
            <MyBookings />
          </ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute requiredRoles={["user","admin","vendor","mechanic"]}>
            <BookingHistory />
          </ProtectedRoute>
        } />
        <Route path="/bookings/:id" element={
          <ProtectedRoute requiredRoles={["user","admin","vendor","mechanic"]}>
            <BookingDetails />
          </ProtectedRoute>
        } />

        <Route path="/vendor" element={
          <ProtectedRoute requiredRoles={["vendor"]} requireApproval>
            <VendorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/vendor/add-vehicle" element={
          <ProtectedRoute requiredRoles={["vendor"]} requireApproval>
            <AddVehicle />
          </ProtectedRoute>
        } />
        <Route path="/vendor/manage-vehicles" element={
          <ProtectedRoute requiredRoles={["vendor"]} requireApproval>
            <ManageVehicles />
          </ProtectedRoute>
        } />
        <Route path="/vendor/bookings" element={
          <ProtectedRoute requiredRoles={["vendor"]} requireApproval>
            <VendorBookings />
          </ProtectedRoute>
        } />
        <Route path="/vendor/mechanics" element={
          <ProtectedRoute requiredRoles={["vendor"]} requireApproval>
            <VendorMechanics />
          </ProtectedRoute>
        } />
        <Route path="/vendor/earnings" element={
          <ProtectedRoute requiredRoles={["vendor"]} requireApproval>
            <VendorEarnings />
          </ProtectedRoute>
        } />
        <Route path="/vendor/profile" element={
          <ProtectedRoute requiredRoles={["vendor"]} requireApproval>
            <VendorProfile />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <AdminAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <ManageUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/manage-users" element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <ManageUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/vehicles" element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <AdminManageVehicles />
          </ProtectedRoute>
        } />

          </Routes>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;

