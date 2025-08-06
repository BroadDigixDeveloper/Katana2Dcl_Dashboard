import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import { Orders } from "./pages/Orders";
import { SalesOrders } from "./pages/SalesOrders";
import { PurchaseOrders } from "./pages/PurchaseOrders";
import { StockTransfers } from "./pages/StockTransfers";
import { TargetOrders } from "./pages/TargetOrders";
import { Analytics } from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/layout/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/orders" element={<DashboardLayout><Orders /></DashboardLayout>} />
            <Route path="/sales-orders" element={<DashboardLayout><SalesOrders /></DashboardLayout>} />
            <Route path="/purchase-orders" element={<DashboardLayout><PurchaseOrders /></DashboardLayout>} />
            <Route path="/stock-transfers" element={<DashboardLayout><StockTransfers /></DashboardLayout>} />
            <Route path="/target-orders" element={<DashboardLayout><TargetOrders /></DashboardLayout>} />
            <Route path="/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
            <Route path="/customers" element={<DashboardLayout><div className="chart-container min-h-96 flex items-center justify-center"><div className="text-center"><h3 className="text-lg font-semibold text-foreground mb-2">Customer Management</h3><p className="text-muted-foreground">Customer interface coming soon.</p></div></div></DashboardLayout>} />
            <Route path="/shipping" element={<DashboardLayout><div className="chart-container min-h-96 flex items-center justify-center"><div className="text-center"><h3 className="text-lg font-semibold text-foreground mb-2">Shipping Management</h3><p className="text-muted-foreground">Shipping interface coming soon.</p></div></div></DashboardLayout>} />
            <Route path="/alerts" element={<DashboardLayout><div className="chart-container min-h-96 flex items-center justify-center"><div className="text-center"><h3 className="text-lg font-semibold text-foreground mb-2">System Alerts</h3><p className="text-muted-foreground">Alerts interface coming soon.</p></div></div></DashboardLayout>} />
            <Route path="/settings" element={<DashboardLayout><div className="chart-container min-h-96 flex items-center justify-center"><div className="text-center"><h3 className="text-lg font-semibold text-foreground mb-2">Settings</h3><p className="text-muted-foreground">Settings interface coming soon.</p></div></div></DashboardLayout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
