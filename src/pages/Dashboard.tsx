import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Timer,
  RefreshCw
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { OrderFlowChart } from "@/components/dashboard/OrderFlowChart";
import { StatusDistributionChart } from "@/components/dashboard/StatusDistributionChart";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  sidebarOpen?: boolean;
}

export const Dashboard = ({ sidebarOpen = true }: DashboardProps) => {
  const { stats, loading, error, lastUpdated, refreshData } = useDashboardData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/20 border border-destructive/30 text-destructive px-4 py-3 rounded-lg">
          Error loading dashboard data: {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className={`dashboard-grid ${
        sidebarOpen 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' 
          : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
      }`}>
        <MetricCard
          title="Orders Today"
          value={loading ? "..." : stats.ordersToday}
          change="+12%"
          changeType="positive"
          icon={ShoppingCart}
          gradient="primary"
        />
        <MetricCard
          title="Pending Orders"
          value={loading ? "..." : stats.pendingOrders}
          change="-5%"
          changeType="positive"
          icon={Clock}
          gradient="warning"
        />
        <MetricCard
          title="Completed Orders"
          value={loading ? "..." : stats.completedOrders}
          change="+18%"
          changeType="positive"
          icon={CheckCircle}
          gradient="success"
        />
        <MetricCard
          title="Failed Orders"
          value={loading ? "..." : stats.failedOrders}
          change="-3%"
          changeType="positive"
          icon={XCircle}
          gradient="destructive"
        />
        <MetricCard
          title="Success Rate"
          value={loading ? "..." : `${stats.successRate}%`}
          change="+2.1%"
          changeType="positive"
          icon={TrendingUp}
          gradient="success"
        />
        <MetricCard
          title="Avg Processing"
          value={loading ? "..." : stats.avgProcessingTime}
          change="-30s"
          changeType="positive"
          icon={Timer}
          gradient="primary"
        />
      </div>

      {/* Charts Grid */}
      <div className={`dashboard-grid ${
        sidebarOpen 
          ? 'grid-cols-1 lg:grid-cols-2' 
          : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
      }`}>
        <div className="lg:col-span-1">
          <OrderFlowChart />
        </div>
        <div className="lg:col-span-1">
          <StatusDistributionChart />
        </div>
      </div>

      {/* Recent Orders */}
      <RecentOrdersTable />
    </div>
  );
};