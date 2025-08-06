import { useState, cloneElement, Children } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Pass sidebarOpen state to children if they accept it
  const childrenWithProps = Children.map(children, (child) => {
    if (typeof child === 'object' && child !== null && 'type' in child) {
      return cloneElement(child as React.ReactElement, { sidebarOpen });
    }
    return child;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} />
        
        <main 
          className={`flex-1 transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <div className="p-6">
            {childrenWithProps}
          </div>
        </main>
      </div>
    </div>
  );
};