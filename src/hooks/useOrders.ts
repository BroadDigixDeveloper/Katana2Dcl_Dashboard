// src/hooks/useOrders.ts
import { useState, useEffect } from 'react';

export interface SalesOrder {
  _id: string;
  katana_order_id: number;
  katana_order_number: string;
  status: string;
  dcl_status?: string;
  katana_order_data: {
    id: number;
    order_no: string;
    customer_id: number;
    source: string;
    order_created_date: string;
    delivery_date: string;
    status: string;
    currency: string;
    total: number;
    addresses?: Array<{
      first_name: string;
      last_name: string;
      company: string;
      city: string;
      state: string;
      country: string;
    }>;
    sales_order_rows?: Array<{
      quantity: number;
      price_per_unit: string;
      total: number;
    }>;
  };
  created_at: string;
  updated_at: string;
}

export interface SalesOrderFilters {
  page?: number;
  limit?: number;
  date_filter?: string;
  order_number?: string;
  status?: string;
  dcl_status?: string;
  start_date?: string;
  end_date?: string;
}

export interface PurchaseOrder {
  _id: string;
  po_id: string;
  po_number: string;
  date: string;
  expected_arrival_date: string;
  katana_status: string;
  status: string;
  quantity: number;
  quantity_ordered: number;
  quantity_received: number;
  total: number;
  fulfillment_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface StockTransfer {
  _id: string;
  id: string;
  stock_transfer_number: string;
  source_location_id: number;
  target_location_id: number;
  transfer_date: string;
  status: string;
  order_status: string;
  total_quantity: number;
  total_cost: number;
  stock_transfer_rows?: Array<{
    variant_id: number;
    quantity: number;
    cost_per_unit: number;
    total_cost: number;
  }>;
  created_at: string;
  updated_at: string;
}

export interface TargetOrder {
  _id: string;
  order_no: string;
  katana_order_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// API Response Interfaces
interface ApiResponse<T> {
  status: string;
  data: T[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_prev: boolean;
  };
  message?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// export const useSalesOrders = () => {
//   const [orders, setOrders] = useState<SalesOrder[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [pagination, setPagination] = useState<any>(null);

//   const fetchSalesOrders = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await fetch(`${API_BASE_URL}/api/sales-orders`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const result: ApiResponse<SalesOrder> = await response.json();
//       console.log('Fetched Sales Orders:', result);
      
//       if (result.status === 'success') {
//         // ✅ Extract the data array from the API response
//         setOrders(result.data || []);
//         setPagination(result.pagination);
//       } else {
//         throw new Error(result.message || 'Failed to fetch sales orders');
//       }
      
//     } catch (err) {
//       console.error('Error fetching sales orders:', err);
//       setError(err instanceof Error ? err.message : 'Failed to fetch sales orders');
//       setOrders([]); // Set to empty array on error
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSalesOrders();
//   }, []);

//   return { orders, loading, error, pagination, refetch: fetchSalesOrders };
// };

// export const useSalesOrders = (filters?: SalesOrderFilters) => {
//   const [orders, setOrders] = useState<SalesOrder[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [pagination, setPagination] = useState<any>(null);
//   const [filtersApplied, setFiltersApplied] = useState<any>(null);

export const useSalesOrders = (filters?: SalesOrderFilters) => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [filtersApplied, setFiltersApplied] = useState<any>(null);

    const fetchSalesOrders = async (customFilters?: SalesOrderFilters & { cursor?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Merge filters
      const activeFilters = { ...filters, ...customFilters };
      
      // Build query string
      const params = new URLSearchParams();
      
      // if (activeFilters.page) params.append('page', activeFilters.page.toString());
      // if (activeFilters.limit) params.append('limit', activeFilters.limit.toString());
      // if (activeFilters.date_filter) params.append('date_filter', activeFilters.date_filter);
      // if (activeFilters.order_number) params.append('order_number', activeFilters.order_number);
      // if (activeFilters.status) params.append('status', activeFilters.status);
      // if (activeFilters.dcl_status) params.append('dcl_status', activeFilters.dcl_status);
      // if (activeFilters.start_date) params.append('start_date', activeFilters.start_date);
      // if (activeFilters.end_date) params.append('end_date', activeFilters.end_date);
      
      if (activeFilters.page) params.append('page', activeFilters.page.toString());
      if (activeFilters.limit) params.append('limit', activeFilters.limit.toString());
      if (activeFilters.date_filter) params.append('date_filter', activeFilters.date_filter);
      if (activeFilters.order_number) params.append('order_number', activeFilters.order_number);
      if (activeFilters.status) params.append('status', activeFilters.status);
      if (activeFilters.dcl_status) params.append('dcl_status', activeFilters.dcl_status);
      if (activeFilters.start_date) params.append('start_date', activeFilters.start_date);
      if (activeFilters.end_date) params.append('end_date', activeFilters.end_date);
      if (activeFilters.cursor) params.append('cursor', activeFilters.cursor);


      const queryString = params.toString();
      const url = `${API_BASE_URL}/api/sales-orders${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching sales orders with URL:', url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      // const response = await fetch(url);
      
      const response = await fetch(url, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<SalesOrder> = await response.json();
      console.log('Fetched Sales Orders:', result);
      
      if (result.status === 'success') {
        setOrders(result.data || []);
        setPagination(result.pagination);
        setFiltersApplied(result.filters_applied);
      } else {
        throw new Error(result.message || 'Failed to fetch sales orders');
      }
      
    } catch (err) {
      console.error('Error fetching sales orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sales orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesOrders();
  }, []);

  const refetch = (newFilters?: SalesOrderFilters & { cursor?: string }) => {
    fetchSalesOrders(newFilters);
  };

  return { 
    orders, 
    loading, 
    error, 
    pagination, 
    filtersApplied,
    refetch 
  };
};

// Hook for filter options
export const useSalesOrderFilters = () => {
  const [filterOptions, setFilterOptions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/sales-orders/filters`);
        const result = await response.json();
        
        if (result.status === 'success') {
          setFilterOptions(result.filters);
        }
      } catch (err) {
        console.error('Error fetching filter options:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilterOptions();
  }, []);
  
  return { filterOptions, loading };
};

export const usePurchaseOrders = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/purchase-orders`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<PurchaseOrder> = await response.json();
      console.log('Fetched Purchase Orders:', result);
      
      if (result.status === 'success') {
        setOrders(result.data || []);
        setPagination(result.pagination);
      } else {
        throw new Error(result.message || 'Failed to fetch purchase orders');
      }
      
    } catch (err) {
      console.error('Error fetching purchase orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch purchase orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  return { orders, loading, error, pagination, refetch: fetchPurchaseOrders };
};

export const useStockTransfers = () => {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchStockTransfers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/stock-transfers`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<StockTransfer> = await response.json();
      console.log('Fetched Stock Transfers:', result);
      
      if (result.status === 'success') {
        setTransfers(result.data || []);
        setPagination(result.pagination);
      } else {
        throw new Error(result.message || 'Failed to fetch stock transfers');
      }
      
    } catch (err) {
      console.error('Error fetching stock transfers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stock transfers');
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockTransfers();
  }, []);

  return { transfers, loading, error, pagination, refetch: fetchStockTransfers };
};

export const useTargetOrders = () => {
  const [orders, setOrders] = useState<TargetOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchTargetOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/target-orders`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<TargetOrder> = await response.json();
      console.log('Fetched Target Orders:', result);
      
      if (result.status === 'success') {
        setOrders(result.data || []);
        setPagination(result.pagination);
      } else {
        throw new Error(result.message || 'Failed to fetch target orders');
      }
      
    } catch (err) {
      console.error('Error fetching target orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch target orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargetOrders();
  }, []);

  return { orders, loading, error, pagination, refetch: fetchTargetOrders };
};

// ✅ Dashboard Stats Hook for Overview Page
export const useDashboardStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/dashboard-stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Fetched Dashboard Stats:', result);
      
      if (result.status === 'success') {
        setStats(result);
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard stats');
      }
      
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error, refetch: fetchDashboardStats };
};

// ✅ Recent Orders Hook for Dashboard Table
export const useRecentOrders = (limit: number = 10) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/recent-orders?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Fetched Recent Orders:', result);
      
      if (result.status === 'success') {
        setOrders(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch recent orders');
      }
      
    } catch (err) {
      console.error('Error fetching recent orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recent orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentOrders();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRecentOrders, 30000);
    return () => clearInterval(interval);
  }, [limit]);

  return { orders, loading, error, refetch: fetchRecentOrders };
};