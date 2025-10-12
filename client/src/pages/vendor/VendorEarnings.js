import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  FaMoneyBillWave, 
  FaChartLine, 
  FaCalendarAlt, 
  FaArrowLeft,
  FaDownload,
  FaFilter
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const VendorEarnings = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    weeklyEarnings: 0,
    dailyEarnings: 0,
    totalBookings: 0,
    averageBookingValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [earningsData, setEarningsData] = useState([]);

  useEffect(() => {
    fetchEarnings();
  }, [timeRange]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/bookings/vendor/earnings?range=${timeRange}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch earnings');
      }
      
      const data = await response.json();
      setEarnings(data.summary || data);
      setEarningsData(data.earnings || []);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      // Mock data for development
      setEarnings({
        totalEarnings: 125000,
        monthlyEarnings: 25000,
        weeklyEarnings: 6000,
        dailyEarnings: 850,
        totalBookings: 45,
        averageBookingValue: 2777
      });
      setEarningsData([
        { date: '2024-01-01', amount: 2500, bookings: 3 },
        { date: '2024-01-02', amount: 3200, bookings: 4 },
        { date: '2024-01-03', amount: 1800, bookings: 2 },
        { date: '2024-01-04', amount: 4100, bookings: 5 },
        { date: '2024-01-05', amount: 2900, bookings: 3 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'All Time';
    }
  };

  const handleExportEarnings = () => {
    try {
      // Create CSV data
      const csvHeaders = ['Date', 'Amount (₹)', 'Bookings'];
      const csvData = earningsData.map(data => [
        data.date,
        data.amount,
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
      link.setAttribute('download', `earnings-report-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Earnings data exported successfully');
    } catch (error) {
      console.error('Error exporting earnings data:', error);
    }
  };

  return (
    <div className="vendor-earnings">
      <div className="earnings-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/vendor')}
        >
          <FaArrowLeft />
          Back to Dashboard
        </button>
        <h1>Earnings Report</h1>
        <div className="header-actions">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <button 
            className="export-btn"
            onClick={handleExportEarnings}
          >
            <FaDownload />
            Export Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading earnings data...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="earnings-summary">
            <div className="summary-card">
              <div className="card-icon">
                <FaMoneyBillWave />
              </div>
              <div className="card-content">
                <h3>Total Earnings</h3>
                <p className="amount">{formatCurrency(earnings.totalEarnings)}</p>
                <span className="period">All Time</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">
                <FaChartLine />
              </div>
              <div className="card-content">
                <h3>Monthly Earnings</h3>
                <p className="amount">{formatCurrency(earnings.monthlyEarnings)}</p>
                <span className="period">This Month</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-content">
                <h3>Weekly Earnings</h3>
                <p className="amount">{formatCurrency(earnings.weeklyEarnings)}</p>
                <span className="period">This Week</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-content">
                <h3>Daily Average</h3>
                <p className="amount">{formatCurrency(earnings.dailyEarnings)}</p>
                <span className="period">Per Day</span>
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="earnings-details">
            <div className="details-card">
              <h3>Booking Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Bookings</span>
                  <span className="stat-value">{earnings.totalBookings}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Average Booking Value</span>
                  <span className="stat-value">{formatCurrency(earnings.averageBookingValue)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Conversion Rate</span>
                  <span className="stat-value">85%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Repeat Customers</span>
                  <span className="stat-value">68%</span>
                </div>
              </div>
            </div>

            <div className="details-card">
              <h3>Earnings Trend - {getTimeRangeLabel()}</h3>
              <div className="earnings-chart">
                {earningsData.map((item, index) => (
                  <div key={index} className="chart-bar">
                    <div 
                      className="bar-fill"
                      style={{ height: `${(item.amount / Math.max(...earningsData.map(d => d.amount))) * 100}%` }}
                    ></div>
                    <div className="bar-label">{new Date(item.date).toLocaleDateString()}</div>
                    <div className="bar-value">{formatCurrency(item.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .vendor-earnings {
          padding: 2rem;
          background: var(--grey-50);
          min-height: 100vh;
        }

        .earnings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow);
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--grey-100);
          border: none;
          border-radius: var(--border-radius);
          color: var(--grey-700);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          background: var(--accent-color);
          color: var(--white-color);
        }

        .earnings-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--grey-800);
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .time-range-select {
          padding: 0.5rem 1rem;
          border: 1px solid var(--grey-300);
          border-radius: var(--border-radius);
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          color: var(--grey-700);
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--accent-color);
          color: var(--white-color);
          border: none;
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .export-btn:hover {
          background: #0056b3;
        }

        .earnings-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow);
        }

        .card-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          background: var(--accent-color);
          color: var(--white-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .card-content h3 {
          margin: 0 0 0.5rem 0;
          color: var(--grey-600);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .card-content .amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--grey-800);
          margin: 0 0 0.25rem 0;
        }

        .card-content .period {
          font-size: 0.75rem;
          color: var(--grey-500);
        }

        .earnings-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .details-card {
          padding: 1.5rem;
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow);
        }

        .details-card h3 {
          margin: 0 0 1.5rem 0;
          color: var(--grey-800);
          font-size: 1.25rem;
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--grey-600);
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--grey-800);
        }

        .earnings-chart {
          display: flex;
          align-items: end;
          gap: 1rem;
          height: 200px;
          padding: 1rem 0;
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
          background: var(--accent-color);
          border-radius: 4px 4px 0 0;
          min-height: 20px;
          transition: height 0.3s ease;
        }

        .bar-label {
          font-size: 0.75rem;
          color: var(--grey-600);
        }

        .bar-value {
          font-size: 0.75rem;
          color: var(--grey-500);
          font-weight: 500;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: var(--grey-600);
        }

        @media (max-width: 768px) {
          .vendor-earnings {
            padding: 1rem;
          }

          .earnings-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .earnings-summary {
            grid-template-columns: 1fr;
          }

          .earnings-details {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default VendorEarnings;
