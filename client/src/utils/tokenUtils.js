// Token validation and management utilities

export const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  try {
    // Check if token has 3 parts (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // Try to decode the payload to check expiration
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export const getTokenExpirationTime = (token) => {
  if (!token || typeof token !== 'string') {
    return null;
  }
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp ? new Date(payload.exp * 1000) : null;
  } catch (error) {
    console.error('Token parsing error:', error);
    return null;
  }
};

export const isTokenExpiringSoon = (token, minutesThreshold = 5) => {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) {
    return false;
  }
  
  const currentTime = new Date();
  const timeUntilExpiry = expirationTime.getTime() - currentTime.getTime();
  const minutesUntilExpiry = timeUntilExpiry / (1000 * 60);
  
  return minutesUntilExpiry <= minutesThreshold;
};

export const clearInvalidToken = () => {
  try {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    return true;
  } catch (error) {
    console.error('Error clearing invalid token:', error);
    return false;
  }
};
