interface Order {
  id: string;
  customer: string;
  items: number;
  status: "pending" | "processing" | "completed" | "failed";
  timestamp: string;
  amount: string;
}

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customer: "Acme Corp",
    items: 24,
    status: "completed",
    timestamp: "2 mins ago",
    amount: "$1,247.50"
  },
  {
    id: "ORD-002", 
    customer: "TechStart Inc",
    items: 12,
    status: "processing",
    timestamp: "5 mins ago",
    amount: "$856.30"
  },
  {
    id: "ORD-003",
    customer: "Global Solutions",
    items: 8,
    status: "pending",
    timestamp: "8 mins ago",
    amount: "$432.80"
  },
  {
    id: "ORD-004",
    customer: "Innovation Labs",
    items: 16,
    status: "failed",
    timestamp: "12 mins ago",
    amount: "$967.20"
  },
  {
    id: "ORD-005",
    customer: "Future Systems",
    items: 20,
    status: "completed",
    timestamp: "15 mins ago",
    amount: "$1,543.90"
  }
];

export const RecentOrdersTable = () => {
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return "bg-success/20 text-success";
      case "processing":
        return "bg-warning/20 text-warning";
      case "pending":
        return "bg-muted text-muted-foreground";
      case "failed":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
        <button className="text-sm text-primary hover:text-primary-glow transition-colors">
          View All
        </button>
      </div>
      
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
            {mockOrders.map((order) => (
              <tr key={order.id} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                <td className="py-3 px-4 text-sm font-medium text-foreground">{order.id}</td>
                <td className="py-3 px-4 text-sm text-foreground">{order.customer}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{order.items}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm font-medium text-foreground">{order.amount}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{order.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};