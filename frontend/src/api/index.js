import axios from 'axios';

// This would be your actual API base URL in production
const API_BASE_URL = 'https://api.example.com/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// For demonstration purposes, we'll create mock functions
// that return promises with simulated data
// In a real application, these would make actual API calls

// Dashboard data
export const getDashboardStats = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalPlayers: 24567,
        activePlayers: 1283,
        averagePlaytime: 47,
        totalSessions: 53291
      });
    }, 800);
  });
};

export const getPlayerTrends = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: 'Jan', players: 4000 },
        { name: 'Feb', players: 4500 },
        { name: 'Mar', players: 5100 },
        { name: 'Apr', players: 4800 },
        { name: 'May', players: 5300 },
        { name: 'Jun', players: 6200 },
        { name: 'Jul', players: 7100 }
      ]);
    }, 600);
  });
};

export const getEventDistribution = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: 'Game Start', count: 8200 },
        { name: 'Level Complete', count: 5400 },
        { name: 'Item Collected', count: 12300 },
        { name: 'Enemy Defeated', count: 9800 },
        { name: 'Game Over', count: 7600 }
      ]);
    }, 700);
  });
};

// Event data
export const getEvents = (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = [];
      const eventTypes = ['Game Start', 'Level Complete', 'Item Collected', 'Enemy Defeated', 'Game Over'];
      
      for (let i = 0; i < 100; i++) {
        const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        mockData.push({
          id: i,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
          eventType: randomEvent,
          playerId: `Player_${Math.floor(Math.random() * 1000)}`,
          data: JSON.stringify({
            level: Math.floor(Math.random() * 10) + 1,
            position: {
              x: Math.floor(Math.random() * 100),
              y: Math.floor(Math.random() * 100),
              z: Math.floor(Math.random() * 100)
            }
          })
        });
      }
      
      resolve(mockData);
    }, 1000);
  });
};

// Player data
export const getPlayers = (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockPlayers = [];
      
      for (let i = 0; i < 100; i++) {
        mockPlayers.push({
          id: `Player_${i + 1000}`,
          firstSeen: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
          lastSeen: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
          totalSessions: Math.floor(Math.random() * 100) + 1,
          playTime: Math.floor(Math.random() * 50) + 1,
          level: Math.floor(Math.random() * 20) + 1,
          status: Math.random() > 0.2 ? 'active' : 'inactive'
        });
      }
      
      resolve(mockPlayers);
    }, 1000);
  });
};

export const getPlayerStats = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalPlayers: 24567,
        activePlayers: 1283,
        avgSessionTime: 47,
        avgPlayerLevel: 8.3
      });
    }, 600);
  });
};

// Configuration
export const getConfiguration = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        // Game Settings
        gameId: '12345678',
        apiKey: 'sk_test_*************',
        dataRetentionDays: 90,
        samplingRate: 100,
        
        // Event Settings
        capturePlayerJoin: true,
        capturePlayerLeave: true,
        captureGameStart: true,
        captureGameEnd: true,
        captureCustomEvents: true,
        maxEventsPerMinute: 5000,
        
        // Player Tracking Settings
        trackDeviceInfo: true,
        trackLocation: false,
        trackPlaytime: true,
        playerIdType: 'anonymous',
        
        // Dashboard Settings
        refreshInterval: 5,
        theme: 'light',
        publicAccess: true
      });
    }, 800);
  });
};

export const saveConfiguration = (config) => {
  return new Promise((resolve) => {
    console.log('Saving configuration:', config);
    setTimeout(() => {
      resolve({ success: true });
    }, 1500);
  });
};

export default api;