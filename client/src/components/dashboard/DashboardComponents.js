import React from 'react';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  color = 'primary',
  subtitle,
  onClick 
}) => {
  const getTrendIcon = () => {
    switch (changeType) {
      case 'up': return <FaArrowUp className="trend-icon trend-up" />;
      case 'down': return <FaArrowDown className="trend-icon trend-down" />;
      default: return <FaMinus className="trend-icon trend-neutral" />;
    }
  };

  const getColorClass = () => {
    const colors = {
      primary: 'stat-primary',
      success: 'stat-success',
      warning: 'stat-warning',
      danger: 'stat-danger',
      info: 'stat-info',
      purple: 'stat-purple'
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className={`stat-card ${getColorClass()}`} onClick={onClick}>
      <div className="stat-header">
        <div className="stat-icon">
          {Icon && <Icon />}
        </div>
        <div className="stat-trend">
          {change && (
            <span className={`trend-value trend-${changeType}`}>
              {change}
            </span>
          )}
          {getTrendIcon()}
        </div>
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

const ChartCard = ({ title, children, className = '', actions }) => {
  return (
    <div className={`chart-card ${className}`}>
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        {actions && <div className="chart-actions">{actions}</div>}
      </div>
      <div className="chart-content">
        {children}
      </div>
    </div>
  );
};

const DataTable = ({ 
  title, 
  data, 
  columns, 
  loading = false, 
  emptyMessage = 'No data available',
  actions,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`data-table ${className}`}>
        <div className="table-header">
          <h3>{title}</h3>
          {actions && <div className="table-actions">{actions}</div>}
        </div>
        <div className="table-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`data-table ${className}`}>
        <div className="table-header">
          <h3>{title}</h3>
          {actions && <div className="table-actions">{actions}</div>}
        </div>
        <div className="table-empty">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`data-table ${className}`}>
      <div className="table-header">
        <h3>{title}</h3>
        {actions && <div className="table-actions">{actions}</div>}
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index} className={column.className || ''}>
                  {console.log(column)}
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={column.className || ''}>
                    {console.log(row)}
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const QuickActionCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  color = 'primary',
  disabled = false 
}) => {
  const getColorClass = () => {
    const colors = {
      primary: 'action-primary',
      success: 'action-success',
      warning: 'action-warning',
      danger: 'action-danger',
      info: 'action-info'
    };
    return colors[color] || colors.primary;
  };

  return (
    <div 
      className={`quick-action-card ${getColorClass()} ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="action-icon">
        {Icon && <Icon />}
      </div>
      <div className="action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );
};

const ProgressBar = ({ 
  value, 
  max = 100, 
  label, 
  color = 'primary',
  showPercentage = true,
  size = 'medium'
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getColorClass = () => {
    const colors = {
      primary: 'progress-primary',
      success: 'progress-success',
      warning: 'progress-warning',
      danger: 'progress-danger',
      info: 'progress-info'
    };
    return colors[color] || colors.primary;
  };

  const getSizeClass = () => {
    const sizes = {
      small: 'progress-small',
      medium: 'progress-medium',
      large: 'progress-large'
    };
    return sizes[size] || sizes.medium;
  };

  return (
    <div className={`progress-container ${getSizeClass()}`}>
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="progress-bar">
        <div 
          className={`progress-fill ${getColorClass()}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'primary',
  trend,
  trendValue,
  onClick 
}) => {
  const getColorClass = () => {
    const colors = {
      primary: 'metric-primary',
      success: 'metric-success',
      warning: 'metric-warning',
      danger: 'metric-danger',
      info: 'metric-info',
      purple: 'metric-purple'
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className={`metric-card ${getColorClass()}`} onClick={onClick}>
      <div className="metric-header">
        <div className="metric-icon">
          {Icon && <Icon />}
        </div>
        {trend && (
          <div className={`metric-trend trend-${trend}`}>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="metric-content">
        <h3 className="metric-value">{value}</h3>
        <p className="metric-title">{title}</p>
        {subtitle && <p className="metric-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export {
  StatCard,
  ChartCard,
  DataTable,
  QuickActionCard,
  ProgressBar,
  MetricCard
};
