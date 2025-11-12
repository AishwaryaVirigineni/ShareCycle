/**
 * API Configuration
 * Base URL for the FastAPI backend
 * 
 * IMPORTANT: Update the IP address below to match your computer's IP
 * 
 * To find your IP address:
 * - macOS/Linux: Run `ifconfig | grep "inet "` in terminal
 * - Windows: Run `ipconfig` in command prompt
 * - Look for your local network IP (usually starts with 192.168.x.x or 10.x.x.x)
 * 
 * For different environments:
 * - iOS Simulator: Use 'http://localhost:8000'
 * - Android Emulator: Use 'http://10.0.2.2:8000'
 * - Physical Device: Use your computer's IP address (e.g., 'http://10.84.41.67:8000')
 */

// ============================================
// CONFIGURATION - Update these values as needed
// ============================================

// Your computer's local IP address (for physical device testing)
const LOCAL_IP = '10.84.41.67';

// Backend port (default: 8000)
const API_PORT = '8000';

// Production API URL (update when deploying)
const PRODUCTION_URL = 'https://your-production-api.com';

// ============================================
// Auto-detect environment
// ============================================

const getApiBaseUrl = (): string => {
  if (!__DEV__) {
    // Production mode
    return PRODUCTION_URL;
  }

  // Development mode - detect platform
  if (typeof window !== 'undefined') {
    // Web/Expo Go
    return `http://${LOCAL_IP}:${API_PORT}`;
  }

  // React Native - use local IP for physical devices
  // For iOS Simulator, you might need to use 'localhost'
  // For Android Emulator, use '10.0.2.2'
  return `http://${LOCAL_IP}:${API_PORT}`;
};

export const API_BASE_URL = getApiBaseUrl();

// Export for debugging
export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  localIp: LOCAL_IP,
  port: API_PORT,
  isDev: __DEV__,
};

