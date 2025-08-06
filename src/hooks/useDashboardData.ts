import { useState, useEffect } from "react";

interface DashboardStats {
  ordersToday: number;
  pendingOrders: number;
  completedOrders: number;
  failedOrders: number;
  successRate: number;
  avgProcessingTime: string;
}

interface DashboardData {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
}

// This would be your actual API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    stats: {
      ordersToday: 247,
      pendingOrders: 34,
      completedOrders: 203,
      failedOrders: 10,
      successRate: 95.9,
      avgProcessingTime: "4.2 min"
    },
    loading: false,
    error: null,
    lastUpdated: new Date()
  });

  const fetchDashboardStats = async (): Promise<DashboardStats> => {
    try {
      // Replace this with actual API call when MongoDB backend is ready
      // const response = await fetch(`${API_BASE_URL}/api/dashboard-stats`);
      // if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      // return await response.json();
      
      // Mock data for now - remove this when real API is ready
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      return {
        ordersToday: Math.floor(Math.random() * 50) + 200,
        pendingOrders: Math.floor(Math.random() * 20) + 25,
        completedOrders: Math.floor(Math.random() * 100) + 180,
        failedOrders: Math.floor(Math.random() * 15) + 5,
        successRate: Math.floor(Math.random() * 10) + 90,
        avgProcessingTime: `${(Math.random() * 3 + 2).toFixed(1)} min`
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const stats = await fetchDashboardStats();
      setData(prev => ({
        ...prev,
        stats,
        loading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  };

  useEffect(() => {
    // Initial load
    refreshData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    ...data,
    refreshData
  };
};

// Hook for fetching recent orders
export const useRecentOrders = () => {
  // This would connect to your MongoDB orders collection
  // For now, returning mock data structure
  return {
    orders: [],
    loading: false,
    error: null
  };
};