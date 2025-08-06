// src/pages/SalesOrders.tsx - Fixed version
import React, { useState } from "react";
import { Package, User, DollarSign, Calendar, MapPin, RefreshCw, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSalesOrders, useSalesOrderFilters } from "@/hooks/useOrders";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'complete':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
    case 'not_shipped':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const SalesOrders = () => {
  // Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [dateFilter, setDateFilter] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dclStatusFilter, setDclStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Hooks
  const { orders, loading, error, pagination, refetch } = useSalesOrders({
    page: currentPage,
    limit: pageSize,
    date_filter: dateFilter,
    order_number: orderNumber,
    status: statusFilter,
    dcl_status: dclStatusFilter
  });

  const { filterOptions } = useSalesOrderFilters();

  // Apply filters
  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filtering
    refetch({
      page: 1,
      limit: pageSize,
      date_filter: dateFilter,
      order_number: orderNumber,
      status: statusFilter,
      dcl_status: dclStatusFilter
    });
  };

  // Clear filters
  const clearFilters = () => {
    setDateFilter('');
    setOrderNumber('');
    setStatusFilter('');
    setDclStatusFilter('');
    setCurrentPage(1);
    refetch({ page: 1, limit: pageSize });
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage > currentPage && pagination?.next_cursor) {
      // Use cursor for forward navigation on large pages
      refetch({
        page: newPage,
        limit: pageSize,
        cursor: pagination.next_cursor,
        date_filter: dateFilter,
        order_number: orderNumber,
        status: statusFilter,
        dcl_status: dclStatusFilter
      });
    } else {
      // Use regular pagination for backward navigation or small pages
      refetch({
        page: newPage,
        limit: pageSize,
        date_filter: dateFilter,
        order_number: orderNumber,
        status: statusFilter,
        dcl_status: dclStatusFilter
      });
    }
    setCurrentPage(newPage);
  };

  // ✅ FIXED: Move handlePageSizeChange function inside component
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    refetch({
      page: 1,
      limit: newPageSize,
      date_filter: dateFilter,
      order_number: orderNumber,
      status: statusFilter,
      dcl_status: dclStatusFilter
    });
  };

  // Safety checks and derived values
  const safeOrders = Array.isArray(orders) ? orders : [];
  const showPerformanceWarning = pagination && pagination.current_page > 10 && pagination.total_count > 500;

  // Early return for error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sales Orders</h1>
            <p className="text-muted-foreground">Manage sales orders from Katana DCL system.</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span>Error loading sales orders: {error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="ml-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Warning */}
      {showPerformanceWarning && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="font-medium">Performance Notice:</span>
            <span>You're viewing a large dataset. Consider using filters to narrow down results for better performance.</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Orders</h1>
          <p className="text-muted-foreground">
            Manage sales orders from Katana DCL system. 
            {pagination && ` (${pagination.total_count} total orders)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Order Number Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Number</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search order number..."
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    {filterOptions?.statuses?.map((status: string) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* DCL Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">DCL Status</label>
                <Select value={dclStatusFilter} onValueChange={setDclStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select DCL status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All DCL Statuses</SelectItem>
                    {filterOptions?.dcl_statuses?.map((status: string) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button onClick={handleFilterChange} disabled={loading}>
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeOrders.length}</div>
                <p className="text-xs text-muted-foreground">
                  {pagination ? `Page ${pagination.current_page} of ${pagination.total_pages}` : 'Active sales orders'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {safeOrders.filter(o => o.status === 'complete').length}
                </div>
                <p className="text-xs text-muted-foreground">Successfully completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {safeOrders.filter(o => 
                    o.status === 'pending' || 
                    (o.katana_order_data && o.katana_order_data.status === 'NOT_SHIPPED')
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting shipment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${safeOrders.reduce((sum, order) => {
                    const total = order.katana_order_data?.total || order.total || 0;
                    return sum + total;
                  }, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total order value</p>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sales Orders</CardTitle>
                  <CardDescription>
                    {pagination ? 
                      `Showing ${safeOrders.length} of ${pagination.total_count} orders` : 
                      `${safeOrders.length} orders`
                    }
                  </CardDescription>
                </div>
                
                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>DCL Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Order Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.order_number || order.katana_order_number || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.katana_order_data?.status || order.status)}>
                          {(order.katana_order_data?.status || order.status || 'unknown').replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.dcl_status ? (
                          <Badge className={getStatusColor(order.dcl_status)}>
                            {order.dcl_status}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${(order.katana_order_data?.total || order.total || 0).toLocaleString()} {order.katana_order_data?.currency || order.currency || 'USD'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {order.katana_order_data?.order_created_date || order.created_at ? 
                            new Date(order.katana_order_data?.order_created_date || order.created_at).toLocaleDateString() : 
                            'N/A'
                          }
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {safeOrders.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  No sales orders found with current filters
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.current_page - 1) * pagination.limit) + 1} to {Math.min(pagination.current_page * pagination.limit, pagination.total_count)} of {pagination.total_count} results
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={loading || !pagination.has_prev}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <span className="text-sm">
                      Page {pagination.current_page} of {pagination.total_pages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={loading || !pagination.has_next}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};