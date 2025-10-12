import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { 
  StatCard, 
  ChartCard, 
  DataTable, 
  QuickActionCard, 
  ProgressBar,
  MetricCard 
} from '../../components/dashboard/DashboardComponents';
import {
  FaCar,
  FaMoneyBillWave,
  FaUsers,
  FaChartLine,
  FaPlus,
  FaEdit,
  FaList,
  FaUser,
  FaWrench,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaStar,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaTrophy,
  FaShieldAlt,
  FaEye,
  FaDownload,
  FaFilter,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import '../../components/dashboard/DashboardComponents.css';

const VendorDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [vendorStats, setVendorStats] = useState({
    totalVehicles: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    occupancyRate: 0,
    conversionRate: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentVehicles, setRecentVehicles] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [mechanicBookings, setMechanicBookings] = useState([]);
  
  // Pagination states
  const [bookingsPage, setBookingsPage] = useState(1);
  const [vehiclesPage, setVehiclesPage] = useState(1);
  const [mechanicBookingsPage, setMechanicBookingsPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchVendorData();
  }, [user, token]);

  const fetchVendorData = async () => {
    console.log('VendorDashboard - User:', user);
    console.log('VendorDashboard - Token:', token);
    console.log('VendorDashboard - User role:', user?.role);
    
    if (!user || !token) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'vendor') {
      console.log('User is not a vendor, redirecting to appropriate dashboard');
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'mechanic') {
        navigate('/mechanic/dashboard');
      } else {
        navigate('/user/dashboard');
      }
      return;
    }
    
    try {
      setLoading(true);
      // Fetch data sequentially to avoid rate limiting
      await fetchVendorStats();
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      await fetchRecentBookings();
      await new Promise(resolve => setTimeout(resolve, 100));
      await fetchRecentVehicles();
      await new Promise(resolve => setTimeout(resolve, 100));
      await fetchMonthlyData();
      await new Promise(resolve => setTimeout(resolve, 100));
      await fetchTopPerformers();
      await new Promise(resolve => setTimeout(resolve, 100));
      await fetchMechanicBookings();
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorStats = async () => {
    try {
      console.log('fetchVendorStats - Token being used:', token);
      const [vehiclesRes, bookingsRes, ratingsRes] = await Promise.all([
        fetch('http://localhost:5000/api/vehicles/vendor', {
          headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${token}` 
          },
        }),
        fetch('http://localhost:5000/api/bookings/vendor', {
          headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${token}` 
          },
        }),
        fetch('http://localhost:5000/api/bookings/vendor/ratings', {
          headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${token}` 
          },
        }),
      ]);
      
      console.log('fetchVendorStats - Vehicles response status:', vehiclesRes.status);
      console.log('fetchVendorStats - Bookings response status:', bookingsRes.status);
      console.log('fetchVendorStats - Ratings response status:', ratingsRes.status);

      const vehicles = vehiclesRes.ok ? await vehiclesRes.json() : [];
      const bookingsData = bookingsRes.ok ? await bookingsRes.json() : {};
      const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData.bookings || []);
      
      // Get rating stats from API
      let ratingStats = { averageRating: 0, totalRatings: 0 };
      if (ratingsRes.ok) {
        ratingStats = await ratingsRes.json();
        console.log('Vendor rating stats from API:', ratingStats);
      } else {
        console.log('Failed to fetch rating stats, using fallback calculation');
      }

      const totalRevenue = bookings
        .filter((b) => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      const monthlyRevenue = bookings
        .filter((b) => {
          const bookingDate = new Date(b.createdAt);
          const currentMonth = new Date();
          return bookingDate.getMonth() === currentMonth.getMonth() &&
                 bookingDate.getFullYear() === currentMonth.getFullYear();
        })
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      const activeBookings = bookings.filter((b) => 
        ['pending', 'confirmed', 'active'].includes(b.status)
      ).length;

      const totalCustomers = new Set(
        bookings.map((b) => b.userId?._id || b.userId)
      ).size;

      // Use API rating stats or fallback calculation
      let averageRating = ratingStats.averageRating;
      
      if (averageRating === 0) {
        // Fallback calculation if API didn't return ratings
        const completedBookings = bookings.filter(b => b.status === 'completed');
        const ratings = completedBookings
          .filter((b) => b.rating && b.rating > 0)
          .map((b) => b.rating);
        
        console.log('Completed bookings:', completedBookings.length);
        console.log('Bookings with ratings:', bookings.filter(b => b.rating && b.rating > 0));
        console.log('Valid ratings:', ratings);
        
        averageRating = ratings.length > 0
          ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
          : 0;
        
        console.log('Fallback calculated average rating:', averageRating);
        console.log('Total ratings count:', ratings.length);
      }

      const occupancyRate = vehicles.length > 0 
        ? ((vehicles.filter(v => !v.isAvailable).length / vehicles.length) * 100)
        : 0;

      const conversionRate = bookings.length > 0 
        ? ((bookings.filter(b => b.status === 'completed').length / bookings.length) * 100)
        : 0;

      setVendorStats({
        totalVehicles: vehicles.length,
        totalRevenue,
        totalCustomers,
        activeBookings,
        monthlyRevenue,
        averageRating,
        occupancyRate,
        conversionRate
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/bookings/vendor?limit=10&page=1', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      console.log('Full API response:', data);
      const bookings = Array.isArray(data) ? data : (data.bookings || []);
      console.log('Fetched bookings data:', bookings);
      if (data.pagination) {
        console.log('Pagination info:', data.pagination);
      }
      const processedBookings = bookings.slice(0, 10).map((b) => ({
        id: b._id,
        customerName: b.userId?.name || b.customerName || 'Customer',
        vehicleName: b.vehicleId?.name || `${b.vehicleId?.brand || ''} ${b.vehicleId?.model || ''}`.trim() || 'Vehicle',
        startDate: new Date(b.startDate).toLocaleDateString(),
        endDate: new Date(b.endDate).toLocaleDateString(),
        status: b.status,
        amount: b.totalAmount,
        createdAt: b.createdAt
      }));
      console.log('Processed recent bookings:', processedBookings);
      setRecentBookings(processedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchRecentVehicles = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/vehicles/vendor', {
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      console.log('Fetched vehicles data:', data);
      const processedVehicles = data.slice(0, 5).map((v) => ({
        id: v._id,
        name: v.name || `${v.brand || ''} ${v.model || ''}`.trim() || 'Vehicle',
        type: v.type,
        pricePerDay: v.pricePerDay,
        isAvailable: v.isAvailable,
        rating: v.rating,
        totalBookings: v.totalBookings || 0,
        revenue: v.revenue || 0
      }));
      console.log('Processed recent vehicles:', processedVehicles);
      setRecentVehicles(processedVehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/bookings/vendor', {
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      const bookings = Array.isArray(data) ? data : (data.bookings || []);
      
      // Calculate monthly revenue for last 6 months
      const monthlyRevenue = {};
      const currentDate = new Date();
      
      // Generate last 6 months including current month
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        console.log(`Generated month ${i}:`, { date, monthKey });
        monthlyRevenue[monthKey] = { revenue: 0, bookings: 0 };
      }
      console.log('Available months for matching:', Object.keys(monthlyRevenue));
      
      console.log('Processing bookings for monthly data:', bookings.length);
      bookings.forEach((booking, index) => {
        const bookingDate = new Date(booking.createdAt);
        const monthKey = bookingDate.toLocaleDateString('en-US', { month: 'short' });
        console.log(`Booking ${index + 1}:`, {
          createdAt: booking.createdAt,
          bookingDate: bookingDate,
          monthKey: monthKey,
          totalAmount: booking.totalAmount,
          isInMonthlyRevenue: !!monthlyRevenue[monthKey]
        });
        if (monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey].revenue += booking.totalAmount || 0;
          monthlyRevenue[monthKey].bookings += 1;
        } else {
          console.log(`Warning: Booking month ${monthKey} not found in monthlyRevenue keys:`, Object.keys(monthlyRevenue));
        }
      });
      
      const months = Object.keys(monthlyRevenue);
      const revenue = months.map(month => monthlyRevenue[month].revenue);
      const bookingsCount = months.map(month => monthlyRevenue[month].bookings);
      
      console.log('Monthly revenue data:', monthlyRevenue);
      console.log('Processed monthly data:', months.map((month, index) => ({
        month,
        revenue: revenue[index],
        bookings: bookingsCount[index]
      })));
      
      setMonthlyData(months.map((month, index) => ({
        month,
        revenue: revenue[index],
        bookings: bookingsCount[index]
      })));
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    }
  };

  // Pagination helper functions
  const getPaginatedData = (data, page, itemsPerPage) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data, itemsPerPage) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  const handleExportRevenue = () => {
    try {
      // Create CSV data
      const csvHeaders = ['Month', 'Revenue (₹)', 'Bookings'];
      const csvData = monthlyData.map(data => [
        data.month,
        data.revenue,
        data.bookings
      ]);
      
      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `monthly-revenue-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Revenue data exported successfully');
    } catch (error) {
      console.error('Error exporting revenue data:', error);
    }
  };

  const fetchTopPerformers = async () => {
    try {
      // Fetch both vehicles and bookings to calculate performance
      const [vehiclesRes, bookingsRes] = await Promise.all([
        fetch('http://localhost:5000/api/vehicles/vendor', {
          headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${token}` 
          },
        }),
        fetch('http://localhost:5000/api/bookings/vendor', {
          headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${token}` 
          },
        })
      ]);
      
      if (!vehiclesRes.ok || !bookingsRes.ok) return;
      
      const vehicles = await vehiclesRes.json();
      const bookingsData = await bookingsRes.json();
      const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData.bookings || []);
      
      // Calculate performance metrics for each vehicle
      const vehiclePerformance = vehicles.map(vehicle => {
        const vehicleBookings = bookings.filter(booking => 
          booking.vehicleId && booking.vehicleId._id === vehicle._id
        );
        
        const totalBookings = vehicleBookings.length;
        const revenue = vehicleBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
        const ratings = vehicleBookings.filter(b => b.rating).map(b => b.rating);
        const avgRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
        
        return {
          name: `${vehicle.brand} ${vehicle.model}`,
          revenue: revenue,
          bookings: totalBookings,
          rating: Math.round(avgRating * 10) / 10
        };
      });
      
      // Sort by revenue and take top 3
      const topPerformers = vehiclePerformance
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3);
      
      setTopPerformers(topPerformers);
    } catch (error) {
      console.error('Error fetching top performers:', error);
    }
  };

  const fetchMechanicBookings = async () => {
    try {
      console.log('Fetching mechanic bookings...');
      const res = await fetch('http://localhost:5000/api/mechanics/bookings/mechanic', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Mechanic bookings fetched:', data);
        setMechanicBookings(data.bookings || []);
      } else {
        console.log('Failed to fetch mechanic bookings');
        setMechanicBookings([]);
      }
    } catch (error) {
      console.error('Error fetching mechanic bookings:', error);
      setMechanicBookings([]);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const bookingColumns = [
    {
      key: 'customerName',
      header: 'Customer',
      render: (booking) => (
        <div className="customer-info">
          <strong>{booking.customerName}</strong>
        </div>
      )
    },
    {
      key: 'vehicleName',
      header: 'Vehicle',
      render: (booking) => (
        <div className="vehicle-info">
          <strong>{booking.vehicleName}</strong>
        </div>
      )
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (booking) => (
        <div className="date-info">
          <div>{booking.startDate}</div>
          <div>to {booking.endDate}</div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (booking) => (
        <span className="amount">₹{booking.amount}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (booking) => (
        <span className={`status-badge status-${booking.status}`}>
          {booking.status}
        </span>
      )
    }
  ];

  const vehicleColumns = [
    {
      key: 'name',
      header: 'Vehicle',
      render: (vehicle) => (
        <div className="vehicle-info">
          <strong>{vehicle.name}</strong>
          <small>{vehicle.type}</small>
        </div>
      )
    },
    {
      key: 'pricePerDay',
      header: 'Rate/Day',
      render: (vehicle) => (
        <span className="price">₹{vehicle.pricePerDay}</span>
      )
    },
    {
      key: 'totalBookings',
      header: 'Bookings',
      render: (vehicle) => (
        <span className="bookings-count">{vehicle.totalBookings}</span>
      )
    },
    {
      key: 'revenue',
      header: 'Revenue',
      render: (vehicle) => (
        <span className="revenue">₹{vehicle.revenue.toLocaleString()}</span>
      )
    },
    {
      key: 'isAvailable',
      header: 'Status',
      render: (vehicle) => (
        <span className={`availability ${vehicle.isAvailable ? 'available' : 'unavailable'}`}>
          {vehicle.isAvailable ? 'Available' : 'Booked'}
        </span>
      )
    }
  ];

  const mechanicBookingColumns = [
    {
      key: 'customerName',
      header: 'Customer',
      render: (booking) => (
        <div className="customer-info">
          <strong>{booking.customerId?.name || 'N/A'}</strong>
          <small>{booking.customerId?.email || 'N/A'}</small>
        </div>
      )
    },
    {
      key: 'serviceType',
      header: 'Service',
      render: (booking) => (
        <span className="service-type">{booking.serviceType}</span>
      )
    },
    {
      key: 'preferredDate',
      header: 'Date',
      render: (booking) => (
        <span className="booking-date">
          {new Date(booking.preferredDate).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (booking) => (
        <span className={`status ${booking.status}`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      )
    },
    {
      key: 'totalCost',
      header: 'Cost',
      render: (booking) => (
        <span className="cost">₹{booking.totalCost || 0}</span>
      )
    }
  ];

  const quickActions = [
    {
      icon: FaPlus,
      title: 'Add Vehicle',
      description: 'List a new vehicle',
      color: 'primary',
      onClick: () => navigate('/vendor/add-vehicle')
    },
    {
      icon: FaEdit,
      title: 'Manage Vehicles',
      description: 'Update vehicle details',
      color: 'success',
      onClick: () => navigate('/vendor/manage-vehicles')
    },
    {
      icon: FaList,
      title: 'View Bookings',
      description: 'Manage reservations',
      color: 'info',
      onClick: () => navigate('/vendor/bookings')
    },
    {
      icon: FaChartLine,
      title: 'Analytics',
      description: 'View detailed reports',
      color: 'warning',
      onClick: () => setActiveTab('analytics')
    }
  ];

  const renderDashboard = () => (
    <div className="vendor-dashboard-content">
      {/* Key Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Revenue"
          value={`₹${vendorStats.totalRevenue.toLocaleString()}`}
          subtitle="All time"
          icon={FaMoneyBillWave}
          color="success"
          trend="up"
          trendValue="+15%"
        />
        <MetricCard
          title="Monthly Revenue"
          value={`₹${vendorStats.monthlyRevenue.toLocaleString()}`}
          subtitle="This month"
          icon={FaChartLine}
          color="primary"
          trend="up"
          trendValue="+8%"
        />
        <MetricCard
          title="Total Vehicles"
          value={vendorStats.totalVehicles}
          subtitle="Active listings"
          icon={FaCar}
          color="info"
          trend="up"
          trendValue="+2"
        />
        <MetricCard
          title="Active Bookings"
          value={vendorStats.activeBookings}
          subtitle="Currently booked"
          icon={FaCalendarAlt}
          color="warning"
          trend="up"
          trendValue="+3"
        />
        <MetricCard
          title="Total Customers"
          value={vendorStats.totalCustomers}
          subtitle="Unique customers"
          icon={FaUsers}
          color="purple"
          trend="up"
          trendValue="+12%"
        />
        <MetricCard
          title="Average Rating"
          value={vendorStats.averageRating.toFixed(1)}
          subtitle={`${vendorStats.averageRating > 0 ? 'Customer satisfaction' : 'No ratings yet'}`}
          icon={FaStar}
          color="warning"
          trend={vendorStats.averageRating > 0 ? "up" : "neutral"}
          trendValue={vendorStats.averageRating > 0 ? "+0.2" : "0"}
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="grid-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                icon={action.icon}
                title={action.title}
                description={action.description}
                color={action.color}
                onClick={action.onClick}
              />
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="grid-section">
          <DataTable
            title="Recent Bookings"
            data={getPaginatedData(recentBookings, bookingsPage, itemsPerPage)}
            columns={bookingColumns}
            loading={loading}
            emptyMessage="No bookings yet"
            actions={
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {getTotalPages(recentBookings, itemsPerPage) > 1 && (
                  <div className="pagination-controls">
                    <button 
                      className="btn btn-sm"
                      onClick={() => setBookingsPage(p => Math.max(1, p - 1))}
                      disabled={bookingsPage === 1}
                    >
                      ←
                    </button>
                    <span style={{ margin: '0 0.5rem' }}>
                      Page {bookingsPage} of {getTotalPages(recentBookings, itemsPerPage)}
                    </span>
                    <button 
                      className="btn btn-sm"
                      onClick={() => setBookingsPage(p => Math.min(getTotalPages(recentBookings, itemsPerPage), p + 1))}
                      disabled={bookingsPage === getTotalPages(recentBookings, itemsPerPage)}
                    >
                      →
                    </button>
                  </div>
                )}
                <Link to="/vendor/bookings" className="btn btn-outline btn-sm">
                  View All
                </Link>
              </div>
            }
          />
        </div>

        {/* Vehicle Performance */}
        <div className="grid-section">
          <DataTable
            title="Vehicle Performance"
            data={getPaginatedData(topPerformers, vehiclesPage, itemsPerPage)}
            columns={vehicleColumns}
            loading={loading}
            emptyMessage="No vehicles listed yet"
            actions={
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {getTotalPages(topPerformers, itemsPerPage) > 1 && (
                  <div className="pagination-controls">
                    <button 
                      className="btn btn-sm"
                      onClick={() => setVehiclesPage(p => Math.max(1, p - 1))}
                      disabled={vehiclesPage === 1}
                    >
                      ←
                    </button>
                    <span style={{ margin: '0 0.5rem' }}>
                      Page {vehiclesPage} of {getTotalPages(topPerformers, itemsPerPage)}
                    </span>
                    <button 
                      className="btn btn-sm"
                      onClick={() => setVehiclesPage(p => Math.min(getTotalPages(topPerformers, itemsPerPage), p + 1))}
                      disabled={vehiclesPage === getTotalPages(topPerformers, itemsPerPage)}
                    >
                      →
                    </button>
                  </div>
                )}
                <Link to="/vendor/manage-vehicles" className="btn btn-outline btn-sm">
                  Manage All
                </Link>
              </div>
            }
          />
        </div>

        {/* Mechanic Bookings */}
        <div className="grid-section">
          <DataTable
            title="Mechanic Bookings"
            data={getPaginatedData(mechanicBookings, mechanicBookingsPage, itemsPerPage)}
            columns={mechanicBookingColumns}
            loading={loading}
            emptyMessage="No mechanic bookings found"
            actions={
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {getTotalPages(mechanicBookings, itemsPerPage) > 1 && (
                  <div className="pagination-controls">
                    <button 
                      className="btn btn-sm"
                      onClick={() => setMechanicBookingsPage(p => Math.max(1, p - 1))}
                      disabled={mechanicBookingsPage === 1}
                    >
                      ←
                    </button>
                    <span style={{ margin: '0 0.5rem' }}>
                      Page {mechanicBookingsPage} of {getTotalPages(mechanicBookings, itemsPerPage)}
                    </span>
                    <button 
                      className="btn btn-sm"
                      onClick={() => setMechanicBookingsPage(p => Math.min(getTotalPages(mechanicBookings, itemsPerPage), p + 1))}
                      disabled={mechanicBookingsPage === getTotalPages(mechanicBookings, itemsPerPage)}
                    >
                      →
                    </button>
                  </div>
                )}
                <Link to="/mechanic-bookings" className="btn btn-outline btn-sm">
                  View All Bookings
                </Link>
              </div>
            }
          />
        </div>

        {/* Revenue Chart */}
        <div className="grid-section">
          <ChartCard 
            title="Monthly Revenue Trend"
            actions={
              <div className="chart-actions">
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={handleExportRevenue}
                >
                  <FaDownload /> Export
                </button>
              </div>
            }
          >
            <div className="revenue-chart">
              <div className="chart-bars">
                {monthlyData.map((data, index) => {
                  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);
                  const heightPercentage = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                  console.log(`Chart bar ${index}:`, {
                    month: data.month,
                    revenue: data.revenue,
                    bookings: data.bookings,
                    maxRevenue,
                    heightPercentage
                  });
                  return (
                    <div key={index} className="chart-bar">
                      <div 
                        className="bar-fill"
                        style={{ 
                          height: `${heightPercentage}%`,
                          backgroundColor: `hsl(${200 + index * 20}, 70%, 50%)`
                        }}
                      ></div>
                      <div className="bar-label">{data.month}</div>
                      <div className="bar-value">₹{data.revenue.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Performance Metrics */}
        <div className="grid-section">
          <ChartCard title="Performance Metrics">
            <div className="performance-metrics">
              <ProgressBar
                label="Occupancy Rate"
                value={vendorStats.occupancyRate}
                max={100}
                color="success"
                size="large"
              />
              <ProgressBar
                label="Conversion Rate"
                value={vendorStats.conversionRate}
                max={100}
                color="primary"
                size="large"
              />
              <ProgressBar
                label="Customer Satisfaction"
                value={vendorStats.averageRating * 20}
                max={100}
                color="warning"
                size="large"
              />
            </div>
          </ChartCard>
        </div>

        {/* Top Performers */}
        <div className="grid-section">
          <ChartCard 
            title="Top Performing Vehicles"
            actions={
              <button className="btn btn-outline btn-sm">
                <FaEye /> View Details
              </button>
            }
          >
            <div className="top-performers">
              {topPerformers.map((vehicle, index) => (
                <div key={index} className="performer-card">
                  <div className="performer-rank">
                    <FaTrophy />
                    <span>#{index + 1}</span>
                  </div>
                  <div className="performer-info">
                    <h4>{vehicle.name}</h4>
                    <div className="performer-stats">
                      <span className="stat">
                        <FaMoneyBillWave /> ₹{vehicle.revenue.toLocaleString()}
                      </span>
                      <span className="stat">
                        <FaCalendarAlt /> {vehicle.bookings} bookings
                      </span>
                      <span className="stat">
                        <FaStar /> {vehicle.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="analytics-view">
      <div className="analytics-header">
        <div className="analytics-title">
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setActiveTab('dashboard')}
            style={{ marginRight: '1rem' }}
          >
            ← Back to Dashboard
          </button>
          <h2>Advanced Analytics</h2>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-outline btn-sm"
            onClick={handleExportRevenue}
          >
            <FaDownload /> Export Report
          </button>
        </div>
      </div>
      
      {/* Revenue Analytics */}
      <div className="analytics-section">
        <h3>Revenue Analytics</h3>
        <div className="revenue-chart">
          <div className="chart-bars">
            {monthlyData.map((data, index) => {
              const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);
              const heightPercentage = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={index} className="chart-bar">
                  <div 
                    className="bar-fill"
                    style={{ 
                      height: `${heightPercentage}%`,
                      backgroundColor: `hsl(${200 + index * 20}, 70%, 50%)`
                    }}
                  ></div>
                  <div className="bar-label">{data.month}</div>
                  <div className="bar-value">₹{data.revenue.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="analytics-section">
        <h3>Performance Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Total Revenue</h4>
            <div className="metric-value">₹{vendorStats.totalRevenue.toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <h4>Monthly Revenue</h4>
            <div className="metric-value">₹{vendorStats.monthlyRevenue.toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <h4>Active Bookings</h4>
            <div className="metric-value">{vendorStats.activeBookings}</div>
          </div>
          <div className="metric-card">
            <h4>Average Rating</h4>
            <div className="metric-value">{vendorStats.averageRating.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="analytics-section">
        <h3>Top Performing Vehicles</h3>
        <div className="top-performers">
          {topPerformers.map((vehicle, index) => (
            <div key={index} className="performer-card">
              <div className="performer-rank">
                <FaTrophy />
                <span>#{index + 1}</span>
              </div>
              <div className="performer-info">
                <h4>{vehicle.name}</h4>
                <div className="performer-stats">
                  <span className="stat">
                    <FaMoneyBillWave /> ₹{vehicle.revenue.toLocaleString()}
                  </span>
                  <span className="stat">
                    <FaCalendarAlt /> {vehicle.bookings} bookings
                  </span>
                  <span className="stat">
                    <FaStar /> {vehicle.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Show loading or redirect if not authenticated
  if (!user || !token) {
    return (
      <div className="vendor-dashboard-content">
        <div className="dashboard-header">
          <h1>Vendor Dashboard</h1>
          <p>Please log in to access the vendor dashboard.</p>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== 'vendor') {
    return (
      <div className="vendor-dashboard-content">
        <div className="dashboard-header">
          <h1>Access Denied</h1>
          <p>You need vendor access to view this dashboard.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard-content">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Vendor Dashboard</h1>
          <p>Welcome back, {user?.name}! Manage your vehicles and bookings.</p>
          <div className="vendor-badges">
            <span className="badge badge-success">
              <FaShieldAlt /> Verified Vendor
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn">
            <FaBell />
            <span className="notification-count">3</span>
          </button>
          <button className="action-btn">
            <FaCog />
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'analytics' && renderAnalytics()}

      <style jsx>{`
        .vendor-dashboard-content {
          padding: 2rem;
          background: var(--bg-tertiary);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 2rem;
          background: var(--white-color);
          border-radius: var(--border-radius-lg);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-light);
        }

        .welcome-section h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        .welcome-section p {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin: 0 0 1rem 0;
        }

        .vendor-badges {
          display: flex;
          gap: 0.5rem;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .badge-success {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .action-btn {
          position: relative;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: var(--white-color);
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .notification-count {
          position: absolute;
          top: -0.25rem;
          right: -0.25rem;
          background: #ef4444;
          color: var(--white-color);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 10px;
          min-width: 1.25rem;
          text-align: center;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
          align-items: stretch;
        }

        .dashboard-grid {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          align-items: stretch;
        }

        .grid-section {
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: var(--border-radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow);
          width: 100%;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--grey-800);
          margin: 0 0 1.5rem 0;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--grey-200);
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .revenue-chart {
          padding: 1rem 0;
        }

        .chart-bars {
          display: flex;
          align-items: end;
          gap: 1rem;
          height: 200px;
          padding: 0 1rem;
        }

        .chart-bar {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .bar-fill {
          width: 100%;
          border-radius: 4px 4px 0 0;
          transition: height 0.3s ease;
          min-height: 20px;
        }

        .bar-label {
          font-size: 0.875rem;
          color: var(--grey-600);
          font-weight: 500;
        }

        .bar-value {
          font-size: 0.75rem;
          color: var(--grey-500);
        }

        .performance-metrics {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .top-performers {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .performer-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--grey-50);
          border-radius: var(--border-radius);
        }

        .performer-rank {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #fbbf24;
          font-weight: 600;
        }

        .performer-info h4 {
          margin: 0 0 0.5rem 0;
          color: var(--grey-800);
        }

        .performer-stats {
          display: flex;
          gap: 1rem;
        }

        .performer-stats .stat {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: var(--grey-600);
        }

        .customer-info strong {
          color: var(--grey-800);
        }

        .vehicle-info strong {
          color: var(--grey-800);
        }

        .vehicle-info small {
          color: var(--grey-600);
          font-size: 0.875rem;
        }

        .date-info {
          font-size: 0.875rem;
          color: var(--grey-600);
        }

        .amount {
          font-weight: 600;
          color: var(--accent-color);
        }

        .price {
          font-weight: 600;
          color: var(--accent-color);
        }

        .bookings-count {
          font-weight: 500;
          color: var(--grey-700);
        }

        .revenue {
          font-weight: 600;
          color: #10b981;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-confirmed {
          background: #d1fae5;
          color: #065f46;
        }

        .status-completed {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        .availability {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .availability.available {
          background: #d1fae5;
          color: #065f46;
        }

        .availability.unavailable {
          background: #fee2e2;
          color: #991b1b;
        }

        .analytics-view {
          padding: 2rem;
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow);
          text-align: center;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .pagination-controls button {
          padding: 0.25rem 0.5rem;
          border: 1px solid var(--border-light);
          background: var(--white-color);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pagination-controls button:hover:not(:disabled) {
          background: var(--grey-50);
          border-color: var(--accent-color);
        }

        .pagination-controls button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .vendor-dashboard {
            flex-direction: column;
          }

          .dashboard-main {
            padding: 1rem;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .metrics-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }

          .dashboard-grid {
            flex-direction: column;
            gap: 1rem;
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }

          .chart-bars {
            gap: 0.5rem;
          }

          .performer-stats {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default VendorDashboard;