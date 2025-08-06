import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Users,
  Truck,
  AlertCircle,
  ShoppingBag,
  ArrowRightLeft,
  Target
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Sales Orders", url: "/sales-orders", icon: ShoppingBag },
  { title: "Purchase Orders", url: "/purchase-orders", icon: Package },
  { title: "Stock Transfers", url: "/stock-transfers", icon: ArrowRightLeft },
  { title: "Target Orders", url: "/target-orders", icon: Target },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Shipping", url: "/shipping", icon: Truck },
  { title: "Alerts", url: "/alerts", icon: AlertCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

export const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-sidebar-bg border-r border-border/20 transition-all duration-300 ease-in-out z-40 ${
        isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full"
      }`}
    >
      <div className="overflow-hidden h-full">
        <div className="p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                className={`sidebar-item ${
                  isActive(item.url) ? "active" : ""
                }`}
              >
                <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium">{item.title}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-primary/10 border border-primary/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-primary mb-2">System Status</h4>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};