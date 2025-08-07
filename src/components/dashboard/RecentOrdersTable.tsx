import { useRecentOrders } from "@/hooks/useDashboardData";
import { useNavigate } from "react-router-dom";

export const RecentOrdersTable = () => {
  const { orders, loading, error } = useRecentOrders();
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "complete":
        return "bg-success/20 text-success";
      case "processing":
        return "bg-warning/20 text-warning";
      case "pending":
      case "not_shipped":
        return "bg-muted text-muted-foreground";
      case "failed":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    return `${mins} min${mins !== 1 ? "s" : ""} ago`;
  };

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
        <button
          onClick={() => navigate("/sales-orders")}
          className="text-sm text-primary hover:text-primary-glow transition-colors"
        >
          View All
        </button>
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm px-4 py-3">Loading recent orders...</div>
      ) : error ? (
        <div className="text-destructive text-sm px-4 py-3">Error: {error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-foreground">{order.katana_order_number || order.order_number || "N/A"}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{order.customer_company || "N/A"}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{order.items_count || "-"}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status || order.katana_order_data?.status)}`}>
                      {order.status || order.katana_order_data?.status || "unknown"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-foreground">
                    ${(order.katana_order_data?.total || order.total || 0).toLocaleString()}{" "}
                    {order.katana_order_data?.currency || order.currency || "USD"}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {order.created_at ? timeAgo(order.created_at) : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};