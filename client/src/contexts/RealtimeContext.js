import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';

const RealtimeContext = createContext();

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

export const RealtimeProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [vehicleUpdates, setVehicleUpdates] = useState([]);
  const [mechanicUpdates, setMechanicUpdates] = useState([]);
  
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token: user.token,
          userId: user._id,
          role: user.role
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        
        // Join role-based room
        newSocket.emit('join-room', {
          userId: user._id,
          role: user.role
        });
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      // Listen for vehicle booking updates
      newSocket.on('vehicle-booked', (data) => {
        setVehicleUpdates(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 updates
        addNotification({
          type: 'info',
          message: `Vehicle ${data.vehicleId} was booked`,
          timestamp: data.timestamp
        });
      });

      // Listen for mechanic availability updates
      newSocket.on('mechanic-status-updated', (data) => {
        setMechanicUpdates(prev => [data, ...prev.slice(0, 9)]);
        addNotification({
          type: 'info',
          message: `Mechanic availability updated`,
          timestamp: data.timestamp
        });
      });

      // Listen for admin notifications
      newSocket.on('admin-notification', (data) => {
        addNotification({
          type: 'warning',
          message: data.message,
          timestamp: data.timestamp
        });
      });

      // Listen for user status updates
      newSocket.on('user-status-changed', (data) => {
        addNotification({
          type: 'info',
          message: `User status updated`,
          timestamp: data.timestamp
        });
      });

      // Listen for admin actions
      newSocket.on('admin-action-updated', (data) => {
        addNotification({
          type: 'success',
          message: `Admin action: ${data.action}`,
          timestamp: data.timestamp
        });
      });

      // Listen for online users count
      newSocket.on('online-users', (count) => {
        setOnlineUsers(count);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 19)]); // Keep last 20 notifications
  };

  const removeNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const emitVehicleBooking = (data) => {
    if (socket) {
      socket.emit('vehicle-booking', data);
    }
  };

  const emitMechanicAvailability = (data) => {
    if (socket) {
      socket.emit('mechanic-availability', data);
    }
  };

  const emitAdminAction = (data) => {
    if (socket) {
      socket.emit('admin-action', data);
    }
  };

  const emitUserStatusUpdate = (data) => {
    if (socket) {
      socket.emit('user-status-update', data);
    }
  };

  const value = {
    socket,
    isConnected,
    notifications,
    onlineUsers,
    vehicleUpdates,
    mechanicUpdates,
    addNotification,
    removeNotification,
    clearNotifications,
    emitVehicleBooking,
    emitMechanicAvailability,
    emitAdminAction,
    emitUserStatusUpdate
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};
