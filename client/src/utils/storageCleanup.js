// Storage cleanup utility to handle corrupted or invalid data

export const cleanupStorage = () => {
  try {
    // List of keys that should contain valid JSON
    const jsonKeys = ['user', 'settings', 'preferences'];
    
    jsonKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value && value !== 'null' && value !== 'undefined') {
          // Try to parse to validate JSON
          JSON.parse(value);
        }
      } catch (error) {
        console.warn(`Clearing invalid data for key "${key}":`, error.message);
        localStorage.removeItem(key);
      }
    });

    // Clean up any keys that might contain invalid data
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      const value = localStorage.getItem(key);
      try {
        // Check if it looks like it should be JSON but isn't valid
        if (value && 
            (value.startsWith('{') || value.startsWith('[')) && 
            !value.includes('"student"') && // Skip known invalid values
            !value.includes('"null"')) {
          JSON.parse(value);
        }
      } catch (error) {
        // If it looks like JSON but fails to parse, remove it
        if (value && (value.startsWith('{') || value.startsWith('['))) {
          console.warn(`Clearing invalid JSON data for key "${key}":`, error.message);
          localStorage.removeItem(key);
        }
      }
    });

    console.log('Storage cleanup completed');
  } catch (error) {
    console.error('Error during storage cleanup:', error);
  }
};

// Run cleanup on module load
cleanupStorage();
