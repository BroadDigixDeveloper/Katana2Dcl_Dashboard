import { ArrowRightLeft, Package, DollarSign, Calendar, RefreshCw, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStockTransfers } from "@/hooks/useOrders";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'received':
    case 'complete':
      return 'bg-success/20 text-success border-success/30';
    case 'draft':
    case 'pending':
      return 'bg-warning/20 text-warning border-warning/30';
    case 'cancelled':
      return 'bg-destructive/20 text-destructive border-destructive/30';
    default:
      return 'bg-muted/20 text-muted-foreground border-muted/30';
  }
};

export const StockTransfers = () => {
  const { transfers, loading, error, refetch } = useStockTransfers();

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Stock Transfers</h1>
            <p className="text-muted-foreground">Track inventory transfers between locations.</p>
          </div>
        </div>
        <div className="bg-destructive/20 border border-destructive/30 text-destructive px-4 py-3 rounded-lg">
          Error loading stock transfers: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Transfers</h1>
          <p className="text-muted-foreground">Track inventory transfers between locations.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

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
            <Card className="gradient-border-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transfers.length}</div>
                <p className="text-xs text-muted-foreground">Active transfers</p>
              </CardContent>
            </Card>

            <Card className="gradient-border-success">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {transfers.filter(t => t.order_status === 'received').length}
                </div>
                <p className="text-xs text-muted-foreground">Successfully received</p>
              </CardContent>
            </Card>

            <Card className="gradient-border-warning">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {transfers.filter(t => t.status === 'draft').length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting receipt</p>
              </CardContent>
            </Card>

            <Card className="gradient-border-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${transfers.reduce((sum, transfer) => sum + transfer.total_cost, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total transfer value</p>
              </CardContent>
            </Card>
          </div>

          {/* Transfers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Transfer Orders</CardTitle>
              <CardDescription>
                Monitor all stock transfers between warehouse locations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer Number</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order Status</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Transfer Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => (
                    <TableRow key={transfer._id}>
                      <TableCell className="font-medium">
                        {transfer.stock_transfer_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>{transfer.source_location_id}</span>
                          </div>
                          <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>{transfer.target_location_id}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transfer.status)}>
                          {transfer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transfer.order_status)}>
                          {transfer.order_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {transfer.total_quantity.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">units</div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${transfer.total_cost.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(transfer.transfer_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};